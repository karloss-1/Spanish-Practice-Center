# Validation — September 8, 2026

## Baseline preservation

Inspected `ui-redesign` HEAD `f2bdcb7d78bc2127e7b380ab286b9b4e88ab60e7`, both commits in its history, all five HTML pages, CSS, JavaScript, JSON files, README and existing tests before editing. There were no repository AGENTS.md instructions or hosting configuration.

All five HTML files and `assets/styles.css` are byte-for-byte unchanged from that HEAD. Navigation logic is unchanged. The 46 roadmap units and shared resource/Practice links are preserved. No redesign, framework, accounts or database server was introduced.

## Passed locally

- Existing 8 routing checks.
- New API checks: active match, case, whitespace, Unicode, initial punctuation, exact-key read, unknown/inactive indistinguishable 404, empty/invalid input, unsafe URLs, oversized and malformed requests, cross-site requests, unsupported methods, missing KV binding, and storage failures.
- Successful API body contains only the matching URL; additional record fields are not exposed. All API responses use no-store. The handler reads one key and never lists KV.
- Explicit static build allowlist excludes all student files, server source, tests and private files.
- Browser checks using a local server running the actual function with **synthetic records**: 390px and 1440px, all five pages without horizontal overflow, desktop navigation and mobile Menu/Escape, all navigation destinations, four Practice cards, seven resource rows, 46 roadmap accordions and expand/collapse behavior.
- Fresh isolated browser sessions: active name, capitalization, surrounding spaces, invalid name, inactive name, whitespace-only and empty input. Synthetic Notion navigation was intercepted to avoid confusing it with real destination validation.
- Browser request capture confirms only entered name is posted; successful response contains one URL; inactive and unknown return identical bodies; no students.json request or complete mapping is downloaded.
- Mobile and desktop My Learning Space screenshots inspected for layout.
- Git diff whitespace checks and preservation comparison passed.

## Verified source data, not imported

Re-read the Notion Formal class, Conversation class and Inactive category pages: 22 + 14 active entries and 10 inactive entries. No normalized exact-name duplicates. Two active first names repeat with a surname-initial variant; the owner explicitly confirmed these are distinct students and that the existing M suffix distinguishes them. Preserve exact matching and those established lookup names; do not infer initials or routes.

The mapping was held outside repository files and was not published. Category links establish page identity/status but do not by themselves prove signed-out public access to every destination.

## Blocking live validation

Cloudflare account, Pages, Workers and KV reads succeeded. Creating the Git-integrated Pages preview project and the KV namespace each failed with Cloudflare `10000: Authentication error`. No project, namespace, student import, deployment or preview URL was confirmed.

After write access is corrected:

1. Create the Git-integrated preview and private namespace; bind STUDENTS in Preview.
2. Re-read source data for freshness, check names and populate verified mappings privately.
3. Confirm deployed commit equals GitHub ui-redesign HEAD and production auto-deploy is disabled.
4. Repeat the API/browser checks on the real Cloudflare URL, including real active/inactive names and fresh browsers.
5. Verify signed-out Notion destination access and real network payloads. Check KV status-update propagation.
6. Verify student file URLs return 404 and that deployed assets and GitHub contain no mapping.

Do not label these live checks passed until they actually run. No production release, custom domain, Google Sites redirect, Notion edits or other repository changes were made.
