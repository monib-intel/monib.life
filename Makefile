# Makefile for monib.life - Quartz-based personal website
#
# This repository uses submodules for content sources:
#   - vault/   - Obsidian vault (content source)
#   - website/ - Quartz website (build system)

.PHONY: all install dev build test clean deploy sync help admin-server admin-dev admin-ui admin-full add-book process-books stop convert convert-help summarize-to-epub-pdf

# Website directory (submodule)
WEBSITE_DIR := website
CONTENT_DIR := vault
CONVERSION_SERVICE_DIR := services/conversion-service
ADMIN_API_DIR := admin-api
ADMIN_UI_DIR := admin-ui
ADMIN_PORT := 3000
ADMIN_UI_PORT := 5173
QUARTZ_PORT := 8080

# Default target
all: help

# Initialize submodules and install dependencies
install:
	@echo "Installing dependencies..."
	@echo "Updating submodules..."
	git submodule update --init --recursive
	cd $(WEBSITE_DIR) && npm install
	@echo "Installing admin API dependencies..."
	cd $(ADMIN_API_DIR) && pip install -e .
	@echo "Installing admin UI dependencies..."
	cd $(ADMIN_UI_DIR) && npm install

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

# Start admin API server only
admin-server:
	@echo "Starting admin API server on port $(ADMIN_PORT)..."
	@echo "Access API docs at: http://localhost:$(ADMIN_PORT)/docs"
	cd $(ADMIN_API_DIR) && uvicorn app.main:app --reload --port $(ADMIN_PORT)

# Start admin UI only
admin-ui:
	@echo "Starting admin UI on port $(ADMIN_UI_PORT)..."
	@echo "Access at: http://localhost:$(ADMIN_UI_PORT)"
	cd $(ADMIN_UI_DIR) && npm run dev

# Start admin API + UI (runs both in parallel)
admin-full:
	@echo "Starting admin API (port $(ADMIN_PORT)) and admin UI (port $(ADMIN_UI_PORT))..."
	@echo "Admin UI: http://localhost:$(ADMIN_UI_PORT)"
	@echo "Admin API: http://localhost:$(ADMIN_PORT)/docs"
	@trap 'kill 0' EXIT; \
	cd $(ADMIN_API_DIR) && uvicorn app.main:app --reload --port $(ADMIN_PORT) & \
	cd $(ADMIN_UI_DIR) && npm run dev

# Start admin + Quartz dev server (runs all in parallel)
admin-dev: sync-vault
	@echo "Starting admin API (port $(ADMIN_PORT)), admin UI (port $(ADMIN_UI_PORT)), and Quartz dev server (port $(QUARTZ_PORT))..."
	@echo "Admin UI: http://localhost:$(ADMIN_UI_PORT)"
	@echo "Admin API: http://localhost:$(ADMIN_PORT)/docs"
	@echo "Quartz site: http://localhost:$(QUARTZ_PORT)"
	@trap 'kill 0' EXIT; \
	cd $(ADMIN_API_DIR) && uvicorn app.main:app --reload --port $(ADMIN_PORT) & \
	cd $(ADMIN_UI_DIR) && npm run dev & \
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
	@pkill -f "uvicorn app.main:app" || true
	@pkill -f "vite" || true
	@pkill -f "quartz" || true
	@pkill -f "node" || true
	@echo "All services stopped"

# Convert ebook files to Markdown
convert:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make convert FILE=path/to/book.epub [OUTPUT=./output]"; \
		exit 1; \
	fi
	@echo "Converting $(FILE) to Markdown..."
	@cd $(CONVERSION_SERVICE_DIR) && python src/cli.py $(FILE) --output-dir $(if $(OUTPUT),$(OUTPUT),./output)

# Show conversion service help
convert-help:
	@cd $(CONVERSION_SERVICE_DIR) && python src/cli.py --help

# Summarize book to Markdown and convert to PDF
summarize-to-epub-pdf:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make summarize-to-epub-pdf FILE=path/to/book.epub"; \
		exit 1; \
	fi
	@echo "Summarizing $(FILE)..."
	@mkdir -p private/book-summaries-md vault/book-summaries-pdf
	@cd services/reading-assistant && uv run python scripts/process_epub.py "$(FILE)" --extract --summary -o ../../private/book-summaries-md
	@echo "Converting summary to PDF..."
	@SUMMARY_FILE=$$(find private/book-summaries-md -name "*_AnalyticalReading.md" -type f | head -1); \
	if [ -z "$$SUMMARY_FILE" ]; then \
		echo "Error: Could not find summary file"; \
		exit 1; \
	fi; \
	cd services/conversion-service && ./convert.sh "../../$$SUMMARY_FILE" --output-dir ../../vault/book-summaries-pdf
	@echo "✅ Summary and PDF complete!"
	@echo "   Markdown: private/book-summaries-md/"
	@echo "   PDF: vault/book-summaries-pdf/"

# Show help
help:
	@echo "monib.life - Build and development commands"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Build & Deployment Targets:"
	@echo "  install      Install dependencies (npm, pip)"
	@echo "  dev          Start development server with hot reload"
	@echo "  build        Build site for production"
	@echo "  test         Run tests and validate configuration"
	@echo "  clean        Remove build artifacts and node_modules"
	@echo "  sync         Sync external project documentation"
	@echo "  deploy       Build and deploy to production (placeholder)"
	@echo ""
	@echo "Admin Dashboard Targets:"
	@echo "  admin-server Start admin API server only (port $(ADMIN_PORT))"
	@echo "  admin-ui     Start admin UI only (port $(ADMIN_UI_PORT))"
	@echo "  admin-full   Start admin API + UI (ports $(ADMIN_PORT), $(ADMIN_UI_PORT))"
	@echo "  admin-dev    Start admin API + UI + Quartz dev server"
	@echo "  stop         Stop all running services"
	@echo ""
	@echo "Content & Services Targets:"
	@echo "  sync-vault   Sync vault content to website/content"
	@echo "  add-book     Add a book to processing queue (FILE=path/to/book)"
	@echo "  process-books Process all books in queue"
	@echo ""
	@echo "Conversion Service Targets:"
	@echo "  convert              Convert ebook to Markdown (FILE=path/to/book.epub [OUTPUT=./output])"
	@echo "  convert-help         Show conversion service help"
	@echo "  summarize-to-epub-pdf Summarize book to Markdown, then convert to PDF"
	@echo "                        (FILE=path/to/book.epub)"
	@echo ""
	@echo "  help                 Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install                               # Install all dependencies"
	@echo "  make dev                                   # Start local development server"
	@echo "  make admin-full                            # Start admin dashboard (API + UI)"
	@echo "  make admin-dev                             # Start everything (admin + Quartz)"
	@echo "  make add-book FILE=book.epub               # Add book to queue"
	@echo "  make convert FILE=book.epub                # Convert book to Markdown"
	@echo "  make summarize-to-epub-pdf FILE=book.epub # Summarize book to Markdown & PDF"
	@echo "  make stop                                  # Stop all services"
