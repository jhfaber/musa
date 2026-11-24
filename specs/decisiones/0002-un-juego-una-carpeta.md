# 0002 — Un juego es una carpeta registrada en `juegos.json`

- **Estado:** Vigente
- **Fecha:** registrada el 23-nov-2026 (viene de la spec [004](../004-estructura-por-juego/spec.md))
- **Decidió:** John
- **Relacionada con:** [004 — Estructura por juego](../004-estructura-por-juego/spec.md), [0004](0004-repo-de-juegos.md)

## Contexto

Dixit y Risk Relámpago compartían código. Con más juegos a la vista, hacía falta separar lo común de lo propio.

## Decisión

Cada juego vive en `juegos/<id>/` con su JS, su CSS y sus datos, y se registra en `juegos/juegos.json`.
Lo compartido vive en `comun/` y **no sabe de ningún juego**. Todos usan el mismo sistema visual y cada juego solo
cambia sus colores con `body[data-juego="<id>"]`.

## Motivo

Agregar un juego no debe obligar a tocar los otros, y `comun/` no debe llenarse de casos especiales.

## Consecuencias

- De `juegos.json` cargan el inicio, el service worker y `publicar.js`: un archivo que no esté ahí no funciona sin Internet.
- Un juego nuevo es una spec nueva con su carpeta, no un parche en otro juego.
- Si algo se repite en dos juegos, se evalúa subirlo a `comun/` con su propia spec.
