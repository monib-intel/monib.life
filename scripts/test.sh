#!/usr/bin/env bash
# Script: scripts/test.sh
# Description: Run tests and validate configuration

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Run tests and validate configuration"
    echo ""
    echo "Usage: ./scripts/test.sh"
    echo ""
    echo "This will:"
    echo "  - Check for required files and directories"
    echo "  - Validate vault content structure"
    echo "  - Check script permissions"
    exit 0
fi

cd_project_root

log_info "Running tests..."

# Check required files
log_info "Checking required files..."
test -f website/quartz.config.ts || {
    log_error "website/quartz.config.ts not found"
    exit 1
}
test -f website/package.json || {
    log_error "website/package.json not found"
    exit 1
}
log_success "Required files present"

# Check directories
log_info "Checking directories..."
test -d vault || {
    log_error "vault directory not found"
    exit 1
}
test -d vault/.obsidian || log_warning "vault/.obsidian directory not found"
log_success "Required directories present"

# Validate vault content
log_info "Validating vault content..."
test -f vault/index.md || {
    log_error "vault/index.md not found"
    exit 1
}
log_success "Vault content valid"

# Check scripts
log_info "Checking scripts..."
test -x scripts/sync-projects.sh || chmod +x scripts/sync-projects.sh
test -x scripts/sync-vault.sh || chmod +x scripts/sync-vault.sh
log_success "Scripts are executable"

log_success "All tests passed!"
