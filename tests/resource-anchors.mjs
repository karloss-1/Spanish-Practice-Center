import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { validateResourceDeepLinks } from '../scripts/resource-links.mjs';

const result = await validateResourceDeepLinks();
const html = await readFile(new URL('../resources.html', import.meta.url), 'utf8');
const resourceScript = [...html.matchAll(/<script>([\s\S]*?)<\/script>/gu)].at(-1)?.[1];
assert.ok(resourceScript, 'Resources must keep its inline disclosure and deep-link script.');

function simulateDeepLink(hash, { hidden = true, targetExists = true, inCollection = true } = {}) {
  const calls = { scroll: [], classes: new Set(), delay: null, timeout: null, hashchange: null };
  const collectionId = 'test-collection';
  const disclosure = {
    expanded: 'false',
    getAttribute(name) { return name === 'aria-controls' ? collectionId : this.expanded; },
    setAttribute(name, value) { if (name === 'aria-expanded') this.expanded = value; },
    addEventListener(name) { assert.equal(name, 'click'); }
  };
  const collection = {
    hidden,
    previousElementSibling: { querySelector(selector) { assert.equal(selector, '.library-disclosure'); return disclosure; } }
  };
  const target = targetExists ? {
    matches(selector) { return selector === '[data-resource-target]'; },
    closest(selector) { return selector === '.library-collection' && inCollection ? collection : null; },
    classList: {
      add(name) { calls.classes.add(name); },
      remove(name) { calls.classes.delete(name); }
    },
    scrollIntoView(options) { calls.scroll.push(options); }
  } : null;
  const document = {
    querySelectorAll(selector) { assert.equal(selector, '.library-disclosure'); return [disclosure]; },
    getElementById(id) { return id === collectionId ? collection : target; }
  };
  const window = {
    location: { hash },
    addEventListener(name, callback) { if (name === 'hashchange') calls.hashchange = callback; },
    clearTimeout() {},
    setTimeout(callback, delay) { calls.timeout = callback; calls.delay = delay; return 1; }
  };
  runInNewContext(resourceScript, { document, window, requestAnimationFrame: callback => callback() });
  return { calls, collection, disclosure, window };
}

for (const id of ['learning-cheat-sheet', 'preterite', 'doctor-appointment-conversation']) {
  const inCollection = id !== 'learning-cheat-sheet';
  const { calls, collection, disclosure } = simulateDeepLink(`#${id}`, { inCollection });
  assert.equal(collection.hidden, !inCollection, `${id} must open a collapsed collection only when needed.`);
  assert.equal(disclosure.expanded, inCollection ? 'true' : 'false');
  assert.equal(calls.scroll.length, 1, `${id} must scroll to its target.`);
  assert.equal(calls.scroll[0].block, 'start');
  assert.ok(calls.classes.has('is-deep-link-target'));
  assert.equal(calls.delay, 2600);
  calls.timeout();
  assert.equal(calls.classes.has('is-deep-link-target'), false);
}

const reduced = simulateDeepLink('#por-para');
assert.equal(reduced.calls.scroll[0].block, 'start');
assert.equal(Object.hasOwn(reduced.calls.scroll[0], 'behavior'), false);
assert.match(html, /@media\(prefers-reduced-motion:reduce\)[\s\S]*\.resource-deep-link-target \{ transition:none; \}/u);
const missing = simulateDeepLink('#gustar', { targetExists: false });
assert.equal(missing.calls.scroll.length, 0);
assert.equal(missing.collection.hidden, true);
const ordinary = simulateDeepLink('');
assert.equal(ordinary.calls.scroll.length, 0);
ordinary.window.location.hash = '#ser-estar';
ordinary.calls.hashchange();
assert.equal(ordinary.calls.scroll.length, 1);

console.log(`Resource deep-link checks passed: ${result.total} unique targets match the teacher index.`);
