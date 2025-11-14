
const CACHE_NAME = 'vertex-trading-v3';
const STATIC_CACHE = 'vertex-static-v3';
const DYNAMIC_CACHE = 'vertex-dynamic-v3';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/vertex-logo.png',
  '/vertex-logo.svg',
  '/manifest.json'
];

// Skip URLs that should not be cached
const shouldSkipCache = (url) => {
  return url.includes('supabase.co') || 
         url.includes('firebase') ||
         url.includes('googleapis.com') ||
         url.includes('binance.com') ||
         url.includes('coingecko.com') ||
         url.includes('api.') ||
         url.startsWith('chrome-extension://');
};

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip caching for external URLs and APIs
  if (shouldSkipCache(request.url)) {
    event.respondWith(fetch(request));
    return;
  }

  // Network first for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            headers: { 'Content-Type': 'application/json' }
          });
        })
    );
    return;
  }

  // Cache first for static assets
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(request).then((response) => {
          // Don't cache if not a successful response
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          caches.open(DYNAMIC_CACHE)
            .then((cache) => {
              cache.put(request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Return offline page for navigation requests
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});
