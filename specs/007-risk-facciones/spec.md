# 007 — Facciones de Risk: escudo, imagen y color de cada ejército

- **Estado:** Aprobada por John (27-oct-2026, en el chat: "Apruebo la spec 007, las imágenes son mías y se pueden publicar. Impleméntala.") — en curso
- **Depende de:** [005 — Risk Relámpago](../005-risk/spec.md), [006 — Arquitectura](../006-risk-arquitectura/spec.md)
- **PoC:** [poc/emblemas-risk.html](../../poc/emblemas-risk.html) (visto y aprobado como dirección visual por John,
  27-oct-2026: "se ve bastante bien, agrega esto al diseño… prefiero el escudo dibujado pero deja la opción en
  setting para el emoji")

## Objetivo

Que cada equipo se reconozca de un vistazo por algo más que el color: un **bando** (guerreros, orcos,
arqueros…) con su **escudo dibujado** y una **imagen de fondo** propia, teñida siempre con el color del equipo.

## Qué cambia para el jugador

1. **Cada color trae su bando** (fijo, como en el PoC):

   | Color | Bando | Emoji | Imagen |
   |---|---|---|---|
   | Azul | Guerreros | ⚔️ | humano |
   | Rojo | Dragones | 🐉 | dragones |
   | Verde | Arqueros | 🏹 | elfa |
   | Amarillo | Reyes | 👑 | reyes |
   | Negro | No muertos | 💀 | no_muertos |
   | Blanco | Magos | 🧙 | maga |
   | Morado | Orcos | 👹 | orco |
   | Naranja | Jinetes | 🐎 | jinetes_gondor |
   | Rosado | Trolls | 🧌 | trolls |
   | Café | Enanos | 🪓 | henano |

   Cada bando tiene además un lema corto ("¡Más tropas!") que sale en la carta del turno.

2. **Nombre del equipo:** por defecto el del bando ("Orcos"); el color se ve en el escudo y en todo el diseño.
   Se puede seguir renombrando como hoy. Las partidas ya empezadas conservan su nombre.

3. **Dónde aparece el emblema:**
   - Carta del turno: escudo en la cabecera, imagen del bando de fondo y el lema.
   - Cuenta entre turnos (pantalla completa): escudo grande del equipo que sigue.
   - Cola de turnos, panel del equipo, preparar partida (los que no juegan se ven en gris), pantalla final
     y registro de ganadores 🏆.

4. **Imagen de fondo:** la del bando en turno, en blanco y negro mezclada con el color del equipo (así nunca
   cambia el color, solo aporta luces y sombras), semitransparente y con un velo oscuro detrás del texto
   para que se lea bien.

   Sin equipo en turno (pedido de John, 27-oct-2026): en *Nueva partida* sale la imagen de los orcos; en la
   victoria sin ganador marcado y en los menús (simulador, escuela, ganadores, ajustes) sale `todos` (todos
   los bandos juntos).

5. **En ⚙ Ajustes (nuevo apartado "Aspecto"):**
   - **Emblemas:** *Escudo dibujado* (por defecto) o *Emoji*.
   - **Imagen de fondo:** sí/no, y su intensidad (suave · media · fuerte).

## Técnico

- Datos del bando junto a cada color en `logica/reglas.js` (`COLORES`: `bando`, `emoji`, `lema`, `imagen`).
  Como el `id` de cada equipo es su color, las partidas guardadas no necesitan migración.
- Dibujos SVG y la función que pinta el emblema en un archivo nuevo `vistas/emblemas.js` (sin imágenes externas).
- Las imágenes se convierten a **.webp**, ~800 px de ancho (de ~130 KB a ~40–60 KB cada una), en
  `juegos/risk/img/`; se registran en `juegos.json` para que funcionen **sin Internet**. `img/` (originales
  .jfif) queda fuera de la app.
- Ajustes nuevos con valor por defecto en `AJUSTES_BASE` (`emblema: 'escudo'`, `fondo: 'media'`); nada fijo
  en el código (regla de la casa).
- Pruebas: cada color tiene bando, emoji, lema e imagen; los ajustes viejos se completan con los nuevos.
- `prefers-reduced-motion`: sin animaciones del emblema.

## Fuera de alcance

- Que cada equipo elija un bando distinto al de su color (posible más adelante).
- Bandos nuevos (piratas, bárbaros…) o usar `jinete_enano` (queda guardada como alternativa).
- Cambiar Dixit o el inicio de Musa.

## Para tener en cuenta

- Publicar sube las imágenes a GitHub Pages (repo público): John confirma que las imágenes son suyas
  (las creó él) y se pueden publicar.
- La app pesa ~0,5 MB más; se descarga una vez y queda guardada en el celular.
