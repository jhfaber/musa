# 008 — Plan

## Datos
- `juegos/juegos.json`: cada juego de reglas es una entrada con `id`, `tipo: "reglas"`, `nombre`, `simbolo`,
  `descripcion` y `archivos: ["reglas.json"]`. Dixit y Risk no cambian. El orden de la lista es el de este archivo:
  primero las herramientas (Dixit, Risk) y luego los de reglas por orden alfabético.
- `juegos/<id>/reglas.json` (uno por juego de reglas):
  `jugadores`, `duracion`, `necesitas` (opcional), `nota` (opcional, aviso visible cuando algo no está confirmado),
  `empezar` y `reglamento`, ambos como lista de secciones `{ "t": título, "p": [viñetas] }`.
  Dentro de un texto, `**así**` se ve en negrita.
- No se guarda nada nuevo en el celular: las reglas se leen del archivo, y el service worker las guarda para uso sin Internet.

## Archivos
- `comun/reglas.js` (nuevo): el visor. Pide `reglas.json` al abrir el juego y pinta la ficha con las pestañas
  *Para empezar* y *Reglamento* (secciones plegables y botón "Abrir todo / Cerrar todo").
- `comun/azar.js` (nuevo): el dado 🎲 de la portada, en un panel con "Jugar este" y "Tirar otra vez".
- `comun/reglas.css` (nuevo): estilos de la ficha y del dado, con los mismos colores del resto de Musa.
- `comun/app.js`: registra los juegos de tipo `reglas` directamente desde `juegos.json` (sin cargar JS propio),
  y pinta el botón del dado encima de la lista.
- `index.html`: enlaza `reglas.css`, `reglas.js` y `azar.js`; texto del pie sin nombrar solo Dixit y Risk.
- `service-worker.js`: agrega los tres archivos nuevos y sube la versión.
- `juegos/<id>/reglas.json` para: Charada, Codenames Pictures, El que piensa pierde, Ghost Blitz, Mente Vacuna,
  Monopoly, Monopoly Dados y Tragos, Monopoly Superbanco Electrónico, Pictionary para adultos, Póker, Secret Hitler,
  Uno No Mercy, Uno Normal, Uno Super Mario y Zombie Kittens.

## Decisiones
- Los juegos de reglas no llevan JS propio: son datos (decisión 0002 sigue valiendo: una carpeta por juego,
  registrada en `juegos.json`).
- Las reglas se escriben con palabras propias y sin copiar manuales.

## Riesgos y cómo se cubren
- **Reglas mal escritas.** Se escriben de lo conocido y, donde no se pudo confirmar, la ficha lo dice con un aviso
  visible y la pantalla pide al jugador mirar la caja. John revisa cada juego.
- **Carrera al abrir:** si se cambia de juego mientras cargan las reglas, no se pinta la ficha vieja.
- **Sin Internet:** `reglas.json` va en `archivos` de cada juego para que el service worker lo guarde.
- **Dixit y Risk intactos:** solo cambia cómo se leen las entradas nuevas; se prueba que sigan abriendo.

## Verificación
- Revisar que cada `reglas.json` sea JSON válido y tenga `empezar` y `reglamento`.
- Abrir la app en un navegador a tamaño celular: portada con los 17 juegos, dado, ficha de cada juego con sus
  dos pestañas, secciones plegables, Dixit y Risk abren, y nada falla en la consola.
- Probar sin conexión (service worker) después de la primera carga.
