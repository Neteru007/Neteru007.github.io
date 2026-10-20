import { isCatalog } from '../src/app/features/theurgy/data/catalog.models.ts';
import '@angular/compiler';
import { DefaultUrlSerializer } from '@angular/router';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const read = async (kind) =>
  JSON.parse(await readFile(new URL('../public/data/' + kind + '.json', import.meta.url), 'utf8'));
const demons = await read('demons'),
  angels = await read('angels');
for (const [kind, entries] of [
  ['demons', demons],
  ['angels', angels],
]) {
  assert.equal(entries.length, 72);
  assert(isCatalog(entries));
  assert(!isCatalog(entries.slice(0, 71)));
  const duplicate = structuredClone(entries);
  duplicate[0].id = duplicate[1].id;
  assert(!isCatalog(duplicate));
  assert.deepEqual(
    entries.map((e) => e.id),
    Array.from({ length: 72 }, (_, i) => i + 1),
  );
  for (const entry of entries) {
    assert.equal(entry.kind, kind);
    for (const field of [
      'name',
      'latin',
      'element',
      'sign',
      'sector',
      'description',
      'appearance',
      'original',
      'symbol',
    ])
      assert.equal(typeof entry[field], 'string');
    assert(entry.planets.length > 0);
    assert(entry.invocation.text && entry.invocation.note && entry.invocation.source.url);
    assert(entry.sources.length > 0 && entry.facts.length > 0);
    for (const source of [...entry.sources, entry.invocation.source])
      assert.equal(new URL(source.url).protocol, 'https:');
    if (entry.illustration)
      assert(
        entry.illustration.width > 0 &&
          entry.illustration.height > 0 &&
          entry.illustration.page &&
          entry.illustration.caption,
      );
  }
}
assert.equal(demons.filter((e) => e.illustration).length, 72);
assert.equal(demons.filter((e) => e.illustration.kind === 'portrait').length, 35);
assert.equal(demons.filter((e) => e.illustration.kind === 'document').length, 37);
assert.equal(angels.filter((e) => e.illustration?.kind === 'seal').length, 72);
assert.equal(demons[1].sector, '10–20°');
assert.equal(demons[36].sign, 'Овен');
assert.equal(demons[67].sign, 'Водолій');
assert(demons[67].notes.some((n) => n.includes('Землею')));
assert.deepEqual(demons[49].planets, ['Сатурн']);
assert.equal(angels[69].invocation.text, 'In principio creavit Deus caelum et terram.');
assert.equal(angels[71].invocation.label, 'Псалом 114:7 · вірш звернення');
assert.equal(demons.filter((e) => e.element === 'Вода').length, 18);
assert.equal(angels.filter((e) => e.element === 'Земля').length, 18);
console.log(
  'Validated 144 entries, source URLs, 35 engravings, 37 source excerpts, 72 angel seals, traditions and invocation mappings.',
);

const parser = new DefaultUrlSerializer();
assert.equal(parser.serialize(parser.parse('demonology')), '/demonology');
assert.equal(parser.serialize(parser.parse('angelology')), '/angelology');

for (const e of [...demons, ...angels]) {
  if (e.illustration.src.startsWith('/catalogues/artwork/')) {
    const path = e.illustration.src.replace('/catalogues/', '../public/');
    const svg = await readFile(new URL(path, import.meta.url), 'utf8');
    assert(svg.includes('data:image/png;base64,'));
    assert(!svg.includes('<script'));
  }
}
