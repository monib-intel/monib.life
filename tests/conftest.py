"""
Pytest configuration and fixtures for integration tests.

This module provides shared fixtures and configuration for testing the
reading services pipeline.
"""

import os
import tempfile
from pathlib import Path
from typing import Generator

import pytest


@pytest.fixture
def project_root() -> Path:
    """Return the project root directory."""
    return Path(__file__).parent.parent


@pytest.fixture
def test_fixtures_dir(project_root: Path) -> Path:
    """Return the test fixtures directory."""
    return project_root / "tests" / "fixtures"


@pytest.fixture
def sample_books_dir(test_fixtures_dir: Path) -> Path:
    """Return the sample books directory."""
    return test_fixtures_dir / "sample_books"


@pytest.fixture
def temp_output_dir() -> Generator[Path, None, None]:
    """Create and return a temporary directory for test outputs."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield Path(tmpdir)


@pytest.fixture
def reading_assistant_path(project_root: Path) -> Path:
    """Return the path to the reading-assistant service."""
    return project_root / "services" / "reading-assistant"


@pytest.fixture
def syntopical_assistant_path(project_root: Path) -> Path:
    """Return the path to the syntopical-reading-assistant service."""
    return project_root / "services" / "syntopical-reading-assistant"


@pytest.fixture
def unified_cli_path(project_root: Path) -> Path:
    """Return the path to the unified CLI."""
    return project_root / "cli" / "unified.py"


@pytest.fixture
def mock_analytical_reading_output(sample_books_dir: Path) -> Path:
    """Return path to a mock analytical reading output."""
    return sample_books_dir / "mock_analytical_output.md"


@pytest.fixture
def mock_comparison_output(sample_books_dir: Path) -> Path:
    """Return path to a mock comparison output."""
    return sample_books_dir / "mock_comparison_output.md"


def pytest_configure(config):
    """Configure pytest with custom markers."""
    config.addinivalue_line(
        "markers", "integration: mark test as an integration test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )
    config.addinivalue_line(
        "markers", "requires_services: mark test as requiring external services"
    )
    config.addinivalue_line(
        "markers", "requires_api_key: mark test as requiring API keys"
    )
