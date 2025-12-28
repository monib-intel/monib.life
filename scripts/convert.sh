#!/usr/bin/env bash
# Script: scripts/convert.sh
# Description: Convert ebook to Markdown

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Convert ebook to Markdown"
    echo ""
    echo "Usage: ./scripts/convert.sh <path-to-book> [output-dir]"
    echo ""
    echo "Arguments:"
    echo "  path-to-book    Path to the EPUB/PDF/MOBI file"
    echo "  output-dir      Output directory (default: ./output)"
    echo ""
    echo "Example:"
    echo "  ./scripts/convert.sh book.epub"
    echo "  ./scripts/convert.sh book.epub ./my-output"
    exit 0
fi

# Check if file argument is provided
if [ -z "${1:-}" ]; then
    log_error "Error: FILE argument not provided"
    echo ""
    echo "Usage: ./scripts/convert.sh <path-to-book> [output-dir]"
    exit 1
fi

FILE="$1"
OUTPUT="${2:-./output}"

# Check if file exists
if [ ! -f "$FILE" ]; then
    log_error "Error: File not found: $FILE"
    exit 1
fi

cd_project_root

if [ ! -d "services/conversion-service" ]; then
    log_error "Error: conversion-service not found"
    exit 1
fi

log_info "Converting $FILE to Markdown..."
cd services/conversion-service && python src/cli.py "$FILE" --output-dir "$OUTPUT"
