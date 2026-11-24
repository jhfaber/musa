# 017 — Mente Vacuna: partes del cuerpo, En pareja, Misterios y más Filosóficas

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "agrega a picantes como las partes del cuerpo de una mujer y un hombre que mas le gusta al otro… Tambien podriamos agregar esto a alguna otra seccion pero mas tranqui… Tambien agrega mas preguntas en la categoria de filosificas… Tambien puede ser preguntas como si el humano fue a la luna en tal fecha… si hay una elite conspiradora etc"
- **Depende de:** [015 — filosóficas](../015-mente-vacuna-filosoficas/spec.md) y [016 — sin filtro +18](../016-mente-vacuna-sin-filtro-18/spec.md)

## Qué cambia para el jugador

| Dónde | Qué se agrega | Abiertas | De 4 opciones |
|---|---|---|---|
| 🔥 **Picantes** (ya existía) | Qué parte del cuerpo de una mujer le gusta a un hombre, y de un hombre a una mujer; lo primero que se mira; lo más sensual; dónde se siente mejor un beso o un masaje | 19 | 13 |
| 💞 **En pareja** (nueva, tranquila) | Lo más importante en un hombre y en una mujer dentro de una relación (valentía, dinero, lealtad…); banderas rojas y verdes; qué hace durar una relación | 22 | 13 |
| 🤔 **Filosóficas** (ya existía) | Más preguntas para pensar: la verdad dolorosa o la mentira feliz, qué se debe perdonar, cuándo se es adulto | 20 | 13 |
| 🛸 **Misterios** (nueva) | ¿Fue el humano a la luna en 1969, o hace poco, o nunca?; ¿hay una élite que manda?; extraterrestres, Área 51, Atlántida, simulación | 20 | 17 |

Mismo formato de siempre: la pregunta, y las 4 opciones si es cerrada, sin puntos. Todas arrancan prendidas (spec 016).

## Tono

- **Partes del cuerpo:** pícaro y de fiesta, con las partes que cualquiera nombra (senos, cola, piernas, boca, espalda, brazos…). Sin descripciones gráficas ni genitales.
- **Misterios:** son juegos de opinión, no afirmaciones. Dejé por fuera conspiraciones sobre salud, elecciones o grupos de personas, que no son un chiste para todos.

## Técnico

Dos archivos nuevos (`en-pareja.json`, `misterios.json`), una línea en `indice.json` y `juegos.json`, y se amplían
`picantes.json` y `filosoficas.json`. Sin código. Service worker v95.

## Fuera de alcance

Cambiar las preguntas que ya estaban.

## Cómo sabremos que está lista

- [x] Las dos categorías nuevas aparecen y se filtran como las demás.
- [x] Picantes y Filosóficas tienen las preguntas nuevas, sin repetir las anteriores.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
