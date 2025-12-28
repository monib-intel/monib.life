#!/usr/bin/env bash
# Script: scripts/admin-ui.sh
# Description: Start admin UI only

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Configuration
ADMIN_UI_PORT=5173

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Start admin UI only"
    echo ""
    echo "Usage: ./scripts/admin-ui.sh"
    echo ""
    echo "This will start the React admin UI on port $ADMIN_UI_PORT"
    echo "Access at: http://localhost:$ADMIN_UI_PORT"
    exit 0
fi

cd_project_root

log_info "Starting admin UI on port $ADMIN_UI_PORT..."
log_info "Access at: http://localhost:$ADMIN_UI_PORT"

cd admin-ui && npm run dev
