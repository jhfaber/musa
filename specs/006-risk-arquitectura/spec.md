# 006 — Risk por dentro: código ordenado, correcciones y mapas personalizados

- **Estado:** Aprobada por John (27-oct-2026, en el chat: "organiza ese código… teniendo algún patrón de diseño…
  incluyelo en specs como algo técnico, permite incluir continentes custom") — en curso
- **Depende de:** [005 — Risk Relámpago](../005-risk/spec.md)
- **Tipo:** técnica (cómo está hecho) + una funcionalidad (mapas y continentes propios)

## Problemas encontrados en la versión inicial

1. **La partida avanzaba sola sin fin.** Se acaba el tiempo → pasa al siguiente → la cuenta de 10 s arranca
   su reloj → se acaba → … Con el celular quieto los turnos siguen corriendo y la bola de nieve crece
   (Azul con Asia llegó a reclamar 56 = 7 + 7×7).
2. **"Nueva partida" no se encontraba o no respondía**: estaba al final del menú ⚙ y usaba la ventana
   `confirm()` del navegador, que algunos celulares/apps instaladas bloquean.
3. **Un solo archivo de 1.140 líneas** donde se mezclan reglas, tiempos, guardado y dibujo: difícil saber qué
   pasa y fácil romper algo al cambiar otra cosa.
4. Los relojes vivían en memoria aparte de la partida: al reiniciar o recargar podían quedar "vivos" o
   desincronizados.

## Diseño: flujo en una sola dirección (estado → acción → reglas → nuevo estado → pantalla)

Mismo patrón que Redux/Elm, sin librerías:

```
 toque en la pantalla ──► acción {tipo: 'siguienteTurno'}
                              │
                     almacen.despachar(acción)
                              │
          reglas.aplicar(partida, acción, ajustes, ahora)   ← funciones puras: sin DOM, sin Date.now()
                              │
                     nueva partida (se guarda)
                              │
              vistas.pintar(partida)  +  efectos (campanita, vibración)
```

- **La partida es solo datos** (incluidos los relojes: `terminaEn`, `restante`, `estado`). Reiniciar = cambiar
  los datos; no hay temporizadores escondidos que sigan corriendo.
- **Un único "latido"** (cada 200 ms) pregunta a las reglas si venció algún tiempo; si sí, despacha
  `{tipo: 'tiempo'}`. Las vistas solo redibujan el número del reloj.
- **Las reglas no saben de pantallas** y las pantallas no cambian la partida: solo despachan acciones.

### Archivos (`juegos/risk/`, módulos ES)

| Archivo | Qué hace |
|---|---|
| `risk.js` | Entrada: registra el juego en Musa, crea el almacén, el latido y conecta las vistas. |
| `logica/reglas.js` | **Puro.** Crear partida, turnos y rondas, bola de nieve, tiempos, ausentes, cartas, deshacer, fin. |
| `logica/dados.js` | **Puro.** Dado al azar, resolver una tirada, probabilidades exactas, dados según fichas. |
| `logica/mapas.js` | **Puro.** Mapa normal, mapas propios, validar y migrar ajustes. |
| `almacen.js` | Guarda/carga la partida y los ajustes, `despachar`, avisa a quien escucha. |
| `efectos.js` | Sonidos y vibración según lo que cambió (fin del tiempo, cuenta regresiva). |
| `vistas/*.js` | Una por pantalla o panel: `preparar`, `tablero`, `cuenta`, `fin`, `equipo`, `escuela`, `juez`, `ajustes`, y `piezas` (dados, mesa, etc.). Devuelven HTML y declaran sus botones con `data-accion`. |
| `risk.css` | Estilos (tema rojo brasa). |

Pruebas: `node herramientas/probar-risk.mjs` prueba las reglas y los dados sin navegador.

## Correcciones de comportamiento

- **El tiempo nunca se detiene solo** (decisión de John, 27-oct-2026): en su lugar hay un botón **⏸ Pausa** siempre
  visible junto a *Siguiente →*. (Si el celular se deja quieto, la partida sigue avanzando: es lo esperado.)
- **Nueva partida** visible en el tablero y en ⚙, con confirmación dentro de la app (tocar dos veces),
  sin `confirm()`.
- Paneles de Risk (escuela, juez, ajustes, equipo) **a pantalla completa** con un botón **Cerrar** grande
  fijo abajo. La escuela enseña **paso a paso** (una lección por pantalla, Anterior / Siguiente).

## Mapas y continentes personalizados

- En ⚙ → **Mapa y continentes**: el **Mapa normal** (los 6 clásicos, bonos editables) y los mapas propios.
- **＋ Nuevo mapa**: nombre y su lista de continentes; cada continente con nombre, símbolo (emoji) y bono.
  Se agregan, editan y quitan. Un mapa propio se puede borrar.
- La partida usa el mapa elegido al empezar; los bonos editados se aplican en el siguiente reclamo.
- Se guarda dentro de `musa.risk.ajustes.v1` (los ajustes viejos con `bonos` se pasan al mapa normal).
- Así, más adelante, el mapa del Señor de los Anillos puede ser simplemente otro mapa.

## Equipos que se van y vuelven (pedido el 27-oct-2026)

- **💤 Se fue** en la carta del turno (o desde la cuenta regresiva, o en su panel): si es su turno, ese turno se
  deshace, queda debiéndolo y juega el próximo de la lista.
- **↩ Volvió** en su fila: si se saltó su turno en esta ronda, lo juega **justo después del equipo que está
  jugando**; si ya pasó una ronda entera sin él, pierde ese turno y sigue en su lugar de siempre.
- La lista de equipos muestra el **orden de los turnos** (Juega ahora, Sigue, 3.º…, "recupera su turno") y abajo
  los ausentes con su botón ↩ Volvió.
- El poder TIEMPO (+1:00) **no se usa** en estas partidas: se quitó.

## Simulador más claro (pedido el 27-oct-2026)

Cada pareja es un **duelo en su propia fila**: 1.º, 2.º, 3.º, con el dado del atacante a la izquierda, el del
defensor a la derecha y en el medio la comparación (*6 > 5 · Gana ataque*, *4 = 4 · Empate: defensa*). El dado
que pierde se apaga; el que no tiene pareja dice "no cuenta".

Sin la opción "defensor ausente" (no tiene sentido en el simulador). Una flecha **mayor → menor** junto a las filas
(1.º más alto … 3.º más bajo) y, tras tirar al azar, la línea *"Así cayeron: 2 3 4 contra 6 3 → ordenados de mayor a menor"*.

## Tarjeta del turno con el estilo del simulador (pedido el 27-oct-2026)

Paño verde con borde dorado, tropas en un círculo dorado y cada fuente de tropas como una fila oscura
(símbolo · qué es · +tropas), igual que los duelos del simulador.

## Simplificaciones pedidas por John (27-oct-2026)

- **Un solo reloj por turno** (2:15 por defecto): sin turno Tutorial ni fases de ataques/reubicar.
- **Tropas del turno = tropas configuradas + continentes (× turnos que se sostienen) + cartas vendidas.** Se quitaron
  las 30 unidades "al pasar a modo Normal" (hacían que un equipo reclamara 47).
- Sin "territorios conquistados" ni cartas a reclamar en la tarjeta ni en la cuenta regresiva.
- La tarjeta del turno toma **el color del equipo con el resplandor** de la cuenta regresiva.
- En la **cuenta regresiva entre turnos**: botón **+20 s al equipo anterior** (vuelve a su turno con 20 segundos para
  reubicar o si algo pasó; al acabarse sigue la cuenta del siguiente).

- Debajo de *Siguiente →* (y en la cuenta regresiva, "Después juegan") se ve **la cola completa de turnos**:
  quién juega, quién sigue, 3.º, 4.º… (con "recupera su turno") y al final los ausentes.
- **Vender cartas** ya no es un botón: es una sección fija de la tarjeta con su título, una breve explicación y
  las 9 opciones de estrellas → tropas.

- En la cola de turnos (y al final) cada equipo muestra **turnos jugados · tropas reclamadas** en la partida.
  Un turno cuenta al terminar; ↶, +20 s y "se fue" no lo cuentan de más.

- La **cola de turnos es también la lista de equipos**: cada fila se toca para darle o quitarle continentes (o
  marcarlo ausente) y muestra su estado, turnos y tropas de la partida, sus continentes ×n y **las tropas que
  reclama/reclamará** en su turno. Se quitó la lista aparte de equipos.

- **Colores de la pantalla**: el rojo brasa se cambió por un fondo oscuro neutro que toma **un matiz del color del
  equipo en turno** (azul, verde, amarillo…); sin partida queda gris azulado.

- **↶** vuelve al turno anterior (deshacer). Al final del tablero: **🏁 Finalizar partida** (va a la pantalla final
  aunque falten rondas; ↶ regresa) y **✦ Nueva partida**, ambos como botones visibles con confirmación de doble toque.
- Corregido: en la cola un equipo que recuperaba su turno salía dos veces y dejaba fuera a otro; ahora cada equipo sale una vez.

## Ganadores y cómo ganar (pedido el 27-oct-2026)

- La app no sabe quién ganó (depende de territorios y continentes en el tablero). En la pantalla final, **¿Quién
  ganó?**: se toca el equipo y aparece "¡Ganó el Equipo X!"; tocar otro lo corrige.
- **Registro 🏆 Ganadores** (botón en la barra y en la pantalla final): los últimos **10** con fecha, rondas, rivales,
  **tropas reclamadas y turnos** del ganador y **los continentes que tenía al final**; cada uno se borra con doble toque. Se guarda aparte: `musa.risk.ganadores.v1` ("Nueva partida" no lo borra).
- **Escuela → 🏆 Cómo ganar**: 1 punto por territorio + los puntos de cada continente completo (los mismos que da en
  tropas), y una calculadora para sumarlo. Gana quien sume más, no quien reclamó más tropas.

- **Nada configurable va escrito a mano en los textos**: tropas por turno, tiempo del turno, segundos de la cuenta,
  tiempo extra, rondas y valor de cada continente salen siempre de ⚙ (lecciones, ejemplos, botones). El tiempo extra
  al equipo anterior es ahora un ajuste (20 s por defecto). Los porcentajes se calculan. Las reglas fijas del juego
  (dados, unidades, cartas por territorio) se quedan como texto.

- **Cartas por conquista**: 1 por territorio conquistado hasta un máximo que se configura en ⚙ (5 por defecto,
  según las reglas que acuerde la mesa); la escuela lo explica con una tabla que sale de ese ajuste.

- **Escuela → ⚡ Poderes**: Doble/Triple Filo (coste: Doble 1 unidad, Triple 2 unidades, cada baja ×2/×3 para ambos lados, no se desactiva
  en el turno, equidad de pérdidas; ejemplo con ×1/×2/×3) y Alianza entre facciones (pozo de cartas como garantía).
  Confirmado por John (cambió de parecer): Doble cuesta 1 unidad y Triple 2, sacrificadas al declararlo. El ejemplo
  muestra tres tiradas (gana el atacante, uno y uno, gana el defensor) con las pérdidas de cada lado.

- **Poder del Líder** (pedido por John): se compra con unidades (⚙: 10 por defecto) y cada equipo tiene hasta
  ⚙ (2 por defecto) líderes; suma +1 al dado más alto **solo al atacar desde el territorio donde está**; se pierde si
  le conquistan ese territorio. La escuela lo explica con un ejemplo (5-3 contra 5-4, sin y con líder).

- **Cuenta regresiva en celulares pequeños**: ya no se corta arriba (si no cabe, empieza arriba y se baja).
- **Aviso al marcar un equipo ausente** (💤 Se fue, su panel o la cuenta): ventana con qué hacer si lo atacan
  (otro tira por él o defiende con 4 y 2) y cómo vuelve.

## Venta de cartas (tabla del reglamento, pedida el 27-oct-2026)

| ★ estrellas | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|
| Tropas | 2 | 4 | 7 | 10 | 13 | 17 | 21 | 25 | 30 |

En la carta del turno: **Vender cartas ★** con las estrellas que entrega el equipo; las tropas se suman a lo
que reclama y aparecen en el desglose. La tabla también está en la escuela.

## Cambios pedidos durante la construcción (27-oct-2026)

- Los dados se ven en **3D** (cubos que giran al tirarlos).
- El juez y "lanzar dados" son un solo **Simulador** 🎲: se toca cada dado para cambiar su número y se ve al
  instante quién gana; botón **Aleatorio** para tirar; opción de defensor ausente (4 y 2).
- Al final **no** se anotan territorios ni regiones: celebración con fuegos artificiales y estrellas.
- "Conquistó continente" y "Vender cartas" son botones (como el del reloj), no enlaces.

## Verificación (27-oct-2026)

- ✅ `node herramientas/probar-risk.mjs`: 16 pruebas (bola de nieve, venta de cartas, tutorial, sin actividad
  pausa, se va y vuelve, ausentes, deshacer, fin, nueva partida, mapa propio, migración, dados, probabilidades).
- ✅ En el navegador a tamaño celular: empezar, conquistar Asia + vender 5★ = 24 tropas; simulador 3D con
  aleatorio, tocar dados y ausente 4 y 2; escuela paso a paso; fin con fuegos artificiales; "Nueva partida"
  con doble toque vuelve a preparar y la nueva empieza limpia; Dixit sigue igual.
- Archivos de Risk: el más largo es `logica/reglas.js` (≈310 líneas); el resto, menos de 200.
- Pendiente: probar en el celular de verdad (sonido, vibración, fuegos con el celular en movimiento normal).

## Criterios de aceptación

1. Pruebas en Node pasan: bola de nieve 14 → 51 → 28, ausente se salta, fin tras las rondas, deshacer,
   nueva partida, tiempo sin actividad deja la cuenta en pausa, 3 contra 2 = 2890 / 2611 / 2275 de 7776.
2. Dejando el celular quieto, la partida avanza a lo sumo un turno y se queda esperando.
3. "Nueva partida" desde el tablero vuelve a la preparación, y una partida nueva empieza en Ronda 1 sin continentes.
4. Creo un mapa "Mi mapa" con "Gondor" (bono 4): en la partida, al conquistarlo el equipo reclama +4.
5. Escuela y juez ocupan toda la pantalla y se cierran con el botón de abajo.
6. Vender 5 estrellas suma 10 tropas al reclamo del turno.
7. Ningún archivo de Risk pasa de ~300 líneas.
