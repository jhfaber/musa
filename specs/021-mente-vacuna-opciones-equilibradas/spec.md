# 021 — Mente Vacuna: opciones de peso parecido (3 o 4 opciones)

- **Estado:** En curso
- **Aprobada por John:** 24-nov-2026, en el chat: "tambien si hay opciones muy grandes vs muy pequeñas, por ejemplo a que le dirias adios por un año, dice dulces, series, alcohol, redes sociales, los dulces parecen ser la opcion obvia por que son lo mas pequeño, si no hay otra equlibrada pues dejar 3 opciones, revisa esto"
- **Depende de:** [010 — cuatro opciones](../010-mente-vacuna-encuestas/spec.md) y [020 — cuatro categorías](../020-mente-vacuna-cuatro-categorias/spec.md)

## Objetivo

Que en las preguntas de opciones **ninguna sea obvia ni por escapista ("Nada", "Depende") ni por pequeña** al lado de las
otras. Si no hay una cuarta opción de peso parecido, la pregunta queda con **3 opciones**.

## Qué cambia para el jugador

- Una pregunta puede traer **3 o 4 opciones** (A, B, C y a veces D). Se ve igual que antes.
- Se revisaron las preguntas de opciones agregadas en las specs 014 a 020 y se corrigieron las que tenían una opción
  mucho más chica, más grande o evasiva:

| Pregunta | Antes | Ahora |
|---|---|---|
| ¿A qué le dirías adiós por un año? | Redes, Alcohol, **Dulces**, Series | Redes sociales, Alcohol, Series (3) |
| ¿Sin qué podrías vivir un año? | Internet, Música, **Dulces**, **Café** | Internet, Música, Series y películas, Salir de fiesta |
| ¿Qué sacrificarías primero? | Celular, Carro, **Televisión**, Vacaciones | Celular, Carro, Vacaciones (3) |
| ¿Qué sería peor? | Frío, Calor, Lluvia, **Viento** | Frío, Calor, Lluvia (3) |
| ¿Qué perdonarías más fácil? | Una mentira, **Un olvido**, Una grosería, **Un plan cancelado** | Una mentira, Una grosería en público, Olvidar tu cumpleaños, Dejarte plantado |
| ¿Qué fenómeno inexplicable has visto? | …, **Nada** | Luces en el cielo, Un fantasma, Un presentimiento que se cumplió, Una sombra extraña |
| ¿Estamos en una simulación? | Sí, No, **Podría ser**, **¿Qué importa?** | Sí, No, No importa (3) |

Y otras de Dilemas, Plata, Redes, Filosóficas y Misterios (35 cambios en total). Se **quitaron 3 preguntas de
Filosóficas** que repetían a otras o solo ofrecían salidas evasivas ("¿Hay vida en otros planetas?", "¿Hay vida después de
la muerte?" y "verdad dolorosa o mentira feliz").

## Técnico

La prueba del banco pasa de "exactamente 4 opciones" a "3 o 4, cortas y distintas". Se actualizan los textos de
`indice.json` y `bolsa.js`. Service worker v102. La spec 010 decía "exactamente 4": esta spec la matiza.

## Fuera de alcance

Las 100 preguntas de la categoría 🔠 Cuatro opciones (son de John) y las de Posiciones y Fantasías, donde "la más
común" tiene una respuesta popular por naturaleza.

## Cómo sabremos que está lista

- [x] Una pregunta de 3 opciones se ve bien en el celular (revisado a 375 px).
- [x] `npm test` y `npm run validar` sin errores.
- [ ] John las revisa en el celular → Completada.
