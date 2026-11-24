# 0006 — Criterios de calidad de las preguntas de Mente Vacuna

- **Estado:** Vigente
- **Fecha:** 24-nov-2026
- **Decidió:** John (en el chat: "estas preguntas deberían ser lo bastante controversiales para que la gente elija cosas diferentes… opciones muy grandes vs muy pequeñas… dulces vs redes sociales, obviamente la gente contesta dulces… si hay preguntas abiertas que quedaron con algo que es muy obvio que van a contestar pues coloca la prohibición de contestar por ello… si hay preguntas que no están muy equilibradas considerar reducir opciones o directamente eliminar la pregunta")
- **Relacionada con:** specs [010](../010-mente-vacuna-encuestas/spec.md), [020](../020-mente-vacuna-cuatro-categorias/spec.md), [021](../021-mente-vacuna-opciones-equilibradas/spec.md) y [022](../022-mente-vacuna-revision-de-preguntas/spec.md)

## Contexto

Mente Vacuna se gana cuando varios responden **lo mismo**. Una pregunta con una respuesta que casi todos darían es un
punto regalado, y una con una opción obvia no deja elegir. Al crecer el banco aparecieron las dos cosas.

## Decisión

Toda pregunta de Mente Vacuna, nueva o vieja, cumple estos criterios. Si no los cumple se **corrige o se elimina**.

1. **Nada obvio.** Si una pregunta abierta tiene una respuesta que casi todos darían primero, esa respuesta va en
   `no` (la lista de respuestas prohibidas, de 1 a 3). Ej.: "Un número del 1 al 10" prohíbe el 7.
2. **Opciones del mismo peso.** Las opciones de una pregunta deben ser comparables en tamaño e importancia. Si una es
   mucho más chica, más grande o más fácil que las demás, la gente la elige sin pensar. Ej.: "¿A qué le dirías adiós por
   un año?" con *dulces*, *series*, *alcohol* y *redes sociales*: casi todos dicen *dulces* porque es lo más pequeño.
3. **Sin salidas evasivas.** Nada de "Nada", "Depende", "Mitad y mitad", "Quizás", "No sé" como opción: todos se irían ahí.
4. **Si no se puede equilibrar, se reduce o se elimina.** Si no hay una cuarta opción de peso parecido, la pregunta
   queda con **3 opciones** (se permiten 3 o 4). Si ni así se reparte, se **elimina la pregunta**.
5. **Que repartan al grupo.** Cada opción lleva una ganancia y un costo; la pregunta ideal hace que la gente elija cosas
   diferentes.
6. **Las preguntas que John ya tenía no se tocan sin que lo pida**, salvo para agregar una prohibición obvia (criterio 1)
   y si él lo autorizó. El nivel Tranquilo de Dixit sigue congelado.

## Motivo

Sin estos criterios el banco se llena de preguntas fáciles que no producen coincidencias interesantes. Alternativas:
dejarlo a ojo de quien escriba (se vuelve a repetir) o medir con encuestas reales (no hay cómo). Se prefirió una regla
escrita que se pueda revisar.

## Consecuencias

- Al escribir o ampliar un banco, se revisan las preguntas contra estos seis puntos antes de cerrar la spec.
- La prueba automática no puede juzgar "obvio", pero sí exige 3 o 4 opciones cortas y distintas y de 1 a 3 prohibidas.
- Las preguntas eliminadas por esto no se reponen "a ojo": se escriben nuevas que cumplan.
