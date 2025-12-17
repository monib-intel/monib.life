import { useCallback, useEffect, useState } from 'react';
import { ApiService } from './services/api';
import { Job, JobStatus, SystemStatus } from './types';
import './App.css';

function App() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);

  // Fetch jobs and system status
  const fetchData = useCallback(async () => {
    try {
      const [jobsData, statusData] = await Promise.all([
        ApiService.listJobs(),
        ApiService.getSystemStatus(),
      ]);
      setJobs(jobsData);
      setSystemStatus(statusData);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  // Stream logs for selected job
  useEffect(() => {
    if (!selectedJob || !selectedJob.log_file) return;

    const eventSource = new EventSource(ApiService.getLogStreamUrl(selectedJob.job_id));
    
    eventSource.onmessage = (event) => {
      setLogs(prev => [...prev, event.data]);
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => eventSource.close();
  }, [selectedJob]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError('');
    const uploaded: string[] = [];

    try {
      for (const file of Array.from(files)) {
        const response = await ApiService.uploadFile(file);
        uploaded.push(response.file_path);
      }
      setUploadedFiles(prev => [...prev, ...uploaded]);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateJob = async (type: 'analyze' | 'syntopical') => {
    if (uploadedFiles.length === 0) {
      setError('Please upload files first');
      return;
    }

    if (type === 'syntopical' && uploadedFiles.length < 2) {
      setError('Syntopical analysis requires at least 2 files');
      return;
    }

    try {
      if (type === 'analyze') {
        await ApiService.createAnalyzeJob(uploadedFiles);
      } else {
        await ApiService.createSyntopicalJob(uploadedFiles);
      }
      setUploadedFiles([]);
      setError('');
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create job');
    }
  };

  const handleCancelJob = async (jobId: string) => {
    try {
      await ApiService.cancelJob(jobId);
      fetchData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel job');
    }
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.COMPLETED: return '#4caf50';
      case JobStatus.RUNNING: return '#2196f3';
      case JobStatus.QUEUED: return '#ff9800';
      case JobStatus.FAILED: return '#f44336';
      case JobStatus.CANCELLED: return '#9e9e9e';
      case JobStatus.STUCK: return '#e91e63';
      default: return '#757575';
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>📚 monib.life Admin Dashboard</h1>
      </header>

      {error && (
        <div className="error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="main-content">
        {/* System Status */}
        {systemStatus && (
          <div className="system-status">
            <h2>System Status</h2>
            <div className="status-grid">
              <div className="status-card">
                <div className="status-value">{systemStatus.total_jobs}</div>
                <div className="status-label">Total Jobs</div>
              </div>
              <div className="status-card">
                <div className="status-value" style={{ color: '#2196f3' }}>
                  {systemStatus.running_jobs}
                </div>
                <div className="status-label">Running</div>
              </div>
              <div className="status-card">
                <div className="status-value" style={{ color: '#ff9800' }}>
                  {systemStatus.queued_jobs}
                </div>
                <div className="status-label">Queued</div>
              </div>
              <div className="status-card">
                <div className="status-value" style={{ color: '#4caf50' }}>
                  {systemStatus.completed_jobs}
                </div>
                <div className="status-label">Completed</div>
              </div>
              <div className="status-card">
                <div className="status-value" style={{ color: '#f44336' }}>
                  {systemStatus.failed_jobs}
                </div>
                <div className="status-label">Failed</div>
              </div>
            </div>
          </div>
        )}

        <div className="content-grid">
          {/* Upload Section */}
          <div className="panel upload-panel">
            <h2>Upload Books</h2>
            <div className="upload-area">
              <input
                type="file"
                id="file-upload"
                multiple
                accept=".epub"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <label htmlFor="file-upload" className="upload-label">
                {uploading ? 'Uploading...' : 'Choose EPUB files'}
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="uploaded-files">
                <h3>Uploaded Files ({uploadedFiles.length})</h3>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="uploaded-file">
                    {file.split('/').pop()}
                  </div>
                ))}
                <div className="button-group">
                  <button onClick={() => handleCreateJob('analyze')}>
                    Analyze Books
                  </button>
                  <button 
                    onClick={() => handleCreateJob('syntopical')}
                    disabled={uploadedFiles.length < 2}
                  >
                    Syntopical Analysis
                  </button>
                  <button 
                    onClick={() => setUploadedFiles([])}
                    className="btn-secondary"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Jobs List */}
          <div className="panel jobs-panel">
            <h2>Jobs ({jobs.length})</h2>
            <div className="jobs-list">
              {jobs.length === 0 ? (
                <p className="empty-state">No jobs yet</p>
              ) : (
                jobs.map(job => (
                  <div 
                    key={job.job_id} 
                    className={`job-card ${selectedJob?.job_id === job.job_id ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedJob(job);
                      setLogs([]);
                    }}
                  >
                    <div className="job-header">
                      <span 
                        className="job-status"
                        style={{ background: getStatusColor(job.status) }}
                      >
                        {job.status}
                      </span>
                      <span className="job-type">{job.job_type}</span>
                    </div>
                    <div className="job-info">
                      <div className="job-files">
                        {job.file_paths.length} file(s)
                      </div>
                      <div className="job-time">
                        {new Date(job.created_at).toLocaleString()}
                      </div>
                    </div>
                    {job.status === JobStatus.RUNNING && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${job.progress}%` }}
                        />
                      </div>
                    )}
                    {job.status === JobStatus.RUNNING && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelJob(job.job_id);
                        }}
                        className="btn-cancel"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Logs Viewer */}
          {selectedJob && (
            <div className="panel logs-panel">
              <h2>
                Job Logs: {selectedJob.job_id.slice(0, 8)}...
                <span className="job-status-badge" style={{ background: getStatusColor(selectedJob.status) }}>
                  {selectedJob.status}
                </span>
              </h2>
              <div className="logs-viewer">
                {logs.length === 0 ? (
                  <p className="empty-state">No logs yet or waiting for updates...</p>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="log-line">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
