# 008 — Catálogo de juegos: lista en la portada, dado al azar y reglas al punto

- **Estado:** Aprobada por John (23-nov-2026, en el chat: "de resto aprueba y por favor empieza con toda la implementación"), con tres cambios: se quita "Uno Diccionarios" (no existe), el juego es "Monopoly Dados y Tragos" y "Mente Vacuna" es el juego del rebaño de las vacas — en curso
- **Depende de:** [004 — Estructura por juego](../004-estructura-por-juego/spec.md), decisiones [0002](../decisiones/0002-un-juego-una-carpeta.md) y [0004](../decisiones/0004-repo-de-juegos.md)
- **Pedido por John:** 23-nov-2026, en el chat ("cosas súper prácticas, nada de reglas extensas… reglas al punto")

## Objetivo

Que en la portada de Musa se vean **todos los juegos de John** y que, al entrar a cualquiera, se pueda empezar a
jugar en un minuto leyendo lo justo. El reglamento completo queda aparte, para cuando haga falta.

## Qué cambia para el jugador

1. **Portada con la lista de juegos.** Una tarjeta por juego, con su nombre. Dixit y Risk siguen igual: son
   herramientas y abren como hoy.
2. **Dado para elegir al azar** 🎲: un botón en la portada que elige un juego de la lista y lo muestra con una
   animación corta. Se puede repetir hasta que guste el resultado.
3. **Cada juego tiene dos pestañas:**
   - **Para empezar:** lo mínimo para jugar ya. Cuántos juegan, qué se necesita, cómo se gana y cómo es un turno.
     Corto: cabe en una pantalla de celular, en viñetas.
   - **Reglamento:** el despliegue completo, ordenado por secciones que se abren y se cierran
     (preparación, turno, casos especiales, fin del juego…). Se lee solo cuando surge una duda.
4. **Todo funciona sin Internet**, como el resto de Musa.

## Juegos de la primera tanda

| Juego | Tipo | Notas |
|---|---|---|
| Dixit | Herramienta | Ya existe (spec 001) |
| Risk Relámpago | Herramienta | Ya existe (spec 005) |
| Ghost Blitz | Reglas | |
| Zombie Kittens | Reglas | |
| Codenames Pictures (Código Secreto Imágenes) | Reglas | |
| Charada | Reglas | |
| El que piensa pierde | Reglas | |
| Póker | Reglas | Manos y orden de apuestas |
| Pictionary para adultos | Reglas | |
| Secret Hitler | Reglas | |
| Monopoly | Reglas | |
| Monopoly Superbanco Electrónico | Reglas | |
| Monopoly Dados y Tragos | Reglas | Edición de Monopoly para adultos; los tragos hacen de dinero |
| Uno No Mercy | Reglas | |
| Uno Normal | Reglas | |
| Mente Vacuna | Reglas | Juego del rebaño: vacas y vaca rosa |
| Uno Super Mario | Reglas | Se asume Uno Super Mario; si es otra edición, John avisa |

Los juegos de **reglas** solo tienen las dos pestañas. Si más adelante alguno merece una herramienta (un temporizador
para Charada, los dados de Dados y Tragos, el banco de Monopoly…), eso es una spec aparte para ese juego.

## Cómo se escriben las reglas

- **Al punto:** frases cortas, viñetas, sin párrafos. "Para empezar" no pasa de una pantalla.
- Se escriben con palabras propias, no se copia ningún manual.
- Las reglas de la casa de John se pueden agregar en cada juego, marcadas como tales, para no confundirlas con las oficiales.
- John revisa cada juego antes de darlo por bueno: si una regla no coincide con cómo juega, manda su versión.

## Técnico

- Cada juego sigue la decisión 0002: carpeta `juegos/<id>/`, registrada en `juegos/juegos.json`, con un campo
  `tipo` (`herramienta` o `reglas`) y su nombre para mostrar.
- Las reglas de cada juego viven en un archivo de datos de esa carpeta; un visor común las muestra con las dos
  pestañas, así agregar un juego de reglas no requiere programar una pantalla nueva.
- El service worker guarda todo para uso sin Internet y se sube su versión al cambiar archivos.
- La portada y el dado leen la lista de `juegos.json`: un juego nuevo aparece solo.

## Fuera de alcance

- Herramientas para los juegos de reglas (temporizadores, contadores, dados propios). Una spec por juego cuando se pidan.
- Buscar o filtrar la lista, favoritos entre juegos o filtro del dado por número de jugadores (posible más adelante).
- Cambiar Dixit o Risk por dentro.
- Reglamentos completos de miles de casos raros: el reglamento resume lo necesario, no reemplaza el manual de la caja.

## Para tener en cuenta

- Con 17 juegos, escribir reglas es el trabajo grande. John pidió hacerlo todo de una vez; la revisión de las
  reglas la hace después, juego por juego, y lo que no esté bien se corrige en `reglas.json` sin tocar código.
- Hay versiones y reglas de la casa distintas para juegos como Monopoly, Uno o Póker. Preguntaré cuál usas
  cuando haga falta, en lugar de adivinar.
- Esta spec toca la portada de Musa, que hasta ahora no se había cambiado.

## Decisiones de John sobre las preguntas abiertas

- **Uno "Diccionarios":** no existe; se elimina de la lista.
- **Dados y Tragos:** es *Monopoly Dados y Tragos*.
- **Mente Vacuna:** se investigó: es el juego del rebaño (preguntas, vacas y vaca rosa).
- **Uno de Mario:** se asume Uno Super Mario.
- **Primera tanda:** John pidió implementar **todos los juegos** de una vez, no por tandas. La revisión de reglas
  la hace John después, juego por juego.
- **Reglas que no se pudieron confirmar** (El que piensa pierde, Monopoly Dados y Tragos, Monopoly Superbanco
  Electrónico, Zombie Kittens): quedan con un aviso visible en la ficha, para completarlas con el manual de la caja
  o con lo que John cuente.

## Cómo sabremos que está lista

- [ ] La portada muestra los 17 juegos y Dixit y Risk abren como siempre.
- [ ] El botón del dado elige un juego al azar y abre su ficha.
- [ ] Cada juego de reglas tiene "Para empezar" (cabe en una pantalla de celular) y "Reglamento" con secciones plegables.
- [ ] Agregar un juego de reglas nuevo solo pide una carpeta con su archivo de reglas y una línea en `juegos.json`.
- [ ] Todo se abre sin Internet después de instalada la app.
- [ ] John revisó las reglas de cada juego.

## Cambios pedidos por John (23-nov-2026)

- **Buscador en la portada**, encima de la lista: filtra por nombre y descripción, sin importar tildes ni mayúsculas,
  con varias palabras ("monopoly dados"). Enter con un solo resultado abre ese juego; ✕ o Escape borran la búsqueda.
  Si no hay resultados, lo dice.
