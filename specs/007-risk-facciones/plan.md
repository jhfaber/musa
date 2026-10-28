# 007 — Plan

## Datos
- `logica/reglas.js`: cada color de `COLORES` gana `bando` (id), `faccion` (nombre), `emoji`, `lema` e `imagen`.
  `AJUSTES_BASE` gana `emblema: 'escudo'` (o `'emoji'`) y `fondo: 'media'` (`'no'`, `'suave'`, `'media'`, `'fuerte'`).
- `almacen.js`: si un ajuste guardado trae un valor desconocido de `emblema` o `fondo`, vuelve al de `AJUSTES_BASE`.
- Partidas guardadas: el `id` del equipo es su color, así que el bando se deduce sin migrar. El registro de
  ganadores solo guarda `{ nombre, color }`: el bando se busca por color.

## Vistas
- `vistas/emblemas.js` (nuevo): los 10 dibujos SVG del PoC, `faccionDe(equipo)` y `emblema(equipo, tamaño)`.
  El estilo (escudo/emoji) lo fija `risk.js` en cada pintado con `usarEstilo(aj.emblema)`.
- `emblema()` reemplaza a `punto()` en: carta del turno, cuenta, cola, panel del equipo, preparar, fin,
  ganadores y aviso de ausente.
- Preparar: la cuadrícula de colores muestra el escudo y el bando; nombres "Por bando" (por defecto),
  "Por colores" o "Por números".
- Carta del turno: lema del bando y la imagen del bando dentro de la carta.

## Fondo
- `risk.js` pone en `body` la variable `--risk-imagen` (URL absoluta del .webp del equipo en turno) y la clase
  `risk-fondo--<intensidad>`; al salir de Risk se quitan.
- `risk.css`: la imagen va en `.cielo` (capa fija de fondo) y en `.risk-turno::before`, con
  `background-blend-mode: luminosity` sobre el color del equipo: la foto solo pone luces y sombras.

## Imágenes
- `img/*.jfif` (originales de John, fuera de la app) → `juegos/risk/img/<bando>.webp`, 800 px de ancho,
  calidad ~0,72, convertidas en el navegador (canvas) con un script temporal.
- Se agregan a `juegos/juegos.json` para que el service worker las guarde (sin Internet).

## Ajustes ⚙
- Nuevo apartado "🎨 Aspecto": chips Escudo dibujado / Emoji y chips de imagen de fondo No / Suave / Media / Fuerte.
