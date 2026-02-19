// sw.js
const CACHE_NAME = 'app-shell-v1';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// 1. INSTALACIÓN: Guardamos el Shell en la caché
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Abriendo caché y guardando App Shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 2. ACTIVACIÓN: Limpiamos cachés viejas si la versión cambia
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== CACHE_NAME) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. FETCH: Interceptamos peticiones
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si está en caché (es parte del Shell), lo devolvemos
                if (response) {
                    return response;
                }
                // Si no, vamos a internet (contenido dinámico)
                return fetch(event.request);
            })
    );
});