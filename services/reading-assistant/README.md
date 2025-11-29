# Reading Assistant

AI-powered book reading and summarization service.

## Overview

The Reading Assistant provides an admin interface for uploading and processing books. It generates "Inspectional Reading" summaries using AI and saves them to the vault.

## Status

**Not yet implemented.** This is a placeholder for future development.

## Planned Features

- Web admin interface for book uploads
- AI-powered book summarization
- Integration with vault for storing summaries
- Queue management for batch processing

## Usage

### Starting the Admin Server

```bash
# From project root
make admin-server

# Or with Quartz dev server
make admin-dev
```

### Adding Books

```bash
# Via Makefile
make add-book FILE=path/to/book.epub

# Books are stored in private/books/
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_PASSWORD` | Admin interface password | No (default: admin) |
| `OPENAI_API_KEY` | OpenAI API key | Yes* |
| `ANTHROPIC_API_KEY` | Anthropic API key | Yes* |

*One of the API keys is required for AI summarization.

## Output

Book summaries are saved to `vault/BookSummaries/` in Markdown format.

## Architecture

1. **Web Interface**: Upload and manage books
2. **Queue Manager**: Track processing status
3. **AI Summarizer**: Generate inspectional reading summaries
4. **Vault Sync**: Save summaries to Obsidian vault

## Development

See the [admin-api README](../admin-api/README.md) for API documentation.

## Related

- `private/books/` - Book storage location
- `vault/BookSummaries/` - Output location for summaries
- `services/admin-api/` - Backend API service
