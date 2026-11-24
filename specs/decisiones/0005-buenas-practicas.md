# 0005 — Buenas prácticas y patrones de diseño de Musa

- **Estado:** Vigente
- **Fecha:** 23-nov-2026
- **Decidió:** John (en el chat: "vamos a utilizar buenas prácticas… SOLID, todas las buenas prácticas que sean necesarias implementar con nombre propio")
- **Relacionada con:** [0001](0001-pwa-estatica-sin-red.md), [0002](0002-un-juego-una-carpeta.md), spec [006](../006-risk-arquitectura/spec.md), spec [008](../008-catalogo-de-juegos/spec.md)

## Contexto

Musa va a crecer de 2 juegos a muchos, con minijuegos dentro de algunos. Sin una forma común de ordenar el código,
cada juego nuevo lo vuelve más difícil de tocar. Musa es JavaScript sencillo (sin framework ni clases obligatorias),
así que las prácticas se aplican con **módulos y funciones**, no se fuerza una estructura de objetos que no hace falta.

## Decisión

Todo código nuevo de Musa sigue estas prácticas. Cada una dice **dónde se ve** en el repo, para poder comprobarlo.

### Principios SOLID
| Principio | Cómo se aplica en Musa | Dónde se ve |
|---|---|---|
| **S** — Responsabilidad única | Un módulo, un trabajo. La navegación, el visor de reglas y el dado son archivos distintos. Las reglas de un juego no saben pintar y las vistas no cambian la partida. | `comun/app.js`, `comun/reglas.js`, `comun/azar.js`; Risk: `logica/` y `vistas/` |
| **O** — Abierto/Cerrado | Agregar un juego se hace **sumando** (una carpeta y una línea en `juegos.json`), no editando el código de los demás. | spec 008: un juego de reglas es solo `reglas.json` |
| **L** — Sustitución de Liskov | Todo juego cumple el mismo contrato (`id`, `nombre`, `simbolo`, `descripcion`, `abrir(contenedor, accion)`), y la portada o el dado funcionan igual con cualquiera. | `Musa.registrar(...)` |
| **I** — Segregación de interfaces | Cada pieza pide solo lo que usa: el dado solo necesita `id`, `nombre` y `simbolo`; el visor solo lee `reglas.json`. | `comun/azar.js`, `comun/reglas.js` |
| **D** — Inversión de dependencias | Lo general depende de un contrato, no de juegos concretos. El dado **recibe** la lista por parámetro. Lo que cambia (el reloj, el azar) se **inyecta** en las reglas para poder probarlas. | `Musa.azar.abrir(juegos)`; `logica/` sin `Date.now()` ni DOM |

### Patrones de diseño (con nombre)
| Patrón | Para qué | Dónde se ve |
|---|---|---|
| **Registry** (registro) | Los juegos se anotan en un lugar y la portada, el dado y el service worker leen de ahí. | `Musa.registrar`, `juegos/juegos.json` |
| **Strategy** (estrategia) | Cada juego decide cómo se abre y se juega (`abrir`); la portada no sabe cómo. | `abrir` de cada juego |
| **Data-driven design** (diseño guiado por datos) | Lo que es contenido va en JSON, no en código: reglas, categorías, bancos de preguntas. | `reglas.json`, `categorias.json` |
| **Module** (módulo) | Cada archivo expone una interfaz pequeña bajo `Musa.*` o como módulo ES, sin variables globales sueltas. | `Musa.reglas`, `Musa.azar`, Risk (ES) |
| **Unidirectional data flow / Reducer** (flujo en un solo sentido) | Vista → acción → función pura de reglas → guardar → pintar. | Risk (spec 006): `almacen.despachar` → `logica/reglas.js` |
| **Facade** (fachada) | Una interfaz simple sobre algo incómodo. | `Musa.leer` / `Musa.guardar` sobre `localStorage` |
| **Template** (plantilla de pantalla) | Todas las fichas de reglas comparten el mismo esqueleto; solo cambian los datos. | `comun/reglas.js` |
| **State machine** (máquina de estados) | Un juego con fases (preparar → pregunta → revelar → puntos) modela sus fases explícitas, no banderas sueltas. | Se usará en los minijuegos nuevos |

### Otras prácticas
- **Functional core, imperative shell** (núcleo funcional, cáscara imperativa): la lógica del juego son funciones puras que se prueban sin navegador; solo la capa de vistas toca el DOM.
- **DRY, KISS y YAGNI:** no se repite lo que ya existe, se prefiere lo simple, y no se construye un mecanismo general hasta que hacen falta **dos** usos reales (*regla de tres* para abstraer).
- **Separation of Concerns:** datos, lógica y vista en capas distintas.
- **Pruebas y validación automática:** la lógica pura lleva pruebas (`probar-risk.mjs`) y el catálogo se valida con `herramientas/validar-juegos.mjs`. Una spec no se cierra con la validación en rojo.
- **Fail-soft** (falla sin romperse): si algo no carga o no hay almacenamiento, la app lo dice o sigue en memoria; no se queda en blanco.
- **Offline-first y mejora progresiva:** todo archivo nuevo va en el service worker; se sube su versión al cambiar.
- **Accesibilidad:** roles y etiquetas ARIA, foco manejable, respeto a `prefers-reduced-motion`, contraste legible en celular.
- **Seguridad básica:** nada de `innerHTML` con texto que no sea nuestro sin escaparlo (`esc`).
- **Datos guardados con versión:** claves `musa.<juego>.<cosa>.vN`; si cambia la forma, se sube la versión y se migra o se descarta con cuidado.
- **Nombres claros y en español**, igual que el resto del repo; comentarios que explican el **por qué**.
- **Commits pequeños** que referencian su spec (por ejemplo, "008: visor de reglas").

## Qué no se hace

- No se agregan frameworks ni librerías para "ordenar": el sistema actual alcanza.
- No se fuerzan clases ni jerarquías solo para que "parezca" orientado a objetos.
- No se abstrae por si acaso: una cosa que existe una sola vez se queda concreta hasta que aparezca la segunda.

## Cómo se comprueba

Antes de cerrar una spec se revisa esta lista, y se anota en `tasks.md` cómo salió:

- [ ] ¿Cada módulo nuevo hace una sola cosa y cabe en una frase?
- [ ] ¿Agregar el siguiente caso (otro juego, otra categoría) se hace sumando, sin editar código ajeno?
- [ ] ¿La lógica nueva está separada de la pantalla y se puede probar sin navegador?
- [ ] ¿Los textos y datos van en JSON y no pegados en el código?
- [ ] `node herramientas/validar-juegos.mjs` sin errores.
- [ ] Archivos nuevos en el service worker, con la versión subida.
- [ ] Probado a tamaño celular y sin conexión.

## Consecuencias

- Revisar una spec incluye revisar estas prácticas; si algo no las cumple, se corrige antes de darla por completada.
- Algunos principios (SOLID) están pensados para clases; aquí se interpretan con módulos y funciones. Si una práctica no encaja con una pieza concreta, se dice en el `plan.md` con el motivo.
