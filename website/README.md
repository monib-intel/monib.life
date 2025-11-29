# monib.life-website

Quartz v4 website for [monib.life](https://monib.life).

This is the website build system for the monib.life personal website and digital garden.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npx quartz build --serve

# Build for production
npx quartz build
```

## Project Structure

```
/
├── quartz/              # Quartz framework
├── content/             # Markdown content (synced from vault)
├── public/              # Build output (gitignored)
├── docs/                # Quartz documentation
├── quartz.config.ts     # Quartz configuration
├── quartz.layout.ts     # Layout configuration
├── package.json         # Node dependencies
└── tsconfig.json        # TypeScript configuration
```

## Integration with monib.life

This repository is used as a submodule in the main [monib.life](https://github.com/monib-intel/monib.life) repository:

- Content is synced from the `vault/` submodule to `content/`
- Build output goes to `public/`
- The parent repo handles orchestration via Makefile

## Development

### Running locally

```bash
# Install dependencies
npm install

# Start dev server (content must exist in content/)
npx quartz build --serve
```

### Testing

```bash
# Run tests
npm test

# Type checking
npm run check

# Format code
npm run format
```

## Built with Quartz

This site is built with [Quartz v4](https://quartz.jzhao.xyz/), a fast static-site generator for digital gardens and personal websites.
