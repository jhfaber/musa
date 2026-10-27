# Cinco ejemplos variados por categoría y por lente, para inspirar sin encasillar. Se aplican sobre categorias.json.
import json
import pathlib

CATEGORIAS = {
    "sentidos": ["Tierra mojada después de la lluvia", "Café recién colado", "El crujido de hojas secas", "Arena caliente entre los dedos", "Frío de madrugada en la cara"],
    "emociones": ["Nostalgia", "Alivio después de un susto", "Vértigo", "Ternura", "Celos que no quieres admitir"],
    "recuerdos": ["La lonchera del colegio", "Esperar el bus del colegio", "La piñata del cumpleaños", "Dormirse en el carro de vuelta del paseo", "El regaño por llegar tarde"],
    "peliculas": ["Titanic, la escena del final", "Volver al futuro, cuando llegan tarde", "El viaje de Chihiro, perdida en otro mundo", "\"Houston, tenemos un problema\"", "Stranger Things, cuando se apagan las luces"],
    "personajes": ["Caperucita Roja", "Frida Kahlo", "Don Quijote", "El Chavo del 8", "Gandalf"],
    "musica": ["Queen", "Un bolero de despecho", "Shakira en sus inicios", "Heavy metal", "Los Beatles"],
    "cercano": ["Arena → el mar", "Un libro → unas gafas", "Una llave → el tapete de la entrada", "Nieve → el congelador", "Un paraguas → la puerta de la casa"],
    "naturaleza": ["Una aurora boreal", "Llovizna con sol", "Marea baja", "Un volcán dormido", "Neblina en el páramo"],
    "animales": ["Un búho", "Una medusa", "Un dragón", "Un gato callejero", "Una tortuga centenaria"],
    "comidas": ["Sancocho de domingo", "Helado derretido", "Chocolate con queso", "Café frío olvidado", "Arepa recién asada"],
    "oficios": ["Farolero", "Astronauta", "Equilibrista", "Jugador de ajedrez", "Cartero de un pueblo"],
    "fantasia": ["Hablar con los relojes", "Una varita rota", "La leyenda de la Llorona", "Un hechizo para volverse invisible", "Un dragón que guarda un tesoro"],
    "antes-despues": ["Nadie apagó la estufa", "Llegó cinco minutos tarde", "La última llamada sin contestar", "Ganó la lotería y no lo sabía", "Mañana todo vuelve a empezar"],
    "ideas": ["Entropía", "Silencio ensordecedor", "Paciencia infinita", "Libertad", "El paso del tiempo"],
}

LENTES = {
    "epoca": ["Hace mil años", "La prehistoria", "Los años 80", "La Edad Media", "Dentro de mil años"],
    "hora-dia": ["3 de la madrugada", "El amanecer", "Mediodía", "El atardecer", "Medianoche"],
    "momento-vida": ["La infancia", "El primer amor", "El último día de colegio", "El primer trabajo", "La vejez"],
    "estacion": ["Invierno", "Verano", "Vacaciones", "Temporada de lluvias", "Otoño"],
    "cine": ["Terror", "Comedia romántica", "Ciencia ficción", "Western", "Película muda"],
    "tv": ["Telenovela", "Comercial", "Noticiero", "Reality show", "Documental de animales"],
    "cuento": ["Cuento de hadas", "Fábula", "Leyenda", "Mito griego", "Cuento para dormir"],
    "mente": ["Un sueño", "Una pesadilla", "Un recuerdo borroso", "Un déjà vu", "Una alucinación"],
    "contrario": ["Desierto → un bosque", "Arena → mar → lava", "Lo que pasó → lo que jamás pasaría ahí", "Silencio → un estadio lleno", "Nostalgia → la emoción de estrenar"],
    "su-sonido": ["¡Pummm!", "Uuh… uuh", "Plic, plic, plic", "Fiuuu", "¡Crac!"],
    "tamano": ["En miniatura", "Gigante", "Del tamaño de un grano de arena", "Tan grande como un planeta", "Dentro de una caja de fósforos"],
    "intensidad": ["Exagerada mil veces", "Apenas perceptible", "En cámara lenta", "A toda velocidad", "En silencio total"],
}

ruta = pathlib.Path(__file__).parent / 'categorias.json'
datos = json.loads(ruta.read_text(encoding='utf-8'))
for c in datos['categorias']:
    c['ejemplos'] = CATEGORIAS[c['id']]
for familia in datos['lentes']:
    for l in familia['lentes']:
        l['ejemplos'] = LENTES[l['id']]
ruta.write_text(json.dumps(datos, ensure_ascii=False, indent=2), encoding='utf-8')
faltan = [c['id'] for c in datos['categorias'] if len(c['ejemplos']) != 5] + [l['id'] for f in datos['lentes'] for l in f['lentes'] if len(l['ejemplos']) != 5]
print('ejemplos actualizados; sin 5 ejemplos:', faltan or 'ninguno')
