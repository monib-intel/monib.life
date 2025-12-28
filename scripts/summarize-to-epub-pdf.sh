#!/usr/bin/env bash
# Script: scripts/summarize-to-epub-pdf.sh
# Description: Summarize book to Markdown and convert to PDF

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Summarize book to Markdown and convert to PDF"
    echo ""
    echo "Usage: ./scripts/summarize-to-epub-pdf.sh <path-to-book.epub>"
    echo ""
    echo "Arguments:"
    echo "  path-to-book.epub    Path to the EPUB file to summarize"
    echo ""
    echo "This will:"
    echo "  1. Extract and summarize the book using reading-assistant"
    echo "  2. Convert the summary to PDF using conversion-service"
    echo "  3. Output Markdown to: private/book-summaries-md/"
    echo "  4. Output PDF to: vault/book-summaries-pdf/"
    echo ""
    echo "Example:"
    echo "  ./scripts/summarize-to-epub-pdf.sh path/to/book.epub"
    exit 0
fi

# Check if file argument is provided
if [ -z "${1:-}" ]; then
    log_error "Error: FILE argument not provided"
    echo ""
    echo "Usage: ./scripts/summarize-to-epub-pdf.sh <path-to-book.epub>"
    exit 1
fi

FILE="$1"

# Check if file exists
if [ ! -f "$FILE" ]; then
    log_error "Error: File not found: $FILE"
    exit 1
fi

cd_project_root

log_info "Summarizing $FILE..."

# Create output directories
mkdir -p private/book-summaries-md vault/book-summaries-pdf

# Process book with reading-assistant
if [ ! -d "services/reading-assistant" ]; then
    log_error "Error: reading-assistant service not found"
    exit 1
fi

cd services/reading-assistant && uv run python scripts/process_epub.py "$FILE" --extract --summary -o ../../private/book-summaries-md
cd "$PROJECT_ROOT"

log_success "Summary created"

# Find the summary file
SUMMARY_FILE=$(find private/book-summaries-md -name "*_AnalyticalReading.md" -type f | head -1)

if [ -z "$SUMMARY_FILE" ]; then
    log_error "Error: Could not find summary file"
    exit 1
fi

log_info "Converting summary to PDF..."

if [ ! -d "services/conversion-service" ]; then
    log_error "Error: conversion-service not found"
    exit 1
fi

cd services/conversion-service && ./convert.sh "../../$SUMMARY_FILE" --output-dir ../../vault/book-summaries-pdf

log_success "Summary and PDF complete!"
log_info "Markdown: private/book-summaries-md/"
log_info "PDF: vault/book-summaries-pdf/"
