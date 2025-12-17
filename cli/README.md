# Unified CLI for Reading Services

A command-line interface that orchestrates both **reading-assistant** and **syntopical-reading-assistant** services to provide a seamless reading workflow.

> **Note**: This CLI is a coordination layer that calls the underlying reading services. The actual script entry points (process_epub.py, compare.py, etc.) are defined by the respective submodule implementations. The CLI validates that these scripts exist before attempting to call them and provides helpful error messages if they are not found.

## Overview

The Unified CLI coordinates between the reading services to enable:
- Individual book analysis (8-stage reading-assistant process)
- Comparative analysis of multiple books (syntopical reading)
- Library integration and gap finding

## Installation

### With Nix (Recommended)

```bash
# From project root
nix develop

# The CLI is automatically available in the development shell
cd cli
python unified.py --help
```

### Manual Setup

```bash
# Ensure submodules are initialized
git submodule update --init --recursive

# Install Python dependencies (if needed)
pip install -r requirements.txt

# Make the CLI executable (optional)
chmod +x cli/unified.py
```

## Usage

The CLI provides a `reading` command with multiple subcommands:

### Full Syntopical Pipeline

Analyze multiple books and compare them in one go:

```bash
# Analyze and compare 3 books
python cli/unified.py analyze-syntopical book1.epub book2.epub book3.epub
```

This command:
1. Runs reading-assistant on each EPUB file (8 stages)
2. Compares all analyses using syntopical-reading-assistant (stages 1-3)
3. Connects to library (stage 4)
4. Finds gaps in knowledge (stage 5)

### Individual Commands

#### Analyze a Single Book

Run reading-assistant's 8-stage analysis on one book:

```bash
python cli/unified.py analyze book1.epub
```

Output: `book1_analysis.md`

#### Compare Multiple Analyses

Compare previously analyzed books (syntopical stages 1-3):

```bash
python cli/unified.py compare output1.md output2.md output3.md
```

Output: `comparison_output.md`

#### Connect to Library

Connect a comparison to your personal library (stage 4):

```bash
python cli/unified.py library-connect comparison.md
```

#### Find Knowledge Gaps

Identify gaps in your understanding (stage 5):

```bash
python cli/unified.py find-gaps comparison.md
```

## Command Reference

| Command | Description | Input | Output |
|---------|-------------|-------|--------|
| `analyze-syntopical` | Full pipeline: analyze + compare + connect + gaps | Multiple EPUB files | Comparison with library connections and gaps |
| `analyze` | Reading Assistant 8-stage analysis | Single EPUB file | Analysis markdown |
| `compare` | Syntopical comparison (stages 1-3) | Multiple analysis markdown files | Comparison markdown |
| `library-connect` | Connect to library (stage 4) | Comparison markdown | Updated comparison |
| `find-gaps` | Find knowledge gaps (stage 5) | Comparison markdown | Gap analysis |
| `batch-analyze` | Batch analyze multiple books in parallel | Multiple EPUB files | Multiple analysis markdown files |
| `batch-pipeline` | Full pipeline with parallel processing | Multiple EPUB files | Analysis files (+ comparison if --synthesize) |

## Examples

### Example 1: Complete Syntopical Analysis

```bash
# Analyze three books on the same topic
python cli/unified.py analyze-syntopical \
  "The Design of Everyday Things.epub" \
  "Don't Make Me Think.epub" \
  "The Elements of User Experience.epub"
```

### Example 2: Step-by-Step Workflow

```bash
# Step 1: Analyze each book individually
python cli/unified.py analyze "book1.epub"
python cli/unified.py analyze "book2.epub"
python cli/unified.py analyze "book3.epub"

# Step 2: Compare the analyses
python cli/unified.py compare book1_analysis.md book2_analysis.md book3_analysis.md

# Step 3: Connect to library
python cli/unified.py library-connect comparison_output.md

# Step 4: Find gaps
python cli/unified.py find-gaps comparison_output.md
```

### Example 3: Re-running Comparison

If you already have analyses and want to re-compare:

```bash
# Just run the comparison again
python cli/unified.py compare *.md
```

### Example 4: Batch Processing Multiple Books

Process multiple books in parallel with 3 workers:

```bash
# Batch analyze with progress tracking
python cli/unified.py batch-analyze book1.epub book2.epub book3.epub --workers 3 --progress

# Process all EPUB files in a directory
python cli/unified.py batch-analyze books/*.epub --workers 5 --progress
```

### Example 5: Full Pipeline with Batch Processing

Run complete pipeline with parallel processing and synthesis:

```bash
# Analyze + synthesize all books
python cli/unified.py batch-pipeline *.epub --workers 5 --synthesize --progress

# Just batch analyze (no synthesis)
python cli/unified.py batch-pipeline books/*.epub --workers 3 --progress
```

## Prerequisites

1. **Initialized Submodules**: The reading-assistant and syntopical-reading-assistant submodules must be initialized:
   ```bash
   git submodule update --init --recursive
   ```

2. **Service Dependencies**: Each service has its own dependencies. See:
   - `services/reading-assistant/README.md`
   - `services/syntopical-reading-assistant/README.md`

3. **Python**: Python 3.8 or higher

## Environment Variables

The underlying services may require environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI processing | Yes* |
| `ANTHROPIC_API_KEY` | Anthropic API key for AI processing | Yes* |
| `AI_PROVIDER` | AI provider (`openai` or `anthropic`) | No (default: openai) |

*One of the API keys is required based on the chosen provider.

Create a `.env` file in the project root:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Architecture

The Unified CLI acts as an orchestrator:

```
┌─────────────────────┐
│   Unified CLI       │
│   (cli/unified.py)  │
└──────────┬──────────┘
           │
           ├───────────────────┐
           │                   │
           ▼                   ▼
┌──────────────────┐  ┌──────────────────────┐
│ reading-assistant│  │ syntopical-reading-  │
│ (8 stages)       │  │ assistant (5 stages) │
│                  │  │                      │
│ • EPUB → Text    │  │ • Compare themes     │
│ • Extract themes │  │ • Find connections   │
│ • Analyze        │  │ • Library integration│
│ • Generate MD    │  │ • Gap analysis       │
└──────────────────┘  └──────────────────────┘
```

### Workflow Stages

**Reading Assistant (8 stages):**
1. EPUB extraction and parsing
2. Text preprocessing
3. Theme extraction
4. Chapter analysis
5. Key concepts identification
6. Quote extraction
7. Summary generation
8. Markdown output formatting

**Syntopical Reading Assistant (5 stages):**
1. Initial comparison
2. Theme mapping
3. Cross-reference building
4. Library connection
5. Gap analysis

## Batch/Parallel Processing

The CLI supports batch processing of multiple books with configurable concurrency:

### Features

- **Parallel Processing**: Process multiple books simultaneously using ThreadPoolExecutor
- **Configurable Workers**: Control concurrency with `--workers` flag (default: 3 for batch-analyze, 5 for batch-pipeline)
- **Progress Reporting**: Track progress with `--progress` flag
- **Graceful Error Handling**: Continue processing remaining books if one fails
- **Resource Management**: Control parallel execution to manage API rate limits and memory

### Batch Commands

#### `batch-analyze`

Analyze multiple books in parallel without synthesis:

```bash
# Basic usage - analyze 3 books with default workers (3)
python cli/unified.py batch-analyze book1.epub book2.epub book3.epub

# Custom worker count
python cli/unified.py batch-analyze *.epub --workers 5

# With progress tracking
python cli/unified.py batch-analyze books/*.epub --workers 3 --progress
```

**Output**: Individual analysis markdown files for each successfully processed book.

#### `batch-pipeline`

Full pipeline with parallel processing and optional synthesis:

```bash
# Analyze only (no synthesis)
python cli/unified.py batch-pipeline *.epub --workers 5 --progress

# Full pipeline: analyze + synthesize
python cli/unified.py batch-pipeline book1.epub book2.epub book3.epub --workers 5 --synthesize --progress
```

**Output**: 
- Analysis files for each book
- If `--synthesize` is used: comparison output, library connections, and gap analysis

### Performance Considerations

- **Worker Count**: Higher worker counts increase parallelism but consume more resources
  - Recommended: 3-5 workers for most use cases
  - Adjust based on available CPU/memory and API rate limits
- **API Rate Limits**: The underlying services may have API rate limits; use fewer workers if hitting limits
- **Memory Usage**: Each worker processes one book at a time; monitor memory with large EPUBs
- **I/O vs CPU**: The CLI uses ThreadPoolExecutor (suitable for I/O-bound tasks like API calls)

### Error Handling in Batch Mode

The CLI handles failures gracefully:

1. **Individual Failures**: If one book fails, others continue processing
2. **Summary Report**: Shows successful vs failed books at completion
3. **Exit Code**: Returns success (0) if at least one book was processed successfully
4. **Partial Results**: Synthesis steps proceed with successfully analyzed books

Example output:
```
📊 Batch analysis complete:
   ✓ Successful: 8/10
   ✗ Failed: 2/10
```

## Error Handling

The CLI provides clear error messages for common issues:

- **Submodule not initialized**: Prompts to run `git submodule update --init --recursive`
- **File not found**: Validates input files exist before processing
- **Service failures**: Reports which stage failed and continues where possible
- **Missing dependencies**: Points to relevant README files
- **Batch failures**: Reports individual book failures while continuing with others

## Integration with Makefile

The CLI can be integrated with the project Makefile for convenience:

```makefile
# Example additions to Makefile
read-book:
	python cli/unified.py analyze $(FILE)

compare-books:
	python cli/unified.py compare $(FILES)

syntopical:
	python cli/unified.py analyze-syntopical $(FILES)
```

Usage:
```bash
make read-book FILE=book.epub
make syntopical FILES="book1.epub book2.epub book3.epub"
```

## Development

### Project Structure

```
cli/
├── unified.py          # Main CLI implementation
├── README.md          # This file
└── requirements.txt   # Python dependencies (if needed)
```

### Adding New Commands

To add a new command:

1. Add a new subparser in `create_parser()`
2. Implement the command method in `ReadingCLI` class
3. Add the command handler in `main()`
4. Update this README

### Testing

```bash
# Test help output
python cli/unified.py --help
python cli/unified.py analyze --help

# Test with sample files
python cli/unified.py analyze test/sample.epub

# Test error handling
python cli/unified.py analyze nonexistent.epub
```

## Troubleshooting

### "Service not found or not initialized"

**Solution**: Initialize submodules:
```bash
git submodule update --init --recursive
```

### "File not found" errors

**Solution**: Ensure file paths are correct. Use absolute paths or paths relative to current directory:
```bash
python cli/unified.py analyze /full/path/to/book.epub
```

### Command not found

**Solution**: Run from project root or use full path:
```bash
cd /path/to/monib.life
python cli/unified.py <command>
```

### Permission denied

**Solution**: Make the script executable (Unix/Linux/Mac):
```bash
chmod +x cli/unified.py
./cli/unified.py --help
```

## Future Enhancements

- [ ] Progress bars for long-running operations (using tqdm or similar)
- [x] Parallel processing of multiple books (implemented via batch-analyze and batch-pipeline)
- [x] Batch processing from directory (implemented via batch commands with glob patterns)
- [ ] Configuration file support (.reading-cli.yaml)
- [ ] Output format options (JSON, HTML, PDF)
- [ ] Interactive mode for selecting books
- [ ] Integration with vault for automatic storage
- [ ] Resume interrupted operations
- [ ] Logging and verbose modes
- [ ] Plugin system for custom stages
- [ ] Caching to avoid re-processing books
- [ ] API rate limit coordination across services

## Contributing

When contributing to the Unified CLI:

1. Follow existing code style
2. Add docstrings to all functions
3. Update this README for new features
4. Test with both services
5. Handle errors gracefully

## Related Documentation

- [Reading Assistant README](../services/reading-assistant/README.md)
- [Syntopical Reading Assistant README](../services/syntopical-reading-assistant/README.md)
- [Main Project README](../README.md)
- [Flake Architecture](../docs/FLAKE_ARCHITECTURE.md)

## License

See [LICENSE.txt](../LICENSE.txt) in the project root.
