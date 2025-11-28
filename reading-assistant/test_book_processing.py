#!/usr/bin/env python3
"""
Test script for book processing without API calls.
Tests the input/output flow of the admin server book processing.
"""

import sys
from pathlib import Path
import tempfile

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from epub_to_obsidian.converter import EpubConverter


def test_book_conversion(epub_path: str, output_dir: str):
    """
    Test book conversion without API calls.
    Only tests EPUB extraction and metadata parsing.
    """
    epub_path = Path(epub_path)
    output_dir = Path(output_dir)
    
    if not epub_path.exists():
        print(f"❌ Error: Book not found: {epub_path}")
        return False
    
    print("=" * 60)
    print("Book Processing Test (No API)")
    print("=" * 60)
    print(f"\nInput: {epub_path}")
    print(f"Output: {output_dir}")
    
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Test conversion
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            print("\n1. Converting EPUB to Markdown...")
            converter = EpubConverter(str(epub_path), temp_dir)
            markdown_path, metadata = converter.convert()
            
            print("   ✓ Conversion successful")
            print(f"\n2. Metadata extracted:")
            print(f"   Title: {metadata.title}")
            print(f"   Author: {metadata.author}")
            if metadata.language:
                print(f"   Language: {metadata.language}")
            if metadata.publisher:
                print(f"   Publisher: {metadata.publisher}")
            
            # Get chapters
            print(f"\n3. Extracting chapters...")
            chapters = converter.get_chapters()
            print(f"   ✓ Found {len(chapters)} chapters")
            
            # Show first few chapters
            print(f"\n4. Chapter structure:")
            for i, chapter in enumerate(chapters[:5]):
                print(f"   - {chapter['title'][:60]}...")
            if len(chapters) > 5:
                print(f"   ... and {len(chapters) - 5} more chapters")
            
            # Calculate total content size
            total_words = sum(len(ch['content'].split()) for ch in chapters)
            print(f"\n5. Content statistics:")
            print(f"   Total chapters: {len(chapters)}")
            print(f"   Estimated words: {total_words:,}")
            print(f"   Estimated pages: ~{total_words // 250}")
            
            # Create a simple test output file
            test_output = output_dir / f"{epub_path.stem}_test_output.md"
            with open(test_output, 'w') as f:
                f.write(f"# {metadata.title}\n\n")
                f.write(f"**Author:** {metadata.author}\n\n")
                f.write(f"## Book Information\n\n")
                f.write(f"- **Chapters:** {len(chapters)}\n")
                f.write(f"- **Estimated Words:** {total_words:,}\n")
                f.write(f"- **Language:** {metadata.language or 'Unknown'}\n\n")
                f.write(f"## Chapter List\n\n")
                for i, chapter in enumerate(chapters, 1):
                    f.write(f"{i}. {chapter['title']}\n")
                f.write(f"\n---\n")
                f.write(f"\n*This is a test output. Full processing requires API calls.*\n")
            
            print(f"\n6. Test output created:")
            print(f"   {test_output}")
            
            print("\n" + "=" * 60)
            print("✓ Test completed successfully!")
            print("=" * 60)
            print("\nNote: This test only validates EPUB conversion.")
            print("Full Inspectional Reading analysis requires API access.")
            return True
            
        except Exception as e:
            print(f"\n❌ Test failed: {e}")
            import traceback
            traceback.print_exc()
            return False


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python test_book_processing.py <epub_path> [output_dir]")
        print("\nExample:")
        print("  python test_book_processing.py books/The-Will.epub ../content/BookSummaries")
        sys.exit(1)
    
    epub_path = sys.argv[1]
    output_dir = sys.argv[2] if len(sys.argv) > 2 else "../content/BookSummaries"
    
    success = test_book_conversion(epub_path, output_dir)
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
