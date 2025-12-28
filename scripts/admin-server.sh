#!/usr/bin/env bash
# Script: scripts/admin-server.sh
# Description: Start admin API server only

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Configuration
ADMIN_PORT=3000

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Start admin API server only"
    echo ""
    echo "Usage: ./scripts/admin-server.sh"
    echo ""
    echo "This will start the FastAPI admin server on port $ADMIN_PORT"
    echo "Access API docs at: http://localhost:$ADMIN_PORT/docs"
    exit 0
fi

cd_project_root

log_info "Starting admin API server on port $ADMIN_PORT..."
log_info "Access API docs at: http://localhost:$ADMIN_PORT/docs"

cd admin-api && uvicorn app.main:app --reload --port "$ADMIN_PORT"
