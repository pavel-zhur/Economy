"""
Main FastAPI application that mounts Chainlit and serves static files.

This is the CORRECT way to serve static files with Chainlit:
1. Create a FastAPI app
2. Mount static files on the FastAPI app
3. Mount Chainlit as a sub-application

DO NOT try to access cl.app from within the Chainlit app itself.
"""

import os
import logging
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from chainlit.utils import mount_chainlit

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create the main FastAPI application
app = FastAPI(
    title="AI Database Assistant",
    description="AI-powered database management with chat interface",
    version="1.0.0"
)

# Ensure storage directory exists
storage_path = "/app/storage"
os.makedirs(storage_path, exist_ok=True)

# Mount static files for file serving
app.mount("/files", StaticFiles(directory=storage_path), name="files")
logger.info(f"Static files mounted at /files -> {storage_path}")

# Add a simple health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Database Assistant"}

# Mount the Chainlit application
mount_chainlit(app=app, target="app.py", path="/")
logger.info("Chainlit application mounted at /")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 