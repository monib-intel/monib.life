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
        ];
        
        python = pkgs.python311.withPackages pythonPackages;
        
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Node.js for Quartz
            pkgs.nodejs_22
            pkgs.nodePackages.npm
            
            # Python for assistants
            python
            
            # Build tools
            pkgs.rsync
            pkgs.jq
            pkgs.curl
            pkgs.git
            
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
            echo "  npm run build   - Build the Quartz site"
            echo "  npm run serve   - Run local dev server"
            echo "  npm run sync    - Sync external projects"
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
            npm ci
            npx quartz build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r public/* $out/
          '';
        };
      }
    );
}
