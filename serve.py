import http.server
import socketserver
import sys

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

port = 8080
with socketserver.TCPServer(("", port), NoCacheHTTPRequestHandler) as httpd:
    print(f"Serving at port {port}")
    httpd.serve_forever()
