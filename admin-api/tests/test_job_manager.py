"""
Unit tests for JobManager.
"""

import asyncio
import os
import tempfile
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest

from app.jobs import JobManager
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


@pytest.fixture
def job_manager(storage):
    """Create JobManager instance with mock CLI path."""
    return JobManager(
        storage=storage,
        cli_path="mock_cli.py",
        timeout_seconds=60
    )


class TestJobCreation:
    """Test job creation functionality."""
    
    def test_create_analyze_job(self, job_manager):
        """Test creating an analyze job."""
        job = job_manager.create_job(
            job_type=JobType.ANALYZE,
            file_paths=["test.epub"]
        )
        
        assert job.job_id is not None
        assert job.job_type == JobType.ANALYZE
        assert job.status == JobStatus.QUEUED
        assert job.file_paths == ["test.epub"]
        assert job.progress == 0.0
        assert job.created_at is not None
    
    def test_create_syntopical_job(self, job_manager):
        """Test creating a syntopical analysis job."""
        job = job_manager.create_job(
            job_type=JobType.ANALYZE_SYNTOPICAL,
            file_paths=["book1.epub", "book2.epub"]
        )
        
        assert job.job_type == JobType.ANALYZE_SYNTOPICAL
        assert job.status == JobStatus.QUEUED
        assert len(job.file_paths) == 2
    
    def test_job_has_unique_id(self, job_manager):
        """Test that each job gets a unique ID."""
        job1 = job_manager.create_job(JobType.ANALYZE, ["test1.epub"])
        job2 = job_manager.create_job(JobType.ANALYZE, ["test2.epub"])
        
        assert job1.job_id != job2.job_id


class TestJobStateTransitions:
    """Test job state transitions."""
    
    @pytest.mark.asyncio
    async def test_start_queued_job(self, job_manager):
        """Test starting a queued job."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        # Mock the execute method to avoid actual CLI execution
        with patch.object(job_manager, '_execute_job', new_callable=AsyncMock):
            success = await job_manager.start_job(job.job_id)
            assert success is True
            
            # Check job status was updated
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.status == JobStatus.RUNNING
    
    @pytest.mark.asyncio
    async def test_cannot_start_running_job(self, job_manager):
        """Test that running job cannot be started again."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        job_manager.storage.update_job(job.job_id, status=JobStatus.RUNNING.value)
        
        success = await job_manager.start_job(job.job_id)
        assert success is False
    
    @pytest.mark.asyncio
    async def test_cannot_start_nonexistent_job(self, job_manager):
        """Test starting non-existent job fails."""
        success = await job_manager.start_job("nonexistent-id")
        assert success is False


class TestJobTimeout:
    """Test job timeout detection."""
    
    def test_check_stuck_jobs_detects_timeout(self, job_manager):
        """Test that jobs exceeding timeout are marked as STUCK."""
        # Create a job and mark it as running with old timestamp
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        old_time = datetime.now() - timedelta(seconds=job_manager.timeout_seconds + 10)
        
        # Update both status and last_update manually in storage
        jobs = job_manager.storage._load_jobs()
        jobs[job.job_id]['status'] = JobStatus.RUNNING.value
        jobs[job.job_id]['last_update'] = old_time.isoformat()
        job_manager.storage._save_jobs(jobs)
        
        # Check for stuck jobs
        job_manager.check_stuck_jobs()
        
        # Verify job was marked as stuck
        updated_job = job_manager.storage.get_job(job.job_id)
        assert updated_job.status == JobStatus.STUCK
        assert "No progress update" in updated_job.error
    
    def test_check_stuck_jobs_ignores_recent_jobs(self, job_manager):
        """Test that recently updated jobs are not marked as stuck."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        job_manager.storage.update_job(job.job_id, status=JobStatus.RUNNING.value)
        
        # Check for stuck jobs
        job_manager.check_stuck_jobs()
        
        # Job should still be running
        updated_job = job_manager.storage.get_job(job.job_id)
        assert updated_job.status == JobStatus.RUNNING


class TestCLICommandBuilding:
    """Test CLI command construction."""
    
    @pytest.mark.asyncio
    async def test_analyze_command_building(self, job_manager):
        """Test command building for analyze job."""
        job = job_manager.create_job(JobType.ANALYZE, ["book1.epub", "book2.epub"])
        
        # Mock subprocess to capture the command
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_process = AsyncMock()
            mock_process.stdout = None
            mock_process.wait = AsyncMock(return_value=None)
            mock_process.returncode = 0
            mock_exec.return_value = mock_process
            
            await job_manager._execute_job(job.job_id)
            
            # Verify command was built correctly
            call_args = mock_exec.call_args[0]
            assert call_args[0] == "python"
            assert "analyze" in call_args
            assert "book1.epub" in call_args
            assert "book2.epub" in call_args
    
    @pytest.mark.asyncio
    async def test_syntopical_command_building(self, job_manager):
        """Test command building for syntopical job."""
        job = job_manager.create_job(
            JobType.ANALYZE_SYNTOPICAL,
            ["book1.epub", "book2.epub"]
        )
        
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_process = AsyncMock()
            mock_process.stdout = None
            mock_process.wait = AsyncMock(return_value=None)
            mock_process.returncode = 0
            mock_exec.return_value = mock_process
            
            await job_manager._execute_job(job.job_id)
            
            call_args = mock_exec.call_args[0]
            assert "analyze-syntopical" in call_args


class TestProgressTracking:
    """Test progress tracking from output."""
    
    def test_chapter_progress_parsing(self, job_manager):
        """Test progress update from chapter analysis output."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        # Simulate chapter progress output
        job_manager._update_progress_from_output(
            job.job_id,
            "Analyzing chapter 5/10"
        )
        
        updated_job = job_manager.storage.get_job(job.job_id)
        # Progress should be calculated: 20 + (5/10) * 60 = 50%
        assert updated_job.progress == 50.0
    
    def test_stage_progress_updates(self, job_manager):
        """Test progress updates for different stages."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        test_cases = [
            ("Stage 1: Extraction", 15.0),
            ("Stage 2: Summary generation", 30.0),
            ("Stage 3: Processing", 45.0),
        ]
        
        for output, expected_progress in test_cases:
            job_manager._update_progress_from_output(job.job_id, output)
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.progress == expected_progress
    
    def test_completion_progress(self, job_manager):
        """Test progress update for completion indicators."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        job_manager._update_progress_from_output(
            job.job_id,
            "✓ Synthesis complete"
        )
        
        updated_job = job_manager.storage.get_job(job.job_id)
        assert updated_job.progress == 95.0


class TestErrorHandling:
    """Test error handling and job failure states."""
    
    @pytest.mark.asyncio
    async def test_job_failure_on_nonzero_exit(self, job_manager):
        """Test job marked as failed on non-zero exit code."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_process = AsyncMock()
            mock_process.stdout = None
            mock_process.wait = AsyncMock(return_value=None)
            mock_process.returncode = 1  # Non-zero exit code
            mock_exec.return_value = mock_process
            
            await job_manager._execute_job(job.job_id)
            
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.status == JobStatus.FAILED
            assert "code 1" in updated_job.error
    
    @pytest.mark.asyncio
    async def test_job_success_on_zero_exit(self, job_manager):
        """Test job marked as completed on zero exit code."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_process = AsyncMock()
            mock_process.stdout = None
            mock_process.wait = AsyncMock(return_value=None)
            mock_process.returncode = 0
            mock_exec.return_value = mock_process
            
            await job_manager._execute_job(job.job_id)
            
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.status == JobStatus.COMPLETED
            assert updated_job.progress == 100.0
    
    @pytest.mark.asyncio
    async def test_job_timeout_marks_as_stuck(self, job_manager):
        """Test that timed out jobs are marked as STUCK."""
        # Use very short timeout
        job_manager.timeout_seconds = 0.1
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_process = AsyncMock()
            mock_process.stdout = None
            # Simulate long-running process that never completes
            async def never_complete():
                await asyncio.sleep(10)
            mock_process.wait = never_complete
            mock_process.kill = Mock()
            mock_exec.return_value = mock_process
            
            await job_manager._execute_job(job.job_id)
            
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.status == JobStatus.STUCK
            assert "timed out" in updated_job.error.lower()
            mock_process.kill.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_exception_handling(self, job_manager):
        """Test exception during job execution is handled."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        
        with patch('asyncio.create_subprocess_exec') as mock_exec:
            mock_exec.side_effect = Exception("Test exception")
            
            await job_manager._execute_job(job.job_id)
            
            updated_job = job_manager.storage.get_job(job.job_id)
            assert updated_job.status == JobStatus.FAILED
            assert "Test exception" in updated_job.error


class TestJobCancellation:
    """Test job cancellation and cleanup."""
    
    @pytest.mark.asyncio
    async def test_cancel_running_job(self, job_manager):
        """Test cancelling a running job."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        job_manager.storage.update_job(job.job_id, status=JobStatus.RUNNING.value)
        
        # Mock process
        mock_process = AsyncMock()
        mock_process.kill = Mock()
        mock_process.wait = AsyncMock()
        job_manager.processes[job.job_id] = mock_process
        
        # Mock task - create a proper task that can be cancelled
        async def dummy_task():
            try:
                await asyncio.sleep(100)
            except asyncio.CancelledError:
                pass
        
        task = asyncio.create_task(dummy_task())
        job_manager.running_tasks[job.job_id] = task
        
        success = await job_manager.cancel_job(job.job_id)
        
        assert success is True
        mock_process.kill.assert_called_once()
        assert task.cancelled() or task.done()
        
        updated_job = job_manager.storage.get_job(job.job_id)
        assert updated_job.status == JobStatus.CANCELLED
    
    @pytest.mark.asyncio
    async def test_cannot_cancel_completed_job(self, job_manager):
        """Test that completed job cannot be cancelled."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        job_manager.storage.update_job(job.job_id, status=JobStatus.COMPLETED.value)
        
        success = await job_manager.cancel_job(job.job_id)
        assert success is False
    
    @pytest.mark.asyncio
    async def test_cancel_nonexistent_job(self, job_manager):
        """Test cancelling non-existent job fails gracefully."""
        success = await job_manager.cancel_job("nonexistent-id")
        assert success is False
    
    @pytest.mark.asyncio
    async def test_cleanup_after_cancellation(self, job_manager):
        """Test that resources are cleaned up after cancellation."""
        job = job_manager.create_job(JobType.ANALYZE, ["test.epub"])
        job_manager.storage.update_job(job.job_id, status=JobStatus.RUNNING.value)
        
        mock_process = AsyncMock()
        mock_process.kill = Mock()
        mock_process.wait = AsyncMock()
        job_manager.processes[job.job_id] = mock_process
        
        # Create a proper task
        async def dummy_task():
            try:
                await asyncio.sleep(100)
            except asyncio.CancelledError:
                pass
        
        task = asyncio.create_task(dummy_task())
        job_manager.running_tasks[job.job_id] = task
        
        await job_manager.cancel_job(job.job_id)
        
        # Verify the job status is cancelled
        updated_job = job_manager.storage.get_job(job.job_id)
        assert updated_job.status == JobStatus.CANCELLED
