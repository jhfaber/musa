# Musa — instrucciones para Claude

App para el celular (PWA, funciona sin Internet) que acompaña juegos de mesa: Dixit y Risk Relámpago.
No toca la red de la casa ni ningún dispositivo: es solo HTML/CSS/JS estático.

## Estructura (spec 004)
- `comun/`: lo compartido por todos los juegos (base.css, app.js, guardar.js, panel.js, reloj.js, ui.js). No sabe de ningún juego.
- `juegos/<id>/`: cada juego con su JS, su CSS y sus datos. Se registra en `juegos/juegos.json` (de ahí lo
  cargan el inicio, el service worker y `publicar.js`).
- Mismo sistema visual en todos; cada juego solo cambia sus colores con `body[data-juego="<id>"]` (Risk: fondo neutro con el matiz del equipo en turno).

## Forma de trabajo: SDD (Spec-Driven Development)
- Nada se implementa sin una spec aprobada en `specs/` (ver `specs/README.md`).
- Flujo: `spec.md` → aprobación de John → `plan.md` + `tasks.md` → implementación → verificación.

## Reglas del juego Dixit (acordadas con John)
- **El nivel Tranquilo está congelado**: no se cambian sus categorías ni se agregan sin que John lo pida.
- Las categorías y lentes viven en `juegos/dixit/categorias.json`; el campo `_ayuda` explica cada marca.
- Los lentes son pistas en paralelo, no en cadena. Cada categoría lista sus `lentes_permitidos`.
- Lo configurable (reloj: duración, cómo se ve, campanita, vibración) va en el menú ⚙ Ajustes, no en la pantalla principal.
- En el celular se guardan aparte: la partida (`musa.dixit.v2`), los favoritos (`musa.dixit.favoritos.v1`) y los ajustes (`musa.dixit.ajustes.v1`).
- Al cambiar archivos que se guardan para uso offline, subir la versión en `service-worker.js`.

## Risk (specs 005 y 006)
- Reglamento de la casa *Risk Relámpago*; mapa normal y mapas propios en ⚙ (el LOTR puede ser otro mapa).
- Flujo en una sola dirección: vistas → acción → `almacen.despachar` → `logica/reglas.js` (puro) → guardar → pintar.
  Las reglas no tocan el DOM ni `Date.now()`; las vistas no cambian la partida. Los relojes son datos de la partida.
- Lo que se configura en ⚙ nunca se escribe fijo en textos ni ejemplos: se lee de los ajustes (pedido de John).
- Al cambiar reglas o dados: `node herramientas/probar-risk.mjs` (pruebas sin navegador).
- Se guardan aparte: `musa.risk.partida.v2`, `musa.risk.ajustes.v1` (con los mapas) y `musa.risk.ganadores.v1`.
- Archivos nuevos de Risk se agregan a `juegos/juegos.json` (el service worker los guarda de ahí).

## Probar
`node herramientas/servidor.js` → `http://<IP del PC>:8095/#dixit` (solo en la red de la casa).

## Publicar (para instalar en el celular)
- `node herramientas/publicar.js` sube la app a **https://jhfaber.github.io/musa/** (repo público `jhfaber/musa`, rama `gh-pages`).
- Solo se publican los archivos de la app, en un único commit con el correo privado de GitHub; la rama de
  trabajo, las specs, los PoC y las herramientas **no** se suben. Nada de datos de la casa.
- Publicar es una acción hacia afuera: solo cuando John lo pida. Antes, subir la versión del service worker.
