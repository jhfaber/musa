# 004 — Estructura por juego y sistema visual compartido

- **Estado:** Aprobada por John (27-oct-2026, en el chat: "apruebo todos los specs") — en curso
- **Depende de:** [001 — Ayudante de Dixit](../001-dixit/spec.md), [003 — Reloj y ajustes](../003-reloj-ajustes/spec.md)
- **Necesaria para:** [005 — Ayudante de Risk](../005-risk/spec.md)

## Objetivo

Que agregar un juego sea agregar **una carpeta**, y que todos los juegos se vean como parte de la misma
app (misma barra, cartas, botones, paneles y reloj), cambiando solo el color de acento de cada juego.

## Cómo está hoy (revisión)

- `index.html` + `js/app.js` (inicio, navegación, instalar) ya son comunes: bien.
- `juegos/dixit/dixit.js` (715 líneas) mezcla lo de Dixit con piezas que Risk también necesita:
  - el **panel lateral** (☰ y ⚙),
  - el **reloj** (hora de término, campanita, vibración),
  - el **guardado** en el celular.
- `css/estilo.css` (498 líneas) mezcla la base (colores, barra, botones, cartas) con lo propio de Dixit.
- `service-worker.js` y `herramientas/publicar.js` listan los archivos a mano: cada juego nuevo obliga
  a tocarlos.

## Cómo queda

```
index.html                   cascarón: inicio + pantalla de juego (sin cambios visibles)
manifest.json, service-worker.js, iconos/
comun/
  base.css                   colores, fondo, barra, botones, cartas, chips, panel, reloj
  app.js                     inicio, navegación (#dixit, #risk), instalar
  panel.js                   panel lateral reutilizable (☰ catálogo, ⚙ ajustes, ayudas)
  reloj.js                   reloj por hora de término + campanita + vibración (lo de 003)
  guardar.js                 leer/escribir en el celular con nombre por juego (musa.<juego>.…)
juegos/
  juegos.json                lista de juegos y sus archivos (la usan el inicio, el service worker y publicar)
  dixit/  dixit.js  dixit.css  categorias.json
  risk/   risk.js   risk.css   (005)
```

- **Un tema por juego**: cada juego define su acento con variables CSS
  (`[data-juego="risk"] { --acento: …; }`). La pantalla, la tipografía, las cartas y los botones son los
  mismos; Dixit queda exactamente igual que hoy (oro sobre violeta).
- El **reloj** y el **panel** pasan a `comun/` sin cambiar cómo se ven ni cómo funcionan en Dixit.
- Las claves guardadas de Dixit (`musa.dixit.v2`, `.favoritos.v1`, `.ajustes.v1`) **no cambian**: nadie
  pierde su partida, favoritos ni ajustes.
- El service worker y `publicar.js` leen `juegos/juegos.json`: agregar un juego no exige tocarlos (salvo
  subir la versión).

## Fuera de alcance

- Cambiar nada de lo que se ve o se juega en Dixit (Tranquilo sigue congelado).
- Herramientas de construcción (bundler, npm): sigue siendo HTML/CSS/JS estático.

## Requisitos

- **R1.** Dixit se ve y funciona igual que antes del cambio (mismos 7 criterios de 003 y 6 de 002).
- **R2.** Funciona sin Internet; se sube la versión del service worker.
- **R3.** Ningún archivo de `comun/` sabe de un juego en particular.

## Verificación (27-oct-2026)

Dixit igual (reloj, pausa, ⚙ minutos y segundos, ☰ catálogo, colores violeta); el inicio lista Dixit y Risk
desde `juegos.json`; Risk cambia a rojo brasa sin tocar `comun/base.css`; los 19 archivos que guarda el
service worker existen. (El panel de pruebas no deja registrar service workers en localhost: falta ver el
modo sin Internet tras publicar.)

## Criterios de aceptación

1. Dixit: misma carta, niveles, favoritos, ⚙ y ☰; la partida y los favoritos guardados siguen ahí.
2. El inicio lista los juegos desde `juegos/juegos.json`.
3. Un juego de prueba con otro `--acento` cambia de color sin tocar `comun/base.css`.
4. Sin Internet, tras abrirla una vez, abren Dixit y Risk.
