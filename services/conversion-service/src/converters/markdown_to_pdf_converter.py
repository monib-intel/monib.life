"""Markdown to PDF converter."""

from pathlib import Path
import markdown
from weasyprint import HTML
import tempfile

from .base_converter import BaseConverter


class MarkdownToPDFConverter(BaseConverter):
    """Converter for Markdown files to PDF format."""

    def __init__(self):
        """Initialize the Markdown to PDF converter."""
        self.md = markdown.Markdown(
            extensions=[
                'extra',  # Tables, fenced code blocks, etc.
                'codehilite',  # Code syntax highlighting
                'toc',  # Generates [TOC] placeholder for table of contents
                'meta',  # Metadata support
            ]
        )

    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if file is Markdown format
        """
        return file_path.suffix.lower() in ['.md', '.markdown']

    def convert(
        self,
        input_path: Path,
        output_dir: Path,
        extract_images: bool = False,
        clean_headers: bool = False,
    ) -> Path:
        """
        Convert a Markdown file to PDF format.

        Args:
            input_path: Path to the Markdown file
            output_dir: Directory to save the converted PDF file
            extract_images: Not applicable for Markdown to PDF conversion (ignored)
            clean_headers: Not applicable for Markdown to PDF conversion (ignored)

        Returns:
            Path to the generated PDF file
            
        Raises:
            FileNotFoundError: If the input file doesn't exist
            ValueError: If the Markdown content is invalid
            Exception: If PDF generation fails
        """
        self._ensure_output_dir(output_dir)
        
        # Read the Markdown file
        try:
            with open(input_path, 'r', encoding='utf-8') as f:
                markdown_content = f.read()
        except FileNotFoundError:
            raise FileNotFoundError(f"Input file not found: {input_path}")
        except Exception as e:
            raise Exception(f"Error reading file {input_path}: {e}")
        
        # Convert Markdown to HTML
        try:
            html_content = self.md.convert(markdown_content)
        except Exception as e:
            raise ValueError(f"Error converting Markdown to HTML: {e}")
        
        # Create a styled HTML document
        styled_html = self._create_styled_html(html_content)
        
        # Generate output path (change extension to .pdf)
        output_path = output_dir / f"{input_path.stem}.pdf"
        
        # Convert HTML to PDF using WeasyPrint
        try:
            HTML(string=styled_html, base_url=str(input_path.parent)).write_pdf(
                output_path
            )
        except Exception as e:
            raise Exception(f"Error generating PDF: {e}")
        
        return output_path

    def _create_styled_html(self, body_html: str) -> str:
        """
        Create a styled HTML document from body HTML.

        Args:
            body_html: The HTML content for the body

        Returns:
            Complete HTML document with styling
        """
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {{
            size: A4;
            margin: 2cm;
        }}
        body {{
            font-family: 'Georgia', 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }}
        h1 {{
            font-size: 24pt;
            margin-top: 0;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-after: avoid;
        }}
        h2 {{
            font-size: 18pt;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-after: avoid;
        }}
        h3 {{
            font-size: 14pt;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-after: avoid;
        }}
        h4, h5, h6 {{
            font-size: 12pt;
            margin-top: 0.8em;
            margin-bottom: 0.4em;
            color: #1a1a1a;
            page-break-after: avoid;
        }}
        p {{
            margin: 0.5em 0;
            text-align: justify;
        }}
        code {{
            font-family: 'Courier New', monospace;
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
            font-size: 0.9em;
        }}
        pre {{
            background-color: #f4f4f4;
            border: 1px solid #ddd;
            border-radius: 3px;
            padding: 10px;
            overflow-x: auto;
            page-break-inside: avoid;
        }}
        pre code {{
            background-color: transparent;
            padding: 0;
        }}
        blockquote {{
            border-left: 4px solid #ddd;
            padding-left: 1em;
            margin-left: 0;
            color: #666;
            font-style: italic;
        }}
        table {{
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
            page-break-inside: avoid;
        }}
        th, td {{
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }}
        th {{
            background-color: #f4f4f4;
            font-weight: bold;
        }}
        img {{
            max-width: 100%;
            height: auto;
            page-break-inside: avoid;
        }}
        ul, ol {{
            margin: 0.5em 0;
            padding-left: 2em;
        }}
        li {{
            margin: 0.25em 0;
        }}
        hr {{
            border: none;
            border-top: 1px solid #ddd;
            margin: 1.5em 0;
        }}
        a {{
            color: #0066cc;
            text-decoration: none;
        }}
        a:hover {{
            text-decoration: underline;
        }}
    </style>
</head>
<body>
{body_html}
</body>
</html>
"""
