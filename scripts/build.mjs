// Builds the single-file site: src/index.html + src/styles.css + src/js/*.js -> dist/index.html
// Usage: node scripts/build.mjs        (no dependencies)
import fs from 'node:fs';
import path from 'node:path';
const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const rd = p => fs.readFileSync(path.join(root, p), 'utf8');
const jsDir = path.join(root, 'src/js');
const app = fs.readdirSync(jsDir).filter(f => f.endsWith('.js')).sort().map(f => fs.readFileSync(path.join(jsDir, f), 'utf8')).join('');
const logo = 'data:image/png;base64,' + fs.readFileSync(path.join(root, 'assets/logo.png')).toString('base64');
let html = rd('src/index.html');
const parts = { '/*@STYLES*/': rd('src/styles.css'), '/*@APP*/': app, '{{LOGO}}': logo };
for (const [k, v] of Object.entries(parts)) {
  if (!html.includes(k)) throw new Error('Template marker missing: ' + k);
  html = html.split(k).join(v); // split/join so "$" in the code is never treated specially
}
fs.mkdirSync(path.join(root, 'dist'), { recursive: true });
fs.writeFileSync(path.join(root, 'dist/index.html'), html);
fs.copyFileSync(path.join(root, 'firebase-config.js'), path.join(root, 'dist/firebase-config.js'));
console.log('Built dist/index.html (' + html.length + ' characters)');
