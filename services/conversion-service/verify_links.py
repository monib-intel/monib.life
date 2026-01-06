#!/usr/bin/env python3
"""Verify that PDF links are being created."""

from pathlib import Path
import PyPDF2

# Check the test PDF
pdf_path = Path('output/test_internal_links.pdf')

if pdf_path.exists():
    with open(pdf_path, 'rb') as f:
        reader = PyPDF2.PdfReader(f)
        
        print(f"PDF: {pdf_path}")
        print(f"Pages: {len(reader.pages)}")
        print("\nChecking for annotations (links)...")
        
        for page_num, page in enumerate(reader.pages):
            if '/Annots' in page:
                annots = page['/Annots']
                print(f"\nPage {page_num + 1} has {len(annots)} annotations:")
                for i, annot in enumerate(annots):
                    annot_obj = annot.get_object()
                    if '/A' in annot_obj:  # Action
                        action = annot_obj['/A']
                        if '/URI' in action:
                            print(f"  {i+1}. External link: {action['/URI']}")
                        elif '/D' in action:  # Destination
                            print(f"  {i+1}. Internal link: {action['/D']}")
                    elif '/Dest' in annot_obj:
                        print(f"  {i+1}. Internal destination: {annot_obj['/Dest']}")
            else:
                print(f"Page {page_num + 1}: No annotations found")
else:
    print(f"PDF not found: {pdf_path}")
