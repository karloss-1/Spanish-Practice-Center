import { hasValidSession } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  return Response.json({ authenticated: await hasValidSession(request, env) }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' } });
}
