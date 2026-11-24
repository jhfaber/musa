# Musa — instrucciones para Claude

Repo de los juegos de John, de mesa y de otro tipo (decisión 0004). Hoy: Dixit y Risk Relámpago.
App para el celular (PWA, funciona sin Internet). No toca la red de la casa ni ningún dispositivo: es solo HTML/CSS/JS estático (decisión 0001).

## Estructura (spec 004)
- `comun/`: lo compartido por todos los juegos (base.css, app.js, guardar.js, panel.js, reloj.js, ui.js). No sabe de ningún juego.
- `juegos/<id>/`: cada juego con su JS, su CSS y sus datos. Se registra en `juegos/juegos.json` (de ahí lo
  cargan el inicio, el service worker y `publicar.js`).
- Mismo sistema visual en todos; cada juego solo cambia sus colores con `body[data-juego="<id>"]` (Risk: fondo neutro con el matiz del equipo en turno).

## Forma de trabajo: SDD (Spec-Driven Development)
Todo el detalle está en `specs/README.md`. Lo que no se puede olvidar:
- Nada se implementa sin una spec aprobada en `specs/`. Juego nuevo, funcionalidad nueva, cambio de reglas, cambio
  visible, cambio de estructura o de lo que se publica: **spec**. Corregir un error sin cambiar lo acordado, un texto
  o la versión del service worker: basta el commit.
- Flujo: `spec.md` (Borrador) → aprobación explícita de John → `plan.md` + `tasks.md` → implementación → verificación → Completada.
- La aprobación se escribe en la cabecera de la spec con fecha y cita corta de lo que John dijo. Sin esa línea, no hay aprobación.
  Claude no marca una spec como aprobada por su cuenta ni deduce la aprobación de un "ok" a otra cosa.
- Se empieza copiando `specs/_plantillas/`. Numeración correlativa que no se reutiliza; si es de un juego, `NNN-<juego>-<tema>`.
- Al cerrar una spec: estado `Completada` en la spec y en el índice de `specs/README.md`, y cómo se verificó al final de `tasks.md`.
  Una spec completada no se reescribe: el cambio posterior es una spec nueva.
- Si durante el trabajo aparece algo que no estaba en la spec, se frena y se pregunta a John: se amplía la spec (con su
  aprobación) o va a una spec nueva. No se agrega en silencio.
- Las decisiones que no son funcionalidades (herramienta, formato, regla de la casa, algo que se decide **no** hacer)
  se registran en `specs/decisiones/` (una por archivo, con su motivo). Una decisión vieja no se borra: se marca
  `Reemplazada por NNNN` y se escribe la nueva.
- `specs/` no se publica (decisión 0003).

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
- Al cambiar reglas o dados: `node herramientas/probar-risk.mjs` (pruebas sin navegador; `npm test` ya las incluye).
- Se guardan aparte: `musa.risk.partida.v2`, `musa.risk.ajustes.v1` (con los mapas) y `musa.risk.ganadores.v1`.
- Archivos nuevos de Risk se agregan a `juegos/juegos.json` (el service worker los guarda de ahí).
- Facciones (spec 007): cada color trae su bando (`COLORES` en `logica/reglas.js`); el escudo SVG o emoji sale de
  `vistas/emblemas.js` y la imagen de fondo de `juegos/risk/img/<bando>.webp` (teñida con el color, nunca lo cambia).
  Los originales de John están en `img/` (fuera de la app); al cambiar uno, volver a convertirlo a .webp de ~800 px.

## Buenas prácticas (decisión 0005)
Todo código nuevo las sigue; el detalle y la lista de comprobación están en `specs/decisiones/0005-buenas-practicas.md`.
- **SOLID** con módulos y funciones (no se fuerzan clases): una responsabilidad por módulo; agregar un juego se hace
  *sumando* (carpeta + línea en `juegos.json`); todo juego cumple el contrato de `Musa.registrar`; lo general recibe
  lo que necesita por parámetro (inyección), no lee juegos concretos.
- **Patrones:** Registry, Strategy, Data-driven (el contenido va en JSON), Module, Reducer / flujo en un sentido,
  Facade (`Musa.leer`/`guardar`), máquina de estados para juegos con fases.
- **Núcleo funcional:** la lógica son funciones puras sin DOM ni `Date.now()`; el reloj y el azar se inyectan.
- **KISS, DRY, YAGNI** y regla de tres: nada de frameworks ni abstracciones "por si acaso".
- **Pruebas escalables:** se descubren solas (cada juego o banco nuevo queda cubierto) y prueban propiedades, no casos sueltos; cada regla atrapa un problema real. Viven en `pruebas/*.test.mjs` y la lógica pura de cada juego se prueba ahí con azar inyectado.
- Antes de cerrar una spec: `npm test` (en VS Code, tarea "Probar Musa") y `node herramientas/validar-juegos.mjs` sin errores, archivos nuevos en el service worker
  con la versión subida, y probado a tamaño celular y sin conexión.
- Lo visual importa: la interfaz de cada juego debe verse cuidada y práctica, como una app de verdad.

## Probar
`npm run iniciar` (o `node herramientas/servidor.js`) → `http://<IP del PC>:8095/#dixit` (solo en la red de la casa). `npm run iniciar` se reinicia solo al cambiar archivos de la app.

## Publicar (para instalar en el celular)
- `node herramientas/publicar.js` sube la app a **https://jhfaber.github.io/musa/** (repo público `jhfaber/musa`, rama `gh-pages`).
- Solo se publican los archivos de la app, en un único commit con el correo privado de GitHub; la rama de
  trabajo, las specs, los PoC y las herramientas **no** se suben. Nada de datos de la casa.
- Publicar es una acción hacia afuera: solo cuando John lo pida. Antes, subir la versión del service worker.

## Commits y guardados

- **Un commit por feature**: cada spec (o cambio pedido) termina en su propio commit, con el número de la spec en el
  mensaje (ej.: `012: juegos de All-afters`). Antes del commit: `npm test` y `npm run validar` sin errores.
- **Al escribir en el SSD desde Claude** (puente remoto): guardar desde una carpeta nueva cada vez y después **releer
  los archivos del disco y compararlos**. El 23-nov-2026 varios guardados repetidos dejaron versiones viejas en el disco
  aunque la herramienta dijo que se escribieron bien (se dañaron los estilos de la portada).
