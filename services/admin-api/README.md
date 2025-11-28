# Admin API

Backend API for the admin interface.

## Overview

The Admin API provides endpoints for interacting with the AI assistants and managing content.

## Status

**Not yet implemented.** This is a placeholder for future development.

## Planned Features

- Authentication endpoint
- File upload for reading assistant
- Resume generation endpoint
- Draft management

## Planned Endpoints

### Authentication

```
POST /api/admin/login
POST /api/admin/logout
GET  /api/admin/session
```

### Reading Assistant

```
POST /api/admin/upload-book
  - Accepts: multipart/form-data with EPUB file
  - Returns: Job ID

GET  /api/admin/job/:id
  - Returns: Job status
```

### Resume Assistant

```
POST /api/admin/generate-resume
  - Accepts: JSON with job description
  - Returns: PDF stream
```

### Content Management

```
GET  /api/admin/drafts
  - Returns: List of draft files

POST /api/admin/publish/:path
  - Removes draft status from file

DELETE /api/admin/draft/:path
  - Deletes draft file
```

## Architecture

Planned implementation using:
- Node.js with Express or Fastify
- JWT authentication
- File system access for vault operations

## Deployment Options

1. **NixOS Home Server**: Systemd service
2. **Serverless**: Vercel/Netlify functions
3. **Container**: Docker deployment
