---
title: Projects
---

# Projects

Documentation for various projects.

## Project List

*Project documentation will be synced from external repositories.*

## Sync Configuration

Projects are configured in `project-sources.json` and synced using the `sync-projects.sh` script.

### Adding a New Project

1. Add project to `project-sources.json`:
   ```json
   {
     "name": "project-name",
     "repo": "username/repo-name",
     "sync": ["README.md", "docs/"],
     "branch": "main"
   }
   ```

2. Run sync: `./scripts/sync-projects.sh`
