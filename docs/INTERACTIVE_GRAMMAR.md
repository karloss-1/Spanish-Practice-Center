# Interactive grammar prototype

`grammar/ser-estar.html` is the first lesson. It uses the existing site header and shared stylesheet, with lesson surfaces scoped to `.grammar-lesson`. Read remains on its own unmerged branch; no Read navigation link is added to this main-based prototype.

## Source and content contract

The supplied **SER & ESTAR — Interactive Lesson Content Specification** Word document is canonical. All ten sections, 17 local checks and 11 Practice Lab questions preserve its wording, options, answers and option-specific feedback. The mockup supplies the navy, cream, blue and sage visual direction only. The requested Hero labels (Start learning, Practice now, Download PDF) override the earlier Word button labels. Essential Guide and the Word subtitle remain visible.

Learning explanations are static HTML. The 28 question records are in `assets/ser-estar-content.mjs`; question IDs and section anchors remain stable. `tests/fixtures/ser-estar-contract.json` fingerprints the canonical question records; `ser-estar-copy.json` preserves the canonical static learning copy. Do not regenerate these fixtures just to accommodate an unintended wording change.

The six meaning pairs are a responsive, fully visible grid, rather than a carousel. The hero paper composition is HTML/CSS; no raster mockup or new image dependency is shipped. The longer page preserves all individual checks and source notes, instead of reproducing the mockup's abbreviated content.

## Interaction model

`assets/grammar-practice.mjs` is a small reusable state model; `assets/grammar-lesson.js` connects it to this lesson's forms. There are no dependencies, backend changes or persistence. Each check uses a native fieldset, legend and labeled radios. Missing selection announces the specified instruction. Checked options stay visible; feedback is a polite live region and receives focus when the check button is hidden. Errors expose the specified retry button.

Local completion counts unique checked questions, without a global score. Practice Lab stores the first checked option in a Map. Retry feedback reflects the new selection but cannot replace that first answer. Results show category totals of 2, 2, 4, 1 and 2. All question reviews are initially accessible; Review difficult points filters only first-attempt errors, and Review all questions restores the list. Try again creates a new practice attempt, preserves local completion and announces New attempt started. Navigation and Quick Reference remain open throughout.

The PDF CTA uses the existing canonical PDF and a normal download link. No speculative download-success or failure notification is shown without a browser signal, as permitted by the specification.

## Integration and access

Resources retains `#ser-estar` as the stable deep-link target. It opens the same collection and now offers Learn & Practice and Open PDF. The existing resource validator recognizes the two-action row as a conversation-resource record; no validator was relaxed. The teacher index documents the new action without adding a duplicate deep-link target.

The build explicitly allowlists the page and its four CSS/JS modules. `/grammar/*` is registered for the existing student-access middleware so lesson access follows the same AUTH_ENABLED/session rules as Resources. No secret or authentication setting is changed. Future pages placed in this directory inherit that route coverage; each future public asset must still be explicitly allowlisted.

## Validation

Run `node --test tests/*.mjs` and `node scripts/build.mjs`. The new grammar test protects all IDs and exact question wording, every option's feedback, static learning copy, first-attempt scores after retry, category totals, a new attempt, Resources/PDF integration, built assets and middleware coverage. Existing authentication, API, routing and deep-link suites remain unchanged.

Browser validation covers all 28 items with wrong and correct answers, missing selections, retries, 0/11 after correcting every first error, a fresh 11/11 attempt, difficult-point filtering, all reviews, section anchors, keyboard menu handling and desktop/tablet/mobile layouts. Live preview checks are recorded in the PR once deployed.

## Deployment

Cloudflare's Git integration needs the branch commit pushed before it can create a preview. Only `feature/interactive-ser-estar` is added to the existing preview include list; `feature/read-section` is retained. Production branch and deployment settings are unchanged. The PR is opened after the preview is checked and remains unmerged.
