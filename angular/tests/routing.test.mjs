import test from 'node:test';
import assert from 'node:assert/strict';
import { pureModule, source, ts } from './helpers.mjs';
const { legacyRoute } = await pureModule('core/routing/legacy-route.ts');
test('published catalogue, library, rune and topic links still map to the right Angular routes', () => {
  const cases = [
    ['/theurgy.html', '', '', '/theurgy'],
    ['/theurgy.html', '#/', '', '/theurgy'],
    ['/theurgy.html', '#angelology', '', '/angelology'],
    ['/theurgy.html', '#/demonology/68', '', '/demonology/68'],
    ['/goetia-spirit.html', '', '?id=68', '/demonology/68'],
    ['/shem-angel.html', '', '?id=01', '/angelology/1'],
    ['/shem-angel.html', '', '?id=73', '/angelology'],
    ['/shem-angel.html', '', '?id=1x', '/angelology'],
    ['/divination.html', '#runes', '', '/divination/runes'],
    ['/belial.html', '', '', '/belial'],
    ['/article-intention.html', '', '', '/articles/intention'],
    ['/', '#library', '', '/#library'],
    [
      '/forum.html',
      '#topic=12345678-1234-1234-1234-123456789abc',
      '',
      '/forum/12345678-1234-1234-1234-123456789abc',
    ],
    ['/forum.html', '#topic=invalid', '', '/forum'],
  ];
  for (const [p, h, s, expected] of cases) assert.equal(legacyRoute(p, h, s), expected);
});
const callbackSource = (await source('core/routing/prepare-location.ts'))
  .replace(/import \{ legacyRoute \} from '.\/legacy-route';/, '')
  .replace("await import('../auth/supabase-client')", 'await getClient()')
  .replace('export async function', 'async function');
const callbackCode = ts.transpileModule(callbackSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
async function callback(hash, result, search = '') {
  const events = [];
  const location = { pathname: '/forum.html', hash, search };
  let destination = '';
  const history = {
    replaceState(_state, _title, url) {
      events.push('route');
      destination = url;
    },
  };
  const getClient = async () => ({
    supabase: {
      auth: {
        async getSession() {
          events.push('session');
          assert.equal(location.hash, hash);
          return result;
        },
      },
    },
  });
  await new Function(
    'location',
    'history',
    'legacyRoute',
    'getClient',
    callbackCode + ';return prepareLocation();',
  )(location, history, legacyRoute, getClient);
  return { events, destination };
}
test('email recovery tokens are consumed before canonicalizing the URL', async () => {
  const r = await callback('#access_token=test&refresh_token=test&type=recovery', {
    data: { session: {} },
    error: null,
  });
  assert.deepEqual(r.events, ['session', 'route']);
  assert.equal(r.destination, '/#/forum?auth=recovery');
});
test('confirmation callback opens forum with success; invalid callback does not claim success', async () => {
  const success = await callback('#access_token=test&type=signup', {
    data: { session: {} },
    error: null,
  });
  assert.equal(success.destination, '/#/forum?auth=confirmed');
  const invalid = await callback('#access_token=expired&type=signup', {
    data: { session: null },
    error: { message: 'Expired' },
  });
  assert.equal(invalid.destination, '/#/forum?authError=Expired');
});
test('email error link is displayed without trying to establish a session', async () => {
  const r = await callback('#error_description=Link%20expired', null);
  assert.deepEqual(r.events, ['route']);
  assert.equal(r.destination, '/#/forum?authError=Link%20expired');
});
