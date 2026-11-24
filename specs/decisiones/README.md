# Decisiones de Musa

Aquí queda escrito **qué se decidió y por qué**, para no tener que adivinarlo (ni volver a discutirlo) meses después.
Una decisión por archivo, `NNNN-tema.md`, con número correlativo que no se reutiliza.

## ¿Qué es una decisión?

Una elección que condiciona el futuro y no es una funcionalidad: la herramienta, el formato, una regla de la casa,
una cosa que se decide **no** hacer. Las funcionalidades van en [specs](../README.md).

Si una decisión nace dentro de una spec, se registra aquí y la spec la enlaza desde su `plan.md`.

## Cómo se registra

1. Copiar [`_plantilla.md`](_plantilla.md) a `NNNN-tema.md`.
2. Rellenar contexto, decisión, motivo y consecuencias. Corto: lo que cabe en una pantalla.
3. Anotar quién decidió (John, casi siempre) y la fecha.
4. Añadir la fila al índice de abajo.

## Si cambia de idea

La decisión vieja **no se borra ni se reescribe**. Se cambia su estado a `Reemplazada por NNNN` y se escribe una nueva
que explique qué cambió.

## Índice

| # | Decisión | Estado |
|---|---|---|
| [0001](0001-pwa-estatica-sin-red.md) | Musa es una app estática que funciona sin Internet | Vigente |
| [0002](0002-un-juego-una-carpeta.md) | Un juego es una carpeta registrada en `juegos.json` | Vigente |
| [0003](0003-publicar-solo-a-pedido.md) | Publicar solo cuando John lo pida | Vigente |
| [0004](0004-repo-de-juegos.md) | Musa es el repo de todos los juegos de John, de mesa y de otro tipo | Vigente |
| [0005](0005-buenas-practicas.md) | Buenas prácticas y patrones de diseño (SOLID, Registry, Strategy…) | Vigente |

Próxima decisión: **0006**.
