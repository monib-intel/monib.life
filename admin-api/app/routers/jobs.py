"""
Job management endpoints.
"""

import asyncio
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sse_starlette.sse import EventSourceResponse

from ..jobs import JobManager
from ..logging_config import read_log_file
from ..models import Job, JobCreate, JobList, JobStatus, JobType, SystemStatus
from ..storage import JobStorage

router = APIRouter(prefix="/api/jobs", tags=["jobs"])

# Dependencies will be injected from main app
_job_manager: Optional[JobManager] = None
_storage: Optional[JobStorage] = None


def get_job_manager() -> JobManager:
    """Get job manager instance."""
    if _job_manager is None:
        raise HTTPException(status_code=500, detail="Job manager not initialized")
    return _job_manager


def get_storage() -> JobStorage:
    """Get storage instance."""
    if _storage is None:
        raise HTTPException(status_code=500, detail="Storage not initialized")
    return _storage


def init_dependencies(job_manager: JobManager, storage: JobStorage):
    """Initialize router dependencies."""
    global _job_manager, _storage
    _job_manager = job_manager
    _storage = storage


@router.post("/analyze", response_model=Job)
async def create_analyze_job(
    file_paths: List[str],
    job_manager: JobManager = Depends(get_job_manager)
):
    """Create a reading-assistant analysis job.
    
    Args:
        file_paths: List of file paths to analyze
        job_manager: Job manager instance
        
    Returns:
        Created job
    """
    if not file_paths:
        raise HTTPException(status_code=400, detail="At least one file path required")
    
    job = job_manager.create_job(
        job_type=JobType.ANALYZE,
        file_paths=file_paths
    )
    
    # Start the job asynchronously
    asyncio.create_task(job_manager.start_job(job.job_id))
    
    return job


@router.post("/analyze-syntopical", response_model=Job)
async def create_syntopical_job(
    file_paths: List[str],
    job_manager: JobManager = Depends(get_job_manager)
):
    """Create a full syntopical pipeline job.
    
    Args:
        file_paths: List of file paths to analyze
        job_manager: Job manager instance
        
    Returns:
        Created job
    """
    if not file_paths or len(file_paths) < 2:
        raise HTTPException(
            status_code=400,
            detail="At least two file paths required for syntopical analysis"
        )
    
    job = job_manager.create_job(
        job_type=JobType.ANALYZE_SYNTOPICAL,
        file_paths=file_paths
    )
    
    # Start the job asynchronously
    asyncio.create_task(job_manager.start_job(job.job_id))
    
    return job


@router.get("", response_model=JobList)
async def list_jobs(
    status: Optional[JobStatus] = Query(None, description="Filter by status"),
    limit: Optional[int] = Query(100, ge=1, le=1000, description="Max jobs to return"),
    storage: JobStorage = Depends(get_storage)
):
    """List all jobs with optional filtering.
    
    Args:
        status: Filter by job status
        limit: Maximum number of jobs to return
        storage: Storage instance
        
    Returns:
        List of jobs
    """
    jobs = storage.list_jobs(status=status, limit=limit)
    
    return JobList(
        jobs=jobs,
        total=len(jobs)
    )


@router.get("/status", response_model=SystemStatus)
async def get_system_status(storage: JobStorage = Depends(get_storage)):
    """Get system status with job counts.
    
    Args:
        storage: Storage instance
        
    Returns:
        System status
    """
    all_jobs = storage.list_jobs()
    
    return SystemStatus(
        total_jobs=len(all_jobs),
        running_jobs=len([j for j in all_jobs if j.status == JobStatus.RUNNING]),
        queued_jobs=len([j for j in all_jobs if j.status == JobStatus.QUEUED]),
        completed_jobs=len([j for j in all_jobs if j.status == JobStatus.COMPLETED]),
        failed_jobs=len([j for j in all_jobs if j.status == JobStatus.FAILED]),
        stuck_jobs=len([j for j in all_jobs if j.status == JobStatus.STUCK])
    )


@router.get("/{job_id}", response_model=Job)
async def get_job(
    job_id: str,
    storage: JobStorage = Depends(get_storage)
):
    """Get job details by ID.
    
    Args:
        job_id: Job ID
        storage: Storage instance
        
    Returns:
        Job details
        
    Raises:
        HTTPException: If job not found
    """
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job


@router.get("/{job_id}/logs")
async def stream_job_logs(
    job_id: str,
    storage: JobStorage = Depends(get_storage)
):
    """Stream job logs in real-time using Server-Sent Events.
    
    Args:
        job_id: Job ID
        storage: Storage instance
        
    Returns:
        SSE stream of log lines
        
    Raises:
        HTTPException: If job not found
    """
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if not job.log_file:
        raise HTTPException(status_code=404, detail="Job has no log file")
    
    async def event_generator():
        """Generate SSE events from log file."""
        position = 0
        
        while True:
            # Read new content from log file
            content, new_position = read_log_file(job.log_file, position)
            
            if content:
                # Send new log lines
                for line in content.splitlines():
                    if line.strip():
                        yield {"data": line}
                position = new_position
            
            # Check if job is still running
            current_job = storage.get_job(job_id)
            if current_job and current_job.status not in [JobStatus.RUNNING, JobStatus.QUEUED]:
                # Job finished, send final status and close stream
                yield {"data": f"[Job {current_job.status.value}]"}
                break
            
            # Wait before checking again
            await asyncio.sleep(1)
    
    return EventSourceResponse(event_generator())


@router.delete("/{job_id}")
async def cancel_job(
    job_id: str,
    job_manager: JobManager = Depends(get_job_manager),
    storage: JobStorage = Depends(get_storage)
):
    """Cancel a running job.
    
    Args:
        job_id: Job ID to cancel
        job_manager: Job manager instance
        storage: Storage instance
        
    Returns:
        Success message
        
    Raises:
        HTTPException: If job not found or not cancellable
    """
    job = storage.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if job.status not in [JobStatus.RUNNING, JobStatus.QUEUED]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel job in {job.status.value} status"
        )
    
    success = await job_manager.cancel_job(job_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to cancel job")
    
    return {"message": f"Job {job_id} cancelled successfully"}
