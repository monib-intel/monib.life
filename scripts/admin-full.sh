#!/usr/bin/env bash
# Script: scripts/admin-full.sh
# Description: Start admin API + UI (runs both in parallel)

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Configuration
ADMIN_PORT=3000
ADMIN_UI_PORT=5173

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Start admin API + UI (runs both in parallel)"
    echo ""
    echo "Usage: ./scripts/admin-full.sh"
    echo ""
    echo "This will start:"
    echo "  - Admin API on port $ADMIN_PORT"
    echo "  - Admin UI on port $ADMIN_UI_PORT"
    echo ""
    echo "Admin UI: http://localhost:$ADMIN_UI_PORT"
    echo "Admin API: http://localhost:$ADMIN_PORT/docs"
    exit 0
fi

cd_project_root

log_info "Starting admin API (port $ADMIN_PORT) and admin UI (port $ADMIN_UI_PORT)..."
log_info "Admin UI: http://localhost:$ADMIN_UI_PORT"
log_info "Admin API: http://localhost:$ADMIN_PORT/docs"

# Trap to kill all child processes on exit
trap 'kill 0' EXIT

cd admin-api && uvicorn app.main:app --reload --port "$ADMIN_PORT" &
cd "$PROJECT_ROOT/admin-ui" && npm run dev
