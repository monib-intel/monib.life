# monib.life

Personal website and digital garden built with [Quartz v4](https://quartz.jzhao.xyz/).

## Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/monib-intel/monib.life.git

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies
make install

# Start development server
make dev

# Build for production
make build
```

## Project Structure

```
/
├── vault/               # Obsidian vault (submodule)
├── content/             # Markdown content (synced from vault)
├── quartz/              # Quartz framework
├── public/              # Static assets (build output)
├── services/            # Backend services (separate repos, gitignored)
│   ├── admin-api/
│   └── resume-assistant/
├── private/             # Sensitive/uploaded content (gitignored)
│   └── books/
│       ├── uploads/     # Books uploaded via web interface
│       ├── manual/      # Books added via make add-book
│       └── api/         # Books received via API
├── scripts/             # Build and sync scripts
├── docs/                # Documentation
├── Makefile             # Build commands
└── flake.nix            # Nix development environment
```

**Key directories:**
- `vault/` - Obsidian vault (submodule: [monib-intel/vault](https://github.com/monib-intel/vault))
- `private/books/` - Book storage for processing (gitignored content, structure tracked)
- `services/` - Backend services (each is a separate git repository)

## Admin Interface

A hidden admin interface is available for managing book uploads and processing:

```bash
# Start admin server only (port 3000)
make admin-server

# Start admin + Quartz dev server (recommended)
make admin-dev

# Add a book manually (stored in private/books/manual/)
make add-book FILE=path/to/book.epub

# Process all books in queue
make process-books
```

**Access:** http://localhost:3000 (or your local IP for mobile access)  
**Credentials:** Username: `admin` / Password: `admin` (set `ADMIN_PASSWORD` env var for production)

### Features
- 📤 Upload EPUB/PDF books via web interface or mobile
- 🤖 AI-powered Inspectional Reading summaries
- 📋 Book queue management
- 🔄 Vault sync and site rebuild controls
- 📊 Live logs viewer

### Book Storage

Books are stored in `private/books/` with subdirectories for different sources:
- `uploads/` - Books uploaded via web interface
- `manual/` - Books added via `make add-book`
- `api/` - Books received via API

The directory structure is tracked in git, but book files are gitignored.

## Submodules

This project uses git submodules:
- **vault**: Personal knowledge base and content source ([monib-intel/vault](https://github.com/monib-intel/vault))

## Development

Built with Quartz v4, a static site generator for digital gardens and knowledge bases.
