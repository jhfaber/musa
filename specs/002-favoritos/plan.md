# 002 — Plan: Favoritos en Dixit

Todo vive en `juegos/dixit/dixit.js` y `css/estilo.css`; no cambia `categorias.json`.

## Datos
- Lista `favoritos` en `localStorage` con la clave `musa.dixit.favoritos.v1`, aparte de la partida
  (`musa.dixit.v2`), así "Nueva partida" no la toca.
- Cada favorita: `{ categoria, lentes: [ids], nivel, fecha }`. La identidad es `categoria|lente1,lente2`.
- Al abrir el juego se descartan las favoritas con categorías o lentes que ya no existen (como `limpiarEstado`).

## Nivel Favoritos
- Se agrega `favoritos` a `NIVELES` (sin lentes propios). Así aparece como cuarto chip en Nivel y como
  cuarta pestaña en el catálogo ☰, y la partida guardada recuerda el modo.
- `armarRonda` en modo Favoritos copia una favorita al azar entre las que no salieron en las últimas
  `N − 1` rondas (N = cantidad de favoritas): una vuelta completa sin repetir. "Otra categoría" evita
  además la que está en pantalla.
- Sin favoritas: la carta explica cómo marcarlas, "Nueva ronda" queda deshabilitado y cambiar a este
  nivel no reparte nada.
- "Otros lentes" se oculta en este modo.

## Carta
- Botón ⭐/☆ en la esquina superior derecha de la carta (`data-accion="fav"`), con `aria-pressed`.
  No hace crecer la carta.

## Catálogo ☰
- La pestaña Favoritos lista cada favorita (símbolo, categoría, lentes y el nivel en que salió) con un
  botón "Quitar". Al quitar se repinta el catálogo y la carta (la ⭐ se apaga si era la de pantalla).

## Offline
- `service-worker.js` pasa a `musa-v37`.
