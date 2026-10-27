# Arma combinaciones.html: estilos de la plantilla + cuerpo de la versión con lentes + reglas embebidas.
import json
import pathlib

aqui = pathlib.Path(__file__).parent
plantilla = (aqui / 'combinaciones.plantilla.html').read_text(encoding='utf-8')
cuerpo = (aqui / 'cuerpo-lentes.html').read_text(encoding='utf-8')
datos = json.loads((aqui / 'categorias.json').read_text(encoding='utf-8'))

css_lentes = '''
  /* Ronda con lente: la pregunta manda; los ingredientes van debajo como fichas */
  .pregunta { font-family: var(--serif); font-size: 1.55rem; line-height: 1.3; margin: 0; text-wrap: balance; position: relative;
    animation: entrar .45s cubic-bezier(.2, .8, .3, 1) both; }
  .pregunta mark { background: linear-gradient(transparent 58%, rgba(242, 196, 107, .65) 58%); color: inherit; padding: 0 2px; }
  .ingredientes { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; position: relative; }
  .ingrediente { display: inline-flex; align-items: center; gap: 6px; font-size: .88rem; font-weight: 600;
    background: #fff; border: 1px solid var(--papel-borde); border-radius: 999px; padding: 6px 12px; }
  .ingrediente.lente { background: var(--oro-claro); border-color: var(--oro); padding-right: 4px; }
  .ingrediente .familia { font-weight: 500; color: var(--tinta-suave); }
  .mas { font-family: var(--serif); font-weight: 700; color: var(--tinta-suave); }
  .respuesta { font-size: .9rem; color: var(--tinta-suave); margin: 0; position: relative; line-height: 1.45; }
  .respuesta b { color: var(--tinta); font-weight: 600; }
  .familias { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; padding: 0; list-style: none; }
  .familias li { font-size: .85rem; background: rgba(255, 255, 255, .08); border: 1px solid rgba(255, 255, 255, .14);
    border-radius: 12px; padding: 8px 10px; color: var(--texto-suave); line-height: 1.35; }
  .familias li b { color: var(--texto); display: block; }
  .pieza.lente { background: var(--oro-claro); border-color: var(--oro); }
  .aviso-literal { display: inline-block; margin-top: 6px; font-size: .75rem; font-weight: 700; color: #8a3b2e;
    background: #fbe1da; border-radius: 999px; padding: 3px 10px; }
  .pieza.lente .simbolo { background: linear-gradient(160deg, #fbe7b5, var(--oro)); }
  @media (prefers-reduced-motion: reduce) { .pregunta { animation: none; } }
'''
fin_estilo = plantilla.index('</style>')
cabeza = plantilla[:fin_estilo] + css_lentes + '</style>\n'
cabeza = cabeza.replace('<title>Musa Combinaciones</title>', '<title>Musa Combinaciones</title>')
html = cabeza + cuerpo.replace('__DATOS__', json.dumps(datos, ensure_ascii=False))
(aqui / 'combinaciones.html').write_text(html, encoding='utf-8')
print('combinaciones.html', len(html.encode('utf-8')), 'bytes')
