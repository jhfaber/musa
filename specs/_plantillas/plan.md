# NNN — Plan

Solo se escribe cuando la spec está **aprobada**.

## Datos
Qué datos nuevos o cambiados hay, dónde viven y qué pasa con lo que ya está guardado en el celular
(¿hace falta migrar? ¿cambia alguna clave `musa.<juego>.…`?).

## Archivos
Qué archivos se crean y cuáles se tocan, por carpeta. Si es un juego nuevo: `juegos/<id>/` y su entrada en
`juegos/juegos.json`.

## Lógica y vistas
Cómo se reparte el trabajo. Las reglas del juego no tocan la pantalla; las vistas no cambian la partida.

## Decisiones
Si una elección técnica merece quedar para el futuro, se registra en `../decisiones/` y se enlaza aquí.

## Riesgos y cómo se cubren
Qué puede salir mal y cómo se prueba.

## Verificación
Pruebas que se correrán y qué se revisará a mano en el celular.
