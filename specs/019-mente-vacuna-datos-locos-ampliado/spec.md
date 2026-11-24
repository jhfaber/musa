# 019 — Mente Vacuna: ampliar "Datos locos"

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "podriamos ampliar datos locos? se ve bastante interesante esta categoria, no se que mas podemos incluir"
- **Depende de:** [018 — Del grupo ampliado](../018-mente-vacuna-del-grupo-ampliado/spec.md)

## Objetivo

Que 🤯 Datos locos (31 preguntas) tenga más rarezas, números y ocurrencias para sorprenderse.

## Qué cambia para el jugador

Pasa de 31 a **56 preguntas**: se agregan **25 de 4 opciones**, mezcladas con las 31 abiertas de siempre.

Primero se habían agregado 120 (94 abiertas y 25 cerradas). John dijo: "quedaron muy abiertas, quita las que acabaste de
agregar que no sean de 4 posibles respuestas, pues veo como muchas que no me convencen". Se quitaron las 95 abiertas
nuevas y quedaron solo las de 4 opciones, por ejemplo:

- ¿Qué preferirías poder hacer? (volar, ser invisible, leer mentes, viajar en el tiempo)
- ¿A qué época viajarías?
- ¿Qué sería lo más raro? (un perro que maúlla, un gato que ladra…)
- ¿Qué deporte olímpico inventarías?
- ¿Qué sería lo más incómodo?

Mismo formato: la pregunta y las 4 opciones, sin puntos.

## Técnico

Solo se amplía `preguntas/datos-locos.json`. Sin código. Service worker v98.

## Fuera de alcance

Cambiar las 31 que ya estaban y agregar preguntas abiertas nuevas (John no las quiso).

## Cómo sabremos que está lista

- [x] La categoría tiene 56 preguntas: las 31 de siempre y 25 de 4 opciones.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
