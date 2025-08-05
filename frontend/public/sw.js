
// Service Worker for Performance Optimization
const CACHE_NAME = 'kustodia-v2';
const STATIC_CACHE = 'kustodia-static-v2';
const DYNAMIC_CACHE = 'kustodia-dynamic-v2';
const IMAGE_CACHE = 'kustodia-images-v2';

const urlsToCache = [
  '/',
  '/kustodia-logo.png',
  '/favicon.ico',
  '/site.webmanifest'
];

const CACHE_STRATEGIES = {
  images: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/svg+xml'],
  static: ['.js', '.css', '.woff2', '.woff'],
  api: ['/api/']
};

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE && cacheName !== IMAGE_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  const { request } = event;
  const url = new URL(request.url);
  
  // Handle images with cache-first strategy
  if (CACHE_STRATEGIES.images.some(type => request.headers.get('accept')?.includes(type))) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache => {
        return cache.match(request).then(response => {
          if (response) {
            return response;
          }
          return fetch(request).then(fetchResponse => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // Handle static assets with cache-first strategy
  if (CACHE_STRATEGIES.static.some(ext => url.pathname.includes(ext))) {
    event.respondWith(
      caches.match(request).then(response => {
        return response || fetch(request).then(fetchResponse => {
          return caches.open(STATIC_CACHE).then(cache => {
            cache.put(request, fetchResponse.clone());
            return fetchResponse;
          });
        });
      })
    );
    return;
  }
  
  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).then(response => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then(cache => {
            cache.put(request, responseClone);
          });
        }
        return response;
      }).catch(() => {
        return caches.match(request);
      })
    );
    return;
  }
  
  // Default: network-first for other requests
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});
