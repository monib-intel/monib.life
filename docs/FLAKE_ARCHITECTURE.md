# Nix Flake Architecture

This document describes the composable flake architecture used in monib.life.

## Overview

The monib.life repository uses a **composable flake architecture** where the main `flake.nix` orchestrates and composes development environments from submodule flakes. This approach eliminates duplication, prevents version conflicts, and enables independent submodule development.

## Architecture Diagram

```
monib.life/flake.nix (Orchestrator)
├── inputs
│   ├── nixpkgs (shared across all submodules)
│   ├── reading-assistant flake
│   ├── syntopical-reading-assistant flake
│   └── website flake
└── devShells.default (Composed)
    ├── inputsFrom: [submodule shells...]
    └── buildInputs: [orchestration tools]
```

## Design Principles

### 1. Single Source of Truth
Each submodule's `flake.nix` is the **only** place where its dependencies are defined.

**Bad (old approach):**
```nix
# Main flake defines Python for reading-assistant
# reading-assistant/flake.nix also defines Python
# Risk: version mismatches, duplication
```

**Good (new approach):**
```nix
# reading-assistant/flake.nix defines Python (single source of truth)
# Main flake imports and composes it
```

### 2. Automatic Composition
The main flake uses `inputsFrom` to automatically merge all submodule dependencies:

```nix
devShells.default = pkgs.mkShell {
  inputsFrom = submoduleShells;  # Inherits all buildInputs
  buildInputs = orchestrationInputs;  # Adds only orchestration tools
};
```

### 3. nixpkgs Consistency
All submodules follow the main flake's nixpkgs version:

```nix
reading-assistant = {
  url = "path:./services/reading-assistant";
  inputs.nixpkgs.follows = "nixpkgs";  # Use parent's nixpkgs
};
```

### 4. Independent Development
Each submodule can be developed independently:

```bash
# Full environment with all tools
cd /path/to/monib.life
nix develop

# Just reading-assistant environment
cd services/reading-assistant
nix develop
```

## Main Flake Structure

```nix
{
  description = "monib.life - Personal knowledge and services platform";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    
    # Submodule flakes
    reading-assistant = {
      url = "path:./services/reading-assistant";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    syntopical-reading-assistant = {
      url = "path:./services/syntopical-reading-assistant";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    website = {
      url = "path:./website";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, ... }@inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Helper to safely get devShell from submodule
        getSubmoduleShell = submodule:
          if submodule ? devShells.${system}.default
          then submodule.devShells.${system}.default
          else null;
        
        # Get all available submodule shells
        submoduleShells = pkgs.lib.filter (x: x != null) [
          (getSubmoduleShell inputs.reading-assistant)
          (getSubmoduleShell inputs.syntopical-reading-assistant)
          (getSubmoduleShell inputs.website)
        ];
        
        # Orchestration tools (git, gh, rsync, etc.)
        orchestrationInputs = with pkgs; [ ... ];
      in
      {
        # Composed development shell
        devShells.default = pkgs.mkShell {
          inputsFrom = submoduleShells;
          buildInputs = orchestrationInputs;
          shellHook = ''...''
        };
        
        # Pass-through shells for independent development
        devShells.reading-assistant = ...;
        devShells.syntopical-reading-assistant = ...;
        devShells.website = ...;
      }
    );
}
```

## Submodule Flake Structure

Each submodule should have a `flake.nix` that defines only its own dependencies:

```nix
# Example: services/reading-assistant/flake.nix
{
  description = "Reading Assistant - EPUB processing service";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            python311
            python311Packages.pip
            pandoc
            calibre
          ];

          shellHook = ''
            echo "Reading Assistant Environment"
            echo "Python: $(python --version)"
          '';
        };
      }
    );
}
```

## Usage Patterns

### Full Monorepo Development

Work on all submodules simultaneously:

```bash
cd /path/to/monib.life
nix develop

# All tools from all submodules are now available
node --version    # From website flake
python --version  # From service flakes
git --version     # From main flake orchestration
```

### Submodule-Specific Development

Focus on one submodule:

```bash
cd services/reading-assistant
nix develop

# Only reading-assistant tools are available
python --version  # ✓ Available
node --version    # ✗ Not available (not needed for this service)
```

### CI/CD Integration

```bash
# Test specific submodule
nix develop path:./services/reading-assistant -c pytest

# Build entire project
nix develop -c make build

# Run full test suite
nix develop -c make test
```

## Benefits

### For Developers

1. **Faster onboarding**: Just `nix develop` in any directory
2. **No version conflicts**: nixpkgs version is consistent across all submodules
3. **Clear dependencies**: Each service declares its own needs
4. **Independent work**: Develop services in isolation

### For Maintainers

1. **Single source of truth**: Update dependencies in one place (the submodule)
2. **Automatic propagation**: Main flake automatically picks up changes
3. **Easy testing**: Test services independently or together
4. **Clear separation**: Orchestration vs. service dependencies

### For CI/CD

1. **Reproducible builds**: Same dependencies everywhere
2. **Efficient caching**: Nix binary cache speeds up builds
3. **Incremental builds**: Only rebuild what changed
4. **Consistent environments**: Dev == CI == Production

## Migration Guide

### Adding a New Submodule

1. **Create flake.nix in the submodule:**

```bash
cd services/new-service
cat > flake.nix << 'EOF'
{
  description = "New Service";
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };
  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let pkgs = nixpkgs.legacyPackages.${system}; in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [ /* your dependencies */ ];
        };
      }
    );
}
EOF
```

2. **Add to main flake inputs:**

```nix
# In main flake.nix
inputs = {
  # ...existing inputs...
  new-service = {
    url = "path:./services/new-service";
    inputs.nixpkgs.follows = "nixpkgs";
  };
};
```

3. **Update outputs to include the new submodule:**

```nix
outputs = { self, nixpkgs, flake-utils, new-service, ... }@inputs:
  # Add to getSubmoduleShell calls
  submoduleShells = pkgs.lib.filter (x: x != null) [
    # ...existing shells...
    (getSubmoduleShell inputs.new-service)
  ];
  
  # Add pass-through shell
  devShells.new-service = (getSubmoduleShell inputs.new-service) or (pkgs.mkShell {});
```

### Updating Submodule Dependencies

**Just edit the submodule's flake.nix:**

```bash
cd services/reading-assistant
# Edit flake.nix to add/remove dependencies
vim flake.nix

# Test locally
nix develop

# Changes automatically available in main flake
cd ../..
nix develop  # Now includes your changes
```

## Troubleshooting

### Submodule flake not found

**Error:** `error: getting status of '/path/to/submodule/flake.nix': No such file or directory`

**Solution:** The submodule hasn't been initialized or doesn't have a flake yet.

```bash
# Initialize submodules
git submodule update --init --recursive

# Or create a flake.nix in the submodule
cd path/to/submodule
# Create flake.nix
```

### Version conflicts

**Error:** Different nixpkgs versions causing inconsistencies

**Solution:** Ensure all submodule flakes follow the main nixpkgs:

```nix
submodule-name = {
  url = "path:./path/to/submodule";
  inputs.nixpkgs.follows = "nixpkgs";  # Important!
};
```

### Flake lock conflicts

**Error:** `flake.lock` conflicts after updates

**Solution:** Update all flakes together:

```bash
# Update main flake
nix flake update

# Or update specific input
nix flake lock --update-input reading-assistant
```

## Best Practices

1. **Keep main flake minimal**: Only orchestration tools in main flake
2. **Submodules own dependencies**: Each service defines what it needs
3. **Use nixpkgs.follows**: Ensure consistent package versions
4. **Document shellHook**: Helpful messages for developers
5. **Test independently**: Each submodule should work standalone
6. **Version pin carefully**: Use flake.lock for reproducibility

## Future Enhancements

- [ ] Add `packages` outputs for built artifacts
- [ ] Create NixOS modules for service deployment
- [ ] Add `checks` for automated testing
- [ ] Implement `apps` for common commands
- [ ] Add development vs. production profiles

## References

- [Nix Flakes Documentation](https://nixos.wiki/wiki/Flakes)
- [Composing Flakes](https://nixos.org/manual/nix/stable/command-ref/new-cli/nix3-flake.html)
- [mkShell Documentation](https://nixos.org/manual/nixpkgs/stable/#sec-pkgs-mkShell)
- [flake-utils](https://github.com/numtide/flake-utils)
