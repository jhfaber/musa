# 015 — Mente Vacuna: preguntas filosóficas y más miedos

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "Tambien megustaria una seccion de preguntas filosoficas, sentido de la vida, mayor miedo, si ya existe algo asi pues agregar esas preguntas a las categorias correspondientes"
- **Depende de:** [014 — Posiciones y Fantasías](../014-mente-vacuna-posiciones-fantasias/spec.md)
- **Banco nuevo:** [preguntas/filosoficas.json](../../juegos/mente-vacuna/preguntas/filosoficas.json)

## Objetivo

Preguntas para pensar y conversar (sentido de la vida, felicidad, muerte, destino) y más preguntas sobre miedos.

## Qué cambia para el jugador

- Categoría nueva **🤔 Filosóficas** (apta para todos, encendida por defecto): 25 abiertas y 15 de 4 opciones
  ("¿Cuál es el sentido de la vida?", "¿Qué pasa después de la muerte?", "¿Existe el destino?"…).
- **😱 Miedos y manías** (ya existía): se le agregan 6 abiertas y 4 de 4 opciones sobre el mayor miedo
  ("¿Cuál es el mayor miedo de la gente?", "Lo que más temes perder"…). No se crea una categoría duplicada.

## Técnico

Un archivo nuevo, una línea en `indice.json` y `juegos.json`; se amplía `miedos-y-manias.json`. Sin código.
Versión del service worker: v93 (junto con la spec 014).

## Fuera de alcance

Cambiar las preguntas que ya estaban.

## Cómo sabremos que está lista

- [x] La categoría Filosóficas aparece y se filtra como las demás.
- [x] Miedos y manías tiene las preguntas nuevas, sin repetir las anteriores.
- [x] `npm test` (58 pruebas del banco) y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
