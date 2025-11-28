# monib.life

Personal website and digital garden built with [Quartz v4](https://quartz.jzhao.xyz/).

## Quick Start

```bash
# Clone with submodules
git clone --recursive https://github.com/monib-intel/monib.life.git

# Or if already cloned, initialize submodules
git submodule update --init --recursive

# Install dependencies
make install

# Start development server
make dev

# Build for production
make build
```

## Project Structure

- `vault/` - Obsidian vault (submodule: [monib-intel/vault](https://github.com/monib-intel/vault))
- `reading-assistant/` - Reading bot assistant (submodule: [monib-intel/reading-bot](https://github.com/monib-intel/reading-bot))
- `content/` - Markdown content for the website (synced from vault)
- `quartz/` - Quartz framework
- `public/` - Static assets
- `Makefile` - Build commands

## Submodules

This project uses git submodules:
- **vault**: Personal knowledge base and content source
- **reading-assistant**: AI assistant for generating reading summaries

## Development

Built with Quartz v4, a static site generator for digital gardens and knowledge bases.
