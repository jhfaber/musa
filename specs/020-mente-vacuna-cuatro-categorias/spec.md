# 020 — Mente Vacuna: Dilemas, Redes y citas, Plata y vida adulta, Familia

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "si agrega esas categorias con sus preguntas"
- **Depende de:** [017 — cuerpo, En pareja, Misterios](../017-mente-vacuna-cuerpo-pareja-misterios/spec.md) y [016 — sin filtro +18](../016-mente-vacuna-sin-filtro-18/spec.md)

## Objetivo

Cuatro categorías nuevas con temas que dan conversación. **Todas son de 4 opciones** (nada abierto): John dijo que las
abiertas nuevas le habían parecido muy abiertas (spec 019), así que aquí cada pregunta trae sus opciones.

## Criterio: ninguna opción obvia

John pidió (24-nov-2026): "estas preguntas deberían ser lo bastante controversiales para que la gente elija cosas
diferentes, si colocas nada todos se van a ir por allí". Cada pregunta de 4 opciones debe repartir al grupo: nada de
"Nada", "Mitad y mitad" ni "Depende", y cada opción trae una ganancia y un costo. Se reescribieron 10 preguntas que no
cumplían (ej.: "¿Qué parte de tu pasado borrarías?" ahora ofrece cuatro cosas concretas, no "Nada"; "¿Qué vida elegirías?"
ahora es "Famoso y sin privacidad", "Millonario y solo", etc.). Service worker v101.

## Qué cambia para el jugador

| Categoría | Preguntas | Ejemplos |
|---|---|---|
| ⚖️ **Dilemas** | 25 | ¿Qué sacrificarías primero? ¿Qué soportarías toda la vida? ¿Qué harías por dinero? |
| 💬 **Redes y citas** | 22 | ¿Qué es lo peor que se hace en WhatsApp? ¿Qué foto de perfil da mala espina? ¿Cuánto es demasiado para responder? |
| 💰 **Plata y vida adulta** | 22 | ¿En qué se va más la plata? ¿Qué comprarías con la prima? ¿Qué da más estrés? |
| 🏡 **Familia** | 22 | ¿Qué molesta más de un suegro? ¿Qué pregunta de los tíos da más pena? ¿Qué es infaltable en una fiesta familiar? |

Mismo formato: la pregunta y las 4 opciones, sin puntos. Todas arrancan prendidas (spec 016).

## Técnico

Cuatro archivos nuevos en `preguntas/`, una línea cada uno en `indice.json` y `juegos.json`. Sin código.
Service worker v99. Las pruebas no aceptan emojis como opciones (las ven repetidas), así que se usan palabras.

## Fuera de alcance

Preguntas abiertas en estas categorías; el juego aparte "Yo nunca" / "Verdad o reto".

## Cómo sabremos que está lista

- [x] Las cuatro categorías aparecen y se filtran como las demás.
- [x] Todas sus preguntas son de 4 opciones.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
