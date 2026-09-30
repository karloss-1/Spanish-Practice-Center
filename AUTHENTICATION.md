# Student Area authentication

The Home page (`/` and `/index.html`) is public. The Student Area is protected by Cloudflare Pages Functions using one shared password and a signed 30-day session cookie.

## Architecture

- `functions/_middleware.js` enforces authentication for protected HTML, downloads, external gateways, and APIs. Authentication is bypassed only when the Pages environment variable `AUTH_ENABLED` is exactly `false`.
- `functions/student-access.js` renders and processes the shared login form.
- `functions/_lib/auth.js` verifies the password and signs/verifies sessions with HMAC-SHA-256.
- `functions/go/[resource].js` redirects authenticated students to a fixed allowlist. It never accepts a destination URL from the browser.
- `functions/api/student-lookup.js` retains its exact KV lookup and verifies the Student Area session while authentication is enabled. When `AUTH_ENABLED=false`, it still validates the request and performs the same private KV lookup without requiring a shared-session cookie.
- `scripts/build.mjs` creates `_routes.json`. Every new protected route or download directory must be included there.

The browser receives neither secret. A session contains only a version and expiry timestamp plus an HMAC signature. The `__Host-spc_session` cookie uses `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, and `Max-Age=2592000` (30 days).

## Cloudflare configuration

Configure these variables in Cloudflare Pages. Keep the two credentials encrypted and set `AUTH_ENABLED` as plain text:

| Variable | Purpose |
| --- | --- |
| `STUDENT_PASSWORD` | Shared password entered by current students. |
| `SESSION_SECRET` | Independent random signing key. Rotating it invalidates every session. |
| `AUTH_ENABLED` | `true` enables shared-password authentication. Only the exact value `false` temporarily disables the shared-session requirement. |

The Pages production branch is `main`. Keep `STUDENT_PASSWORD`, `SESSION_SECRET`, and the existing `STUDENTS` KV binding configured when authentication is disabled. Preview and production variables are configured separately.

### Temporarily disable or restore the shared password

In Cloudflare, open **Workers & Pages → spanish-practice-center → Settings → Variables and Secrets → Production**:

1. To disable the shared password temporarily, add or change the plain-text variable `AUTH_ENABLED` to `false`, then save and deploy the setting.
2. To turn authentication back on, change `AUTH_ENABLED` to `true`, then save and deploy. Leaving the variable unset or empty also keeps authentication on.

Only the exact lowercase string `false` disables authentication. A missing, empty, or unexpected value fails closed and keeps authentication active. With authentication disabled, the Student Area and My Learning Space open directly; My Learning Space continues to validate the entered name through the existing Cloudflare Function and `STUDENTS` KV lookup before redirecting to Notion.

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

- Set `AUTH_ENABLED` to `true` (or remove it) to require the shared password again.
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
