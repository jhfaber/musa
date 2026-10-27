// Publica Musa en GitHub Pages (https://jhfaber.github.io/musa/) para instalarla en el celular.
// Uso: node herramientas/publicar.js
//
// Solo sube los archivos de la app (no specs, PoC, herramientas ni el historial de trabajo) como un único
// commit en la rama gh-pages, firmado con el correo privado de GitHub para no exponer el correo personal.
// Antes de publicar, sube la versión en service-worker.js para que los celulares reciban el cambio.
const { execFileSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const RAIZ = path.join(__dirname, '..');
const REPO = 'https://github.com/jhfaber/musa.git';
const AUTOR = ['-c', 'user.name=jhfaber', '-c', 'user.email=20934270+jhfaber@users.noreply.github.com'];
const ARCHIVOS = ['index.html', 'manifest.json', 'service-worker.js', 'comun', 'juegos', 'iconos'];

const git = (args, cwd) => execFileSync('git', args, { cwd, stdio: 'inherit' });

const version = fs.readFileSync(path.join(RAIZ, 'service-worker.js'), 'utf8').match(/VERSION = '([^']+)'/)[1];
const temporal = fs.mkdtempSync(path.join(os.tmpdir(), 'musa-publicar-'));
try {
  for (const a of ARCHIVOS) fs.cpSync(path.join(RAIZ, a), path.join(temporal, a), { recursive: true });
  fs.writeFileSync(path.join(temporal, '.nojekyll'), ''); // GitHub Pages sirve los archivos tal cual
  git(['init', '-q', '-b', 'gh-pages'], temporal);
  git(['add', '-A'], temporal);
  git([...AUTOR, 'commit', '-q', '-m', `Musa ${version}`], temporal);
  git(['push', '-q', '-f', REPO, 'gh-pages'], temporal);
  console.log(`Publicada ${version} → https://jhfaber.github.io/musa/ (tarda 1 o 2 minutos en actualizarse)`);
} finally {
  fs.rmSync(temporal, { recursive: true, force: true });
}
