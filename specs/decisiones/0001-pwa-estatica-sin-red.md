# 0001 — Musa es una app estática que funciona sin Internet

- **Estado:** Vigente
- **Fecha:** registrada el 23-nov-2026 (la decisión viene del origen del proyecto, recogida de `CLAUDE.md`)
- **Decidió:** John
- **Relacionada con:** [0003](0003-publicar-solo-a-pedido.md)

## Contexto

Musa acompaña juegos de mesa desde el celular, en la mesa, donde a veces no hay buena señal.

## Decisión

Musa es una PWA: HTML, CSS y JS estáticos, que se instala en el celular y funciona sin Internet. No toca la red
de la casa ni ningún dispositivo.

## Motivo

Un ayudante de mesa que depende de la red falla justo cuando se usa. Lo estático además no necesita servidor
ni cuentas, y no maneja datos de la casa.

## Consecuencias

- Los archivos que se guardan para uso sin Internet se listan en `juegos/juegos.json` y los guarda el service worker.
- Al cambiar esos archivos hay que subir la versión en `service-worker.js`.
- Lo que el jugador guarda (partidas, favoritos, ajustes) vive en el celular, con claves `musa.<juego>.…`.
- Un juego que necesite servidor o cuenta no cabe sin una decisión nueva que reemplace a esta.
