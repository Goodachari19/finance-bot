#!/usr/bin/env node
/**
 * Finance BOT — Local Dev Proxy Server
 * Serves the app on http://localhost:4000 and proxies
 * Yahoo Finance API calls to avoid CORS issues.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 4000;
const PROJECT_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
    '.woff2':'font/woff2',
};

function proxyYahooFinance(req, res) {
    // Extract the path after /api/yf/
    const yfPath = req.url.replace(/^\/api\/yf/, '');
    const yfUrl = `https://query1.finance.yahoo.com${yfPath}`;

    const options = {
        hostname: 'query1.finance.yahoo.com',
        path: yfPath,
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json',
        }
    };

    const proxyReq = https.request(options, (proxyRes) => {
        res.writeHead(proxyRes.statusCode, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Cache-Control': 'public, max-age=30'
        });
        proxyRes.pipe(res, { end: true });
    });

    proxyReq.on('error', (err) => {
        console.error('[Proxy Error]', err.message);
        res.writeHead(502);
        res.end(JSON.stringify({ error: 'Proxy error: ' + err.message }));
    });

    proxyReq.end();
}

function serveStaticFile(req, res) {
    let filePath = path.join(PROJECT_DIR, req.url === '/' ? 'index.html' : req.url);
    const ext = path.extname(filePath);

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404);
            res.end('Not found');
            return;
        }
        res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(204, { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET' });
        res.end(); return;
    }

    if (req.url.startsWith('/api/yf/')) {
        proxyYahooFinance(req, res);
    } else {
        serveStaticFile(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`\n✅ Finance BOT running at: http://localhost:${PORT}`);
    console.log(`   Yahoo Finance proxy at:  http://localhost:${PORT}/api/yf/v8/finance/chart/RELIANCE.NS`);
    console.log(`\n   Press Ctrl+C to stop.\n`);
});
