"""
File upload endpoints.
"""

import os
import shutil
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import JSONResponse

from ..models import UploadResponse

router = APIRouter(prefix="/api", tags=["upload"])

# Configuration
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
MAX_UPLOAD_SIZE = int(os.getenv("MAX_UPLOAD_SIZE", 100 * 1024 * 1024))  # 100MB default


@router.post("/upload", response_model=UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    """Upload an EPUB file for processing.
    
    Args:
        file: The uploaded file
        
    Returns:
        Upload response with file details
        
    Raises:
        HTTPException: If file validation fails
    """
    # Validate file extension
    if not file.filename or not file.filename.lower().endswith('.epub'):
        raise HTTPException(
            status_code=400,
            detail="Only EPUB files are supported"
        )
    
    # Create upload directory
    upload_path = Path(UPLOAD_DIR)
    upload_path.mkdir(parents=True, exist_ok=True)
    
    # Generate safe filename
    safe_filename = file.filename.replace(" ", "_")
    file_path = upload_path / safe_filename
    
    # Check if file already exists and add number suffix if needed
    counter = 1
    original_path = file_path
    while file_path.exists():
        stem = original_path.stem
        suffix = original_path.suffix
        file_path = upload_path / f"{stem}_{counter}{suffix}"
        counter += 1
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Get file size
        file_size = os.path.getsize(file_path)
        
        # Validate size
        if file_size > MAX_UPLOAD_SIZE:
            os.remove(file_path)
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_UPLOAD_SIZE / (1024*1024):.0f}MB"
            )
        
        return UploadResponse(
            filename=file_path.name,
            file_path=str(file_path),
            size=file_size,
            message="File uploaded successfully"
        )
        
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            try:
                os.remove(file_path)
            except:
                pass
        raise HTTPException(
            status_code=500,
            detail=f"Failed to upload file: {str(e)}"
        )
    finally:
        await file.close()
