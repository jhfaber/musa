# Musa — instrucciones para Claude

App para el celular (PWA, funciona sin Internet) que acompaña juegos de mesa con ideas por ronda.
Primer juego: Dixit. No toca la red de la casa ni ningún dispositivo: es solo HTML/CSS/JS estático.

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

## Probar
`node herramientas/servidor.js` → `http://<IP del PC>:8095/#dixit` (solo en la red de la casa).
