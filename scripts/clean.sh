#!/usr/bin/env bash
# Script: scripts/clean.sh
# Description: Clean build artifacts

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Clean build artifacts"
    echo ""
    echo "Usage: ./scripts/clean.sh"
    echo ""
    echo "This will remove:"
    echo "  - website/public/"
    echo "  - website/.quartz-cache/"
    echo "  - website/node_modules/"
    exit 0
fi

cd_project_root

log_info "Cleaning build artifacts..."

rm -rf website/public/
rm -rf website/.quartz-cache/
rm -rf website/node_modules/

log_success "Clean complete!"
