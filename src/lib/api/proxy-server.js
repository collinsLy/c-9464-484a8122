
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Add CoinGecko API key to requests
const COINGECKO_API_KEY = "CG-vfbBd2nG74YmzzoytroimuaZ";

// Proxy middleware options
const coingeckoOptions = {
  target: 'https://api.coingecko.com/api/v3',
  changeOrigin: true,
  pathRewrite: {
    '^/api/coingecko': '', // remove /api/coingecko prefix
  },
  onProxyReq: (proxyReq, req, res) => {
    // Add API key to all requests
    const url = new URL(proxyReq.path, 'https://api.coingecko.com');
    url.searchParams.append('x_cg_api_key', COINGECKO_API_KEY);
    proxyReq.path = `${url.pathname}${url.search}`;
  },
  logLevel: 'debug'
};

// Use the proxy middleware
app.use('/api/coingecko', createProxyMiddleware(coingeckoOptions));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
