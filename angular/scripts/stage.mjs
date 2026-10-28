import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(process.argv[2] || path.join(project, '..'));
const built = path.join(project, 'dist/catalogues/browser');
await mkdir(outputRoot, { recursive: true });
await rm(path.join(outputRoot, 'catalogues'), { recursive: true, force: true });
await cp(built, path.join(outputRoot, 'catalogues'), { recursive: true });
const licenses = await readFile(path.join(project, 'dist/catalogues/3rdpartylicenses.txt'), 'utf8');
await writeFile(
  path.join(outputRoot, 'catalogues/3rdpartylicenses.txt'),
  licenses
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .join('\n'),
);
const index = await readFile(path.join(built, 'index.html'), 'utf8');
// A single HTML document boots every feature through Angular routes.
await writeFile(path.join(outputRoot, 'index.html'), index);
await rm(path.join(outputRoot, 'catalogues/index.html'), { force: true });
for (const entry of await readdir(outputRoot)) {
  if (entry.endsWith('.html') && entry !== 'index.html') {
    await rm(path.join(outputRoot, entry));
  }
}
await writeFile(path.join(outputRoot, '.nojekyll'), '');
console.log('Staged single index.html and dynamic Angular assets at ' + outputRoot);
