#!/usr/bin/env bash
# Script: scripts/admin-dev.sh
# Description: Start admin API + UI + Quartz dev server (runs all in parallel)

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Configuration
ADMIN_PORT=3000
ADMIN_UI_PORT=5173
QUARTZ_PORT=8080

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Start admin API + UI + Quartz dev server (runs all in parallel)"
    echo ""
    echo "Usage: ./scripts/admin-dev.sh"
    echo ""
    echo "This will start:"
    echo "  - Admin API on port $ADMIN_PORT"
    echo "  - Admin UI on port $ADMIN_UI_PORT"
    echo "  - Quartz dev server on port $QUARTZ_PORT"
    echo ""
    echo "Admin UI: http://localhost:$ADMIN_UI_PORT"
    echo "Admin API: http://localhost:$ADMIN_PORT/docs"
    echo "Quartz site: http://localhost:$QUARTZ_PORT"
    exit 0
fi

cd_project_root

# Sync vault first
"$SCRIPT_DIR/sync-vault.sh" || {
    log_error "Failed to sync vault"
    exit 1
}

log_info "Starting admin API (port $ADMIN_PORT), admin UI (port $ADMIN_UI_PORT), and Quartz dev server (port $QUARTZ_PORT)..."
log_info "Admin UI: http://localhost:$ADMIN_UI_PORT"
log_info "Admin API: http://localhost:$ADMIN_PORT/docs"
log_info "Quartz site: http://localhost:$QUARTZ_PORT"

# Trap to kill all child processes on exit
trap 'kill 0' EXIT

cd admin-api && uvicorn app.main:app --reload --port "$ADMIN_PORT" &
cd "$PROJECT_ROOT/admin-ui" && npm run dev &
cd "$PROJECT_ROOT/website" && npx quartz build --serve --port "$QUARTZ_PORT"
