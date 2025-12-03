{
  description = "monib.life - Personal knowledge and services platform";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    
    # Submodule flakes - using path inputs to reference local submodules
    # These inputs allow the main flake to compose submodule development environments
    # Each submodule's flake.nix is the single source of truth for its dependencies
    reading-assistant = {
      url = "path:./services/reading-assistant";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    syntopical-reading-assistant = {
      url = "path:./services/syntopical-reading-assistant";
      inputs.nixpkgs.follows = "nixpkgs";
    };
    # Note: website flake is planned (monib-intel/monib.life#11)
    # Until then, the main flake will handle website dependencies
    website = {
      url = "path:./website";
      inputs.nixpkgs.follows = "nixpkgs";
    };
  };

  outputs = { self, nixpkgs, flake-utils, reading-assistant, syntopical-reading-assistant, website }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Helper to safely get devShell inputsFrom for a submodule
        # Returns the devShell if it exists, otherwise returns null
        getSubmoduleShell = submodule:
          if submodule ? devShells.${system}.default
          then submodule.devShells.${system}.default
          else null;
        
        # Get submodule shells (may be null if flake doesn't exist)
        readingAssistantShell = getSubmoduleShell reading-assistant;
        syntopicalReadingAssistantShell = getSubmoduleShell syntopical-reading-assistant;
        websiteShell = getSubmoduleShell website;
        
        # Orchestration tools that are only needed in the main flake
        orchestrationInputs = with pkgs; [
          git
          gh  # GitHub CLI
          rsync
        ];
        
        # Fallback dependencies for submodules without flakes yet
        # These will be removed once all submodules have their own flakes
        fallbackDependencies = with pkgs; [
          # Website dependencies (until website flake.nix is created - issue #11)
          nodejs_22
        ] ++ pkgs.lib.optionals (websiteShell == null) [
          # Additional website tools if no website flake exists
        ];
        
        # Compose inputsFrom list from available submodule shells
        submoduleShells = pkgs.lib.filter (x: x != null) [
          readingAssistantShell
          syntopicalReadingAssistantShell
          websiteShell
        ];
      in
      {
        # Consolidated development shell for full monorepo
        # Usage: nix develop
        # This shell composes all submodule devShells together using inputsFrom
        devShells.default = pkgs.mkShell {
          # Use inputsFrom to inherit buildInputs from submodule shells
          inputsFrom = submoduleShells;
          
          # Add orchestration tools and fallback dependencies
          buildInputs = orchestrationInputs ++ fallbackDependencies;

          shellHook = ''
            echo "🌍 monib.life Development Environment"
            echo "======================================"
            echo ""
            echo "Composed from submodule flakes:"
            echo "  ${if readingAssistantShell != null then "✓" else "⚠"} services/reading-assistant"
            echo "  ${if syntopicalReadingAssistantShell != null then "✓" else "⚠"} services/syntopical-reading-assistant"
            echo "  ${if websiteShell != null then "✓" else "⚠"} website"
            echo ""
            echo "Available commands:"
            echo "  make test       - Run all tests"
            echo "  make build      - Build website"
            echo "  make dev        - Start development server"
            echo "  make sync       - Sync vault with reading list"
            echo "  make admin-dev  - Start admin server"
            echo ""
            echo "Submodule development (independent):"
            echo "  cd website && nix develop"
            echo "  cd services/reading-assistant && nix develop"
            echo "  cd services/syntopical-reading-assistant && nix develop"
            echo ""
          '';
        };
        
        # Pass through submodule devShells for independent development
        devShells.reading-assistant = readingAssistantShell or (pkgs.mkShell {
          buildInputs = [ ];
        });
        devShells.syntopical-reading-assistant = syntopicalReadingAssistantShell or (pkgs.mkShell {
          buildInputs = [ ];
        });
        devShells.website = websiteShell or (pkgs.mkShell {
          buildInputs = [ ];
        });
      }
    );
}
