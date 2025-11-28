# Reading Assistant

AI assistant that generates book summaries from EPUB files.

## Overview

The Reading Assistant processes EPUB files and generates structured book summaries suitable for the monib.life website. Summaries are written to `vault/reading/` with draft status.

## Usage

### With Nix (Recommended)

```bash
# From project root
nix develop

cd services/reading-assistant
python main.py /path/to/book.epub
```

### Manual Setup

```bash
cd services/reading-assistant
pip install -r requirements.txt
python main.py /path/to/book.epub
```

## Input

- EPUB file (`.epub`)
- Optional: Custom output filename

## Output

Markdown file in `vault/reading/` with:

```yaml
---
status: draft
generated: YYYY-MM-DD
title: "Book Title"
author: "Author Name"
tags: [reading, book-summary]
isbn: "optional-isbn"
---

# Book Title

## Summary
[AI-generated summary]

## Key Takeaways
[Bullet points of main insights]

## Notable Quotes
[Selected quotes from the book]

## Personal Notes
[Section for human reviewer to add notes]
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes* |
| `AI_PROVIDER` | `openai` or `anthropic` | No (default: openai) |

*One of the API keys is required based on the chosen provider.

## Configuration

Create a `.env` file:

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
```

## Development

### Running Tests

```bash
nix develop
cd services/reading-assistant
python -m pytest tests/
```

### Code Style

```bash
black main.py
flake8 main.py
```

## Architecture

1. **EPUB Parser**: Extracts text content from EPUB chapters
2. **Chunker**: Splits content into manageable chunks for AI processing
3. **Summarizer**: Generates summaries using configured AI provider
4. **Formatter**: Outputs Quartz-compatible markdown with frontmatter

## Error Handling

- Invalid EPUB files: Clear error message, non-zero exit
- API failures: Retry with exponential backoff, fail after 3 attempts
- Permission errors: Verify vault directory is writable

## Future Enhancements

- Support for PDF files
- Multiple summary formats (short/detailed)
- Chapter-by-chapter summaries
- Integration with admin API
