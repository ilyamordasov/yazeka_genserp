const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = 8081;

// Enable CORS for all routes
app.use(cors({
  origin: ['http://localhost:3000', 'https://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: '*' // Allow all headers to fix the x-stainless-os issue
}));

// Proxy middleware for OpenAI API
const openaiProxy = createProxyMiddleware({
  target: 'https://api.openai.com',
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1': '/v1' // Remove /api prefix when forwarding to OpenAI
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying request:', req.method, req.url);
    console.log('Headers:', req.headers);
  },
  onProxyRes: (proxyRes, req, res) => {
    console.log('Received response:', proxyRes.statusCode);
  },
  onError: (err, req, res) => {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
});

// Use the proxy for all /api/v1 routes
app.use('/api/v1', openaiProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'CORS proxy server is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 CORS Proxy Server running on http://localhost:${PORT}`);
  console.log(`🔗 Use this as your REACT_APP_OPENAI_BASE_URL: http://localhost:${PORT}/api/v1`);
});