"""Markdown to PDF converter."""

from pathlib import Path
import markdown
from weasyprint import HTML
import tempfile
import sys
import platform
import re

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

        # Check if Literata font is installed
        if not self._is_font_installed('Literata'):
            print("⚠️  Warning: Literata font not found. PDFs will use fallback fonts.", file=sys.stderr)
            print("   Install with: brew install --cask homebrew/cask-fonts/font-literata", file=sys.stderr)

    def _is_font_installed(self, font_name: str) -> bool:
        """
        Check if a font is installed on the system.

        Args:
            font_name: Name of the font to check

        Returns:
            True if font is found, False otherwise
        """
        if platform.system() == 'Darwin':  # macOS
            font_dirs = [
                Path.home() / 'Library' / 'Fonts',
                Path('/Library/Fonts'),
                Path('/System/Library/Fonts'),
            ]

            for font_dir in font_dirs:
                if font_dir.exists():
                    # Check for common font file extensions
                    for ext in ['*.ttf', '*.otf', '*.ttc', '*.dfont']:
                        for font_file in font_dir.glob(f'**/{ext}'):
                            if font_name.lower() in font_file.name.lower():
                                return True

        # For non-macOS systems or if font check fails, return True to avoid false warnings
        return platform.system() != 'Darwin'

    def supports_format(self, file_path: Path) -> bool:
        """
        Check if this converter supports the given file format.

        Args:
            file_path: Path to the file to check

        Returns:
            True if file is Markdown format
        """
        return file_path.suffix.lower() in ['.md', '.markdown']

    def _preprocess_markdown(self, content: str) -> str:
        """
        Preprocess markdown content to fix common formatting issues.

        Specifically fixes lists that aren't recognized by markdown parser
        by ensuring there's a blank line before the list starts.

        Args:
            content: Raw markdown content

        Returns:
            Preprocessed markdown content
        """
        # Fix numbered lists by adding blank line before them
        # Markdown requires a blank line before a list for proper parsing
        # Pattern: matches text ending with ":" or other text, followed immediately by "1. " on next line

        # Add blank line before numbered lists that start with "1."
        content = re.sub(
            r'(^[^\n]+:)\n(1\. )',
            r'\1\n\n\2',
            content,
            flags=re.MULTILINE
        )

        # Also handle cases where text doesn't end with ":"
        content = re.sub(
            r'(^[*\w][^\n]+[^\n:])\n(1\. )',
            r'\1\n\n\2',
            content,
            flags=re.MULTILINE
        )

        # Fix bullet lists (- or *) by adding blank line before them
        # Pattern: matches text followed immediately by "- " or "* " on next line
        content = re.sub(
            r'(^[^\n]+:)\n([-*] )',
            r'\1\n\n\2',
            content,
            flags=re.MULTILINE
        )

        # Also handle cases where text doesn't end with ":"
        content = re.sub(
            r'(^[^\n-*\s][^\n]*[^\n:])\n([-*] )',
            r'\1\n\n\2',
            content,
            flags=re.MULTILINE
        )

        return content

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

        # Preprocess markdown to fix formatting issues
        markdown_content = self._preprocess_markdown(markdown_content)

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
            font-family: 'Literata', 'Georgia', 'Times New Roman', 'Palatino', 'Baskerville', serif;
            font-size: 12pt;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
        }}
        h1 {{
            font-size: 16pt;
            margin-top: 0;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-before: always;
            page-break-after: avoid;
            bookmark-level: 1;
            bookmark-label: content(text);
        }}
        h1:first-child {{
            page-break-before: avoid;
        }}
        h2 {{
            font-size: 15pt;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-before: always;
            page-break-after: avoid;
            bookmark-level: 2;
            bookmark-label: content(text);
        }}
        h1 + h2 {{
            page-break-before: avoid;
        }}
        h3 {{
            font-size: 14pt;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #1a1a1a;
            page-break-before: always;
            page-break-after: avoid;
            bookmark-level: 3;
            bookmark-label: content(text);
        }}
        h4, h5, h6 {{
            font-size: 13pt;
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
            margin: 1em 0;
            padding-left: 2em;
        }}
        li {{
            margin-bottom: 0.75em;
            display: list-item;
            page-break-inside: avoid;
            line-height: 1.6;
            text-align: justify;
        }}
        li p {{
            margin: 0;
            display: block;
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
