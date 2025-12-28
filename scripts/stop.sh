#!/usr/bin/env bash
# Script: scripts/stop.sh
# Description: Stop all running services

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

# Show help if requested
if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
    echo "Stop all running services"
    echo ""
    echo "Usage: ./scripts/stop.sh"
    echo ""
    echo "This will stop:"
    echo "  - Admin API server (uvicorn)"
    echo "  - Admin UI (vite)"
    echo "  - Quartz dev server"
    echo "  - All Node.js processes"
    exit 0
fi

log_info "Stopping all services..."

# Get PIDs of processes before attempting to kill them
UVICORN_PIDS=$(pgrep -f "uvicorn app.main:app" 2>/dev/null || true)
VITE_PIDS=$(pgrep -f "vite" 2>/dev/null || true)
QUARTZ_PIDS=$(pgrep -f "quartz" 2>/dev/null || true)
NODE_PIDS=$(pgrep -f "node" 2>/dev/null || true)

# Kill processes by PID
if [ -n "$UVICORN_PIDS" ]; then
    log_info "Stopping uvicorn processes..."
    echo "$UVICORN_PIDS" | xargs -r kill 2>/dev/null || true
fi

if [ -n "$VITE_PIDS" ]; then
    log_info "Stopping vite processes..."
    echo "$VITE_PIDS" | xargs -r kill 2>/dev/null || true
fi

if [ -n "$QUARTZ_PIDS" ]; then
    log_info "Stopping quartz processes..."
    echo "$QUARTZ_PIDS" | xargs -r kill 2>/dev/null || true
fi

if [ -n "$NODE_PIDS" ]; then
    log_info "Stopping node processes..."
    echo "$NODE_PIDS" | xargs -r kill 2>/dev/null || true
fi

# Give processes time to shut down gracefully
sleep 1

log_success "All services stopped"
