// sw.js — Mad Beans PWA

const CACHE_NAME = 'mad-beans-shell-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// 1. INSTALL: Cache the App Shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Mad Beans SW: caching App Shell');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
});

// 2. ACTIVATE: Clean up old caches if version changes
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(keyList.map(key => {
        if (key !== CACHE_NAME) {
          console.log('Mad Beans SW: deleting old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
});

// 3. FETCH: Intercept requests
//    Shell assets → serve from cache
//    Dynamic content (leaderboard, API) → fetch from network, cache for offline
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Found in cache (App Shell) → return it instantly
        if (response) {
          return response;
        }
        // Not in cache (dynamic content) → fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache dynamic responses for offline use
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Network failed and not cached → offline fallback
            console.warn('Mad Beans SW: offline, resource not available');
          });
      })
  );
});