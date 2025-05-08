
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

// Initialize express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Memory cache for responses
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Simple rate limiter
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20; // 20 requests per minute
const requestTimestamps = [];

function rateLimiter(req, res, next) {
  const now = Date.now();
  
  // Remove timestamps older than the window
  while (requestTimestamps.length > 0 && requestTimestamps[0] < now - RATE_LIMIT_WINDOW) {
    requestTimestamps.shift();
  }
  
  // Check if we've exceeded the rate limit
  if (requestTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const oldestTimestamp = requestTimestamps[0];
    const resetTime = oldestTimestamp + RATE_LIMIT_WINDOW;
    const timeToReset = Math.ceil((resetTime - now) / 1000);
    
    res.status(429).json({
      error: 'Too Many Requests',
      message: `Rate limit exceeded. Try again in ${timeToReset} seconds.`
    });
    return;
  }
  
  // Add current timestamp to the list
  requestTimestamps.push(now);
  next();
}

// Caching middleware
function cacheMiddleware(req, res, next) {
  const cacheKey = req.originalUrl;
  const cachedResponse = cache.get(cacheKey);
  
  if (cachedResponse) {
    const { data, timestamp } = cachedResponse;
    
    // Check if cache is still valid
    if (Date.now() - timestamp < CACHE_DURATION) {
      console.log(`[Cache] Serving cached response for ${cacheKey}`);
      res.set('X-Cache', 'HIT');
      return res.json(data);
    } else {
      // Cache expired, remove it
      cache.delete(cacheKey);
    }
  }
  
  // Continue to proxy if no cache hit
  res.set('X-Cache', 'MISS');
  
  // Capture the response to store in cache
  const originalSend = res.send;
  res.send = function(body) {
    try {
      // Only cache successful responses
      if (res.statusCode === 200) {
        const data = JSON.parse(body);
        cache.set(cacheKey, {
          data,
          timestamp: Date.now()
        });
        console.log(`[Cache] Stored response for ${cacheKey}`);
      }
    } catch (error) {
      console.error('Error caching response:', error);
    }
    
    originalSend.call(this, body);
  };
  
  next();
}

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

// Apply rate limiting and caching before proxying
app.use('/api/coingecko', rateLimiter, cacheMiddleware, createProxyMiddleware(coingeckoOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', cache: { size: cache.size } });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
