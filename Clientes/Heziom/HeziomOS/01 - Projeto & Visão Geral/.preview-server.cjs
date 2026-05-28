// Servidor estático mínimo só para preview local do mockup (não versionar).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = '/Users/joaogabrielnovais/Documents/Obsidian/Trivia-Obsidian/Clientes/Heziom/HeziomOS/01 - Projeto & Visão Geral';
const PORT = 4610;
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath === '/') urlPath = '/heziom-painel-saude-tray-meta-mockup.html';
  const filePath = path.join(ROOT, urlPath);
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); return res.end('forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => console.log('preview on http://localhost:' + PORT));
