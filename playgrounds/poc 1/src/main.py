"""Main application entry point for Economy POC."""

import asyncio
import uvicorn
from contextlib import asynccontextmanager
from typing import Dict, Any

from fastapi import FastAPI, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import structlog

from .config import get_settings
from .database import init_db, close_db, get_db
from .agents import AgentCoordinator


# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    logger.info("Starting Economy POC application")
    
    try:
        # Initialize database
        await init_db()
        logger.info("Database initialized")
        
        # Initialize agent coordinator
        app.state.coordinator = AgentCoordinator()
        logger.info("Agent coordinator initialized")
        
    except Exception as e:
        logger.error("Failed to initialize application", error=str(e))
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down Economy POC application")
    try:
        await close_db()
        logger.info("Database connection closed")
    except Exception as e:
        logger.error("Error during shutdown", error=str(e))


# Create FastAPI app
settings = get_settings()
app = FastAPI(
    title="Economy POC - AI Financial Assistant",
    description="POC Stack 1: LangGraph Classic - AI-managed PostgreSQL for financial planning",
    version="0.1.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Economy POC - AI Financial Assistant",
        "version": "0.1.0",
        "stack": "LangGraph Classic",
        "status": "operational"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    try:
        # Check database connection
        from .database import engine
        async with engine.begin() as conn:
            await conn.execute("SELECT 1")
        
        # Check agent coordinator
        coordinator_status = await app.state.coordinator.get_workflow_status()
        
        return {
            "status": "healthy",
            "database": "connected",
            "agents": coordinator_status.get("status", "unknown"),
            "timestamp": coordinator_status.get("timestamp")
        }
        
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": structlog.processors.TimeStamper()._make_stamper()()
            }
        )


@app.post("/api/query")
async def process_query(request: Dict[str, Any]):
    """Process a natural language query."""
    
    try:
        user_request = request.get("query", "").strip()
        if not user_request:
            raise HTTPException(status_code=400, detail="Query is required")
        
        context = request.get("context", {})
        dry_run = request.get("dry_run", False)
        
        logger.info("Processing query", query=user_request, dry_run=dry_run)
        
        # Process through agent coordinator
        result = await app.state.coordinator.process_request(
            user_request=user_request,
            context=context,
            dry_run=dry_run
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Query processing failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/schema")
async def get_schema_info():
    """Get current database schema information."""
    
    try:
        schema_info = await app.state.coordinator.database_agent.get_schema_info()
        return schema_info
        
    except Exception as e:
        logger.error("Failed to get schema info", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get schema info: {str(e)}")


@app.get("/api/schema/history")
async def get_schema_history(limit: int = 50):
    """Get schema change history."""
    
    try:
        history = await app.state.coordinator.schema_agent.get_schema_change_history(limit=limit)
        return history
        
    except Exception as e:
        logger.error("Failed to get schema history", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get schema history: {str(e)}")


@app.get("/api/metrics")
async def get_metrics():
    """Get application metrics."""
    
    try:
        db_metrics = await app.state.coordinator.database_agent.get_metrics()
        workflow_status = await app.state.coordinator.get_workflow_status()
        
        return {
            "database": db_metrics,
            "workflow": workflow_status,
            "timestamp": db_metrics.get("timestamp")
        }
        
    except Exception as e:
        logger.error("Failed to get metrics", error=str(e))
        raise HTTPException(status_code=500, detail=f"Failed to get metrics: {str(e)}")


@app.post("/api/validate")
async def validate_sql(request: Dict[str, Any]):
    """Validate a SQL query without executing it."""
    
    try:
        sql_query = request.get("sql", "").strip()
        if not sql_query:
            raise HTTPException(status_code=400, detail="SQL query is required")
        
        result = await app.state.coordinator.database_agent.validate_query(sql_query)
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("SQL validation failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"SQL validation failed: {str(e)}")


def main():
    """Main entry point."""
    
    logger.info("Starting Economy POC server", port=8000, host="0.0.0.0")
    
    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level=settings.log_level.lower(),
        access_log=True,
    )


if __name__ == "__main__":
    main()