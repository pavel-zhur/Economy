import asyncio
import structlog
from typing import Dict, Any, Optional, List
from datetime import datetime
import json
import uuid

from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.agents import AgentExecutor, create_sql_agent
from langchain.agents.agent_toolkits import SQLDatabaseToolkit
from langchain.sql_database import SQLDatabase
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferWindowMemory

try:
    from langfuse import Langfuse
    from langfuse.callback import CallbackHandler
    LANGFUSE_AVAILABLE = True
except ImportError:
    LANGFUSE_AVAILABLE = False
    CallbackHandler = None

from database import DatabaseManager
from restack_client import RestackClient, WorkflowRequest


logger = structlog.get_logger()


class AIAgent:
    """AI agent for natural language to SQL processing."""
    
    def __init__(
        self,
        db_manager: DatabaseManager,
        restack_client: RestackClient,
        openai_api_key: Optional[str],
        langfuse_public_key: Optional[str] = None,
        langfuse_secret_key: Optional[str] = None,
        langfuse_host: Optional[str] = None
    ):
        self._db_manager = db_manager
        self._restack_client = restack_client
        self._openai_api_key = openai_api_key
        
        # Initialize LangFuse if available
        self._langfuse = None
        self._langfuse_handler = None
        if LANGFUSE_AVAILABLE and langfuse_public_key and langfuse_secret_key:
            try:
                self._langfuse = Langfuse(
                    public_key=langfuse_public_key,
                    secret_key=langfuse_secret_key,
                    host=langfuse_host or "https://cloud.langfuse.com"
                )
                self._langfuse_handler = CallbackHandler(
                    public_key=langfuse_public_key,
                    secret_key=langfuse_secret_key,
                    host=langfuse_host or "https://cloud.langfuse.com"
                )
                logger.info("LangFuse initialized successfully")
            except Exception as e:
                logger.error("Failed to initialize LangFuse", error=str(e))
        
        # Initialize OpenAI
        self._llm = None
        self._sql_agent = None
        self._conversation_memory = {}
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize the AI agent."""
        try:
            # Check if OpenAI API key is available
            if not self._openai_api_key:
                logger.warning("OpenAI API key not provided - AI features will be limited")
                self._initialized = True  # Mark as initialized but without AI capabilities
                return
            
            # Initialize OpenAI LLM
            self._llm = ChatOpenAI(
                model="gpt-4",
                temperature=0.1,
                openai_api_key=self._openai_api_key,
                callbacks=[self._langfuse_handler] if self._langfuse_handler else []
            )
            
            # Initialize SQL database connection for LangChain
            try:
                db_url = self._db_manager._database_url.replace("postgresql+asyncpg://", "postgresql://")
                sql_db = SQLDatabase.from_uri(db_url)
                
                # Create SQL toolkit
                toolkit = SQLDatabaseToolkit(db=sql_db, llm=self._llm)
                
                # Create SQL agent
                self._sql_agent = create_sql_agent(
                    llm=self._llm,
                    toolkit=toolkit,
                    verbose=True,
                    agent_type="openai-tools",
                    callbacks=[self._langfuse_handler] if self._langfuse_handler else []
                )
                logger.info("SQL agent initialized successfully")
            except Exception as e:
                logger.warning("Failed to initialize SQL agent", error=str(e))
                # Continue without SQL agent - still can do basic text processing
            
            self._initialized = True
            logger.info("AI agent initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize AI agent", error=str(e))
            # Mark as initialized with limited capabilities
            self._initialized = True
    
    async def cleanup(self) -> None:
        """Clean up resources."""
        if self._langfuse:
            try:
                self._langfuse.flush()
            except Exception as e:
                logger.error("Error flushing LangFuse", error=str(e))
        
        logger.info("AI agent cleaned up")
    
    def is_healthy(self) -> bool:
        """Check if AI agent is healthy."""
        return self._initialized and self._llm is not None
    
    async def process_message(
        self,
        user_message: str,
        session_id: str,
        use_workflow: bool = True
    ) -> Dict[str, Any]:
        """Process user message and return AI response."""
        if not self._initialized:
            return {
                "success": False,
                "error": "AI agent not initialized",
                "ai_response": "System is not ready. Please try again later."
            }
        
        try:
            # Get conversation context
            schema_context = await self._db_manager.get_schema_info()
            conversation_history = await self._db_manager.get_conversation_history(session_id, limit=5)
            
            if use_workflow and self._restack_client:
                # Use Restack workflow
                workflow_request = WorkflowRequest(
                    user_message=user_message,
                    session_id=session_id,
                    schema_context=schema_context,
                    conversation_history=conversation_history
                )
                
                result = await self._restack_client.start_sql_workflow(workflow_request)
                
                response = {
                    "success": result.success,
                    "ai_response": result.ai_response,
                    "sql_generated": result.sql_generated,
                    "execution_result": result.execution_result,
                    "workflow_id": result.workflow_id,
                    "error": result.error
                }
            else:
                # Direct processing without workflow
                response = await self._process_direct(
                    user_message=user_message,
                    session_id=session_id,
                    schema_context=schema_context,
                    conversation_history=conversation_history
                )
            
            # Save conversation to database
            await self._db_manager.save_conversation(
                session_id=session_id,
                user_message=user_message,
                ai_response=response["ai_response"],
                sql_generated=response.get("sql_generated"),
                execution_result=response.get("execution_result"),
                workflow_id=response.get("workflow_id")
            )
            
            return response
            
        except Exception as e:
            logger.error("Failed to process message", error=str(e), session_id=session_id)
            
            error_response = {
                "success": False,
                "error": str(e),
                "ai_response": f"I encountered an error while processing your request: {str(e)}"
            }
            
            # Save error to conversation log
            await self._db_manager.save_conversation(
                session_id=session_id,
                user_message=user_message,
                ai_response=error_response["ai_response"]
            )
            
            return error_response
    
    async def _process_direct(
        self,
        user_message: str,
        session_id: str,
        schema_context: Dict[str, Any],
        conversation_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Process message directly without workflow."""
        try:
            # If no OpenAI API key, return helpful message
            if not self._openai_api_key:
                return {
                    "success": True,
                    "ai_response": f"Hello! I received your message: '{user_message}'\n\nHowever, I need an OpenAI API key to provide AI-powered responses. Please set the OPENAI_API_KEY environment variable to enable full AI functionality.\n\nCurrent database has {schema_context.get('total_tables', 0)} tables.",
                }
            
            # Determine if this is a SQL query or schema modification request
            intent = await self._classify_intent(user_message, schema_context)
            
            if intent == "sql_query":
                return await self._handle_sql_query(user_message, session_id, schema_context)
            elif intent == "schema_modification":
                return await self._handle_schema_modification(user_message, session_id, schema_context)
            else:
                return await self._handle_general_conversation(user_message, session_id, schema_context)
                
        except Exception as e:
            logger.error("Direct processing failed", error=str(e))
            raise
    
    async def _classify_intent(
        self,
        user_message: str,
        schema_context: Dict[str, Any]
    ) -> str:
        """Classify user intent."""
        system_prompt = """You are an intent classifier for a database management system.
        
        Classify the user's message into one of these categories:
        - "sql_query": User wants to query data, insert, update, or delete records
        - "schema_modification": User wants to create tables, modify schema, add columns
        - "general": General conversation, questions about the system, help requests
        
        Respond with just the category name."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User message: {user_message}")
        ]
        
        try:
            response = await self._llm.ainvoke(messages)
            intent = response.content.strip().lower()
            
            if intent in ["sql_query", "schema_modification", "general"]:
                return intent
            else:
                return "general"
                
        except Exception as e:
            logger.error("Intent classification failed", error=str(e))
            return "general"
    
    async def _handle_sql_query(
        self,
        user_message: str,
        session_id: str,
        schema_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle SQL query requests."""
        try:
            # Use LangChain SQL agent to generate and execute SQL
            result = await asyncio.to_thread(
                self._sql_agent.run,
                user_message
            )
            
            # Extract SQL from agent result if possible
            sql_generated = self._extract_sql_from_result(result)
            
            return {
                "success": True,
                "ai_response": result,
                "sql_generated": sql_generated,
                "execution_result": {"message": "Query executed successfully"}
            }
            
        except Exception as e:
            logger.error("SQL query handling failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "ai_response": f"I couldn't execute your SQL query: {str(e)}"
            }
    
    async def _handle_schema_modification(
        self,
        user_message: str,
        session_id: str,
        schema_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle schema modification requests."""
        try:
            # Generate migration SQL
            migration_sql = await self._generate_migration_sql(user_message, schema_context)
            
            if not migration_sql:
                return {
                    "success": False,
                    "ai_response": "I couldn't generate a migration for your request. Please provide more details."
                }
            
            # For now, don't auto-execute schema changes
            return {
                "success": True,
                "ai_response": f"I've generated a migration script for your request:\n\n```sql\n{migration_sql}\n```\n\nWould you like me to execute this migration?",
                "sql_generated": migration_sql,
                "requires_approval": True
            }
            
        except Exception as e:
            logger.error("Schema modification handling failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "ai_response": f"I couldn't process your schema modification request: {str(e)}"
            }
    
    async def _handle_general_conversation(
        self,
        user_message: str,
        session_id: str,
        schema_context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Handle general conversation."""
        system_prompt = f"""You are a helpful AI assistant for a PostgreSQL database management system.
        
        Current database schema:
        {json.dumps(schema_context, indent=2)}
        
        You can help users with:
        - Understanding their database structure
        - Writing SQL queries
        - Explaining database concepts
        - Suggesting schema improvements
        
        Be helpful, friendly, and technically accurate."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_message)
        ]
        
        try:
            response = await self._llm.ainvoke(messages)
            return {
                "success": True,
                "ai_response": response.content
            }
            
        except Exception as e:
            logger.error("General conversation failed", error=str(e))
            return {
                "success": False,
                "error": str(e),
                "ai_response": "I'm having trouble processing your request right now. Please try again."
            }
    
    async def _generate_migration_sql(
        self,
        user_message: str,
        schema_context: Dict[str, Any]
    ) -> Optional[str]:
        """Generate migration SQL from user description."""
        system_prompt = f"""You are a database migration expert.
        
        Current schema:
        {json.dumps(schema_context, indent=2)}
        
        Generate a PostgreSQL migration script based on the user's request.
        Return ONLY the SQL commands, no explanations.
        Use proper PostgreSQL syntax and include IF NOT EXISTS where appropriate."""
        
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User request: {user_message}")
        ]
        
        try:
            response = await self._llm.ainvoke(messages)
            sql = response.content.strip()
            
            # Basic validation
            if "CREATE" in sql.upper() or "ALTER" in sql.upper() or "DROP" in sql.upper():
                return sql
            else:
                return None
                
        except Exception as e:
            logger.error("Migration SQL generation failed", error=str(e))
            return None
    
    def _extract_sql_from_result(self, result: str) -> Optional[str]:
        """Extract SQL from agent result."""
        # Simple extraction - look for SQL between code blocks
        if "```sql" in result:
            start = result.find("```sql") + 6
            end = result.find("```", start)
            if end > start:
                return result[start:end].strip()
        
        # Look for SELECT, INSERT, UPDATE, DELETE statements
        lines = result.split('\n')
        sql_lines = []
        for line in lines:
            line = line.strip()
            if any(line.upper().startswith(cmd) for cmd in ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER', 'DROP']):
                sql_lines.append(line)
        
        return '\n'.join(sql_lines) if sql_lines else None
    
    def get_session_memory(self, session_id: str) -> ConversationBufferWindowMemory:
        """Get or create conversation memory for session."""
        if session_id not in self._conversation_memory:
            self._conversation_memory[session_id] = ConversationBufferWindowMemory(
                k=10,  # Keep last 10 exchanges
                return_messages=True
            )
        return self._conversation_memory[session_id]