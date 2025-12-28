#!/usr/bin/env bash
# Script: scripts/add-book.sh
# Description: Add a book to processing queue

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Add a book to processing queue"
    echo ""
    echo "Usage: ./scripts/add-book.sh <path-to-book.epub>"
    echo ""
    echo "Arguments:"
    echo "  path-to-book.epub    Path to the EPUB file to add to queue"
    echo ""
    echo "Example:"
    echo "  ./scripts/add-book.sh path/to/book.epub"
    exit 0
fi

# Check if file argument is provided
if [ -z "${1:-}" ]; then
    log_error "Error: FILE argument not provided"
    echo ""
    echo "Usage: ./scripts/add-book.sh <path-to-book.epub>"
    exit 1
fi

FILE="$1"

# Check if file exists
if [ ! -f "$FILE" ]; then
    log_error "Error: File not found: $FILE"
    exit 1
fi

cd_project_root

# Create queue directory if it doesn't exist
mkdir -p services/reading-assistant/books/queue/

log_info "Adding $FILE to processing queue..."
cp "$FILE" services/reading-assistant/books/queue/
log_success "Book added to queue: $(basename "$FILE")"
