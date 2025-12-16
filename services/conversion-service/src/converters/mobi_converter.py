"""MOBI to Markdown converter."""

from pathlib import Path
from typing import Optional
import subprocess
import tempfile

from .epub_converter import EPUBConverter
from .base_converter import BaseConverter


class MOBIConverter(BaseConverter):
    """Converter for MOBI files to Markdown format."""

    def __init__(self):
        """Initialize the MOBI converter."""
        super().__init__()
        self.epub_converter = EPUBConverter()

    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if file is MOBI format
        """
        return file_path.suffix.lower() in ['.mobi', '.azw', '.azw3']

    def convert(
        self,
        input_path: Path,
        output_dir: Path,
        extract_images: bool = False,
        clean_headers: bool = False,
    ) -> Path:
        """
        Convert a MOBI file to Markdown format.

        This converter uses ebook-convert (from Calibre) to first convert
        MOBI to EPUB, then uses the EPUB converter.

        Args:
            input_path: Path to the MOBI file
            output_dir: Directory to save the converted Markdown file
            extract_images: Whether to extract and save images
            clean_headers: Whether to clean/normalize headers

        Returns:
            Path to the generated Markdown file
        """
        self._ensure_output_dir(output_dir)
        
        # Create a temporary directory for intermediate EPUB file
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            epub_path = temp_path / f"{input_path.stem}.epub"
            
            # Convert MOBI to EPUB using ebook-convert (from Calibre)
            try:
                subprocess.run(
                    ['ebook-convert', str(input_path), str(epub_path)],
                    check=True,
                    capture_output=True,
                    text=True
                )
            except subprocess.CalledProcessError as e:
                raise RuntimeError(f"Failed to convert MOBI to EPUB: {e.stderr}")
            except FileNotFoundError:
                raise RuntimeError(
                    "ebook-convert not found. Please install Calibre "
                    "(https://calibre-ebook.com/)"
                )
            
            # Convert the EPUB to Markdown
            return self.epub_converter.convert(
                epub_path,
                output_dir,
                extract_images=extract_images,
                clean_headers=clean_headers
            )
