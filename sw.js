// Hors ligne : tout le nécessaire est mis en cache à l'installation.
// - la page (index.html, sw, manifeste, modèle Excel) : réseau d'abord, cache si pas de réseau,
//   pour qu'une mise à jour publiée arrive dès la prochaine ouverture en ligne ;
// - les bibliothèques (vendor/, icônes) : cache d'abord, elles ne changent qu'avec VERSION.
// Changer VERSION à chaque mise à jour des bibliothèques pour les renouveler sur les téléphones.
const VERSION = 'ndf-1.0.3';
const FILES = [
  './', 'index.html', 'manifest.webmanifest', 'modele-ndf.xltx',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-512-maskable.png',
  'vendor/jszip.min.js', 'vendor/anthropic.mjs',
  'vendor/tesseract/tesseract.min.js', 'vendor/tesseract/worker.min.js',
  'vendor/tesseract/tesseract-core-simd-lstm.wasm.js', 'vendor/tesseract/tesseract-core-lstm.wasm.js',
  'vendor/tesseract/lang/fra.traineddata.gz'
];
self.addEventListener('install', e => {
  // cache: 'no-cache' : revalide auprès du serveur au lieu de reprendre une copie du cache HTTP
  e.waitUntil(caches.open(VERSION)
    .then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'no-cache' }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// réseau faible : au-delà de 4 s on sert la copie locale (si elle existe) au lieu de faire attendre
const fromCache = req => caches.match(req, { ignoreSearch: true })
  .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined));
const networkFirst = req => {
  const net = fetch(req, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  });
  const slow = new Promise(res => setTimeout(res, 4000)).then(() => fromCache(req)).then(hit => hit || net);
  return Promise.race([net.catch(() => fromCache(req).then(hit => hit || Response.error())), slow]);
};
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return; // l'API Claude passe directement
  const p = url.pathname;
  const isLib = /\/(vendor|icons)\//.test(p);
  if (!isLib) { e.respondWith(networkFirst(e.request)); return; }
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(hit => hit || networkFirst(e.request)));
});
