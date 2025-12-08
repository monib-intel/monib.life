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

**Note:** The flake uses a composable architecture that merges submodule flakes. See [docs/FLAKE_ARCHITECTURE.md](docs/FLAKE_ARCHITECTURE.md) for details.

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

The main flake.nix uses a **composable architecture** that imports and merges submodule flakes:

```nix
{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    # Submodule flakes - each defines its own dependencies
    reading-assistant.url = "path:./services/reading-assistant";
    syntopical-reading-assistant.url = "path:./services/syntopical-reading-assistant";
    website.url = "path:./website";
  };

  outputs = { self, nixpkgs, reading-assistant, ... }: {
    # Composed development shell merges all submodule dependencies
    devShells.x86_64-linux.default = ...;
    
    # Pass-through shells for independent submodule development
    devShells.x86_64-linux.reading-assistant = ...;
    devShells.x86_64-linux.syntopical-reading-assistant = ...;
    devShells.x86_64-linux.website = ...;
  };
}
```

**Key Features:**
- **Single Source of Truth**: Each submodule's `flake.nix` defines its own dependencies
- **Automatic Composition**: Main flake merges all submodule dependencies via `inputsFrom`
- **Independent Development**: Submodules can be developed independently in their own directories
- **No Duplication**: Dependencies defined once in the appropriate submodule
- **Version Consistency**: `inputs.nixpkgs.follows = "nixpkgs"` ensures all submodules use the same nixpkgs

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
├── vault/                    # Content (Obsidian vault) - SUBMODULE
├── website/                  # Quartz website - SUBMODULE
├── services/
│   ├── reading-assistant/    # SUBMODULE pointing to reading-bot repo
│   ├── resume-assistant/     # Resume generation service
│   └── syntopical-reading-assistant/  # SUBMODULE
├── scripts/                  # Build and sync scripts
└── .gitmodules               # Submodule configuration
```

## Sprint Planning

All open issues across monib.life, website, reading-bot, and syntopical-reading-assistant are organized into sprint plans below. Issues are prioritized by dependencies and impact.

### Sprint 1: Foundation & Deployment (Weeks 1-2)
**Goal**: Enable local server deployment with core functionality

#### monib.life
- [ ] #31 - Rename reading-assistant service to ebook-summary-assistant (Documentation/naming)
- [ ] #30 - Deploy monib.life to internet and test functionality (Main orchestration)
- [ ] #20 - Replace Makefile with executable shell scripts (Infrastructure)

#### monib.life-website
- [ ] #8 - Local server deployment - Website infrastructure (Build & serve optimization)

#### reading-bot
- [ ] #32 - Local server deployment - reading-bot service infrastructure (Production setup)

**Completion Criteria**: Website and admin interface running on local server with proper environment config

---

### Sprint 2: PDF Export & Content Management (Weeks 3-4)
**Goal**: Add PDF export and improve content handling

#### monib.life
- [ ] #24 - Implement MCP for Local Server and Uploaded Content (Enhancement)
- [ ] #13 - Admin logs should include reading-assistant processing outputs (Logging)

#### monib.life-website
- [ ] #6 - Convert markdown to PDF with Literata font for download (User-facing feature)

#### reading-bot
- [ ] #25 - Support PDF books (separate converter to MD) (Format support)
- [ ] #16 - Refactor: Separate EPUB conversion and AI analysis (Code quality)

**Completion Criteria**: Users can download pages as PDFs; PDF books processed correctly

---

### Sprint 3: Reading Assistant Enhancements (Weeks 5-6)
**Goal**: Improve book processing and analysis capabilities

#### reading-bot
- [ ] #26 - Parallel processing for batch book conversion (Performance)
- [ ] #29 - Link validation and back-links navigation (Quality)
- [ ] #11 - Review three generated books (Testing/validation)
- [ ] #13 - Batch processing multiple EPUB books (Feature)

#### syntopical-reading-assistant
- [ ] #18 - Category/tagging system for library organization (Organization)

**Completion Criteria**: Batch processing works; links validated; books properly organized

---

### Sprint 4: Documentation & Polish (Weeks 7-8)
**Goal**: Document changes and prepare for broader usage

#### reading-bot
- [ ] #17 - Document the agent and API changes (Documentation)
- [ ] #30 - Expand central thesis (Documentation/context)

#### All repos
- [ ] Update all README files with new architecture
- [ ] Document API endpoints
- [ ] Create deployment runbooks

**Completion Criteria**: All features documented; deployment runbooks complete

---

## Current Status by Repository

### monib.life (Main)
- ✅ Sub-repository structure finalized (vault, website, syntopical-reading-assistant as submodules)
- ✅ reading-bot integrated as reading-assistant submodule
- ✅ Admin-api and pdf-conversion removed (consolidating functionality)
- ✅ Repository cleaned (removed duplicate files)
- 🔄 Deployment infrastructure (in progress)
- 📋 5 open issues

### monib.life-website
- ✅ Converted to git submodule
- ✅ Website files properly organized
- 🔄 Deployment setup required
- 🔄 PDF export feature needed
- 📋 2 open issues

### reading-bot
- ✅ Integrated as submodule in monib.life
- ✅ Parallel processing merged (PR #31)
- 🔄 Production deployment setup
- 🔄 PDF support for book processing
- 📋 9 open issues

### syntopical-reading-assistant
- ✅ Available as submodule
- 🔄 Tagging system for organization
- 📋 1 open issue

---

## Issue Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete |
| 🔄 | In Progress |
| 📋 | Open/Planned |
| ⚠️ | Blocked/Needs Review |

## Repository Links

- **Main**: https://github.com/monib-intel/monib.life
- **Website**: https://github.com/monib-intel/monib.life-website
- **Reading Bot**: https://github.com/monib-intel/reading-bot
- **Syntopical Assistant**: https://github.com/monib-intel/syntopical-reading-assistant
- **Vault**: https://github.com/monib-intel/vault

## Future Enhancements
- Admin UI for assistant access
- Automated project sync (webhook or scheduled)
- Authentication for admin interface
- Resume PDF generation API
- NixOS service module for home server deployment
