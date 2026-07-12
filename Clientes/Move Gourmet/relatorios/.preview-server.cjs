const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 4620;
const DIR = __dirname;

const server = http.createServer((req, res) => {
  const filePath = path.join(DIR, req.url === '/' ? 'Relatorio Tecnico - Move Gourmet Jun 2026.html' : req.url);
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.pdf': 'application/pdf' };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => console.log(`Move Gourmet preview at http://localhost:${PORT}`));
