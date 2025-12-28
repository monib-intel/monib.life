#!/usr/bin/env bash
# Script: scripts/convert-help.sh
# Description: Show conversion service help

# Source common functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

cd_project_root

if [ ! -d "services/conversion-service" ]; then
    log_error "Error: conversion-service not found"
    exit 1
fi

cd services/conversion-service && python src/cli.py --help
