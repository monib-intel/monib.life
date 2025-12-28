# Scripts Directory

This directory contains executable shell scripts for building, testing, and managing the monib.life project.

## Quick Start

### Using Individual Scripts

```bash
./scripts/install.sh      # Install dependencies
./scripts/dev.sh          # Start development server
./scripts/build.sh        # Build for production
```

### Using the Main Dispatcher

```bash
./monib.sh install        # Install dependencies
./monib.sh dev            # Start development server
./monib.sh build          # Build for production
```

## Available Scripts

### Build & Deployment

- **install.sh** - Install all dependencies (npm, pip) and initialize submodules
- **dev.sh** - Start Quartz development server with hot reload
- **build.sh** - Build site for production
- **test.sh** - Run tests and validate configuration
- **clean.sh** - Remove build artifacts and node_modules
- **deploy.sh** - Build and deploy to production (placeholder)

### Admin Dashboard

- **admin-server.sh** - Start admin API server only (port 3000)
- **admin-ui.sh** - Start admin UI only (port 5173)
- **admin-full.sh** - Start admin API + UI in parallel
- **admin-dev.sh** - Start admin API + UI + Quartz dev server
- **stop.sh** - Stop all running services

### Content Management

- **sync-vault.sh** - Sync vault content to website/content
- **sync-projects.sh** - Sync external project documentation

### Book Processing

- **add-book.sh** - Add a book to processing queue
- **process-books.sh** - Process all books in queue

### Conversion Service

- **convert.sh** - Convert ebook (EPUB/PDF/MOBI) to Markdown
- **convert-help.sh** - Show conversion service help
- **summarize-to-epub-pdf.sh** - Summarize book to Markdown and convert to PDF

### Utilities

- **help.sh** - Show available commands and usage
- **common.sh** - Shared functions (sourced by other scripts)

## Script Features

All scripts include:

- ✅ Proper error handling (`set -euo pipefail`)
- ✅ Help text (`./script.sh --help`)
- ✅ Color-coded output (info, success, warning, error)
- ✅ Input validation
- ✅ Clear error messages

## Usage Examples

### Development Workflow

```bash
# Initial setup
./scripts/install.sh

# Start development
./scripts/dev.sh

# In another terminal: Start admin dashboard
./scripts/admin-full.sh
```

### Build and Deploy

```bash
# Clean previous builds
./scripts/clean.sh

# Build for production
./scripts/build.sh

# Deploy (configure target first)
./scripts/deploy.sh
```

### Book Processing

```bash
# Add a book to queue
./scripts/add-book.sh path/to/book.epub

# Process queued books
./scripts/process-books.sh

# Or process and convert in one step
./scripts/summarize-to-epub-pdf.sh path/to/book.epub
```

### Admin Dashboard

```bash
# Start everything (recommended for development)
./scripts/admin-dev.sh

# Or start components separately
./scripts/admin-server.sh  # Terminal 1: API on port 3000
./scripts/admin-ui.sh      # Terminal 2: UI on port 5173

# When done
./scripts/stop.sh
```

## Common Functions

The `common.sh` file provides shared utilities:

- `log_info(msg)` - Blue info message
- `log_success(msg)` - Green success message
- `log_warning(msg)` - Yellow warning message
- `log_error(msg)` - Red error message
- `check_requirements(cmds...)` - Verify required commands exist
- `cd_project_root()` - Change to project root directory

To use in your own scripts:

```bash
#!/usr/bin/env bash
source "$(dirname "${BASH_SOURCE[0]}")/common.sh"

log_info "Starting process..."
check_requirements git npm python
cd_project_root
log_success "Done!"
```

## Error Handling

All scripts exit with appropriate codes:

- `0` - Success
- `1` - Error (with descriptive message)

Scripts use `set -euo pipefail` to:
- Exit on command failure (`-e`)
- Exit on undefined variable (`-u`)
- Exit on pipe failure (`-o pipefail`)

## Getting Help

For detailed help on any script:

```bash
./scripts/<script-name>.sh --help
```

Or view all commands:

```bash
./scripts/help.sh
# or
./monib.sh help
```

## Migration from Makefile

These scripts replace the previous Makefile targets:

| Makefile Target | New Script |
|----------------|------------|
| `make install` | `./scripts/install.sh` |
| `make dev` | `./scripts/dev.sh` |
| `make build` | `./scripts/build.sh` |
| `make test` | `./scripts/test.sh` |
| `make clean` | `./scripts/clean.sh` |
| `make admin-server` | `./scripts/admin-server.sh` |
| `make admin-ui` | `./scripts/admin-ui.sh` |
| `make admin-full` | `./scripts/admin-full.sh` |
| `make admin-dev` | `./scripts/admin-dev.sh` |
| `make stop` | `./scripts/stop.sh` |
| `make add-book FILE=x` | `./scripts/add-book.sh x` |
| `make process-books` | `./scripts/process-books.sh` |
| `make convert FILE=x` | `./scripts/convert.sh x` |
| `make convert-help` | `./scripts/convert-help.sh` |
| `make summarize-to-epub-pdf FILE=x` | `./scripts/summarize-to-epub-pdf.sh x` |
| `make deploy` | `./scripts/deploy.sh` |
| `make help` | `./scripts/help.sh` |

## Contributing

When adding new scripts:

1. Use the `common.sh` template
2. Add proper error handling
3. Include `--help` flag
4. Make executable: `chmod +x scripts/new-script.sh`
5. Add to `monib.sh` dispatcher
6. Update this README
7. Update main `scripts/help.sh`
