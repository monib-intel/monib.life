import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiService } from '../services/api';
import type { Job, SystemStatus, UploadResponse } from '../types';
import { JobStatus, JobType } from '../types';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch as any;

describe('ApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('uploadFile', () => {
    it('uploads a file successfully', async () => {
      const mockResponse: UploadResponse = {
        filename: 'test.epub',
        file_path: '/uploads/test.epub',
        size: 1024,
        message: 'File uploaded successfully',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const file = new File(['content'], 'test.epub', { type: 'application/epub+zip' });
      const result = await ApiService.uploadFile(file);

      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('throws error on failed upload', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'Invalid file type' }),
      } as Response);

      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await expect(ApiService.uploadFile(file)).rejects.toThrow('Invalid file type');
    });
  });

  describe('createAnalyzeJob', () => {
    it('creates an analyze job successfully', async () => {
      const mockJob: Job = {
        job_id: '123',
        job_type: JobType.ANALYZE,
        status: JobStatus.QUEUED,
        file_paths: ['test.epub'],
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        progress: 0,
        output_files: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJob,
      } as Response);

      const result = await ApiService.createAnalyzeJob(['test.epub']);

      expect(result).toEqual(mockJob);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/jobs/analyze',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_paths: ['test.epub'] }),
        })
      );
    });

    it('throws error on failed job creation', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ detail: 'No files provided' }),
      } as Response);

      await expect(ApiService.createAnalyzeJob([])).rejects.toThrow('No files provided');
    });
  });

  describe('createSyntopicalJob', () => {
    it('creates a syntopical job successfully', async () => {
      const mockJob: Job = {
        job_id: '456',
        job_type: JobType.ANALYZE_SYNTOPICAL,
        status: JobStatus.QUEUED,
        file_paths: ['test1.epub', 'test2.epub'],
        created_at: new Date().toISOString(),
        last_update: new Date().toISOString(),
        progress: 0,
        output_files: [],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockJob,
      } as Response);

      const result = await ApiService.createSyntopicalJob(['test1.epub', 'test2.epub']);

      expect(result).toEqual(mockJob);
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/jobs/analyze-syntopical',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ file_paths: ['test1.epub', 'test2.epub'] }),
        })
      );
    });
  });

  describe('getSystemStatus', () => {
    it('gets system status successfully', async () => {
      const mockStatus: SystemStatus = {
        total_jobs: 10,
        running_jobs: 2,
        queued_jobs: 3,
        completed_jobs: 4,
        failed_jobs: 1,
        stuck_jobs: 0,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockStatus,
      } as Response);

      const result = await ApiService.getSystemStatus();

      expect(result).toEqual(mockStatus);
      expect(mockFetch).toHaveBeenCalledWith('/api/jobs/status');
    });
  });

  describe('getLogStreamUrl', () => {
    it('returns correct log stream URL', () => {
      const url = ApiService.getLogStreamUrl('123');
      expect(url).toBe('/api/jobs/123/logs');
    });
  });
});
