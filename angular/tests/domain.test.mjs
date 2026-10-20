import test from 'node:test';
import assert from 'node:assert/strict';
import { pureModule } from './helpers.mjs';
const { randomIndex, drawWithoutReplacement } = await pureModule(
  'features/divination/domain/random.ts',
);
const { deck, runes } = await pureModule('features/divination/data/deck.data.ts');
const { escapePosition } = await pureModule('features/belial/domain/escape.ts');
const { activeBan } = await pureModule('features/forum/data/forum.models.ts');
test('bounded random rejects the biased tail instead of applying modulo immediately', () => {
  let calls = 0;
  assert.equal(
    randomIndex(6, (a) => {
      a[0] = calls++ === 0 ? 0xffffffff : 4;
    }),
    4,
  );
  assert.equal(calls, 2);
  for (const max of [0, -1, 1.5, 4294967297]) assert.throws(() => randomIndex(max), RangeError);
});
test('small deck produces all six possible permutations and preserves its input', () => {
  const original = [1, 2, 3];
  const seen = new Set();
  for (let a = 0; a < 3; a++)
    for (let b = 0; b < 2; b++) {
      const choices = [a, b];
      seen.add(drawWithoutReplacement(original, 3, () => choices.shift()).join(','));
    }
  assert.equal(seen.size, 6);
  assert.deepEqual(original, [1, 2, 3]);
  assert.throws(() => drawWithoutReplacement(original, 4), RangeError);
});
test('three-card draw has no duplicates; all 78 cards have images and runes contain 24 distinct symbols', () => {
  assert.equal(deck.length, 78);
  assert.equal(new Set(deck.map((c) => c.imageFile)).size, 78);
  const drawn = drawWithoutReplacement(deck, 3, () => 0);
  assert.equal(drawn.length, 3);
  assert.equal(new Set(drawn.map((c) => c.name)).size, 3);
  assert.equal(new Set(runes.map((r) => r[0])).size, 24);
});
test('escape stays inside arena even at narrow mobile widths', () => {
  for (const width of [190, 220, 900]) {
    let n = 0;
    const b = {
      width,
      height: 340,
      buttonWidth: 180,
      buttonHeight: 45,
      pointerX: 50,
      pointerY: 60,
    };
    const p = escapePosition(b, () => ((n++ * 37) % 100) / 100);
    assert(p.x >= 0 && p.x + b.buttonWidth <= width);
    assert(p.y >= 0 && p.y + b.buttonHeight <= b.height);
  }
});
test('ban expiry treats forever and future as active, expired records as inactive', () => {
  const now = Date.parse('2026-10-20T00:00:00Z');
  const b = (until_at) => ({ user_id: 'id', reason: '', until_at });
  assert(activeBan(b('infinity'), now));
  assert(activeBan(b('2026-10-21T00:00:00Z'), now));
  assert(!activeBan(b('2026-10-19T00:00:00Z'), now));
  assert(!activeBan(null, now));
});
