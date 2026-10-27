// Risk Relámpago: punto de entrada. Une el almacén (estado), las reglas (lógica pura) y las vistas.
// Flujo en una sola dirección: toque → acción → almacen.despachar → reglas.aplicar → guardar → pintar.
// Ver specs/006-risk-arquitectura/spec.md.
import { crearAlmacen } from './almacen.js';
import { vencido } from './logica/reglas.js';
import * as efectos from './efectos.js';
import { pintarTablero, actualizarReloj, ui as uiTablero } from './vistas/tablero.js';
import { pintarCuenta, actualizarCuenta, quitarCuenta } from './vistas/cuenta.js';
import { pintarPreparar, datosPartida, alTocar as tocarPreparar, alEscribir } from './vistas/preparar.js';
import { pintarFin, lanzarFuegos, detenerFuegos } from './vistas/fin.js';
import { abrirEquipo, pintarEquipo } from './vistas/equipo.js';
import { abrirEscuela } from './vistas/escuela.js';
import { abrirSimulador } from './vistas/simulador.js';
import { abrirAjustes, pintarAjustes } from './vistas/ajustes.js';

const almacen = crearAlmacen();
let contenedor = null;
const enRisk = () => location.hash === '#risk' && contenedor;

// ---------- Pintar según el estado ----------

function pintar() {
  if (!enRisk()) return;
  const p = almacen.partida;
  const aj = almacen.ajustes;
  detenerFuegos();
  if (!p) contenedor.innerHTML = pintarPreparar(aj);
  else if (p.terminada) {
    contenedor.innerHTML = pintarFin(p, aj);
    lanzarFuegos(contenedor, p.equipos.map(e => e.color));
  } else {
    contenedor.innerHTML = pintarTablero(p, aj);
    Musa.reloj.medirBorde(contenedor);
    actualizarReloj(contenedor, p, aj, Date.now());
  }
  pintarCuenta(p, aj, Date.now(), clic);
  pintarEquipo();
  pintarAjustes();
}

almacen.escuchar((p, antes) => {
  efectos.alCambiar(p, antes, almacen.ajustes);
  pintar();
});

// ---------- Un solo latido: vencimientos y relojes ----------

setInterval(() => {
  if (!enRisk()) return;
  const p = almacen.partida;
  const ahora = Date.now();
  if (vencido(p, ahora)) return almacen.despachar({ tipo: 'tiempo' });
  if (!p || p.terminada) return;
  actualizarReloj(contenedor, p, almacen.ajustes, ahora);
  actualizarCuenta(p, almacen.ajustes, ahora);
  efectos.alLatir(p, almacen.ajustes, ahora);
}, 200);

// ---------- Toques ----------

const irEscuela = pestaña => abrirEscuela(() => almacen.ajustes, abrirSimulador, pestaña);
const irAjustes = () => abrirAjustes(almacen, { escuela: () => irEscuela('aprender'), nueva: () => almacen.despachar({ tipo: 'nueva' }) });

// Nueva partida con confirmación dentro de la app: el primer toque pregunta, el segundo borra
let confirmar = 0;
function pedirNueva(boton) {
  if (!boton.dataset.seguro) {
    boton.dataset.seguro = '1';
    boton.textContent = '¿Seguro? Toca otra vez para borrar la partida';
    clearTimeout(confirmar);
    confirmar = setTimeout(() => { boton.dataset.seguro = ''; boton.textContent = '✦ Nueva partida'; }, 4000);
    return;
  }
  almacen.despachar({ tipo: 'nueva' });
}

// Botones de pantalla (data-ui): abren paneles o cambian lo que se ve, no la partida
const accionesUi = {
  equipo: b => abrirEquipo(almacen, b.dataset.equipo),
  venta: () => { uiTablero.venta = !uiTablero.venta; pintar(); },
  nueva: pedirNueva,
  ajustes: irAjustes,
  empezar: () => almacen.despachar({ tipo: 'empezar', ...datosPartida(almacen.ajustes) })
};

function clic(evento) {
  const b = evento.target.closest('[data-accion], [data-ui]');
  if (!b || b.disabled) return;
  if (b.dataset.accion) {
    const { accion, ...datos } = b.dataset;
    if (accion === 'venta') uiTablero.venta = false;
    return almacen.despachar({ tipo: accion, ...datos });
  }
  if (accionesUi[b.dataset.ui]) return accionesUi[b.dataset.ui](b);
  if (tocarPreparar(b)) pintar();
}

function abrir(elemento, barra) {
  contenedor = elemento;
  contenedor.onclick = clic;
  contenedor.oninput = e => alEscribir(e.target);
  contenedor.onchange = null;
  barra.innerHTML = `
    <button class="boton-icono" data-menu="simulador" aria-label="Simulador de dados">🎲</button>
    <button class="boton-icono" data-menu="escuela" aria-label="Escuela: aprender a jugar">🎓</button>
    <button class="boton-icono" data-menu="ajustes" aria-label="Ajustes">⚙</button>`;
  barra.querySelector('[data-menu="simulador"]').onclick = () => abrirSimulador();
  barra.querySelector('[data-menu="escuela"]').onclick = () => irEscuela();
  barra.querySelector('[data-menu="ajustes"]').onclick = irAjustes;
  if (vencido(almacen.partida, Date.now())) almacen.despachar({ tipo: 'tiempo' });
  pintar();
}

// Al salir de Risk se quitan la capa de la cuenta y los fuegos
window.addEventListener('hashchange', () => {
  if (location.hash !== '#risk') { quitarCuenta(); detenerFuegos(); }
});

Musa.registrar({
  id: 'risk',
  nombre: 'Risk',
  simbolo: '⚔️',
  descripcion: 'Turnos con reloj, tropas por continente, simulador y escuela de dados',
  abrir
});
