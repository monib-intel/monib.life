/**
 * API service for interacting with the admin backend.
 */

import { Job, SystemStatus, UploadResponse } from '../types';

const API_BASE = import.meta.env.VITE_API_URL || '';

export class ApiService {
  /**
   * Upload an EPUB file.
   */
  static async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Upload failed');
    }

    return response.json();
  }

  /**
   * Create an analyze job.
   */
  static async createAnalyzeJob(filePaths: string[]): Promise<Job> {
    const response = await fetch(`${API_BASE}/api/jobs/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_paths: filePaths }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create job');
    }

    return response.json();
  }

  /**
   * Create a syntopical analysis job.
   */
  static async createSyntopicalJob(filePaths: string[]): Promise<Job> {
    const response = await fetch(`${API_BASE}/api/jobs/analyze-syntopical`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_paths: filePaths }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create job');
    }

    return response.json();
  }

  /**
   * List all jobs.
   */
  static async listJobs(status?: string): Promise<Job[]> {
    const url = new URL(`${API_BASE}/api/jobs`);
    if (status) {
      url.searchParams.set('status', status);
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return data.jobs;
  }

  /**
   * Get a specific job.
   */
  static async getJob(jobId: string): Promise<Job> {
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch job');
    }

    return response.json();
  }

  /**
   * Cancel a job.
   */
  static async cancelJob(jobId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/jobs/${jobId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to cancel job');
    }
  }

  /**
   * Get system status.
   */
  static async getSystemStatus(): Promise<SystemStatus> {
    const response = await fetch(`${API_BASE}/api/jobs/status`);
    if (!response.ok) {
      throw new Error('Failed to fetch system status');
    }

    return response.json();
  }

  /**
   * Get log stream URL for a job.
   */
  static getLogStreamUrl(jobId: string): string {
    return `${API_BASE}/api/jobs/${jobId}/logs`;
  }
}
