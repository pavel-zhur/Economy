#!/usr/bin/env python3
"""
Main entry point for the AI Financial Planning System.
This file handles application initialization and startup.
"""

import asyncio
import logging
import sys
import os
from pathlib import Path

# Add the app directory to Python path
app_dir = Path(__file__).parent
sys.path.insert(0, str(app_dir))

from config import settings
from database import DatabaseManager


def setup_logging():
    """Setup application logging."""
    logging.basicConfig(
        level=getattr(logging, settings.log_level),
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler('logs/app.log', mode='a')
        ]
    )
    
    # Create logs directory if it doesn't exist
    os.makedirs('logs', exist_ok=True)


async def initialize_system():
    """Initialize the system components."""
    logger = logging.getLogger(__name__)
    
    try:
        logger.info("Starting AI Financial Planning System initialization...")
        
        # Check required environment variables
        if not settings.openai_api_key:
            logger.warning("OPENAI_API_KEY not set - AI features will not work")
        
        # Initialize database
        logger.info("Initializing database...")
        DatabaseManager.init_database()
        logger.info("Database initialized successfully")
        
        # Test AI agent initialization (optional)
        try:
            from ai_agents.graph_orchestrator import FinancialOrchestrator
            orchestrator = FinancialOrchestrator()
            logger.info("AI orchestrator initialized successfully")
        except Exception as e:
            logger.warning(f"AI orchestrator initialization failed: {e}")
            logger.warning("Some AI features may not work properly")
        
        logger.info("System initialization completed successfully")
        
    except Exception as e:
        logger.error(f"System initialization failed: {e}")
        raise


def main():
    """Main application entry point."""
    setup_logging()
    logger = logging.getLogger(__name__)
    
    logger.info(f"Starting {settings.app_name}")
    logger.info(f"Debug mode: {settings.debug}")
    logger.info(f"Database URL: {settings.database_url}")
    
    try:
        # Initialize system
        asyncio.run(initialize_system())
        
        # Import and start Chainlit app
        logger.info("Starting Chainlit web interface...")
        
        import chainlit as cl
        import chainlit_app  # Import the chainlit handlers module
        
        # Run Chainlit app
        cl.run(
            host=settings.chainlit_host,
            port=settings.chainlit_port,
            debug=settings.debug
        )
        
    except KeyboardInterrupt:
        logger.info("Application stopped by user")
    except Exception as e:
        logger.error(f"Application startup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()