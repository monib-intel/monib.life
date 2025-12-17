# Integration Tests for Reading Services Pipeline

This directory contains integration tests for the monib.life reading services pipeline, which includes:
- **Reading Assistant** (8-stage analytical reading)
- **Syntopical Reading Assistant** (5-stage comparative analysis)
- **Unified CLI** (orchestration layer)

## Overview

The integration tests verify end-to-end functionality across the entire reading pipeline:

```
EPUB Files → Reading Assistant → Analytical Output
                                        ↓
                              Bridge Adapter
                                        ↓
                         Syntopical Reader → Comparison
                                        ↓
                              Library Connection
                                        ↓
                                  Gap Analysis
```

## Test Scenarios

### Scenario 1: Three Books Pipeline
Tests the complete pipeline with three books on the same topic:
1. Analyze all three books with Reading Assistant
2. Compare analyses with Syntopical Reader
3. Connect to user's library
4. Identify knowledge gaps

### Scenario 2: Two Books Comparison
Tests comparative analysis with two related books:
1. Analyze two books individually
2. Compare the analyses
3. Verify agreements and disagreements are identified

### Scenario 3: Single Book Library Connection
Tests library integration with a single book:
1. Analyze one book
2. Connect to user's library
3. Find related books in the collection

## Directory Structure

```
tests/
├── __init__.py                    # Package initialization
├── conftest.py                    # Pytest fixtures and configuration
├── README.md                      # This file
├── integration/                   # Integration tests
│   ├── __init__.py
│   └── test_full_pipeline.py     # Main pipeline tests
└── fixtures/                      # Test data
    └── sample_books/              # Sample book data
        ├── README.md
        ├── mock_analytical_output.md
        └── mock_comparison_output.md
```

## Prerequisites

### 1. Dependencies
Install pytest and related packages:

```bash
pip install pytest pytest-cov
```

### 2. Services
Ensure the submodules are initialized:

```bash
git submodule update --init --recursive
```

### 3. Implementation Status

**Current Status (As of creation):**
- ✅ Unified CLI implemented (Issue #37)
- ⚠️ Reading Assistant Stage 8 (reading-bot#56) - **Not yet implemented**
- ⚠️ Bridge Adapter (syntopical#86) - **Not yet implemented**

**Note:** Most integration tests are currently skipped with `pytest.mark.skip` decorators because they depend on the above features being implemented. Once the dependencies are resolved, remove the skip markers to enable the tests.

## Running Tests

### Run All Tests
```bash
# From project root
pytest

# Or with verbose output
pytest -v

# Or with coverage
pytest --cov=cli --cov=services --cov-report=term-missing
```

### Run Only Integration Tests
```bash
pytest -m integration
```

### Run Specific Test File
```bash
pytest tests/integration/test_full_pipeline.py
```

### Run Specific Test
```bash
pytest tests/integration/test_full_pipeline.py::TestFullPipeline::test_service_availability
```

### Run with Output
```bash
# Show print statements
pytest -s

# Show all output including passed tests
pytest -v -s
```

### Skip Slow Tests
```bash
pytest -m "not slow"
```

### Skip Tests Requiring Services
```bash
pytest -m "not requires_services"
```

## Test Markers

Tests are marked with pytest markers to allow selective running:

- `@pytest.mark.integration` - Integration test (tests multiple components)
- `@pytest.mark.slow` - Test takes a long time to run
- `@pytest.mark.requires_services` - Requires external services to be initialized
- `@pytest.mark.requires_api_key` - Requires API keys (OPENAI_API_KEY, etc.)

## Available Fixtures

Common fixtures available in all tests (defined in `conftest.py`):

- `project_root` - Path to the project root directory
- `test_fixtures_dir` - Path to test fixtures directory
- `sample_books_dir` - Path to sample books directory
- `temp_output_dir` - Temporary directory for test outputs
- `reading_assistant_path` - Path to reading-assistant service
- `syntopical_assistant_path` - Path to syntopical-reading-assistant service
- `unified_cli_path` - Path to unified CLI script
- `mock_analytical_reading_output` - Path to mock analytical output
- `mock_comparison_output` - Path to mock comparison output

## Writing New Tests

### Example Test

```python
import pytest

@pytest.mark.integration
@pytest.mark.requires_services
def test_my_integration(unified_cli_path, temp_output_dir):
    """Test description."""
    # Test implementation
    pass
```

### Best Practices

1. **Mark appropriately**: Use markers to indicate test type and requirements
2. **Use fixtures**: Leverage existing fixtures for common setup
3. **Clean up**: Use `temp_output_dir` for temporary files
4. **Skip when needed**: Use `pytest.mark.skip` for tests that require unimplemented features
5. **Document**: Add clear docstrings explaining what the test verifies

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Integration Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
        with:
          submodules: recursive
      
      - uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      
      - name: Install dependencies
        run: pip install pytest pytest-cov
      
      - name: Run tests
        run: pytest -m "not requires_api_key"
```

## Troubleshooting

### Submodules Not Initialized
```
Error: reading-assistant service not found
```
**Solution**: Run `git submodule update --init --recursive`

### Tests Are Skipped
Most tests are currently skipped because they depend on features that haven't been implemented yet (reading-bot#56, syntopical#86). This is expected.

### Import Errors
```
ImportError: No module named 'pytest'
```
**Solution**: Install pytest: `pip install pytest`

### Service Not Found
```
AssertionError: reading-assistant service appears empty
```
**Solution**: The submodule may not have been cloned. Check `.git/modules/` and reinitialize submodules.

## Updating Tests

When dependencies are implemented:

1. **Remove skip markers** from relevant tests in `test_full_pipeline.py`
2. **Update mock data** in `fixtures/sample_books/` to match actual output format
3. **Add sample EPUB files** for testing actual book processing
4. **Update assertions** to match actual service behavior
5. **Add new test scenarios** as features are added

## Contributing

When adding new integration tests:

1. Place tests in the appropriate file or create a new test file
2. Use descriptive test names that explain what is being tested
3. Add appropriate markers
4. Document prerequisites and dependencies
5. Update this README if adding new test categories

## Related Documentation

- [Unified CLI README](../cli/README.md)
- [Integration Plan](../services/INTEGRATION_PLAN.md)
- [Composition Architecture](../services/COMPOSITION.md)
- [Main Project README](../README.md)

## Future Enhancements

- [ ] Add performance benchmarks
- [ ] Add stress tests with many books
- [ ] Add tests for error recovery
- [ ] Add tests for concurrent processing
- [ ] Add end-to-end tests with real EPUB files
- [ ] Add visual regression tests for output formats
- [ ] Add tests for CLI interactive features
