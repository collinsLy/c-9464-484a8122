
const CACHE_NAME = 'vertex-trading-v2';

// Skip URLs that are known to cause issues
const shouldSkipCache = (url) => {
  return url.includes('supabase.co') || 
         url.includes('firebase') ||
         url.includes('googleapis.com') ||
         url.includes('api.') ||
         url.startsWith('chrome-extension://');
};

self.addEventListener('install', (event) => {
  // Skip pre-caching to avoid 404 errors
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Skip caching for external URLs and APIs
  if (shouldSkipCache(event.request.url)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).catch(() => {
          // Return a basic fallback for failed requests
          if (event.request.destination === 'document') {
            return caches.match('/');
          }
        });
      })
  );
});

self.addEventListener('activate', (event) => {
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
