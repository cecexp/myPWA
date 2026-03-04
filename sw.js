// ══════════════════════════════════════════════
//  MAD BEANS — SERVICE WORKER
//  Estrategias de caché implementadas:
//  1. Cache First  → assets estáticos (CSS, JS, imágenes)
//  2. Network First → HTML principal (siempre fresco si hay red)
//  3. Stale-While-Revalidate → recursos secundarios
// ══════════════════════════════════════════════

const CACHE_NAME     = 'mad-beans-v1';
const STATIC_CACHE   = 'mad-beans-static-v1';
const DYNAMIC_CACHE  = 'mad-beans-dynamic-v1';

// Archivos que se cachean en la instalación (App Shell)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.js',
  '/manifest.json',
  '/splash.html',
  '/ssr-demo.html',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  // Three.js desde CDN — se guarda en cache dinámico al primer uso
];

// CDN externo que también cacheamos
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
  'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap',
];

// ── INSTALL: precache del App Shell ───────────
self.addEventListener('install', event => {
  console.log('[SW] Installing Mad Beans SW...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Pre-caching static assets');
        // Cacheamos los assets locales; ignoramos fallos de CDN en install
        return cache.addAll(STATIC_ASSETS).catch(err => {
          console.warn('[SW] Some static assets failed to cache:', err);
        });
      })
      .then(() => self.skipWaiting()) // Activa de inmediato sin esperar tabs
  );
});

// ── ACTIVATE: limpia caches viejos ────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating Mad Beans SW...');
  const validCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => !validCaches.includes(key))
          .map(key => {
            console.log('[SW] Deleting old cache:', key);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim()) // Toma control de todos los tabs abiertos
  );
});

// ── FETCH: aplicar estrategia según tipo ──────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests que no son GET
  if (request.method !== 'GET') return;

  // Ignorar extensiones de Chrome y herramientas de dev
  if (url.protocol === 'chrome-extension:') return;

  // ── Estrategia 1: NETWORK FIRST → HTML ──────
  // El HTML siempre se intenta obtener fresco de la red.
  // Si falla (offline), se sirve desde caché.
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // ── Estrategia 2: CACHE FIRST → JS/CSS/fonts ──
  // Assets estáticos: primero caché, si no está se va a red y se guarda.
  if (
    url.pathname.match(/\.(js|css|woff2?|ttf)$/) ||
    url.hostname === 'cdnjs.cloudflare.com' ||
    url.hostname === 'fonts.gstatic.com' ||
    url.hostname === 'fonts.googleapis.com'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Estrategia 3: CACHE FIRST → imágenes/iconos ──
  if (url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // ── Estrategia 4: STALE-WHILE-REVALIDATE → resto ──
  // Sirve desde caché inmediatamente, actualiza en background.
  event.respondWith(staleWhileRevalidate(request));
});

// ════════════════════════════════════════════
//  ESTRATEGIAS DE CACHÉ
// ════════════════════════════════════════════

// NETWORK FIRST: intenta red → si falla, caché → si no hay, offline.html
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback a offline page
    return caches.match('/offline.html');
  }
}

// CACHE FIRST: caché → si no existe, red → guarda en caché
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (err) {
    // Para imágenes, devolver placeholder SVG
    if (request.url.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return new Response(
        `<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192">
          <rect width="192" height="192" fill="#0a0c1a"/>
          <text x="50%" y="50%" text-anchor="middle" fill="#00e5ff" font-size="14">OFFLINE</text>
        </svg>`,
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    throw err;
  }
}

// STALE-WHILE-REVALIDATE: sirve caché, actualiza en bg
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cached || await fetchPromise || caches.match('/offline.html');
}

// ── PUSH NOTIFICATIONS (futuro) ───────────────
self.addEventListener('push', event => {
  const data = event.data?.json() ?? { title: 'Mad Beans', body: '¡Nueva sesión disponible!' };
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      tag: 'mad-beans-notif',
    })
  );
});

// ── BACKGROUND SYNC (futuro) ──────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'sync-sessions') {
    console.log('[SW] Background sync: syncing sessions...');
    // Aquí iría la lógica de sincronización con servidor
  }
});

console.log('[SW] Mad Beans Service Worker loaded ✔');