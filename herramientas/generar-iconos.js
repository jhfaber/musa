// Genera los íconos PNG de Musa (luna creciente y estrellas, arte propio) sin dependencias.
// Uso: node musa/herramientas/generar-iconos.js
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CARPETA = path.join(__dirname, '..', 'iconos');
const MUESTRAS = 4; // suavizado de bordes

const mezclar = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const NOCHE = [27, 20, 70], VIOLETA = [58, 42, 110], MALVA = [122, 90, 158];
const ORO = [242, 196, 107], ORO_CLARO = [255, 246, 213];

// Color de un punto (x, y en 0..1). `escala` encoge el dibujo para la zona segura del ícono "maskable".
function color(x, y, escala) {
  const fondo = y < 0.55 ? mezclar(NOCHE, VIOLETA, y / 0.55) : mezclar(VIOLETA, MALVA, (y - 0.55) / 0.45);
  const u = (x - 0.5) / escala + 0.5, v = (y - 0.5) / escala + 0.5;

  const enLuna = Math.hypot(u - 0.45, v - 0.53) < 0.3 && Math.hypot(u - 0.6, v - 0.42) > 0.25;
  if (enLuna) return mezclar(ORO_CLARO, ORO, Math.min(1, Math.hypot(u - 0.3, v - 0.4) / 0.4));

  const dx = Math.abs(u - 0.76), dy = Math.abs(v - 0.27), r = 0.1;
  if (Math.sqrt(dx / r) + Math.sqrt(dy / r) <= 1) return ORO_CLARO;

  for (const [cx, cy, cr] of [[0.84, 0.6, 0.022], [0.22, 0.2, 0.015], [0.68, 0.84, 0.014]]) {
    if (Math.hypot(u - cx, v - cy) < cr) return ORO_CLARO;
  }

  // Halo suave alrededor de la luna
  const halo = Math.max(0, 1 - Math.hypot(u - 0.45, v - 0.53) / 0.5) * 0.18;
  return mezclar(fondo, ORO, halo);
}

function crc32(buffer) {
  let c, crc = 0xffffffff;
  for (const byte of buffer) {
    c = (crc ^ byte) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function bloque(tipo, datos) {
  const largo = Buffer.alloc(4);
  largo.writeUInt32BE(datos.length);
  const cuerpo = Buffer.concat([Buffer.from(tipo), datos]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(cuerpo));
  return Buffer.concat([largo, cuerpo, crc]);
}

function png(tamano, escala) {
  const filas = Buffer.alloc(tamano * (tamano * 3 + 1));
  for (let y = 0; y < tamano; y++) {
    const inicio = y * (tamano * 3 + 1);
    for (let x = 0; x < tamano; x++) {
      let suma = [0, 0, 0];
      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const c = color((x + (sx + 0.5) / MUESTRAS) / tamano, (y + (sy + 0.5) / MUESTRAS) / tamano, escala);
          suma = suma.map((s, i) => s + c[i]);
        }
      }
      suma.forEach((s, i) => { filas[inicio + 1 + x * 3 + i] = Math.round(s / (MUESTRAS * MUESTRAS)); });
    }
  }
  const cabecera = Buffer.alloc(13);
  cabecera.writeUInt32BE(tamano, 0);
  cabecera.writeUInt32BE(tamano, 4);
  cabecera[8] = 8; // bits por canal
  cabecera[9] = 2; // RGB
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    bloque('IHDR', cabecera),
    bloque('IDAT', zlib.deflateSync(filas)),
    bloque('IEND', Buffer.alloc(0))
  ]);
}

fs.mkdirSync(CARPETA, { recursive: true });
for (const [nombre, tamano, escala] of [
  ['icono-180.png', 180, 1],
  ['icono-192.png', 192, 1],
  ['icono-512.png', 512, 1],
  ['icono-mascara-512.png', 512, 0.78]
]) {
  fs.writeFileSync(path.join(CARPETA, nombre), png(tamano, escala));
  console.log('Creado', nombre);
}
