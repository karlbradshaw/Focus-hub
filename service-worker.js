// Simple offline cache for Focus Hub
const CACHE_NAME = 'focus-hub-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './service-worker.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k === CACHE_NAME ? null : caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const { request } = event;
  // Network-first for same-origin HTML, cache-first for others
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, copy));
        return r;
      }).catch(() => caches.match('./index.html'))
    );
  } else {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(r => {
        const copy = r.clone();
        caches.open(CACHE_NAME).then(c => c.put(request, copy));
        return r;
      }))
    );
  }
});
