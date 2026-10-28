import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { generateSeo } from '../scripts/generate-seo.mjs';

test('Kyiv guide renders without JavaScript and keeps all published guide URLs in the sitemap', async () => {
  const output = await mkdtemp(path.join(os.tmpdir(), 'neteru-seo-'));
  try {
    await generateSeo(output);
    const html = await readFile(path.join(output, 'vidma-kyiv/index.html'), 'utf8');
    assert.match(html, /<h1>Відьма Київ:/);
    assert.match(html, /<title>Відьма Київ/);
    assert.equal((html.match(/<h1>/g) || []).length, 1);
    assert.match(html, /href="https:\/\/neteru007.github.io\/vidma-kyiv\/"/);
    assert.match(html, /href="\/#\/divination\/tarot"/);
    assert(!html.includes('{{'));
    const schema = JSON.parse(html.match(/application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
    assert.equal(schema.url, 'https://neteru007.github.io/vidma-kyiv/');
    assert.equal(schema.breadcrumb.itemListElement[1].item, schema.url);
    const sitemap = await readFile(path.join(output, 'sitemap.xml'), 'utf8');
    const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    assert.equal(urls.length, 14);
    assert.equal(new Set(urls).size, urls.length);
    for (const url of urls.filter((url) => url !== 'https://neteru007.github.io/')) {
      await readFile(path.join(output, new URL(url).pathname, 'index.html'));
    }
    assert(!sitemap.includes('#/'));
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});
