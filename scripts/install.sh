#!/usr/bin/env bash
# Script: scripts/install.sh
# Description: Install dependencies and initialize submodules

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Install dependencies and initialize submodules"
    echo ""
    echo "Usage: ./scripts/install.sh"
    echo ""
    echo "This will:"
    echo "  - Update and initialize git submodules"
    echo "  - Install website dependencies (npm)"
    echo "  - Install admin API dependencies (pip)"
    echo "  - Install admin UI dependencies (npm)"
    exit 0
fi

cd_project_root

log_info "Installing dependencies..."

# Update submodules
log_info "Updating submodules..."
git submodule update --init --recursive
log_success "Submodules updated"

# Install website dependencies
if [ -d "website" ]; then
    log_info "Installing website dependencies..."
    cd website && npm install
    cd "$PROJECT_ROOT"
    log_success "Website dependencies installed"
fi

# Install admin API dependencies
if [ -d "admin-api" ]; then
    log_info "Installing admin API dependencies..."
    cd admin-api && pip install -e .
    cd "$PROJECT_ROOT"
    log_success "Admin API dependencies installed"
fi

# Install admin UI dependencies
if [ -d "admin-ui" ]; then
    log_info "Installing admin UI dependencies..."
    cd admin-ui && npm install
    cd "$PROJECT_ROOT"
    log_success "Admin UI dependencies installed"
fi

log_success "All dependencies installed successfully!"
