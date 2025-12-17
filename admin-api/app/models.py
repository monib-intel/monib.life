"""
Pydantic models for the admin API.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    """Job status enumeration."""
    QUEUED = "queued"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"
    STUCK = "stuck"


class JobType(str, Enum):
    """Job type enumeration."""
    ANALYZE = "analyze"
    ANALYZE_SYNTOPICAL = "analyze_syntopical"


class JobCreate(BaseModel):
    """Request model for creating a job."""
    job_type: JobType
    file_paths: List[str] = Field(..., description="List of file paths to process")
    options: Optional[dict] = Field(default_factory=dict, description="Additional job options")


class Job(BaseModel):
    """Job model."""
    job_id: str
    job_type: JobType
    status: JobStatus
    file_paths: List[str]
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    last_update: datetime
    progress: float = Field(0.0, ge=0.0, le=100.0, description="Progress percentage")
    output_files: List[str] = Field(default_factory=list)
    error: Optional[str] = None
    log_file: Optional[str] = None


class JobList(BaseModel):
    """Response model for listing jobs."""
    jobs: List[Job]
    total: int


class UploadResponse(BaseModel):
    """Response model for file upload."""
    filename: str
    file_path: str
    size: int
    message: str = "File uploaded successfully"


class HealthStatus(BaseModel):
    """Health check response."""
    status: str = "healthy"
    version: str
    timestamp: datetime


class SystemStatus(BaseModel):
    """System status response."""
    total_jobs: int
    running_jobs: int
    queued_jobs: int
    completed_jobs: int
    failed_jobs: int
    stuck_jobs: int
