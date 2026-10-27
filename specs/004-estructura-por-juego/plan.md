# 004 — Plan: Estructura por juego

- `Musa` (en `comun/app.js`) sigue siendo el único global. Los módulos comunes se cuelgan de él:
  `Musa.leer/guardar`, `Musa.panel`, `Musa.reloj`, `Musa.ui`.
- `comun/app.js` lee `juegos/juegos.json` y carga en orden el CSS y el JS de cada juego; cada juego se
  registra con `Musa.registrar` como hoy. El orden del inicio es el de `juegos.json`.
- Al abrir un juego se pone `body[data-juego="<id>"]`: el CSS del juego puede redefinir `--noche`, `--violeta`
  y `--malva` (fondo y paneles) sin tocar componentes. Dixit no define nada: queda igual.
- El reloj pasa a ser una fábrica (`Musa.reloj.crear`) para que cada juego tenga el suyo; la vista
  (arena/borde) y los avisos (campanita, vibración) son funciones compartidas.
- Service worker: archivos fijos + los que lista `juegos.json`. `publicar.js` copia `comun/` en vez de `css/` y `js/`.
