# Makefile for monib.life - Personal website and services
#
# This repository uses submodules for content sources:
#   - vault/   - Obsidian vault (content source)

.PHONY: all install test clean help add-book process-books stop convert convert-help summarize-epub-to-pdf website-dev website-sync website-build website-preview website-test website-install

# Directories
CONTENT_DIR := vault
CONVERSION_SERVICE_DIR := services/conversion-service
WEBSITE_DIR := website
WEBSITE_CONTENT_DIR := $(WEBSITE_DIR)/src/content/content

# Default target
all: help

# Initialize submodules and install dependencies
install: website-install
	@echo "Installing dependencies..."
	@echo "Updating submodules..."
	git submodule update --init --recursive
	@echo "Installing service dependencies..."
	cd services/reading-assistant && uv sync
	cd services/conversion-service && uv sync
	cd services/resume-assistant && pip install -r requirements.txt
	@echo "Dependencies installed!"

# Run tests
test:
	@echo "Running tests..."
	@echo "Checking required files..."
	@test -d $(CONTENT_DIR) || (echo "Error: $(CONTENT_DIR) directory not found" && exit 1)
	@test -d $(CONTENT_DIR)/.obsidian || echo "Warning: $(CONTENT_DIR)/.obsidian directory not found"
	@echo "Validating vault content..."
	@test -f $(CONTENT_DIR)/index.md || (echo "Error: $(CONTENT_DIR)/index.md not found" && exit 1)
	@echo "All tests passed!"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	rm -rf services/conversion-service/output/
	rm -rf services/conversion-service/.venv/
	rm -rf services/reading-assistant/.venv/
	rm -rf $(WEBSITE_DIR)/dist/
	rm -rf $(WEBSITE_DIR)/.astro/
	rm -rf $(WEBSITE_DIR)/node_modules/
	@echo "Clean complete!"

# Add a book to processing queue
add-book:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make add-book FILE=\"path/to/book.epub\""; \
		echo "Note: Use quotes if path contains spaces"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "Error: File not found: $(FILE)"; \
		echo "Note: Use quotes around FILE if path contains spaces"; \
		echo "Example: make add-book FILE=\"/path/with spaces/book.epub\""; \
		exit 1; \
	fi
	@echo "Adding $(FILE) to processing queue..."
	@cp "$(FILE)" services/reading-assistant/books/queue/

# Process all books in queue
process-books:
	@echo "Processing books in queue..."
	cd services/reading-assistant && uv run python process_epub.py

# Kill all services
stop:
	@echo "Stopping all services..."
	@pkill -f "python" || true
	@pkill -f "uv run" || true
	@echo "All services stopped"

# Convert ebook files to Markdown
convert:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make convert FILE=\"path/to/book.epub\" [OUTPUT=./output]"; \
		echo "Note: Use quotes if path contains spaces"; \
		exit 1; \
	fi
	@if [ ! -f "$(FILE)" ]; then \
		echo "Error: File not found: $(FILE)"; \
		echo "Note: Use quotes around FILE if path contains spaces"; \
		echo "Example: make convert FILE=\"/path/with spaces/book.epub\""; \
		exit 1; \
	fi
	@echo "Converting $(FILE) to Markdown..."
	@cd $(CONVERSION_SERVICE_DIR) && uv run python src/cli.py "$(FILE)" --output-dir $(if $(OUTPUT),$(OUTPUT),./output)

# Show conversion service help
convert-help:
	@cd $(CONVERSION_SERVICE_DIR) && uv run python src/cli.py --help

# Summarize book to Markdown and convert to PDF
summarize-epub-to-pdf:
	@if [ -z "$(FILE)" ]; then \
		echo "Error: FILE variable not set"; \
		echo "Usage: make summarize-epub-to-pdf FILE=\"path/to/book.epub\""; \
		echo "Note: Use quotes if path contains spaces"; \
		exit 1; \
	fi
	@if [ ! -e "$(FILE)" ]; then \
		echo "Error: File or directory not found: $(FILE)"; \
		echo "Note: Use quotes around FILE if path contains spaces"; \
		echo "Example: make summarize-epub-to-pdf FILE=\"/path/with spaces/book.epub\""; \
		exit 1; \
	fi
	@EPUB_FILE="$(FILE)"; \
	if [ -d "$$EPUB_FILE" ]; then \
		echo "📦 Detected unzipped EPUB directory, re-packaging..."; \
		REPACKAGED="$${EPUB_FILE%.*}-repackaged.epub"; \
		(cd "$$EPUB_FILE" && \
		rm -f "$$REPACKAGED" && \
		zip -X0 "$$REPACKAGED" mimetype && \
		zip -Xr9D "$$REPACKAGED" * -x mimetype); \
		echo "✅ EPUB re-packaged: $$REPACKAGED"; \
		EPUB_FILE="$$REPACKAGED"; \
	fi; \
	mkdir -p private/book-summaries-md private/book-summaries-pdf; \
	EXPECTED_SUMMARY=$$(cd services/reading-assistant && uv run python -c "from ebooklib import epub; import re; book = epub.read_epub('$$EPUB_FILE'); author = book.get_metadata('DC', 'creator')[0][0] if book.get_metadata('DC', 'creator') else 'Unknown'; title = book.get_metadata('DC', 'title')[0][0] if book.get_metadata('DC', 'title') else 'Unknown'; sa = re.sub(r'_+', '_', re.sub(r'[^a-zA-Z0-9_]', '_', author).strip('_')); st = re.sub(r'_+', '_', re.sub(r'[^a-zA-Z0-9_]', '_', title).strip('_')); print(f'../../private/book-summaries-md/{sa}_{st}_AnalyticalReading.md')" 2>/dev/null); \
	if [ -f "$$EXPECTED_SUMMARY" ]; then \
		echo "✓ Summary already exists: $$EXPECTED_SUMMARY"; \
		echo "Skipping API call, proceeding to PDF conversion..."; \
		SUMMARY_FILE="$$EXPECTED_SUMMARY"; \
	else \
		echo "Summarizing $$EPUB_FILE..."; \
		SUMMARY_OUTPUT=$$(cd services/reading-assistant && uv run python scripts/process_epub.py "$$EPUB_FILE" --extract --summary -o ../../private/book-summaries-md 2>&1 | tee /dev/tty | grep "Summary generated:" | sed 's/Summary generated: //'); \
		SUMMARY_FILE="$$SUMMARY_OUTPUT"; \
		if [ -z "$$SUMMARY_FILE" ]; then \
			echo "Error: Could not extract summary file path from output"; \
			exit 1; \
		fi; \
	fi; \
	echo "Converting summary to PDF..."; \
	cd services/conversion-service && ./convert.sh "$$SUMMARY_FILE" --output-dir ../../private/book-summaries-pdf
	@echo "✅ Summary and PDF complete!"
	@echo "   Markdown: private/book-summaries-md/"
	@echo "   PDF: private/book-summaries-pdf/"

# Website targets
website-dev:
	@echo "Starting website dev server..."
	@$(MAKE) website-sync
	cd $(WEBSITE_DIR) && npm run dev

website-sync:
	@echo "Syncing vault to website content..."
	@mkdir -p $(WEBSITE_CONTENT_DIR)
	cd $(WEBSITE_DIR) && bash scripts/sync-vault.sh

website-build:
	@echo "Building website..."
	@$(MAKE) website-sync
	cd $(WEBSITE_DIR) && npm run build

website-preview:
	@echo "Previewing built website..."
	cd $(WEBSITE_DIR) && npm run preview

website-test:
	@echo "Testing website..."
	cd $(WEBSITE_DIR) && npm run test

website-install:
	@echo "Installing website dependencies..."
	@test -d $(WEBSITE_DIR) || (echo "Error: Website directory not found" && exit 1)
	cd $(WEBSITE_DIR) && npm install

# Show help
help:
	@echo "monib.life - Personal website and services"
	@echo ""
	@echo "Usage: make <target>"
	@echo ""
	@echo "Setup Targets:"
	@echo "  install      Install dependencies (submodules and services)"
	@echo "  test         Run tests and validate configuration"
	@echo "  clean        Clean build artifacts"
	@echo "  stop         Stop all running services"
	@echo ""
	@echo "Content & Services Targets:"
	@echo "  add-book     Add a book to processing queue (FILE=path/to/book)"
	@echo "  process-books Process all books in queue"
	@echo ""
	@echo "Conversion Service Targets:"
	@echo "  convert              Convert ebook to Markdown (FILE=\"path/to/book.epub\" [OUTPUT=./output])"
	@echo "  convert-help         Show conversion service help"
	@echo "  summarize-epub-to-pdf Summarize book to Markdown, then convert to PDF"
	@echo "                        (FILE=\"path/to/book.epub\")"
	@echo "                        Note: Use quotes if path contains spaces"
	@echo ""
	@echo "Website Targets:"
	@echo "  website-dev          Start website development server"
	@echo "  website-sync         Sync vault content to website"
	@echo "  website-build        Build website for production"
	@echo "  website-preview      Preview built website"
	@echo "  website-test         Run website tests"
	@echo "  website-install      Install website dependencies"
	@echo ""
	@echo "  help                 Show this help message"
	@echo ""
	@echo "Examples:"
	@echo "  make install                                        # Install all dependencies"
	@echo "  make add-book FILE=\"book.epub\"                      # Add book to queue"
	@echo "  make convert FILE=\"book.epub\"                       # Convert book to Markdown"
	@echo "  make summarize-epub-to-pdf FILE=\"book.epub\"        # Summarize book to Markdown & PDF"
	@echo "  make summarize-epub-to-pdf FILE=\"/path/with spaces/book.epub\" # With spaces in path"
	@echo "  make stop                                           # Stop all services"
