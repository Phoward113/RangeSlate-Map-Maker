// RangeSlate offline helper: keeps the app on the phone so the "Send to X4" page
// still opens while the phone is joined to the X4's Wi-Fi (no internet there).
const CACHE = 'rangeslate-v7';
const SHELL = ['./', './index.html', './manifest.webmanifest', './apple-touch-icon.png', './icon-192.png', './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdn.jsdelivr.net/npm/leaflet-rotate@0.6.2/dist/leaflet-rotate.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request; if(req.method !== 'GET') return;
  const url = new URL(req.url);
  const mine = url.origin === location.origin, lib = SHELL.includes(req.url);
  if(!mine && !lib) return;                                   // map tiles, search, map data: always live
  // newest version when online, saved copy when offline
  e.respondWith(fetch(req).then(res => { if(res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
    .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
});
