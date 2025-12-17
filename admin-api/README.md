# Admin API

FastAPI backend for the monib.life admin dashboard.

## Features

- Upload EPUB books
- Trigger reading-assistant analysis jobs
- Trigger full syntopical-reading-assistant pipeline
- Monitor real-time processing progress
- Stream job logs in real-time
- Job management (list, get status, cancel)
- Stuck process detection (30-minute timeout)

## Quick Start

```bash
# Install dependencies
cd admin-api
pip install -e .

# Start the server
uvicorn app.main:app --reload --port 3000

# Or use the Makefile from the root
cd ..
make admin-server
```

## API Endpoints

### Upload & Job Management

- `POST /api/upload` - Upload EPUB files
- `POST /api/jobs/analyze` - Trigger reading-assistant analysis
- `POST /api/jobs/analyze-syntopical` - Trigger full pipeline
- `GET /api/jobs` - List all jobs (with status filter)
- `GET /api/jobs/{job_id}` - Get job status and details
- `GET /api/jobs/{job_id}/logs` - Stream job logs (Server-Sent Events)
- `DELETE /api/jobs/{job_id}` - Cancel a running job

### Health & Status

- `GET /health` - API health check
- `GET /api/status` - System status

## Development

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black app/
ruff check app/
```

## Configuration

Environment variables:

- `ADMIN_PASSWORD` - Password for admin access (default: "admin")
- `UPLOAD_DIR` - Directory for uploaded files (default: "./uploads")
- `VAULT_DIR` - Path to vault for outputs (default: "../vault")
- `JOB_TIMEOUT` - Job timeout in seconds (default: 1800 = 30 minutes)
- `MAX_UPLOAD_SIZE` - Max file upload size in bytes (default: 100MB)

## Architecture

```
admin-api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── jobs.py              # Job management
│   ├── storage.py           # Job persistence
│   ├── logging_config.py    # Logging configuration
│   └── routers/
│       ├── __init__.py
│       ├── upload.py        # Upload endpoints
│       ├── jobs.py          # Job endpoints
│       └── health.py        # Health endpoints
├── tests/
│   ├── __init__.py
│   ├── test_upload.py
│   ├── test_jobs.py
│   └── test_integration.py
├── pyproject.toml
└── README.md
```

## Job States

- `queued` - Job is waiting to start
- `running` - Job is currently processing
- `completed` - Job finished successfully
- `failed` - Job failed with error
- `cancelled` - Job was cancelled by user
- `stuck` - Job detected as stuck (no progress for 30 minutes)

## Related

- [CLI Orchestrator](../cli/unified.py)
- [Reading Assistant](../services/reading-assistant)
- [Syntopical Reading Assistant](../services/syntopical-reading-assistant)
