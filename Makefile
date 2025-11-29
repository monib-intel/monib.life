# Makefile for monib.life - Quartz-based personal website

.PHONY: all install dev build test clean deploy sync sync-vault help admin-server admin-dev add-book process-books

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
	@echo "Running integration tests..."
	npm test
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

# Admin server targets

# Start admin server only
admin-server:
	@echo "Starting admin server on port 3000..."
	@echo "Access at: http://localhost:3000"
	@echo "Default password: admin (set ADMIN_PASSWORD env var for production)"
	cd reading-assistant && python server.py

# Start admin server + Quartz dev server (runs both in parallel)
admin-dev: sync-vault
	@echo "Starting admin server (port 3000) and Quartz dev server (port 8080)..."
	@echo "Admin UI: http://localhost:3000"
	@echo "Quartz site: http://localhost:8080"
	@trap 'kill 0' EXIT; \
	cd reading-assistant && python server.py & \
	npx quartz build --serve --port 8080

# Add a book to processing queue
add-book:
ifndef FILE
	$(error FILE is required. Usage: make add-book FILE=path/to/book.epub)
endif
	@echo "Adding book to queue: $(FILE)"
	@test -f "$(FILE)" || (echo "Error: File not found: $(FILE)" && exit 1)
	@cp "$(FILE)" private/books/manual/
	@echo "✓ Book added to private/books/manual/"
	@echo "Run 'make process-books' to process it"

# Process all books in queue
process-books:
	@echo "Processing books in queue..."
	@echo "Note: Full reading-bot integration pending"
	@echo "Books in queue:"
	@echo "Uploads:"
	@find private/books/uploads -maxdepth 1 -type f \( -name "*.epub" -o -name "*.pdf" -o -name "*.mobi" -o -name "*.azw" -o -name "*.azw3" \) 2>/dev/null | grep . || echo "  (none)"
	@echo "Manual:"
	@find private/books/manual -maxdepth 1 -type f \( -name "*.epub" -o -name "*.pdf" -o -name "*.mobi" -o -name "*.azw" -o -name "*.azw3" \) 2>/dev/null | grep . || echo "  (none)"
	@echo "API:"
	@find private/books/api -maxdepth 1 -type f \( -name "*.epub" -o -name "*.pdf" -o -name "*.mobi" -o -name "*.azw" -o -name "*.azw3" \) 2>/dev/null | grep . || echo "  (none)"

# Show help
help:
	@echo "monib.life - Build and development commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Targets:"
	@echo "  install       Install dependencies and update submodules"
	@echo "  dev           Sync vault and start development server"
	@echo "  build         Sync vault and build site for production"
	@echo "  test          Run tests and validate configuration"
	@echo "  clean         Remove build artifacts and node_modules"
	@echo "  sync-vault    Sync vault content to content directory"
	@echo "  sync          Sync all content (vault + external projects)"
	@echo "  deploy        Build and deploy to production (placeholder)"
	@echo "  admin-server  Start admin server only (port 3000)"
	@echo "  admin-dev     Start admin server + Quartz dev server"
	@echo "  add-book      Add a book to processing queue (FILE=path/to/book)"
	@echo "  process-books Process all books in queue"
	@echo "  help          Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install                    # Install all dependencies"
	@echo "  make dev                        # Start local development server"
	@echo "  make build                      # Build production site"
	@echo "  make test                       # Run all tests"
	@echo "  make admin-dev                  # Start admin + dev servers"
	@echo "  make add-book FILE=book.epub    # Add book to queue"
