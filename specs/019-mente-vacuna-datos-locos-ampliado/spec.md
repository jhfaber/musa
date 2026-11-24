# 019 — Mente Vacuna: ampliar "Datos locos"

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "podriamos ampliar datos locos? se ve bastante interesante esta categoria, no se que mas podemos incluir"
- **Depende de:** [018 — Del grupo ampliado](../018-mente-vacuna-del-grupo-ampliado/spec.md)

## Objetivo

Que 🤯 Datos locos (31 preguntas) tenga más rarezas, números y ocurrencias para sorprenderse.

## Qué cambia para el jugador

Pasa de 31 a **151 preguntas** (120 nuevas: 94 abiertas, 1 con respuesta prohibida y 25 de 4 opciones):

| Bloque | Ejemplos |
|---|---|
| **Animales absurdos** | un animal que sería buen taxista, mal doctor o buen cantante; el más inútil |
| **Objetos y cosas** | algo que se regala y nadie quiere, algo que se pega, algo que brilla en la oscuridad |
| **¿Y si…?** | qué harías si fueras invisible un día, si pudieras parar el tiempo, qué le pedirías a un genio |
| **Inventa un nombre** | una banda de rock, un restaurante, un sabor de helado, un deporte olímpico, una app que debería existir |
| **Números y fechas** | un número de tres cifras, un número de mala suerte, un año que revivirías |
| **Sentidos y palabras** | un sonido que te relaja, una palabra graciosa, un dicho colombiano |
| **Hábitos raros y récords** | algo que haces sin darte cuenta, un talento inútil, un récord Guinness absurdo |
| **De 4 opciones** | ¿qué preferirías poder hacer?, ¿a qué época viajarías?, ¿qué sería lo más raro? |

Mismo formato: la pregunta, y las 4 opciones si es cerrada, sin puntos.

## Técnico

Solo se amplía `preguntas/datos-locos.json`. Sin código. Service worker v97.

## Fuera de alcance

Cambiar las 31 que ya estaban.

## Cómo sabremos que está lista

- [x] La categoría tiene 151 preguntas, sin repetir las anteriores.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
