# 016 — Mente Vacuna: sin activación +18 (todas las categorías entran sin más)

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "eso de activar por que la categoria es picante sigue saliendo, desactiva eso, la idea es que todas aparezcan sin mas, ponlo en specs, nada de activar la app es para mayores"
- **Depende de:** [009 — banco de preguntas](../009-mente-vacuna-preguntas/spec.md) (ya decía "Sin filtro +18") y [014 — Posiciones y Fantasías](../014-mente-vacuna-posiciones-fantasias/spec.md)

## Objetivo

Confirmar y dejar bien hecha una decisión que ya estaba en la spec 009: **la app es para mayores de edad**, así que
ninguna categoría pide confirmación ni arranca apagada.

## Qué pasó

La spec 009 ya dijo "Sin filtro +18": Picantes entra en "Todas" y arranca prendida. Pero el mecanismo seguía en el
código, y al crear Posiciones y Fantasías (spec 014) las marqué como "+18", con lo que volvió a salir el aviso
"es para mayores de 18 — ¿Sí, activar?". Fue un error mío, no un cambio de lo acordado.

## Qué cambia para el jugador

- Todas las categorías arrancan **prendidas** en una partida nueva, también Picantes, Posiciones y Fantasías.
- Tocar una categoría solo la prende o la apaga: **no sale ninguna ventana de confirmación**.
- "Todas" prende todas las categorías; "Quitar todas" las apaga.
- En el panel de categorías ya no aparece "+18" ni se atenúan las categorías picantes.

## Técnico

Se elimina el campo `adultos` de los bancos, el cuadro de confirmación, su CSS y las dos reglas de prueba que lo
exigían. Las pruebas de la bolsa ahora comprueban que todas arrancan prendidas. Sube la versión del service worker (v94).

## Para tener en cuenta

Las partidas **ya guardadas en el celular** conservan su lista de categorías activas: las categorías nuevas
(Posiciones, Fantasías, Filosóficas) se prenden tocando "Todas" o cada una. Las partidas nuevas las traen prendidas.

## Fuera de alcance

Cambiar el texto de las preguntas o el aviso +18 de la ficha de otros juegos (Beer Pong, etc.).

## Cómo sabremos que está lista

- [x] No queda `adultos` ni "+18" en el código, los bancos ni las pruebas de Mente Vacuna.
- [x] `npm test` (54 pruebas del banco) y `npm run validar` sin errores.
- [x] Revisado en el navegador: tocar Picantes, Posiciones o Fantasías no pide confirmación.
- [ ] John lo prueba en el celular → Completada.
