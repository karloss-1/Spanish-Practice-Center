# Spanish Practice Center

Development implementation of Azael’s Spanish student portal. **For review, not a production release.** The existing Google Site and the separate learning apps remain unchanged.

## Status

- Repository: https://github.com/karloss-1/Spanish-Practice-Center
- Review branch: `ui-redesign`. No production release or replacement of Google Sites.
- Five static pages, responsive CSS, no framework, backend, database, dependencies, or build step.
- Student routing is implemented, but `data/students.json` is empty pending explicit approval to publish names and page links in this public repository.
- All three shared Notion resources are connected. Links point to the exact page addresses returned by Notion, not expiring PDF downloads.
- The original logo image could not be downloaded (HTTP 403). The portal uses a text identity.
- Browser visual/interaction QA and unauthenticated Notion access checks remain pending.

## Structure

- `index.html`: compact entry page, two primary paths and “What to do today.”
- `my-learning-space.html`: first-name form and accessible feedback.
- `practice.html`: vocabulary, conjugation, writing and conversation.
- `resources.html`: shared references and practice links.
- `course-roadmap.html`: all 46 original Spanish curriculum units, in native `details` / `summary` accordions. Content is present without JavaScript.
- `assets/styles.css`: shared palette, typography, responsive layout, focus states and reduced motion.
- `assets/app.js`: mobile navigation and name form behavior.
- `assets/student-routing.mjs`: pure name matching and URL validation.
- `data/students.json`: **the only student routing data source**.
- `data/students.example.json`: an inactive example with an empty URL, never loaded by the website.
- `data/roadmap.json`: reference snapshot of the original curriculum; the rendered curriculum lives in `course-roadmap.html`. This JSON is not loaded at runtime.
- `tests/student-routing.mjs`: synthetic routing tests; fixtures are not real student pages and are not used by the portal.
- `VALIDATION.md`: performed checks and pending browser checks.

## Run locally

From this project directory:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. Use an HTTP server rather than opening HTML files directly: the student form loads JSON with `fetch`.

## Student maintenance — one file only

Edit `data/students.json`. It contains a JSON array of entries with `name`, `url`, and `active` fields. The file is currently empty pending publication approval.

Copy the entry from `data/students.example.json` into the array, replace `Example` with the student's first name, paste their actual HTTPS Notion link into `url`, and set `active` to `true`.

1. **Add:** append an entry, separated from previous entries by a comma. No trailing comma after the last entry.
2. **Update link:** change only that student's `url`.
3. **Deactivate:** change `active` from `true` to `false`.
4. **Reactivate:** change `active` back to `true`.

Save and commit this one file to the deployed branch. No HTML, CSS or JavaScript edits are necessary. The form requests the current JSON without its own cache or service worker.

Matching trims surrounding spaces, normalizes repeated whitespace and Unicode, and ignores letter case. Inactive students are excluded. Only HTTPS URLs on `app.notion.com`, `notion.so`, `notion.site`, or the latter two domains’ subdomains are accepted.

Use the exact page name for students with initials. If two active students have the same lookup name, neither match will open automatically. Assign distinct values, such as first name plus surname initial, in this same file and tell those students what to type. Names are never presented as a directory or dropdown.

This is routing, not authentication. The JSON is publicly downloadable on static hosting, including inactive entries. Deactivation stops name lookup; it does not revoke access to a Notion URL. Do not store sensitive information in this file.

Notion category changes do not sync automatically. To reflect a move between categories, update `active` in this JSON or ask a coding agent to refresh it from Notion. No student page content is copied into this repository.

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

## GitHub review workflow

The new repository has a minimal README on `main`. All portal implementation is on `ui-redesign`. Review that branch before any production merge. This repository is independent of ConjuFlow and Mexican-Spanish.

## Student data approval

The Notion category lists were inspected and the routing data was verified locally. No student names or page URLs are included in this public repository pending explicit publication approval. The JSON remains empty. Category membership will determine active status when the import is authorized; no lesson content is copied.

## Optional GitHub Pages development preview

GitHub Pages can serve this static root directory from `ui-redesign`. If choosing this review route, enable Pages under the new repository’s Settings, select deployment from a branch, choose `ui-redesign`, and select `/ (root)`. Use GitHub’s displayed URL; do not assume a URL before deployment succeeds. The preview banner and `noindex,nofollow` metadata must remain during review. This does not redirect or change Google Sites.

## Production only after explicit approval

After manual review and explicit approval, choose a production branch, merge the reviewed commit, and point Pages at that branch. Remove the development banner and `noindex,nofollow` only at that time. Do not add a custom domain or redirect the current portal without separate authorization.

## Portability

All local paths are relative and work under a GitHub Pages repository subpath. Any standard static web host can serve the same files. A future move to Cloudflare needs a static deployment configuration, not a frontend rewrite. No Cloudflare integration, GitHub-specific runtime logic, build process, or service worker is included.

## Checks

```sh
node tests/student-routing.mjs
```

Follow `VALIDATION.md` for the remaining browser checks before release.
