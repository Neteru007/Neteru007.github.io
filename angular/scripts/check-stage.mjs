import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { Script } from 'node:vm';
import path from 'node:path';
const root = process.argv[2];
assert(root, 'Pass the staged root directory');
const index = await readFile(path.join(root, 'theurgy.html'), 'utf8');
assert(index.includes('<mg-root>'));
for (const match of index.matchAll(/(?:src|href)="(\/catalogues\/[^"?#]+)"/g)) await readFile(path.join(root, match[1]));
const files = await readdir(path.join(root, 'catalogues'));
assert(files.filter(f => /^chunk-.*\.js$/.test(f)).length >= 4);
for (const [file, route] of [['goetia-spirit.html', 'demonology'], ['shem-angel.html', 'angelology']]) {
  const html = await readFile(path.join(root, file), 'utf8');
  const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
  for (const id of ['1', '68', '72', '0', '73', '1x', '']) {
    let destination = '';
    new Script(script).runInNewContext({ URLSearchParams, location: { search: '?id=' + id, replace: value => { destination = value; } } });
    const valid = /^\d{1,2}$/.test(id) && Number(id) >= 1 && Number(id) <= 72;
    assert.equal(destination, '/theurgy.html#/' + route + (valid ? '/' + Number(id) : ''));
  }
}
console.log('Staged entry point, asset references, lazy chunks and legacy redirects pass.');
