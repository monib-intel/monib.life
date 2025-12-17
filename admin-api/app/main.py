"""
Main FastAPI application for admin API.
"""

import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .jobs import JobManager
from .routers import health, jobs, upload
from .routers.jobs import init_dependencies
from .storage import JobStorage


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager.
    
    Sets up and tears down resources.
    """
    # Startup
    storage = JobStorage(storage_dir=os.getenv("DATA_DIR", "./data"))
    job_manager = JobManager(
        storage=storage,
        cli_path=os.getenv("CLI_PATH", "../cli/unified.py"),
        timeout_seconds=int(os.getenv("JOB_TIMEOUT", "1800"))
    )
    
    # Initialize router dependencies
    init_dependencies(job_manager, storage)
    
    # Store in app state
    app.state.storage = storage
    app.state.job_manager = job_manager
    
    yield
    
    # Shutdown - cleanup if needed
    pass


# Create FastAPI app
app = FastAPI(
    title="monib.life Admin API",
    description="Admin API for managing reading assistant jobs and uploads",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware - configure based on your needs
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router)
app.include_router(upload.router)
app.include_router(jobs.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "monib.life Admin API",
        "version": "0.1.0",
        "docs": "/docs",
        "health": "/health"
    }
