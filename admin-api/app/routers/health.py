"""
Health check endpoints.
"""

from datetime import datetime

from fastapi import APIRouter

from ..models import HealthStatus
from .. import __version__

router = APIRouter()


@router.get("/health", response_model=HealthStatus)
async def health_check():
    """Health check endpoint."""
    return HealthStatus(
        status="healthy",
        version=__version__,
        timestamp=datetime.now()
    )
