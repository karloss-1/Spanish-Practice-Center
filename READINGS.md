# Read & Discover

The collection uses the existing HTML/CSS/ES module architecture, global styles, navigation, and Cloudflare Pages authentication. No runtime dependencies were added.

- `read.html` is the library; `reading.html?slug=…` is the reusable reading template.
- `assets/read.js` renders both views and maintains quiz state only in memory.
- `assets/read.css` scopes the section's presentation.
- `assets/readings/index.json` contains discovery metadata. Each slug has its own JSON for aligned Spanish/English paragraphs, vocabulary, quiz questions/answer keys, discussion prompts and replaceable audio source.
- Source DOCX content is preserved. Descriptions/categories come from the supplied mockups. Source lists and editorial answer explanations are omitted, including from published JSON.
- Questions use zero-based answer indices; ordering questions use an array of indices. All three original question formats are supported. No responses or progress are stored.
- Each reading reuses one generated image with a smaller 720px card variant. WebP assets were visually reviewed. They remain pending human approval.
- Initial audio is locally synthesized with the macOS Paulina es-MX voice, 145 words/minute, AAC 64 kbps. Change `audio.src` and `audio.type` to replace it with a recording. The native player provides time, seeking and volume, plus a separate speed selector. Controls vary by browser. Reading-time badges preserve the approved editorial estimates and are not audio durations.
- The build publishes reviewed JSON/WebP/M4A files from the reading asset directory, and explicitly publishes the two pages, script and stylesheet. Do not put editorial source files or private information in that directory.
- `/read*` and `/assets/readings/*` join the existing protected routes. The middleware and session logic are unchanged.

## Add a reading

Add a catalog entry, a same-slug JSON file following a pilot's schema, image/card variant and audio asset. Catalog order determines Previous/Next. Keep every paragraph pair exact and aligned, validate answer indices, and supply an English alt description. The build discovers supported assets; no page duplication is needed. Categories are metadata ready for future filtering but no category controls are shown in v1.

## Validation

Run `node scripts/build.mjs`, `node tests/readings.mjs`, and the existing authentication, student-routing and student-lookup tests. Verify library filters, translation, all question types, results/review/retry, audio, and desktop/mobile layouts in the browser.

## Branch safety

Original main: `013b2a278d3a31960b81b82e6a892440c17ec9eb`.
Published backup: `backup/pre-read-section-2026-09-28`, verified at that exact SHA before file edits.
Implementation: `feature/read-section`. Do not merge without human review.
Cloudflare preview inclusion now also contains `feature/read-section`; existing branches and the production branch `main` are preserved.
