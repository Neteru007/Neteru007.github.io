import test from 'node:test';
import assert from 'node:assert/strict';
import { pureModule, source, ts } from './helpers.mjs';
const { initialRoute } = await pureModule('core/routing/initial-route.ts');
test('all sections use hashes in one document, including library anchors', () => {
  for (const route of [
    '/',
    '/theurgy',
    '/angelology/1',
    '/demonology/68',
    '/articles/intention',
    '/divination/runes',
    '/forum/12345678-1234-1234-1234-123456789abc',
    '/belial',
  ])
    assert.equal(initialRoute('#' + route), route);
  assert.equal(initialRoute('#library'), '/#library');
  assert.equal(initialRoute(''), '/');
});
const callbackSource = (await source('core/routing/prepare-location.ts'))
  .replace(/import \{ initialRoute \} from '.\/initial-route';/, '')
  .replace("await import('../auth/supabase-client')", 'await getClient()')
  .replace('export async function', 'async function');
const callbackCode = ts.transpileModule(callbackSource, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
}).outputText;
async function callback(hash, result, search = '') {
  const events = [];
  const location = { pathname: '/', hash, search };
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
    'initialRoute',
    'getClient',
    callbackCode + ';return prepareLocation();',
  )(location, history, initialRoute, getClient);
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
