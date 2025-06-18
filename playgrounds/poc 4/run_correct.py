#!/usr/bin/env python3
"""
Correct way to run the AI Database Assistant with static file serving.

This script demonstrates the PROPER approach:
1. Create a FastAPI app
2. Mount static files
3. Mount Chainlit as a sub-application
4. Run with uvicorn

Usage:
    python run_correct.py
"""

import os
import sys
import logging
from pathlib import Path

# Add current directory to Python path
sys.path.insert(0, str(Path(__file__).parent))

from main import app

if __name__ == "__main__":
    import uvicorn
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    logger.info("🚀 Starting AI Database Assistant with proper static file serving...")
    logger.info("📁 Static files will be served at: http://localhost:8000/files/")
    logger.info("🤖 Chainlit chat interface at: http://localhost:8000/")
    logger.info("❤️ Health check at: http://localhost:8000/health")
    
    # Run the application
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        reload=True,  # Enable auto-reload during development
        log_level="info"
    ) 