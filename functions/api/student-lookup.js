import { normalizeName, validNotionUrl } from '../../assets/student-routing.mjs';
import { hasValidSession } from '../_lib/auth.js';

const MAX_BYTES = 1024;
function reply(status, body) {
  return Response.json(body, { status, headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    'X-Robots-Tag': 'noindex, nofollow',
    ...(status === 405 ? { Allow: 'POST' } : {})
  } });
}

// Bound the streamed body as well as Content-Length; never read an arbitrary payload.
async function readInput(request) {
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
      if (size > MAX_BYTES) {
        await reader.cancel();
        throw new Error('Too large');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
}

export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!await hasValidSession(request, env)) return reply(401, { error: 'authentication_required' });
  const origin = request.headers.get('origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('sec-fetch-site') === 'cross-site') {
    return reply(403, { error: 'forbidden' });
  }
  if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return reply(415, { error: 'invalid_request' });
  }
  let name;
  try {
    const input = await readInput(request);
    if (!input || Array.isArray(input) || Object.keys(input).length !== 1 || typeof input.name !== 'string' || input.name.length > 100) throw new Error('Invalid input');
    name = normalizeName(input.name);
    if (!name || /[\p{Cc}\p{Cf}]/u.test(name)) throw new Error('Invalid name');
  } catch { return reply(400, { error: 'invalid_request' }); }
  try {
    // Exactly one private key is read. No list endpoint or browser directory exists.
    const record = await env.STUDENTS.get(`student:${name}`, { type: 'json', cacheTtl: 60 });
    if (record?.ambiguous === true) return reply(409, { error: 'initial_required' });
    const url = record?.active === true ? validNotionUrl(record.url) : null;
    if (!url) return reply(404, { error: 'not_found' });
    return reply(200, { url });
  } catch {
    // Never include record contents, entered names, or storage errors in responses/logs.
    return reply(503, { error: 'unavailable' });
  }
}
