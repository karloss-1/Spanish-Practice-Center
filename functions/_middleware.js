import { hasValidSession, safeReturnPath } from './_lib/auth.js';
import { htmlResponse, loginPage } from './_lib/login-page.js';

const AUTH_PATHS = new Set(['/student-access', '/student-access/logout', '/api/auth/status']);

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  if (AUTH_PATHS.has(url.pathname)) return context.next();
  if (await hasValidSession(request, env)) return context.next();
  if (url.pathname.startsWith('/api/')) {
    return Response.json({ error: 'authentication_required' }, { status: 401, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'X-Robots-Tag': 'noindex, nofollow' } });
  }
  return htmlResponse(loginPage(safeReturnPath(`${url.pathname}${url.search}`, url.origin)), 401);
}
