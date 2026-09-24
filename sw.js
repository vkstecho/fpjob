/* FPJob service worker
   - App shell + Firebase SDK files cached for instant start and offline open
   - Firestore / Auth / Storage traffic is never touched (Firestore has its own offline cache)
   Bump VERSION whenever index.html changes so users get the update. */
const VERSION = 'fpjob-v3';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-96.png',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (e) => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Never intercept live Firebase / Google API calls
  if (/googleapis\.com|firebaseio\.com|firebasestorage|identitytoolkit|recaptcha|google\.com\/recaptcha|gstatic\.com\/recaptcha/.test(url.href)) return;

  // Page navigations: network first, fall back to cached shell
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Static files + SDK/library scripts: stale-while-revalidate
  const cacheable =
    url.origin === location.origin ||
    url.hostname === 'www.gstatic.com' ||
    url.hostname === 'cdn.sheetjs.com' ||
    url.hostname === 'fonts.googleapis.com' ||
    url.hostname === 'fonts.gstatic.com';

  if (cacheable) {
    e.respondWith(
      caches.match(req).then((cached) => {
        const fetching = fetch(req)
          .then((res) => {
            if (res && (res.status === 200 || res.type === 'opaque')) {
              const copy = res.clone();
              caches.open(VERSION).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetching;
      })
    );
  }
});
