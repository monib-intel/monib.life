{
  description = "PDF Conversion Service - Convert ebooks to PDF for Supernote";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in {
        devShells.default = pkgs.mkShell {
          buildInputs = [
            # Calibre for ebook conversion
            pkgs.calibre

            # Build tools
            pkgs.gnumake
            pkgs.coreutils
            pkgs.bash
          ];

          shellHook = ''
            echo "PDF Conversion Service - Development Environment"
            echo ""
            echo "Calibre version: $(ebook-convert --version 2>&1 | head -1)"
            echo ""
            echo "Available commands:"
            echo "  make convert FILE=input.epub  - Convert single file to PDF"
            echo "  make batch DIR=./books        - Convert all ebooks in directory"
            echo "  make test                     - Run conversion tests"
            echo "  make help                     - Show all available commands"
          '';
        };

        packages.default = pkgs.writeShellApplication {
          name = "pdf-convert";
          runtimeInputs = [ pkgs.calibre pkgs.coreutils ];
          text = builtins.readFile ./convert.sh;
        };
      }
    );
}
