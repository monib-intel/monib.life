"""PDF to Markdown converter."""

from pathlib import Path
from typing import Optional
import pdfplumber
import html2text

from .base_converter import BaseConverter


class PDFConverter(BaseConverter):
    """Converter for PDF files to Markdown format."""

    def __init__(self):
        """Initialize the PDF converter."""
        super().__init__()
        self.h2t = html2text.HTML2Text()
        self.h2t.ignore_links = False
        self.h2t.body_width = 0

    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if file is PDF format
        """
        return file_path.suffix.lower() in ['.pdf']

    def convert(
        self,
        input_path: Path,
        output_dir: Path,
        extract_images: bool = False,
        clean_headers: bool = False,
    ) -> Path:
        """
        Convert a PDF file to Markdown format.

        Args:
            input_path: Path to the PDF file
            output_dir: Directory to save the converted Markdown file
            extract_images: Whether to extract and save images
            clean_headers: Whether to clean/normalize headers

        Returns:
            Path to the generated Markdown file
        """
        self._ensure_output_dir(output_dir)
        
        markdown_parts = []
        
        # Add frontmatter
        markdown_parts.append("---")
        markdown_parts.append(f"title: {input_path.stem}")
        markdown_parts.append("status: draft")
        markdown_parts.append("---")
        markdown_parts.append("")
        
        # Extract text from PDF
        with pdfplumber.open(input_path) as pdf:
            for page_num, page in enumerate(pdf.pages, 1):
                text = page.extract_text()
                if text:
                    if clean_headers:
                        # Basic header detection and formatting
                        lines = text.split('\n')
                        formatted_lines = []
                        for line in lines:
                            line = line.strip()
                            if line:
                                # Simple heuristic: short lines in all caps might be headers
                                if len(line) < 50 and line.isupper():
                                    formatted_lines.append(f"## {line.title()}")
                                else:
                                    formatted_lines.append(line)
                        markdown_parts.extend(formatted_lines)
                    else:
                        markdown_parts.append(text)
                    
                    markdown_parts.append("")
                
                # Extract images if requested
                if extract_images:
                    images_dir = output_dir / "images"
                    images_dir.mkdir(exist_ok=True)
                    
                    # Note: pdfplumber doesn't directly extract images
                    # This would require additional libraries like PyMuPDF
                    # Left as placeholder for future enhancement
        
        # Write the markdown file
        output_path = self._get_output_path(input_path, output_dir)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write('\n'.join(markdown_parts))
        
        return output_path
