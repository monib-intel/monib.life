#!/usr/bin/env bash
# PDF Conversion Script for Supernote
# Converts ebooks (epub, mobi, azw, azw3) to PDF with proper pagination and Literata font

set -e

# Default settings for Supernote optimization
DEFAULT_FONT="Literata"
DEFAULT_FONT_SIZE="12"
DEFAULT_PAPER_SIZE="a5"  # Good for Supernote display
DEFAULT_MARGIN_TOP="36"
DEFAULT_MARGIN_BOTTOM="36"
DEFAULT_MARGIN_LEFT="36"
DEFAULT_MARGIN_RIGHT="36"
DEFAULT_LINE_HEIGHT="1.4"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <input_file> [output_file]

Convert ebooks to PDF optimized for Supernote e-ink reader.

Arguments:
    input_file          Input ebook file (epub, mobi, azw, azw3)
    output_file         Output PDF file (optional, defaults to input basename .pdf)

Options:
    -f, --font NAME     Font family (default: $DEFAULT_FONT)
    -s, --size SIZE     Base font size in pt (default: $DEFAULT_FONT_SIZE)
    -p, --paper SIZE    Paper size (default: $DEFAULT_PAPER_SIZE)
    -m, --margin SIZE   All margins in pt (default: $DEFAULT_MARGIN_TOP)
    -l, --line-height H Line height multiplier (default: $DEFAULT_LINE_HEIGHT)
    -o, --output FILE   Output file path
    -v, --verbose       Verbose output
    -h, --help          Show this help message

Supported input formats:
    .epub, .mobi, .azw, .azw3, .fb2, .txt, .html, .htmlz

Examples:
    $(basename "$0") book.epub
    $(basename "$0") book.epub book.pdf
    $(basename "$0") -f "Literata" -s 14 book.epub
    $(basename "$0") --paper a4 --margin 72 book.mobi output.pdf

Notes:
    - Literata font is recommended for reading on e-ink displays
    - A5 paper size works well with Supernote's display dimensions
    - Use --verbose to see detailed conversion progress
EOF
}

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

check_dependencies() {
    if ! command -v ebook-convert &> /dev/null; then
        log_error "ebook-convert not found. Please install Calibre."
        log_error "With Nix: nix develop"
        log_error "Or: nix-shell -p calibre"
        exit 1
    fi
}

validate_input() {
    local input_file="$1"
    
    if [[ ! -f "$input_file" ]]; then
        log_error "Input file not found: $input_file"
        exit 1
    fi
    
    local ext="${input_file##*.}"
    ext="${ext,,}"  # Convert to lowercase
    
    case "$ext" in
        epub|mobi|azw|azw3|fb2|txt|html|htmlz)
            ;;
        *)
            log_error "Unsupported input format: .$ext"
            log_error "Supported formats: epub, mobi, azw, azw3, fb2, txt, html, htmlz"
            exit 1
            ;;
    esac
}

convert_to_pdf() {
    local input_file="$1"
    local output_file="$2"
    local font="$3"
    local font_size="$4"
    local paper_size="$5"
    local margin_top="$6"
    local margin_bottom="$7"
    local margin_left="$8"
    local margin_right="$9"
    local line_height="${10}"
    local verbose="${11}"
    
    local verbose_flag=""
    if [[ "$verbose" == "true" ]]; then
        verbose_flag="--verbose"
    fi
    
    log_info "Converting: $input_file -> $output_file"
    log_info "Settings: font=$font, size=$font_size, paper=$paper_size"
    
    # Build ebook-convert command
    local cmd=(
        ebook-convert
        "$input_file"
        "$output_file"
        --pdf-default-font-size "$font_size"
        --pdf-serif-family "$font"
        --pdf-sans-family "$font"
        --pdf-mono-family "DejaVu Sans Mono"
        --paper-size "$paper_size"
        --pdf-page-margin-top "$margin_top"
        --pdf-page-margin-bottom "$margin_bottom"
        --pdf-page-margin-left "$margin_left"
        --pdf-page-margin-right "$margin_right"
        --pdf-add-toc
        --pdf-page-numbers
        --pdf-footer-template '<p style="text-align:center; font-size:9pt;">_PAGENUM_</p>'
        --chapter-mark pagebreak
        --page-breaks-before "/"
        --minimum-line-height "$line_height"
        --embed-all-fonts
    )
    
    if [[ -n "$verbose_flag" ]]; then
        cmd+=("$verbose_flag")
    fi
    
    # Execute conversion
    if "${cmd[@]}"; then
        log_info "Conversion successful!"
        log_info "Output: $output_file"
        
        # Show file size
        if command -v du &> /dev/null; then
            local size
            size=$(du -h "$output_file" | cut -f1)
            log_info "File size: $size"
        fi
    else
        log_error "Conversion failed!"
        exit 1
    fi
}

main() {
    # Check for help flag early (before dependency check)
    for arg in "$@"; do
        if [[ "$arg" == "-h" || "$arg" == "--help" ]]; then
            usage
            exit 0
        fi
    done
    
    # Check for ebook-convert
    check_dependencies
    
    # Parse arguments
    local font="$DEFAULT_FONT"
    local font_size="$DEFAULT_FONT_SIZE"
    local paper_size="$DEFAULT_PAPER_SIZE"
    local margin_top="$DEFAULT_MARGIN_TOP"
    local margin_bottom="$DEFAULT_MARGIN_BOTTOM"
    local margin_left="$DEFAULT_MARGIN_LEFT"
    local margin_right="$DEFAULT_MARGIN_RIGHT"
    local line_height="$DEFAULT_LINE_HEIGHT"
    local verbose="false"
    local input_file=""
    local output_file=""
    
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -f|--font)
                font="$2"
                shift 2
                ;;
            -s|--size)
                font_size="$2"
                shift 2
                ;;
            -p|--paper)
                paper_size="$2"
                shift 2
                ;;
            -m|--margin)
                margin_top="$2"
                margin_bottom="$2"
                margin_left="$2"
                margin_right="$2"
                shift 2
                ;;
            -l|--line-height)
                line_height="$2"
                shift 2
                ;;
            -o|--output)
                output_file="$2"
                shift 2
                ;;
            -v|--verbose)
                verbose="true"
                shift
                ;;
            -h|--help)
                usage
                exit 0
                ;;
            -*)
                log_error "Unknown option: $1"
                usage
                exit 1
                ;;
            *)
                if [[ -z "$input_file" ]]; then
                    input_file="$1"
                elif [[ -z "$output_file" ]]; then
                    output_file="$1"
                else
                    log_error "Unexpected argument: $1"
                    usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate input
    if [[ -z "$input_file" ]]; then
        log_error "No input file specified"
        usage
        exit 1
    fi
    
    validate_input "$input_file"
    
    # Set default output file if not specified
    if [[ -z "$output_file" ]]; then
        local basename="${input_file%.*}"
        output_file="${basename}.pdf"
    fi
    
    # Run conversion
    convert_to_pdf \
        "$input_file" \
        "$output_file" \
        "$font" \
        "$font_size" \
        "$paper_size" \
        "$margin_top" \
        "$margin_bottom" \
        "$margin_left" \
        "$margin_right" \
        "$line_height" \
        "$verbose"
}

# Run main if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
