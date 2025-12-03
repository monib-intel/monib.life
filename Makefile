# Makefile for monib.life - Quartz-based personal website

.PHONY: all install dev build test clean deploy sync help

# Default target
all: help

# Install dependencies
install:
	@echo "Installing dependencies..."
	npm install

# Start development server with hot reload
dev:
	@echo "Starting development server..."
	npx quartz build --serve

# Build for production
build:
	@echo "Building for production..."
	npx quartz build

# Run tests
test:
	@echo "Running tests..."
	@echo "Checking required files..."
	@test -f quartz.config.ts || (echo "Error: quartz.config.ts not found" && exit 1)
	@test -f package.json || (echo "Error: package.json not found" && exit 1)
	@test -d vault || (echo "Error: vault directory not found" && exit 1)
	@test -d vault/.obsidian || echo "Warning: vault/.obsidian directory not found"
	@echo "Validating vault content..."
	@test -f vault/index.md || (echo "Error: vault/index.md not found" && exit 1)
	@echo "Checking scripts..."
	@test -x scripts/sync-projects.sh || chmod +x scripts/sync-projects.sh
	@echo "All tests passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf public/
	rm -rf .quartz-cache/
	rm -rf node_modules/
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
