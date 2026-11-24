# 0003 — Publicar solo cuando John lo pida

- **Estado:** Vigente
- **Fecha:** registrada el 23-nov-2026 (recogida de `CLAUDE.md`)
- **Decidió:** John
- **Relacionada con:** [0001](0001-pwa-estatica-sin-red.md)

## Contexto

`node herramientas/publicar.js` sube la app a https://jhfaber.github.io/musa/ (repo público `jhfaber/musa`, rama
`gh-pages`). Publicar es una acción hacia afuera y no se puede deshacer del todo.

## Decisión

Solo se publica cuando John lo pide. Antes de publicar se sube la versión del service worker. Se publican
únicamente los archivos de la app, en un único commit con el correo privado de GitHub. La rama de trabajo, las
specs, las decisiones, los PoC y las herramientas **no** se suben, y tampoco ningún dato de la casa.

## Motivo

El repo de publicación es público: lo que se sube lo puede ver cualquiera.

## Consecuencias

- Terminar una spec no implica publicarla.
- Material nuevo con derechos de terceros (imágenes, nombres, reglamentos) se revisa **antes** de pedir publicar.
- Si se quiere cambiar qué se sube o cómo, es una spec.
