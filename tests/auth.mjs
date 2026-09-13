import assert from 'node:assert/strict';
import { clearSessionCookie, createSession, hasValidSession, passwordMatches, safeReturnPath, sessionCookie, SESSION_COOKIE, SESSION_MAX_AGE } from '../functions/_lib/auth.js';
import { onRequest as middleware } from '../functions/_middleware.js';
import { onRequest as studentAccess } from '../functions/student-access.js';
import { onRequest as logout } from '../functions/student-access/logout.js';
import { onRequest as go } from '../functions/go/[resource].js';

const env = { STUDENT_PASSWORD: crypto.randomUUID(), SESSION_SECRET: crypto.randomUUID() + crypto.randomUUID() };
const now = Date.now();
const token = await createSession(env, now);
const authenticatedRequest = path => new Request(`https://portal.example${path}`, { headers: { Cookie: `${SESSION_COOKIE}=${token}` } });

assert.equal(await hasValidSession(authenticatedRequest('/resources.html'), env, now), true);
assert.equal(await hasValidSession(new Request('https://portal.example/resources.html'), env, now), false);
assert.equal(await hasValidSession(new Request('https://portal.example/resources.html', { headers: { Cookie: `${SESSION_COOKIE}=${token}x` } }), env, now), false);
assert.equal(await hasValidSession(authenticatedRequest('/resources.html'), env, now + (SESSION_MAX_AGE + 1) * 1000), false);
assert.equal(await passwordMatches(env.STUDENT_PASSWORD, env), true);
assert.equal(await passwordMatches('wrong', env), false);
assert.match(sessionCookie(token), /Max-Age=2592000/u);
for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(sessionCookie(token).includes(flag));
assert.match(clearSessionCookie(), /Max-Age=0/u);

assert.equal(safeReturnPath('/resources.html?view=all', 'https://portal.example'), '/resources.html?view=all');
for (const unsafe of ['https://evil.example/', '//evil.example/', 'javascript:alert(1)', '/student-access']) assert.equal(safeReturnPath(unsafe, 'https://portal.example'), '/');

let nextCalls = 0;
const deniedPage = await middleware({ request: new Request('https://portal.example/resources.html?view=all'), env, next: async () => { nextCalls += 1; } });
assert.equal(deniedPage.status, 401);
assert.match(await deniedPage.text(), /name="returnTo" value="\/resources\.html\?view=all"/u);
const deniedApi = await middleware({ request: new Request('https://portal.example/api/student-lookup'), env, next: async () => { nextCalls += 1; } });
assert.equal(deniedApi.status, 401);
await middleware({ request: authenticatedRequest('/resources.html'), env, next: async () => { nextCalls += 1; return new Response('protected'); } });
assert.equal(nextCalls, 1);

function loginRequest(password, returnTo = '/resources.html', origin = 'https://portal.example') {
  return new Request('https://portal.example/student-access', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: origin },
    body: new URLSearchParams({ password, returnTo })
  });
}
const badLogin = await studentAccess({ request: loginRequest('wrong'), env });
assert.equal(badLogin.status, 401);
assert.match(await badLogin.text(), /wasn’t correct/u);
const goodLogin = await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD), env });
assert.equal(goodLogin.status, 303);
assert.equal(goodLogin.headers.get('location'), '/resources.html');
assert.match(goodLogin.headers.get('set-cookie'), /HttpOnly/u);
const unsafeLogin = await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD, '//evil.example/'), env });
assert.equal(unsafeLogin.headers.get('location'), '/');
assert.equal((await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD, '/', 'https://evil.example'), env })).status, 403);
const fetchMetadataLogin = new Request('https://portal.example/student-access', {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Sec-Fetch-Site': 'same-origin' },
  body: new URLSearchParams({ password: env.STUDENT_PASSWORD, returnTo: '/practice.html' })
});
assert.equal((await studentAccess({ request: fetchMetadataLogin, env })).headers.get('location'), '/practice.html');
assert.equal((await studentAccess({ request: new Request('https://portal.example/student-access', {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ password: env.STUDENT_PASSWORD })
}), env })).status, 403);

const logoutResponse = logout({ request: new Request('https://portal.example/student-access/logout', { method: 'POST', headers: { Origin: 'https://portal.example' } }) });
assert.equal(logoutResponse.status, 303);
assert.match(logoutResponse.headers.get('set-cookie'), /Max-Age=0/u);
assert.equal((await go({ request: new Request('https://portal.example/go/flashcards'), params: { resource: 'flashcards' } })).headers.get('location'), 'https://karloss-1.github.io/Mexican-Spanish/');
assert.equal((await go({ request: new Request('https://portal.example/go/not-allowed'), params: { resource: 'not-allowed' } })).status, 404);

console.log('Authentication checks passed: password verification, signed 30-day sessions, route enforcement, safe returns, logout and external allowlist.');
