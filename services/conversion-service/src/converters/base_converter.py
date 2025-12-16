"""Base converter class for book format conversions."""

from abc import ABC, abstractmethod
from pathlib import Path
from typing import Optional


class BaseConverter(ABC):
    """Base class for all book format converters."""

    @abstractmethod
    def convert(
        self,
        input_path: Path,
        output_dir: Path,
        extract_images: bool = False,
        clean_headers: bool = False,
    ) -> Path:
        """
        Convert a book file to Markdown format.

        Args:
            input_path: Path to the input book file
            output_dir: Directory to save the converted Markdown file
            extract_images: Whether to extract and save images
            clean_headers: Whether to clean/normalize headers

        Returns:
            Path to the generated Markdown file
        """
        pass

    @abstractmethod
    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if this converter can handle the file format
        """
        pass

    def _ensure_output_dir(self, output_dir: Path) -> None:
        """
        Ensure the output directory exists.

        Args:
            output_dir: Path to the output directory
        """
        output_dir.mkdir(parents=True, exist_ok=True)

    def _get_output_path(self, input_path: Path, output_dir: Path) -> Path:
        """
        Generate the output file path for the Markdown file.

        Args:
            input_path: Path to the input file
            output_dir: Directory for output files

        Returns:
            Path for the output Markdown file
        """
        return output_dir / f"{input_path.stem}.md"
