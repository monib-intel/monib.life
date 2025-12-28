#!/usr/bin/env bash
# Common functions and utilities for monib.life scripts

# Exit on error, undefined vars, pipe failures
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Logging functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$*"
}

log_success() {
    echo -e "${GREEN}✓${NC} $*"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $*"
}

log_error() {
    echo -e "${RED}✗${NC} $*" >&2
}

# Error handler
handle_error() {
    log_error "Error on line $1"
    exit 1
}

# Set up error trap
trap 'handle_error $LINENO' ERR

# Check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required commands
check_requirements() {
    local missing=()
    for cmd in "$@"; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done
    
    if [ ${#missing[@]} -gt 0 ]; then
        log_error "Missing required commands: ${missing[*]}"
        log_info "Please install the missing dependencies"
        exit 1
    fi
}

# Show help if -h or --help is passed
show_help_if_requested() {
    local script_name="$1"
    local description="$2"
    local usage="$3"
    
    if [[ "${1:-}" == "-h" ]] || [[ "${1:-}" == "--help" ]]; then
        echo "$description"
        echo ""
        echo "Usage: $usage"
        exit 0
    fi
}

# Change to project root
cd_project_root() {
    cd "$PROJECT_ROOT"
}
