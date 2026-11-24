# 010 — Mente Vacuna: banco en varios archivos y preguntas de encuesta ("100 colombianos dicen")

- **Estado:** En curso
- **Aprobada por John:** 23-nov-2026, en el chat, con un cambio: "Solo que diga las preguntas y las posibles respuestas, nada más, ya nosotros miramos qué contestamos"
- **Depende de:** [009 — banco de preguntas](../009-mente-vacuna-preguntas/spec.md)
- **Pedido por John:** 23-nov-2026, en el chat: "dividir esto para que no quede un archivo supremamente grande, podría
  ser varios archivos json", "preguntas que tienen 4 respuestas… tendría la pregunta y luego las 4 respuestas" (con
  enlaces a "100 colombianos dicen") y "busca más bancos de preguntas para agregar".
- **Banco nuevo:** [preguntas/cuatro-opciones.json](../../juegos/mente-vacuna/preguntas/cuatro-opciones.json) (100 preguntas, cada una con 4 opciones)

## Objetivo

Que el banco pueda crecer sin volverse un archivo gigante, y agregar un tipo de pregunta nuevo: la pregunta de
**encuesta**, donde después de escribir se **revelan las 4 respuestas que más diría la gente**.

## Parte 1: el banco en varios archivos

- Una categoría por archivo: `juegos/mente-vacuna/preguntas/<categoria>.json` (18 archivos hoy).
- Un índice corto, `preguntas/indice.json`, con el orden de las categorías. Agregar una categoría = un archivo nuevo
  y una línea en el índice; no se toca código.
- El juego carga todos los archivos al abrir (en paralelo) y sigue funcionando sin Internet.
- Las pruebas encuentran solas cada archivo y cada categoría nueva. El validador avisa si un archivo de categoría no
  está en el índice, en `juegos.json` o en el service worker.
- Lo ya visto y descartado en el celular se conserva (los ids de las preguntas no cambian).

## Parte 2: preguntas de cuatro opciones (decisión de John)

- Categoría nueva **🔠 Cuatro opciones**: la tarjeta muestra la pregunta y **4 posibles respuestas (A, B, C, D)**.
  **Nada más**: sin puntos, sin botón de revelar. Cada grupo decide cómo contesta.
- Las opciones salen barajadas, pero siempre en el mismo orden para la misma pregunta (también con "pregunta anterior").
- En los datos: `{ "q": "Diga algo que se lleva a la playa.", "opciones": ["bloqueador", "vestido de baño", "toalla", "gafas de sol"] }`.
  Las pruebas validan que sean exactamente 4, cortas y distintas.
- Se descartó la versión con puntos 40/30/20/10 y "Revelar respuestas" del primer borrador.

## Sobre "buscar más bancos"

Revisé los enlaces y otras fuentes ("100 colombianos dicen", *Family Feud*, *Herd Mentality*). Todos usan el mismo
formato: la pregunta y las respuestas más populares de una encuesta a 100 personas. **No copio preguntas ni respuestas
de esos programas o listas**: son contenido de otros. Las preguntas de Musa son **originales y con sabor colombiano**,
y las 4 respuestas son **estimaciones** de lo que más diría la gente, no una encuesta real. La ficha lo aclara.

## Fuera de alcance

- Marcador de puntos o de vacas dentro de la app (sigue siendo una posible spec aparte).
- Encuestas reales hechas por nosotros.

## Preguntas para John

1. ¿Revisas las 100 preguntas de cuatro opciones y me dices cuáles cambiar?

## Cómo sabremos que está lista

- [x] El banco vive en `preguntas/indice.json` + un archivo por categoría; agregar una categoría no toca código.
- [x] Lo visto y descartado se conserva después del cambio (los ids salen del texto, que no cambió).
- [x] La categoría 🔠 aparece y se filtra como las demás.
- [x] Una pregunta de cuatro opciones muestra la pregunta y las 4 opciones; "anterior" las muestra en el mismo orden.
- [x] Funciona sin Internet, de pie, acostado y en 320 px.
- [x] `npm test` y `npm run validar` sin errores; las pruebas encuentran archivos nuevos solas y fallan si uno queda fuera del índice.
- [x] Revisado contra la [decisión 0005](../decisiones/0005-buenas-practicas.md).
- [ ] John lo prueba en el celular → Completada.
