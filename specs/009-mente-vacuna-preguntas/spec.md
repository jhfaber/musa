# 009 — Mente Vacuna: banco de preguntas y minijuego de preguntas

- **Estado:** En curso
- **Aprobada por John:** 23-nov-2026, en el chat: "dale apruebo"
- **Depende de:** [008 — Catálogo de juegos](../008-catalogo-de-juegos/spec.md), decisiones [0002](../decisiones/0002-un-juego-una-carpeta.md) y [0005](../decisiones/0005-buenas-practicas.md)
- **Pedido por John:** 23-nov-2026, en el chat ("necesito un banco de preguntas bien grande… esto va a ser un minijuego dentro de Mente Vacuna", y "el tema visual debe ser bonito, hermoso… como una aplicación de verdad que vale mucho la pena")
- **Banco:** [juegos/mente-vacuna/preguntas.json](../../juegos/mente-vacuna/preguntas.json) (539 preguntas en 17 categorías, escritas para este proyecto)
- **PoC visual:** [poc/mente-vacuna-preguntas.html](../../poc/mente-vacuna-preguntas.html) (para que John vea la dirección visual antes de implementar)

## Objetivo

Que en Mente Vacuna nunca falten preguntas: sacar una pregunta al azar de un banco grande, por categorías, con una
pantalla tan bonita y clara que toda la mesa la vea y quiera jugar con ella.

## Cómo se juega (el juego no cambia)

Todos se sientan con papel. Se lee una pregunta, cada uno escribe su respuesta sin hablar con nadie, y al final todos
dicen la suya. Quienes coinciden con la respuesta más repetida se llevan una vaca. Esta spec solo agrega **las preguntas**.

## Qué cambia para el jugador

1. **Mente Vacuna pasa a tener dos pestañas:** **Preguntas** (nuevo, es lo primero que se ve) y **Reglas** (la ficha de
   hoy, sin cambios).
2. **Elegir categorías.** Una fila de etiquetas, con un emoji cada una, que se tocan para activar o apagar. Hay un
   botón "Todas". La pantalla dice cuántas preguntas hay con lo que está activo.
3. **Nueva pregunta.** Un botón grande, fijo abajo y al alcance del pulgar, saca una pregunta al azar de las
   categorías activas. La tarjeta aparece con una animación corta.
4. **La tarjeta** muestra la categoría (emoji y nombre), la pregunta en letra grande y una **pista** de cómo responder
   ("Escribe el nombre de una persona del grupo"). Se lee desde el otro lado de la mesa.
5. **Sin repetir.** Una pregunta no vuelve a salir hasta que se acabaron las demás de las categorías activas, aunque se
   cierre la app. Se puede **volver a barajar** cuando uno quiera. La pantalla muestra "pregunta 12 · quedan 240".
6. **Pregunta anterior.** Un botón pequeño devuelve a la pregunta de antes (por si alguien no oyó bien).
7. **Descartar.** Si una pregunta no sirve para este grupo, se descarta y no vuelve a salir.
8. **La pantalla no se apaga** mientras se juega (para que el celular quede en el centro de la mesa).

### Categorías del borrador

| | Categoría | Idea | Preguntas |
|---|---|---|---|
| 🧑 | Sobre ti | Gustos, manías y cosas tuyas, para conocerse | 30 |
| 👥 | Del grupo | "¿Quién del grupo…?": se responde con el nombre de alguien de la mesa | 34 |
| 🧠 | Cultura general | Lo que todo el mundo sabe o cree saber | 32 |
| ⚽ | Deporte | Fútbol y de todo un poco: opiniones de tribuna | 30 |
| 🤯 | Datos locos | Rarezas, números y ocurrencias | 31 |
| 🔎 | Deducción | "Piensa lo que respondería la mayoría" | 30 |
| 🍕 | Comida y bebida | Sabores, antojos y platos | 32 |
| 🎬 | Cine y música | Películas, series, artistas y canciones | 30 |
| 😱 | Miedos y manías | Lo que asusta, molesta y repetimos | 30 |
| ✈️ | Viajes y lugares | Destinos, maletas y escapadas | 30 |
| 🔥 | Picantes | Para adultos, con humor y sin pasarse. **Arranca apagada** y pide confirmar que son mayores de 18 al activarla | 30 |

Total: **339 preguntas**. Son originales (escritas para Musa) y de un tipo que funciona con el juego: respuestas
cortas y en las que la gente tiende a coincidir. Se pueden agregar más después sin tocar código.

## Cambios pedidos por John (23-nov-2026, después de probarlo)

- "Si quito todas las categorías, ¿qué queda?": ahora **se pueden quitar todas**; la tarjeta dice "Elige al menos una
  categoría" y no sale ninguna pregunta. El botón cambia entre **✨ Todas** y **✕ Quitar todas**.
- "Me da la sensación de que no filtra bien": el filtro sí funcionaba (309 − 96 = 213), pero no se notaba. Ahora cada
  categoría muestra cuántas preguntas tiene, la cuenta dice "413 preguntas en 13 categorías", y si apagas la categoría
  de la pregunta en pantalla, sale enseguida una de las que quedan.
- "Más preguntas con más categorías": +10 en Deporte y +10 en Viajes, y 6 categorías nuevas de 30: 🧸 Infancia,
  🇨🇴 Colombia, 🐾 Animales y naturaleza, 📱 Tecnología e internet, 💼 Trabajo y estudio, 🎉 Fiestas y celebraciones.
  Total: **539 preguntas en 17 categorías** (509 sin Picantes).
- "Elimina las elecciones muy comunes, por ejemplo el celular": 80 preguntas traen **respuestas prohibidas por
  obvias** (🚫 No vale: celular). En el banco una pregunta puede ser `{ "q": "…", "no": ["celular"] }`; la regla
  quedó en la pestaña Reglas: esa respuesta no cuenta. Las pruebas validan que sean de 1 a 3, cortas y sin repetir.

## Cambios pedidos por John (23-nov-2026, más tarde)

- **Picantes**: +37 preguntas de relaciones polémicas (conocer a alguien y salir con otros, cuánto esperar tras terminar,
  ex, celos, infidelidad, contraseñas…), muchas con 4 opciones. Total: 67.
- **Sin filtro +18**: la app es para adultos. Picantes ya no pide confirmación, entra en "Todas" y arranca prendida.
- **Contador que baja**: "Quedan 60 de 67" baja 1 con cada pregunta nueva.
- **Sin repetidas**: cuando salen todas, la tarjeta lo dice y no repite ninguna hasta tocar **↺ Reiniciar**
  (botón siempre a la vista debajo de la tarjeta). Antes se volvía a barajar sola.
- Total del banco: **676 preguntas en 18 categorías**.

## Cómo debe verse (requisito de John)

Que se sienta una **app de verdad**, hermosa y práctica, no una lista de texto:

- Mismo universo visual de Musa: noche violeta, dorado y estrellas, con una **tarjeta grande de papel** como las de Dixit.
- Cada categoría tiene su **color de acento y su emoji**, que tiñen suavemente la tarjeta y el brillo del fondo.
- Letra grande y con mucho contraste, pensada para leerla **a un metro de distancia**.
- Animación corta al sacar la pregunta (la tarjeta gira o se desliza) y una vibración suave en el celular.
- Controles al alcance del pulgar: el botón principal grande y fijo abajo; todo se maneja con una mano.
- Respeta a quien pide menos movimiento (`prefers-reduced-motion`) y se ve bien de pie y acostado.
- Antes de implementar, John ve el **PoC visual** y dice si la dirección le gusta.

## Técnico (lo justo)

- Las preguntas viven en un archivo de datos (`juegos/mente-vacuna/preguntas.json`), no en el código: se agregan más
  sin programar (decisión 0005, *data-driven*).
- Qué se guarda en el celular: las preguntas ya vistas o descartadas y las categorías activas, con claves
  `musa.mente-vacuna.…`.
- Mente Vacuna pasa de "solo reglas" a juego con ayudante: lleva su propio JS, y la pestaña **Reglas** reutiliza el
  visor de la spec 008.
- La lógica de "sacar sin repetir" va separada de la pantalla y se prueba sin navegador.
- **Pruebas que escalan** (`pruebas/*.test.mjs`, se corren con `node --test pruebas/banco.test.mjs`, sin instalar nada):
  - Descubren solas todos los bancos (`juegos/*/preguntas.json`): un banco nuevo queda probado sin escribir nada.
  - Cada regla es una fila de una tabla: agregar una regla = agregar una fila.
  - Reglas que atrapan problemas reales: estructura completa, mínimo de preguntas por categoría, **repetidas o casi
    iguales** (ignora tildes, mayúsculas y signos, también entre categorías), largo máximo para leerse de un vistazo,
    formato (mayúscula inicial, cierre), y preguntas de examen con respuesta única, que no sirven en un juego donde
    gana la coincidencia.
  - Se comprobó con un banco dañado a propósito que las pruebas fallan cuando deben.
  - Para la lógica de "sin repetir": pruebas con azar inyectado (determinista) que verifican que nunca repite hasta
    agotar, que respeta las categorías activas, que vuelve a barajar y que descartar es permanente.
- Todo funciona sin Internet.

## Fuera de alcance (por ahora)

- **Marcador de vacas** (contar vacas por jugador y la vaca rosa): es una buena fase 2, pero es otra spec.
- Reloj para escribir la respuesta (se puede reutilizar el de Dixit más adelante).
- Que los jugadores escriban sus propias preguntas desde la app.
- Dificultad fácil/media/difícil: John pidió categorías, no niveles.

## Para tener en cuenta

- Las preguntas de **Deporte** y **Cultura general** buscan respuestas en las que la mesa tiende a coincidir, no
  exámenes de memoria: ninguna tiene una respuesta única que haya que verificar.
- La categoría **Picantes** es solo para mayores de 18 y se activa a propósito.
- Las preguntas de **Del grupo** funcionan mejor cuando hay entre 4 y 20 personas que se conocen.

## Preguntas para John

1. ¿Te gusta la dirección visual del PoC? ¿Qué cambiarías?
2. ¿Quitas, cambias o agregas alguna categoría? (por ejemplo, una de familia, una de trabajo o una de infancia)
3. ¿Hacemos el **marcador de vacas** como fase 2?
4. ¿Revisas el banco y me dices qué preguntas sobran?

## Cómo sabremos que está lista

- [ ] Mente Vacuna abre en **Preguntas** y tiene la pestaña **Reglas** con la ficha de hoy.
- [ ] Se pueden activar y apagar categorías (también todas), y "Todas / Quitar todas" funciona; Picantes arranca apagada y pide confirmación.
- [ ] "Nueva pregunta" saca una pregunta al azar de las categorías activas, sin repetir hasta agotarlas.
- [ ] Pregunta anterior, descartar y volver a barajar funcionan, y lo visto se recuerda al cerrar la app.
- [ ] La pantalla se ve bien en celular de pie y acostado, y la pregunta se lee desde lejos.
- [ ] La pantalla no se apaga mientras se juega.
- [ ] Funciona sin Internet.
- [ ] `node herramientas/validar-juegos.mjs` y `node --test pruebas/` sin errores; la lógica de "sin repetir" probada sin navegador.
- [ ] Revisado contra las buenas prácticas de la [decisión 0005](../decisiones/0005-buenas-practicas.md).
