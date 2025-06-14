import asyncio
import uuid
from typing import Dict, Any, List, Optional
from datetime import datetime

from fastapi import APIRouter, HTTPException, Depends, Query
from pydantic import BaseModel, Field
import structlog

from monitoring import track_request, track_ai_request, TracingContext


logger = structlog.get_logger()

router = APIRouter()

# Global references to main components
db_manager = None
ai_agent = None
restack_client = None


def get_db_manager():
    """Get database manager dependency."""
    global db_manager
    if not db_manager:
        raise HTTPException(status_code=503, detail="Database manager not available")
    return db_manager


def get_ai_agent():
    """Get AI agent dependency."""
    global ai_agent
    if not ai_agent:
        raise HTTPException(status_code=503, detail="AI agent not available")
    return ai_agent


def get_restack_client():
    """Get Restack client dependency."""
    global restack_client
    if not restack_client:
        raise HTTPException(status_code=503, detail="Restack client not available")
    return restack_client


# Request/Response Models
class ChatRequest(BaseModel):
    """Chat request from user."""
    message: str = Field(..., description="User message")
    session_id: Optional[str] = Field(None, description="Session ID for conversation tracking")
    use_workflow: bool = Field(True, description="Whether to use Restack workflow")


class ChatResponse(BaseModel):
    """Chat response to user."""
    success: bool
    ai_response: str
    sql_generated: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None
    workflow_id: Optional[str] = None
    error: Optional[str] = None
    session_id: str


class SchemaInfoResponse(BaseModel):
    """Database schema information."""
    success: bool
    schema_info: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class ConversationHistoryResponse(BaseModel):
    """Conversation history response."""
    success: bool
    conversations: List[Dict[str, Any]] = []
    error: Optional[str] = None


class SQLExecutionRequest(BaseModel):
    """Direct SQL execution request."""
    sql: str = Field(..., description="SQL query to execute")
    session_id: Optional[str] = Field(None, description="Session ID for tracking")


class SQLExecutionResponse(BaseModel):
    """SQL execution response."""
    success: bool
    data: Optional[List[Dict[str, Any]]] = None
    message: Optional[str] = None
    rows_affected: Optional[int] = None
    error: Optional[str] = None


class MigrationRequest(BaseModel):
    """Schema migration request."""
    description: str = Field(..., description="Description of desired schema changes")
    session_id: Optional[str] = Field(None, description="Session ID for tracking")
    auto_execute: bool = Field(False, description="Whether to automatically execute migration")


class MigrationResponse(BaseModel):
    """Schema migration response."""
    success: bool
    migration_sql: Optional[str] = None
    execution_result: Optional[Dict[str, Any]] = None
    workflow_id: Optional[str] = None
    requires_approval: bool = False
    error: Optional[str] = None


class WorkflowStatusResponse(BaseModel):
    """Workflow status response."""
    success: bool
    workflow_id: str
    status: str
    details: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


# Chat Endpoints
@router.post("/chat", response_model=ChatResponse)
@track_request("chat", "POST")
async def chat(
    request: ChatRequest,
    ai_agent=Depends(get_ai_agent)
) -> ChatResponse:
    """Process user message and return AI response."""
    session_id = request.session_id or str(uuid.uuid4())
    
    with TracingContext("chat_request", session_id=session_id, message_length=len(request.message)):
        try:
            logger.info("Processing chat request", session_id=session_id, message=request.message[:100])
            
            # Process message through AI agent
            result = await ai_agent.process_message(
                user_message=request.message,
                session_id=session_id,
                use_workflow=request.use_workflow
            )
            
            response = ChatResponse(
                success=result["success"],
                ai_response=result["ai_response"],
                sql_generated=result.get("sql_generated"),
                execution_result=result.get("execution_result"),
                workflow_id=result.get("workflow_id"),
                error=result.get("error"),
                session_id=session_id
            )
            
            logger.info("Chat request processed", session_id=session_id, success=result["success"])
            return response
            
        except Exception as e:
            logger.error("Chat request failed", session_id=session_id, error=str(e))
            return ChatResponse(
                success=False,
                ai_response=f"I encountered an error processing your request: {str(e)}",
                error=str(e),
                session_id=session_id
            )


# Database Schema Endpoints
@router.get("/schema", response_model=SchemaInfoResponse)
@track_request("schema", "GET")
async def get_schema(
    db_manager=Depends(get_db_manager)
) -> SchemaInfoResponse:
    """Get current database schema information."""
    with TracingContext("get_schema"):
        try:
            logger.info("Getting schema information")
            
            schema_info = await db_manager.get_schema_info()
            
            return SchemaInfoResponse(
                success=True,
                schema_info=schema_info
            )
            
        except Exception as e:
            logger.error("Failed to get schema info", error=str(e))
            return SchemaInfoResponse(
                success=False,
                error=str(e)
            )


@router.post("/schema/migrate", response_model=MigrationResponse)
@track_request("schema_migrate", "POST")
async def migrate_schema(
    request: MigrationRequest,
    ai_agent=Depends(get_ai_agent),
    db_manager=Depends(get_db_manager),
    restack_client=Depends(get_restack_client)
) -> MigrationResponse:
    """Generate and optionally execute schema migration."""
    session_id = request.session_id or str(uuid.uuid4())
    
    with TracingContext("schema_migration", session_id=session_id, description=request.description):
        try:
            logger.info("Processing migration request", session_id=session_id, description=request.description)
            
            # Get current schema
            current_schema = await db_manager.get_schema_info()
            
            # Start migration workflow
            result = await restack_client.start_schema_migration_workflow(
                current_schema=current_schema,
                target_description=request.description,
                session_id=session_id
            )
            
            response = MigrationResponse(
                success=result.success,
                migration_sql=result.sql_generated,
                execution_result=result.execution_result,
                workflow_id=result.workflow_id,
                requires_approval=not request.auto_execute,
                error=result.error
            )
            
            logger.info("Migration request processed", session_id=session_id, success=result.success)
            return response
            
        except Exception as e:
            logger.error("Migration request failed", session_id=session_id, error=str(e))
            return MigrationResponse(
                success=False,
                error=str(e)
            )


# SQL Execution Endpoints
@router.post("/sql/execute", response_model=SQLExecutionResponse)
@track_request("sql_execute", "POST")
async def execute_sql(
    request: SQLExecutionRequest,
    db_manager=Depends(get_db_manager)
) -> SQLExecutionResponse:
    """Execute SQL query directly."""
    session_id = request.session_id or str(uuid.uuid4())
    
    with TracingContext("sql_execution", session_id=session_id, sql=request.sql[:100]):
        try:
            logger.info("Executing SQL", session_id=session_id, sql=request.sql[:100])
            
            result = await db_manager.execute_sql(request.sql)
            
            if result["success"]:
                return SQLExecutionResponse(
                    success=True,
                    data=result.get("data"),
                    message=result.get("message"),
                    rows_affected=result.get("rows_affected")
                )
            else:
                return SQLExecutionResponse(
                    success=False,
                    error=result["error"]
                )
                
        except Exception as e:
            logger.error("SQL execution failed", session_id=session_id, error=str(e))
            return SQLExecutionResponse(
                success=False,
                error=str(e)
            )


# Conversation History Endpoints
@router.get("/conversations/{session_id}", response_model=ConversationHistoryResponse)
@track_request("conversation_history", "GET")
async def get_conversation_history(
    session_id: str,
    limit: int = Query(50, ge=1, le=200),
    db_manager=Depends(get_db_manager)
) -> ConversationHistoryResponse:
    """Get conversation history for a session."""
    with TracingContext("get_conversation_history", session_id=session_id):
        try:
            logger.info("Getting conversation history", session_id=session_id, limit=limit)
            
            conversations = await db_manager.get_conversation_history(session_id, limit)
            
            return ConversationHistoryResponse(
                success=True,
                conversations=conversations
            )
            
        except Exception as e:
            logger.error("Failed to get conversation history", session_id=session_id, error=str(e))
            return ConversationHistoryResponse(
                success=False,
                error=str(e)
            )


# Workflow Management Endpoints
@router.get("/workflows/{workflow_id}/status", response_model=WorkflowStatusResponse)
@track_request("workflow_status", "GET")
async def get_workflow_status(
    workflow_id: str,
    restack_client=Depends(get_restack_client)
) -> WorkflowStatusResponse:
    """Get workflow execution status."""
    with TracingContext("get_workflow_status", workflow_id=workflow_id):
        try:
            logger.info("Getting workflow status", workflow_id=workflow_id)
            
            status = await restack_client.get_workflow_status(workflow_id)
            
            return WorkflowStatusResponse(
                success=True,
                workflow_id=workflow_id,
                status=status.get("status", "unknown"),
                details=status
            )
            
        except Exception as e:
            logger.error("Failed to get workflow status", workflow_id=workflow_id, error=str(e))
            return WorkflowStatusResponse(
                success=False,
                workflow_id=workflow_id,
                status="error",
                error=str(e)
            )


# System Status Endpoints
@router.get("/status")
@track_request("system_status", "GET")
async def get_system_status(
    db_manager=Depends(get_db_manager),
    ai_agent=Depends(get_ai_agent),
    restack_client=Depends(get_restack_client)
) -> Dict[str, Any]:
    """Get overall system status."""
    with TracingContext("get_system_status"):
        try:
            # Check component health
            db_healthy = await db_manager.health_check()
            ai_healthy = ai_agent.is_healthy()
            restack_healthy = await restack_client.health_check()
            
            overall_healthy = all([db_healthy, ai_healthy, restack_healthy])
            
            return {
                "success": True,
                "status": "healthy" if overall_healthy else "degraded",
                "components": {
                    "database": "healthy" if db_healthy else "unhealthy",
                    "ai_agent": "healthy" if ai_healthy else "unhealthy",
                    "restack": "healthy" if restack_healthy else "unhealthy"
                },
                "timestamp": datetime.utcnow().isoformat(),
                "version": "1.0.0"
            }
            
        except Exception as e:
            logger.error("System status check failed", error=str(e))
            return {
                "success": False,
                "status": "error",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }


# Initialize components (called from main.py)
def initialize_routes(db_mgr, ai_agt, restack_cli):
    """Initialize route dependencies."""
    global db_manager, ai_agent, restack_client
    db_manager = db_mgr
    ai_agent = ai_agt
    restack_client = restack_cli