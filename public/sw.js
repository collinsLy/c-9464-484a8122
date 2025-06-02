
const CACHE_NAME = 'vertex-trading-v1.0.6';

// Minimal caching strategy
const urlsToCache = [
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  // Never auto-skip waiting to prevent refresh loops
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', (event) => {
  // Never auto-claim to prevent refresh loops
  // Clean up old caches
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Never cache in development
  if (event.request.url.includes('localhost') || 
      event.request.url.includes('replit.dev') ||
      event.request.url.includes('vite') ||
      event.request.url.includes('/@vite/') ||
      event.request.url.includes('hot-update')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Minimal caching for production
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// Handle cache clearing messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    });
  }
});
