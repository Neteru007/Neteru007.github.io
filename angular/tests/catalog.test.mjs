import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { pureModule } from './helpers.mjs';
const { catalogRanks, hasRank } = await pureModule('features/theurgy/data/catalog.models.ts');
const demons = JSON.parse(await readFile(new URL('../public/data/demons.json', import.meta.url)));

test('rank choices cover individual ranks without combined duplicates', () => {
  assert.deepEqual(catalogRanks(demons), [
    'Герцог',
    'Граф',
    'Князь',
    'Король',
    'Лицар',
    'Маркіз',
    'Президент',
  ]);
  assert.deepEqual(catalogRanks([]), []);
});
test('each part of a combined rank matches, including counts from the real catalogue', () => {
  for (const entry of demons) {
    for (const rank of entry.rank.split('/').map((value) => value.trim())) {
      assert.ok(hasRank(entry, rank), `${entry.name}: ${rank}`);
    }
    assert.ok(hasRank(entry, ''));
    assert.equal(hasRank(entry, 'Невідомий'), false);
  }
  assert.equal(demons.filter((entry) => hasRank(entry, 'Граф')).length, 12);
  assert.equal(hasRank({}, 'Граф'), false);
  assert.equal(hasRank({}, ''), true);
});
