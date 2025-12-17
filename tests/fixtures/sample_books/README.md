# Sample Books Test Fixtures

This directory contains test data for integration testing of the reading services pipeline.

## Contents

### Mock Outputs

- `mock_analytical_output.md` - Example output from Reading Assistant (8-stage analytical reading)
- `mock_comparison_output.md` - Example output from Syntopical Reader (comparative analysis)

### Sample EPUB Files (To Be Added)

The following sample EPUB files should be added for full integration testing:

- `book1_design.epub` - Design-related book for testing
- `book2_design.epub` - Second design-related book for comparison testing
- `book3_design.epub` - Third design-related book for multi-book testing

## Creating Sample EPUB Files

For testing purposes, you can:

1. **Use Public Domain Books**: Download from Project Gutenberg
2. **Create Minimal EPUBs**: Use tools like Calibre to create small test files
3. **Use Mock EPUBs**: Create minimal valid EPUB structures for testing

### Minimal EPUB Structure

```
book.epub (zip file)
├── mimetype
├── META-INF/
│   └── container.xml
└── OEBPS/
    ├── content.opf
    ├── toc.ncx
    └── chapter1.html
```

## Usage in Tests

These fixtures are used in:
- `tests/integration/test_full_pipeline.py`

The mock outputs demonstrate the expected format and structure of:
1. Reading Assistant analytical reading output
2. Syntopical Reader comparison output

## Updating Fixtures

When the actual service implementations change:
1. Update mock outputs to match new formats
2. Add new fields or sections as needed
3. Ensure test assertions match the updated structure

## Notes

- Mock files are based on the expected output format from the services
- Actual output format may vary as services are implemented
- Update these fixtures when reading-bot#56 and syntopical#86 are completed
