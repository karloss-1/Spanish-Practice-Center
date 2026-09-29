import assert from 'node:assert/strict';
import { runInNewContext } from 'node:vm';
import { clearSessionCookie, createSession, hasValidSession, passwordMatches, safeReturnPath, sessionCookie, SESSION_COOKIE, SESSION_MAX_AGE } from '../functions/_lib/auth.js';
import { loginPage } from '../functions/_lib/login-page.js';
import { onRequest as middleware } from '../functions/_middleware.js';
import { onRequest as studentAccess } from '../functions/student-access.js';
import { onRequest as logout } from '../functions/student-access/logout.js';
import { onRequest as go } from '../functions/go/[resource].js';

const env = { STUDENT_PASSWORD: crypto.randomUUID(), SESSION_SECRET: crypto.randomUUID() + crypto.randomUUID() };
const page = loginPage('/resources.html');
assert.match(page, /type="password" autocomplete="current-password" autocapitalize="none" autocorrect="off" spellcheck="false"/u);
assert.match(page, /class="password-toggle" type="button" aria-label="Show password"/u);
const input = { type: 'password', value: 'aBc 123!' };
const returnToInput = { value: '/resources.html' };
const location = { hash: '#por-para' };
const toggle = { setAttribute(name, value) { this[name] = value; }, addEventListener(name, callback) { assert.equal(name, 'click'); this.click = callback; } };
const loginForm = { addEventListener(name, callback) { assert.equal(name, 'submit'); this.submit = callback; } };
const loginDocument = {
  getElementById: () => input,
  querySelector(selector) {
    if (selector === '.password-toggle') return toggle;
    if (selector === 'input[name="returnTo"]') return returnToInput;
    if (selector === '.auth-card form') return loginForm;
    return null;
  }
};
runInNewContext(page.match(/<script>(.*?)<\/script>/su)[1], { document: loginDocument, window: { location } });
toggle.click();
assert.equal(input.type, 'text');
assert.equal(input.value, 'aBc 123!');
assert.equal(toggle['aria-label'], 'Hide password');
toggle.click();
assert.equal(input.type, 'password');
assert.equal(input.value, 'aBc 123!');
assert.equal(toggle['aria-label'], 'Show password');
loginForm.submit();
assert.equal(returnToInput.value, '/resources.html#por-para');
location.hash = '';
returnToInput.value = '/resources.html#ser-estar';
loginForm.submit();
assert.equal(returnToInput.value, '/resources.html#ser-estar');
const now = Date.now();
const token = await createSession(env, now);
const authenticatedRequest = path => new Request(`https://portal.example${path}`, { headers: { Cookie: `${SESSION_COOKIE}=${token}` } });

assert.equal(await hasValidSession(authenticatedRequest('/resources.html'), env, now), true);
assert.equal(SESSION_MAX_AGE, 60 * 60 * 24 * 30);
assert.equal(await hasValidSession(new Request('https://portal.example/resources.html'), env, now), false);
assert.equal(await hasValidSession(new Request('https://portal.example/resources.html', { headers: { Cookie: `${SESSION_COOKIE}=${token}x` } }), env, now), false);
assert.equal(await hasValidSession(authenticatedRequest('/resources.html'), env, now + (SESSION_MAX_AGE + 1) * 1000), false);
assert.equal(await passwordMatches(env.STUDENT_PASSWORD, env), true);
assert.equal(await passwordMatches('wrong', env), false);
assert.match(sessionCookie(token), /Max-Age=2592000/u);
for (const flag of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(sessionCookie(token).includes(flag));
assert.match(clearSessionCookie(), /Max-Age=0/u);

assert.equal(safeReturnPath('/resources.html?view=all', 'https://portal.example'), '/resources.html?view=all');
assert.equal(safeReturnPath('/resources.html?view=all#por-para', 'https://portal.example'), '/resources.html?view=all#por-para');
for (const unsafe of ['https://evil.example/', '//evil.example/', 'javascript:alert(1)', '/student-access']) assert.equal(safeReturnPath(unsafe, 'https://portal.example'), '/');

let nextCalls = 0;
const deniedPage = await middleware({ request: new Request('https://portal.example/resources.html?view=all'), env, next: async () => { nextCalls += 1; } });
assert.equal(deniedPage.status, 401);
assert.equal(deniedPage.headers.get('Referrer-Policy'), 'same-origin');
assert.match(await deniedPage.text(), /name="returnTo" value="\/resources\.html\?view=all"/u);
const expiredToken = await createSession(env, now - (SESSION_MAX_AGE + 1) * 1000);
const expiredRequest = new Request('https://portal.example/resources.html', { headers: { Cookie: `${SESSION_COOKIE}=${expiredToken}` } });
assert.equal(await hasValidSession(expiredRequest, env, now), false);
const expiredDeepLink = await middleware({ request: expiredRequest, env, next: async () => new Response('protected') });
assert.equal(expiredDeepLink.status, 401);
assert.match(await expiredDeepLink.text(), /name="returnTo" value="\/resources\.html"/u);
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
const failedDeepLinkLogin = await studentAccess({ request: loginRequest('wrong', '/resources.html#por-para'), env });
assert.equal(failedDeepLinkLogin.status, 401);
assert.match(await failedDeepLinkLogin.text(), /name="returnTo" value="\/resources\.html#por-para"/u);
const successfulDeepLinkLogin = await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD, '/resources.html#por-para'), env });
assert.equal(successfulDeepLinkLogin.status, 303);
assert.equal(successfulDeepLinkLogin.headers.get('location'), '/resources.html#por-para');
assert.match(successfulDeepLinkLogin.headers.get('set-cookie'), /Max-Age=2592000/u);
const unsafeLogin = await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD, '//evil.example/'), env });
assert.equal(unsafeLogin.headers.get('location'), '/');
assert.equal((await studentAccess({ request: loginRequest(env.STUDENT_PASSWORD, '/', 'https://evil.example'), env })).status, 403);
const rejectedLogin = await studentAccess({ request: loginRequest('wrong', '/', 'https://evil.example'), env });
assert.match(await rejectedLogin.text(), /role="alert"[^>]*>This sign-in request was rejected/u);
const malformedLogin = await studentAccess({ request: new Request('https://portal.example/student-access', {
  method: 'POST', headers: { Origin: 'https://portal.example', 'Content-Type': 'application/json' }, body: '{}'
}), env });
assert.equal(malformedLogin.status, 400);
assert.match(await malformedLogin.text(), /form could not be read/u);
const protectedHtml = await middleware({ request: authenticatedRequest('/resources'), env,
  next: async () => new Response('<html>Resources</html>', { headers: { 'Content-Type': 'text/html', 'Referrer-Policy': 'no-referrer' } }) });
assert.equal(protectedHtml.headers.get('Referrer-Policy'), 'same-origin');
assert.equal((await studentAccess({ request: new Request('https://portal.example/student-access', {
  method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', Origin: 'https://portal.example', 'Sec-Fetch-Site': 'cross-site' },
  body: new URLSearchParams({ password: env.STUDENT_PASSWORD })
}), env })).status, 403);
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
