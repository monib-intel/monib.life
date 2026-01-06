#!/usr/bin/env python3
"""Fix headers in markdown to add explicit IDs that match the links."""

import re
from pathlib import Path

def extract_id_from_link(link_line):
    """Extract the ID from a markdown link."""
    match = re.search(r'\(#([^)]+)\)', link_line)
    if match:
        return match.group(1)
    return None

def process_file(input_path):
    """Process the markdown file to add IDs to headers."""
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # First pass: collect all link IDs and their corresponding chapter titles
    link_map = {}
    for line in lines:
        if re.match(r'^[-*]\s+\[Chapter \d+:', line):
            # Extract chapter number and ID
            chapter_match = re.search(r'Chapter (\d+):', line)
            id_match = re.search(r'\(#([^)]+)\)', line)
            if chapter_match and id_match:
                chapter_num = chapter_match.group(1)
                link_id = id_match.group(1)
                link_map[chapter_num] = link_id

    print("Found link IDs:")
    for chapter, link_id in sorted(link_map.items()):
        print(f"  Chapter {chapter}: {link_id}")

    # Second pass: add IDs to headers
    output_lines = []
    for i, line in enumerate(lines):
        # Check if this is a chapter header
        if re.match(r'^###\s+Chapter \d+:', line):
            chapter_match = re.search(r'Chapter (\d+):', line)
            if chapter_match:
                chapter_num = chapter_match.group(1)
                if chapter_num in link_map:
                    # Add the ID to the header
                    line = line.rstrip()
                    if not line.endswith('}'):  # Don't add if ID already exists
                        line = f"{line} {{#{link_map[chapter_num]}}}\n"
                        print(f"Fixed Chapter {chapter_num}")
                    else:
                        line = line + '\n'

        output_lines.append(line)

    return output_lines

def main():
    input_file = Path('../../private/book-summaries-md/Anne_Laure_Le_Cunff_Tiny_Experiments_AnalyticalReading.md')

    if not input_file.exists():
        print(f"Error: File not found: {input_file}")
        return

    print(f"Processing: {input_file}")
    output_lines = process_file(input_file)

    # Write to output file
    output_file = input_file.parent / f"{input_file.stem}_fixed.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(output_lines)

    print(f"\nFixed file written to: {output_file}")

if __name__ == '__main__':
    main()
