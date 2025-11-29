#!/usr/bin/env bash
# Sync content from vault to website/content directory for Quartz

set -e

VAULT_DIR="vault"
CONTENT_DIR="website/content"

echo "Syncing vault to content directory..."

# Create content directory if it doesn't exist
mkdir -p "$CONTENT_DIR"

# Sync vault content to content directory
# Exclude .obsidian directory
rsync -av --delete \
  --exclude='.obsidian' \
  --exclude='.git' \
  "$VAULT_DIR/" "$CONTENT_DIR/"

echo "✓ Vault synced successfully!"
