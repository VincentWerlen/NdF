// Hors ligne : tout le nécessaire est mis en cache à l'installation, puis servi depuis le cache.
// Changer VERSION à chaque mise à jour publiée pour que les téléphones récupèrent la nouvelle version.
const VERSION = 'ndf-1.0.1';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'modele-ndf.xltx',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png',
  'vendor/jszip.min.js', 'vendor/anthropic.mjs',
  'vendor/tesseract/tesseract.min.js', 'vendor/tesseract/worker.min.js',
  'vendor/tesseract/tesseract-core-simd-lstm.wasm.js', 'vendor/tesseract/tesseract-core-lstm.wasm.js',
  'vendor/tesseract/lang/fra.traineddata.gz'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // l'API Claude passe directement
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(hit => hit ||
      fetch(e.request).then(r => {
        if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return r;
      }).catch(() => e.request.mode === 'navigate' ? caches.match('index.html') : Response.error())
    )
  );
});
