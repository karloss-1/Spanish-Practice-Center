# Spanish Practice Center

Spanish student portal for Azael. GitHub remains the source of truth: [karloss-1/Spanish-Practice-Center](https://github.com/karloss-1/Spanish-Practice-Center). Production is built from **main**; shared-password authentication is developed and reviewed on **student-auth**. Do not merge or deploy authentication to production without explicit approval.

## Student Area authentication — preview work

Home remains public. My Learning Space, Practice, Resources, Course Roadmap, downloadable student materials, approved external practice tools, and the lookup API require a server-verified session. The shared password and independent signing key are Cloudflare encrypted variables; neither belongs in GitHub or browser-delivered files. Sessions last 30 days in a signed `HttpOnly`, `Secure`, `SameSite=Lax` cookie.

See [AUTHENTICATION.md](AUTHENTICATION.md) for architecture, route coverage, Preview-only secret setup, maintenance, and testing.

## Historical implementation record — September 8, 2026

The existing five HTML pages and shared CSS are preserved from `f2bdcb7`. Only the student lookup and deployment preparation have changed. There is no framework, SQL database, account system, or authentication.

The new endpoint is implemented and locally tested. **Cloudflare deployment and private data import are pending:** account/resource reads succeeded, but both Pages project creation and KV namespace creation returned Cloudflare error `10000: Authentication error`. No preview URL or live namespace is available yet. Do not describe the local tests as a deployed student lookup.

Notion category lists were re-read: 22 Formal class, 14 Conversation class, 10 Inactive. The owner confirmed that the existing names with and without a surname initial identify different students. Keep those exact distinctions; never use prefix or fuzzy matching. Full mappings are not committed here.

## How lookup works

The existing form sends `POST /api/student-lookup` with only `{ "name": "entered name" }`. The Pages Function normalizes Unicode, surrounding/repeated whitespace, case, and an optional final period on initials. It reads exactly one key from the private `STUDENTS` KV binding. A valid active record returns only `{ "url": "matching HTTPS Notion URL" }`.

Unknown and inactive records return the same HTTP 404 body: `{ "error": "not_found" }`. There is no public listing or bulk lookup endpoint. Responses are marked `no-store`. The browser has no directory, account, saved-link dependency, or local-storage mapping.

Only HTTPS Notion hostnames are accepted. The endpoint accepts JSON POST requests from authenticated sessions, bounds bodies to 1 KB and names to 100 characters, rejects cross-site browser requests, and hides storage errors. There is no application rate limiter; monitor failed login and lookup traffic before deciding whether additional protection is necessary.

## Private student maintenance

**Once provisioned**, records live in Cloudflare Workers KV namespace **spanish-practice-center-preview-students**, bound to the Pages preview environment as **STUDENTS**. The namespace ID belongs in Cloudflare settings, not browser configuration. Routine changes require no GitHub commit or redeployment.

Open Cloudflare dashboard → Storage & databases → KV → the namespace → KV Pairs. Each lookup has a normalized key `student:example` and a JSON value with just `url` and Boolean `active`:

```json
{"url":"https://example.notion.site/replace-with-verified-page","active":true}
```

This is a synthetic format example. Never use it as an actual student record.

| Operation | Exact steps |
| --- | --- |
| Add | Verify the student's current Notion public link and status. Search the namespace for the normalized name first. If absent, add key `student:` plus the lowercase name, and save the JSON with the verified URL and `active: true`. Never overwrite another student's key. |
| Deactivate | Open that student's key, preserve the URL, change `active` to `false` (without quotes), and save. |
| Reactivate | Verify the URL is still correct, change `active` to `true`, and save. |
| Change Notion URL | Open the key, replace only `url` with the verified HTTPS public Notion link, preserve `active`, and save. |
| Remove | Verify the key belongs to the intended student, then delete that key. The name will return not found. |

After any change, allow at least 60 seconds for KV propagation, then test the name in a fresh browser session. Propagation can take longer; a previous active URL can still be returned briefly during propagation. Deactivation does not revoke a previously known public Notion link.

Use the established full lookup name when it includes an initial. A final period on an initial is optional. Do not create first-name aliases that collide with another student, including inactive students. Before introducing new duplicate names, agree distinct lookup names with the owner (normally first name plus last initial) and update the affected keys. If a formerly unique bare name becomes ambiguous, replace its value with `{"ambiguous":true}` so it requests an initial rather than choosing a student. Do not publish the alternatives. Remove obsolete aliases when changing a lookup name.

An assistant can safely perform these operations through the connected Cloudflare API: read the named key first, verify the requested change and source URL, update only that key, then read it back and test lookup. Listing the private namespace for a duplicate audit is an admin action only. Never copy mappings into GitHub, public outputs, frontend files, or deployment assets. Notion moves do not synchronize automatically; ask the assistant to re-read category membership when refreshing status. Do not modify Notion pages.

## Cloudflare preview setup (pending access)

1. Enable Cloudflare connection permissions for Pages project/deployment writes and Workers KV writes. Authorize Cloudflare's GitHub integration for **only this repository** where possible.
2. Create the KV namespace above. Import only freshly verified mappings; preserve explicit inactive status and the owner's established name distinctions. Check normalized-key collisions before writing anything.
3. Create a **Git-integrated Cloudflare Pages** project named `spanish-practice-center-preview`, using the existing GitHub repository. Do not choose Direct Upload if Git integration is intended.
4. Set build command `node scripts/build.mjs`, output directory `dist`, and root directory `/`. Node 22 or later is sufficient; no dependencies are needed for this copy-only build.
5. Configure production branch `main` with **automatic production deployments disabled**. Set preview branch controls to custom, include only `ui-redesign`, and disable PR comments. Trigger only an `ui-redesign` preview deployment.
6. In project Settings → Bindings, select the **Preview** environment and add KV binding `STUDENTS` to the namespace. Set the preview compatibility date to `2026-09-08`. Redeploy the preview for the binding to apply.
7. Verify the successful deployment's Git commit matches GitHub `ui-redesign`. Record Cloudflare's actual preview URL here only after successful deployment; never infer a URL.
8. Test real active/inactive names, case, whitespace, fresh-session redirects, and network payloads. Verify real Notion destination access while signed out. Leave preview/noindex labeling intact.

Cloudflare handles runtime/deployment; GitHub retains all source. No custom domain or Google Sites redirect belongs in this preview setup.

## Build and local checks

```sh
node scripts/build.mjs
node tests/student-routing.mjs
node tests/student-lookup.mjs
```

The build copies an explicit allowlist of HTML/CSS/JS into `dist`. It excludes `data`, tests, documentation, server source, and private files. Pages compiles `functions/api/student-lookup.js` separately from static assets. Only `/api/*` invokes Functions. A 404 file prevents unknown paths from falling back to the home page.

A plain static server can preview the design but cannot execute the API. Use Cloudflare's Pages local development tool with a local `STUDENTS` KV binding for full runtime testing; keep test data synthetic. No real mapping should enter the repository, even in an ignored file if it can be avoided.

## Costs and maintenance

This small lookup is intended to fit Cloudflare's free allowances, subject to actual traffic and account plan. No paid plan was enabled. As checked September 8, 2026, [KV Free](https://developers.cloudflare.com/kv/platform/pricing/) includes 100,000 reads/day, 1,000 writes/day and 1 GB storage; exceeding a free allowance causes operations to fail until reset. Each lookup reads one key, including misses. [Pages Functions](https://developers.cloudflare.com/pages/functions/pricing/) use Workers request allowances; static assets have separate treatment. Check the dashboard's current plan and usage before launch or upgrades.

There is no always-on server to maintain. Maintain student records, retain the GitHub integration, and review usage/errors periodically. [KV is eventually consistent](https://developers.cloudflare.com/kv/concepts/how-kv-works/), so updates are not immediate everywhere. The shared password authenticates access to the portal; it does not create individual identities, revoke already known public Notion links, or synchronize Notion sharing changes.

## Connected destinations

- Mexican Spanish Flashcards: https://karloss-1.github.io/Mexican-Spanish/
- ConjuFlow: https://karloss-1.github.io/Conjuflow/
- AI Writing Trainer: https://chatgpt.com/g/g-6978e9457bf081918eab1b87cda5cf94-spanish-writing-trainer
- AI Conversation Trainer: https://chatgpt.com/g/g-697ee7ce5c748191a327590755eee86e-conversation-trainer
- Learning Cheat Sheet: https://app.notion.com/p/3b3ef88948668044a2aef9877b717fbf
- Essential vocabulary: https://app.notion.com/p/3c6ef889486680c8b65be3544abefbae
- Spanish verb conjugation guides: https://app.notion.com/p/3d0ef88948668119b4bce27ee4cc9dbb
- Teacher profile: https://www.italki.com/en/teacher/1284133

The trainers and teacher profile were copied from the current public Google Site. Both application URLs returned HTTP 200. Trainer sign-in/functionality was not tested.

## Original reference and design

Inspected both accessible Google Sites pages on September 8, 2026:

- https://sites.google.com/view/spanish-practice-center/home
- https://sites.google.com/view/spanish-practice-center/program

The original markup uses slate blue `#2F4E6F`, secondary blue `#4F79A7`, light backgrounds `#F9F9F9`, and dark text `#1C1C1C`. These form the new visual foundation. System sans-serif fonts keep the site fast and independent of third-party font requests. A compact header, two prominent home links, restrained surfaces and borders, and clear focus states refine the original educational character. No gradient, decorative video, email address or listening section is included.

The curriculum was extracted verbatim from the public Program page: A1 (10 units), A2 (10), B1 (14), B2 (12). Both unit titles and grammar descriptions remain in Spanish. Surrounding navigation is English.

## Validation and release

See `VALIDATION.md` for performed checks and outstanding live checks. Google Sites, Notion, ConjuFlow, Mexican Spanish Flashcards, and other repositories must remain unchanged. Production requires the owner's separate manual review and approval.
