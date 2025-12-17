"""
Logging configuration for unified job logging.
"""

import logging
import os
from datetime import datetime
from pathlib import Path
from typing import List, Optional


def setup_job_logger(job_id: str, log_dir: str = "./logs") -> tuple[logging.Logger, str]:
    """Set up a logger for a specific job.
    
    Args:
        job_id: Job ID
        log_dir: Directory to store log files
        
    Returns:
        Tuple of (logger, log_file_path)
    """
    # Create logs directory
    log_path = Path(log_dir)
    log_path.mkdir(parents=True, exist_ok=True)
    
    # Create log file for this job
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    log_file = log_path / f"{job_id}_{timestamp}.log"
    
    # Create logger
    logger = logging.getLogger(f"job.{job_id}")
    logger.setLevel(logging.INFO)
    
    # Remove existing handlers to avoid duplicates
    logger.handlers.clear()
    
    # File handler
    file_handler = logging.FileHandler(log_file)
    file_handler.setLevel(logging.INFO)
    
    # Formatter with timestamp and job ID
    formatter = logging.Formatter(
        f'%(asctime)s - JOB:{job_id} - %(levelname)s - %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
    
    # Also log to console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)
    
    logger.info(f"Job logger initialized for {job_id}")
    
    return logger, str(log_file)


def get_job_logger(job_id: str) -> Optional[logging.Logger]:
    """Get existing logger for a job.
    
    Args:
        job_id: Job ID
        
    Returns:
        Logger if exists, None otherwise
    """
    logger_name = f"job.{job_id}"
    if logger_name in logging.Logger.manager.loggerDict:
        return logging.getLogger(logger_name)
    return None


def tail_log_file(log_file: str, lines: int = 100) -> List[str]:
    """Get last N lines from a log file.
    
    Args:
        log_file: Path to log file
        lines: Number of lines to return
        
    Returns:
        List of log lines
    """
    if not os.path.exists(log_file):
        return []
    
    try:
        with open(log_file, 'r') as f:
            return f.readlines()[-lines:]
    except Exception:
        return []


def read_log_file(log_file: str, start_pos: int = 0) -> tuple[str, int]:
    """Read log file from a position and return content with new position.
    
    Args:
        log_file: Path to log file
        start_pos: Starting position in file
        
    Returns:
        Tuple of (content, new_position)
    """
    if not os.path.exists(log_file):
        return "", 0
    
    try:
        with open(log_file, 'r') as f:
            f.seek(start_pos)
            content = f.read()
            new_pos = f.tell()
            return content, new_pos
    except Exception:
        return "", start_pos
