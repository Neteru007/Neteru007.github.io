import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(process.argv[2] || path.join(project, '..'));
const built = path.join(project, 'dist/catalogues/browser');
const destination = path.join(outputRoot, 'catalogues');
await mkdir(outputRoot, { recursive: true });
await rm(destination, { recursive: true, force: true });
await cp(built, destination, { recursive: true });
const index = await readFile(path.join(built, 'index.html'), 'utf8');
await writeFile(path.join(outputRoot, 'theurgy.html'), index);
for (const [file, section] of [['goetia-spirit.html', 'demonology'], ['shem-angel.html', 'angelology']]) {
  const script = `const raw=new URLSearchParams(location.search).get('id')||'';const id=/^\\d{1,2}$/.test(raw)&&Number(raw)>=1&&Number(raw)<=72?String(Number(raw)):'';location.replace('/theurgy.html#/${section}'+(id?'/'+id:''));`;
  await writeFile(path.join(outputRoot, file), `<!doctype html><html lang="uk"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Перехід до каталогу — magic_gallery</title></head><body><p>Відкриваємо сторінку…</p><a href="/theurgy.html#/${section}">До галереї</a><script>${script}</script></body></html>`);
}
console.log('Staged Angular assets and backwards-compatible HTML entry points at ' + outputRoot);
