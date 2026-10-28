import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import ts from 'typescript';
const tmp = await mkdtemp(path.resolve('.hd-test-'));
const root = path.resolve('src/app/features/human-design');
for (const dir of ['domain', 'data']) {
  await mkdir(path.join(tmp, dir));
  for (const file of await readdir(path.join(root, dir))) {
    const result = ts.transpileModule(await readFile(path.join(root, dir, file), 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS },
    });
    await writeFile(path.join(tmp, dir, file.replace(/\.ts$/, '.js')), result.outputText);
  }
}
await writeFile(path.join(tmp, 'package.json'), '{"type":"commonjs"}');
const require = createRequire(path.join(tmp, 'entry.cjs'));
const {
  gateAt,
  designInstant,
  longitude,
  definition,
  calculate,
  activations,
} = require('./domain/calculate.js');
const { surroundings } = require('./domain/connections.js');
const { birthInstant } = require('./domain/birth-time.js');
const { CHANNELS } = require('./data/channels.js');
const { GATES } = require('./data/gates.js');
const { Body } = require('astronomy-engine');
await rm(tmp, { recursive: true, force: true });
const birth = {
  name: 'Тест',
  date: '1990-07-01',
  time: '12:00',
  zone: 'Europe/Kyiv',
  place: 'Київ, Україна',
  offset: '',
};
test('all 384 gate-line sectors, wraparound and opposite Earth gates', () => {
  const sectors = new Set();
  for (let i = 0; i < 384; i++) {
    const a = gateAt(302 + ((i + 0.5) * 360) / 384);
    sectors.add(`${a.gate}.${a.line}`);
  }
  assert.equal(sectors.size, 384);
  assert.equal(Object.keys(GATES).length, 64);
  assert.deepEqual(gateAt(302), { gate: 41, line: 1 });
  assert.deepEqual(gateAt(-58), gateAt(302));
  assert.deepEqual(gateAt(307.625), { gate: 19, line: 1 });
  assert.equal(gateAt(122).gate, 31);
  assert.throws(() => gateAt(NaN));
});
test('historical Ukrainian offsets, winter/summer, half-hour zones and explicit override', () => {
  assert.equal(
    birthInstant({ ...birth, date: '1990-07-01' }).toISOString(),
    '1990-07-01T09:00:00.000Z',
  );
  assert.equal(
    birthInstant({ ...birth, date: '2000-01-01' }).toISOString(),
    '2000-01-01T10:00:00.000Z',
  );
  assert.equal(
    birthInstant({ ...birth, date: '2000-07-01' }).toISOString(),
    '2000-07-01T09:00:00.000Z',
  );
  assert.equal(
    birthInstant({ ...birth, zone: 'Asia/Kolkata' }).toISOString(),
    '1990-07-01T06:30:00.000Z',
  );
  assert.equal(
    birthInstant({ ...birth, offset: '+04:00' }).toISOString(),
    '1990-07-01T08:00:00.000Z',
  );
});
test('DST gap and duplicate time require correction; invalid dates/zones/offsets fail', () => {
  assert.throws(() => birthInstant({ ...birth, date: '2024-03-31', time: '03:30' }), /не існувало/);
  assert.throws(
    () => birthInstant({ ...birth, date: '2024-10-27', time: '03:30' }),
    /повторювався/,
  );
  for (const change of [
    { date: '2000-02-30' },
    { date: '1899-01-01' },
    { time: '24:00' },
    { zone: 'not-a-zone' },
    { offset: '+14:30' },
    { offset: '03:00' },
  ])
    assert.throws(() => birthInstant({ ...birth, ...change }));
});
test('design epoch solves 88-degree arc across all seasons and year wrap', () => {
  for (const iso of ['2000-01-01', '1984-03-01', '1990-07-01', '2005-10-01']) {
    const t = new Date(iso + 'T12:00:00Z'),
      d = designInstant(t);
    const arc = (longitude(Body.Sun, t) - longitude(Body.Sun, d) + 360) % 360;
    assert(Math.abs(arc - 88) < 0.000001);
    assert((t - d) / 86400000 > 85 && (t - d) / 86400000 < 95);
  }
});
test('36 unique channels cover all gates and yield all five types and authority hierarchy', () => {
  assert.equal(CHANNELS.length, 36);
  assert.equal(new Set(CHANNELS.flatMap((c) => c.gates)).size, 64);
  for (const [gates, type, authority] of [
    [[], 'reflector', 'lunar'],
    [[5, 15], 'generator', 'sacral'],
    [[34, 20], 'manifesting-generator', 'sacral'],
    [[21, 45], 'manifestor', 'ego-manifested'],
    [[12, 22], 'manifestor', 'emotional'],
    [[57, 20], 'projector', 'splenic'],
    [[25, 51], 'projector', 'ego-projected'],
    [[1, 8], 'projector', 'self'],
    [[17, 62], 'projector', 'environment'],
    [[5, 15, 59, 6], 'generator', 'emotional'],
    [[5, 15, 1, 8], 'manifesting-generator', 'sacral'],
  ]) {
    const d = definition(gates);
    assert.equal(d.type, type);
    assert.equal(d.authority, authority);
  }
  assert.equal(definition([5, 15, 61, 24]).groups.length, 2);
  assert.equal(definition([5]).centers.length, 0);
});
test('astronomical coordinates match 55 independent Swiss Ephemeris positions within 0.02 degrees', async () => {
  const fixtures = JSON.parse(
    await readFile(new URL('./fixtures/human-design-longitudes.json', import.meta.url), 'utf8'),
  );
  for (const sample of fixtures.samples) {
    for (const a of activations(new Date(sample.utc))) {
      const expected = sample.longitudes[a.planet];
      if (expected === undefined) continue;
      const delta = Math.abs(((a.longitude - expected + 540) % 360) - 180);
      assert(delta < 0.02, `${sample.utc} ${a.planet}: ${delta}°`);
    }
  }
});
test('full chart is deterministic and snapshots the input; no future birth accepted', () => {
  const a = calculate(birth),
    b = calculate(birth);
  assert.deepEqual(a, b);
  assert.equal(a.personality.length, 13);
  assert.equal(a.design.length, 13);
  assert.notEqual(a.birth, birth);
  assert.match(a.profile, /^[1-6]\/[1-6]$/);
  assert.throws(() => calculate({ ...birth, date: '2100-01-01' }), /майбутньому/);
});

test('complements require exactly one natal gate; no invented completion for absent pairs', () => {
  const result = surroundings([15, 13, 33], [['g', 'throat']]);
  assert(result.complements.some((c) => c.ownGate === 15 && c.otherGate === 5));
  assert(
    !result.complements.some((c) => c.channel.gates.includes(13) && c.channel.gates.includes(33)),
  );
  assert(!result.complements.some((c) => c.channel.gates.includes(61)));
  assert.equal(result.singles.length, 0);
  assert.equal(result.doubles.length, 0);
  assert.equal(surroundings([], []).complements.length, 0);
});
test('bridge must connect existing networks, not merely complete any channel', () => {
  const result = surroundings(
    [13, 33, 42, 53, 15, 61],
    [
      ['g', 'throat'],
      ['sacral', 'root'],
    ],
  );
  assert(
    result.singles.some((b) => b.gates[0] === 5 && b.links.some((p) => p[0] === 1 && p[1] === 2)),
  );
  assert(!result.singles.some((b) => b.gates[0] === 24));
});
test('two-gate bridges require both activations and exclude redundant supersets', () => {
  const groups = [
    ['head', 'ajna'],
    ['g', 'throat'],
  ];
  const result = surroundings([61, 24, 13, 33], groups);
  assert.equal(result.singles.length, 0);
  assert(result.doubles.some((b) => b.gates.includes(17) && b.gates.includes(62)));
  for (const bridge of result.doubles) {
    const full = definition([61, 24, 13, 33, ...bridge.gates]);
    assert.equal(full.groups.length, 1);
    for (const gate of bridge.gates)
      assert.equal(definition([61, 24, 13, 33, gate]).groups.length, 2);
  }
  const narrow = surroundings([61, 24, 13, 33, 17], groups);
  assert(narrow.singles.some((b) => b.gates[0] === 62));
  assert(!narrow.doubles.some((b) => b.gates.includes(62)));
});
