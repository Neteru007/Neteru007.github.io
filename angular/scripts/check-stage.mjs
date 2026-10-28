import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pages } from '../seo/pages.mjs';
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
  (await htmlFiles(root)).sort(),
  ['index.html', ...pages.map((page) => page.slug + '/index.html')].sort(),
  'Only the application entry and generated SEO guides are allowed',
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
console.log('Application entry, generated SEO guides and compiled dependencies pass.');
// Check the actual generated output, including crawler-visible content and local links.
const canonicals = new Set();
for (const file of await htmlFiles(root)) {
  const source = await readFile(path.join(root, file), 'utf8');
  const expected =
    'https://neteru007.github.io/' +
    (file === 'index.html' ? '' : file.replace(/index\.html$/, ''));
  const canonical = source.match(/rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(canonical, expected, 'Wrong canonical in ' + file);
  assert(!canonicals.has(canonical), 'Duplicate canonical');
  canonicals.add(canonical);
  assert(source.match(/<h1[ >]/g)?.length === 1, 'One visible H1 per page: ' + file);
  assert(source.includes('name="description"'));
  assert(source.includes('property="og:title"'));
  assert(!source.includes('{{'), 'Unresolved template token: ' + file);
  for (const script of source.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    const data = JSON.parse(script[1]);
    assert.equal(data.url, expected);
    assert.equal(data.inLanguage, 'uk');
  }
  for (const match of source.matchAll(/(?:href|src)="(\/[^"?#]*)[^"\s]*"/g)) {
    const pathname = match[1];
    const target = pathname.endsWith('/') ? pathname + 'index.html' : pathname;
    await readFile(path.join(root, target));
  }
}
const sitemap = await readFile(path.join(root, 'sitemap.xml'), 'utf8');
assert.deepEqual(new Set([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1])), canonicals);
assert(!sitemap.includes('#/'));
assert(
  (await readFile(path.join(root, 'robots.txt'), 'utf8')).includes(
    'Sitemap: https://neteru007.github.io/sitemap.xml',
  ),
);
console.log(`${canonicals.size} unique canonicals, JSON-LD, local links and sitemap entries pass.`);
