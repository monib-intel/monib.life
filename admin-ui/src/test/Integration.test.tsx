import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { ApiService } from '../services/api';
import type { Job, SystemStatus } from '../types';
import { JobStatus, JobType } from '../types';

// Mock ApiService
vi.mock('../services/api');

describe('Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.EventSource = vi.fn() as any;
  });

  describe('Complete Workflow: Upload → Create Job → Monitor', () => {
    it('completes full workflow successfully', async () => {
      const user = userEvent.setup();
      
      const mockSystemStatus: SystemStatus = {
        total_jobs: 1,
        running_jobs: 1,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      };

      const mockJob: Job = {
        job_id: 'workflow-job-1',
        job_type: JobType.ANALYZE,
        status: JobStatus.QUEUED,
        file_paths: ['/uploads/workflow-test.epub'],
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        progress: 0,
        output_files: [],
      };

      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue(mockSystemStatus);
      vi.mocked(ApiService.uploadFile).mockResolvedValue({
        filename: 'workflow-test.epub',
        file_path: '/uploads/workflow-test.epub',
        size: 2048,
        message: 'File uploaded successfully',
      });
      vi.mocked(ApiService.createAnalyzeJob).mockResolvedValue(mockJob);

      render(<App />);

      // Step 1: Upload file
      const file = new File(['epub content'], 'workflow-test.epub', { type: 'application/epub+zip' });
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Uploaded Files \(1\)/i)).toBeInTheDocument();
      });

      // Step 2: Create analyze job
      const analyzeButton = screen.getByText(/Analyze Books/i);
      await user.click(analyzeButton);

      await waitFor(() => {
        expect(ApiService.createAnalyzeJob).toHaveBeenCalledWith(['/uploads/workflow-test.epub']);
      });

      // Step 3: Verify uploaded files are cleared
      expect(screen.queryByText(/Uploaded Files/i)).not.toBeInTheDocument();
    });

    it('handles syntopical workflow with multiple files', async () => {
      const user = userEvent.setup();
      
      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 0,
        running_jobs: 0,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });

      vi.mocked(ApiService.uploadFile)
        .mockResolvedValueOnce({
          filename: 'book1.epub',
          file_path: '/uploads/book1.epub',
          size: 1024,
          message: 'File uploaded successfully',
        })
        .mockResolvedValueOnce({
          filename: 'book2.epub',
          file_path: '/uploads/book2.epub',
          size: 2048,
          message: 'File uploaded successfully',
        });

      vi.mocked(ApiService.createSyntopicalJob).mockResolvedValue({
        job_id: 'syntopical-job-1',
        job_type: JobType.ANALYZE_SYNTOPICAL,
        status: JobStatus.QUEUED,
        file_paths: ['/uploads/book1.epub', '/uploads/book2.epub'],
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        progress: 0,
        output_files: [],
      });

      render(<App />);

      // Upload first file
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      const file1 = new File(['content1'], 'book1.epub', { type: 'application/epub+zip' });
      await user.upload(input, file1);

      // Upload second file
      const file2 = new File(['content2'], 'book2.epub', { type: 'application/epub+zip' });
      await user.upload(input, file2);

      await waitFor(() => {
        expect(screen.getByText(/Uploaded Files \(2\)/i)).toBeInTheDocument();
      });

      // Syntopical button should be enabled
      const syntopicalButton = screen.getByText(/Syntopical Analysis/i);
      expect(syntopicalButton).not.toBeDisabled();

      // Create syntopical job
      await user.click(syntopicalButton);

      await waitFor(() => {
        expect(ApiService.createSyntopicalJob).toHaveBeenCalledWith([
          '/uploads/book1.epub',
          '/uploads/book2.epub',
        ]);
      });
    });
  });

  describe('Multiple Concurrent Jobs', () => {
    it('displays multiple jobs with different statuses', async () => {
      const mockJobs: Job[] = [
        {
          job_id: '1',
          job_type: JobType.ANALYZE,
          status: JobStatus.RUNNING,
          file_paths: ['running.epub'],
          created_at: new Date().toISOString(),
          last_update: new Date().toISOString(),
          progress: 50,
          output_files: [],
        },
        {
          job_id: '2',
          job_type: JobType.ANALYZE,
          status: JobStatus.QUEUED,
          file_paths: ['queued.epub'],
          created_at: new Date().toISOString(),
          last_update: new Date().toISOString(),
          progress: 0,
          output_files: [],
        },
        {
          job_id: '3',
          job_type: JobType.ANALYZE_SYNTOPICAL,
          status: JobStatus.COMPLETED,
          file_paths: ['book1.epub', 'book2.epub'],
          created_at: new Date().toISOString(),
          last_update: new Date().toISOString(),
          progress: 100,
          output_files: [],
        },
      ];

      vi.mocked(ApiService.listJobs).mockResolvedValue(mockJobs);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 3,
        running_jobs: 1,
        queued_jobs: 1,
        completed_jobs: 1,
        failed_jobs: 0,
        stuck_jobs: 0,
      });

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/Jobs \(3\)/i)).toBeInTheDocument();
        expect(screen.getByText('running')).toBeInTheDocument();
        expect(screen.getByText('queued')).toBeInTheDocument();
        expect(screen.getByText('completed')).toBeInTheDocument();
      });
    });
  });

  describe('Job Cancellation', () => {
    it('cancels a running job', async () => {
      const user = userEvent.setup();
      
      const mockJob: Job = {
        job_id: 'cancel-job-1',
        job_type: JobType.ANALYZE,
        status: JobStatus.RUNNING,
        file_paths: ['test.epub'],
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        progress: 25,
        output_files: [],
      };

      vi.mocked(ApiService.listJobs).mockResolvedValue([mockJob]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 1,
        running_jobs: 1,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });
      vi.mocked(ApiService.cancelJob).mockResolvedValue(undefined);

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText('Cancel')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      await waitFor(() => {
        expect(ApiService.cancelJob).toHaveBeenCalledWith('cancel-job-1');
      });
    });
  });

  describe('Error Handling', () => {
    it('displays error when upload fails', async () => {
      const user = userEvent.setup();
      
      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 0,
        running_jobs: 0,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });
      vi.mocked(ApiService.uploadFile).mockRejectedValue(new Error('Upload failed: File too large'));

      render(<App />);

      const file = new File(['content'], 'large.epub', { type: 'application/epub+zip' });
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Upload failed: File too large/i)).toBeInTheDocument();
      });
    });

    it('dismisses error message', async () => {
      const user = userEvent.setup();
      
      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 0,
        running_jobs: 0,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });
      vi.mocked(ApiService.uploadFile).mockRejectedValue(new Error('Test error'));

      render(<App />);

      const file = new File(['content'], 'test.epub', { type: 'application/epub+zip' });
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText(/Test error/i)).toBeInTheDocument();
      });

      const dismissButton = screen.getByRole('button', { name: '×' });
      await user.click(dismissButton);

      expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    });

    it('handles job creation failure', async () => {
      const user = userEvent.setup();
      
      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 0,
        running_jobs: 0,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });
      vi.mocked(ApiService.uploadFile).mockResolvedValue({
        filename: 'test.epub',
        file_path: '/uploads/test.epub',
        size: 1024,
        message: 'File uploaded successfully',
      });
      vi.mocked(ApiService.createAnalyzeJob).mockRejectedValue(new Error('Job creation failed'));

      render(<App />);

      const file = new File(['content'], 'test.epub', { type: 'application/epub+zip' });
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      await user.upload(input, file);

      await waitFor(() => {
        const analyzeButton = screen.getByText(/Analyze Books/i);
        return user.click(analyzeButton);
      });

      await waitFor(() => {
        expect(screen.getByText(/Job creation failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('UI State Management', () => {
    it('shows uploading state during file upload', async () => {
      const user = userEvent.setup();
      
      vi.mocked(ApiService.listJobs).mockResolvedValue([]);
      vi.mocked(ApiService.getSystemStatus).mockResolvedValue({
        total_jobs: 0,
        running_jobs: 0,
        queued_jobs: 0,
        completed_jobs: 0,
        failed_jobs: 0,
        stuck_jobs: 0,
      });

      // Delay the upload response
      vi.mocked(ApiService.uploadFile).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          filename: 'test.epub',
          file_path: '/uploads/test.epub',
          size: 1024,
          message: 'File uploaded successfully',
        }), 100))
      );

      render(<App />);

      const file = new File(['content'], 'test.epub', { type: 'application/epub+zip' });
      const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
      await user.upload(input, file);

      // Should eventually show uploaded file
      await waitFor(() => {
        expect(screen.getByText(/Uploaded Files/i)).toBeInTheDocument();
      }, { timeout: 2000 });
    });
  });
});
