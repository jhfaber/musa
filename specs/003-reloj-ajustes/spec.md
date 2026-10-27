# 003 — Reloj para pensar la pista y menú de ajustes

- **Estado:** Aprobada por John (27-oct-2026, en el chat: "acabemos con el poc para agregarlo a musa, agrega todo a musa") — implementada, falta probar sonido y vibración en el celular
- **Depende de:** [001 — Ayudante de Dixit](../001-dixit/spec.md)
- **Viene de:** la prueba `poc/temporizador.html`, revisada con John

## Objetivo

Que el narrador tenga un reloj para pensar su pista sin salir de la carta, y que todo lo que se
configura (cuánto dura, cómo se ve, sonido) viva en un **menú de ajustes ⚙**, no en la pantalla principal.

## Alcance

- **Botón del reloj en la carta**: botón dorado centrado debajo de los ejemplos de la carta de categoría,
  con el estado y el tiempo (⏳ Pensar · 1:00 → ⏸ Pausar → ▶ Seguir → ↻ Otra vez).
  - Se toca para empezar y otra vez para pausar.
  - En los últimos 10 segundos se pone coral y la carta late suave.
  - Al terminar: campanita suave y vibración (si están activadas) y un contorno coral en la carta.
  - El reloj se reinicia al cambiar la ronda en pantalla (nueva ronda, otra categoría, atrás/adelante,
    cambio de nivel, nueva partida). Marcar ⭐ o cambiar lentes no lo reinicia.
  - No sale en el dorso (antes de la primera ronda) ni en Favoritos sin favoritas.
- **Cómo se ve el paso del tiempo** (una opción en ajustes):
  - **Arena** (por defecto): un velo dorado que baja por la carta.
  - **Borde**: el borde dorado de la carta se va consumiendo.
  - **Solo el número**: sin animación, solo cuenta el botón.
- **Menú ⚙ Ajustes**, junto al ☰ en la barra de Dixit, con el mismo panel lateral del catálogo:
  - Reloj encendido / apagado (apagado: no aparece el botón en la carta).
  - **Duración en minutos y segundos** (de 0:10 a 9:55, en pasos de 5 s), con atajos 0:30, 1:00, 1:30 y 2:00.
  - Cómo se ve el tiempo: Arena, Borde o Solo el número.
  - Campanita al terminar: sí / no. Vibrar al terminar: sí / no (solo Android).
- Los ajustes se guardan en el celular (`musa.dixit.ajustes.v1`), aparte de la partida y de los favoritos.
- Valores por defecto: reloj encendido, 1:00, Arena, campanita sí, vibrar sí.

## Fuera de alcance

- Que el reloj se inicie solo con cada ronda.
- Ajustes de otras cosas (niveles, categorías): el menú queda listo para sumarlas después.
- Cambiar las categorías o lentes de Tranquilo (siguen congelados); el reloj es igual en todos los niveles.

## Requisitos

- **R1.** El tiempo se calcula contra la hora de término, no contando cuadros, para que no se congele si
  el celular frena la página o se apaga la pantalla (lo que falló en la primera prueba).
- **R2.** El reloj sigue corriendo aunque la carta se repinte (p. ej. al marcar ⭐).
- **R3.** Funciona sin Internet; se sube la versión del service worker.
- **R4.** La carta no se vuelve más alta que hoy salvo por el botón del reloj; los botones de abajo siguen
  a la vista en un celular.

## Criterios de aceptación

1. Con los valores por defecto, la carta muestra "⏳ Pensar · 1:00"; al tocarlo baja la arena y cuenta.
2. Pausar y seguir conserva el tiempo; al llegar a 0 aparece "↻ Otra vez" y el contorno coral.
3. En ⚙ pongo 0 min 45 s: la carta muestra 0:45. Los atajos cambian la duración.
4. Con "Borde" se consume el borde; con "Solo el número" no hay animación.
5. Con el reloj apagado no aparece el botón.
6. Nueva ronda reinicia el reloj; marcar ⭐ mientras corre no lo detiene.
7. Los ajustes siguen igual tras recargar la página.

## Verificación (27-oct-2026, navegador a tamaño celular)

1. ✅ La carta muestra "⏳ Pensar · 1:00"; al tocarlo la arena baja y cuenta.
2. ✅ Pausar conserva el tiempo; a los 10 s se pone coral; en 0 aparece "↻ Otra vez" con el contorno coral.
3. ✅ Minutos y segundos con − / + (mínimo 0:10) y los atajos cambian la duración de la carta.
4. ✅ "Borde" dibuja y consume el borde; "Solo el número" no muestra animación.
5. ✅ Con el reloj apagado no aparece el botón.
6. ✅ Nueva ronda vuelve a 1:00; marcar ⭐ mientras corre no lo detiene.
7. ✅ Los ajustes siguen igual tras recargar.

Pendiente de probar en el celular de verdad: la campanita y la vibración.
