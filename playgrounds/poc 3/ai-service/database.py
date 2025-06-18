import asyncio
import structlog
from typing import Optional, Dict, Any, List
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, MetaData, inspect
from sqlalchemy.sql import text
from datetime import datetime


logger = structlog.get_logger()


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


class SchemaVersion(Base):
    """Track schema evolution history."""
    __tablename__ = "schema_versions"
    
    id: int = Column(Integer, primary_key=True)
    version: str = Column(String(50), nullable=False, unique=True)
    description: str = Column(Text)
    schema_definition: Dict[str, Any] = Column(JSON)
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    applied_at: Optional[datetime] = Column(DateTime)


class ConversationLog(Base):
    """Log of user conversations and AI responses."""
    __tablename__ = "conversation_logs"
    
    id: int = Column(Integer, primary_key=True)
    session_id: str = Column(String(100), nullable=False)
    user_message: str = Column(Text, nullable=False)
    ai_response: str = Column(Text)
    sql_generated: Optional[str] = Column(Text)
    execution_result: Optional[Dict[str, Any]] = Column(JSON)
    workflow_id: Optional[str] = Column(String(100))
    created_at: datetime = Column(DateTime, default=datetime.utcnow)


class DatabaseManager:
    """Manages PostgreSQL database operations with AI integration."""
    
    def __init__(self, database_url: str):
        self._database_url = database_url
        self._engine = None
        self._session_maker = None
        self._initialized = False
    
    async def initialize(self) -> None:
        """Initialize database connection and create tables."""
        try:
            # Create async engine
            self._engine = create_async_engine(
                self._database_url,
                echo=False,
                pool_pre_ping=True,
                pool_recycle=3600
            )
            
            # Create session maker
            self._session_maker = async_sessionmaker(
                self._engine,
                class_=AsyncSession,
                expire_on_commit=False
            )
            
            # Create tables
            async with self._engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            
            self._initialized = True
            logger.info("Database manager initialized successfully")
            
        except Exception as e:
            logger.error("Failed to initialize database manager", error=str(e))
            raise
    
    async def close(self) -> None:
        """Close database connections."""
        if self._engine:
            await self._engine.dispose()
            self._initialized = False
            logger.info("Database connections closed")
    
    async def health_check(self) -> bool:
        """Check if database is healthy."""
        if not self._initialized:
            return False
        
        try:
            async with self._session_maker() as session:
                result = await session.execute(text("SELECT 1"))
                return result.fetchone() is not None
        except Exception as e:
            logger.error("Database health check failed", error=str(e))
            return False
    
    async def execute_sql(self, sql: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Execute SQL query and return results."""
        if not self._initialized:
            raise RuntimeError("Database manager not initialized")
        
        try:
            async with self._session_maker() as session:
                result = await session.execute(text(sql), params or {})
                
                # Handle different types of queries
                if result.returns_rows:
                    rows = result.fetchall()
                    columns = list(result.keys())
                    data = [dict(zip(columns, row)) for row in rows]
                    
                    return {
                        "success": True,
                        "data": data,
                        "row_count": len(data),
                        "columns": columns
                    }
                else:
                    await session.commit()
                    return {
                        "success": True,
                        "message": f"Query executed successfully. Rows affected: {result.rowcount}",
                        "rows_affected": result.rowcount
                    }
                    
        except Exception as e:
            logger.error("SQL execution failed", sql=sql, error=str(e))
            return {
                "success": False,
                "error": str(e),
                "sql": sql
            }
    
    async def get_schema_info(self) -> Dict[str, Any]:
        """Get current database schema information."""
        try:
            async with self._engine.connect() as conn:
                # Get table information
                inspector = await conn.run_sync(lambda sync_conn: inspect(sync_conn))
                table_names = await conn.run_sync(lambda sync_conn: inspector.get_table_names())
                
                schema_info = {
                    "tables": {},
                    "total_tables": len(table_names)
                }
                
                for table_name in table_names:
                    columns = await conn.run_sync(
                        lambda sync_conn: inspector.get_columns(table_name)
                    )
                    
                    schema_info["tables"][table_name] = {
                        "columns": [
                            {
                                "name": col["name"],
                                "type": str(col["type"]), 
                                "nullable": col["nullable"],
                                "default": col.get("default")
                            }
                            for col in columns
                        ]
                    }
                
                return schema_info
                
        except Exception as e:
            logger.error("Failed to get schema info", error=str(e))
            return {"error": str(e)}
    
    async def save_conversation(
        self,
        session_id: str,
        user_message: str,
        ai_response: str,
        sql_generated: Optional[str] = None,
        execution_result: Optional[Dict[str, Any]] = None,
        workflow_id: Optional[str] = None
    ) -> None:
        """Save conversation to database."""
        try:
            async with self._session_maker() as session:
                conversation = ConversationLog(
                    session_id=session_id,
                    user_message=user_message,
                    ai_response=ai_response,
                    sql_generated=sql_generated,
                    execution_result=execution_result,
                    workflow_id=workflow_id
                )
                
                session.add(conversation)
                await session.commit()
                logger.info("Conversation saved", session_id=session_id)
                
        except Exception as e:
            logger.error("Failed to save conversation", error=str(e))
    
    async def get_conversation_history(
        self,
        session_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get conversation history for a session."""
        try:
            async with self._session_maker() as session:
                result = await session.execute(
                    text("""
                        SELECT user_message, ai_response, sql_generated, 
                               execution_result, created_at, workflow_id
                        FROM conversation_logs 
                        WHERE session_id = :session_id 
                        ORDER BY created_at DESC 
                        LIMIT :limit
                    """),
                    {"session_id": session_id, "limit": limit}
                )
                
                rows = result.fetchall()
                return [
                    {
                        "user_message": row[0],
                        "ai_response": row[1],
                        "sql_generated": row[2],
                        "execution_result": row[3],
                        "created_at": row[4].isoformat() if row[4] else None,
                        "workflow_id": row[5]
                    }
                    for row in rows
                ]
                
        except Exception as e:
            logger.error("Failed to get conversation history", error=str(e))
            return []
    
    async def save_schema_version(
        self,
        version: str,
        description: str,
        schema_definition: Dict[str, Any]
    ) -> None:
        """Save a new schema version."""
        try:
            async with self._session_maker() as session:
                schema_version = SchemaVersion(
                    version=version,
                    description=description,
                    schema_definition=schema_definition,
                    applied_at=datetime.utcnow()
                )
                
                session.add(schema_version)
                await session.commit()
                logger.info("Schema version saved", version=version)
                
        except Exception as e:
            logger.error("Failed to save schema version", error=str(e))
    
    @property
    def is_initialized(self) -> bool:
        """Check if database manager is initialized."""
        return self._initialized