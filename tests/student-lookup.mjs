import assert from 'node:assert/strict';
import { onRequest } from '../functions/api/student-lookup.js';
import { onRequest as middleware } from '../functions/_middleware.js';
import { createSession, SESSION_COOKIE } from '../functions/_lib/auth.js';

// Entirely synthetic data: never import real student records into the repository.
const records = new Map([
  ['student:example', { active: true, url: 'https://example.notion.site/synthetic-active', privateField: 'must not leak' }],
  ['student:example m', { active: true, url: 'https://example.notion.site/synthetic-other-student' }],
  ['student:inactive', { active: false, url: 'https://example.notion.site/synthetic-inactive' }],
  ['student:duplicate', { ambiguous: true }],
  ['student:duplicate a', { active: true, url: 'https://example.notion.site/synthetic-initial' }],
  ['student:unsafe', { active: true, url: 'https://notion.site.evil.example/page' }]
]);
let reads = [];
const env = { AUTH_ENABLED: 'true', SESSION_SECRET: crypto.randomUUID() + crypto.randomUUID(), STUDENT_PASSWORD: crypto.randomUUID(), STUDENTS: { get: async key => { reads.push(key); return records.get(key) ?? null; } } };
const session = await createSession(env);
async function lookup(name, options = {}) {
  return onRequest({ request: new Request('https://portal.example/api/student-lookup', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://portal.example', ...(options.authenticated === false ? {} : { Cookie: `${SESSION_COOKIE}=${session}` }), ...options.headers },
    body: options.body ?? JSON.stringify({ name })
  }), env: options.env ?? env });
}
for (const name of ['Example', 'EXAMPLE', '   Example  ', 'Ｅｘａｍｐｌｅ']) {
  reads = [];
  const response = await lookup(name);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), { url: records.get('student:example').url });
  assert.deepEqual(reads, ['student:example']);
}
for (const authEnv of [env, { ...env, AUTH_ENABLED: '' }, { ...env, AUTH_ENABLED: 'false?' }, noAuthToggleEnv()]) {
  assert.equal((await lookup('Example', { authenticated: false, env: authEnv })).status, 401, 'lookup must require a session unless AUTH_ENABLED is exactly false');
}
reads = [];
const authDisabledEnv = { ...env, AUTH_ENABLED: 'false' };
const disabledLookup = await lookup('Example', { authenticated: false, env: authDisabledEnv });
assert.equal(disabledLookup.status, 200);
assert.deepEqual(await disabledLookup.json(), { url: records.get('student:example').url });
assert.deepEqual(reads, ['student:example']);
assert.equal((await lookup('Example', { authenticated: false, env: authDisabledEnv, headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
const endToEndRequest = new Request('https://portal.example/api/student-lookup', {
  method: 'POST', headers: { 'Content-Type': 'application/json', Origin: 'https://portal.example' }, body: JSON.stringify({ name: 'Example' })
});
const endToEndLookup = await middleware({ request: endToEndRequest, env: authDisabledEnv, next: () => onRequest({ request: endToEndRequest, env: authDisabledEnv }) });
assert.equal(endToEndLookup.status, 200, 'the shared middleware and existing KV lookup must work together when authentication is disabled');
assert.deepEqual(await endToEndLookup.json(), { url: records.get('student:example').url });
const missing = await lookup('Unknown');
assert.deepEqual(await (await lookup('Example M.')).json(), { url: records.get('student:example m').url });
assert.equal((await lookup('Exam')).status, 404);
const inactive = await lookup('Inactive');
assert.equal(missing.status, 404);
assert.equal(inactive.status, 404);
assert.equal(await missing.text(), await inactive.text());
for (const name of ['', ' ', null, [], 42, 'a'.repeat(101), 'a\u0000']) {
  reads = [];
  assert.equal((await lookup(name)).status, 400);
  assert.equal(reads.length, 0);
}
assert.equal((await lookup('Duplicate')).status, 409);
assert.equal((await lookup(' Duplicate   A. ')).status, 200);
assert.equal((await lookup('Unsafe')).status, 404);
assert.equal((await lookup('Example', { body: '{' })).status, 400);
assert.equal((await lookup('Example', { body: JSON.stringify({ name: 'Example', list: true }) })).status, 400);
assert.equal((await lookup('Example', { body: ' '.repeat(1025) })).status, 400);
assert.equal((await lookup('Example', { headers: { 'Content-Type': 'text/plain' } })).status, 415);
assert.equal((await lookup('Example', { headers: { Origin: 'https://unrelated.example' } })).status, 403);
assert.equal((await lookup('Example', { headers: { 'Sec-Fetch-Site': 'cross-site' } })).status, 403);
for (const method of ['GET', 'OPTIONS', 'PUT', 'DELETE']) {
  const response = await onRequest({ request: new Request('https://portal.example/api/student-lookup', { method }), env });
  assert.equal(response.status, 405);
  assert.equal(response.headers.get('allow'), 'POST');
}
assert.equal((await lookup('Example', { headers: { Cookie: '' } })).status, 401);
const failure = await lookup('Example', { env: { ...env, STUDENTS: { get() { throw new Error('private storage detail'); } } } });
assert.equal(failure.status, 503);
assert.deepEqual(await failure.json(), { error: 'unavailable' });
assert.equal((await lookup('Example', { env: {} })).status, 401);
console.log('Student API checks passed: normalization, privacy, inactivity, ambiguity, validation and failures.');

function noAuthToggleEnv() {
  const copy = { ...env };
  delete copy.AUTH_ENABLED;
  return copy;
}
