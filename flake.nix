{
  description = "monib.life - Personal website with Quartz and AI assistants";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        pythonPackages = ps: with ps; [
          # Common packages for assistants
          requests
          python-dotenv
          pyyaml
          ebooklib
          beautifulsoup4
          openai
          anthropic
          pytest
          black
          flake8
          # Admin server
          flask
          werkzeug
        ];

        python = pkgs.python311.withPackages pythonPackages;

      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Node.js for Quartz (v22 required for Quartz v4.5+)
            pkgs.nodejs_22
            pkgs.nodePackages.npm

            # Python for assistants
            python

            # Build tools
            pkgs.gnumake
            pkgs.jq
            pkgs.curl
            pkgs.git
            pkgs.rsync

            # Optional: for PDF generation
            pkgs.pandoc
            pkgs.texliveSmall
          ];

          shellHook = ''
            echo "monib.life development environment loaded"
            echo "Node.js: $(node --version)"
            echo "Python: $(python --version)"
            echo ""
            echo "Available commands:"
            echo "  make install    - Install dependencies and update submodules"
            echo "  make dev        - Sync vault and start dev server"
            echo "  make build      - Sync vault and build site"
            echo "  make admin-dev  - Start admin + Quartz dev servers"
            echo "  make help       - Show all available commands"
          '';
        };

        packages.default = pkgs.stdenv.mkDerivation {
          pname = "monib-life";
          version = "1.0.0";
          src = ./.;

          buildInputs = [
            pkgs.nodejs_22
            pkgs.nodePackages.npm
          ];

          buildPhase = ''
            cd website
            npm ci
            npx quartz build
          '';

          installPhase = ''
            mkdir -p $out
            cp -r website/public/* $out/
          '';
        };
      }
    );
}
