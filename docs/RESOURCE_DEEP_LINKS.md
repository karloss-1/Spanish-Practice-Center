# Resources deep links — teacher index

The links below open the matching resource inside Spanish Practice Center. The Resources page then lets students open its PDF or other existing activity.

Cloudflare Pages has no custom domain attached to this project. These full links use the project's configured site domain: `https://spanish-practice-center-preview.pages.dev`.

## Featured guide

**Spanish Learning Cheat Sheet**  
`https://spanish-practice-center-preview.pages.dev/resources.html#learning-cheat-sheet`

## Essential Mexican Spanish

### High-utility verbs

**Verbs 1–100**  
`https://spanish-practice-center-preview.pages.dev/resources.html#high-frequency-verbs-1-100`

**Verbs 101–200**  
`https://spanish-practice-center-preview.pages.dev/resources.html#high-frequency-verbs-101-200`

**Verbs 201–300**  
`https://spanish-practice-center-preview.pages.dev/resources.html#high-frequency-verbs-201-300`

### Words & expressions

**Words & Expressions 1–100**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-1-100`

**Words & Expressions 101–200**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-101-200`

**Words & Expressions 201–300**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-201-300`

**Words & Expressions 301–400**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-301-400`

**Words & Expressions 401–500**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-401-500`

**Words & Expressions 501–600**  
`https://spanish-practice-center-preview.pages.dev/resources.html#everyday-words-501-600`

## Conjugation Reference Materials

**Present Indicative**  
`https://spanish-practice-center-preview.pages.dev/resources.html#present-indicative`

**Preterite**  
`https://spanish-practice-center-preview.pages.dev/resources.html#preterite-conjugation`

**Imperfect**  
`https://spanish-practice-center-preview.pages.dev/resources.html#imperfect`

**Future and Conditional**  
`https://spanish-practice-center-preview.pages.dev/resources.html#future-conditional`

**Present Perfect**  
`https://spanish-practice-center-preview.pages.dev/resources.html#present-perfect`

**Pluperfect**  
`https://spanish-practice-center-preview.pages.dev/resources.html#pluperfect`

**Future Perfect and Conditional Perfect**  
`https://spanish-practice-center-preview.pages.dev/resources.html#future-conditional-perfect`

**Present Subjunctive**  
`https://spanish-practice-center-preview.pages.dev/resources.html#present-subjunctive`

**Imperfect Subjunctive**  
`https://spanish-practice-center-preview.pages.dev/resources.html#imperfect-subjunctive`

**Present Perfect Subjunctive**  
`https://spanish-practice-center-preview.pages.dev/resources.html#present-perfect-subjunctive`

**Pluperfect Subjunctive**  
`https://spanish-practice-center-preview.pages.dev/resources.html#pluperfect-subjunctive`

**Imperative**  
`https://spanish-practice-center-preview.pages.dev/resources.html#imperative`

## Grammar Quick Guides

**SER & ESTAR**  
`https://spanish-practice-center-preview.pages.dev/resources.html#ser-estar`

The existing target offers **Learn & Practice**, opening `/grammar/ser-estar.html`, and **Open PDF**, preserving the original Essential Guide. The lesson and PDF use the existing student-access middleware. The section anchor and its automatic collection expansion remain unchanged.

**POR & PARA**  
`https://spanish-practice-center-preview.pages.dev/resources.html#por-para`

**PRETERITE & IMPERFECT**  
`https://spanish-practice-center-preview.pages.dev/resources.html#preterite`

**VERBS LIKE GUSTAR I**  
`https://spanish-practice-center-preview.pages.dev/resources.html#verbs-like-gustar-i`

**VERBS LIKE GUSTAR II**  
`https://spanish-practice-center-preview.pages.dev/resources.html#verbs-like-gustar-ii`

## Grammar · Subjunctive

**Subjunctive Trigger Map**  
`https://spanish-practice-center-preview.pages.dev/resources.html#subjunctive-trigger-map`

## Real-Life Mexican Spanish Conversations

**At a Restaurant**  
`https://spanish-practice-center-preview.pages.dev/resources.html#restaurant-conversation`

**At a Coffee Shop**  
`https://spanish-practice-center-preview.pages.dev/resources.html#coffee-shop-conversation`

**At a Hotel**  
`https://spanish-practice-center-preview.pages.dev/resources.html#hotel-conversation`

**In an Uber or Taxi**  
`https://spanish-practice-center-preview.pages.dev/resources.html#uber-taxi-conversation`

**At a Clothing Store**  
`https://spanish-practice-center-preview.pages.dev/resources.html#clothing-store-conversation`

**At a Supermarket**  
`https://spanish-practice-center-preview.pages.dev/resources.html#supermarket-conversation`

**At a Market or Tianguis**  
`https://spanish-practice-center-preview.pages.dev/resources.html#market-tianguis-conversation`

**At a Pharmacy**  
`https://spanish-practice-center-preview.pages.dev/resources.html#pharmacy-conversation`

**At the Airport**  
`https://spanish-practice-center-preview.pages.dev/resources.html#airport-conversation`

**At a Doctor's Appointment**  
`https://spanish-practice-center-preview.pages.dev/resources.html#doctor-appointment-conversation`

## Notes

- Verbs Like Gustar I and II have separate targets; `#gustar` remains without a matching target.
- “Go to Practice” is a navigation link to another section of the site, not an individual Resources item.
- The Subjunctive Trigger Map target lands on its card in Resources; its existing button opens the separate interactive map in a new tab.

## Adding a resource

Give each individual resource a unique, stable, lowercase kebab-case `id` and the `data-resource-target` attribute. Keep the `resource-deep-link-target` class so automatic scrolling and the temporary highlight work. Add its name and full URL under the existing category in this index. If the resource is in a collapsed collection, the page will open that collection before scrolling.

Run `node tests/resource-anchors.mjs` before committing. It checks target IDs, duplicate IDs, resource rows without targets, and this index against the page. The index stays as internal documentation because the Pages build copies only its explicit public-file allowlist.
