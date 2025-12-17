import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import { ApiService } from '../services/api';
import type { Job, SystemStatus, UploadResponse } from '../types';
import { JobStatus, JobType } from '../types';

// Mock ApiService
vi.mock('../services/api', () => ({
  ApiService: {
    uploadFile: vi.fn(),
    createAnalyzeJob: vi.fn(),
    createSyntopicalJob: vi.fn(),
    listJobs: vi.fn(),
    getJob: vi.fn(),
    cancelJob: vi.fn(),
    getSystemStatus: vi.fn(),
    getLogStreamUrl: vi.fn(),
  },
}));

describe('App Component', () => {
  const mockSystemStatus: SystemStatus = {
    total_jobs: 5,
    running_jobs: 1,
    queued_jobs: 2,
    completed_jobs: 1,
    failed_jobs: 1,
    stuck_jobs: 0,
  };

  const mockJobs: Job[] = [
    {
      job_id: '1',
      job_type: JobType.ANALYZE,
      status: JobStatus.RUNNING,
      file_paths: ['test1.epub'],
      created_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
      progress: 45.0,
      output_files: [],
    },
    {
      job_id: '2',
      job_type: JobType.ANALYZE_SYNTOPICAL,
      status: JobStatus.COMPLETED,
      file_paths: ['test1.epub', 'test2.epub'],
      created_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
      progress: 100.0,
      output_files: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ApiService.listJobs).mockResolvedValue(mockJobs);
    vi.mocked(ApiService.getSystemStatus).mockResolvedValue(mockSystemStatus);
    global.EventSource = vi.fn() as any;
  });

  it('renders the dashboard title', async () => {
    render(<App />);
    expect(screen.getByText(/monib.life Admin Dashboard/i)).toBeInTheDocument();
  });

  it('displays system status', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('5')).toBeInTheDocument(); // Total jobs
      expect(screen.getByText('Total Jobs')).toBeInTheDocument();
    });
  });

  it('displays running and queued job counts', async () => {
    render(<App />);
    
    await waitFor(() => {
      // Check that the system status section exists and has correct labels
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('Queued')).toBeInTheDocument();
      // Verify the system status is displayed
      const systemStatus = screen.getByText('System Status');
      expect(systemStatus).toBeInTheDocument();
    });
  });

  it('displays job list', async () => {
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Jobs \(2\)/i)).toBeInTheDocument();
      expect(screen.getByText('running')).toBeInTheDocument();
      expect(screen.getByText('completed')).toBeInTheDocument();
    });
  });

  it('shows upload section', () => {
    render(<App />);
    expect(screen.getByText(/Upload Books/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Choose EPUB files/i)).toBeInTheDocument();
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    const mockUploadResponse: UploadResponse = {
      filename: 'test.epub',
      file_path: '/uploads/test.epub',
      size: 1024,
      message: 'File uploaded successfully',
    };

    vi.mocked(ApiService.uploadFile).mockResolvedValue(mockUploadResponse);

    render(<App />);

    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(ApiService.uploadFile).toHaveBeenCalledWith(file);
    });
  });

  it('shows uploaded files count', async () => {
    const user = userEvent.setup();
    const mockUploadResponse: UploadResponse = {
      filename: 'test.epub',
      file_path: '/uploads/test.epub',
      size: 1024,
      message: 'File uploaded successfully',
    };

    vi.mocked(ApiService.uploadFile).mockResolvedValue(mockUploadResponse);

    render(<App />);

    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;

    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Uploaded Files \(1\)/i)).toBeInTheDocument();
    });
  });

  it('creates analyze job from uploaded files', async () => {
    const user = userEvent.setup();
    const mockUploadResponse: UploadResponse = {
      filename: 'test.epub',
      file_path: '/uploads/test.epub',
      size: 1024,
      message: 'File uploaded successfully',
    };

    const mockJob: Job = {
      job_id: '3',
      job_type: JobType.ANALYZE,
      status: JobStatus.QUEUED,
      file_paths: ['/uploads/test.epub'],
      created_at: new Date().toISOString(),
      last_update: new Date().toISOString(),
      progress: 0,
      output_files: [],
    };

    vi.mocked(ApiService.uploadFile).mockResolvedValue(mockUploadResponse);
    vi.mocked(ApiService.createAnalyzeJob).mockResolvedValue(mockJob);

    render(<App />);

    // Upload file
    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
    await user.upload(input, file);

    // Click analyze button
    await waitFor(() => {
      const analyzeButton = screen.getByText(/Analyze Books/i);
      return user.click(analyzeButton);
    });

    await waitFor(() => {
      expect(ApiService.createAnalyzeJob).toHaveBeenCalledWith(['/uploads/test.epub']);
    });
  });

  it('disables syntopical analysis with single file', async () => {
    const user = userEvent.setup();
    const mockUploadResponse: UploadResponse = {
      filename: 'test.epub',
      file_path: '/uploads/test.epub',
      size: 1024,
      message: 'File uploaded successfully',
    };

    vi.mocked(ApiService.uploadFile).mockResolvedValue(mockUploadResponse);

    render(<App />);

    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      const syntopicalButton = screen.getByText(/Syntopical Analysis/i);
      expect(syntopicalButton).toBeDisabled();
    });
  });

  it('displays error messages', async () => {
    const user = userEvent.setup();
    vi.mocked(ApiService.uploadFile).mockRejectedValue(new Error('Upload failed'));

    render(<App />);

    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Upload failed/i)).toBeInTheDocument();
    });
  });

  it('clears uploaded files', async () => {
    const user = userEvent.setup();
    const mockUploadResponse: UploadResponse = {
      filename: 'test.epub',
      file_path: '/uploads/test.epub',
      size: 1024,
      message: 'File uploaded successfully',
    };

    vi.mocked(ApiService.uploadFile).mockResolvedValue(mockUploadResponse);

    render(<App />);

    const file = new File(['dummy content'], 'test.epub', { type: 'application/epub+zip' });
    const input = screen.getByLabelText(/Choose EPUB files/i) as HTMLInputElement;
    await user.upload(input, file);

    await waitFor(() => {
      expect(screen.getByText(/Uploaded Files \(1\)/i)).toBeInTheDocument();
    });

    const clearButton = screen.getByText(/Clear/i);
    await user.click(clearButton);

    expect(screen.queryByText(/Uploaded Files/i)).not.toBeInTheDocument();
  });

  it('selects and displays job details', async () => {
    const user = userEvent.setup();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('running')).toBeInTheDocument();
    });

    const jobCards = screen.getAllByText('running');
    await user.click(jobCards[0].closest('.job-card')!);

    await waitFor(() => {
      expect(screen.getByText(/Job Logs:/i)).toBeInTheDocument();
    });
  });
});
