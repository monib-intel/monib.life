# monib.life

Personal content management system with Obsidian vault integration and AI-powered content generation services.

## Architecture Overview

```
monib.life/
├── vault/                         # Obsidian vault (SUBMODULE)
│   ├── .obsidian/                 # Obsidian configuration
│   ├── reading/                   # Book summaries
│   ├── resume/                    # Resume source data
│   └── projects/                  # Project documentation
├── services/
│   ├── reading-assistant/         # SUBMODULE - EPUB to analytical summaries
│   ├── syntopical-reading-assistant/  # SUBMODULE - Multi-book analysis
│   ├── resume-assistant/          # Resume generation service
│   └── conversion-service/        # Ebook converter (EPUB/PDF/MOBI → Markdown/PDF)
└── private/                       # Local generated content (not tracked)
    ├── book-summaries-md/         # Generated book summaries (Markdown)
    └── book-summaries-pdf/        # Generated book summaries (PDF)
```

## Core Principles

1. **Obsidian vault as source of truth**: All content lives in `vault/` as markdown
2. **Native compatibility**: Leverage existing standards (frontmatter, wikilinks, tags)
3. **Draft workflow**: Assistants generate content with `status: draft`, reviewed in Obsidian
4. **Composable architecture**: Each component operates independently
5. **Service-oriented**: Each service handles a specific domain (reading, resume, conversion)

## Prerequisites

- Python 3.11+ with UV package manager
- Obsidian (for content editing)
- Git with submodules support
- Make (optional, for convenience commands)

## Quick Start

### 1. Clone Repository

```bash
git clone <repo-url> monib.life
cd monib.life

# Initialize submodules
git submodule update --init --recursive
```

### 2. Install Dependencies

```bash
make install
```

Or manually:

```bash
cd services/reading-assistant && uv sync
cd ../conversion-service && uv sync
cd ../resume-assistant && pip install -r requirements.txt
```

## Services

### Conversion Service

Convert ebooks to Markdown or generate PDF summaries from Markdown.

**Convert EPUB to Markdown:**
```bash
make convert FILE="path/to/book.epub" OUTPUT="./output"
```

**Generate Book Summary and PDF:**
```bash
make summarize-epub-to-pdf FILE="path/to/book.epub"
```

This will:
1. Extract and summarize the book using AI (reading-assistant)
2. Convert the summary to a formatted PDF (conversion-service)
3. Output Markdown to `private/book-summaries-md/`
4. Output PDF to `private/book-summaries-pdf/`

**For paths with spaces:**
```bash
make summarize-epub-to-pdf FILE="/path/with spaces/book.epub"
```

See [services/conversion-service/README.md](services/conversion-service/README.md) for details.

### Reading Assistant

AI-powered analytical reading assistant that generates comprehensive book summaries.

```bash
cd services/reading-assistant
uv run python scripts/process_epub.py "path/to/book.epub" --summary
```

See [services/reading-assistant/README.md](services/reading-assistant/README.md) for details.

### Resume Assistant

Generate and manage resume content from structured markdown in the vault.

See [services/resume-assistant/README.md](services/resume-assistant/README.md) for details.

### Syntopical Reading Assistant

Multi-book comparative analysis for syntopical reading workflows.

See [services/syntopical-reading-assistant/README.md](services/syntopical-reading-assistant/README.md) for details.

## Make Commands

The Makefile provides convenient shortcuts for common operations:

```bash
make help              # Show all available commands
make install           # Install dependencies for all services
make test              # Run tests and validate configuration
make clean             # Clean build artifacts

# Conversion service commands
make convert FILE="book.epub" [OUTPUT="./output"]
make convert-help
make summarize-epub-to-pdf FILE="book.epub"

# Book processing (reading-assistant queue)
make add-book FILE="book.epub"
make process-books

# Stop all services
make stop
```

### Examples

```bash
# Install all dependencies
make install

# Convert book to Markdown
make convert FILE="~/Books/example.epub"

# Generate summary and PDF
make summarize-epub-to-pdf FILE="~/Books/example.epub"

# Add book to processing queue
make add-book FILE="~/Books/another-book.epub"
make process-books
```

## Content Workflow

### Publishing Content

1. Edit/create markdown files in `vault/`
2. Use Obsidian for editing (optional but recommended)
3. Commit and push changes to vault repository

### Using AI Assistants

Assistants write content to `vault/` with `status: draft` frontmatter:

1. Run assistant (see service-specific READMEs)
2. Assistant generates content in `vault/` with `status: draft`
3. Review/edit in Obsidian
4. Remove `status: draft` or change to `status: published`
5. Commit and push to vault

### Generated Content Location

AI-generated content is stored in:
- `private/book-summaries-md/` - Markdown summaries (not tracked in git)
- `private/book-summaries-pdf/` - PDF summaries (not tracked in git)
- `vault/reading/` - Manually reviewed and published summaries (tracked)

## Standard Conventions

All content follows these conventions:

- **Frontmatter**: YAML format for metadata
- **Links**: Wikilinks `[[note]]` for internal references
- **Tags**: `tags: [tag1, tag2]` in frontmatter
- **Dates**: ISO format `YYYY-MM-DD`
- **Filenames**: lowercase-kebab-case.md
- **Status**: `status: draft` or `status: published` in frontmatter

## Submodules

This repository uses git submodules for modular components:

- **vault**: Obsidian vault with all content
  - Repository: https://github.com/monib-intel/vault

- **services/reading-assistant**: Reading bot for analytical summaries
  - Repository: https://github.com/monib-intel/reading-bot

- **services/syntopical-reading-assistant**: Multi-book comparative analysis
  - Repository: https://github.com/monib-intel/syntopical-reading-assistant

### Working with Submodules

```bash
# Update all submodules to latest
git submodule update --remote

# Update specific submodule
git submodule update --remote vault

# Commit submodule updates
git add vault services/reading-assistant
git commit -m "Update submodules to latest commits"
```

## Development

### Testing

```bash
make test
```

This validates:
- Vault directory structure
- Required files and configuration
- Obsidian vault integrity

### Service Development

Each service can be developed independently:

```bash
# Reading assistant
cd services/reading-assistant
uv run python scripts/process_epub.py --help

# Conversion service
cd services/conversion-service
uv run python src/cli.py --help

# Resume assistant
cd services/resume-assistant
python -m resume_assistant --help
```

## Repository Structure

```
monib.life/
├── README.md                      # This file
├── Makefile                       # Convenience commands
├── .gitmodules                    # Submodule configuration
├── vault/                         # SUBMODULE - Obsidian vault
├── services/
│   ├── reading-assistant/         # SUBMODULE - Analytical reading
│   ├── syntopical-reading-assistant/  # SUBMODULE - Comparative analysis
│   ├── resume-assistant/          # Resume generation
│   └── conversion-service/        # Ebook conversion & PDF generation
└── private/                       # Generated content (not tracked)
    ├── book-summaries-md/
    └── book-summaries-pdf/
```

## Future Enhancements

- [ ] Web interface for content management
- [ ] Automated book processing pipeline
- [ ] Resume PDF generation API
- [ ] Integration with publishing platforms
- [ ] Batch processing improvements
- [ ] Additional export formats

## Repository Links

- **Main**: https://github.com/monib-intel/monib.life
- **Vault**: https://github.com/monib-intel/vault
- **Reading Bot**: https://github.com/monib-intel/reading-bot
- **Syntopical Assistant**: https://github.com/monib-intel/syntopical-reading-assistant
