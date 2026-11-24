# 011 — Categorías de juegos en la portada

- **Estado:** En curso
- **Aprobada por John:** 23-nov-2026, en el chat, con un cambio: "sí, pero al azar que permita elegir todas las categorías o una o varias"
- **Depende de:** [008 — Catálogo de juegos](../008-catalogo-de-juegos/spec.md)
- **Pedido por John:** 23-nov-2026, en el chat: "vamos a dividir los juegos que existen por las categorías existentes
  de juegos, tipo party, etc."

## Objetivo

Que en la portada se pueda filtrar por el **tipo de juego**, con las categorías que usa el mundo de los juegos de
mesa (las de BoardGameGeek: *party*, familiar, estrategia…), para encontrar rápido qué jugar según el grupo.

## Categorías

| | Categoría | Qué es |
|---|---|---|
| 🎉 | Party | Para grupos grandes, rápidos de explicar, de reírse |
| 👨‍👩‍👧 | Familiares | Para todas las edades, reglas sencillas |
| ♟️ | Estrategia | Se gana pensando a largo plazo |
| 🃏 | Cartas | Se juegan con una baraja |
| 🕵️ | Deducción y engaño | Roles ocultos, mentir y descubrir al otro |

Un juego puede estar en **una o dos** categorías:

| Juego | Categorías |
|---|---|
| Charada | 🎉 Party |
| Codenames Pictures | 🎉 Party · 🕵️ Deducción |
| Dixit | 🎉 Party · 👨‍👩‍👧 Familiares |
| El que piensa pierde | 🎉 Party · 🃏 Cartas |
| Ghost Blitz | 👨‍👩‍👧 Familiares |
| Mente Vacuna | 🎉 Party |
| Monopoly | 👨‍👩‍👧 Familiares |
| Monopoly Dados y Tragos | 🎉 Party |
| Monopoly Superbanco Electrónico | 👨‍👩‍👧 Familiares |
| Pictionary para adultos | 🎉 Party |
| Póker | 🃏 Cartas · ♟️ Estrategia |
| Risk | ♟️ Estrategia |
| Secret Hitler | 🕵️ Deducción · 🎉 Party |
| Uno Normal, Uno No Mercy, Uno Super Mario | 🃏 Cartas · 👨‍👩‍👧 Familiares |
| Zombie Kittens | 🃏 Cartas · 🎉 Party |

## Qué cambia para el jugador

- Encima de la lista, una fila de etiquetas: **Todos** y las 5 categorías, cada una con cuántos juegos tiene. Se ven
  todas sin deslizar (en varias filas si no caben).
- Tocar una categoría muestra solo sus juegos; tocarla otra vez vuelve a **Todos**. Se elige una a la vez.
- Se combina con el buscador: "uno" dentro de 🃏 Cartas.
- Cada tarjeta de juego muestra sus categorías en pequeño.
- **🎲 Elegir un juego al azar** tiene su propia fila de categorías: **Todas**, una o **varias** a la vez ("party o cartas").
  Arranca con la categoría elegida en la portada, si hay una; si no, con lo último que se usó en el dado.
- La app recuerda la última categoría elegida.

## Cambio pedido por John (23-nov-2026, después de verlo)

"Al principio deberían salir las categorías de los juegos en vez de los juegos, y al darle clic sí salen los juegos":

- La portada abre con **tarjetas de categorías** (emoji, nombre, descripción corta, algunos juegos y cuántos tiene)
  y una tarjeta **📚 Todos los juegos**. Reemplaza la fila de etiquetas de arriba.
- Al tocar una categoría se ven sus juegos, con una cabecera "← 🎉 Party · 9 juegos".
- Rutas: `#` categorías, `#c/<id>` juegos de una categoría (`#c/todos` todos), `#<juego>` el juego. El botón atrás del
  celular funciona, recargar mantiene la categoría, y ← dentro de un juego vuelve a la categoría de donde se vino.
- El buscador busca en todos los juegos desde cualquier vista; al borrarlo se vuelve a la vista anterior.
- El dado arranca con la categoría abierta, si hay una.

## Técnico

- Las categorías y la de cada juego viven en `juegos/juegos.json` (datos, no código): agregar una categoría o un
  juego nuevo no toca la lógica.
- El validador revisa que cada juego tenga 1 o 2 categorías y que existan.
- El filtro es una función pura, probada en `pruebas/`.
- Sin Internet, a tamaño celular y en 320 px, como siempre.

## Fuera de alcance

- Filtrar por número de jugadores o duración (posible spec después).

## Preguntas para John

1. ¿Cambias alguna categoría o el lugar de algún juego?

## Cómo sabremos que está lista

- [x] La fila de categorías aparece en la portada con sus conteos y se ve completa en el celular (también en 320 px).
- [x] Filtrar y combinar con el buscador funcionan; el dado tira entre todas, una o varias categorías.
- [x] Cada tarjeta muestra sus categorías; se recuerda la última elegida (portada y dado).
- [x] `npm test` y `npm run validar` sin errores; el filtro se prueba con las 32 combinaciones de categorías.
- [x] Revisado contra la [decisión 0005](../decisiones/0005-buenas-practicas.md).
- [ ] John lo prueba en el celular → Completada.
