"""Schema Agent for handling dynamic database schema evolution."""

import asyncio
import re
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime
import structlog

from langchain_openai import ChatOpenAI  
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from langchain.prompts import PromptTemplate
from langfuse.callback import CallbackHandler as LangfuseCallbackHandler

from ..config import get_settings
from ..database import SessionLocal, AISchemaChange, engine


logger = structlog.get_logger()


class SchemaAgent:
    """AI agent for dynamic database schema evolution."""
    
    def __init__(self):
        self.settings = get_settings()
        self.logger = logger.bind(agent="schema")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model=self.settings.openai_model,
            temperature=0.0,  # Low temperature for schema changes
            openai_api_key=self.settings.openai_api_key,
            max_tokens=self.settings.max_tokens,
        )
        
        # Initialize callbacks
        self.callbacks = []
        if self.settings.enable_tracing and self.settings.langfuse_secret_key:
            self.callbacks.append(
                LangfuseCallbackHandler(
                    public_key=self.settings.langfuse_public_key,
                    secret_key=self.settings.langfuse_secret_key,
                    host=self.settings.langfuse_host,
                )
            )
        
        self.schema_prompt = PromptTemplate(
            input_variables=["user_request", "current_schema", "context"],
            template="""
You are a PostgreSQL database schema expert. Your task is to analyze user requests and determine what schema changes are needed for a personal finance management system.

Current Database Schema:
{current_schema}

User Request: {user_request}

Context: {context}

Financial Domain Guidelines:
- Use DECIMAL(15,2) for monetary amounts to avoid floating point precision issues
- Use UUID for primary keys where possible
- Include created_at and updated_at timestamps
- Use JSONB for flexible metadata storage
- Consider indexing for performance
- Maintain referential integrity with foreign keys
- Follow naming conventions: snake_case for tables/columns

Analyze the request and determine:
1. What new tables or columns are needed
2. What data types should be used
3. What constraints and indexes are needed
4. How to maintain data integrity
5. Migration strategy if existing data needs to be preserved

Provide your response in the following JSON format:
{{
    "analysis": "Your analysis of what schema changes are needed",
    "changes_needed": true/false,
    "tables_to_create": [
        {{
            "name": "table_name",
            "columns": [
                {{
                    "name": "column_name",
                    "type": "data_type",
                    "nullable": true/false,
                    "default": "default_value",
                    "constraints": ["constraint1", "constraint2"]
                }}
            ],
            "indexes": ["index_definition1", "index_definition2"],
            "reasoning": "Why this table is needed"
        }}
    ],
    "columns_to_add": [
        {{
            "table": "existing_table",
            "column": {{
                "name": "column_name", 
                "type": "data_type",
                "nullable": true/false,
                "default": "default_value"
            }},
            "reasoning": "Why this column is needed"
        }}
    ],
    "indexes_to_create": [
        {{
            "table": "table_name",
            "definition": "CREATE INDEX ...",
            "reasoning": "Why this index is needed"
        }}
    ],
    "migration_notes": "Any special considerations for data migration",
    "sql_statements": ["DDL statement 1", "DDL statement 2"],
    "safety_considerations": "What could go wrong and how to prevent it"
}}
"""
        )
    
    async def analyze_schema_needs(
        self, 
        user_request: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze what schema changes are needed for a user request."""
        
        self.logger.info("Analyzing schema needs", request=user_request)
        
        try:
            # Get current schema
            current_schema = await self._get_current_schema()
            
            # Format the prompt
            prompt_input = {
                "user_request": user_request,
                "current_schema": current_schema,
                "context": str(context) if context else "No additional context"
            }
            
            formatted_prompt = self.schema_prompt.format(**prompt_input)
            
            # Get AI analysis
            messages = [
                SystemMessage(content="You are a database schema expert for personal finance systems."),
                HumanMessage(content=formatted_prompt)
            ]
            
            response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.llm.invoke(messages, callbacks=self.callbacks)
            )
            
            # Parse the response (assuming it's JSON)
            import json
            try:
                analysis = json.loads(response.content)
                analysis["success"] = True
                analysis["timestamp"] = datetime.utcnow().isoformat()
                
                self.logger.info("Schema analysis completed", analysis=analysis)
                return analysis
                
            except json.JSONDecodeError:
                # Fallback if response is not JSON
                return {
                    "success": True,
                    "analysis": response.content,
                    "changes_needed": False,
                    "raw_response": response.content,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error("Schema analysis failed", error=error_msg)
            
            return {
                "success": False,
                "error": error_msg,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def apply_schema_changes(
        self, 
        schema_analysis: Dict[str, Any],
        user_request: str,
        dry_run: bool = False
    ) -> Dict[str, Any]:
        """Apply the schema changes suggested by the analysis."""
        
        self.logger.info("Applying schema changes", dry_run=dry_run)
        
        if not schema_analysis.get("changes_needed", False):
            return {
                "success": True,
                "message": "No schema changes needed",
                "changes_applied": 0,
                "timestamp": datetime.utcnow().isoformat()
            }
        
        try:
            sql_statements = schema_analysis.get("sql_statements", [])
            
            if dry_run:
                return {
                    "success": True,
                    "message": "Dry run completed",
                    "sql_statements": sql_statements,
                    "changes_applied": 0,
                    "timestamp": datetime.utcnow().isoformat()
                }
            
            applied_changes = []
            failed_changes = []
            
            # Execute each SQL statement
            async with engine.begin() as conn:
                for sql_statement in sql_statements:
                    try:
                        # Validate the SQL statement first
                        if not self._is_safe_ddl(sql_statement):
                            failed_changes.append({
                                "sql": sql_statement,
                                "error": "SQL statement deemed unsafe"
                            })
                            continue
                        
                        # Execute the statement
                        await conn.execute(sql_statement)
                        applied_changes.append(sql_statement)
                        
                        # Log the change
                        await self._log_schema_change(
                            change_type="schema_evolution",
                            sql_executed=sql_statement,
                            user_request=user_request,
                            reasoning=schema_analysis.get("analysis", ""),
                            success=True
                        )
                        
                    except Exception as e:
                        error_msg = str(e)
                        failed_changes.append({
                            "sql": sql_statement,
                            "error": error_msg
                        })
                        
                        # Log the failed change
                        await self._log_schema_change(
                            change_type="schema_evolution",
                            sql_executed=sql_statement,
                            user_request=user_request,
                            reasoning=schema_analysis.get("analysis", ""),
                            success=False,
                            error_message=error_msg
                        )
            
            result = {
                "success": len(failed_changes) == 0,
                "changes_applied": len(applied_changes),
                "applied_changes": applied_changes,
                "failed_changes": failed_changes,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            if failed_changes:
                result["message"] = f"Some changes failed: {len(failed_changes)} failures"
            else:
                result["message"] = f"All changes applied successfully: {len(applied_changes)} changes"
            
            self.logger.info("Schema changes applied", result=result)
            return result
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error("Failed to apply schema changes", error=error_msg)
            
            return {
                "success": False,
                "error": error_msg,
                "changes_applied": 0,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def _get_current_schema(self) -> str:
        """Get the current database schema information."""
        
        try:
            async with engine.begin() as conn:
                # Get table information
                tables_query = """
                SELECT 
                    t.table_name,
                    c.column_name,
                    c.data_type,
                    c.is_nullable,
                    c.column_default
                FROM information_schema.tables t
                LEFT JOIN information_schema.columns c ON t.table_name = c.table_name
                WHERE t.table_schema = 'public'
                ORDER BY t.table_name, c.ordinal_position;
                """
                
                result = await conn.execute(tables_query)
                rows = result.fetchall()
                
                # Format schema information
                schema_text = "Current Database Schema:\n"
                current_table = None
                
                for row in rows:
                    table_name, column_name, data_type, is_nullable, column_default = row
                    
                    if table_name != current_table:
                        schema_text += f"\nTable: {table_name}\n"
                        current_table = table_name
                    
                    nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
                    default = f" DEFAULT {column_default}" if column_default else ""
                    
                    schema_text += f"  - {column_name}: {data_type} {nullable}{default}\n"
                
                return schema_text
                
        except Exception as e:
            self.logger.error("Failed to get current schema", error=str(e))
            return "Unable to retrieve current schema"
    
    def _is_safe_ddl(self, sql_statement: str) -> bool:
        """Check if a DDL statement is safe to execute."""
        
        # Convert to uppercase for checking
        sql_upper = sql_statement.upper().strip()
        
        # Allow only specific DDL operations
        safe_operations = [
            "CREATE TABLE",
            "ALTER TABLE",
            "CREATE INDEX",
            "CREATE UNIQUE INDEX",
            "CREATE CONSTRAINT",
        ]
        
        # Check if statement starts with a safe operation
        is_safe = any(sql_upper.startswith(op) for op in safe_operations)
        
        # Block dangerous operations
        dangerous_operations = [
            "DROP TABLE",
            "DROP DATABASE",
            "DELETE FROM",
            "UPDATE",
            "INSERT INTO",
            "TRUNCATE",
            "DROP SCHEMA",
        ]
        
        has_dangerous = any(op in sql_upper for op in dangerous_operations)
        
        return is_safe and not has_dangerous
    
    async def _log_schema_change(
        self,
        change_type: str,
        sql_executed: str,
        user_request: str,
        reasoning: str,
        success: bool,
        error_message: Optional[str] = None
    ) -> None:
        """Log schema change to the database."""
        
        try:
            async with SessionLocal() as session:
                log_entry = AISchemaChange(
                    change_type=change_type,
                    sql_executed=sql_executed,
                    user_request=user_request,
                    reasoning=reasoning,
                    success=success,
                    error_message=error_message
                )
                
                session.add(log_entry)
                await session.commit()
                
        except Exception as e:
            self.logger.error("Failed to log schema change", error=str(e))
    
    async def get_schema_change_history(self, limit: int = 50) -> Dict[str, Any]:
        """Get the history of schema changes."""
        
        try:
            async with SessionLocal() as session:
                result = await session.execute(
                    "SELECT * FROM ai_schema_changes ORDER BY created_at DESC LIMIT %s",
                    (limit,)
                )
                
                changes = []
                for row in result.fetchall():
                    changes.append({
                        "id": str(row.id),
                        "change_type": row.change_type,
                        "table_name": row.table_name,
                        "sql_executed": row.sql_executed,
                        "reasoning": row.reasoning,
                        "user_request": row.user_request,
                        "created_at": row.created_at.isoformat(),
                        "success": row.success,
                        "error_message": row.error_message,
                    })
                
                return {
                    "success": True,
                    "changes": changes,
                    "total": len(changes),
                    "timestamp": datetime.utcnow().isoformat()
                }
                
        except Exception as e:
            self.logger.error("Failed to get schema change history", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }