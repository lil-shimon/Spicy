import path from 'path';
import http from 'http';
import fs from 'fs';

const PORT = 3000;
const LOG_PATH = path.resolve(process.cwd(), 'data', 'arb-logs.jsonl');

const server = http.createServer((req, res) => {
  if (req.url === '/api/logs' && req.method === 'GET') {
    fs.readFile(LOG_PATH, 'utf-8', (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Failed to read logs');
      } else {
        const lines = data.trim().split('\n');
        const logs = lines.map((line) => JSON.parse(line));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(logs));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
