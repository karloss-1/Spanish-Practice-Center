# Student Area authentication

The Home page (`/` and `/index.html`) is public. The Student Area is protected by Cloudflare Pages Functions using one shared password and a signed 30-day session cookie.

## Architecture

- `functions/_middleware.js` enforces authentication for protected HTML, downloads, external gateways, and APIs.
- `functions/student-access.js` renders and processes the shared login form.
- `functions/_lib/auth.js` verifies the password and signs/verifies sessions with HMAC-SHA-256.
- `functions/go/[resource].js` redirects authenticated students to a fixed allowlist. It never accepts a destination URL from the browser.
- `functions/api/student-lookup.js` retains its exact KV lookup and now also verifies the Student Area session.
- `scripts/build.mjs` creates `_routes.json`. Every new protected route or download directory must be included there.

The browser receives neither secret. A session contains only a version and expiry timestamp plus an HMAC signature. The `__Host-spc_session` cookie uses `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and `Max-Age=2592000` (30 days).

## Cloudflare configuration

Set these encrypted variables separately for each environment:

| Variable | Purpose |
| --- | --- |
| `STUDENT_PASSWORD` | Shared password entered by current students. |
| `SESSION_SECRET` | Independent random signing key. Rotating it invalidates every session. |

For review, configure both variables only in **Preview**. Do not configure production variables until approval. Keep the existing Preview `STUDENTS` KV binding; authentication supplements individual lookup and does not replace it.

The Pages project uses `main` as its production branch. The review branch is `student-auth`. Preview controls must include `student-auth` without changing the production branch or production behavior.

## Protected routes

- `/my-learning-space*`
- `/practice*`
- `/resources*`
- `/course-roadmap*`
- `/assets/resources/*`
- `/go/*`
- `/api/student-lookup`

`/api/auth/status`, `/student-access`, and `/student-access/logout` are intentionally reachable without a session and disclose no private data. Home and presentation assets remain public so the login screen loads normally.

## Maintenance

- Replace only `STUDENT_PASSWORD` to change the password while allowing existing sessions to expire normally.
- Rotate `SESSION_SECRET` to force every student to sign in again.
- Add external tools as named server-side `DESTINATIONS` entries linked through `/go/<name>`; never add a general URL redirect parameter.
- Add new Student Area pages and asset directories to the build-generated route include list and to direct-navigation tests.
- Never place secret values, student mappings, or real student data in GitHub, static assets, fixtures, logs, or documentation.

## Verification

```sh
node tests/student-routing.mjs
node tests/auth.mjs
node tests/student-lookup.mjs
node scripts/build.mjs
```

The tests cover password rejection, signed-cookie tampering and expiry, 30-day cookie attributes, route enforcement, safe returns, same-origin form checks, logout, and the external allowlist. Preview testing must also exercise real Cloudflare routing, cookies, KV, and desktop/mobile layouts before approval.
