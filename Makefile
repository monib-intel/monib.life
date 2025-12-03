# Makefile for monib.life - Quartz-based personal website
#
# This repository uses submodules for content sources:
#   - vault/   - Obsidian vault (content source)
#   - website/ - Quartz website (build system)

.PHONY: all install dev build test clean deploy sync help

# Website directory (submodule)
WEBSITE_DIR := website
CONTENT_DIR := vault

# Default target
all: help

# Initialize submodules and install dependencies
install:
	@echo "Installing dependencies..."
	@echo "Updating submodules..."
	git submodule update --init --recursive
	cd $(WEBSITE_DIR) && npm install

# Start development server with hot reload
dev: install
	@echo "Syncing vault content..."
	@./scripts/sync-vault.sh
	@echo "Starting development server..."
	cd $(WEBSITE_DIR) && npx quartz build --serve

# Build for production
build: install
	@echo "Syncing vault content..."
	@./scripts/sync-vault.sh
	@echo "Building for production..."
	cd $(WEBSITE_DIR) && npx quartz build

# Run tests
test:
	@echo "Running tests..."
	@echo "Checking required files..."
	@test -f $(WEBSITE_DIR)/quartz.config.ts || (echo "Error: $(WEBSITE_DIR)/quartz.config.ts not found" && exit 1)
	@test -f $(WEBSITE_DIR)/package.json || (echo "Error: $(WEBSITE_DIR)/package.json not found" && exit 1)
	@test -d $(CONTENT_DIR) || (echo "Error: $(CONTENT_DIR) directory not found" && exit 1)
	@test -d $(CONTENT_DIR)/.obsidian || echo "Warning: $(CONTENT_DIR)/.obsidian directory not found"
	@echo "Validating vault content..."
	@test -f $(CONTENT_DIR)/index.md || (echo "Error: $(CONTENT_DIR)/index.md not found" && exit 1)
	@echo "Checking scripts..."
	@test -x scripts/sync-projects.sh || chmod +x scripts/sync-projects.sh
	@test -x scripts/sync-vault.sh || chmod +x scripts/sync-vault.sh
	@echo "All tests passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf $(WEBSITE_DIR)/public/
	rm -rf $(WEBSITE_DIR)/.quartz-cache/
	rm -rf $(WEBSITE_DIR)/node_modules/
	@echo "Clean complete!"

# Sync external project documentation
sync:
	@echo "Syncing external projects..."
	./scripts/sync-projects.sh

# Deploy to production (placeholder - customize based on deployment target)
deploy: build
	@echo "Deploying to production..."
	@echo "Note: Deployment target not yet configured."
	@echo "Configure this target for your deployment method or use 'nix run .#deploy'"
	@echo "See README.md for deployment options (Netlify, Vercel, Cloudflare Pages, NixOS)."

# Show help
help:
	@echo "monib.life - Build and development commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  install    Install dependencies (npm install)"
	@echo "  dev        Start development server with hot reload"
	@echo "  build      Build site for production"
	@echo "  test       Run tests and validate configuration"
	@echo "  clean      Remove build artifacts and node_modules"
	@echo "  sync       Sync external project documentation"
	@echo "  deploy     Build and deploy to production (placeholder)"
	@echo "  help       Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install    # Install all dependencies"
	@echo "  make dev        # Start local development server"
	@echo "  make build      # Build production site"
	@echo "  make test       # Run all tests"
