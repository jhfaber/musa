# 018 — Mente Vacuna: ampliar "Del grupo"

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "La categoria grupo esta muy pequeña, hay muchas mas preguntas que podriamos hacer, quien seria un secretario secretaria, quien armaria un viaje, quien tiene mayores probabilidades de cambiar de trabajo, quien es mas probable que termine en algo swinger, iglesia, scout etc, podemos ampliar bastante esta categoria"
- **Depende de:** [010 — banco en varios archivos](../010-mente-vacuna-encuestas/spec.md)

## Objetivo

Que 👥 Del grupo (34 preguntas) tenga muchas más: "¿Quién…?" cuya respuesta es una persona de la mesa.

## Qué cambia para el jugador

Pasa de 34 a **151 preguntas** (117 nuevas), en estos bloques:

| Bloque | Ejemplos |
|---|---|
| **Quién sería el mejor…** (28) | secretario o secretaria, profesor, médico, guía turístico, DJ, papá o mamá; villano, héroe y personaje gracioso de la película |
| **Quién tiene más probabilidades de…** (6) | cambiar de trabajo, renunciar mañana, montar un negocio, ser millonario, mudarse de país |
| **Quién es más probable que termine…** (11) | en la política, en una iglesia, en los scouts, en un grupo swinger, en una secta, en un monasterio |
| **Quién es más probable que…** (20) | se divorcie, tenga muchos hijos, escriba un libro, le mande mensaje a su ex, tenga un amorío en el trabajo |
| **El más… y situaciones** (52) | el más celoso, el más tacaño, quién deja en visto, quién armaría el viaje, quién se olvidaría del pasaporte |

Mismo formato: la pregunta, y cada uno responde con el nombre de alguien del grupo.

## Tono

De fiesta y con cariño: son bromas entre amigos, ninguna humilla a nadie ni acusa de algo grave.

## Técnico

Solo se amplía `preguntas/del-grupo.json`. Sin código. Service worker v96.

## Fuera de alcance

Cambiar las 34 que ya estaban, o hacer una categoría aparte.

## Cómo sabremos que está lista

- [x] La categoría tiene 151 preguntas, sin repetir las anteriores.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
