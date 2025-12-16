#!/usr/bin/env python3
"""
Unified CLI for Reading Services

This CLI orchestrates both reading-assistant and syntopical-reading-assistant services
to provide a seamless workflow for analyzing and comparing books.

NOTE: This CLI is a coordination layer that calls the underlying services.
The actual script names and interfaces may vary based on the submodule implementations.
Adjust the script paths in each method based on the actual service APIs.

Usage:
    reading analyze-syntopical book1.epub book2.epub book3.epub
    reading analyze book1.epub
    reading compare output1.md output2.md output3.md
    reading library-connect comparison.md
    reading find-gaps comparison.md
"""

import argparse
import os
import subprocess
import sys
from pathlib import Path
from typing import List, Optional


class ReadingCLI:
    """Main CLI coordinator for reading services."""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.reading_assistant_path = self.project_root / "services" / "reading-assistant"
        self.syntopical_assistant_path = self.project_root / "services" / "syntopical-reading-assistant"
        
    def check_service_exists(self, service_path: Path, service_name: str) -> bool:
        """Check if a service submodule is initialized."""
        if not service_path.exists() or not list(service_path.iterdir()):
            print(f"Error: {service_name} not found or not initialized.")
            print(f"Please initialize submodules: git submodule update --init --recursive")
            return False
        return True
    
    def check_script_exists(self, script_path: Path, script_name: str) -> bool:
        """Check if a service script exists."""
        if not script_path.exists():
            print(f"Error: {script_name} not found at {script_path}")
            print(f"The service may not have this entry point yet.")
            print(f"Please check the service README for the correct interface.")
            return False
        return True
    
    def run_reading_assistant(self, epub_file: str) -> Optional[str]:
        """
        Run reading-assistant on an EPUB file (8 stages).
        
        Args:
            epub_file: Path to the EPUB file to analyze
            
        Returns:
            Path to the generated output markdown file, or None if failed
            
        Note:
            This method assumes the reading-assistant service has a process_epub.py
            entry point. Adjust the script name and arguments based on the actual
            service API.
        """
        if not self.check_service_exists(self.reading_assistant_path, "reading-assistant"):
            return None
            
        print(f"\n📚 Running Reading Assistant on {epub_file}...")
        print("Processing through 8 stages...")
        
        # Check if EPUB file exists
        if not os.path.exists(epub_file):
            print(f"Error: File not found: {epub_file}")
            return None
        
        # Determine the script to call - adjust based on actual service interface
        script_path = self.reading_assistant_path / "process_epub.py"
        
        if not self.check_script_exists(script_path, "process_epub.py"):
            return None
        
        # Call reading-assistant service
        try:
            cmd = [
                "python",
                str(script_path),
                epub_file
            ]
            result = subprocess.run(cmd, cwd=self.reading_assistant_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Try to parse output from stdout to get the actual generated file path
                # If the service prints the output file path, use it
                output_file = None
                for line in result.stdout.split('\n'):
                    if line.strip().endswith('.md'):
                        output_file = line.strip()
                        break
                
                # Fallback to default naming convention
                if not output_file:
                    output_file = f"{Path(epub_file).stem}_analysis.md"
                
                print(f"✓ Analysis complete: {output_file}")
                return output_file
            else:
                print(f"Error running reading-assistant:")
                print(result.stderr)
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    def run_syntopical_compare(self, markdown_files: List[str]) -> Optional[str]:
        """
        Run syntopical reading comparison (stages 1-3).
        
        Args:
            markdown_files: List of markdown files to compare
            
        Returns:
            Path to the comparison output file, or None if failed
            
        Note:
            This method assumes the syntopical-reading-assistant service has a
            compare.py entry point. Adjust the script name and arguments based on
            the actual service API.
        """
        if not self.check_service_exists(self.syntopical_assistant_path, "syntopical-reading-assistant"):
            return None
            
        print(f"\n🔍 Running Syntopical Comparison on {len(markdown_files)} files...")
        print("Processing stages 1-3...")
        
        # Validate all input files exist
        for md_file in markdown_files:
            if not os.path.exists(md_file):
                print(f"Error: File not found: {md_file}")
                return None
        
        # Determine the script to call - adjust based on actual service interface
        script_path = self.syntopical_assistant_path / "compare.py"
        
        if not self.check_script_exists(script_path, "compare.py"):
            return None
        
        # Call syntopical-reading-assistant compare function
        try:
            cmd = [
                "python",
                str(script_path),
                *markdown_files
            ]
            result = subprocess.run(cmd, cwd=self.syntopical_assistant_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                # Try to parse output from stdout to get the actual generated file path
                output_file = None
                for line in result.stdout.split('\n'):
                    if line.strip().endswith('.md'):
                        output_file = line.strip()
                        break
                
                # Fallback to default naming convention
                if not output_file:
                    output_file = "comparison_output.md"
                
                print(f"✓ Comparison complete: {output_file}")
                return output_file
            else:
                print(f"Error running syntopical comparison:")
                print(result.stderr)
                return None
        except Exception as e:
            print(f"Error: {e}")
            return None
    
    def run_library_connect(self, comparison_file: str) -> bool:
        """
        Connect comparison to library (stage 4).
        
        Args:
            comparison_file: Path to the comparison markdown file
            
        Returns:
            True if successful, False otherwise
            
        Note:
            This method assumes the syntopical-reading-assistant service has a
            library_connect.py entry point. Adjust the script name and arguments
            based on the actual service API.
        """
        if not self.check_service_exists(self.syntopical_assistant_path, "syntopical-reading-assistant"):
            return False
            
        print(f"\n📖 Connecting to library: {comparison_file}...")
        
        if not os.path.exists(comparison_file):
            print(f"Error: File not found: {comparison_file}")
            return False
        
        # Determine the script to call - adjust based on actual service interface
        script_path = self.syntopical_assistant_path / "library_connect.py"
        
        if not self.check_script_exists(script_path, "library_connect.py"):
            return False
        
        try:
            cmd = [
                "python",
                str(script_path),
                comparison_file
            ]
            result = subprocess.run(cmd, cwd=self.syntopical_assistant_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✓ Library connection complete")
                return True
            else:
                print(f"Error:")
                print(result.stderr)
                return False
        except Exception as e:
            print(f"Error: {e}")
            return False
    
    def run_find_gaps(self, comparison_file: str) -> bool:
        """
        Find gaps in the comparison (stage 5).
        
        Args:
            comparison_file: Path to the comparison markdown file
            
        Returns:
            True if successful, False otherwise
            
        Note:
            This method assumes the syntopical-reading-assistant service has a
            find_gaps.py entry point. Adjust the script name and arguments based
            on the actual service API.
        """
        if not self.check_service_exists(self.syntopical_assistant_path, "syntopical-reading-assistant"):
            return False
            
        print(f"\n🔎 Finding gaps in: {comparison_file}...")
        
        if not os.path.exists(comparison_file):
            print(f"Error: File not found: {comparison_file}")
            return False
        
        # Determine the script to call - adjust based on actual service interface
        script_path = self.syntopical_assistant_path / "find_gaps.py"
        
        if not self.check_script_exists(script_path, "find_gaps.py"):
            return False
        
        try:
            cmd = [
                "python",
                str(script_path),
                comparison_file
            ]
            result = subprocess.run(cmd, cwd=self.syntopical_assistant_path, capture_output=True, text=True)
            
            if result.returncode == 0:
                print("✓ Gap analysis complete")
                return True
            else:
                print(f"Error:")
                print(result.stderr)
                return False
        except Exception as e:
            print(f"Error: {e}")
            return False
    
    def analyze_syntopical(self, epub_files: List[str]) -> bool:
        """
        Run full syntopical pipeline: analyze all books, then compare.
        
        Args:
            epub_files: List of EPUB files to analyze
            
        Returns:
            True if successful, False otherwise
        """
        print(f"\n🚀 Starting full syntopical analysis pipeline...")
        print(f"Processing {len(epub_files)} books...\n")
        
        # Step 1: Analyze each book
        analyzed_files = []
        for epub_file in epub_files:
            output_file = self.run_reading_assistant(epub_file)
            if output_file:
                analyzed_files.append(output_file)
            else:
                print(f"Warning: Failed to analyze {epub_file}, continuing with others...")
        
        if not analyzed_files:
            print("Error: No books were successfully analyzed.")
            return False
        
        # Step 2: Compare analyzed files
        comparison_file = self.run_syntopical_compare(analyzed_files)
        if not comparison_file:
            print("Error: Comparison failed.")
            return False
        
        # Step 3: Connect to library
        if not self.run_library_connect(comparison_file):
            print("Warning: Library connection failed, but comparison is complete.")
        
        # Step 4: Find gaps
        if not self.run_find_gaps(comparison_file):
            print("Warning: Gap analysis failed, but comparison is complete.")
        
        print("\n✓ Full syntopical analysis pipeline complete!")
        return True


def create_parser() -> argparse.ArgumentParser:
    """Create the argument parser for the CLI."""
    parser = argparse.ArgumentParser(
        prog='reading',
        description='Unified CLI for Reading Services - Orchestrates reading-assistant and syntopical-reading-assistant',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Full syntopical pipeline (analyze + compare)
  reading analyze-syntopical book1.epub book2.epub book3.epub

  # Individual stages
  reading analyze book1.epub                      # Reading Assistant (8 stages)
  reading compare output1.md output2.md           # Syntopical comparison (stages 1-3)
  reading library-connect comparison.md            # Connect to library (stage 4)
  reading find-gaps comparison.md                  # Find gaps (stage 5)

For more information, see cli/README.md
        """
    )
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # analyze-syntopical command (full pipeline)
    analyze_syntopical_parser = subparsers.add_parser(
        'analyze-syntopical',
        help='Run full syntopical pipeline: analyze all books then compare'
    )
    analyze_syntopical_parser.add_argument(
        'books',
        nargs='+',
        help='EPUB files to analyze and compare'
    )
    
    # analyze command (reading-assistant only)
    analyze_parser = subparsers.add_parser(
        'analyze',
        help='Analyze a single book with reading-assistant (8 stages)'
    )
    analyze_parser.add_argument(
        'book',
        help='EPUB file to analyze'
    )
    
    # compare command (syntopical stages 1-3)
    compare_parser = subparsers.add_parser(
        'compare',
        help='Compare multiple book analyses (syntopical stages 1-3)'
    )
    compare_parser.add_argument(
        'files',
        nargs='+',
        help='Markdown files to compare'
    )
    
    # library-connect command (stage 4)
    library_connect_parser = subparsers.add_parser(
        'library-connect',
        help='Connect comparison to library (stage 4)'
    )
    library_connect_parser.add_argument(
        'comparison',
        help='Comparison markdown file'
    )
    
    # find-gaps command (stage 5)
    find_gaps_parser = subparsers.add_parser(
        'find-gaps',
        help='Find gaps in comparison (stage 5)'
    )
    find_gaps_parser.add_argument(
        'comparison',
        help='Comparison markdown file'
    )
    
    return parser


def main():
    """Main entry point for the CLI."""
    parser = create_parser()
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    cli = ReadingCLI()
    
    try:
        if args.command == 'analyze-syntopical':
            success = cli.analyze_syntopical(args.books)
            sys.exit(0 if success else 1)
            
        elif args.command == 'analyze':
            output = cli.run_reading_assistant(args.book)
            sys.exit(0 if output else 1)
            
        elif args.command == 'compare':
            output = cli.run_syntopical_compare(args.files)
            sys.exit(0 if output else 1)
            
        elif args.command == 'library-connect':
            success = cli.run_library_connect(args.comparison)
            sys.exit(0 if success else 1)
            
        elif args.command == 'find-gaps':
            success = cli.run_find_gaps(args.comparison)
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(130)
    except Exception as e:
        print(f"\nUnexpected error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
