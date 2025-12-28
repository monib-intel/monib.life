#!/usr/bin/env bash
# Script: scripts/dev.sh
# Description: Start development server with hot reload

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Start development server with hot reload"
    echo ""
    echo "Usage: ./scripts/dev.sh"
    echo ""
    echo "This will:"
    echo "  - Run install to ensure dependencies are up to date"
    echo "  - Sync vault content to website/content"
    echo "  - Start Quartz development server"
    exit 0
fi

cd_project_root

# Install dependencies
"$SCRIPT_DIR/install.sh"

# Sync vault
log_info "Syncing vault content..."
"$SCRIPT_DIR/sync-vault.sh" || {
    log_error "Failed to sync vault"
    exit 1
}

# Start server
log_info "Starting development server..."
cd website && npx quartz build --serve || {
    log_error "Failed to start dev server"
    exit 1
}
