"""
Tests for the admin API.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture
def client():
    """Create test client."""
    return TestClient(app)


def test_health_check(client):
    """Test health check endpoint."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "timestamp" in data


def test_root_endpoint(client):
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "version" in data


def test_list_jobs_empty(client):
    """Test listing jobs when none exist."""
    response = client.get("/api/jobs")
    assert response.status_code == 200
    data = response.json()
    assert "jobs" in data
    assert "total" in data


def test_system_status(client):
    """Test system status endpoint."""
    response = client.get("/api/jobs/status")
    assert response.status_code == 200
    data = response.json()
    assert "total_jobs" in data
    assert "running_jobs" in data
    assert "queued_jobs" in data


def test_upload_invalid_file(client):
    """Test upload with invalid file type."""
    files = {"file": ("test.txt", b"test content", "text/plain")}
    response = client.post("/api/upload", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
