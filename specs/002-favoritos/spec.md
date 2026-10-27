# 002 — Favoritos en Dixit

- **Estado:** Completada (27-oct-2026)
- **Depende de:** [001 — Ayudante de Dixit](../001-dixit/spec.md)

## Objetivo

Cuando una ronda salió muy buena (la mezcla de categoría y lentes dio pistas memorables), poder
**marcarla como favorita** y **volver a jugarla** otro día. Con el catálogo actual hay 253 combinaciones
posibles (6 en Tranquilo, 59 en Normal y 188 en Caótico), así que es poco probable que la misma
vuelva a salir sola.

## Alcance

- **⭐ en la carta**: un botón en la carta de la ronda guarda la **combinación exacta** que se ve:
  categoría, sus lentes (en el mismo orden) y el nivel en que salió. Tocarlo de nuevo la quita.
  La estrella se ve llena cuando la combinación mostrada ya es favorita, también al navegar con
  atrás y adelante.
- **"⭐ Favoritos" en la pestaña de Nivel**: una cuarta opción junto a Tranquilo, Normal y Caótico.
  - Con Favoritos elegido, cada **Nueva ronda** sale al azar de entre las favoritas, **sin repetir**
    hasta haberlas pasado todas. Después vuelve a empezar la vuelta.
  - "Otra categoría" pasa a otra favorita. "Otros lentes" no aplica, porque la favorita es una mezcla
    fija; el botón se oculta en este modo.
  - Si no hay favoritas, la carta explica cómo marcarlas con ⭐ y no se puede pedir ronda.
  - Al cambiar de nivel, sigue la misma regla de hoy: se cambia la ronda actual en vez de añadir otra.
- **Lista en el menú ☰**: una sección "Favoritos" con cada combinación guardada (símbolo y nombre de la
  categoría, sus lentes y el nivel) y un botón para borrarla.
- **Guardado en el celular**: en `localStorage`, con una clave propia (`musa.dixit.favoritos.v1`),
  separada de la partida. "Nueva partida" no borra las favoritas.

## Fuera de alcance

- Compartir favoritas entre celulares, exportarlas o sincronizarlas (no hay cuentas ni servidor).
- Ponerles nombre o nota a las favoritas, o guardar la pista que se dijo (sería el "diario de partida",
  otra spec).
- Cambiar las categorías o lentes de Tranquilo: siguen congelados. Solo se agrega la cuarta opción
  en el selector de nivel.

## Requisitos

- **R1.** Una favorita se guarda como `{ categoria, lentes: [ids], nivel, fecha }`. Dos favoritas son
  la misma si coinciden la categoría y los lentes (sin importar el nivel).
- **R2.** Si una favorita usa una categoría o un lente que ya no existe en `categorias.json`, se
  descarta al cargar, como hace hoy `limpiarEstado` con la partida.
- **R3.** Las rondas que salen en modo Favoritos entran al historial como cualquier otra, así que
  atrás y adelante siguen funcionando.
- **R4.** Funciona sin Internet. Se sube la versión del service worker.
- **R5.** Mismo tamaño compacto de la carta en el celular: la ⭐ no empuja los botones fuera de la pantalla.

## Criterios de aceptación

1. Marco ⭐ en una ronda de Caótico, recargo la página y sigue marcada. Aparece en ☰ → Favoritos.
2. Con 3 favoritas y el nivel Favoritos, 3 rondas seguidas muestran las 3 sin repetir.
3. Sin favoritas, el nivel Favoritos muestra la explicación y no se rompe nada.
4. "Nueva partida" borra las rondas, pero las favoritas siguen ahí.
5. Borrar una favorita desde ☰ también desmarca su ⭐ si es la ronda que está en pantalla.
6. Tranquilo sigue mostrando exactamente sus 6 categorías.

## Verificación (27-oct-2026, navegador a tamaño celular)

1. ✅ Tres favoritas marcadas en Caótico siguen marcadas tras recargar y aparecen en ☰ → Favoritos.
2. ✅ Con 3 favoritas, 3 rondas seguidas en Favoritos muestran las 3 sin repetir; "Otros lentes" se oculta.
3. ✅ Sin favoritas, la carta explica cómo marcarlas y "Nueva ronda" queda deshabilitado.
4. ✅ "Nueva partida" borra las rondas y deja las favoritas.
5. ✅ Quitar desde ☰ la favorita en pantalla apaga su ⭐.
6. ✅ Tranquilo sigue con sus 6 categorías.
