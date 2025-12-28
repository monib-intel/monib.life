#!/usr/bin/env bash
# Script: scripts/process-books.sh
# Description: Process all books in queue

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Process all books in queue"
    echo ""
    echo "Usage: ./scripts/process-books.sh"
    echo ""
    echo "This will process all EPUB files in services/reading-assistant/books/queue/"
    exit 0
fi

cd_project_root

log_info "Processing books in queue..."

if [ ! -d "services/reading-assistant" ]; then
    log_error "Error: reading-assistant service not found"
    log_info "Run: git submodule update --init --recursive"
    exit 1
fi

cd services/reading-assistant && python process_epub.py
