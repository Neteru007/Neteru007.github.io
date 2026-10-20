import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const root = process.argv[2];
assert(root, 'Pass staged directory');
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
const canonical = await readFile(path.join(root, 'index.html'), 'utf8');
for (const file of entries) {
  const html = await readFile(path.join(root, file), 'utf8');
  assert.equal(html, canonical);
  assert(html.includes('<mg-root>'));
  assert(!/<script>/.test(html));
  for (const m of html.matchAll(/(?:src|href)="(\/catalogues\/[^"?#]+)"/g))
    await readFile(path.join(root, m[1]));
}
const files = await readdir(path.join(root, 'catalogues'));
assert(files.filter((f) => /^chunk-.*\.js$/.test(f)).length >= 15);
for (const file of files.filter((f) => f.endsWith('.js'))) {
  const js = await readFile(path.join(root, 'catalogues', file), 'utf8');
  for (const match of js.matchAll(/["']\.\/(chunk-[\w-]+\.js)["']/g))
    assert(files.includes(match[1]), 'Missing dynamic dependency ' + match[1]);
}
console.log('All 12 entry points and all compiled lazy-chunk dependencies pass.');
