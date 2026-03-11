// FPJob Service Worker v5 — Force fresh
const CACHE = 'fpjob-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', e => {
  self.skipWaiting(); // Force activate immediately
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS).catch(()=>{}))
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    // Delete ALL old caches
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
  // Tell all open pages to reload
  self.clients.matchAll({type:'window'}).then(clients =>
    clients.forEach(c => c.navigate(c.url))
  );
});

self.addEventListener('fetch', e => {
  const url = e.request.url;
  // Always fetch fresh from network — never serve stale
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebase') ||
    url.includes('googleapis.com') ||
    e.request.method !== 'GET'
  ) return;

  // Network first — ALWAYS get latest version
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if(r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      })
      .catch(() => caches.match(e.request).then(c => c || caches.match('/index.html')))
  );
});
