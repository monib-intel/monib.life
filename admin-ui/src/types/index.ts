/**
 * TypeScript types for the admin dashboard.
 */

export enum JobStatus {
  QUEUED = 'queued',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  STUCK = 'stuck',
}

export enum JobType {
  ANALYZE = 'analyze',
  ANALYZE_SYNTOPICAL = 'analyze_syntopical',
}

export interface Job {
  job_id: string;
  job_type: JobType;
  status: JobStatus;
  file_paths: string[];
  created_at: string;
  started_at?: string;
  completed_at?: string;
  last_update: string;
  progress: number;
  output_files: string[];
  error?: string;
  log_file?: string;
}

export interface SystemStatus {
  total_jobs: number;
  running_jobs: number;
  queued_jobs: number;
  completed_jobs: number;
  failed_jobs: number;
  stuck_jobs: number;
}

export interface UploadResponse {
  filename: string;
  file_path: string;
  size: number;
  message: string;
}
