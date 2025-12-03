# Makefile for monib.life - Quartz-based personal website
#
# This repository uses submodules for content sources:
#   - vault/   - Obsidian vault (content source)
#   - website/ - Quartz website (build system)

.PHONY: all install dev build test clean deploy sync help admin-server admin-dev add-book process-books stop

# Website directory (submodule)
WEBSITE_DIR := website
CONTENT_DIR := vault
ADMIN_PORT := 3000
QUARTZ_PORT := 8080

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

# Sync vault content to website/content
sync-vault:
	@echo "Syncing vault to website/content..."
	@./scripts/sync-vault.sh

# Start admin server only
admin-server:
	@echo "Starting admin server on port $(ADMIN_PORT)..."
	@echo "Access at: http://localhost:$(ADMIN_PORT)"
	@echo "Default password: admin (set ADMIN_PASSWORD env var for production)"
	cd services/reading-assistant && python server.py

# Start admin server + Quartz dev server (runs both in parallel)
admin-dev: sync-vault
	@echo "Starting admin server (port $(ADMIN_PORT)) and Quartz dev server (port $(QUARTZ_PORT))..."
	@echo "Admin UI: http://localhost:$(ADMIN_PORT)"
	@echo "Quartz site: http://localhost:$(QUARTZ_PORT)"
	@trap 'kill 0' EXIT; \
	cd services/reading-assistant && python server.py & \
	cd $(WEBSITE_DIR) && npx quartz build --serve --port $(QUARTZ_PORT)

# Add a book to processing queue
add-book:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make add-book FILE=path/to/book.epub"; \
		exit 1; \
	fi
	@echo "Adding $(FILE) to processing queue..."
	@cp "$(FILE)" services/reading-assistant/books/queue/

# Process all books in queue
process-books:
	@echo "Processing books in queue..."
	cd services/reading-assistant && python process_epub.py

# Kill all services
stop:
	@echo "Stopping all services..."
	@pkill -f "python server.py" || true
	@pkill -f "quartz" || true
	@pkill -f "node" || true
	@echo "All services stopped"

# Show help
help:
	@echo "monib.life - Build and development commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Build & Deployment Targets:"
	@echo "  install      Install dependencies (npm install)"
	@echo "  dev          Start development server with hot reload"
	@echo "  build        Build site for production"
	@echo "  test         Run tests and validate configuration"
	@echo "  clean        Remove build artifacts and node_modules"
	@echo "  sync         Sync external project documentation"
	@echo "  deploy       Build and deploy to production (placeholder)"
	@echo ""
	@echo "Admin & Services Targets:"
	@echo "  admin-server Start admin server only (port $(ADMIN_PORT))"
	@echo "  admin-dev    Start admin server + Quartz dev server"
	@echo "  sync-vault   Sync vault content to website/content"
	@echo "  add-book     Add a book to processing queue (FILE=path/to/book)"
	@echo "  process-books Process all books in queue"
	@echo "  stop         Stop all running services"
	@echo "  help         Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install                       # Install all dependencies"
	@echo "  make dev                           # Start local development server"
	@echo "  make build                         # Build production site"
	@echo "  make test                          # Run all tests"
	@echo "  make admin-dev                     # Start admin + dev servers"
	@echo "  make add-book FILE=book.epub       # Add book to queue"
	@echo "  make stop                          # Stop all services"
