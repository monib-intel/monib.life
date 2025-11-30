# Makefile for PDF Conversion Service
# Convert ebooks to PDF optimized for Supernote e-ink reader

.PHONY: all convert batch test clean help install check

# Default directories
INPUT_DIR ?= ./input
OUTPUT_DIR ?= ./output
TEST_DIR ?= ./test

# Default conversion settings
FONT ?= Literata
FONT_SIZE ?= 12
PAPER_SIZE ?= a5

# Scripts
CONVERT_SCRIPT := ./convert.sh
BATCH_SCRIPT := ./batch-convert.sh

# Default target
all: help

# Install/check dependencies
install: check
	@echo "Dependencies installed via Nix flake."
	@echo "Run 'nix develop' to enter the development shell."

# Check if dependencies are available
check:
	@echo "Checking dependencies..."
	@command -v ebook-convert >/dev/null 2>&1 || \
		(echo "Error: ebook-convert not found. Run 'nix develop' first." && exit 1)
	@echo "✓ ebook-convert found"
	@ebook-convert --version 2>&1 | head -1
	@echo ""
	@echo "All dependencies available!"

# Convert a single file
# Usage: make convert FILE=path/to/book.epub
convert:
ifndef FILE
	$(error FILE is required. Usage: make convert FILE=path/to/book.epub)
endif
	@chmod +x $(CONVERT_SCRIPT)
	@$(CONVERT_SCRIPT) \
		--font "$(FONT)" \
		--size $(FONT_SIZE) \
		--paper $(PAPER_SIZE) \
		$(if $(OUTPUT),-o "$(OUTPUT)",) \
		$(if $(VERBOSE),-v,) \
		"$(FILE)"

# Batch convert all ebooks in a directory
# Usage: make batch DIR=./books [OUTPUT_DIR=./pdfs]
batch:
ifndef DIR
	$(error DIR is required. Usage: make batch DIR=./books)
endif
	@chmod +x $(BATCH_SCRIPT) $(CONVERT_SCRIPT)
	@$(BATCH_SCRIPT) \
		--font "$(FONT)" \
		--size $(FONT_SIZE) \
		--paper $(PAPER_SIZE) \
		$(if $(RECURSIVE),-r,) \
		$(if $(SKIP_EXISTING),--skip-existing,) \
		$(if $(VERBOSE),-v,) \
		"$(DIR)" \
		$(if $(OUTPUT_DIR),"$(OUTPUT_DIR)",)

# Run tests
test: check
	@echo "Running conversion tests..."
	@mkdir -p $(TEST_DIR)
	@echo "Creating test HTML file..."
	@echo '<!DOCTYPE html><html><body><h1>Test Document</h1><p>This is a test paragraph for PDF conversion testing.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p></body></html>' > $(TEST_DIR)/test.html
	@echo "Converting test file..."
	@chmod +x $(CONVERT_SCRIPT)
	@$(CONVERT_SCRIPT) --verbose "$(TEST_DIR)/test.html" "$(TEST_DIR)/test.pdf"
	@echo ""
	@echo "Verifying output..."
	@test -f "$(TEST_DIR)/test.pdf" && echo "✓ PDF file created successfully" || (echo "✗ PDF file not created" && exit 1)
	@echo ""
	@echo "All tests passed!"

# Clean up test artifacts
clean:
	@echo "Cleaning up..."
	@rm -rf $(TEST_DIR)
	@rm -rf $(OUTPUT_DIR)
	@echo "Clean complete!"

# Show help
help:
	@echo "PDF Conversion Service - Makefile"
	@echo ""
	@echo "Converts ebooks to PDF optimized for Supernote e-ink reader."
	@echo ""
	@echo "Usage: make <target> [OPTIONS]"
	@echo ""
	@echo "Targets:"
	@echo "  install         Check/install dependencies (via Nix)"
	@echo "  check           Verify all dependencies are available"
	@echo "  convert         Convert a single file to PDF"
	@echo "  batch           Batch convert all ebooks in a directory"
	@echo "  test            Run conversion tests"
	@echo "  clean           Remove test artifacts"
	@echo "  help            Show this help message"
	@echo ""
	@echo "Convert Options:"
	@echo "  FILE=path       Input file path (required for convert)"
	@echo "  OUTPUT=path     Output file path (optional)"
	@echo "  VERBOSE=1       Enable verbose output"
	@echo ""
	@echo "Batch Options:"
	@echo "  DIR=path        Input directory (required for batch)"
	@echo "  OUTPUT_DIR=path Output directory (optional)"
	@echo "  RECURSIVE=1     Process subdirectories"
	@echo "  SKIP_EXISTING=1 Skip files with existing PDFs"
	@echo "  VERBOSE=1       Enable verbose output"
	@echo ""
	@echo "Conversion Settings:"
	@echo "  FONT=name       Font family (default: $(FONT))"
	@echo "  FONT_SIZE=n     Font size in pt (default: $(FONT_SIZE))"
	@echo "  PAPER_SIZE=size Paper size (default: $(PAPER_SIZE))"
	@echo ""
	@echo "Examples:"
	@echo "  make check"
	@echo "  make convert FILE=book.epub"
	@echo "  make convert FILE=book.epub OUTPUT=output.pdf VERBOSE=1"
	@echo "  make batch DIR=./books"
	@echo "  make batch DIR=./books OUTPUT_DIR=./pdfs RECURSIVE=1"
	@echo "  make batch DIR=./library SKIP_EXISTING=1 FONT_SIZE=14"
	@echo "  make test"
	@echo ""
	@echo "Quick Start:"
	@echo "  1. nix develop              # Enter Nix shell with Calibre"
	@echo "  2. make check               # Verify dependencies"
	@echo "  3. make test                # Run test conversion"
	@echo "  4. make convert FILE=x.epub # Convert your ebook"
