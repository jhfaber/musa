# 001 — Plan técnico

## Tecnología

HTML + CSS + JavaScript sin frameworks ni dependencias en el celular (como `juego-rol/`).
PWA: `manifest.json` (nombre, íconos, pantalla completa) + `service-worker.js` (caché offline).

## Estructura (la raíz del proyecto)

```
musa/
├── index.html              ← una sola página: inicio (lista de juegos) y pantalla de cada juego
├── manifest.json
├── service-worker.js       ← precarga todo; responde desde caché (offline)
├── css/estilo.css
├── js/app.js               ← navegación por #hash, carga de juegos
├── juegos/dixit/
│   ├── reglas.json         ← cadenas temáticas y reglas (editable)
│   └── dixit.js            ← lógica de rondas
├── iconos/                 ← PNG generados con herramientas/generar-iconos.js (arte propio)
└── herramientas/
    ├── servidor.js         ← servidor estático para probar en la red de la casa (solo desarrollo)
    └── generar-iconos.js
```

## Lógica de rondas (Dixit)

- Las reglas están agrupadas en **cadenas**, en orden ("olores → sabores → sonidos…").
- Nueva ronda: con probabilidad `1 − salto` sigue con la siguiente regla no usada de la cadena actual;
  si salta (o la cadena se agotó) elige otra cadena al azar con reglas disponibles.
- "Otra regla" reemplaza la regla de la ronda actual sin avanzar el contador.
- Historial navegable (anterior/siguiente). La partida se guarda en `localStorage`
  para no perderla si se cierra la app.
- Nivel de sorpresa ajustable: Tranquilo (15 %), Normal (30 %), Caótico (60 %).

## Pruebas

1. Navegador del PC en tamaño celular.
2. Celular en el wifi de la casa: `node herramientas/servidor.js` → `http://<IP del PC>:8095` (solo LAN).
3. Instalación y offline: publicada en GitHub Pages (HTTPS) — tarea aparte, cuando la versión esté jugable.

## Riesgos

- El firewall de Windows puede bloquear el puerto 8095 para el celular. No se cambia sin aprobación (000);
  alternativa: probar en el PC.
- iPhone: el service worker solo se activa con HTTPS → offline se valida en el paso 3.
