# 009 — Plan

Spec: [spec.md](spec.md) · Buenas prácticas: [decisión 0005](../decisiones/0005-buenas-practicas.md)

## Arquitectura

Mente Vacuna deja de ser `tipo: "reglas"` y pasa a juego con módulo ES (`entrada`), como Risk.

```
juegos/mente-vacuna/
  mente-vacuna.js      entrada: registra el juego, pestañas Preguntas / Reglas (Reglas = visor común de la 008)
  mente-vacuna.css     estilos de la pantalla de preguntas
  almacen.js           Facade sobre Musa.leer/guardar (clave musa.mente-vacuna.estado.v1)
  efectos.js           shell imperativo: vibrar y pantalla encendida (Wake Lock)
  logica/bolsa.js      núcleo funcional puro: sacar sin repetir, anterior, descartar, categorías
  vistas/preguntas.js  pinta la pantalla y traduce toques en llamadas al núcleo
  preguntas.json       el banco (datos, no código)
  reglas.json          la ficha de la 008, sin cambios
```

## Decisiones

- **Functional core / imperative shell:** `logica/bolsa.js` no toca DOM, almacenamiento ni `Math.random`;
  recibe el azar como función (inyección de dependencias), así se prueba de forma determinista.
- **Reducer / estado inmutable:** cada función devuelve un estado nuevo; la vista guarda y repinta.
- **Ids estables por texto:** cada pregunta se identifica por categoría + hash de su texto, no por su posición:
  agregar o quitar preguntas no desordena lo ya visto.
- **Data-driven:** categorías, colores, pistas y preguntas viven en `preguntas.json`.
- **Fail-soft:** sin almacenamiento, sin Wake Lock o sin vibración, el juego sigue funcionando.
- **Pruebas escalables:** `pruebas/bolsa.test.mjs` corre propiedades sobre cientos de semillas y sobre cada banco
  descubierto; `pruebas/banco.test.mjs` valida cualquier banco nuevo sin tocar las pruebas.
- `package.json` mínimo (`"type": "module"`, `npm test`) solo para correr las pruebas; no se publica.
