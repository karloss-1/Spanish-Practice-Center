import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { onRequest as authStatus } from '../functions/api/auth/status.js';
import { createSession, SESSION_COOKIE } from '../functions/_lib/auth.js';

const env = {
  AUTH_ENABLED: 'true',
  STUDENT_PASSWORD: crypto.randomUUID(),
  SESSION_SECRET: crypto.randomUUID() + crypto.randomUUID()
};
const validSession = await createSession(env);

async function getStatus(authEnv, session) {
  const headers = session ? { Cookie: `${SESSION_COOKIE}=${session}` } : undefined;
  const response = await authStatus({ request: new Request('https://portal.example/api/auth/status', { headers }), env: authEnv });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  return response.json();
}

assert.deepEqual(await getStatus({ ...env, AUTH_ENABLED: 'false' }), { authEnabled: false, authenticated: false });
assert.deepEqual(await getStatus({ ...env, AUTH_ENABLED: 'false' }, validSession), { authEnabled: false, authenticated: false });
assert.deepEqual(await getStatus(env), { authEnabled: true, authenticated: false });
assert.deepEqual(await getStatus(env, validSession), { authEnabled: true, authenticated: true });
for (const unexpectedEnv of [
  { STUDENT_PASSWORD: env.STUDENT_PASSWORD, SESSION_SECRET: env.SESSION_SECRET },
  { ...env, AUTH_ENABLED: '' },
  { ...env, AUTH_ENABLED: 'false ' },
  { ...env, AUTH_ENABLED: 'False' },
  { ...env, AUTH_ENABLED: 'yes' }
]) {
  assert.deepEqual(await getStatus(unexpectedEnv), { authEnabled: true, authenticated: false });
}

const appSource = (await readFile(new URL('../assets/app.js', import.meta.url), 'utf8'))
  .replace("import { validNotionUrl } from './student-routing.mjs';", 'const validNotionUrl = value => value;');
const homeCss = await readFile(new URL('../assets/home.css', import.meta.url), 'utf8');
const homeHtml = await readFile(new URL('../index.html', import.meta.url), 'utf8');

async function renderApp({ home = false, status }) {
  const classes = new Set(home ? ['home'] : []);
  const appendedNavigation = [];
  const appendedHead = [];
  const menu = {
    hidden: false,
    attributes: {},
    addEventListener() {},
    setAttribute(name, value) { this.attributes[name] = value; },
    getAttribute(name) { return this.attributes[name] ?? null; },
    focus() {}
  };
  const navigation = { hidden: false, append(element) { appendedNavigation.push(element); } };
  const document = {
    body: { classList: { contains: name => classes.has(name), add: name => classes.add(name) } },
    head: { append(element) { appendedHead.push(element); } },
    querySelector(selector) {
      if (selector === '.menu-toggle') return menu;
      if (selector === '#navigation') return navigation;
      return null;
    },
    addEventListener() {},
    createElement(tag) {
      const element = { tag, addEventListener() {}, querySelector: () => ({ disabled: false }) };
      return element;
    }
  };
  const fetchCalls = [];
  runInNewContext(appSource, {
    document,
    matchMedia: () => ({ matches: false, addEventListener() {} }),
    fetch: async (...args) => {
      fetchCalls.push(args);
      return { ok: true, json: async () => status };
    }
  });
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(fetchCalls.length, 1);
  assert.equal(fetchCalls[0][0], '/api/auth/status');
  return { classes, appendedNavigation, appendedHead };
}

const publicHome = await renderApp({ home: true, status: await getStatus({ ...env, AUTH_ENABLED: 'false' }) });
assert.ok(publicHome.classes.has('auth-disabled'));
assert.ok(!publicHome.classes.has('student-authenticated'));
const lockedHome = await renderApp({ home: true, status: await getStatus(env) });
assert.ok(!lockedHome.classes.has('auth-disabled'));
assert.ok(!lockedHome.classes.has('student-authenticated'));
const authenticatedHome = await renderApp({ home: true, status: await getStatus(env, validSession) });
assert.ok(authenticatedHome.classes.has('student-authenticated'));
assert.ok(!authenticatedHome.classes.has('auth-disabled'));
const unknownStatusHome = await renderApp({ home: true, status: {} });
assert.ok(!unknownStatusHome.classes.has('auth-disabled'));
assert.ok(!unknownStatusHome.classes.has('student-authenticated'));

assert.match(homeCss, /\.home \[data-student-access\]::after \{ content: "🔒"/u);
assert.match(homeCss, /\.home:is\(\.student-authenticated, \.auth-disabled\) \[data-student-access\]::after \{ display: none; \}/u);
assert.match(homeCss, /\.home-showcase-access \{[^}]+display: inline-flex/u);
assert.match(homeCss, /\.home:is\(\.student-authenticated, \.auth-disabled\) \.home-showcase-access \{ display: none; \}/u);
assert.match(homeHtml, /data-student-access/u);
assert.match(homeHtml, />Student access required<\/span>/u);

for (const status of [
  await getStatus({ ...env, AUTH_ENABLED: 'false' }),
  await getStatus(env),
  {}
]) {
  const internal = await renderApp({ status });
  assert.equal(internal.appendedNavigation.length, 0, 'logout must stay hidden unless auth is enabled and session is valid');
  assert.equal(internal.appendedHead.length, 0, 'logout stylesheet is only loaded for a valid authenticated session');
}
const authenticatedInternal = await renderApp({ status: await getStatus(env, validSession) });
assert.equal(authenticatedInternal.appendedNavigation.length, 1);
assert.equal(authenticatedInternal.appendedHead.length, 1);
assert.equal(authenticatedInternal.appendedHead[0].href, '/assets/auth.css');
assert.equal(authenticatedInternal.appendedNavigation[0].action, '/student-access/logout');
assert.equal(authenticatedInternal.appendedNavigation[0].method, 'post');
assert.match(authenticatedInternal.appendedNavigation[0].innerHTML, /Log out/u);

console.log('Authentication UI checks passed: status modes, retained Home indicators, hidden public logout, authenticated logout and fail-closed unknown status.');
