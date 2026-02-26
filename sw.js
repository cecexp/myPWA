// sw.js — Mad Beans PWA

const CACHE_NAME = 'mad-beans-shell-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Three.js from CDN — cached for offline 3D beans
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
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
  // Activate immediately without waiting
  self.skipWaiting();
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
  // Take control of all clients immediately
  self.clients.claim();
});

// 3. FETCH: Intercept requests
//    Shell assets  → serve from cache instantly
//    Dynamic data  → fetch from network, cache for offline fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Found in cache (App Shell) → return instantly
        if (response) {
          return response;
        }
        // Not cached → fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache dynamic responses for offline use
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // Offline and not cached → return index as fallback
            console.warn('Mad Beans SW: offline, serving fallback');
            return caches.match('/index.html');
          });
      })
  );
});