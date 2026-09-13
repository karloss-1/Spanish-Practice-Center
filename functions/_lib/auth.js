export const SESSION_COOKIE = '__Host-spc_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

const encoder = new TextEncoder();

function toBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/u, '');
}

function constantTimeEqual(left, right) {
  const length = Math.max(left.length, right.length);
  let difference = left.length ^ right.length;
  for (let index = 0; index < length; index += 1) difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  return difference === 0;
}

async function hmac(value, secret) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(value)));
}

export function getCookie(request, name) {
  const header = request.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() === name) return part.slice(separator + 1).trim();
  }
  return null;
}

export async function createSession(env, now = Date.now()) {
  if (!env?.SESSION_SECRET) throw new Error('Missing session secret');
  const expires = Math.floor(now / 1000) + SESSION_MAX_AGE;
  const payload = `v1.${expires}`;
  return `${payload}.${toBase64Url(await hmac(payload, env.SESSION_SECRET))}`;
}

export async function hasValidSession(request, env, now = Date.now()) {
  if (!env?.SESSION_SECRET) return false;
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return false;
  const parts = token.split('.');
  if (parts.length !== 3 || parts[0] !== 'v1' || !/^\d+$/u.test(parts[1])) return false;
  const expires = Number(parts[1]);
  const nowSeconds = Math.floor(now / 1000);
  if (!Number.isSafeInteger(expires) || expires <= nowSeconds || expires > nowSeconds + SESSION_MAX_AGE + 300) return false;
  const expected = toBase64Url(await hmac(`${parts[0]}.${parts[1]}`, env.SESSION_SECRET));
  return constantTimeEqual(encoder.encode(parts[2]), encoder.encode(expected));
}

export async function passwordMatches(candidate, env) {
  if (typeof candidate !== 'string' || typeof env?.STUDENT_PASSWORD !== 'string' || !env.SESSION_SECRET) return false;
  const [candidateDigest, expectedDigest] = await Promise.all([
    hmac(`password\0${candidate}`, env.SESSION_SECRET), hmac(`password\0${env.STUDENT_PASSWORD}`, env.SESSION_SECRET)
  ]);
  return constantTimeEqual(candidateDigest, expectedDigest);
}

export function safeReturnPath(value, origin) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin || url.pathname === '/student-access' || url.pathname === '/student-access/logout') return '/';
    return `${url.pathname}${url.search}`;
  } catch { return '/'; }
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${SESSION_MAX_AGE}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

export function sameOrigin(request) {
  const expectedOrigin = new URL(request.url).origin;
  const fetchSite = request.headers.get('sec-fetch-site');
  if (fetchSite === 'cross-site') return false;
  const origin = request.headers.get('origin');
  if (origin) return origin === expectedOrigin;
  const referer = request.headers.get('referer');
  if (referer) {
    try { return new URL(referer).origin === expectedOrigin; } catch { return false; }
  }
  return fetchSite === 'same-origin';
}
