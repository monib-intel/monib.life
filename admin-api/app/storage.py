"""
Job storage and persistence layer.

This module handles job persistence using JSON files for simplicity.
Can be extended to use a database in the future.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from .models import Job, JobStatus


class JobStorage:
    """Simple JSON-based job storage."""
    
    def __init__(self, storage_dir: str = "./data"):
        """Initialize job storage.
        
        Args:
            storage_dir: Directory to store job data
        """
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self.jobs_file = self.storage_dir / "jobs.json"
        self._ensure_jobs_file()
    
    def _ensure_jobs_file(self):
        """Ensure jobs file exists."""
        if not self.jobs_file.exists():
            self._save_jobs({})
    
    def _load_jobs(self) -> Dict[str, dict]:
        """Load all jobs from storage."""
        try:
            with open(self.jobs_file, 'r') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}
    
    def _save_jobs(self, jobs: Dict[str, dict]):
        """Save all jobs to storage."""
        with open(self.jobs_file, 'w') as f:
            json.dump(jobs, f, indent=2, default=str)
    
    def create_job(self, job: Job) -> Job:
        """Create a new job.
        
        Args:
            job: Job to create
            
        Returns:
            Created job
        """
        jobs = self._load_jobs()
        jobs[job.job_id] = job.model_dump(mode='json')
        self._save_jobs(jobs)
        return job
    
    def get_job(self, job_id: str) -> Optional[Job]:
        """Get a job by ID.
        
        Args:
            job_id: Job ID
            
        Returns:
            Job if found, None otherwise
        """
        jobs = self._load_jobs()
        job_data = jobs.get(job_id)
        if job_data:
            return Job(**job_data)
        return None
    
    def update_job(self, job_id: str, **updates) -> Optional[Job]:
        """Update a job.
        
        Args:
            job_id: Job ID
            **updates: Fields to update
            
        Returns:
            Updated job if found, None otherwise
        """
        jobs = self._load_jobs()
        if job_id not in jobs:
            return None
        
        job_data = jobs[job_id]
        job_data.update(updates)
        job_data['last_update'] = datetime.now().isoformat()
        jobs[job_id] = job_data
        self._save_jobs(jobs)
        return Job(**job_data)
    
    def list_jobs(
        self,
        status: Optional[JobStatus] = None,
        limit: Optional[int] = None
    ) -> List[Job]:
        """List jobs with optional filtering.
        
        Args:
            status: Filter by status
            limit: Maximum number of jobs to return
            
        Returns:
            List of jobs
        """
        jobs = self._load_jobs()
        job_list = [Job(**job_data) for job_data in jobs.values()]
        
        # Filter by status
        if status:
            job_list = [job for job in job_list if job.status == status]
        
        # Sort by created_at descending (newest first)
        job_list.sort(key=lambda x: x.created_at, reverse=True)
        
        # Apply limit
        if limit:
            job_list = job_list[:limit]
        
        return job_list
    
    def delete_old_jobs(self, days: int = 30):
        """Delete jobs older than specified days.
        
        Args:
            days: Number of days to keep jobs
        """
        jobs = self._load_jobs()
        cutoff = datetime.now().timestamp() - (days * 24 * 60 * 60)
        
        jobs_to_delete = []
        for job_id, job_data in jobs.items():
            created_at = datetime.fromisoformat(job_data['created_at'])
            if created_at.timestamp() < cutoff:
                # Also clean up log files
                log_file = job_data.get('log_file')
                if log_file and os.path.exists(log_file):
                    try:
                        os.remove(log_file)
                    except OSError:
                        pass
                jobs_to_delete.append(job_id)
        
        for job_id in jobs_to_delete:
            del jobs[job_id]
        
        self._save_jobs(jobs)
        return len(jobs_to_delete)
