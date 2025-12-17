"""
Job management and execution.

This module handles job creation, execution, monitoring, and cancellation.
"""

import asyncio
import os
import subprocess
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Optional

from .logging_config import setup_job_logger, get_job_logger
from .models import Job, JobStatus, JobType
from .storage import JobStorage


class JobManager:
    """Manages job execution and monitoring."""
    
    def __init__(
        self,
        storage: JobStorage,
        cli_path: str = "../cli/unified.py",
        timeout_seconds: int = 1800  # 30 minutes
    ):
        """Initialize job manager.
        
        Args:
            storage: Job storage instance
            cli_path: Path to unified CLI
            timeout_seconds: Job timeout in seconds (default 30 minutes)
        """
        self.storage = storage
        self.cli_path = Path(cli_path)
        self.timeout_seconds = timeout_seconds
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.processes: Dict[str, subprocess.Popen] = {}
        
    def create_job(
        self,
        job_type: JobType,
        file_paths: List[str],
        options: Optional[dict] = None
    ) -> Job:
        """Create a new job.
        
        Args:
            job_type: Type of job to create
            file_paths: List of file paths to process
            options: Additional job options
            
        Returns:
            Created job
        """
        job_id = str(uuid.uuid4())
        job = Job(
            job_id=job_id,
            job_type=job_type,
            status=JobStatus.QUEUED,
            file_paths=file_paths,
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        
        return self.storage.create_job(job)
    
    async def start_job(self, job_id: str) -> bool:
        """Start executing a job.
        
        Args:
            job_id: Job ID to start
            
        Returns:
            True if started successfully, False otherwise
        """
        job = self.storage.get_job(job_id)
        if not job or job.status != JobStatus.QUEUED:
            return False
        
        # Update job status
        self.storage.update_job(
            job_id,
            status=JobStatus.RUNNING.value,
            started_at=datetime.now().isoformat()
        )
        
        # Start async task
        task = asyncio.create_task(self._execute_job(job_id))
        self.running_tasks[job_id] = task
        
        return True
    
    async def _execute_job(self, job_id: str):
        """Execute a job asynchronously.
        
        Args:
            job_id: Job ID to execute
        """
        job = self.storage.get_job(job_id)
        if not job:
            return
        
        # Set up logging
        logger, log_file = setup_job_logger(job_id)
        self.storage.update_job(job_id, log_file=log_file)
        
        logger.info(f"Starting job {job_id} - Type: {job.job_type}")
        logger.info(f"Files: {job.file_paths}")
        
        try:
            # Build command based on job type
            if job.job_type == JobType.ANALYZE:
                cmd = ["python", str(self.cli_path), "analyze"] + job.file_paths
            elif job.job_type == JobType.ANALYZE_SYNTOPICAL:
                cmd = ["python", str(self.cli_path), "analyze-syntopical"] + job.file_paths
            else:
                raise ValueError(f"Unknown job type: {job.job_type}")
            
            logger.info(f"Executing command: {' '.join(cmd)}")
            
            # Execute with timeout and capture output
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.STDOUT,
                cwd=Path(__file__).parent.parent.parent
            )
            
            self.processes[job_id] = process
            
            # Stream output to log
            async def stream_output():
                if process.stdout:
                    async for line in process.stdout:
                        logger.info(line.decode().strip())
                        # Update progress based on output
                        self._update_progress_from_output(job_id, line.decode())
            
            # Wait for completion with timeout
            try:
                output_task = asyncio.create_task(stream_output())
                await asyncio.wait_for(
                    asyncio.gather(process.wait(), output_task),
                    timeout=self.timeout_seconds
                )
                
                # Check exit code
                if process.returncode == 0:
                    logger.info(f"Job {job_id} completed successfully")
                    self.storage.update_job(
                        job_id,
                        status=JobStatus.COMPLETED.value,
                        completed_at=datetime.now().isoformat(),
                        progress=100.0
                    )
                else:
                    logger.error(f"Job {job_id} failed with exit code {process.returncode}")
                    self.storage.update_job(
                        job_id,
                        status=JobStatus.FAILED.value,
                        completed_at=datetime.now().isoformat(),
                        error=f"Process exited with code {process.returncode}"
                    )
                    
            except asyncio.TimeoutError:
                logger.error(f"Job {job_id} timed out after {self.timeout_seconds} seconds")
                process.kill()
                await process.wait()
                self.storage.update_job(
                    job_id,
                    status=JobStatus.STUCK.value,
                    completed_at=datetime.now().isoformat(),
                    error=f"Job timed out after {self.timeout_seconds} seconds"
                )
                
        except Exception as e:
            logger.exception(f"Job {job_id} failed with exception: {e}")
            self.storage.update_job(
                job_id,
                status=JobStatus.FAILED.value,
                completed_at=datetime.now().isoformat(),
                error=str(e)
            )
        finally:
            # Cleanup
            if job_id in self.processes:
                del self.processes[job_id]
            if job_id in self.running_tasks:
                del self.running_tasks[job_id]
    
    def _update_progress_from_output(self, job_id: str, output: str):
        """Update job progress based on output parsing.
        
        Args:
            job_id: Job ID
            output: Output line from process
        """
        output_lower = output.lower()
        
        # Look for specific progress indicators from reading-assistant
        # Chapter analysis progress (e.g., "Analyzing chapter 3/18")
        if "analyzing chapter" in output_lower or "processing chapter" in output_lower:
            import re
            match = re.search(r'chapter\s+(\d+)[/\s]+(\d+)', output_lower)
            if match:
                current = int(match.group(1))
                total = int(match.group(2))
                # Map chapter progress to 20-80% range
                progress = 20.0 + (current / total) * 60.0
                self.storage.update_job(job_id, progress=progress)
                return
        
        # Stage-based progress
        if "stage 1" in output_lower or "extraction" in output_lower:
            self.storage.update_job(job_id, progress=15.0)
        elif "stage 2" in output_lower or "summary" in output_lower:
            self.storage.update_job(job_id, progress=30.0)
        elif "stage 3" in output_lower:
            self.storage.update_job(job_id, progress=45.0)
        elif "stage 4" in output_lower:
            self.storage.update_job(job_id, progress=60.0)
        elif "stage 5" in output_lower:
            self.storage.update_job(job_id, progress=70.0)
        elif "stage 6" in output_lower:
            self.storage.update_job(job_id, progress=80.0)
        elif "stage 7" in output_lower:
            self.storage.update_job(job_id, progress=85.0)
        elif "stage 8" in output_lower:
            self.storage.update_job(job_id, progress=90.0)
        
        # API call status
        elif "api call" in output_lower or "calling api" in output_lower:
            job = self.storage.get_job(job_id)
            if job and job.progress < 40:
                self.storage.update_job(job_id, progress=min(job.progress + 5, 40.0))
        
        # Completion indicators
        elif "complete" in output_lower and "✓" in output:
            self.storage.update_job(job_id, progress=95.0)
        elif "synthesis complete" in output_lower:
            self.storage.update_job(job_id, progress=95.0)
        
        # General progress indicators
        elif "processing" in output_lower or "analyzing" in output_lower:
            job = self.storage.get_job(job_id)
            if job and job.progress < 30:
                self.storage.update_job(job_id, progress=30.0)
        elif "starting" in output_lower or "running" in output_lower:
            job = self.storage.get_job(job_id)
            if job and job.progress < 10:
                self.storage.update_job(job_id, progress=10.0)
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a running job.
        
        Args:
            job_id: Job ID to cancel
            
        Returns:
            True if cancelled, False otherwise
        """
        job = self.storage.get_job(job_id)
        if not job or job.status != JobStatus.RUNNING:
            return False
        
        # Kill the process
        if job_id in self.processes:
            process = self.processes[job_id]
            process.kill()
            await process.wait()
        
        # Cancel the task
        if job_id in self.running_tasks:
            self.running_tasks[job_id].cancel()
            try:
                await self.running_tasks[job_id]
            except asyncio.CancelledError:
                pass
        
        # Update job status
        self.storage.update_job(
            job_id,
            status=JobStatus.CANCELLED.value,
            completed_at=datetime.now().isoformat()
        )
        
        logger = get_job_logger(job_id)
        if logger:
            logger.info(f"Job {job_id} was cancelled")
        
        return True
    
    def check_stuck_jobs(self):
        """Check for stuck jobs and mark them."""
        running_jobs = self.storage.list_jobs(status=JobStatus.RUNNING)
        
        for job in running_jobs:
            # Check if job hasn't been updated in timeout period
            time_since_update = datetime.now() - job.last_update
            if time_since_update > timedelta(seconds=self.timeout_seconds):
                self.storage.update_job(
                    job.job_id,
                    status=JobStatus.STUCK.value,
                    error=f"No progress update for {self.timeout_seconds} seconds"
                )
