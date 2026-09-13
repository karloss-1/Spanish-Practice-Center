import { clearSessionCookie, sameOrigin } from '../_lib/auth.js';

export function onRequest({ request }) {
  if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
  if (!sameOrigin(request)) return new Response(null, { status: 403 });
  return new Response(null, { status: 303, headers: { Location: '/', 'Set-Cookie': clearSessionCookie(), 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' } });
}
