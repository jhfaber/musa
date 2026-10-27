// Servidor estático solo para probar Musa en la red de la casa (no se usa en producción).
// Uso: node musa/herramientas/servidor.js   → http://<IP del PC>:8095
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const RAIZ = path.join(__dirname, '..');
const PUERTO = Number(process.env.PORT) || 8095;
const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

http.createServer((pedido, respuesta) => {
  const ruta = decodeURIComponent(new URL(pedido.url, 'http://x').pathname);
  let archivo = path.normalize(path.join(RAIZ, ruta));
  if (!archivo.startsWith(RAIZ) || archivo.includes(`${path.sep}herramientas${path.sep}`)) {
    respuesta.writeHead(403).end();
    return;
  }
  if (ruta.endsWith('/')) archivo = path.join(archivo, 'index.html');
  fs.readFile(archivo, (error, datos) => {
    if (error) {
      respuesta.writeHead(404).end('No encontrado');
      return;
    }
    respuesta.writeHead(200, { 'Content-Type': TIPOS[path.extname(archivo)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    respuesta.end(datos);
  });
}).listen(PUERTO, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat()
    .filter(i => i.family === 'IPv4' && !i.internal).map(i => i.address);
  console.log(`Musa en http://localhost:${PUERTO}`);
  ips.forEach(ip => console.log(`  celular (mismo wifi): http://${ip}:${PUERTO}`));
});
