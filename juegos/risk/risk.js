// Risk Relámpago: punto de entrada. Une el almacén (estado), las reglas (lógica pura) y las vistas.
// Flujo en una sola dirección: toque → acción → almacen.despachar → reglas.aplicar → guardar → pintar.
// Ver specs/006-risk-arquitectura/spec.md.
import { crearAlmacen } from './almacen.js';
import { vencido, equipoActual } from './logica/reglas.js';
import * as efectos from './efectos.js';
import { pintarTablero, actualizarReloj } from './vistas/tablero.js';
import { pintarCuenta, actualizarCuenta, quitarCuenta } from './vistas/cuenta.js';
import { pintarPreparar, datosPartida, alTocar as tocarPreparar, alEscribir } from './vistas/preparar.js';
import { pintarFin, lanzarFuegos, detenerFuegos } from './vistas/fin.js';
import { abrirEquipo, pintarEquipo } from './vistas/equipo.js';
import { abrirEscuela } from './vistas/escuela.js';
import { abrirSimulador } from './vistas/simulador.js';
import { abrirAjustes, pintarAjustes } from './vistas/ajustes.js';
import { abrirGanadores, guardarGanador } from './vistas/ganadores.js';
import { avisoAusente, cerrarAviso } from './vistas/aviso.js';

const almacen = crearAlmacen();
let contenedor = null;
const enRisk = () => location.hash === '#risk' && contenedor;

// ---------- Pintar según el estado ----------

// Toda la pantalla toma un matiz del color del equipo en turno
function pintarTono(p) {
  const color = p && !p.terminada ? equipoActual(p).color : null;
  if (color) document.body.style.setProperty('--equipo-turno', color);
  else document.body.style.removeProperty('--equipo-turno');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = '#121218'; // barra del celular: oscuro neutro
}

function pintar() {
  if (!enRisk()) return;
  const p = almacen.partida;
  const aj = almacen.ajustes;
  pintarTono(p);
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

// Si un equipo pasó a ausente (desde la tarjeta, su panel o la cuenta regresiva), se recuerda qué hacer si lo atacan.
// Mientras el aviso está abierto, el tiempo que corría (la cuenta del siguiente o el reloj del turno) queda en pausa.
function avisarSiSeFue(p, antes) {
  if (!p || !antes) return;
  const seFue = p.equipos.find(e => e.ausente && !(antes.equipos.find(a => a.id === e.id) || {}).ausente);
  if (!seFue) return;
  const pausa = p.cuenta ? (p.cuenta.corriendo ? 'cuentaPausa' : null) : (p.reloj.estado === 'corre' ? 'reloj' : null);
  if (pausa) almacen.despachar({ tipo: pausa });
  avisoAusente(seFue, pausa ? () => seguirTrasAviso(pausa) : null);
}

// Al cerrar el aviso, sigue el tiempo que se pausó (si nada cambió mientras tanto)
function seguirTrasAviso(pausa) {
  const p = almacen.partida;
  if (!p || p.terminada) return;
  if (pausa === 'cuentaPausa' && p.cuenta && !p.cuenta.corriendo) almacen.despachar({ tipo: 'cuentaPausa' });
  if (pausa === 'reloj' && !p.cuenta && p.reloj.estado === 'pausa') almacen.despachar({ tipo: 'reloj' });
}

almacen.escuchar((p, antes, accion) => {
  efectos.alCambiar(p, antes, almacen.ajustes);
  if (accion.tipo === 'ganador') guardarGanador(p, almacen.ajustes);
  avisarSiSeFue(p, antes);
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

// Confirmación dentro de la app: el primer toque pregunta, el segundo hace la acción
let confirmar = 0;
function conConfirmacion(boton, pregunta, tipo) {
  if (!boton.dataset.seguro) {
    const texto = boton.textContent;
    boton.dataset.seguro = '1';
    boton.textContent = pregunta;
    clearTimeout(confirmar);
    confirmar = setTimeout(() => { boton.dataset.seguro = ''; boton.textContent = texto; }, 4000);
    return;
  }
  almacen.despachar({ tipo });
}

// Botones de pantalla (data-ui): abren paneles o cambian lo que se ve, no la partida
const accionesUi = {
  equipo: b => abrirEquipo(almacen, b.dataset.equipo),
  nueva: b => conConfirmacion(b, '¿Seguro? Toca otra vez para borrarla', 'nueva'),
  finalizar: b => conConfirmacion(b, '¿Terminar ya? Toca otra vez', 'finalizar'),
  ajustes: irAjustes,
  ganadores: () => abrirGanadores(),
  empezar: () => almacen.despachar({ tipo: 'empezar', ...datosPartida(almacen.ajustes) })
};

function clic(evento) {
  const b = evento.target.closest('[data-accion], [data-ui]');
  if (!b || b.disabled) return;
  if (b.dataset.accion) {
    const { accion, ...datos } = b.dataset;
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
    <button class="boton-icono" data-menu="ganadores" aria-label="Registro de ganadores">🏆</button>
    <button class="boton-icono" data-menu="ajustes" aria-label="Ajustes">⚙</button>`;
  barra.querySelector('[data-menu="ganadores"]').onclick = () => abrirGanadores();
  barra.querySelector('[data-menu="simulador"]').onclick = () => abrirSimulador();
  barra.querySelector('[data-menu="escuela"]').onclick = () => irEscuela();
  barra.querySelector('[data-menu="ajustes"]').onclick = irAjustes;
  if (vencido(almacen.partida, Date.now())) almacen.despachar({ tipo: 'tiempo' });
  pintar();
}

// Al salir de Risk se quitan la capa de la cuenta y los fuegos
window.addEventListener('hashchange', () => {
  if (location.hash !== '#risk') {
    quitarCuenta();
    cerrarAviso(false);
    detenerFuegos();
    document.body.style.removeProperty('--equipo-turno');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = '#1b1446';
  }
});

Musa.registrar({
  id: 'risk',
  nombre: 'Risk',
  simbolo: '⚔️',
  descripcion: 'Turnos con reloj, tropas por continente, simulador y escuela de dados',
  abrir
});
