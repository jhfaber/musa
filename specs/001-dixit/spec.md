# 001 — Ayudante de juegos de mesa en el celular (empezando por Dixit)

- **Estado:** Aprobada por John (25-oct-2026) — en curso. Nombre: **Musa**
- **Equipo:** celulares de los jugadores (Android/iPhone); el PC solo para desarrollar

## Objetivo

Una app en el celular que, al jugar juegos de mesa, dé **recomendaciones o reglas extra por ronda**.
Primer juego: **Dixit** — se pulsa un botón y la app dice **cómo dar las pistas en esta ronda**
(p. ej. "todo deben ser olores"). La ronda siguiente **continúa la idea** (olores → sabores → texturas…)
y de vez en cuando salta a otro tema (onomatopeyas, películas, canciones…).

## Alcance

- **App portátil, para llevar y usar en cualquier momento y lugar** (casa de amigos, viajes, sin wifi).
- App instalable (PWA) en Android y iPhone: se abre una vez desde un enlace/QR, se agrega a la pantalla
  de inicio y desde ahí abre como una app normal, en pantalla completa, con su ícono.
  Sin tiendas de apps, sin cuentas, **funciona 100 % sin Internet** una vez instalada (todo queda en el celular).
- Alojamiento: hosting estático gratuito (GitHub Pages o similar) solo para la instalación inicial y las
  actualizaciones. No depende del PC ni de la red de la casa.
- Opcional (fase 2): empaquetar además como APK de Android para pasarla por archivo sin necesidad de enlace.
- Pantalla de inicio con los juegos disponibles (al principio solo Dixit; preparada para añadir más).
- Modo Dixit (rediseñado con John el 26-oct-2026, a partir de la prueba en `poc/`):
  - Cada ronda propone una **categoría amplia** que inspira la pista (Sentidos, Emociones, Personajes, Música…),
    no una regla que la restrinja. Las categorías que tientan a nombrar lo que se ve llevan la marca
    "No vale lo que se ve en la carta" (p. ej. **Algo cercano**: arena → el mar).
  - Según el nivel, la categoría llega con **lentes**: pistas extra que describen la carta o modifican la
    categoría o al otro lente, **en paralelo** (no en cadena). Familias: ⏳ Tiempo, 🔄 Giro y 🔊 Sonido. Se quitaron Género (solo encajaba con dos categorías) y "Un estado de la mente" (pocos valores, solo cambiaba el tono), 26-oct-2026.
    Cada lente nombra una dimensión ("Una época") y el narrador elige el valor ("hace mil años").
  - **Niveles**: Tranquilo = solo la categoría (sin las que no funcionan solas: Animales, Naturaleza);
    Normal = categoría + 1 lente; Caótico = categoría + 2 lentes de familias distintas.
  - Reglas de combinación: no repetir familia en la ronda; cada categoría tiene su lista de lentes permitidos
    (revisada una a una con John); Animales y Naturaleza llevan siempre 2 lentes;
    (Un recuerdo de infancia no recibe "Un momento de la vida"…); Animales y Naturaleza solo usan Tiempo y Sonido;
    el lente de sonido solo va con Animales, Naturaleza y Algo cercano.
  - **Tranquilo congelado (26-oct-2026)**: Lo que te hace sentir, La película de esta carta, Algo cercano,
    Un plato con su momento, Una situación mágica e Historia: antes o después. No se modifica sin pedirlo John.
  - Categorías "Si la carta fuera…" (animal, personaje, textura, oficio; solo Normal y Caótico): su primer lente es
    siempre una 🌡️ **escala** al estilo Wavelength ("Qué tan peligrosa es", del 1 al 10, sin decir el número).
  - Las categorías no se repiten hasta pasadas 3 rondas; los lentes suelen seguir la familia del anterior.
  - Cada carta trae 5 ejemplos variados. Reto opcional: +1 por la categoría y +1 por lente usado.
  - Botones: nueva ronda, otra categoría, cambiar lentes, rondas anteriores/siguientes.
- Funciona en vertical, con texto grande legible para pasar el celular por la mesa.

## Fuera de alcance

- Publicar en Google Play / App Store.
- Usar el **logo, nombre estilizado, ilustraciones o íconos oficiales de Dixit** (son de Libellud y de
  sus ilustradores). En su lugar: estética propia "onírica" (acuarela, colores pastel, conejito/estrellas
  originales) que combine con el juego sin hacerse pasar por producto oficial. El nombre de la app será
  propio (p. ej. "Musa — rondas para Dixit"), indicando que es un acompañante no oficial.
- Exponer la casa a Internet: la página pública es solo la app (HTML/JS estático), sin conexión al PC,
  al módem ni a ningún dispositivo, y sin datos de la casa. No toca la red de la casa ni ningún dispositivo.

## Requisitos

- **R1.** HTML/CSS/JS sin dependencias de servidor; manifest + service worker para instalar y uso offline.
- **R2.** Categorías y lentes viven en `juegos/dixit/categorias.json`, fácil de editar y ampliar.
- **R3.** 12 categorías y 5 lentes en 3 familias, cada carta con descripción y 5 ejemplos; cada categoría lista sus lentes permitidos.
- **R4.** Arquitectura por juego (`juegos/<juego>/`) para añadir otros juegos sin rehacer la app.
- **R5.** Sin datos personales ni analítica.

## Criterios de aceptación

- [ ] Se instala en un Android y un iPhone desde un QR y abre en pantalla completa con su ícono.
- [ ] En modo avión, lejos de la casa, la app abre y genera rondas.
- [ ] Funciona aunque el PC de la casa esté apagado.
- [ ] En 10 rondas no se repite una categoría antes de 4 rondas; Normal trae 1 lente y Caótico 2 en todas las rondas.
- [ ] Añadir una categoría o un lente es editar solo el JSON.
- [ ] No contiene logos ni arte oficial de Dixit.

## Preguntas abiertas para John

1. ¿Nombre de la app? (propuesta: "Musa").
2. ~~¿Dónde se aloja?~~ Resuelto: portátil, hosting estático gratuito + uso offline (25-oct-2026).
3. ¿Los celulares son Android, iPhone o ambos? (decide si vale la pena la APK de la fase 2).
4. ¿Otros juegos que quieras en la lista después de Dixit?
