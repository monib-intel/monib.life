#!/usr/bin/env python3
"""
Admin Server for monib.life - Reading Bot Integration
Simple Flask server for managing book processing and site administration.
"""

import os
import subprocess
import logging
from datetime import datetime
from pathlib import Path
from functools import wraps

from flask import Flask, request, jsonify, send_from_directory, Response
from werkzeug.utils import secure_filename

# Configuration
BASE_DIR = Path(__file__).parent
BOOKS_DIR = BASE_DIR / "books"
LOGS_DIR = BASE_DIR / "logs"
ADMIN_DIR = BASE_DIR / "admin"
PROJECT_ROOT = BASE_DIR.parent
CONTENT_DIR = PROJECT_ROOT / "content"
VAULT_DIR = PROJECT_ROOT / "vault"

# Ensure directories exist
BOOKS_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'epub', 'pdf'}

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler(LOGS_DIR / "admin.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__, static_folder='admin', static_url_path='/admin')


def get_admin_password():
    """Get admin password from environment variable.

    For production use, always set ADMIN_PASSWORD environment variable.
    The default 'admin' password is only for local development.
    """
    password = os.environ.get('ADMIN_PASSWORD', '')
    if not password:
        logger.warning(
            "ADMIN_PASSWORD not set. Using default 'admin' for development. "
            "Set ADMIN_PASSWORD environment variable for production."
        )
        return 'admin'
    return password


def require_auth(f):
    """Decorator to require password authentication."""
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.authorization
        password = get_admin_password()

        # Validate that username is 'admin' and password matches
        if not auth or auth.username != 'admin' or auth.password != password:
            return Response(
                'Authentication required',
                401,
                {'WWW-Authenticate': 'Basic realm="Admin"'}
            )
        return f(*args, **kwargs)
    return decorated


def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def get_book_list():
    """Get list of uploaded books."""
    books = []
    for ext in ALLOWED_EXTENSIONS:
        for book_path in BOOKS_DIR.glob(f'*.{ext}'):
            stat = book_path.stat()
            books.append({
                'name': book_path.name,
                'size': stat.st_size,
                'uploaded': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'processed': check_book_processed(book_path.stem)
            })
    return sorted(books, key=lambda x: x['uploaded'], reverse=True)


def check_book_processed(book_stem):
    """Check if a book has been processed (summary exists)."""
    summaries_dir = CONTENT_DIR / "BookSummaries"
    if summaries_dir.exists():
        for _ in summaries_dir.glob(f'*{book_stem}*.md'):
            return True
    return False


def get_logs(lines=100):
    """Get recent log entries."""
    log_file = LOGS_DIR / "admin.log"
    if not log_file.exists():
        return []

    with open(log_file, 'r') as f:
        all_lines = f.readlines()
        return all_lines[-lines:]


# Routes

@app.route('/')
@require_auth
def index():
    """Redirect to admin interface."""
    return send_from_directory(ADMIN_DIR, 'index.html')


@app.route('/admin/<path:filename>')
@require_auth
def serve_admin(filename):
    """Serve admin static files."""
    return send_from_directory(ADMIN_DIR, filename)


@app.route('/api/status')
@require_auth
def api_status():
    """Get system status."""
    return jsonify({
        'status': 'online',
        'timestamp': datetime.now().isoformat(),
        'books_dir': str(BOOKS_DIR),
        'content_dir': str(CONTENT_DIR),
        'books_count': len(get_book_list()),
    })


@app.route('/api/books', methods=['GET'])
@require_auth
def api_books_list():
    """List all uploaded books."""
    return jsonify({
        'books': get_book_list()
    })


@app.route('/api/books/upload', methods=['POST'])
@require_auth
def api_books_upload():
    """Upload a book file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if not allowed_file(file.filename):
        return jsonify({
            'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400

    filename = secure_filename(file.filename)
    filepath = BOOKS_DIR / filename

    file.save(filepath)
    logger.info(f"Book uploaded: {filename}")

    return jsonify({
        'message': 'File uploaded successfully',
        'filename': filename,
        'path': str(filepath)
    })


@app.route('/api/books/<filename>', methods=['DELETE'])
@require_auth
def api_books_delete(filename):
    """Delete a book file."""
    filepath = BOOKS_DIR / secure_filename(filename)

    if not filepath.exists():
        return jsonify({'error': 'File not found'}), 404

    filepath.unlink()
    logger.info(f"Book deleted: {filename}")

    return jsonify({'message': 'File deleted successfully'})


@app.route('/api/process', methods=['POST'])
@require_auth
def api_process_books():
    """Trigger book processing.

    This endpoint would integrate with the reading-bot for book processing.
    Currently returns a placeholder response.
    """
    data = request.get_json() or {}
    book_name = data.get('book')

    if book_name:
        # Process specific book
        filepath = BOOKS_DIR / secure_filename(book_name)
        if not filepath.exists():
            return jsonify({'error': 'Book not found'}), 404

        logger.info(f"Processing book: {book_name}")
        # TODO: Integrate with reading-bot for actual processing
        return jsonify({
            'message': f'Processing started for: {book_name}',
            'status': 'pending',
            'note': 'Reading-bot integration pending'
        })
    else:
        # Process all unprocessed books
        books = get_book_list()
        unprocessed = [b for b in books if not b['processed']]

        logger.info(f"Processing {len(unprocessed)} unprocessed books")
        # TODO: Integrate with reading-bot for actual processing
        return jsonify({
            'message': f'Processing started for {len(unprocessed)} books',
            'books': [b['name'] for b in unprocessed],
            'status': 'pending',
            'note': 'Reading-bot integration pending'
        })


@app.route('/api/sync', methods=['POST'])
@require_auth
def api_sync_vault():
    """Trigger vault sync."""
    try:
        # Use absolute path and validate it's within project
        sync_script = (PROJECT_ROOT / "scripts" / "sync-vault.sh").resolve()
        if not sync_script.is_file():
            return jsonify({'error': 'Sync script not found'}), 500
        if not str(sync_script).startswith(str(PROJECT_ROOT.resolve())):
            return jsonify({'error': 'Invalid script path'}), 500

        result = subprocess.run(
            ['bash', str(sync_script)],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=60
        )

        if result.returncode == 0:
            logger.info("Vault sync completed successfully")
            return jsonify({
                'message': 'Vault synced successfully',
                'output': result.stdout
            })
        else:
            logger.error(f"Vault sync failed: {result.stderr}")
            return jsonify({
                'error': 'Sync failed',
                'details': result.stderr
            }), 500

    except subprocess.TimeoutExpired:
        logger.error("Vault sync timed out")
        return jsonify({'error': 'Sync timed out'}), 500
    except Exception as e:
        logger.error(f"Vault sync error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/build', methods=['POST'])
@require_auth
def api_build_site():
    """Trigger site rebuild."""
    import shutil
    try:
        # Check if npx is available
        if not shutil.which('npx'):
            return jsonify({'error': 'npx not found. Please install Node.js'}), 500

        result = subprocess.run(
            ['npx', 'quartz', 'build'],
            cwd=PROJECT_ROOT,
            capture_output=True,
            text=True,
            timeout=300
        )

        if result.returncode == 0:
            logger.info("Site build completed successfully")
            return jsonify({
                'message': 'Site built successfully',
                'output': result.stdout[-1000:] if result.stdout else ''
            })
        else:
            logger.error(f"Site build failed: {result.stderr}")
            return jsonify({
                'error': 'Build failed',
                'details': result.stderr[-1000:] if result.stderr else ''
            }), 500

    except subprocess.TimeoutExpired:
        logger.error("Site build timed out")
        return jsonify({'error': 'Build timed out'}), 500
    except Exception as e:
        logger.error(f"Site build error: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/logs')
@require_auth
def api_logs():
    """Get recent logs."""
    lines = request.args.get('lines', 100, type=int)
    logs = get_logs(min(lines, 500))  # Cap at 500 lines
    return jsonify({
        'logs': logs,
        'count': len(logs)
    })


@app.route('/health')
def health():
    """Health check endpoint (no auth required)."""
    return jsonify({'status': 'healthy'})


if __name__ == '__main__':
    port = int(os.environ.get('ADMIN_PORT', 3000))
    debug = os.environ.get('FLASK_DEBUG', 'false').lower() == 'true'

    logger.info(f"Starting admin server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
