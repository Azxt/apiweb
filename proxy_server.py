import os
import http.server
import socketserver
import urllib.request

os.chdir(r"D:\備份\apiweb")

ALLOWED = {
    'api02': 'https://apiservice.mol.gov.tw/OdService/download/A17030000J-000037-jcd',
    'api03': 'https://apiservice.mol.gov.tw/OdService/download/A17030000J-000050-1oj',
    'api04': 'https://apiservice.mol.gov.tw/OdService/download/A17030000J-000049-Bpf',
    'api05': 'https://apiservice.mol.gov.tw/OdService/download/A17030000J-000040-1ae'
}

class ProxyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Allow cross-origin from localhost (for testing)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_GET(self):
        if self.path.startswith('/proxy/'):
            key = self.path.split('/proxy/')[-1].split('?')[0]
            if key in ALLOWED:
                target = ALLOWED[key]
                try:
                    import ssl
                    ctx = ssl.create_default_context()
                    ctx.check_hostname = False
                    ctx.verify_mode = ssl.CERT_NONE
                    with urllib.request.urlopen(target, timeout=15, context=ctx) as resp:
                        data = resp.read()
                        # Default to application/json
                        self.send_response(200)
                        self.send_header('Content-Type', resp.getheader('Content-Type','application/json'))
                        self.end_headers()
                        self.wfile.write(data)
                except Exception as e:
                    self.send_response(502)
                    self.send_header('Content-Type', 'text/plain; charset=utf-8')
                    self.end_headers()
                    self.wfile.write(str(e).encode('utf-8'))
            else:
                self.send_response(404)
                self.end_headers()
                self.wfile.write(b'Not Found')
        else:
            # Fall back to default static file handling
            super().do_GET()

PORT = 8002
with socketserver.TCPServer(("0.0.0.0", PORT), ProxyHandler) as httpd:
    print(f"Proxy server serving at http://0.0.0.0:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
