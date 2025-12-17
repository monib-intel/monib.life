{
  description = "Conversion Service - Ebook format converter to Markdown";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        pythonEnv = pkgs.python311.withPackages (ps: with ps; [
          ebooklib
          beautifulsoup4
          html2text
          pdfplumber
          lxml
          pillow
          # Development dependencies
          pytest
          pytest-cov
          black
          # Note: ruff is not yet in nixpkgs python packages, using system ruff
        ]);
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pythonEnv
            pkgs.calibre  # For MOBI conversion
            pkgs.ruff     # Python linter
          ];

          shellHook = ''
            echo "📚 Conversion Service Development Environment"
            echo "============================================="
            echo ""
            echo "Python: $(python --version)"
            echo "Calibre: $(ebook-convert --version 2>&1 | head -1)"
            echo ""
            echo "Available commands:"
            echo "  python src/cli.py --help    - Run converter CLI"
            echo "  pytest                      - Run tests"
            echo "  black src/                  - Format code"
            echo "  ruff check src/             - Lint code"
            echo ""
            echo "Example usage:"
            echo "  python src/cli.py book.epub --output-dir ./output"
            echo ""
            
            # Add src to PYTHONPATH for development
            export PYTHONPATH="${toString ./.}/src:$PYTHONPATH"
          '';
        };
        
        # Package the conversion service
        packages.default = pkgs.python311Packages.buildPythonApplication {
          pname = "conversion-service";
          version = "0.1.0";
          src = ./.;
          
          propagatedBuildInputs = with pkgs.python311Packages; [
            ebooklib
            beautifulsoup4
            html2text
            pdfplumber
            lxml
            pillow
          ];
          
          # Calibre needs to be available at runtime for MOBI conversion
          makeWrapperArgs = [
            "--prefix PATH : ${pkgs.lib.makeBinPath [ pkgs.calibre ]}"
          ];
          
          format = "pyproject";
        };
      }
    );
}
