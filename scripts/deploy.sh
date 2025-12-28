#!/usr/bin/env bash
# Script: scripts/deploy.sh
# Description: Build and deploy to production

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Build and deploy to production"
    echo ""
    echo "Usage: ./scripts/deploy.sh"
    echo ""
    echo "This will:"
    echo "  1. Build the site for production"
    echo "  2. Display deployment instructions"
    echo ""
    echo "Note: Deployment target not yet configured."
    echo "Configure for your deployment method or use 'nix run .#deploy'"
    echo "See README.md for deployment options (Netlify, Vercel, Cloudflare Pages, NixOS)."
    exit 0
fi

cd_project_root

# Build site
"$SCRIPT_DIR/build.sh"

log_info "Deploying to production..."
log_warning "Note: Deployment target not yet configured."
log_info "Configure this target for your deployment method or use 'nix run .#deploy'"
log_info "See README.md for deployment options (Netlify, Vercel, Cloudflare Pages, NixOS)."
