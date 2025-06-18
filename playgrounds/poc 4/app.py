import os
import asyncio
import aiofiles
import mimetypes
from pathlib import Path
from typing import Optional, Dict, Any, Union
from datetime import datetime
import logging

import chainlit as cl
from chainlit.data.sql_alchemy import SQLAlchemyDataLayer
from chainlit.data.storage_clients.base import BaseStorageClient
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from langchain_openai import ChatOpenAI
from langchain_anthropic import ChatAnthropic
from langchain_community.agent_toolkits.sql.base import create_sql_agent
from langchain.agents.agent_types import AgentType
from langchain_community.utilities import SQLDatabase
from langchain_community.agent_toolkits import SQLDatabaseToolkit
from langfuse.langchain import CallbackHandler
from langfuse import Langfuse
from sqlalchemy import create_engine, text
from sqlalchemy.pool import StaticPool
from dotenv import load_dotenv

from config import settings

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=getattr(logging, settings.log_level))
logger = logging.getLogger(__name__)

class LocalFileStorageClient(BaseStorageClient):
    """
    Local file storage client that stores files in a Docker volume
    and serves them via HTTP URLs through Chainlit's built-in file server.
    """
    
    def __init__(self, storage_path: str = "/app/storage", base_url: str = "http://localhost:8000"):
        super().__init__()
        self.storage_path = Path(storage_path)
        self.base_url = base_url.rstrip('/')
        
        # Create storage directory if it doesn't exist
        self.storage_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Local storage initialized at: {self.storage_path}")
    
    async def upload_file(
        self, 
        object_key: str, 
        data: Union[bytes, str], 
        mime: str = "application/octet-stream", 
        overwrite: bool = True
    ) -> Dict[str, Any]:
        """Upload file to local storage and return access URL"""
        try:
            # Clean object key and add extension if needed
            object_key_clean = object_key.replace("\\", "/").strip("/")
            
            # Get file extension
            file_path = Path(object_key_clean)
            if not file_path.suffix:
                extension = mimetypes.guess_extension(mime) or ""
                object_key_clean = f"{object_key_clean}{extension}"
            
            # Full file path
            full_path = self.storage_path / object_key_clean
            
            # Create parent directories
            full_path.parent.mkdir(parents=True, exist_ok=True)
            
            # Check if file exists and overwrite is False
            if not overwrite and full_path.exists():
                logger.warning(f"File already exists and overwrite=False: {full_path}")
                return {}
            
            # Write file
            if isinstance(data, str):
                async with aiofiles.open(full_path, "w", encoding="utf-8") as f:
                    await f.write(data)
            else:
                async with aiofiles.open(full_path, "wb") as f:
                    await f.write(data)
            
            # Create URL for accessing the file
            # We'll serve files through a custom endpoint
            file_url = f"{self.base_url}/files/{object_key_clean}"
            
            logger.info(f"File uploaded: {full_path} -> {file_url}")
            
            return {
                "object_key": object_key_clean,
                "url": file_url,
                "path": str(full_path)
            }
            
        except Exception as e:
            logger.error(f"Failed to upload file {object_key}: {e}")
            return {}
    
    async def download_file(self, object_key: str) -> Optional[bytes]:
        """Download file from local storage"""
        try:
            file_path = self.storage_path / object_key
            if not file_path.exists():
                return None
            
            async with aiofiles.open(file_path, "rb") as f:
                return await f.read()
        except Exception as e:
            logger.error(f"Failed to download file {object_key}: {e}")
            return None
    
    async def delete_file(self, object_key: str) -> bool:
        """Delete file from local storage"""
        try:
            file_path = self.storage_path / object_key
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete file {object_key}: {e}")
            return False
    
    async def get_read_url(self, object_key: str) -> Optional[str]:
        """Get read URL for a file"""
        try:
            file_path = self.storage_path / object_key
            if file_path.exists():
                return f"{self.base_url}/files/{object_key}"
            return None
        except Exception as e:
            logger.error(f"Failed to get read URL for {object_key}: {e}")
            return None

class DatabaseManager:
    """Manages database connections and operations"""
    
    def __init__(self, database_url: str):
        self.database_url = database_url
        self.engine = create_engine(
            database_url,
            poolclass=StaticPool,
            pool_pre_ping=True,
            echo=False
        )
        self.db = SQLDatabase(self.engine)
    
    def execute_query(self, query: str) -> tuple[bool, str]:
        """Execute a SQL query and return success status and result"""
        try:
            with self.engine.connect() as conn:
                result = conn.execute(text(query))
                if result.returns_rows:
                    rows = result.fetchall()
                    return True, str(rows)
                else:
                    return True, f"Query executed successfully. Rows affected: {result.rowcount}"
        except Exception as e:
            logger.error(f"Database error: {e}")
            return False, str(e)
    
    def log_schema_change(self, change_type: str, table_name: str, sql_statement: str, 
                         success: bool, error_message: Optional[str] = None):
        """Log schema changes to audit table"""
        try:
            log_query = """
            INSERT INTO ai_data.schema_changes 
            (change_type, table_name, sql_statement, success, error_message) 
            VALUES (:change_type, :table_name, :sql_statement, :success, :error_message)
            """
            
            with self.engine.connect() as conn:
                conn.execute(text(log_query), {
                    "change_type": change_type,
                    "table_name": table_name,
                    "sql_statement": sql_statement,
                    "success": success,
                    "error_message": error_message
                })
                conn.commit()
        except Exception as e:
            logger.error(f"Failed to log schema change: {e}")

class AIAgent:
    """AI agent for database management"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.langfuse = None
        self.callback_handler = None
        
        # Initialize LangFuse if credentials are available
        if settings.langfuse_public_key and settings.langfuse_secret_key:
            try:
                # Initialize LangFuse client (v3 API)
                Langfuse(
                    public_key=settings.langfuse_public_key,
                    secret_key=settings.langfuse_secret_key,
                    host=settings.langfuse_host
                )
                # Create callback handler (no arguments needed in v3)
                self.callback_handler = CallbackHandler()
                logger.info("LangFuse initialized successfully")
            except Exception as e:
                logger.warning(f"LangFuse initialization failed: {e}")
        
        # Initialize LLM
        self.llm = self._initialize_llm()
        
        # Create SQL agent
        self.toolkit = SQLDatabaseToolkit(db=self.db_manager.db, llm=self.llm)
        
        callbacks = [self.callback_handler] if self.callback_handler else []
        self.agent = create_sql_agent(
            llm=self.llm,
            toolkit=self.toolkit,
            agent_type=AgentType.ZERO_SHOT_REACT_DESCRIPTION,
            callbacks=callbacks,
            verbose=True,
            max_iterations=settings.max_iterations,
            early_stopping_method="generate",
            handle_parsing_errors=True
        )
    
    def _initialize_llm(self):
        """Initialize the LLM based on available API keys"""
        if settings.openai_api_key:
            return ChatOpenAI(
                model=settings.llm_model,
                temperature=settings.llm_temperature,
                openai_api_key=settings.openai_api_key
            )
        elif settings.anthropic_api_key:
            return ChatAnthropic(
                model="claude-3-haiku-20240307",
                temperature=settings.llm_temperature,
                anthropic_api_key=settings.anthropic_api_key
            )
        else:
            raise ValueError("No API key provided for LLM")
    
    async def process_message(self, message: str) -> Dict[str, Any]:
        """Process user message and return AI response"""
        try:
            # Enhanced system prompt
            system_prompt = """
            You are a friendly AI assistant that helps users manage their PostgreSQL database through natural language.
            
            You can:
            1. Answer general questions and have conversations
            2. Create, modify, and delete tables and schemas
            3. Insert, update, and delete data
            4. Query data and provide insights
            5. Explain database structure and relationships
            
            Guidelines:
            - Be conversational and friendly
            - For general questions not related to databases, provide helpful responses
            - For database operations, always be careful with destructive operations (DROP, DELETE)
            - Provide clear explanations of what you're doing
            - Use the ai_data schema for user data
            - If you're not sure about something, ask for clarification
            
            Current database: PostgreSQL with ai_data schema for user data.
            
            Remember: You can handle both casual conversation and database management tasks!
            """
            
            enhanced_message = f"{system_prompt}\n\nUser request: {message}"
            
            # Execute the agent
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.agent.run, enhanced_message
            )
            
            return {
                "response": result,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                "response": f"I encountered an error: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }

# Global instances
db_manager = DatabaseManager(settings.database_url)
ai_agent = AIAgent(db_manager)

# Configure Chainlit data layer to use separate database with local file storage
try:
    # Create local file storage client
    storage_client = LocalFileStorageClient(
        storage_path="/app/storage",
        base_url="http://localhost:8000"  # Will be updated based on actual host
    )
    
    cl_data_layer = SQLAlchemyDataLayer(
        conninfo=settings.chainlit_database_url,
        storage_provider=storage_client
    )
    # Set the data layer for Chainlit
    cl.data_layer = cl_data_layer
    logger.info(f"Chainlit data layer configured with database: {settings.chainlit_database_url}")
    logger.info("Local file storage configured at: /app/storage")
    logger.info("Chainlit will automatically create required tables on first use")
except Exception as e:
    logger.warning(f"Failed to configure Chainlit data layer: {e}")
    logger.warning("Chainlit will run without data persistence")

# Audio message handler for speech-to-text
@cl.on_audio_chunk
async def on_audio_chunk(chunk: cl.InputAudioChunk):
    """Handle audio chunks for speech-to-text"""
    if chunk.isLast:
        # This is a placeholder - you'd need to implement actual speech-to-text
        await cl.Message(content="🎤 Audio received! (Speech-to-text not implemented yet)").send()

# File uploads are handled in the on_message handler via msg.elements

@cl.on_chat_start
async def start():
    """Initialize the chat session"""
    await cl.Message(
        content="🤖 **AI Database Assistant** is ready!\n\n"
               "I can help you manage your PostgreSQL database using natural language.\n\n"
               "**What I can do:**\n"
               "• Create and modify tables\n"
               "• Insert, update, and query data\n"
               "• Analyze database structure\n"
               "• Get insights from your data\n"
               "• Handle file uploads and storage\n\n"
               "**Try these examples:**\n"
               "- 'Show me all tables in the database'\n"
               "- 'Create a users table with name and email'\n"
               "- 'Add some sample data to the conversations table'\n"
               "- Upload an image or document for analysis\n\n"
               "🔍 **Tracing**: Operations are tracked in LangFuse for analysis.\n"
               "📁 **File Storage**: Uploads are persisted in local storage."
    ).send()

@cl.on_message
async def main(message: cl.Message):
    """Handle incoming messages and file uploads"""
    
    # Check if files were uploaded
    if message.elements:
        # Handle file uploads
        for element in message.elements:
            if hasattr(element, 'mime') and element.mime.startswith('image/'):
                # Handle image uploads
                image_element = cl.Image(
                    path=element.path,
                    name=element.name,
                    display="inline"
                )
                await cl.Message(
                    content=f"📸 **Image received: {element.name}**\n\n"
                           "I can see you've uploaded an image! While I can't process images directly yet, "
                           "I can help you create database tables to store image metadata or file paths.\n\n"
                           "Would you like me to help you set up a database structure for managing images?",
                    elements=[image_element]
                ).send()
            else:
                # Handle other file types
                await cl.Message(
                    content=f"📁 **File received: {element.name}**\n\n"
                           "I can help you create database structures to store file information! "
                           "What would you like to do with this file?"
                ).send()
        
        # If there are files but also text content, process the text too
        if not message.content.strip():
            return
    
    # Process text messages
    if message.content.strip():
        # Show processing step
        async with cl.Step(name="ai_processing", type="run") as step:
            step.output = "🤔 Processing your request..."
            
            # Process the message
            result = await ai_agent.process_message(message.content)
            
            # Create response
            response_content = result["response"]
            response_content += f"\n\n*Processed at: {result['timestamp']}*"
            
            step.output = response_content
        
        # Send final response
        await cl.Message(content=response_content).send()

@cl.on_chat_resume
async def on_chat_resume(thread):
    """Handle chat resume - restore previous conversation history"""
    logger.info(f"Resuming chat thread: {thread.get('id') if thread else 'Unknown'}")
    
    # Welcome back message
    await cl.Message(
        content="🔄 **Chat Resumed**\n\n"
               "Welcome back! Your conversation history has been restored.\n"
               "I can continue helping you with your database management tasks."
    ).send()

@cl.on_stop
async def stop():
    """Cleanup when chat stops"""
    logger.info("Chat session ended")

if __name__ == "__main__":
    logger.info("Starting AI Database Assistant...")
    logger.info(f"Database URL: {settings.database_url}")
    logger.info(f"LangFuse enabled: {bool(settings.langfuse_public_key)}") 