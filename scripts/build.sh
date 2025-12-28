#!/usr/bin/env bash
# Script: scripts/build.sh
# Description: Build site for production

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Build site for production"
    echo ""
    echo "Usage: ./scripts/build.sh"
    echo ""
    echo "This will:"
    echo "  - Run install to ensure dependencies are up to date"
    echo "  - Sync vault content to website/content"
    echo "  - Build Quartz site for production"
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

# Build site
log_info "Building for production..."
cd website && npx quartz build || {
    log_error "Failed to build site"
    exit 1
}

log_success "Build complete!"
