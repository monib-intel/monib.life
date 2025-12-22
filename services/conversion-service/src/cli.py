#!/usr/bin/env python3
"""CLI for the conversion service."""

import argparse
import sys
from pathlib import Path
from typing import List
from concurrent.futures import ProcessPoolExecutor, as_completed

from converters import EPUBConverter, PDFConverter, MOBIConverter, MarkdownToPDFConverter


def get_converter(file_path: Path):
    """
    Get the appropriate converter for a file.

    Args:
        file_path: Path to the file to convert

    Returns:
        Converter instance or None if format not supported
    """
    converters = [EPUBConverter(), PDFConverter(), MOBIConverter(), MarkdownToPDFConverter()]
    
    for converter in converters:
        if converter.supports_format(file_path):
            return converter
    
    return None


def convert_single_file(
    input_path: Path,
    output_dir: Path,
    extract_images: bool = False,
    clean_headers: bool = False,
) -> tuple[Path, bool, str]:
    """
    Convert a single file to Markdown.

    Args:
        input_path: Path to the input file
        output_dir: Directory for output files
        extract_images: Whether to extract images
        clean_headers: Whether to clean headers

    Returns:
        Tuple of (input_path, success, message)
    """
    try:
        converter = get_converter(input_path)
        if not converter:
            return (input_path, False, f"Unsupported format: {input_path.suffix}")
        
        output_path = converter.convert(
            input_path,
            output_dir,
            extract_images=extract_images,
            clean_headers=clean_headers,
        )
        return (input_path, True, f"Converted to {output_path}")
    except Exception as e:
        return (input_path, False, f"Error: {str(e)}")


def convert_files(
    input_paths: List[Path],
    output_dir: Path,
    extract_images: bool = False,
    clean_headers: bool = False,
    parallel: bool = False,
    workers: int = 4,
) -> None:
    """
    Convert multiple files to Markdown.

    Args:
        input_paths: List of input file paths
        output_dir: Directory for output files
        extract_images: Whether to extract images
        clean_headers: Whether to clean headers
        parallel: Whether to use parallel processing
        workers: Number of parallel workers
    """
    if parallel and len(input_paths) > 1:
        print(f"Converting {len(input_paths)} files in parallel (workers: {workers})...")
        with ProcessPoolExecutor(max_workers=workers) as executor:
            futures = {
                executor.submit(
                    convert_single_file,
                    path,
                    output_dir,
                    extract_images,
                    clean_headers,
                ): path
                for path in input_paths
            }
            
            for future in as_completed(futures):
                input_path, success, message = future.result()
                status = "✓" if success else "✗"
                print(f"{status} {input_path.name}: {message}")
    else:
        print(f"Converting {len(input_paths)} files...")
        for input_path in input_paths:
            input_path, success, message = convert_single_file(
                input_path,
                output_dir,
                extract_images,
                clean_headers,
            )
            status = "✓" if success else "✗"
            print(f"{status} {input_path.name}: {message}")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="Convert ebook files (EPUB, PDF, MOBI) to Markdown or Markdown to PDF",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Convert ebook to Markdown
  %(prog)s book.epub --output-dir ./markdown

  # Convert Markdown to PDF
  %(prog)s document.md --output-dir ./pdf

  # Convert multiple files
  %(prog)s book1.epub book2.pdf book3.mobi document.md --output-dir ./output

  # Batch conversion with parallel processing
  %(prog)s books/*.epub --parallel --workers 4 --output-dir ./markdown

  # Extract images and clean headers
  %(prog)s book.pdf --extract-images --clean-headers --output-dir ./markdown
        """,
    )
    
    parser.add_argument(
        'files',
        nargs='+',
        type=Path,
        help='Input files to convert (supports EPUB, PDF, MOBI, Markdown)',
    )
    
    parser.add_argument(
        '--output-dir',
        type=Path,
        default=Path('./output'),
        help='Output directory for converted files (default: ./output)',
    )
    
    parser.add_argument(
        '--extract-images',
        action='store_true',
        help='Extract and save images from books',
    )
    
    parser.add_argument(
        '--clean-headers',
        action='store_true',
        help='Clean and normalize headers',
    )
    
    parser.add_argument(
        '--parallel',
        action='store_true',
        help='Use parallel processing for batch conversion',
    )
    
    parser.add_argument(
        '--workers',
        type=int,
        default=4,
        help='Number of parallel workers (default: 4)',
    )
    
    args = parser.parse_args()
    
    # Validate input files
    input_paths = []
    for file_path in args.files:
        if not file_path.exists():
            print(f"Error: File not found: {file_path}", file=sys.stderr)
            sys.exit(1)
        if not file_path.is_file():
            print(f"Error: Not a file: {file_path}", file=sys.stderr)
            sys.exit(1)
        input_paths.append(file_path)
    
    # Create output directory
    args.output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert files
    try:
        convert_files(
            input_paths,
            args.output_dir,
            extract_images=args.extract_images,
            clean_headers=args.clean_headers,
            parallel=args.parallel,
            workers=args.workers,
        )
        print(f"\n✓ Conversion complete! Output in: {args.output_dir}")
    except KeyboardInterrupt:
        print("\n\n✗ Conversion cancelled by user", file=sys.stderr)
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Conversion failed: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == '__main__':
    main()
