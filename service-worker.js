// Guarda toda la app en el celular para que funcione sin Internet.
// Si cambia la lista de archivos, sube la versión.
const VERSION = 'musa-v26';
const ARCHIVOS = [
  './',
  'index.html',
  'manifest.json',
  'css/estilo.css',
  'js/app.js',
  'juegos/dixit/dixit.js',
  'juegos/dixit/categorias.json',
  'iconos/icono-180.png',
  'iconos/icono-192.png',
  'iconos/icono-512.png',
  'iconos/icono-mascara-512.png'
];

self.addEventListener('install', evento => {
  evento.waitUntil(caches.open(VERSION).then(cache => cache.addAll(ARCHIVOS)));
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
