// Reloj compartido por los juegos: cuenta contra la hora de término (no contando cuadros), así que si el
// celular frena la página o se apaga la pantalla, al volver marca lo que de verdad queda.
Musa.reloj = (() => {
  const MIN_SEGUNDOS = 10;
  const MAX_SEGUNDOS = 9 * 60 + 55;
  const VISTAS = [
    { id: 'arena', nombre: 'Arena', desc: 'Un velo dorado baja por la carta.' },
    { id: 'borde', nombre: 'Borde', desc: 'El borde dorado de la carta se va consumiendo.' },
    { id: 'numero', nombre: 'Solo el número', desc: 'Sin animación: solo cuenta el botón.' }
  ];

  const ajustarSegundos = s => Math.min(MAX_SEGUNDOS, Math.max(MIN_SEGUNDOS, Math.round(s / 5) * 5));
  const formato = s => { const c = Math.ceil(s); return `${Math.floor(c / 60)}:${String(c % 60).padStart(2, '0')}`; };

  // duracion(): segundos de una vuelta completa. alCambiar se llama en cada paso; alTerminar al llegar a 0.
  function crear({ duracion, alCambiar = () => {}, alTerminar = () => {} }) {
    let restante = null;
    let corriendo = false;
    let terminaEn = 0;
    let intervalo = 0;
    const valor = () => (restante === null ? duracion() : restante);

    function detener() {
      corriendo = false;
      clearInterval(intervalo);
    }

    function paso() {
      if (!corriendo) return;
      restante = Math.max(0, (terminaEn - Date.now()) / 1000);
      if (restante <= 0) {
        detener();
        alTerminar();
      }
      alCambiar();
    }

    function correr() {
      corriendo = true;
      terminaEn = Date.now() + restante * 1000;
      clearInterval(intervalo);
      intervalo = setInterval(paso, 100);
    }

    function empezar() {
      restante = valor() <= 0 ? duracion() : valor();
      correr();
      alCambiar();
    }

    function alternar() {
      if (!corriendo) return empezar();
      paso();
      detener();
      alCambiar();
    }

    // Vuelve a la duración completa (cada vez que cambia la ronda o el turno)
    function reiniciar() {
      detener();
      restante = null;
    }

    function sumar(segundos) {
      if (corriendo) terminaEn += segundos * 1000;
      else restante = valor() + segundos;
      paso();
      alCambiar();
    }

    // Para guardar la partida y seguir donde iba tras recargar
    const foto = () => ({ restante, corriendo, terminaEn });
    function restaurar(f) {
      detener();
      restante = f ? f.restante : null;
      if (f && f.corriendo) {
        restante = Math.max(0, (f.terminaEn - Date.now()) / 1000);
        if (restante > 0) correr();
      }
    }

    document.addEventListener('visibilitychange', paso);
    return { restante: valor, corriendo: () => corriendo, empezar, alternar, reiniciar, sumar, detener, foto, restaurar };
  }

  function tono(frecuencias, volumen, duracionNota) {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      frecuencias.forEach((frecuencia, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = frecuencia;
        const t0 = ctx.currentTime + i * 0.18;
        g.gain.setValueAtTime(0.0001, t0);
        g.gain.exponentialRampToValueAtTime(volumen, t0 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t0 + duracionNota);
        o.connect(g).connect(ctx.destination);
        o.start(t0);
        o.stop(t0 + duracionNota + 0.1);
      });
    } catch (e) { /* sin sonido */ }
  }

  // Campanita suave (dos notas) y vibración corta
  function avisar({ sonido, vibrar }) {
    if (vibrar && navigator.vibrate) navigator.vibrate([120, 80, 120]);
    if (sonido) tono([880, 1320], 0.25, 1.2);
  }

  // Un tic seco para los últimos segundos
  const tic = () => tono([1600], 0.08, 0.06);

  // Lo que el reloj agrega dentro de una carta: el velo de arena, el borde y el botón
  const html = () => `
    <div class="reloj-velo" aria-hidden="true"><div class="reloj-arena"></div></div>
    <svg class="reloj-borde" aria-hidden="true" preserveAspectRatio="none"><rect rx="24" ry="24"></rect></svg>
    <button class="reloj-boton" data-accion="reloj"><span class="reloj-estado"></span><b class="reloj-cuenta"></b></button>`;

  // El borde es un rectángulo redondeado cuyo trazo se acorta con el tiempo; se mide al pintar la carta
  function medirBorde(raiz) {
    const svg = raiz && raiz.querySelector('.reloj-borde');
    if (!svg) return;
    const w = svg.clientWidth;
    const h = svg.clientHeight;
    if (w < 10 || h < 10) return;
    const rect = svg.querySelector('rect');
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
    rect.setAttribute('x', 2);
    rect.setAttribute('y', 2);
    rect.setAttribute('width', w - 4);
    rect.setAttribute('height', h - 4);
    const largo = rect.getTotalLength();
    rect.style.strokeDasharray = largo;
    rect.dataset.largo = largo;
  }

  // lleno: 1 = tiempo completo, 0 = se acabó
  function pintarVista(carta, lleno, restante, estado) {
    carta.querySelector('.reloj-arena').style.height = `${Math.max(0, Math.min(1, lleno)) * 100}%`;
    const rect = carta.querySelector('.reloj-borde rect');
    rect.style.strokeDashoffset = (1 - Math.max(0, Math.min(1, lleno))) * Number(rect.dataset.largo || 0);
    carta.querySelector('.reloj-cuenta').textContent = formato(restante);
    carta.querySelector('.reloj-estado').textContent = estado;
  }

  return { crear, avisar, tic, html, medirBorde, pintarVista, formato, ajustarSegundos, VISTAS, MIN_SEGUNDOS, MAX_SEGUNDOS };
})();
