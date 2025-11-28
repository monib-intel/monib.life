# AI Assistants Integration

This document describes how AI assistants integrate with monib.life.

## Overview

Assistants are standalone services in `services/` that generate content for the website. Each assistant has its own README with implementation details.

## Integration Contract

All assistants follow this contract:

### Input
- Read context from `vault/` as needed
- Accept input via CLI, API, or file upload

### Output
- Write markdown files to appropriate `vault/` subdirectory
- Include `status: draft` in frontmatter
- Follow standard conventions (see main README.md)

### Review Workflow
1. Assistant generates content with `status: draft`
2. Human reviews in Obsidian
3. Human edits/approves content
4. Human changes `status: draft` → `status: published` or removes property
5. Human commits and pushes

## Available Assistants

### Reading Assistant
- **Location**: `services/reading-assistant/`
- **Purpose**: Generates book summaries
- **Input**: EPUB files
- **Output**: `vault/reading/*.md`
- **Documentation**: See `services/reading-assistant/README.md`

### Resume Assistant
- **Location**: `services/resume-assistant/`
- **Purpose**: Generates role-specific resume PDFs
- **Input**: Job description + `vault/resume/source.md`
- **Output**: PDF (ephemeral, not stored)
- **Documentation**: See `services/resume-assistant/README.md`

## Development Environment

### Using Nix (Recommended)

All assistants and their dependencies are available in the Nix development shell:

```bash
# Enter development environment
nix develop

# All Python packages, Node.js, and tools are now available
cd services/reading-assistant
python main.py example.epub
```

The Nix flake ensures:
- Consistent Python versions across all assistants
- All required packages installed
- No conflicts between assistant dependencies
- Reproducible across machines

### Without Nix

See individual assistant README files for manual setup instructions.

## NixOS Deployment

### Local Development
```bash
nix develop
```

### Home Server Deployment

Assistants can run as NixOS services on your home server:

```nix
# Example NixOS configuration
services.monib-life = {
  enable = true;
  vault-path = "/var/lib/monib-life/vault";
  assistants = {
    reading.enable = true;
    resume.enable = true;
  };
};
```

Benefits:
- Automatic service management
- Consistent environment with development
- Integration with existing home server infrastructure
- Declarative configuration

## Admin Interface (Future)

Planned admin interface for assistant access:

### Features
- Hidden URL path (e.g., `/admin-x7k9p2/`)
- Authentication required
- File upload for reading assistant
- Job description input for resume assistant
- Draft review interface

### Endpoints (Planned)

**POST /api/admin/upload-book**
- Upload EPUB → triggers reading assistant
- Returns status

**POST /api/admin/generate-resume**
- Job description → triggers resume assistant
- Returns PDF stream

### Deployment Options

**Option A: NixOS Home Server**
- Admin API runs as systemd service
- Writes directly to vault filesystem
- Integrated with existing infrastructure

**Option B: Serverless (Netlify/Vercel)**
- Admin API as serverless functions
- Writes via git commits or API
- Separate from home server

## Adding New Assistants

To add a new assistant:

1. Create `services/new-assistant/` directory
2. Create `services/new-assistant/README.md` with:
   - Purpose
   - Usage instructions
   - Input/output specification
   - Dependencies
3. Add dependencies to `flake.nix` if using Nix
4. Ensure output follows integration contract:
   - Writes to `vault/`
   - Uses `status: draft`
   - Follows standard conventions
5. Add entry to this document

### Example Nix Integration

```nix
# In flake.nix
devShells.default = pkgs.mkShell {
  packages = [
    # Existing packages...
    (pkgs.python3.withPackages (ps: [
      # Existing packages...
      ps.new-assistant-dependency
    ]))
  ];
};
```

## Standard Output Format

All assistants should generate markdown with frontmatter:

```yaml
---
status: draft
generated: YYYY-MM-DD
title: "Content Title"
tags: [relevant, tags]
# ... other metadata
---

# Content

[Body content following markdown conventions]
```

## Development Guidelines

### File Operations
- Write UTF-8 encoded files
- Use atomic writes (temp file → move)
- Never overwrite non-draft files
- Validate output is valid markdown

### Error Handling
- Log errors to stderr
- Exit with non-zero status on failure
- Provide clear error messages
- Never write invalid/partial files

### Testing
Each assistant should have its own test suite. See individual README files for testing instructions.

With Nix:
```bash
nix develop
cd services/reading-assistant
python -m pytest tests/
```

## Troubleshooting

**Generated content not appearing on site**
1. Check `status: draft` is removed from frontmatter
2. Verify file is in correct `vault/` subdirectory
3. Rebuild site: `npx quartz build`
4. Check Quartz filter configuration

**Assistant not writing files**
1. Check file permissions on `vault/`
2. Verify correct paths in assistant configuration
3. Check assistant logs for errors

**Draft workflow not working**
1. Verify Quartz filter plugin configured correctly
2. Check frontmatter YAML is valid
3. Ensure `status` property is exactly `draft` (lowercase)

**Nix development shell issues**
1. Ensure flakes are enabled: `nix-command flakes` in experimental-features
2. Update flake: `nix flake update`
3. Rebuild shell: `nix develop --rebuild`
