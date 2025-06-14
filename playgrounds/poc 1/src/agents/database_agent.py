"""Database Agent for handling SQL operations and data management."""

import asyncio
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
import structlog

from langchain_openai import ChatOpenAI
from langchain.agents import create_sql_agent
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langchain_community.utilities import SQLDatabase
from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain.callbacks.base import BaseCallbackHandler
from langfuse.callback import CallbackHandler as LangfuseCallbackHandler

from ..config import get_settings
from ..database import get_db, SessionLocal, AISchemaChange


logger = structlog.get_logger()


class DatabaseMetricsCallback(BaseCallbackHandler):
    """Callback to track database operation metrics."""
    
    def __init__(self):
        self.queries_executed = 0
        self.total_tokens = 0
        self.execution_time = 0.0
        
    def on_llm_end(self, response, **kwargs) -> None:
        """Track LLM usage."""
        if hasattr(response, 'llm_output') and response.llm_output:
            token_usage = response.llm_output.get('token_usage', {})
            self.total_tokens += token_usage.get('total_tokens', 0)


class DatabaseAgent:
    """AI agent for database operations and data management."""
    
    def __init__(self):
        self.settings = get_settings()
        self.logger = logger.bind(agent="database")
        
        # Initialize LLM
        self.llm = ChatOpenAI(
            model=self.settings.openai_model,
            temperature=self.settings.openai_temperature,
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
        
        self.metrics_callback = DatabaseMetricsCallback()
        self.callbacks.append(self.metrics_callback)
        
        # Initialize SQL Database connection
        self._init_sql_db()
        
    def _init_sql_db(self) -> None:
        """Initialize SQL database connection for LangChain."""
        try:
            # Use synchronous connection for LangChain SQL Agent
            sync_db_url = self.settings.database_url
            if sync_db_url.startswith("postgresql+asyncpg://"):
                sync_db_url = sync_db_url.replace("postgresql+asyncpg://", "postgresql://")
            
            self.sql_db = SQLDatabase.from_uri(sync_db_url)
            
            # Create SQL agent with toolkit
            toolkit = SQLDatabaseToolkit(db=self.sql_db, llm=self.llm)
            self.sql_agent = create_sql_agent(
                llm=self.llm,
                toolkit=toolkit,
                verbose=self.settings.debug,
                callbacks=self.callbacks,
                max_iterations=10,
                max_execution_time=120,
                early_stopping_method="generate",
            )
            
            self.logger.info("Database agent initialized successfully")
            
        except Exception as e:
            self.logger.error("Failed to initialize database agent", error=str(e))
            raise
    
    async def execute_query(
        self, 
        user_request: str, 
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute a database query based on natural language request."""
        
        self.logger.info("Executing database query", request=user_request)
        
        try:
            # Enhance the request with context
            enhanced_request = self._enhance_request(user_request, context)
            
            # Execute the query using SQL agent
            result = await asyncio.get_event_loop().run_in_executor(
                None, 
                lambda: self.sql_agent.run(enhanced_request)
            )
            
            # Log the successful operation
            await self._log_operation(
                operation_type="query",
                user_request=user_request,
                sql_executed=str(result),
                success=True
            )
            
            response = {
                "success": True,
                "result": result,
                "query_count": self.metrics_callback.queries_executed,
                "tokens_used": self.metrics_callback.total_tokens,
                "timestamp": datetime.utcnow().isoformat()
            }
            
            self.logger.info("Database query executed successfully", response=response)
            return response
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error("Database query failed", error=error_msg, request=user_request)
            
            # Log the failed operation
            await self._log_operation(
                operation_type="query",
                user_request=user_request,
                sql_executed="",
                success=False,
                error_message=error_msg
            )
            
            return {
                "success": False,
                "error": error_msg,
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def get_schema_info(self) -> Dict[str, Any]:
        """Get current database schema information."""
        
        try:
            # Get table information
            tables_info = self.sql_db.get_table_info()
            
            # Get table names
            table_names = self.sql_db.get_usable_table_names()
            
            return {
                "success": True,
                "tables": table_names,
                "schema_info": tables_info,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            self.logger.error("Failed to get schema info", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    async def validate_query(self, sql_query: str) -> Dict[str, Any]:
        """Validate a SQL query without executing it."""
        
        try:
            # Use EXPLAIN to validate the query
            explain_query = f"EXPLAIN {sql_query}"
            
            result = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self.sql_db.run(explain_query)
            )
            
            return {
                "success": True,
                "valid": True,
                "explanation": result,
                "timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {
                "success": True,
                "valid": False,
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
    
    def _enhance_request(self, user_request: str, context: Optional[Dict[str, Any]]) -> str:
        """Enhance user request with additional context and instructions."""
        
        enhanced_request = f"""
        User Request: {user_request}
        
        Context:
        - You are managing a personal finance database
        - Focus on financial data like transactions, plans, goals, budgets
        - Always prioritize data safety and accuracy
        - Provide clear explanations of what you're doing
        
        """
        
        if context:
            enhanced_request += f"Additional Context: {json.dumps(context, indent=2)}\n"
        
        enhanced_request += """
        Instructions:
        1. Always validate your queries before execution
        2. Use appropriate financial data types (DECIMAL for money, etc.)
        3. Include proper error handling
        4. Provide human-readable results
        5. Explain your reasoning
        """
        
        return enhanced_request
    
    async def _log_operation(
        self,
        operation_type: str,
        user_request: str,
        sql_executed: str,
        success: bool,
        error_message: Optional[str] = None
    ) -> None:
        """Log database operation to ai_schema_changes table."""
        
        try:
            async with SessionLocal() as session:
                log_entry = AISchemaChange(
                    change_type=operation_type,
                    sql_executed=sql_executed,
                    user_request=user_request,
                    success=success,
                    error_message=error_message,
                    reasoning=f"Database agent executed {operation_type} operation"
                )
                
                session.add(log_entry)
                await session.commit()
                
        except Exception as e:
            self.logger.error("Failed to log database operation", error=str(e))
    
    async def get_metrics(self) -> Dict[str, Any]:
        """Get database agent metrics."""
        
        return {
            "queries_executed": self.metrics_callback.queries_executed,
            "total_tokens": self.metrics_callback.total_tokens,
            "execution_time": self.metrics_callback.execution_time,
            "timestamp": datetime.utcnow().isoformat()
        }
    
    async def reset_metrics(self) -> None:
        """Reset metrics counters."""
        
        self.metrics_callback.queries_executed = 0
        self.metrics_callback.total_tokens = 0
        self.metrics_callback.execution_time = 0.0