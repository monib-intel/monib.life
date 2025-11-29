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
├── website/             # Quartz website (submodule: monib-intel/monib.life-website)
│   ├── quartz/          # Quartz framework
│   ├── content/         # Markdown content (synced from ../vault)
│   ├── public/          # Build output (gitignored)
│   ├── quartz.config.ts # Quartz configuration
│   ├── package.json     # Node dependencies
│   └── ...
├── vault/               # Obsidian vault (submodule: monib-intel/vault)
├── services/            # Backend services (separate repos, gitignored)
│   ├── admin-api/
│   └── resume-assistant/
├── private/             # Sensitive/uploaded content (gitignored)
│   └── books/
│       ├── uploads/     # Books uploaded via web interface
│       ├── manual/      # Books added via make add-book
│       └── api/         # Books received via API
├── scripts/             # Orchestration scripts
├── Makefile             # Build commands
└── flake.nix            # Nix development environment
```

**Key directories:**
- `website/` - Quartz website (submodule: [monib-intel/monib.life-website](https://github.com/monib-intel/monib.life-website))
- `vault/` - Obsidian vault (submodule: [monib-intel/vault](https://github.com/monib-intel/vault))
- `private/books/` - Book storage for processing (gitignored content, structure tracked)
- `services/` - Backend services (each is a separate git repository)

## Submodules

This project uses git submodules:
- **vault**: Personal knowledge base and content source ([monib-intel/vault](https://github.com/monib-intel/vault))
- **website**: Quartz-based website ([monib-intel/monib.life-website](https://github.com/monib-intel/monib.life-website))

### Submodule Workflow

#### For users cloning:
```bash
git clone https://github.com/monib-intel/monib.life.git
cd monib.life
git submodule update --init --recursive
make install
```

#### For updating website:
```bash
# In website repo
cd website
git pull origin main

# In main repo
git add website
git commit -m "chore: update website submodule"
```

#### For developing website independently:
```bash
git clone https://github.com/monib-intel/monib.life-website.git
cd monib.life-website
# Develop and test standalone
```

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

## Development

Built with Quartz v4, a static site generator for digital gardens and knowledge bases.
