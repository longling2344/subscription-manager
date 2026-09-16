// server.js —— Node 适配入口（Node 18+）
import http from 'node:http';
import worker from './worker.js';

const env = {}; // 本地 mock 环境变量（线上对应 wrangler.toml 里的绑定）
const ctx = { waitUntil: () => {}, passThroughOnException: () => {} };

const server = http.createServer(async (req, res) => {
  // 1. 把 Node 的 req 转成 Fetch API 的 Request
  const url = new URL(req.url, 'http://localhost:8787');
  const request = new Request(url, { method: req.method, headers: req.headers });

  // 2. 调用 Worker 的 fetch 入口
  const response = await worker.fetch(request, env, ctx);

  // 3. 把 Response 写回 Node 的 res
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
});

server.listen(8787, () => console.log('Worker running at http://localhost:8787'));
