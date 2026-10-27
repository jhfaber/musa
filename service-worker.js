// Guarda toda la app en el celular para que funcione sin Internet.
// Los archivos de cada juego salen de juegos/juegos.json. Al cambiar cualquier archivo, sube la versión.
const VERSION = 'musa-v68';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.json',
  'comun/base.css',
  'comun/app.js',
  'comun/guardar.js',
  'comun/panel.js',
  'comun/reloj.js',
  'comun/ui.js',
  'juegos/juegos.json',
  'iconos/icono-180.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-mascara-512.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil((async () => {
    const cache = await caches.open(VERSION);
    const { juegos } = await (await fetch('juegos/juegos.json', { cache: 'no-store' })).json();
    const deJuegos = juegos.flatMap(j => j.archivos.map(a => `juegos/${j.id}/${a}`));
    await cache.addAll([...ARCHIVOS, ...deJuegos]);
  })());
  self.skipWaiting();
});

self.addEventListener('activate', evento => {
  evento.waitUntil(
    caches.keys().then(claves => Promise.all(claves.filter(c => c !== VERSION).map(c => caches.delete(c))))
  );
  self.clients.claim();
});

// Primero la red (para recibir cambios) y, si no hay conexión o tarda más de 3 s, lo guardado.
self.addEventListener('fetch', evento => {
  if (evento.request.method !== 'GET') return;
  evento.respondWith((async () => {
    const cache = await caches.open(VERSION);
    try {
      const respuesta = await Promise.race([
        fetch(evento.request),
        new Promise((_, rechazar) => setTimeout(rechazar, 3000))
      ]);
      if (respuesta.ok) cache.put(evento.request, respuesta.clone());
      return respuesta;
    } catch (e) {
      return (await cache.match(evento.request, { ignoreSearch: true })) || Response.error();
    }
  })());
});
