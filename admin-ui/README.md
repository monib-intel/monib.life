# Admin UI

React-based admin dashboard for monib.life reading assistant.

## Features

- Upload EPUB books with drag-and-drop
- View job queue with real-time updates
- Monitor job progress with live progress bars
- View job logs with real-time streaming
- Filter and search logs
- Cancel running jobs
- View system status

## Quick Start

```bash
# Install dependencies
cd admin-ui
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Development

The UI runs on port 5173 by default (Vite dev server).

The API backend should be running on port 3000.

## Configuration

Create a `.env` file:

```
VITE_API_URL=http://localhost:3000
```

## Structure

```
admin-ui/
├── src/
│   ├── components/       # React components
│   ├── services/         # API service layer
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Components

- `FileUpload` - Drag-and-drop file upload
- `JobList` - List of all jobs with filtering
- `JobDetails` - Individual job status and progress
- `LogViewer` - Real-time log streaming with filtering
- `SystemStatus` - Overall system status dashboard

## Related

- [Admin API](../admin-api)
- [CLI Orchestrator](../cli/unified.py)
