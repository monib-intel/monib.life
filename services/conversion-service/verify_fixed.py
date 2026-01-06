#!/usr/bin/env python3
"""Verify that the fixed markdown generates correct HTML IDs."""

import markdown
from pathlib import Path
import re

# Initialize markdown with same extensions as the converter
md = markdown.Markdown(
    extensions=[
        'extra',
        'codehilite',
        'toc',
        'meta',
        'attr_list',
    ]
)

# Read the fixed file
fixed_file = Path('../../private/book-summaries-md/Anne_Laure_Le_Cunff_Tiny_Experiments_AnalyticalReading_fixed.md')
with open(fixed_file, 'r') as f:
    content = f.read()

# Convert to HTML
html = md.convert(content)

# Find all Chapter headers with IDs
chapter_headers = re.findall(r'<h3 id="([^"]+)">Chapter \d+:', html)
print(f"Found {len(chapter_headers)} chapter headers with IDs:")
for i, chapter_id in enumerate(chapter_headers[:5], 1):  # Show first 5
    print(f"  {i}. {chapter_id}")

# Find all links to chapters
chapter_links = re.findall(r'<a href="#([^"]+)">Chapter \d+:', html)
print(f"\nFound {len(chapter_links)} chapter links:")
for i, link_id in enumerate(chapter_links[:5], 1):  # Show first 5
    print(f"  {i}. {link_id}")

# Check if IDs match
print("\nVerifying ID matches:")
matches = 0
mismatches = 0
for header_id, link_id in zip(chapter_headers, chapter_links):
    if header_id == link_id:
        matches += 1
    else:
        mismatches += 1
        print(f"  ✗ MISMATCH:")
        print(f"    Header: {header_id}")
        print(f"    Link:   {link_id}")

print(f"\nResults: {matches} matches, {mismatches} mismatches")
if mismatches == 0:
    print("✓ All chapter links should work!")
