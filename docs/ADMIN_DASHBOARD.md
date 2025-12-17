# Admin Dashboard - Quick Start Guide

## Overview

The admin dashboard provides a web-based interface for managing EPUB book processing with the reading-assistant and syntopical-reading-assistant services.

## Quick Start

### 1. Install Dependencies

```bash
cd /path/to/monib.life
make install
```

This will install:
- FastAPI backend dependencies (Python)
- React frontend dependencies (Node.js)
- Website dependencies (if needed)

### 2. Start the Dashboard

#### Option A: Admin Dashboard Only (Recommended for Development)

```bash
make admin-full
```

This starts:
- Admin API on http://localhost:3000
- Admin UI on http://localhost:5173

#### Option B: Full Stack (Admin + Quartz Website)

```bash
make admin-dev
```

This starts:
- Admin API on http://localhost:3000
- Admin UI on http://localhost:5173
- Quartz website on http://localhost:8080

#### Option C: Individual Components

```bash
# Just the API
make admin-server

# Just the UI
make admin-ui
```

### 3. Access the Dashboard

Open your browser to: http://localhost:5173

## Using the Dashboard

### Upload Books

1. Click "Choose EPUB files" or drag and drop EPUB files
2. Files will be uploaded to the server
3. You'll see a list of uploaded files

### Create Jobs

#### Single Book Analysis

1. Upload one or more EPUB files
2. Click "Analyze Books"
3. A reading-assistant job will be created for each book

#### Syntopical Analysis

1. Upload 2 or more EPUB files
2. Click "Syntopical Analysis"
3. A full pipeline job will be created (analyze all books + compare)

### Monitor Jobs

- Jobs appear in the middle panel with status indicators
- Click on a job to view its details and logs
- Running jobs show a progress bar
- Real-time logs stream in the bottom panel

### Job States

- **Queued** (orange) - Waiting to start
- **Running** (blue) - Currently processing
- **Completed** (green) - Finished successfully
- **Failed** (red) - Error occurred
- **Cancelled** (gray) - Cancelled by user
- **Stuck** (pink) - No progress for 30+ minutes

### Cancel Jobs

For running jobs, click the "Cancel" button on the job card.

## API Documentation

The FastAPI backend provides interactive API documentation:

http://localhost:3000/docs

## Troubleshooting

### Backend Issues

```bash
# Check if API is running
curl http://localhost:3000/health

# View API logs
cd admin-api
uvicorn app.main:app --reload --port 3000
```

### Frontend Issues

```bash
# Check if UI build works
cd admin-ui
npm run build

# View development server logs
npm run dev
```

### Job Processing Issues

Jobs use the unified CLI (`cli/unified.py`) which requires:
- reading-assistant service (submodule)
- syntopical-reading-assistant service (submodule)

Make sure submodules are initialized:

```bash
git submodule update --init --recursive
```

### Port Conflicts

If ports are already in use:

```bash
# Stop all services
make stop

# Or manually:
pkill -f uvicorn
pkill -f vite
```

## Environment Variables

### Admin API

Create `admin-api/.env`:

```bash
DATA_DIR=./data              # Job storage directory
UPLOAD_DIR=./uploads         # Uploaded files directory
JOB_TIMEOUT=1800            # Job timeout in seconds (30 min)
MAX_UPLOAD_SIZE=104857600   # Max upload size in bytes (100MB)
CLI_PATH=../cli/unified.py  # Path to unified CLI
```

### Admin UI

Create `admin-ui/.env`:

```bash
VITE_API_URL=http://localhost:3000
```

## File Structure

```
monib.life/
├── admin-api/              # FastAPI backend
│   ├── app/
│   │   ├── main.py         # Application entry point
│   │   ├── models.py       # Pydantic models
│   │   ├── jobs.py         # Job management
│   │   ├── storage.py      # Job persistence
│   │   ├── logging_config.py # Logging setup
│   │   └── routers/        # API endpoints
│   ├── data/               # Job database (created at runtime)
│   ├── logs/               # Job logs (created at runtime)
│   └── uploads/            # Uploaded files (created at runtime)
├── admin-ui/               # React frontend
│   ├── src/
│   │   ├── App.tsx         # Main application
│   │   ├── services/       # API client
│   │   └── types/          # TypeScript types
│   └── dist/               # Built files (created at runtime)
└── cli/
    └── unified.py          # CLI orchestrator
```

## Development

### Backend Development

```bash
cd admin-api

# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Format code
black app/
ruff check app/
```

### Frontend Development

```bash
cd admin-ui

# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build
```

## Production Deployment

### Build Frontend

```bash
cd admin-ui
npm run build
```

The built files will be in `admin-ui/dist/`.

### Run Backend in Production

```bash
cd admin-api

# Install production dependencies only
pip install -e .

# Run with production settings
uvicorn app.main:app --host 0.0.0.0 --port 3000
```

### Serve Frontend

Serve the `admin-ui/dist/` directory with any static file server:

```bash
# Option 1: Python
python -m http.server 5173 -d admin-ui/dist

# Option 2: Node.js serve
npx serve -s admin-ui/dist -l 5173

# Option 3: Nginx (configure nginx.conf)
```

## Security Notes

- The admin dashboard has no authentication by default
- Add authentication/authorization before exposing to the internet
- Set proper CORS origins in `admin-api/app/main.py`
- Use HTTPS in production
- Set strong environment variable values
- Limit file upload sizes appropriately

## Next Steps

1. ✅ Basic admin dashboard functionality
2. 🔄 Add authentication/authorization
3. 🔄 Add user management
4. 🔄 Add job scheduling
5. 🔄 Add batch upload support
6. 🔄 Add output file download
7. 🔄 Add job retry capability
8. 🔄 Add webhook notifications

## Support

For issues and questions:
- Check the main [README.md](../README.md)
- Review [admin-api/README.md](../admin-api/README.md)
- Review [admin-ui/README.md](../admin-ui/README.md)
- Open an issue on GitHub
