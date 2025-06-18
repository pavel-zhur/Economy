import asyncio
import structlog
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import Dict, Any

from config import settings
from database import DatabaseManager
from restack_client import RestackClient
from ai_agent import AIAgent
from monitoring import setup_monitoring
from api.routes import router as api_router, initialize_routes

# Setup structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer()
    ],
    wrapper_class=structlog.stdlib.BoundLogger,
    logger_factory=structlog.stdlib.LoggerFactory(),
    cache_logger_on_first_use=True,
)

logger = structlog.get_logger()

# Global components
db_manager: DatabaseManager = None
restack_client: RestackClient = None
ai_agent: AIAgent = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    global db_manager, restack_client, ai_agent
    
    try:
        logger.info("Starting POC 3 AI Service")
        
        # Initialize database manager
        db_manager = DatabaseManager(settings.database_url)
        await db_manager.initialize()
        logger.info("Database manager initialized")
        
        # Initialize Restack client
        restack_client = RestackClient(settings.restack_engine_address)
        await restack_client.connect()
        logger.info("Restack client connected")
        
        # Initialize AI agent
        ai_agent = AIAgent(
            db_manager=db_manager,
            restack_client=restack_client,
            openai_api_key=settings.openai_api_key,
            langfuse_public_key=settings.langfuse_public_key,
            langfuse_secret_key=settings.langfuse_secret_key,
            langfuse_host=settings.langfuse_host
        )
        await ai_agent.initialize()
        logger.info("AI agent initialized")
        
        # Initialize API routes with components
        initialize_routes(db_manager, ai_agent, restack_client)
        logger.info("API routes initialized")
        
        # Setup monitoring
        if settings.enable_metrics:
            setup_monitoring()
            logger.info("Monitoring enabled")
        
        yield
        
    except Exception as e:
        logger.error("Failed to start application", error=str(e))
        raise
    finally:
        logger.info("Shutting down POC 3 AI Service")
        
        # Cleanup
        if ai_agent:
            await ai_agent.cleanup()
        if restack_client:
            await restack_client.disconnect()
        if db_manager:
            await db_manager.close()


# Create FastAPI application
app = FastAPI(
    title="POC 3 AI Service",
    description="AI-powered PostgreSQL management with Restack workflows",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health_check() -> Dict[str, Any]:
    """Health check endpoint."""
    try:
        # Check database connection
        db_healthy = await db_manager.health_check() if db_manager else False
        
        # Check Restack connection
        restack_healthy = await restack_client.health_check() if restack_client else False
        
        # Check AI agent
        ai_healthy = ai_agent.is_healthy() if ai_agent else False
        
        status = "healthy" if all([db_healthy, restack_healthy, ai_healthy]) else "unhealthy"
        
        return {
            "status": status,
            "components": {
                "database": "healthy" if db_healthy else "unhealthy",
                "restack": "healthy" if restack_healthy else "unhealthy", 
                "ai_agent": "healthy" if ai_healthy else "unhealthy"
            },
            "version": "1.0.0"
        }
    except Exception as e:
        logger.error("Health check failed", error=str(e))
        raise HTTPException(status_code=500, detail="Health check failed")


@app.get("/")
async def root() -> Dict[str, str]:
    """Root endpoint."""
    return {
        "service": "POC 3 AI Service",
        "version": "1.0.0",
        "description": "AI-powered PostgreSQL management with Restack workflows"
    }


if __name__ == "__main__":
    import uvicorn
    
    logger.info("Starting POC 3 AI Service", host=settings.host, port=settings.port)
    
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info"
    )