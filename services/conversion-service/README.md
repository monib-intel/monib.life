# Conversion Service

Standalone service for converting ebook formats (EPUB, PDF, MOBI) to Markdown.

## Quick Start

```bash
# Install dependencies
cd services/conversion-service
pip install -e .

# Convert a single book
python src/cli.py book.epub --output-dir ./output

# Convert multiple books in parallel
python src/cli.py books/*.epub --parallel --workers 4 --output-dir ./output

# From main repository using Makefile
cd ../../
make convert FILE=path/to/book.epub OUTPUT=./output
```

## Overview

The conversion-service provides a clean, reusable interface for converting various ebook formats to Markdown. It has been extracted from the reading-assistant to enable:

- **Reusability**: Use conversion functionality across multiple services
- **Separation of Concerns**: Keep conversion logic separate from AI analysis
- **Independent Development**: Update converters without touching other services
- **Testability**: Test conversion logic in isolation
- **Flexibility**: Use as a library or CLI tool

## Features

- **Multiple Format Support**: EPUB, PDF, MOBI, AZW, AZW3
- **Markdown Output**: Clean, structured Markdown with frontmatter
- **Batch Processing**: Convert multiple files at once
- **Parallel Processing**: Speed up batch conversions with parallel workers
- **Image Extraction**: Optionally extract and save images
- **Header Cleaning**: Normalize headers for better readability
- **CLI Interface**: Easy-to-use command-line tool

## Installation

### Using Nix (Recommended)

```bash
cd services/conversion-service
nix develop
```

### Using pip

```bash
cd services/conversion-service
pip install -e .
```

For MOBI support, you'll also need Calibre:

```bash
# On Ubuntu/Debian
sudo apt-get install calibre

# On macOS
brew install calibre

# On NixOS (included in flake.nix)
# Already available in nix develop
```

## Usage

### Command Line

#### Convert a Single File

```bash
convert book.epub --output-dir ./markdown
```

#### Convert Multiple Files

```bash
convert book1.epub book2.pdf book3.mobi --output-dir ./markdown
```

#### Batch Conversion with Parallel Processing

```bash
convert books/*.epub --parallel --workers 4 --output-dir ./markdown
```

#### Extract Images and Clean Headers

```bash
convert book.pdf --extract-images --clean-headers --output-dir ./markdown
```

#### Full Options

```bash
convert --help
```

### As a Library

```python
from pathlib import Path
from converters import EPUBConverter, PDFConverter, MOBIConverter

# Convert EPUB
epub_converter = EPUBConverter()
output_path = epub_converter.convert(
    input_path=Path("book.epub"),
    output_dir=Path("./output"),
    extract_images=True,
    clean_headers=True
)
print(f"Converted to: {output_path}")

# Convert PDF
pdf_converter = PDFConverter()
output_path = pdf_converter.convert(
    input_path=Path("document.pdf"),
    output_dir=Path("./output"),
    clean_headers=True
)

# Convert MOBI (requires Calibre)
mobi_converter = MOBIConverter()
output_path = mobi_converter.convert(
    input_path=Path("book.mobi"),
    output_dir=Path("./output")
)
```

### Auto-detect Format

```python
from pathlib import Path
from converters import EPUBConverter, PDFConverter, MOBIConverter

def convert_file(file_path: Path, output_dir: Path):
    """Convert any supported format."""
    converters = [EPUBConverter(), PDFConverter(), MOBIConverter()]
    
    for converter in converters:
        if converter.supports_format(file_path):
            return converter.convert(file_path, output_dir)
    
    raise ValueError(f"Unsupported format: {file_path.suffix}")

# Use it
output = convert_file(Path("book.epub"), Path("./output"))
```

## Output Format

Converted files include YAML frontmatter with metadata:

```markdown
---
title: Book Title
author: Author Name
status: draft
---

# Chapter 1

Content here...
```

## Architecture

```
conversion-service/
├── src/
│   ├── __init__.py
│   ├── cli.py              # Command-line interface
│   └── converters/
│       ├── __init__.py
│       ├── base_converter.py    # Base class for all converters
│       ├── epub_converter.py    # EPUB → Markdown
│       ├── pdf_converter.py     # PDF → Markdown
│       └── mobi_converter.py    # MOBI → Markdown (via EPUB)
├── pyproject.toml          # Python package configuration
├── flake.nix              # Nix development environment
└── README.md              # This file
```

## Converters

### EPUB Converter

Uses `ebooklib` to parse EPUB files and extract:
- Metadata (title, author)
- Text content
- Images (optional)

### PDF Converter

Uses `pdfplumber` to extract text from PDF files:
- Page-by-page text extraction
- Basic header detection
- Clean output formatting

### MOBI Converter

Uses Calibre's `ebook-convert` to convert MOBI to EPUB first, then uses the EPUB converter. Supports:
- MOBI format
- AZW format
- AZW3 format

## Integration with Other Services

### Using as a Python Library

The conversion-service is designed to be imported and used by other services in the monib.life ecosystem. Here's how to integrate it:

#### Option 1: Direct Import (Same Repository)

```python
# Add conversion-service/src to PYTHONPATH or use relative imports
import sys
from pathlib import Path

# Add conversion-service to path
conversion_service_path = Path(__file__).parent.parent / "conversion-service" / "src"
sys.path.insert(0, str(conversion_service_path))

from converters import EPUBConverter, PDFConverter, MOBIConverter

# Use the converters
converter = EPUBConverter()
markdown_path = converter.convert(
    input_path=Path("book.epub"),
    output_dir=Path("./output"),
    extract_images=True
)
```

#### Option 2: Subprocess Call (Isolated)

```python
import subprocess
from pathlib import Path

def convert_book(input_file: Path, output_dir: Path) -> Path:
    """Convert a book using the conversion-service CLI."""
    result = subprocess.run(
        [
            "python",
            "services/conversion-service/src/cli.py",
            str(input_file),
            "--output-dir", str(output_dir)
        ],
        capture_output=True,
        text=True,
        check=True
    )
    return output_dir / f"{input_file.stem}.md"
```

#### Option 3: Install as Package

```bash
# From the conversion-service directory
pip install -e .

# Then in your service
from converters import EPUBConverter
```

### reading-assistant

The reading-assistant can use conversion-service to separate conversion from AI analysis:

```python
from converters import EPUBConverter

# Step 1: Convert to Markdown
converter = EPUBConverter()
markdown_path = converter.convert(epub_file, output_dir)

# Step 2: Read the markdown and proceed with AI analysis
with open(markdown_path) as f:
    content = f.read()
    # Perform 8-stage AI analysis on content
    analyze_book(content)
```

### syntopical-reading-assistant

Similarly, the syntopical reading assistant can convert multiple books:

```python
from pathlib import Path
from converters import EPUBConverter

converter = EPUBConverter()
for book in book_list:
    markdown_path = converter.convert(book, output_dir)
    # Analyze for syntopical reading
```

## Development

### Setup Development Environment

```bash
cd services/conversion-service
nix develop  # Or pip install -e ".[dev]"
```

### Run Tests

```bash
pytest
```

### Code Formatting

```bash
black src/
ruff check src/
```

## Dependencies

### Required

- Python >= 3.9
- ebooklib >= 0.18
- beautifulsoup4 >= 4.12.0
- html2text >= 2020.1.16
- pdfplumber >= 0.10.0
- lxml >= 4.9.0

### Optional

- Calibre (for MOBI support)

### Development

- pytest >= 7.0.0
- pytest-cov >= 4.0.0
- black >= 23.0.0
- ruff >= 0.1.0

## Roadmap

- [ ] Add unit tests for each converter
- [ ] Support for more formats (AZW4, DJVU)
- [ ] Improved image handling for PDFs
- [ ] OCR support for scanned PDFs
- [ ] Metadata extraction improvements
- [ ] Custom templates for output formatting
- [ ] Progress indicators for large files
- [ ] Configuration file support

## License

MIT License - See LICENSE file for details

## Related

- [reading-assistant](../reading-assistant) - AI-powered book analysis
- [syntopical-reading-assistant](../syntopical-reading-assistant) - Cross-book analysis
- [monib.life](../../README.md) - Main repository

## References

- Issue [#16](https://github.com/monib-intel/reading-bot/issues/16) - Original refactoring request
- [ebooklib documentation](https://github.com/aerkalov/ebooklib)
- [pdfplumber documentation](https://github.com/jsvine/pdfplumber)
- [Calibre command line tools](https://manual.calibre-ebook.com/generated/en/ebook-convert.html)
