# 013 — Fondo de la portada más legible

- **Estado:** En curso
  Aprobada por John (24-nov-2026, en el chat: "bueno ajusta la imagen de fondo con las mejoras a ver como queda") — en curso
- **Depende de:** [004 — Estructura por juego y sistema visual compartido](../004-estructura-por-juego/spec.md)

## Objetivo

Que el título, el subtítulo y las tarjetas de la portada se lean con facilidad sin perder la imagen de la luna.

## Qué cambia para el jugador

- Arriba, detrás de "Musa", la imagen se oscurece un poco más: el título y el subtítulo se destacan.
- El subtítulo "Rondas mágicas para tus juegos" se lee mejor (más claro y con una sombra suave).
- En la zona de las tarjetas la imagen es más oscura y calmada.
- Se ve igual en el inicio y en Dixit, que comparten el fondo. La luna sigue siendo la misma imagen.

## Técnico

Solo CSS (`comun/base.css`): el degradado oscuro sobre la imagen y el estilo del subtítulo. Sin imágenes nuevas.
Sube la versión del service worker.

## Fuera de alcance

Cambiar la imagen por otra, desenfocarla o tocar el emoji de Familiares.

## Para tener en cuenta

John dijo "a ver cómo queda": si no le gusta, se afinan los valores o se vuelve atrás con un commit.

## Cómo sabremos que está lista

- [ ] El subtítulo se lee bien a tamaño celular.
- [ ] La luna sigue viéndose en la parte alta de la portada.
- [ ] Inicio y Dixit se ven bien y funcionan sin conexión.
