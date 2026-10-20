import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputRoot = path.resolve(process.argv[2] || path.join(project, '..'));
const built = path.join(project, 'dist/catalogues/browser');
await mkdir(outputRoot, { recursive: true });
await rm(path.join(outputRoot, 'catalogues'), { recursive: true, force: true });
await cp(built, path.join(outputRoot, 'catalogues'), { recursive: true });
const index = await readFile(path.join(built, 'index.html'), 'utf8');
const entries = [
  'index.html',
  'theurgy.html',
  'goetia-spirit.html',
  'shem-angel.html',
  'forum.html',
  'divination.html',
  'belial.html',
  'article-attention.html',
  'article-intention.html',
  'article-journal.html',
  'article-sources.html',
  'article-symbols.html',
];
for (const file of entries) await writeFile(path.join(outputRoot, file), index);
await writeFile(path.join(outputRoot, '.nojekyll'), '');
console.log(
  'Staged all ' + entries.length + ' entry points with shared Angular bootstrap at ' + outputRoot,
);
