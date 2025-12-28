#!/usr/bin/env bash
# Main dispatcher for monib.life commands
# Usage: ./monib.sh <command> [args...]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Show help if no command provided or --help is passed
if [ $# -eq 0 ] || [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "help" ]; then
    "$SCRIPT_DIR/scripts/help.sh"
    exit 0
fi

COMMAND="$1"
shift

# Dispatch to appropriate script
case "$COMMAND" in
    install)
        exec "$SCRIPT_DIR/scripts/install.sh" "$@"
        ;;
    dev)
        exec "$SCRIPT_DIR/scripts/dev.sh" "$@"
        ;;
    build)
        exec "$SCRIPT_DIR/scripts/build.sh" "$@"
        ;;
    test)
        exec "$SCRIPT_DIR/scripts/test.sh" "$@"
        ;;
    clean)
        exec "$SCRIPT_DIR/scripts/clean.sh" "$@"
        ;;
    sync-vault)
        exec "$SCRIPT_DIR/scripts/sync-vault.sh" "$@"
        ;;
    sync|sync-projects)
        exec "$SCRIPT_DIR/scripts/sync-projects.sh" "$@"
        ;;
    deploy)
        exec "$SCRIPT_DIR/scripts/deploy.sh" "$@"
        ;;
    admin-server)
        exec "$SCRIPT_DIR/scripts/admin-server.sh" "$@"
        ;;
    admin-ui)
        exec "$SCRIPT_DIR/scripts/admin-ui.sh" "$@"
        ;;
    admin-full)
        exec "$SCRIPT_DIR/scripts/admin-full.sh" "$@"
        ;;
    admin-dev)
        exec "$SCRIPT_DIR/scripts/admin-dev.sh" "$@"
        ;;
    stop)
        exec "$SCRIPT_DIR/scripts/stop.sh" "$@"
        ;;
    add-book)
        exec "$SCRIPT_DIR/scripts/add-book.sh" "$@"
        ;;
    process-books)
        exec "$SCRIPT_DIR/scripts/process-books.sh" "$@"
        ;;
    convert)
        exec "$SCRIPT_DIR/scripts/convert.sh" "$@"
        ;;
    convert-help)
        exec "$SCRIPT_DIR/scripts/convert-help.sh" "$@"
        ;;
    summarize-to-epub-pdf)
        exec "$SCRIPT_DIR/scripts/summarize-to-epub-pdf.sh" "$@"
        ;;
    *)
        echo "Error: Unknown command '$COMMAND'"
        echo ""
        echo "Run './monib.sh help' to see available commands"
        exit 1
        ;;
esac
