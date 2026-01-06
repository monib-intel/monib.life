#!/usr/bin/env python3
"""Debug script to check HTML output from markdown conversion."""

import markdown
from pathlib import Path

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

# Read test file
test_file = Path('test_internal_links.md')
with open(test_file, 'r') as f:
    content = f.read()

# Convert to HTML
html = md.convert(content)

# Print HTML to see anchor IDs
print("=" * 80)
print("HTML OUTPUT:")
print("=" * 80)
print(html)
print("\n" + "=" * 80)

# Check for anchor tags
print("\nANCHOR TAGS (<a href=...):")
print("=" * 80)
import re
anchors = re.findall(r'<a href="([^"]+)">', html)
for anchor in anchors:
    print(f"  - {anchor}")

# Check for ID attributes
print("\n" + "=" * 80)
print("ID ATTRIBUTES:")
print("=" * 80)
ids = re.findall(r'id="([^"]+)"', html)
for id_attr in ids:
    print(f"  - {id_attr}")
