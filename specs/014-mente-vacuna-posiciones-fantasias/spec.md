# 014 — Mente Vacuna: Posiciones y Fantasías (para adultos)

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "agrega mas preguntas a mente vacuna, mas que todo al lado de las picantes, podemos añadir posiciones sexuales… fantasia sexual y 4 opciones etc, todas las variantes posibles para agregar, ya sea abiertas o cerradas"
- **Depende de:** [010 — banco en varios archivos y cuatro opciones](../010-mente-vacuna-encuestas/spec.md)
- **Banco nuevo:** [preguntas/posiciones.json](../../juegos/mente-vacuna/preguntas/posiciones.json) y [preguntas/fantasias.json](../../juegos/mente-vacuna/preguntas/fantasias.json)

## Objetivo

Más preguntas picantes para jugar entre adultos, con las dos variantes que ya conoce el juego: **abiertas** (cada uno
escribe lo que más diría la gente) y **cerradas** (la pregunta trae 4 opciones, comunes y raras).

## Qué cambia para el jugador

Dos categorías nuevas junto a 🔥 Picantes, **solo para mayores de 18** (arrancan apagadas, como las demás de adultos):

| Categoría | Abiertas | Cerradas (4 opciones) |
|---|---|---|
| 🛏️ Posiciones | "La posición más común", "la más extraña", "la más cansada"… | "¿Cuál es la más común?" con 4 posiciones, "elige una poco común" con 4 raras |
| 💭 Fantasías | "Una fantasía que ya cumplió casi todo el mundo", "la más rara"… | "¿Cuál es la fantasía más común?" con 4 opciones, lugares, disfraces, juegos de pareja |

Mismo formato que el resto: la pregunta (y las 4 opciones si es cerrada), sin puntos. Cada grupo decide cómo contesta.

## Técnico

Dos archivos nuevos en `preguntas/`, una línea en `indice.json` y en `juegos.json`; no se toca código. Sube la versión
del service worker. Las pruebas de formato (largo, 4 opciones distintas, sin repetidas, color con contraste) las cubren solas.

## Tono

Pícaro y de fiesta, sin descripciones gráficas: se usan los nombres comunes de las posiciones y nada que humille a nadie.

## Fuera de alcance

Preguntas explícitas o gráficas, y cambiar la categoría Picantes existente.

## Para tener en cuenta

- Son para adultos que se llevan bien: la ficha del juego ya avisa que es +18.
- Hay una explícita opción de saltar o descartar una pregunta (ya existe en el juego).

## Cómo sabremos que está lista

- [x] Las dos categorías aparecen junto a Picantes, apagadas por defecto.
- [x] Hay preguntas abiertas y cerradas en cada una.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
