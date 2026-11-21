/** Minimal static file server bound to 127.0.0.1. Fonts need an http origin; file:// pages refuse them. */
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json",
};

export function serveDir(root, { port = 0, spa = false } = {}) {
  const base = path.resolve(root);
  const server = http.createServer((req, res) => {
    let rel = decodeURIComponent(new URL(req.url, "http://x").pathname);
    let file = path.join(base, rel);
    if (!file.startsWith(base)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    } catch {
      if (spa) file = path.join(base, "index.html");
    }
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(404, { "content-type": "text/plain" }).end("not found");
        return;
      }
      const head = { "content-type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "cache-control": "no-store", "accept-ranges": "bytes" };
      // Chromium only seeks a <video> freely when the server answers range requests.
      const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (m && (m[1] || m[2])) {
        const start = m[1] ? Number(m[1]) : Math.max(0, data.length - Number(m[2]));
        const end = m[1] && m[2] ? Math.min(Number(m[2]), data.length - 1) : data.length - 1;
        if (start >= data.length || start > end) {
          res.writeHead(416, { "content-range": `bytes */${data.length}` }).end();
          return;
        }
        res.writeHead(206, { ...head, "content-range": `bytes ${start}-${end}/${data.length}`, "content-length": end - start + 1 });
        res.end(data.subarray(start, end + 1));
        return;
      }
      res.writeHead(200, head);
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => {
      const { port: p } = server.address();
      resolve({ url: `http://127.0.0.1:${p}`, port: p, close: () => new Promise((r) => server.close(r)) });
    });
  });
}
