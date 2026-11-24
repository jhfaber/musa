# 008 — Tareas

- [x] Visor de reglas `comun/reglas.js` con las pestañas *Para empezar* / *Reglamento*
- [x] Estilos `comun/reglas.css` (ficha, secciones plegables, aviso, dado)
- [x] Dado al azar `comun/azar.js` y botón en la portada
- [x] `comun/app.js`: registrar los juegos de tipo `reglas` desde `juegos.json`
- [x] `index.html` y `service-worker.js` (archivos nuevos y versión)
- [x] `juegos/juegos.json` con los 15 juegos de reglas
- [x] Reglas de cada juego (`reglas.json`): Charada, Codenames Pictures, El que piensa pierde, Ghost Blitz,
      Mente Vacuna, Monopoly, Monopoly Dados y Tragos, Monopoly Superbanco Electrónico, Pictionary para adultos,
      Póker, Secret Hitler, Uno No Mercy, Uno Normal, Uno Super Mario, Zombie Kittens
- [x] Revisar en el navegador a tamaño celular (portada, dado, fichas, Dixit y Risk)
- [ ] Probar sin conexión en el celular (service worker)
- [ ] Revisión de reglas por John, juego por juego
- [ ] Validar con `node herramientas/validar-juegos.mjs` en el SSD y revisar contra la [decisión 0005](../decisiones/0005-buenas-practicas.md)
- [ ] Marcar la spec como `Completada` aquí y en `specs/README.md`

## Verificación

Probado en Chrome a 390 × 844: la portada muestra los 17 juegos, el dado elige y abre el juego, las 15 fichas abren con sus pestañas y
secciones plegables, Dixit y Risk abren, sin errores de código. `validar-juegos.mjs` sin errores sobre una copia del repo.
Pendiente: probar sin conexión en el celular y que John revise las reglas.
