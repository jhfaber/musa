# Specs de Musa

Musa es el repo de los **juegos de mesa y otros juegos** de John. Todo lo que se construye aquí pasa por SDD
(Spec-Driven Development): primero se escribe qué se quiere y por qué, John lo aprueba, y solo después se programa.

## El flujo

```
idea → spec.md (Borrador) → John aprueba → plan.md + tasks.md → implementar → verificar → Completada
```

1. **Spec** (`spec.md`): qué se quiere y por qué, desde el punto de vista del jugador. Sin código.
2. **Aprobación**: John la aprueba de forma explícita y queda escrita en la cabecera de la spec (fecha y cita
   corta de lo que dijo). Sin esa línea, la spec sigue en Borrador y no se toca el código.
3. **Plan** (`plan.md`): cómo se va a hacer (archivos, datos, decisiones técnicas).
4. **Tareas** (`tasks.md`): pasos pequeños con casillas `[ ]` / `[x]`. Se marcan al terminar cada una.
5. **Verificar**: pruebas y revisión a tamaño celular antes de dar la spec por completada.
6. **Cerrar**: estado `Completada` aquí y en la spec, y al final de `tasks.md` queda anotado cómo se verificó.

## ¿Cuándo hace falta una spec?

| Cambio | ¿Spec? |
|---|---|
| Juego nuevo, funcionalidad nueva, cambio de reglas del juego, cambio visible para el jugador | **Sí** |
| Cambio de estructura o de arquitectura que afecta a varios juegos | **Sí** |
| Cambio en lo que se publica o en cómo se publica | **Sí** |
| Corregir un error sin cambiar lo acordado, ajustar un texto, subir la versión del service worker | No (basta el commit) |
| Una decisión que no cambia código pero condiciona el futuro (herramienta, formato, regla de la casa) | No spec: va en [decisiones](decisiones/README.md) |

En duda, se pregunta a John: es más barato que rehacer.

## Numeración y nombres

- Carpeta `NNN-<tema>`, con número correlativo que **nunca se reutiliza**: `013-...`, `014-...`.
- Si la spec es de un juego, el nombre empieza por el juego: `013-catan-ayudante`, `014-risk-eventos`.
- Si es de todo el repo, va sin prefijo de juego: `013-sonidos-compartidos`.
- Una spec que se abandona no se borra: pasa a `Descartada` con una línea que diga por qué.

## Estados

`Borrador` → `Aprobada` → `En curso` → `Completada` · o `Descartada` · o `Reemplazada por NNN`.

Una spec `Completada` no se reescribe: si algo cambia después, se hace una spec nueva que dice
`Depende de` o `Reemplaza a` la anterior. Así la historia queda legible.

## Plantillas

En [`_plantillas/`](_plantillas/): `spec.md`, `plan.md` y `tasks.md`. Se copian a la carpeta nueva y se rellenan.

## Decisiones

Lo que se decide sin ser una funcionalidad (qué herramienta, qué formato, qué regla de la casa) se registra en
[`decisiones/`](decisiones/README.md), una por archivo, con su motivo.

## Índice de specs

| Spec | Título | Estado |
|---|---|---|
| [001](001-dixit/spec.md) | Musa: ayudante de Dixit en el celular (categorías y lentes por nivel) | En curso |
| [002](002-favoritos/spec.md) | Favoritos en Dixit: marcar rondas buenas y volver a jugarlas | Completada |
| [003](003-reloj-ajustes/spec.md) | Reloj para pensar la pista y menú de ajustes ⚙ | En curso |
| [004](004-estructura-por-juego/spec.md) | Estructura por juego y sistema visual compartido | En curso |
| [005](005-risk/spec.md) | Ayudante de Risk Relámpago: turnos, tropas por continente y escuela de dados | En curso (fase 1, mapa normal) |
| [006](006-risk-arquitectura/spec.md) | Risk por dentro: código ordenado, correcciones y mapas personalizados | En curso |
| [007](007-risk-facciones/spec.md) | Facciones de Risk: escudo, imagen y color de cada ejército | En curso |
| [008](008-catalogo-de-juegos/spec.md) | Catálogo de juegos: lista en la portada, dado al azar y reglas al punto | En curso |
| [009](009-mente-vacuna-preguntas/spec.md) | Mente Vacuna: banco de preguntas y minijuego de preguntas | En curso |
| [010](010-mente-vacuna-encuestas/spec.md) | Mente Vacuna: banco en varios archivos y preguntas de cuatro opciones | En curso |
| [011](011-categorias-de-juegos/spec.md) | Categorías de juegos en la portada | En curso |
| [012](012-juegos-all-afters/spec.md) | Juegos de All-afters | En curso |
| [013](013-portada-fondo-legible/spec.md) | Fondo de la portada más legible | En curso |
| [014](014-mente-vacuna-posiciones-fantasias/spec.md) | Mente Vacuna: Posiciones y Fantasías | En curso |
| [015](015-mente-vacuna-filosoficas/spec.md) | Mente Vacuna: preguntas filosóficas y más miedos | En curso |
| [016](016-mente-vacuna-sin-filtro-18/spec.md) | Mente Vacuna: sin activación +18 | En curso |
| [017](017-mente-vacuna-cuerpo-pareja-misterios/spec.md) | Mente Vacuna: cuerpo, En pareja, Misterios y más Filosóficas | En curso |
| [018](018-mente-vacuna-del-grupo-ampliado/spec.md) | Mente Vacuna: ampliar Del grupo | En curso |
| [019](019-mente-vacuna-datos-locos-ampliado/spec.md) | Mente Vacuna: ampliar Datos locos | En curso |
| [020](020-mente-vacuna-cuatro-categorias/spec.md) | Mente Vacuna: Dilemas, Redes y citas, Plata y Familia | En curso |
| [021](021-mente-vacuna-opciones-equilibradas/spec.md) | Mente Vacuna: opciones de peso parecido (3 o 4) | En curso |

Próxima spec: **022**.

Historia: la spec 005 nació como la 006 del proyecto Casa Inteligente y se movió aquí el 26-oct-2026.
