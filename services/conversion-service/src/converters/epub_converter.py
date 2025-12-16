"""EPUB to Markdown converter."""

import zipfile
from pathlib import Path
from typing import Optional
import html2text
from bs4 import BeautifulSoup
import ebooklib
from ebooklib import epub

from .base_converter import BaseConverter


class EPUBConverter(BaseConverter):
    """Converter for EPUB files to Markdown format."""

    def __init__(self):
        """Initialize the EPUB converter."""
        super().__init__()
        self.h2t = html2text.HTML2Text()
        self.h2t.ignore_links = False
        self.h2t.ignore_images = False
        self.h2t.body_width = 0  # Don't wrap lines

    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if file is EPUB format
        """
        return file_path.suffix.lower() in ['.epub']

    def convert(
        self,
        input_path: Path,
        output_dir: Path,
        extract_images: bool = False,
        clean_headers: bool = False,
    ) -> Path:
        """
        Convert an EPUB file to Markdown format.

        Args:
            input_path: Path to the EPUB file
            output_dir: Directory to save the converted Markdown file
            extract_images: Whether to extract and save images
            clean_headers: Whether to clean/normalize headers

        Returns:
            Path to the generated Markdown file
        """
        self._ensure_output_dir(output_dir)
        
        # Read the EPUB file
        book = epub.read_epub(str(input_path))
        
        # Extract metadata
        title = book.get_metadata('DC', 'title')
        author = book.get_metadata('DC', 'creator')
        
        # Build markdown content
        markdown_parts = []
        
        # Add frontmatter
        markdown_parts.append("---")
        if title:
            markdown_parts.append(f"title: {title[0][0]}")
        if author:
            markdown_parts.append(f"author: {author[0][0]}")
        markdown_parts.append("status: draft")
        markdown_parts.append("---")
        markdown_parts.append("")
        
        # Process each document item in the book
        for item in book.get_items():
            if item.get_type() == ebooklib.ITEM_DOCUMENT:
                # Convert HTML to text
                content = item.get_content()
                soup = BeautifulSoup(content, 'html.parser')
                
                if clean_headers:
                    # Normalize headers
                    for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']):
                        tag.string = tag.get_text().strip()
                
                # Convert to markdown
                html_content = str(soup)
                markdown_content = self.h2t.handle(html_content)
                markdown_parts.append(markdown_content)
                markdown_parts.append("")
            
            elif extract_images and item.get_type() == ebooklib.ITEM_IMAGE:
                # Extract images if requested
                images_dir = output_dir / "images"
                images_dir.mkdir(exist_ok=True)
                
                image_path = images_dir / item.get_name().split('/')[-1]
                with open(image_path, 'wb') as f:
                    f.write(item.get_content())
        
        # Write the markdown file
        output_path = self._get_output_path(input_path, output_dir)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(markdown_parts))
        
        return output_path
