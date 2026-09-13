import { createSession, passwordMatches, safeReturnPath, sameOrigin, sessionCookie } from './_lib/auth.js';
import { htmlResponse, loginPage } from './_lib/login-page.js';

const MAX_BYTES = 1024;

async function readForm(request) {
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/x-www-form-urlencoded') throw new Error('Invalid content type');
  if (Number(request.headers.get('content-length')) > MAX_BYTES) throw new Error('Too large');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Missing body');
  const chunks = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BYTES) { await reader.cancel(); throw new Error('Too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new URLSearchParams(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function onRequest({ request, env }) {
  const url = new URL(request.url);
  if (request.method === 'GET' || request.method === 'HEAD') {
    const returnTo = safeReturnPath(url.searchParams.get('returnTo') || '/', url.origin);
    return htmlResponse(request.method === 'HEAD' ? null : loginPage(returnTo));
  }
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD, POST' } });
  if (!sameOrigin(request)) return htmlResponse(loginPage('/'), 403);
  let form;
  try { form = await readForm(request); } catch { return htmlResponse(loginPage('/'), 400); }
  const returnTo = safeReturnPath(form.get('returnTo') || '/', url.origin);
  try {
    if (!await passwordMatches(form.get('password'), env)) return htmlResponse(loginPage(returnTo, { error: true }), 401);
    const token = await createSession(env);
    return new Response(null, { status: 303, headers: { Location: returnTo, 'Set-Cookie': sessionCookie(token), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
  } catch { return htmlResponse(loginPage(returnTo, { unavailable: true }), 503); }
}
