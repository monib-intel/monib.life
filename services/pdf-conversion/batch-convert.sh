#!/usr/bin/env bash
# Batch PDF Conversion Script
# Converts all ebooks in a directory to PDF

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONVERT_SCRIPT="$SCRIPT_DIR/convert.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

usage() {
    cat << EOF
Usage: $(basename "$0") [OPTIONS] <input_directory> [output_directory]

Batch convert ebooks to PDF for Supernote.

Arguments:
    input_directory     Directory containing ebook files
    output_directory    Directory for PDF output (optional, defaults to input_directory)

Options:
    -r, --recursive     Process subdirectories recursively
    -f, --font NAME     Font family (default: Literata)
    -s, --size SIZE     Base font size in pt (default: 12)
    -p, --paper SIZE    Paper size (default: a5)
    --skip-existing     Skip files that already have a PDF
    -v, --verbose       Verbose output
    -h, --help          Show this help message

Examples:
    $(basename "$0") ./books
    $(basename "$0") ./books ./pdfs
    $(basename "$0") -r --skip-existing ./library ./output
    $(basename "$0") -f "Georgia" -s 14 ./ebooks
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

log_status() {
    echo -e "${BLUE}[STATUS]${NC} $1"
}

main() {
    # Check for help flag early
    for arg in "$@"; do
        if [[ "$arg" == "-h" || "$arg" == "--help" ]]; then
            usage
            exit 0
        fi
    done
    
    local recursive="false"
    local font=""
    local font_size=""
    local paper_size=""
    local skip_existing="false"
    local verbose="false"
    local input_dir=""
    local output_dir=""
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -r|--recursive)
                recursive="true"
                shift
                ;;
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
            --skip-existing)
                skip_existing="true"
                shift
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
                if [[ -z "$input_dir" ]]; then
                    input_dir="$1"
                elif [[ -z "$output_dir" ]]; then
                    output_dir="$1"
                else
                    log_error "Unexpected argument: $1"
                    usage
                    exit 1
                fi
                shift
                ;;
        esac
    done
    
    # Validate input directory
    if [[ -z "$input_dir" ]]; then
        log_error "No input directory specified"
        usage
        exit 1
    fi
    
    if [[ ! -d "$input_dir" ]]; then
        log_error "Input directory not found: $input_dir"
        exit 1
    fi
    
    # Set default output directory
    if [[ -z "$output_dir" ]]; then
        output_dir="$input_dir"
    fi
    
    # Create output directory if needed
    mkdir -p "$output_dir"
    
    # Build find command
    local find_args=()
    if [[ "$recursive" == "true" ]]; then
        find_args+=("$input_dir" -type f)
    else
        find_args+=("$input_dir" -maxdepth 1 -type f)
    fi
    find_args+=(\( -iname "*.epub" -o -iname "*.mobi" -o -iname "*.azw" -o -iname "*.azw3" -o -iname "*.fb2" \))
    
    # Count files
    local total_files
    total_files=$(find "${find_args[@]}" 2>/dev/null | wc -l)
    
    if [[ "$total_files" -eq 0 ]]; then
        log_warn "No ebook files found in: $input_dir"
        exit 0
    fi
    
    log_status "Found $total_files ebook file(s) to convert"
    echo ""
    
    local converted=0
    local skipped=0
    local failed=0
    
    # Process each file
    while IFS= read -r -d '' file; do
        local basename
        basename=$(basename "$file")
        local name="${basename%.*}"
        local output_file="$output_dir/${name}.pdf"
        
        # Skip if PDF exists and skip_existing is set
        if [[ "$skip_existing" == "true" && -f "$output_file" ]]; then
            log_warn "Skipping (PDF exists): $basename"
            ((skipped++))
            continue
        fi
        
        log_status "Processing ($((converted + skipped + failed + 1))/$total_files): $basename"
        
        # Build convert command
        local cmd=("$CONVERT_SCRIPT")
        [[ -n "$font" ]] && cmd+=(-f "$font")
        [[ -n "$font_size" ]] && cmd+=(-s "$font_size")
        [[ -n "$paper_size" ]] && cmd+=(-p "$paper_size")
        [[ "$verbose" == "true" ]] && cmd+=(-v)
        cmd+=(-o "$output_file" "$file")
        
        # Run conversion
        if "${cmd[@]}"; then
            ((converted++))
        else
            log_error "Failed to convert: $basename"
            ((failed++))
        fi
        
        echo ""
    done < <(find "${find_args[@]}" -print0 2>/dev/null)
    
    # Summary
    echo ""
    log_status "========== Conversion Summary =========="
    log_info "Converted: $converted"
    [[ "$skipped" -gt 0 ]] && log_warn "Skipped:   $skipped"
    [[ "$failed" -gt 0 ]] && log_error "Failed:    $failed"
    log_status "========================================"
    
    # Exit with error if any conversions failed
    if [[ "$failed" -gt 0 ]]; then
        exit 1
    fi
}

main "$@"
