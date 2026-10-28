// Piezas de los menús ⚙ que comparten los juegos (mismo aspecto en todos)
Musa.ui = {
  // Interruptor sí/no: <input data-ajuste="<clave>">
  interruptor: (valor, clave, titulo, desc) => `
    <label class="ajuste-fila">
      <span><b>${titulo}</b><small>${desc}</small></span>
      <input type="checkbox" class="ajuste-interruptor" data-ajuste="${clave}" ${valor ? 'checked' : ''}>
    </label>`,

  // Minutos y segundos con − / +: botones data-tiempo="<clave>" data-paso="±60|±5"
  tiempo: (segundos, clave) => `
    <div class="ajuste-tiempo">
      <div class="ajuste-paso">
        <button class="boton-icono" data-tiempo="${clave}" data-paso="-60" aria-label="Un minuto menos">−</button>
        <span><b>${Math.floor(segundos / 60)}</b> min</span>
        <button class="boton-icono" data-tiempo="${clave}" data-paso="60" aria-label="Un minuto más">+</button>
      </div>
      <div class="ajuste-paso">
        <button class="boton-icono" data-tiempo="${clave}" data-paso="-5" aria-label="Cinco segundos menos">−</button>
        <span><b>${String(segundos % 60).padStart(2, '0')}</b> s</span>
        <button class="boton-icono" data-tiempo="${clave}" data-paso="5" aria-label="Cinco segundos más">+</button>
      </div>
    </div>`,

  // Un número con − / +: botones data-numero="<clave>" data-paso="±1"
  numero: (valor, clave, unidad, etiqueta) => `
    <div class="ajuste-paso">
      <button class="boton-icono" data-numero="${clave}" data-paso="-1" aria-label="${etiqueta}: uno menos">−</button>
      <span><b>${valor}</b> ${unidad}</span>
      <button class="boton-icono" data-numero="${clave}" data-paso="1" aria-label="${etiqueta}: uno más">+</button>
    </div>`
};
