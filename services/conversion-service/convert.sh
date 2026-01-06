#!/bin/bash
# Wrapper script to run the conversion CLI with proper library paths for WeasyPrint

# Set library path for Homebrew-installed libraries (macOS)
export DYLD_LIBRARY_PATH=/opt/homebrew/lib:$DYLD_LIBRARY_PATH

# Run the CLI with all passed arguments
uv run src/cli.py "$@"
