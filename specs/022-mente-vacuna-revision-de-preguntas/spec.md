# 022 — Mente Vacuna: revisión de todas las preguntas con los criterios de la decisión 0006

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "deja en specs estos criterios… luego de dejarlo en specs revisa cada pregunta, si hay preguntas abiertas que quedaron con algo que es muy obvio que van a contestar pues coloca la prohibicion de contestar por ello… tambien si hay preguntas que no estan muy equilibradas considerar reducir opciones o directamente eliminar la pregunta"
- **Criterios:** [decisión 0006 — criterios de las preguntas de Mente Vacuna](../decisiones/0006-criterios-preguntas-mente-vacuna.md)
- **Depende de:** [021 — opciones de peso parecido](../021-mente-vacuna-opciones-equilibradas/spec.md)

## Objetivo

Aplicar a **todo el banco** (27 categorías) los criterios que John dio: nada obvio, opciones del mismo peso, sin salidas
evasivas, y reducir u eliminar lo que no se pueda equilibrar.

## Qué cambia para el jugador

| Qué | Cuántas | Ejemplo |
|---|---|---|
| **Prohibiciones nuevas** en preguntas abiertas con una respuesta obvia | 332 | "Un número del 1 al 100" ya no vale **69** ni **100**; "Un sabor de helado" ya no vale chocolate ni vainilla; "Un deportista famoso" ya no vale Messi |
| **Opciones reducidas o cambiadas** | 10 | "¿Qué acaba más rápido con una relación?" queda con 3 (sin *la infidelidad*, que era la obvia) |
| **Preguntas eliminadas** | 5 | "¿Qué da más seguridad en una relación?", "¿Qué hace durar una relación?", "¿Qué es peor en una pareja?" (En pareja), "¿Cuál es el mejor momento para una fantasía?" (Fantasías: casi todos dirían *la noche*) y "¿Qué es lo más importante en la vida?" (Filosóficas: ganaba *la familia*) |

En la tarjeta, las prohibidas aparecen como siempre: **🚫 No vale: …**

## Lo que no se tocó

- **🔠 Cuatro opciones** (las 100 de John) y las preguntas viejas de opciones de 🔥 Picantes (algunas traen "Depende"): son
  suyas y no pidió cambiarlas. Si quiere, se revisan en otra spec.
- **👥 Del grupo**: la respuesta es una persona de la mesa, así que no hay respuesta obvia que prohibir.
- El texto de las preguntas abiertas que ya tenía: solo se les agregó la prohibición.

## Técnico

Se agrega `no` (1 a 3 respuestas de hasta 25 caracteres) a preguntas que eran solo texto, y se ajustan o quitan
preguntas de opciones. Sin código. Service worker v103. Las pruebas ya validaban el formato de `no` y de `opciones`.

## Para tener en cuenta

"Obvio" es un criterio de ojo, no medible: las 332 prohibiciones salen de lo que yo creo que más se contestaría. John
puede quitar o cambiar las que le parezcan de más.

## Cómo sabremos que está lista

- [x] La decisión 0006 está escrita y enlazada desde `CLAUDE.md`.
- [x] Todas las categorías revisadas contra los seis criterios.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John prueba el juego en el celular → Completada.
