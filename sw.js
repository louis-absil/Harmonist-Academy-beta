const CACHE_NAME = 'harmonist-v5.4';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './styles.css',
  './main.js',
  './app.js',
  './ui.js',
  './audio.js',
  './data.js',
  './challenges.js',
  './firebase.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// 1. Installation : On met tout en cache
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache globale');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Interception des requêtes (Mode "Cache First")
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      // Si c'est dans le cache, on le rend direct (Ultra rapide)
      // Sinon, on va le chercher sur internet
      return response || fetch(e.request);
    })
  );
});

// 3. Activation (Nettoyage des vieux caches si tu changes de version)
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          return caches.delete(key);
        }
      }));
    })
  );
});