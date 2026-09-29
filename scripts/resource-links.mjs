import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/gu)].map(([, name, value]) => [name, value]));
}

function hasClass(tag, className) {
  return (attributes(tag).class || '').split(/\s+/u).includes(className);
}

function hasResourceTarget(tag) {
  return /\bdata-resource-target(?:\s|=|>)/u.test(tag);
}

export async function validateResourceDeepLinks() {
  const [html, index] = await Promise.all([
    readFile(new URL('resources.html', root), 'utf8'),
    readFile(new URL('docs/RESOURCE_DEEP_LINKS.md', root), 'utf8')
  ]);
  const allIds = [...html.matchAll(/\bid="([^"]+)"/gu)].map(([, id]) => id);
  const duplicateIds = allIds.filter((id, position) => allIds.indexOf(id) !== position);
  assert.deepEqual(duplicateIds, [], `Duplicate IDs in resources.html: ${[...new Set(duplicateIds)].join(', ')}`);

  const tags = [...html.matchAll(/<(?:a|article|li)\b[^>]*>/gu)].map(([tag]) => tag);
  const resourceTags = tags.filter(tag =>
    hasClass(tag, 'pdf-link') ||
    hasClass(tag, 'conversation-resource') ||
    hasClass(tag, 'library-featured') ||
    hasClass(tag, 'resource-subjunctive')
  );
  const missingTargets = resourceTags.filter(tag => {
    const attrs = attributes(tag);
    return !attrs.id || !hasResourceTarget(tag) || !hasClass(tag, 'resource-deep-link-target');
  });
  assert.equal(missingTargets.length, 0, `${missingTargets.length} Resources item(s) need a stable ID, data-resource-target, and resource-deep-link-target class.`);

  const targetTags = tags.filter(hasResourceTarget);
  assert.equal(targetTags.length, resourceTags.length, 'Every deep-link target must be a recognized individual resource.');
  const targetIds = targetTags.map(tag => attributes(tag).id);
  assert.ok(targetIds.every(id => /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)), 'Resource IDs must use lowercase kebab-case ASCII.');

  const indexIds = [...index.matchAll(/https:\/\/[^\s`]+\/resources\.html#([a-z0-9-]+)/gu)].map(([, id]) => id);
  assert.equal(new Set(indexIds).size, indexIds.length, 'The teacher index contains a duplicate deep link.');
  assert.deepEqual([...indexIds].sort(), [...targetIds].sort(), 'The teacher index and Resources targets must contain the same IDs.');
  assert.ok(index.includes('https://spanish-practice-center-preview.pages.dev/resources.html#'), 'The teacher index must use the configured Pages site domain.');

  return { total: targetIds.length, ids: targetIds };
}
