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
| **Prohibiciones** en preguntas abiertas con una respuesta obvia | 162 aplicadas (170 propuestas descartadas) | "¿Quién es el mayor goleador de la historia?" no vale **Messi** ni **Cristiano Ronaldo**; "Un sabor de helado" no vale chocolate; "Un país de Asia" no vale China ni Japón |
| **Opciones reducidas o cambiadas** | 10 | "¿Qué acaba más rápido con una relación?" queda con 3 (sin *la infidelidad*, que era la obvia) |
| **Preguntas eliminadas** | 5 | "¿Qué da más seguridad en una relación?", "¿Qué hace durar una relación?", "¿Qué es peor en una pareja?" (En pareja), "¿Cuál es el mejor momento para una fantasía?" (Fantasías: casi todos dirían *la noche*) y "¿Qué es lo más importante en la vida?" (Filosóficas: ganaba *la familia*) |

En la tarjeta, las prohibidas aparecen como siempre: **🚫 No vale: …**

## Corrección de John: las prohibiciones

Primero apliqué 332 prohibiciones. John dijo (24-nov-2026): "esas prohibiciones no están bien, no parecen interesantes
pues Messi y Cristiano igual son 2 opciones, 69 y 100 no tiene sentido, quita esas restricciones… la del mayor goleador
tal vez esa sí podríamos dejarla así a ver… igual las prohibiciones sí preséntamelas a ver cuáles tienen sentido".
Se quitaron 331 y quedó solo la del goleador. Después John revisó la lista y dijo: "un país de Asia, están bien esas prohibiciones, de resto sí parecen interesantes tus recomendaciones, dejemos esas entonces, aplica los cambios, commit y a producción". Se aplicaron las 160 marcadas 👍 y la de "Un país de Asia" (más la del goleador: 162). Las ⚠ y ❌ no se aplicaron. Las 332 propuestas, con mi opinión de cada una, están en
[prohibiciones-propuestas.md](prohibiciones-propuestas.md) para que John marque cuáles aplicar.

## Lo que no se tocó

- **🔠 Cuatro opciones** (las 100 de John) y las preguntas viejas de opciones de 🔥 Picantes (algunas traen "Depende"): son
  suyas y no pidió cambiarlas. Si quiere, se revisan en otra spec.
- **👥 Del grupo**: la respuesta es una persona de la mesa, así que no hay respuesta obvia que prohibir.
- El texto de las preguntas abiertas que ya tenía: solo se les agregó la prohibición.

## Técnico

Se agrega `no` (1 a 3 respuestas de hasta 25 caracteres) a preguntas que eran solo texto, y se ajustan o quitan
preguntas de opciones. Sin código. Service worker v105. Las pruebas ya validaban el formato de `no` y de `opciones`.

## Para tener en cuenta

"Obvio" es un criterio de ojo, no medible. Por eso las prohibiciones no se aplican sin que John las vea.

## Cómo sabremos que está lista

- [x] La decisión 0006 está escrita y enlazada desde `CLAUDE.md`.
- [x] Todas las categorías revisadas contra los seis criterios.
- [x] John revisó las prohibiciones propuestas: se aplicaron las 👍 y la de Asia.
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John prueba el juego en el celular → Completada.
