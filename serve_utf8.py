import os
import http.server
import socketserver

# 確保工作目錄為專案資料夾
os.chdir(r"D:\備份\apiweb")

Handler = http.server.SimpleHTTPRequestHandler
# 強制為常見網頁靜態檔附加 charset=UTF-8
Handler.extensions_map.update({
    '.html': 'text/html; charset=utf-8',
    '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
})

PORT = 8000
with socketserver.TCPServer(("0.0.0.0", PORT), Handler) as httpd:
    print(f"Serving at http://0.0.0.0:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    httpd.server_close()
