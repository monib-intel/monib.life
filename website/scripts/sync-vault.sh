#!/bin/bash

# Sync vault content to website/src/content/content directory
# Excludes Obsidian metadata and git files

set -e

VAULT_DIR="../vault"
CONTENT_DIR="./src/content/content"

echo "Syncing vault to content directory..."

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Sync vault to content, excluding Obsidian and git files
rsync -av --delete \
  --exclude='.obsidian/' \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='*.tmp' \
  --exclude='.gitkeep' \
  "$VAULT_DIR/" "$CONTENT_DIR/"

echo "✓ Sync complete!"
