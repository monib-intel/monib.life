# PDF Conversion Service

Convert ebooks to PDF optimized for Supernote e-ink reader with proper pagination and Literata font.

## Overview

This service uses Calibre's `ebook-convert` tool to convert various ebook formats (EPUB, MOBI, AZW, AZW3, etc.) to PDF with settings optimized for the Supernote e-ink display.

## Features

- **Multiple input formats**: EPUB, MOBI, AZW, AZW3, FB2, TXT, HTML
- **Literata font**: Optimized for e-ink readability
- **Proper pagination**: Page breaks at chapters, page numbers in footer
- **A5 paper size**: Matches Supernote display well
- **Batch processing**: Convert entire directories of ebooks
- **Nix flake**: Reproducible development environment

## Quick Start

### With Nix (Recommended)

```bash
# Enter development shell
cd services/pdf-conversion
nix develop

# Check dependencies
make check

# Convert a single file
make convert FILE=book.epub

# Batch convert a directory
make batch DIR=./books
```

### Standalone (Manual Calibre installation)

```bash
# Ensure Calibre is installed
ebook-convert --version

# Convert single file
./convert.sh book.epub output.pdf

# Batch convert
./batch-convert.sh ./books ./pdfs
```

## Usage

### Single File Conversion

```bash
# Basic usage
./convert.sh book.epub

# With custom output path
./convert.sh book.epub custom-name.pdf

# With custom settings
./convert.sh --font "Georgia" --size 14 --paper a4 book.epub

# Verbose output
./convert.sh -v book.mobi
```

### Batch Conversion

```bash
# Convert all ebooks in directory
./batch-convert.sh ./books

# Convert to separate output directory
./batch-convert.sh ./books ./pdfs

# Recursive with skip existing
./batch-convert.sh -r --skip-existing ./library ./output

# Custom font settings
./batch-convert.sh -f "Literata" -s 14 ./ebooks
```

### Using Make

```bash
# Single file
make convert FILE=book.epub
make convert FILE=book.epub OUTPUT=output.pdf VERBOSE=1

# Batch
make batch DIR=./books
make batch DIR=./books OUTPUT_DIR=./pdfs RECURSIVE=1 SKIP_EXISTING=1

# Custom settings
make convert FILE=book.epub FONT="Georgia" FONT_SIZE=14 PAPER_SIZE=a4
```

## Options

### Convert Script Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--font` | `-f` | Literata | Font family name |
| `--size` | `-s` | 12 | Base font size (pt) |
| `--paper` | `-p` | a5 | Paper size (a4, a5, letter, etc.) |
| `--margin` | `-m` | 36 | All margins (pt) |
| `--line-height` | `-l` | 1.4 | Line height multiplier |
| `--output` | `-o` | - | Output file path |
| `--verbose` | `-v` | false | Verbose output |
| `--help` | `-h` | - | Show help |

### Batch Script Options

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--recursive` | `-r` | false | Process subdirectories |
| `--font` | `-f` | Literata | Font family name |
| `--size` | `-s` | 12 | Base font size (pt) |
| `--paper` | `-p` | a5 | Paper size |
| `--skip-existing` | - | false | Skip if PDF exists |
| `--verbose` | `-v` | false | Verbose output |
| `--help` | `-h` | - | Show help |

## Supernote Optimization

The default settings are optimized for Supernote e-ink readers:

- **Literata font**: High readability on e-ink displays
- **A5 paper size**: Fits the Supernote screen dimensions well
- **36pt margins**: Comfortable reading with space for annotations
- **1.4 line height**: Good spacing for readability
- **Page numbers**: Footer page numbering
- **Chapter breaks**: Page breaks at chapter boundaries
- **Embedded fonts**: Fonts embedded in PDF for consistency

## Supported Formats

### Input Formats

- `.epub` - Electronic Publication (most common)
- `.mobi` - Mobipocket (Kindle)
- `.azw` - Amazon Kindle
- `.azw3` - Amazon Kindle Format 8
- `.fb2` - FictionBook
- `.txt` - Plain text
- `.html` - HTML documents
- `.htmlz` - Zipped HTML

### Output Format

- `.pdf` - Portable Document Format (optimized for e-ink)

## Development

### Running Tests

```bash
nix develop
make test
```

### Project Structure

```
services/pdf-conversion/
├── flake.nix          # Nix flake for dependencies
├── Makefile           # Build and test automation
├── convert.sh         # Single file conversion script
├── batch-convert.sh   # Batch conversion script
└── README.md          # This documentation
```

### Dependencies

- **Calibre**: Provides `ebook-convert` tool
- **GNU Make**: Build automation
- **Bash**: Shell scripts

All dependencies are provided by the Nix flake.

## Troubleshooting

### "ebook-convert not found"

```bash
# Enter Nix shell
nix develop

# Or install Calibre manually
# macOS: brew install calibre
# Linux: apt install calibre
```

### Font not found

The script uses system fonts. Literata is available in most systems. If not:

```bash
# Use a different font
./convert.sh --font "Georgia" book.epub
./convert.sh --font "DejaVu Serif" book.epub
```

### PDF too large

```bash
# Reduce font size
./convert.sh --size 10 book.epub

# Use smaller margins
./convert.sh --margin 24 book.epub
```

### Conversion fails

```bash
# Check verbose output
./convert.sh -v book.epub

# Verify file format
file book.epub
```

## Integration with monib.life

This service can be integrated with the main project:

```bash
# From project root
cd services/pdf-conversion
nix develop
make convert FILE=../../private/books/manual/book.epub
```

Or add targets to the root Makefile for direct access.

## Related

- [Calibre documentation](https://manual.calibre-ebook.com/)
- [ebook-convert reference](https://manual.calibre-ebook.com/generated/en/ebook-convert.html)
- `services/reading-assistant/` - Reading assistant service
- `private/books/` - Book storage location
