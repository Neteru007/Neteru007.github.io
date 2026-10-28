import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateSeo } from './generate-seo.mjs';
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
// The application keeps one entry point; standalone guides are generated below.
await writeFile(path.join(outputRoot, 'index.html'), index);
await rm(path.join(outputRoot, 'catalogues/index.html'), { force: true });
for (const entry of await readdir(outputRoot)) {
  // Search Console verification files must survive every deployment.
  if (entry.endsWith('.html') && entry !== 'index.html' && !/^google[a-f0-9]+\.html$/.test(entry)) {
    await rm(path.join(outputRoot, entry));
  }
}
await writeFile(path.join(outputRoot, '.nojekyll'), '');
await generateSeo(outputRoot);
console.log('Staged Angular application and searchable guides at ' + outputRoot);
