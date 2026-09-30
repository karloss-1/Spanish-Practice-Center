import { hasValidSession } from '../../_lib/auth.js';

export async function onRequest({ request, env }) {
  if (request.method !== 'GET') return new Response(null, { status: 405, headers: { Allow: 'GET' } });
  const authEnabled = env?.AUTH_ENABLED !== 'false';
  const authenticated = authEnabled && await hasValidSession(request, env);
  return Response.json({ authEnabled, authenticated }, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' } });
}
