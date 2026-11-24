# 0004 — Musa es el repo de todos los juegos de John, de mesa y de otro tipo

- **Estado:** Vigente
- **Fecha:** 23-nov-2026
- **Decidió:** John (en el chat: "este será un repo de juegos de mesa y otros juegos que tengo")
- **Relacionada con:** [0001](0001-pwa-estatica-sin-red.md), [0002](0002-un-juego-una-carpeta.md)

## Contexto

Musa nació para acompañar Dixit y Risk Relámpago. John quiere sumar varios juegos más, no solo de mesa.

## Decisión

El repo amplía su alcance: Musa es el hogar de **todos los juegos de John**, de mesa y de otro tipo. El nombre y la
dirección publicada se mantienen. Todo juego nuevo entra por spec y sigue la estructura de la decisión 0002.

## Motivo

Un solo lugar con un sistema visual común y una sola forma de trabajar, en lugar de un repo por juego.

## Consecuencias

- Hay que revisar `CLAUDE.md` y el texto del inicio, que hoy dicen que Musa acompaña "juegos de mesa: Dixit y Risk".
- Un juego que no sea de mesa puede chocar con la decisión 0001 (app estática sin servidor): se resuelve en la spec de ese juego, y si hace falta apartarse de 0001, con una decisión nueva.
- Cada juego nuevo se registra en `juegos/juegos.json` y en el índice de specs.
