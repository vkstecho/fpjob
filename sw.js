// FPJob Service Worker v39
// Network-first strategy with offline fallback
var CACHE_NAME = 'fpjob-v39';
var ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-72.png',
  '/icon-96.png',
  '/icon-128.png',
  '/icon-144.png',
  '/icon-152.png',
  '/icon-192.png',
  '/icon-384.png',
  '/icon-512.png'
];

// Install: cache core assets
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err){
        console.warn('SW: Some assets failed to cache:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) {
               console.log('SW: Removing old cache:', n);
               return caches.delete(n);
             })
      );
    }).then(function(){ return self.clients.claim(); })
  );
});

// Fetch: network-first for HTML, cache-first for static assets
self.addEventListener('fetch', function(e) {
  // Don't cache API calls or external resources
  var url = new URL(e.request.url);
  if (url.hostname !== self.location.hostname) return;
  if (url.pathname.indexOf('/api/') === 0) return;
  if (url.pathname.indexOf('firebaseio.com') !== -1) return;
  if (url.pathname.indexOf('firebasedatabase.app') !== -1) return;
  if (url.pathname.indexOf('firebasestorage') !== -1) return;
  
  // HTML: network-first (always get fresh)
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') || '').indexOf('text/html') !== -1) {
    e.respondWith(
      fetch(e.request).then(function(res) {
        // Update cache with fresh copy
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, copy); });
        return res;
      }).catch(function() {
        // Offline: serve cached version
        return caches.match(e.request).then(function(cached) {
          return cached || caches.match('/');
        });
      })
    );
    return;
  }
  
  // Static assets: cache-first
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(res) {
        if (res && res.status === 200 && res.type === 'basic') {
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, copy); });
        }
        return res;
      });
    })
  );
});

// Listen for skip-waiting message
self.addEventListener('message', function(e) {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
