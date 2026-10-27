# 003 — Plan: Reloj y menú de ajustes

Todo en `juegos/dixit/dixit.js` y `css/estilo.css`; se toma el diseño probado en `poc/temporizador.html`.

- **Ajustes**: objeto `ajustes` en `localStorage` (`musa.dixit.ajustes.v1`) mezclado con los valores por
  defecto al cargar; la duración se ajusta a pasos de 5 s entre 0:10 y 9:55.
- **Reloj**: estado fuera de la carta (`restante`, `corriendo`, `terminaEn`), contado contra `Date.now()`
  con un `setInterval` de 100 ms y repaso al volver a la pestaña (`visibilitychange`). `pintar()` vuelve a
  dibujar la carta y luego `pintarReloj()` la pone al día, así que repintar no lo detiene.
  Se reinicia en nueva ronda, otra categoría, atrás/adelante (y por lo tanto al cambiar de nivel) y nueva partida.
- **Carta**: la carta de la categoría lleva `carta--reloj` y `reloj-vista-<arena|borde|numero>`; dentro, el
  velo de arena, el SVG del borde y el botón. Las clases `reloj--poco` y `reloj--fin` dan el coral.
- **Paneles**: el catálogo ☰ y los ajustes ⚙ comparten `crearPanel / mostrarPanel / cerrarPanel`.
  La barra pasa a tres columnas para que el título siga centrado con dos botones a la derecha.
- **Offline**: `service-worker.js` a `musa-v38`.
