import assert from 'node:assert/strict';
import { readdir, readFile, access } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('src/app');
async function files(dir) {
  return (
    await Promise.all(
      (await readdir(dir, { withFileTypes: true })).map((e) =>
        e.isDirectory() ? files(path.join(dir, e.name)) : [path.join(dir, e.name)],
      ),
    )
  ).flat();
}
const all = await files(root);
let components = 0;
for (const file of all.filter((f) => f.endsWith('.ts'))) {
  const code = await readFile(file, 'utf8');
  if (file.endsWith('.component.ts')) {
    components++;
    assert(!/\btemplate\s*:|\bstyles\s*:/.test(code), 'Inline UI in ' + file);
    for (const key of ['templateUrl', 'styleUrl']) {
      const match = code.match(new RegExp(key + '\\s*:\\s*[\'"]([^\'"]+)[\'"]'));
      assert(match, key + ' missing in ' + file);
      await access(path.resolve(path.dirname(file), match[1]));
    }
  }
  if (!file.endsWith('.service.ts'))
    assert(!/supabase\.from\(/.test(code), 'Database query outside service: ' + file);
  assert(!/innerHTML\s*=|\.querySelectorAll\(/.test(code), 'Imperative page rendering: ' + file);
}
for (const file of all.filter((f) => f.endsWith('.html'))) {
  const code = await readFile(file, 'utf8');
  assert(!/<script\b|<style\b|\sstyle=|\sonclick=/.test(code), 'Inline implementation in ' + file);
}
assert(components >= 25);
console.log(
  `${components} components: external templates/styles; database calls in services; no legacy DOM rendering.`,
);
