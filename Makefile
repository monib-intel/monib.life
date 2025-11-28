# Makefile for monib.life - Quartz-based personal website

.PHONY: all install dev build test clean deploy sync sync-vault help

# Default target
all: help

# Install dependencies
install:
	@echo "Installing dependencies..."
	@echo "Updating submodules..."
	git submodule update --init --recursive
	npm install

# Start development server with hot reload
dev: sync-vault
	@echo "Starting development server..."
	npx quartz build --serve

# Build for production
build: sync-vault
	@echo "Building for production..."
	npx quartz build

# Run tests
test:
	@echo "Running tests..."
	@echo "Checking required files..."
	@test -f quartz.config.ts || (echo "Error: quartz.config.ts not found" && exit 1)
	@test -f package.json || (echo "Error: package.json not found" && exit 1)
	@test -d content || (echo "Error: content directory not found" && exit 1)
	@echo "Validating content..."
	@test -f content/index.md || echo "Warning: content/index.md not found"
	@echo "All tests passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf public/
	rm -rf .quartz-cache/
	rm -rf node_modules/
	@echo "Clean complete!"

# Sync vault content to content directory
sync-vault:
	@echo "Syncing vault to content directory..."
	@./scripts/sync-vault.sh

# Sync all (vault + future external projects)
sync: sync-vault
	@echo "All sync complete!"

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
	@echo "  install    Install dependencies and update submodules"
	@echo "  dev        Sync vault and start development server"
	@echo "  build      Sync vault and build site for production"
	@echo "  test       Run tests and validate configuration"
	@echo "  clean      Remove build artifacts and node_modules"
	@echo "  sync-vault Sync vault content to content directory"
	@echo "  sync       Sync all content (vault + external projects)"
	@echo "  deploy     Build and deploy to production (placeholder)"
	@echo "  help       Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install    # Install all dependencies"
	@echo "  make dev        # Start local development server"
	@echo "  make build      # Build production site"
	@echo "  make test       # Run all tests"
