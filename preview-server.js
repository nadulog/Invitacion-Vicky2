const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const root = __dirname;
const port = 5341; // puerto propio de esta invitación (5327 lo usan otras)
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".png": "image/png", ".jpg": "image/jpeg", ".mp3": "audio/mpeg", ".svg": "image/svg+xml", ".webp": "image/webp" };
http.createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  const file = path.resolve(root, (pathname.endsWith("/") ? pathname + "index.html" : pathname).replace(/^\/+/, ""));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) return res.writeHead(404).end("Not found");
  const size = fs.statSync(file).size;
  const headers = { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store", "Accept-Ranges": "bytes" };
  // Safari (iPhone) necesita rangos para reproducir audio
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.range || "");
  if (range) {
    const start = range[1] ? +range[1] : size - +range[2];
    const end = range[1] && range[2] ? Math.min(+range[2], size - 1) : size - 1;
    res.writeHead(206, { ...headers, "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": end - start + 1 });
    return fs.createReadStream(file, { start, end }).pipe(res);
  }
  res.writeHead(200, { ...headers, "Content-Length": size });
  fs.createReadStream(file).pipe(res);
}).listen(port, "0.0.0.0", () => {
  for (const nets of Object.values(os.networkInterfaces())) for (const n of nets) if (n.family === "IPv4" && !n.internal) console.log(`http://${n.address}:${port}`);
});
