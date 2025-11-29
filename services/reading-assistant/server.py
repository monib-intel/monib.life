#!/usr/bin/env python3
"""
Reading Assistant Server

This is a placeholder server for the reading assistant admin interface.
The full implementation will provide:
- Web UI for uploading books
- AI-powered book summarization
- Queue management
- Vault integration

Usage:
    python server.py

Environment Variables:
    ADMIN_PASSWORD: Admin interface password (default: admin)
    PORT: Server port (default: 3000)
"""

import os
import sys
from http.server import HTTPServer, BaseHTTPRequestHandler
from string import Template


class PlaceholderHandler(BaseHTTPRequestHandler):
    """Simple placeholder handler until full implementation."""

    def do_GET(self):
        """Handle GET requests with placeholder response."""
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()

        html_template = Template("""<!DOCTYPE html>
<html>
<head>
    <title>Reading Assistant - Coming Soon</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 100px auto;
            padding: 20px;
            text-align: center;
        }
        h1 { color: #333; }
        p { color: #666; line-height: 1.6; }
        code {
            background: #f4f4f4;
            padding: 2px 6px;
            border-radius: 3px;
        }
    </style>
</head>
<body>
    <h1>📚 Reading Assistant</h1>
    <p>The admin interface is not yet implemented.</p>
    <p>
        This placeholder server confirms the reading-assistant service
        is correctly configured at <code>services/reading-assistant/</code>.
    </p>
    <h2>Features Coming Soon</h2>
    <ul style="text-align: left;">
        <li>Book upload interface</li>
        <li>AI-powered summarization</li>
        <li>Processing queue management</li>
        <li>Vault sync controls</li>
    </ul>
    <p>
        <small>Server running on port $port</small>
    </p>
</body>
</html>""")
        port = os.environ.get("PORT", "3000")
        html = html_template.substitute(port=port)
        self.wfile.write(html.encode())

    def log_message(self, format, *args):
        """Log requests to stdout."""
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    """Start the placeholder server."""
    port = int(os.environ.get("PORT", "3000"))

    print("=" * 60)
    print("Reading Assistant - Placeholder Server")
    print("=" * 60)
    print()
    print("⚠️  This is a placeholder. Full implementation coming soon.")
    print()
    print(f"Server starting on port {port}...")
    print(f"Access at: http://localhost:{port}")
    print()
    print("Press Ctrl+C to stop")
    print()

    server = HTTPServer(("", port), PlaceholderHandler)

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
        server.shutdown()


if __name__ == "__main__":
    main()
