/* Mirai Progression Tracker - Service Worker (v3)
   HTML pages: network-first (patched pages are never served stale).
   Static assets: cache-first. Cross-origin (Supabase, CDNs, fonts) is never intercepted. */
const CACHE_NAME = 'mirai-tracker-v3';
const ASSETS = ['index.html','dashboard.html','manager.html','subjects.html','exams.html','faculty.html','students.html','calendar.html','saved-sessions.html','campus.js','supabase.js','students.js','starfield.js','mobile.css','manifest.json','icon.svg'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin) return;
  const isHTML = e.request.mode === 'navigate' || url.pathname.endsWith('.html');
  if (isHTML) {
    e.respondWith(fetch(e.request).then((r) => { const cl = r.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, cl)); return r; }).catch(() => caches.match(e.request).then((m) => m || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then((cached) => cached || fetch(e.request).then((r) => { if (r.ok) { const cl = r.clone(); caches.open(CACHE_NAME).then((c) => c.put(e.request, cl)); } return r; })));
});
