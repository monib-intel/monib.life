{
  description = "monib.life - Personal knowledge and services platform";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        nodejs = pkgs.nodejs_22;
        python = pkgs.python311;
      in
      {
        # Consolidated development shell for full monorepo
        # Usage: nix develop
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js for website (Quartz)
            nodejs_22
            # Python for services
            python311
            python311Packages.pip
            # Build tools
            rsync
            git
            gh  # GitHub CLI
            pandoc
            calibre
            texliveSmall
          ];

          shellHook = ''
            echo "🌍 monib.life Development Environment"
            echo "======================================"
            echo ""
            echo "Node.js: $(node --version)"
            echo "npm:     $(npm --version)"
            echo "Python:  $(python --version)"
            echo ""
            echo "Available commands:"
            echo "  make test       - Run all tests"
            echo "  make build      - Build website"
            echo "  make dev        - Start development server"
            echo "  make sync       - Sync vault with reading list"
            echo "  make admin-dev  - Start admin server"
            echo ""
            echo "Submodule development:"
            echo "  cd website && nix develop"
            echo "  cd services/reading-assistant && nix develop"
            echo "  cd services/syntopical-reading-assistant && nix develop"
            echo ""
          '';
        };
      }
    );
}
