import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
const root = process.argv[2];
assert(root, 'Pass staged directory');
async function htmlFiles(dir) {
  const result = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await htmlFiles(file)));
    else if (entry.name.endsWith('.html')) result.push(path.relative(root, file));
  }
  return result;
}
assert.deepEqual(
  await htmlFiles(root),
  ['index.html'],
  'Only one deployable HTML entry point is allowed',
);
const html = await readFile(path.join(root, 'index.html'), 'utf8');
assert(html.includes('<mg-root>'));
assert(!/<script>/.test(html));
for (const m of html.matchAll(/(?:src|href)="(\/catalogues\/[^"?#]+)"/g))
  await readFile(path.join(root, m[1]));
const files = await readdir(path.join(root, 'catalogues'));
assert(files.filter((f) => /^chunk-.*\.js$/.test(f)).length >= 15);
for (const file of files.filter((f) => f.endsWith('.js'))) {
  const js = await readFile(path.join(root, 'catalogues', file), 'utf8');
  for (const match of js.matchAll(/["'`]\.\/(chunk-[\w-]+\.js)["'`]/g))
    assert(files.includes(match[1]), 'Missing dynamic dependency ' + match[1]);
}
console.log('Single index.html entry point and all compiled lazy-chunk dependencies pass.');
