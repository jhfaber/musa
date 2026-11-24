# 012 — Juegos de All-afters

- **Estado:** En curso
- **Pedido y aprobado por John:** 23-nov-2026, en el chat, con el detalle completo de cada juego ("Ahora agrega estos
  juegos, estos van a tener categoría all-afters… son juegos que solo me sirven a mí para los eventos que hago").
- **Depende de:** [008](../008-catalogo-de-juegos/spec.md) (fichas de reglas) y [011](../011-categorias-de-juegos/spec.md) (categorías)

## Qué se agrega

- Categoría nueva **🪩 All-afters** en `juegos/juegos.json`.
- 20 juegos, cada uno con su ficha (`juegos/<id>/reglas.json`, "Para empezar" y "Reglamento"):
  Triqui con botellas, Musicólogo, Torre de vasos, Salta triqui, Llena la bomba, Sopla la bomba, Serpentinas,
  Tortazos, Beer pong, Pura mierda, Charadas con palabras random, Contacto, Café o tinto, Palabra entremetida,
  Pregunta consignada, Conteo perfecto, Simón dice (al revés), ¿Quién es más probable que…?, ¿Quién soy yo?, Línea mortal.
- Todos van en **All-afters**. Con una segunda categoría (pedido de John): **¿Quién soy yo?** y **Contacto** también en
  🎉 Party; **Café o tinto** también en 🕵️ Deducción y engaño.
- Pie de la ficha configurable (`"pie"` en `reglas.json`): estos dicen "Reglas de la casa para los eventos de All-afters"
  en vez de "manual de la caja".

## Agregados después (pedidos por John en el chat, 23-nov-2026)

- **Cacho** (🎲, en 🕵️ Deducción y engaño y 🎉 Party): dados y mentiras, con las reglas de John: apuesta o "¡dudo!",
  unos como comodín, ronda de un solo dado, bajar a unos (÷ 2 + 1) y salir de los unos (× 2 + 1, opcional).
- **Uno Normal**: tres secciones de **reglas locas** al final del Reglamento: básicas, según la carta y la carta
  🦖 Velociraptor (dinosaurio).

- **Minijuegos** (🃏, en 🪩 All-afters y 🎉 Party): con una baraja de póker o de UNO, cada carta activa un minijuego
  (1–9, +2, +4, Prohibido) y hay 5 minijuegos sin número que se eligen con la K, el comodín o el retorno.
- **Pura mierda** ya no está pendiente: John explicó el final ("si no podés, perdiste; si sí, el otro pierde").

- **All-afters va aparte** (pedido de John: "los juegos que salen solo en all-afters no aparecerán en todos"): la
  categoría tiene `"aparte": true`. Sus juegos exclusivos no salen en **📚 Todos los juegos** ni en **Todas** del dado;
  sí al abrir 🪩 All-afters, al marcarla en el dado o al buscarlos. Los que también tienen otra categoría (Contacto,
  ¿Quién soy yo?, Café o tinto, Minijuegos) sí salen en Todos.

## Por confirmar con John

- **Musicólogo**: no venía la descripción; quedó la forma más común (adivinar la canción).
- **Minijuegos**: qué cartas activan los 5 minijuegos sin número (quedó: K, comodín o retorno → se elige uno).

## Cómo sabremos que está lista

- [x] La categoría 🪩 All-afters aparece en la portada con sus 20 juegos; las 20 fichas abren.
- [x] Contacto y ¿Quién soy yo? salen también en Party; Café o tinto en Deducción.
- [x] `npm test` (incluye el dado con las 64 combinaciones de categorías) y `npm run validar` sin errores.
- [ ] John confirma Musicólogo y las cartas de Minijuegos → Completada.
