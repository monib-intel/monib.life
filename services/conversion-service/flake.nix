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
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            pkgs.python311
            pkgs.uv
            #pkgs.calibre  # For MOBI conversion
            pkgs.ruff     # Python linter
            # WeasyPrint dependencies
            pkgs.gobject-introspection
            pkgs.cairo
            pkgs.pango
            pkgs.gdk-pixbuf
            pkgs.harfbuzz
          ];

          shellHook = ''
            echo "📚 Conversion Service Development Environment (uv)"
            echo "================================================="
            echo ""
            echo "Python: $(python --version)"
            echo "uv: $(uv --version)"
            echo "Calibre: $(ebook-convert --version 2>&1 | head -1)"
            echo ""
            echo "To set up the virtual environment, run:"
            echo "  uv sync"
            echo ""
            echo "Available commands:"
            echo "  uv run src/cli.py --help    - Run converter CLI"
            echo "  uv run pytest               - Run tests"
            echo "  uv run black src/           - Format code"
            echo "  uv run ruff check src/      - Lint code"
            echo ""

            # Use the virtual environment created by uv
            if [ -d .venv ]; then
              export PATH="$PWD/.venv/bin:$PATH"
            fi
            export PYTHONPATH="$PWD/src:$PYTHONPATH"
          '';
        };
      }
    );
}
