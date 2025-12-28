#!/usr/bin/env bash
# Script: scripts/help.sh
# Description: Show available commands and usage

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

cat << 'EOF'
monib.life - Build and development commands

Usage: ./scripts/<command>.sh [options]

Build & Deployment Commands:
  install.sh              Install dependencies (npm, pip)
  dev.sh                  Start development server with hot reload
  build.sh                Build site for production
  test.sh                 Run tests and validate configuration
  clean.sh                Remove build artifacts and node_modules
  sync-vault.sh           Sync vault content to website/content
  sync-projects.sh        Sync external project documentation
  deploy.sh               Build and deploy to production (placeholder)

Admin Dashboard Commands:
  admin-server.sh         Start admin API server only (port 3000)
  admin-ui.sh             Start admin UI only (port 5173)
  admin-full.sh           Start admin API + UI (ports 3000, 5173)
  admin-dev.sh            Start admin API + UI + Quartz dev server
  stop.sh                 Stop all running services

Content & Services Commands:
  add-book.sh <file>      Add a book to processing queue
  process-books.sh        Process all books in queue

Conversion Service Commands:
  convert.sh <file> [out] Convert ebook to Markdown
  convert-help.sh         Show conversion service help
  summarize-to-epub-pdf.sh <file>
                          Summarize book to Markdown, then convert to PDF

Help:
  help.sh                 Show this help message
  <command>.sh --help     Show help for a specific command

Examples:
  ./scripts/install.sh                          # Install all dependencies
  ./scripts/dev.sh                              # Start local development server
  ./scripts/admin-full.sh                       # Start admin dashboard (API + UI)
  ./scripts/admin-dev.sh                        # Start everything (admin + Quartz)
  ./scripts/add-book.sh book.epub               # Add book to queue
  ./scripts/convert.sh book.epub                # Convert book to Markdown
  ./scripts/summarize-to-epub-pdf.sh book.epub  # Summarize book to Markdown & PDF
  ./scripts/stop.sh                             # Stop all services

For detailed help on any command, run:
  ./scripts/<command>.sh --help

EOF
