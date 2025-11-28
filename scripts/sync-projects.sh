#!/bin/bash
# Sync external project documentation to vault/projects/
# Usage: ./scripts/sync-projects.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$PROJECT_ROOT/project-sources.json"
OUTPUT_DIR="$PROJECT_ROOT/vault/projects"

# Check if jq is available
if ! command -v jq &> /dev/null; then
    echo "Error: jq is required but not installed"
    exit 1
fi

# Check if config file exists
if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: Config file not found: $CONFIG_FILE"
    exit 1
fi

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Read projects from config
projects=$(jq -c '.projects[]' "$CONFIG_FILE")

echo "Syncing projects..."

while IFS= read -r project; do
    name=$(echo "$project" | jq -r '.name')
    repo=$(echo "$project" | jq -r '.repo')
    branch=$(echo "$project" | jq -r '.branch // "main"')
    
    echo "Processing: $name ($repo)"
    
    # Create project directory
    project_dir="$OUTPUT_DIR/$name"
    mkdir -p "$project_dir"
    
    # Get files to sync
    files=$(echo "$project" | jq -r '.sync[]')
    
    for file in $files; do
        # Download file from GitHub raw content
        url="https://raw.githubusercontent.com/$repo/$branch/$file"
        output_file="$project_dir/$(basename "$file")"
        
        echo "  Downloading: $file"
        if curl -sSL "$url" -o "$output_file" 2>/dev/null; then
            echo "  Saved: $output_file"
        else
            echo "  Warning: Failed to download $file"
        fi
    done
done <<< "$projects"

echo "Sync complete!"
