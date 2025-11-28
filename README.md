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

- `vault/` - Obsidian vault (submodule: [monib-intel/vault](https://github.com/monib-intel/vault))
- `reading-assistant/` - Reading bot assistant (submodule: [monib-intel/reading-bot](https://github.com/monib-intel/reading-bot))
- `content/` - Markdown content for the website (synced from vault)
- `quartz/` - Quartz framework
- `public/` - Static assets
- `Makefile` - Build commands

## Admin Interface

A hidden admin interface is available for managing book uploads and processing:

```bash
# Start admin server only (port 3000)
make admin-server

# Start admin + Quartz dev server (recommended)
make admin-dev

# Add a book manually
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

### Testing Book Processing

Test book processing without API calls:

```bash
cd reading-assistant
python test_book_processing.py books/your-book.epub ../content/BookSummaries
```

This validates EPUB conversion, metadata extraction, and output generation without requiring API access.

## Submodules

This project uses git submodules:
- **vault**: Personal knowledge base and content source
- **reading-assistant**: AI assistant for generating reading summaries

## Development

Built with Quartz v4, a static site generator for digital gardens and knowledge bases.
