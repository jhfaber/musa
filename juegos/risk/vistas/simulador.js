// Simulador de dados (pantalla completa): se pone el valor de cada dado (tocándolo) o se tiran al azar,
// y se ve al instante quién gana cada pareja. Sirve para aprender y para resolver la tirada del tablero real.
import { resolver, dadoAlAzar, dadosAtaque, dadosDefensa } from '../logica/dados.js';
import { mesaDados, resultado, barrasProb, fichas } from './piezas.js';

// atq/def: valores ya ordenados de mayor a menor. salieron: cómo cayeron en la última tirada al azar.
const sim = { atq: [6, 4, 1], def: [5, 4], salieron: null, rodar: false };
let panel = null;

const ordenar = lista => [...lista].sort((a, b) => b - a);

// Abre el simulador; con cuantos = { fichasAtq, fichasDef } pone los dados que corresponden
export function abrirSimulador(cuantos = null) {
  if (cuantos) {
    tamaño('atq', dadosAtaque(cuantos.fichasAtq) || 1);
    tamaño('def', dadosDefensa(cuantos.fichasDef));
  }
  if (!panel) {
    panel = Musa.panel.crear('🎲 Simulador de dados', 'Simulador de dados', '', { completa: true });
    panel.addEventListener('click', clic);
    panel.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.dataset.ui === 'dado') clic(e); });
  }
  Musa.panel.mostrar(panel);
  pintar();
}

function tamaño(lado, n) {
  sim[lado] = ordenar(Array.from({ length: n }, (_, i) => sim[lado][i] || 1));
  sim.salieron = null;
}

function clic(e) {
  if (e.target.closest('[data-cerrar]')) return Musa.panel.cerrar(panel);
  const el = e.target.closest('[data-ui]');
  if (!el) return;
  const { ui, lado, i, n } = el.dataset;
  sim.rodar = false;
  if (ui === 'dado') {
    // Se cambia el dado tocado (6 → 1) y se vuelven a ordenar de mayor a menor
    const valores = [...sim[lado]];
    valores[i] = valores[i] % 6 + 1;
    sim[lado] = ordenar(valores);
    sim.salieron = null;
  }
  if (ui === 'na') tamaño('atq', Number(n));
  if (ui === 'nd') tamaño('def', Number(n));
  if (ui === 'aleatorio') {
    const caen = lado => Array.from({ length: sim[lado].length }, dadoAlAzar);
    sim.salieron = { atq: caen('atq'), def: caen('def') };
    sim.atq = ordenar(sim.salieron.atq);
    sim.def = ordenar(sim.salieron.def);
    sim.rodar = true;
  }
  pintar();
}

// Cómo cayeron los dados antes de ordenarlos (solo tras una tirada al azar)
function salieron() {
  if (!sim.salieron) return '<p class="risk-sim-orden">⬇ Los dados se ordenan <b>de mayor a menor</b> y se comparan fila por fila.</p>';
  const lista = (vals, lado) => vals.map(v => `<span class="risk-chip-dado risk-chip-dado--${lado}">${v}</span>`).join('');
  return `
    <div class="risk-sim-orden risk-sim-orden--tirada">
      <span>Así cayeron:</span>
      <span class="risk-sim-cayeron">${lista(sim.salieron.atq, 'atq')}<i>contra</i>${lista(sim.salieron.def, 'def')}</span>
      <span>⬇ ordenados <b>de mayor a menor</b>:</span>
    </div>`;
}

function pintar() {
  const res = resolver(sim.atq, sim.def);
  panel.querySelector('.catalogo-cuerpo').innerHTML = `
    <div class="risk-sim-controles">
      <div><div class="risk-subtitulo">⚔️ Dados del atacante</div>${fichas([1, 2, 3], sim.atq.length, 'na')}</div>
      <div><div class="risk-subtitulo">🛡️ Dados del defensor</div>${fichas([1, 2], sim.def.length, 'nd')}</div>
    </div>
    ${salieron()}
    ${mesaDados(res, { tocables: true, rodar: sim.rodar })}
    <p class="risk-pista">Toca un dado para cambiar su número.</p>
    <button class="boton boton--principal risk-ancho" data-ui="aleatorio">🎲 Aleatorio: tirar los dados</button>
    <div class="risk-sim-resultado">${resultado(res)}</div>
    ${barrasProb(sim.atq.length, sim.def.length)}`;
}
