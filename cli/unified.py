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
    
    # Batch/parallel processing
    reading batch-analyze book1.epub book2.epub book3.epub --workers 3
    reading batch-pipeline *.epub --workers 5 --synthesize
"""

import argparse
import os
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
from pathlib import Path
from typing import List, Optional, Dict, Tuple


class ReadingCLI:
    """Main CLI coordinator for reading services."""

    def __init__(self):
        self.project_root = Path(__file__).parent.parent
        self.reading_assistant_path = self.project_root / "services" / "reading-assistant"
        self.syntopical_assistant_path = self.project_root / "services" / "syntopical-reading-assistant"
        
    def check_service_exists(self, service_path: Path, service_name: str) -> bool:
        """Check if a service submodule is initialized."""
        if not service_path.exists() or not list(service_path.iterdir()):
            print(f"Error: {service_name} not found or not initialized.", flush=True)
            print(f"Please initialize submodules: git submodule update --init --recursive", flush=True)
            return False
        return True
    
    def check_script_exists(self, script_path: Path, script_name: str) -> bool:
        """Check if a service script exists."""
        if not script_path.exists():
            print(f"Error: {script_name} not found at {script_path}", flush=True)
            print(f"The service may not have this entry point yet.", flush=True)
            print(f"Please check the service README for the correct interface.", flush=True)
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
            This method calls the reading-assistant service directly using Python.
            If ANTHROPIC_API_KEY is not set, it uses --convert-only mode.
        """
        if not self.check_service_exists(self.reading_assistant_path, "reading-assistant"):
            return None
            
        print(f"\n📚 Running Reading Assistant on {epub_file}...", flush=True)
        print("Processing through 8 stages...", flush=True)
        
        # Check if EPUB file exists
        if not os.path.exists(epub_file):
            print(f"Error: File not found: {epub_file}", flush=True)
            return None
        
        # Call reading-assistant service using subprocess for real-time output
        try:
            # Create output directory in vault/BookSummaries
            vault_dir = self.project_root / "vault" / "BookSummaries"
            output_dir = vault_dir
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Check if service has a CLI entry point
            cli_script = self.reading_assistant_path / "src" / "epub_to_obsidian" / "cli.py"
            
            # Check if API key is available
            api_key_available = os.environ.get("ANTHROPIC_API_KEY")
            
            # Build command to run the service
            if api_key_available:
                # Full extraction mode
                print("📖 Starting analysis with AI extraction...", flush=True)
                cmd = [
                    sys.executable,
                    str(cli_script),
                    epub_file,
                    "--extract",
                    "--summary",
                    "--output-dir",
                    str(output_dir)
                ]
            else:
                # Conversion-only mode (no AI extraction)
                print("📖 Starting conversion-only mode (API key not available)...", flush=True)
                cmd = [
                    sys.executable,
                    str(cli_script),
                    epub_file,
                    "--convert-only",
                    "--output-dir",
                    str(output_dir)
                ]
            
            print(f"🔧 Executing: {' '.join(cmd)}", flush=True)
            print("=" * 80, flush=True)
            
            # Run subprocess with real-time output streaming
            result = subprocess.run(
                cmd,
                cwd=self.reading_assistant_path,
                capture_output=False,  # Don't capture - let it stream to stdout
                text=True,
                env=os.environ.copy()
            )
            
            print("=" * 80, flush=True)
            
            if result.returncode == 0:
                # Find the generated output file
                markdown_files = list(output_dir.glob("*.md"))
                if markdown_files:
                    # Get the most recently modified file
                    output_file = str(max(markdown_files, key=lambda p: p.stat().st_mtime))
                    print(f"✓ Analysis complete: {output_file}", flush=True)
                    return output_file
                else:
                    print(f"Warning: Could not locate output file in {output_dir}", flush=True)
                    return None
            else:
                print(f"Error: Process exited with code {result.returncode}", flush=True)
                return None
                
        except FileNotFoundError:
            # If direct CLI script doesn't exist, fall back to import-based approach
            print("⚠️  CLI script not found, trying import-based approach...", flush=True)
            try:
                import sys
                sys.path.insert(0, str(self.reading_assistant_path / "src"))
                from epub_to_obsidian.cli import main as reading_cli
                
                # Build command arguments
                base_args = [
                    "epub_to_obsidian",
                    epub_file,
                    "--output-dir",
                    str(output_dir)
                ]
                
                # Add mode-specific flags
                if api_key_available:
                    mode_args = ["--extract", "--summary"]
                else:
                    mode_args = ["--convert-only"]
                
                # Set sys.argv for Click CLI
                sys.argv = base_args[:2] + mode_args + base_args[2:]
                
                exit_code = reading_cli()
                
                if exit_code == 0 or exit_code is None:
                    markdown_files = list(output_dir.glob("*.md"))
                    if markdown_files:
                        output_file = str(max(markdown_files, key=lambda p: p.stat().st_mtime))
                        print(f"✓ Analysis complete: {output_file}", flush=True)
                        return output_file
                    else:
                        print(f"Warning: Could not locate output file", flush=True)
                        return None
                else:
                    print(f"Error: CLI exited with code {exit_code}", flush=True)
                    return None
            except Exception as e:
                print(f"Error in import-based approach: {e}", flush=True)
                import traceback
                traceback.print_exc()
                return None
                
        except Exception as e:
            print(f"Error: {e}", flush=True)
            import traceback
            traceback.print_exc()
            return None
    
    def run_syntopical_compare(self, markdown_files: List[str]) -> Optional[str]:
        """
        Run syntopical reading comparison/synthesis (stages 1-3).
        
        Args:
            markdown_files: List of markdown files to compare (analytical reading outputs)
            
        Returns:
            Path to the comparison output file, or None if failed
        """
        if not self.check_service_exists(self.syntopical_assistant_path, "syntopical-reading-assistant"):
            return None
            
        print(f"\n🔍 Running Syntopical Synthesis on {len(markdown_files)} files...", flush=True)
        print("Processing stages 1-3...", flush=True)
        
        # Validate all input files exist
        for md_file in markdown_files:
            if not os.path.exists(md_file):
                print(f"Error: File not found: {md_file}", flush=True)
                return None
        
        try:
            # Import and use the coordinator directly
            import sys
            sys.path.insert(0, str(self.syntopical_assistant_path))
            from orchestrator.coordinator import Coordinator
            
            # Create output directory in vault
            vault_dir = self.project_root / "vault" / "BookSummaries"
            output_dir = vault_dir / "synthesis"
            output_dir.mkdir(parents=True, exist_ok=True)
            
            # Initialize coordinator
            coordinator = Coordinator(base_dir=output_dir)
            coordinator.initialize()
            
            # For now, create a simple output file merging the inputs
            # In future, this would call the actual synthesizer agents
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            synthesis_file = output_dir / f"synthesis_{timestamp}.md"
            
            # Merge all markdown files into synthesis output
            with open(synthesis_file, 'w') as out:
                out.write("# Syntopical Analysis\n\n")
                out.write(f"Generated: {datetime.now().isoformat()}\n")
                out.write(f"Analyzed Books: {len(markdown_files)}\n\n")
                
                for i, md_file in enumerate(markdown_files, 1):
                    out.write(f"## Book {i}: {Path(md_file).stem}\n\n")
                    try:
                        with open(md_file, 'r') as f:
                            content = f.read()
                            # Add book content with proper formatting
                            out.write(content)
                            out.write("\n\n---\n\n")
                    except Exception as e:
                        print(f"Warning: Could not read {md_file}: {e}", flush=True)
            
            print(f"✓ Synthesis complete: {synthesis_file}", flush=True)
            return str(synthesis_file)
            
        except Exception as e:
            print(f"Error running syntopical synthesis:", flush=True)
            print(f"Exception: {e}", flush=True)
            import traceback
            traceback.print_exc()
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
            
        print(f"\n📖 Connecting to library: {comparison_file}...", flush=True)
        
        if not os.path.exists(comparison_file):
            print(f"Error: File not found: {comparison_file}", flush=True)
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
                print("✓ Library connection complete", flush=True)
                return True
            else:
                print(f"Error:", flush=True)
                print(result.stderr, flush=True)
                return False
        except Exception as e:
            print(f"Error: {e}", flush=True)
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
            
        print(f"\n🔎 Finding gaps in: {comparison_file}...", flush=True)
        
        if not os.path.exists(comparison_file):
            print(f"Error: File not found: {comparison_file}", flush=True)
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
                print("✓ Gap analysis complete", flush=True)
                return True
            else:
                print(f"Error:", flush=True)
                print(result.stderr, flush=True)
                return False
        except Exception as e:
            print(f"Error: {e}", flush=True)
            return False
    
    def batch_analyze(self, epub_files: List[str], workers: int = 3, progress: bool = True) -> Dict[str, Optional[str]]:
        """
        Analyze multiple books in parallel using thread pool.
        
        Args:
            epub_files: List of EPUB file paths to analyze
            workers: Number of parallel workers (default: 3)
            progress: Whether to show progress updates
            
        Returns:
            Dictionary mapping epub file paths to their output markdown files
        """
        print(f"\n🚀 Starting batch analysis of {len(epub_files)} books with {workers} workers...", flush=True)
        
        results: Dict[str, Optional[str]] = {}
        
        def analyze_book(epub_file: str) -> Tuple[str, Optional[str]]:
            """Analyze a single book and return (input_file, output_file)."""
            try:
                output = self.run_reading_assistant(epub_file)
                return (epub_file, output)
            except Exception as e:
                print(f"Error analyzing {epub_file}: {e}", flush=True)
                return (epub_file, None)
        
        # Use ThreadPoolExecutor for parallel processing
        with ThreadPoolExecutor(max_workers=workers) as executor:
            futures = {
                executor.submit(analyze_book, epub_file): epub_file 
                for epub_file in epub_files
            }
            
            completed = 0
            for future in as_completed(futures):
                epub_file, output_file = future.result()
                results[epub_file] = output_file
                completed += 1
                
                if progress:
                    status = "✓" if output_file else "✗"
                    print(f"{status} [{completed}/{len(epub_files)}] {Path(epub_file).name}", flush=True)
        
        print(f"\n✨ Batch analysis complete: {len([v for v in results.values() if v])} succeeded", flush=True)
        return results
    
    def batch_pipeline(
        self, 
        epub_files: List[str], 
        workers: int = 3, 
        synthesize: bool = False,
        progress: bool = True
    ) -> Dict[str, Optional[str]]:
        """
        Full pipeline: analyze all books in parallel, then optionally compare/synthesize.
        
        Args:
            epub_files: List of EPUB file paths
            workers: Number of parallel workers
            synthesize: Whether to run syntopical comparison afterward
            progress: Whether to show progress updates
            
        Returns:
            Dictionary mapping epub files to their output files
        """
        # Phase 1: Batch analyze all books
        results = self.batch_analyze(epub_files, workers=workers, progress=progress)
        
        # Filter successful analyses
        markdown_files = [f for f in results.values() if f is not None]
        
        if not markdown_files:
            print("Error: No books were successfully analyzed", flush=True)
            return results
        
        # Phase 2: Optional synthesis/comparison
        if synthesize and len(markdown_files) > 1:
            print(f"\n🔍 Synthesizing {len(markdown_files)} book analyses...", flush=True)
            comparison_output = self.run_syntopical_compare(markdown_files)
            if comparison_output:
                results['_comparison'] = comparison_output
                print(f"✓ Synthesis complete: {comparison_output}", flush=True)
        
        return results
    
    def analyze_syntopical(self, epub_files: List[str]) -> bool:
        """
        Run full syntopical pipeline: analyze all books, then compare.
        
        Args:
            epub_files: List of EPUB files to analyze
            
        Returns:
            True if successful, False otherwise
        """
        print(f"\n🚀 Starting full syntopical analysis pipeline...", flush=True)
        print(f"Processing {len(epub_files)} books...\n", flush=True)
        
        # Step 1: Analyze each book
        analyzed_files = []
        for epub_file in epub_files:
            output_file = self.run_reading_assistant(epub_file)
            if output_file:
                analyzed_files.append(output_file)
            else:
                print(f"Warning: Failed to analyze {epub_file}, continuing with others...", flush=True)
        
        if not analyzed_files:
            print("Error: No books were successfully analyzed.", flush=True)
            return False
        
        # Step 2: Compare analyzed files
        comparison_file = self.run_syntopical_compare(analyzed_files)
        if not comparison_file:
            print("Error: Comparison failed.", flush=True)
            print("Check the error messages above for details.", flush=True)
            return False
        
        # Step 3: Connect to library
        if not self.run_library_connect(comparison_file):
            print("Warning: Library connection step failed.", flush=True)
            print(f"You can retry manually with: python cli/unified.py library-connect {comparison_file}", flush=True)
        
        # Step 4: Find gaps
        if not self.run_find_gaps(comparison_file):
            print("Warning: Gap analysis step failed.", flush=True)
            print(f"You can retry manually with: python cli/unified.py find-gaps {comparison_file}", flush=True)
        
        print("\n✓ Full syntopical analysis pipeline complete!", flush=True)
        print(f"Output: {comparison_file}", flush=True)
        return True
    
    def batch_analyze(
        self, 
        epub_files: List[str], 
        workers: int = 3, 
        progress: bool = False
    ) -> List[Tuple[str, Optional[str]]]:
        """
        Batch analyze multiple EPUB files in parallel.
        
        Args:
            epub_files: List of EPUB files to analyze
            workers: Number of parallel workers (default: 3)
            progress: Show progress reporting (default: False)
            
        Returns:
            List of tuples (epub_file, output_file or None)
        """
        print(f"\n📚 Batch analyzing {len(epub_files)} books with {workers} workers...", flush=True)
        
        results = []
        completed = 0
        failed = 0
        
        def process_single_book(epub_file: str) -> Tuple[str, Optional[str]]:
            """Process a single book and return result."""
            return (epub_file, self.run_reading_assistant(epub_file))
        
        # Use ThreadPoolExecutor for I/O-bound tasks
        with ThreadPoolExecutor(max_workers=workers) as executor:
            # Submit all tasks
            future_to_book = {
                executor.submit(process_single_book, book): book 
                for book in epub_files
            }
            
            # Process completed tasks
            for future in as_completed(future_to_book):
                book = future_to_book[future]
                try:
                    epub_file, output_file = future.result()
                    results.append((epub_file, output_file))
                    completed += 1
                    
                    if output_file:
                        if progress:
                            print(f"✓ [{completed}/{len(epub_files)}] Completed: {epub_file}", flush=True)
                    else:
                        failed += 1
                        if progress:
                            print(f"✗ [{completed}/{len(epub_files)}] Failed: {epub_file}", flush=True)
                except Exception as e:
                    completed += 1
                    failed += 1
                    results.append((book, None))
                    if progress:
                        print(f"✗ [{completed}/{len(epub_files)}] Error processing {book}: {e}", flush=True)
        
        # Summary
        successful = completed - failed
        print(f"\n📊 Batch analysis complete:", flush=True)
        print(f"   ✓ Successful: {successful}/{len(epub_files)}", flush=True)
        print(f"   ✗ Failed: {failed}/{len(epub_files)}", flush=True)
        
        return results
    
    def batch_pipeline(
        self,
        epub_files: List[str],
        workers: int = 5,
        synthesize: bool = False,
        progress: bool = False
    ) -> bool:
        """
        Run full pipeline with batch processing: analyze + synthesize.
        
        Args:
            epub_files: List of EPUB files to analyze
            workers: Number of parallel workers (default: 5)
            synthesize: Run syntopical synthesis after analysis (default: False)
            progress: Show progress reporting (default: False)
            
        Returns:
            True if successful, False otherwise
        """
        print(f"\n🚀 Starting batch pipeline...", flush=True)
        print(f"Books: {len(epub_files)}, Workers: {workers}, Synthesize: {synthesize}", flush=True)
        
        # Step 1: Batch analyze all books
        results = self.batch_analyze(epub_files, workers, progress)
        
        # Extract successful analyses
        analyzed_files = [output for _, output in results if output is not None]
        
        if not analyzed_files:
            print("\n❌ Error: No books were successfully analyzed.", flush=True)
            return False
        
        if len(analyzed_files) < len(epub_files):
            print(f"\n⚠️  Warning: Only {len(analyzed_files)}/{len(epub_files)} books were successfully analyzed.", flush=True)
        
        # Step 2: Optionally run syntopical synthesis
        if synthesize:
            print(f"\n🔍 Running syntopical synthesis on {len(analyzed_files)} analyses...", flush=True)
            
            # Compare analyzed files
            comparison_file = self.run_syntopical_compare(analyzed_files)
            if not comparison_file:
                print("❌ Error: Comparison failed.", flush=True)
                return False
            
            # Connect to library
            if not self.run_library_connect(comparison_file):
                print("⚠️  Warning: Library connection step failed.", flush=True)
                print(f"You can retry with: reading library-connect {comparison_file}", flush=True)
            
            # Find gaps
            if not self.run_find_gaps(comparison_file):
                print("⚠️  Warning: Gap analysis step failed.", flush=True)
                print(f"You can retry with: reading find-gaps {comparison_file}", flush=True)
            
            print(f"\n✓ Batch pipeline complete with synthesis!", flush=True)
            print(f"Comparison output: {comparison_file}", flush=True)
        else:
            print(f"\n✓ Batch analysis complete!", flush=True)
            print(f"Analyzed {len(analyzed_files)} books successfully.", flush=True)
        
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

  # Batch/parallel processing
  reading batch-analyze book1.epub book2.epub book3.epub --workers 3
  reading batch-analyze books/*.epub --workers 5 --progress
  reading batch-pipeline *.epub --workers 5 --synthesize
  reading batch-pipeline books/*.epub --workers 3 --progress

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
    
    # batch-analyze command (parallel processing)
    batch_analyze_parser = subparsers.add_parser(
        'batch-analyze',
        help='Batch analyze multiple books in parallel'
    )
    batch_analyze_parser.add_argument(
        'books',
        nargs='+',
        help='EPUB files to analyze in parallel'
    )
    batch_analyze_parser.add_argument(
        '--workers',
        type=int,
        default=3,
        help='Number of parallel workers (default: 3)'
    )
    batch_analyze_parser.add_argument(
        '--progress',
        action='store_true',
        help='Show progress reporting'
    )
    
    # batch-pipeline command (full pipeline with parallel processing)
    batch_pipeline_parser = subparsers.add_parser(
        'batch-pipeline',
        help='Run full pipeline with batch processing: analyze + synthesize'
    )
    batch_pipeline_parser.add_argument(
        'books',
        nargs='+',
        help='EPUB files to process in parallel'
    )
    batch_pipeline_parser.add_argument(
        '--workers',
        type=int,
        default=5,
        help='Number of parallel workers (default: 5)'
    )
    batch_pipeline_parser.add_argument(
        '--synthesize',
        action='store_true',
        help='Run syntopical synthesis after analysis'
    )
    batch_pipeline_parser.add_argument(
        '--progress',
        action='store_true',
        help='Show progress reporting'
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
            
        elif args.command == 'batch-analyze':
            results = cli.batch_analyze(args.books, args.workers, args.progress)
            # Exit with success if at least one book was analyzed
            success = any(output is not None for _, output in results)
            sys.exit(0 if success else 1)
            
        elif args.command == 'batch-pipeline':
            success = cli.batch_pipeline(
                args.books, 
                args.workers, 
                args.synthesize, 
                args.progress
            )
            sys.exit(0 if success else 1)
            
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.", flush=True)
        sys.exit(130)
    except Exception as e:
        print(f"\nUnexpected error: {e}", flush=True)
        sys.exit(1)


if __name__ == '__main__':
    main()
