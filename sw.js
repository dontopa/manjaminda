// Bump VERSION to force clients to refresh the cached app shell.
const VERSION = 'mm-v2';
const SHELL = ['/', '/manifest.webmanifest', '/icon-192.png', '/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(SHELL);
    // voice clips: cache all for offline play; a failure here must not block install
    try {
      const idx = await (await fetch('/audio/index.json')).json();
      await c.put('/audio/index.json', new Response(JSON.stringify(idx)));
      await c.addAll(Object.values(idx).map(f => '/audio/' + f));
    } catch {}
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Pages: network-first (fresh when online). Everything else: stale-while-revalidate. Both work offline.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const page = e.request.mode === 'navigate';
  e.respondWith(caches.open(VERSION).then(async c => {
    const hit = page ? null : await c.match(e.request, { ignoreSearch: true });
    const net = fetch(e.request).then(r => {
      if (r.ok || r.type === 'opaque') c.put(e.request, r.clone());
      return r;
    }).catch(() => hit || c.match(page ? '/' : e.request, { ignoreSearch: true }));
    return hit || net;
  }));
});
