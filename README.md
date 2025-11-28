# monib.life

Personal website built with Quartz, featuring an Obsidian vault as the content layer and AI assistants for content generation.

## Architecture Overview

```
monib.life/
├── vault/                    # Obsidian vault (primary content)
│   ├── .obsidian/           # Obsidian configuration
│   ├── reading/             # Book summaries
│   ├── resume/              # Resume source data
│   │   └── source.md        # Complete resume
│   └── projects/            # Project documentation
├── services/
│   ├── reading-assistant/   # See reading-assistant/README.md
│   ├── resume-assistant/    # See resume-assistant/README.md
│   └── admin-api/           # Backend for admin interface
├── admin/                   # Hidden admin UI
├── scripts/
│   └── sync-projects.sh     # Syncs external project docs
├── project-sources.json     # External project references
├── flake.nix                # NixOS development environment
├── flake.lock               # Locked dependencies
└── quartz.config.ts         # Quartz configuration
```

## Core Principles

1. **Obsidian vault as source of truth**: All content lives in `vault/` as markdown
2. **Native compatibility**: Leverage existing standards (frontmatter, wikilinks, tags)
3. **Draft workflow**: Assistants generate content with `status: draft`, reviewed in Obsidian
4. **Composable architecture**: Each component operates independently
5. **Reproducible environments**: NixOS flake for consistent development and deployment

## Local Development

### Prerequisites
- NixOS or Nix package manager with flakes enabled
- Obsidian (for content editing)
- Git

### Setup with Nix

```bash
# Clone repository
git clone <repo-url> monib.life
cd monib.life

# Enter development shell (automatically installs all dependencies)
nix develop

# All dependencies (Node.js, Python, packages) are now available
```

The Nix flake provides:
- Node.js and npm for Quartz
- Python with all required packages for assistants
- Build tools and utilities
- Consistent versions across all environments

### Alternative: Manual Setup

If not using Nix:

```bash
# Install dependencies manually
npm install
cd services/reading-assistant && pip install -r requirements.txt
cd ../resume-assistant && pip install -r requirements.txt
```

### Build Site
```bash
npx quartz build
```

### Run Locally
```bash
npx quartz serve
```

## Make Commands

The project includes a Makefile for consistent build operations:

```bash
make install    # Install dependencies
make dev        # Start development server with hot reload
make build      # Build for production
make test       # Run tests and validate configuration
make clean      # Clean build artifacts
make sync       # Sync external project documentation
make deploy     # Build and deploy to production
make help       # Show all available commands
```

### Quick Start with Make

```bash
# Initial setup
make install

# Start development
make dev

# Build for production
make build
```

## Content Workflow

### Publishing Content
1. Edit/create markdown files in `vault/`
2. Use Obsidian for editing (optional but recommended)
3. Commit and push changes
4. Site rebuilds automatically (deployment setup TBD)

### Using Assistants
Assistants write content to `vault/` with `status: draft` frontmatter:

1. Run assistant (see `services/*/README.md` for usage)
2. Assistant generates content in `vault/` with `status: draft`
3. Review/edit in Obsidian
4. Remove `status: draft` or change to `status: published`
5. Commit and push

### Content Filtering

Quartz filters content by frontmatter:
- `status: draft` → Excluded from published site
- No status or `status: published` → Included in site

## Project Sync

External project documentation automatically syncs during build:

1. Configure projects in `project-sources.json`
2. Run `./scripts/sync-projects.sh` (manual for now)
3. Project docs appear in `vault/projects/`
4. Quartz builds updated content

### project-sources.json Format

```json
{
  "projects": [
    {
      "name": "project-name",
      "repo": "username/repo-name",
      "sync": ["README.md", "docs/"],
      "branch": "main"
    }
  ]
}
```

## Deployment

### Development (NixOS)

The flake provides a development shell with all dependencies:

```bash
nix develop
```

### Production (NixOS Server)

Deploy to NixOS home server:

```nix
# /etc/nixos/configuration.nix or home-manager config
{
  imports = [ ./monib-life.nix ];
}
```

The NixOS module handles:
- Service deployment
- Dependency management
- Automatic rebuilds
- System integration

### Alternative Hosting

**Phase 1 (Current)**: Local development and testing

**Phase 2**: Deploy to hosting service with admin interface

Static site deployment options:
- Netlify
- Vercel
- Cloudflare Pages

For these platforms, the Nix flake ensures consistent builds in CI/CD.

## NixOS Integration

### Flake Structure

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  };

  outputs = { self, nixpkgs }: {
    devShells.x86_64-linux.default = ...;  # Development environment
    packages.x86_64-linux.default = ...;    # Built website
    nixosModules.default = ...;             # NixOS service module
  };
}
```

### Benefits of NixOS Approach

- **Reproducible**: Same dependencies everywhere (dev, CI, production)
- **Declarative**: Infrastructure and dependencies as code
- **Atomic**: Rollback if deployment fails
- **Composable**: Integrate with existing NixOS home server setup
- **Cacheable**: Binary caches speed up builds

### CI/CD with Nix

```bash
# In CI/CD pipeline
nix build              # Build site
nix flake check        # Run tests
nix run .#deploy       # Deploy to server
```

## Standard Conventions

All content should follow these conventions:

- **Frontmatter**: YAML format for metadata
- **Links**: Wikilinks `[[note]]` for internal references
- **Tags**: `tags: [tag1, tag2]` in frontmatter
- **Dates**: ISO format `YYYY-MM-DD`
- **Filenames**: lowercase-kebab-case.md

## Repository Structure

```
monib.life/
├── README.md                 # This file
├── Makefile                  # Build and development commands
├── agents.md                 # Assistant integration guide
├── flake.nix                 # NixOS development environment & deployment
├── flake.lock                # Locked dependencies
├── vault/                    # Content (Obsidian vault)
├── services/                 # AI assistants (see individual READMEs)
├── admin/                    # Admin interface (future)
├── scripts/                  # Build and sync scripts
├── quartz.config.ts          # Quartz configuration
├── project-sources.json      # External project references
└── package.json              # Node dependencies
```

## Future Enhancements
- Admin UI for assistant access
- Automated project sync (webhook or scheduled)
- Authentication for admin interface
- Resume PDF generation API
- NixOS service module for home server deployment
