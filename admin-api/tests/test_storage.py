"""
Unit tests for JobStorage.
"""

import json
import tempfile
from datetime import datetime, timedelta
from pathlib import Path

import pytest

from app.models import Job, JobStatus, JobType
from app.storage import JobStorage


@pytest.fixture
def storage_dir():
    """Create temporary storage directory."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir


@pytest.fixture
def storage(storage_dir):
    """Create JobStorage instance."""
    return JobStorage(storage_dir=storage_dir)


class TestJobCreation:
    """Test job creation in storage."""
    
    def test_create_job(self, storage):
        """Test creating a new job."""
        job = Job(
            job_id="test-123",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        
        created_job = storage.create_job(job)
        
        assert created_job.job_id == "test-123"
        assert created_job.job_type == JobType.ANALYZE
        assert created_job.status == JobStatus.QUEUED
    
    def test_create_job_persists(self, storage):
        """Test that created job is persisted to disk."""
        job = Job(
            job_id="test-456",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        
        storage.create_job(job)
        
        # Verify job is in the JSON file
        with open(storage.jobs_file, 'r') as f:
            data = json.load(f)
            assert "test-456" in data
            assert data["test-456"]["job_type"] == "analyze"


class TestJobRetrieval:
    """Test job retrieval operations."""
    
    def test_get_existing_job(self, storage):
        """Test retrieving an existing job."""
        job = Job(
            job_id="test-789",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        storage.create_job(job)
        
        retrieved_job = storage.get_job("test-789")
        
        assert retrieved_job is not None
        assert retrieved_job.job_id == "test-789"
        assert retrieved_job.job_type == JobType.ANALYZE
    
    def test_get_nonexistent_job(self, storage):
        """Test retrieving a non-existent job returns None."""
        job = storage.get_job("nonexistent-id")
        assert job is None


class TestJobUpdate:
    """Test job update operations."""
    
    def test_update_job_status(self, storage):
        """Test updating job status."""
        job = Job(
            job_id="test-update-1",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        storage.create_job(job)
        
        updated = storage.update_job("test-update-1", status=JobStatus.RUNNING.value)
        
        assert updated is not None
        assert updated.status == JobStatus.RUNNING
    
    def test_update_job_progress(self, storage):
        """Test updating job progress."""
        job = Job(
            job_id="test-update-2",
            job_type=JobType.ANALYZE,
            status=JobStatus.RUNNING,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        storage.create_job(job)
        
        updated = storage.update_job("test-update-2", progress=45.5)
        
        assert updated.progress == 45.5
    
    def test_update_job_error(self, storage):
        """Test updating job with error message."""
        job = Job(
            job_id="test-update-3",
            job_type=JobType.ANALYZE,
            status=JobStatus.RUNNING,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        storage.create_job(job)
        
        updated = storage.update_job(
            "test-update-3",
            status=JobStatus.FAILED.value,
            error="Test error message"
        )
        
        assert updated.status == JobStatus.FAILED
        assert updated.error == "Test error message"
    
    def test_update_nonexistent_job(self, storage):
        """Test updating non-existent job returns None."""
        updated = storage.update_job("nonexistent", status=JobStatus.RUNNING.value)
        assert updated is None
    
    def test_update_timestamp_is_automatic(self, storage):
        """Test that last_update is automatically updated."""
        job = Job(
            job_id="test-update-4",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now() - timedelta(hours=1),
            progress=0.0
        )
        storage.create_job(job)
        
        original_update_time = job.last_update
        updated = storage.update_job("test-update-4", progress=25.0)
        
        # last_update should be more recent
        assert updated.last_update > original_update_time


class TestJobListing:
    """Test job listing and filtering."""
    
    def test_list_all_jobs(self, storage):
        """Test listing all jobs."""
        # Create multiple jobs
        for i in range(3):
            job = Job(
                job_id=f"test-list-{i}",
                job_type=JobType.ANALYZE,
                status=JobStatus.QUEUED,
                file_paths=[f"test{i}.epub"],
                created_at=datetime.now(),
                last_update=datetime.now(),
                progress=0.0
            )
            storage.create_job(job)
        
        jobs = storage.list_jobs()
        assert len(jobs) == 3
    
    def test_list_jobs_empty(self, storage):
        """Test listing jobs when none exist."""
        jobs = storage.list_jobs()
        assert len(jobs) == 0
    
    def test_list_jobs_filtered_by_status(self, storage):
        """Test filtering jobs by status."""
        # Create jobs with different statuses
        statuses = [JobStatus.QUEUED, JobStatus.RUNNING, JobStatus.COMPLETED]
        for i, status in enumerate(statuses):
            job = Job(
                job_id=f"test-filter-{i}",
                job_type=JobType.ANALYZE,
                status=status,
                file_paths=["test.epub"],
                created_at=datetime.now(),
                last_update=datetime.now(),
                progress=0.0
            )
            storage.create_job(job)
        
        # Filter by RUNNING status
        running_jobs = storage.list_jobs(status=JobStatus.RUNNING)
        assert len(running_jobs) == 1
        assert running_jobs[0].status == JobStatus.RUNNING
    
    def test_list_jobs_with_limit(self, storage):
        """Test limiting number of jobs returned."""
        # Create 5 jobs
        for i in range(5):
            job = Job(
                job_id=f"test-limit-{i}",
                job_type=JobType.ANALYZE,
                status=JobStatus.QUEUED,
                file_paths=["test.epub"],
                created_at=datetime.now(),
                last_update=datetime.now(),
                progress=0.0
            )
            storage.create_job(job)
        
        jobs = storage.list_jobs(limit=3)
        assert len(jobs) == 3
    
    def test_list_jobs_sorted_by_created_at(self, storage):
        """Test that jobs are sorted by creation time (newest first)."""
        # Create jobs with different timestamps
        for i in range(3):
            job = Job(
                job_id=f"test-sort-{i}",
                job_type=JobType.ANALYZE,
                status=JobStatus.QUEUED,
                file_paths=["test.epub"],
                created_at=datetime.now() - timedelta(hours=i),
                last_update=datetime.now(),
                progress=0.0
            )
            storage.create_job(job)
        
        jobs = storage.list_jobs()
        # First job should be the most recent (smallest timedelta)
        assert jobs[0].job_id == "test-sort-0"
        assert jobs[-1].job_id == "test-sort-2"


class TestJobCleanup:
    """Test old job cleanup functionality."""
    
    def test_delete_old_jobs(self, storage, storage_dir):
        """Test deleting jobs older than specified days."""
        # Create old job
        old_job = Job(
            job_id="old-job",
            job_type=JobType.ANALYZE,
            status=JobStatus.COMPLETED,
            file_paths=["test.epub"],
            created_at=datetime.now() - timedelta(days=31),
            last_update=datetime.now(),
            progress=100.0
        )
        storage.create_job(old_job)
        
        # Create recent job
        recent_job = Job(
            job_id="recent-job",
            job_type=JobType.ANALYZE,
            status=JobStatus.COMPLETED,
            file_paths=["test.epub"],
            created_at=datetime.now() - timedelta(days=1),
            last_update=datetime.now(),
            progress=100.0
        )
        storage.create_job(recent_job)
        
        # Delete jobs older than 30 days
        deleted_count = storage.delete_old_jobs(days=30)
        
        assert deleted_count == 1
        assert storage.get_job("old-job") is None
        assert storage.get_job("recent-job") is not None
    
    def test_delete_old_jobs_with_log_files(self, storage, storage_dir):
        """Test that log files are cleaned up when deleting old jobs."""
        # Create log file
        log_file = Path(storage_dir) / "test.log"
        log_file.write_text("test log content")
        
        # Create old job with log file
        old_job = Job(
            job_id="old-job-with-log",
            job_type=JobType.ANALYZE,
            status=JobStatus.COMPLETED,
            file_paths=["test.epub"],
            created_at=datetime.now() - timedelta(days=31),
            last_update=datetime.now(),
            progress=100.0,
            log_file=str(log_file)
        )
        storage.create_job(old_job)
        
        # Delete old jobs
        storage.delete_old_jobs(days=30)
        
        # Log file should be deleted
        assert not log_file.exists()
    
    def test_delete_old_jobs_when_none_exist(self, storage):
        """Test deleting old jobs when none exist."""
        deleted_count = storage.delete_old_jobs(days=30)
        assert deleted_count == 0


class TestStoragePersistence:
    """Test storage persistence across instances."""
    
    def test_jobs_persist_across_instances(self, storage_dir):
        """Test that jobs persist when creating new storage instance."""
        # Create job with first instance
        storage1 = JobStorage(storage_dir=storage_dir)
        job = Job(
            job_id="persist-test",
            job_type=JobType.ANALYZE,
            status=JobStatus.QUEUED,
            file_paths=["test.epub"],
            created_at=datetime.now(),
            last_update=datetime.now(),
            progress=0.0
        )
        storage1.create_job(job)
        
        # Create new instance and retrieve job
        storage2 = JobStorage(storage_dir=storage_dir)
        retrieved = storage2.get_job("persist-test")
        
        assert retrieved is not None
        assert retrieved.job_id == "persist-test"
    
    def test_storage_file_created_if_missing(self, storage_dir):
        """Test that storage file is created if it doesn't exist."""
        storage = JobStorage(storage_dir=storage_dir)
        assert storage.jobs_file.exists()
    
    def test_corrupted_storage_file_handled(self, storage_dir):
        """Test that corrupted storage file is handled gracefully."""
        # Create corrupted file
        jobs_file = Path(storage_dir) / "jobs.json"
        jobs_file.write_text("invalid json{{{")
        
        # Should not crash, should return empty dict
        storage = JobStorage(storage_dir=storage_dir)
        jobs = storage.list_jobs()
        assert len(jobs) == 0
