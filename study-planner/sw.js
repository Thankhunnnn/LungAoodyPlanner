/* Service worker: offline app shell (network-first, fallback to cache) */
const CACHE = 'study-planner-v134';
const SHELL = ['./', './index.html', './styles.css', './manifest.json',
  './icon-16.png', './icon-32.png', './icon-180.png', './icon-192.png', './icon-512.png',
  './assets/bg-blue.webp', './assets/bg-stadium.jpg', './assets/bg-oldtrafford.jpg', './assets/bg-aood.jpg', './assets/bg-mono.jpg', './assets/ronaldo-cutout.png', './assets/madrid-crest.png', './assets/kylian-chat.png', './assets/bruno-cutout.png', './assets/manutd-crest.png', './assets/marcus-chat.png', './assets/avatar.png', './assets/avatar-profile.webp', './assets/avatar-profile.png', './assets/og.jpg',
  './assets/coach-hero-real.webp', './assets/coach-action.webp', './assets/coach-moto.webp',
  './assets/sticker-pencil.webp', './assets/sticker-book.webp', './assets/sticker-rocket.webp', './assets/sticker-sakura.webp',
  './assets/ooo-chat.webp',
  './js/store.js', './js/scheduler.js', './js/ai.js', './js/sync.js', './js/drive.js', './js/services.js', './js/features.js', './js/app.js'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // Drive API and Google sign-in must always hit the network (never the app-shell cache).
  if (/(^|\.)googleapis\.com$/.test(url.hostname) || url.hostname === 'accounts.google.com') return;
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request).then(r => {
      if (r) return r;
      if (e.request.destination === 'image') return new Response('', { status: 404, statusText: 'Not cached' });
      return caches.match('./index.html');
    }))
  );
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then(cs => cs.length ? cs[0].focus() : self.clients.openWindow('./')));
});
