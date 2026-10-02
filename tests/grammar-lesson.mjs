import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { questions, categories } from '../assets/ser-estar-content.mjs';
import { createAttempt, checkAnswer, recordAnswer, resultsFor } from '../assets/grammar-practice.mjs';
import { onRequest as middleware } from '../functions/_middleware.js';
const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const contract = JSON.parse(await read('tests/fixtures/ser-estar-contract.json'));
const expectedIds = ['H01', ...['C','E','A','S','B','P'].flatMap((prefix, i) => Array.from({length:[4,3,4,2,3,11][i]}, (_, n) => `${prefix}${String(n+1).padStart(2,'0')}`))];
assert.deepEqual(questions.map(q => q.id), expectedIds);
for (const q of questions) {
  assert.equal(createHash('sha256').update(JSON.stringify(q)).digest('hex'), contract[q.id], `${q.id}: canonical wording or options changed`);
  assert.ok(q.options.includes(q.correct));
  assert.deepEqual(Object.keys(q.incorrectFeedback), q.options.filter(o => o !== q.correct));
  for (const option of q.options) {
    const checked = checkAnswer(q, option);
    assert.equal(checked.correct, option === q.correct);
    assert.equal(checked.feedback, option === q.correct ? q.correctFeedback : q.incorrectFeedback[option]);
  }
  assert.equal(checkAnswer(q, undefined), null);
  assert.equal(checkAnswer(q, 'not an option'), null);
}
const practice = questions.filter(q => q.id.startsWith('P'));
let attempt = createAttempt(practice);
assert.equal(recordAnswer(attempt,'P01',undefined), null);
assert.equal(attempt.firstAnswers.size,0);
for (const q of practice) {
  recordAnswer(attempt,q.id,q.options.find(o => o !== q.correct));
  recordAnswer(attempt,q.id,q.correct);
}
let result = resultsFor(attempt,categories);
assert.equal(result.complete,true);assert.equal(result.correct,0);assert.equal(result.missed.length,11);
assert.deepEqual(result.categories.map(c => c.total),[2,2,4,1,2]);
assert.deepEqual(result.categories.map(c => c.correct),[0,0,0,0,0]);
assert.equal(recordAnswer(attempt,'missing','es'),null);
attempt=createAttempt(practice);
for(const q of practice) recordAnswer(attempt,q.id,q.correct);
result=resultsFor(attempt,categories);assert.equal(result.correct,11);assert.deepEqual(result.missed,[]);
assert.deepEqual(result.categories.map(c => c.correct),[2,2,4,1,2]);
attempt=createAttempt(practice);assert.equal(resultsFor(attempt,categories).answered,0);assert.equal(resultsFor(attempt,categories).complete,false);
const html = await read('grammar/ser-estar.html');
const copyContract = JSON.parse(await read('tests/fixtures/ser-estar-copy.json'));
const normalize = text => text.replace(/\s+/gu, ' ').trim();
const plainHtml = normalize(html.replace(/<[^>]*>/gu,' ').replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>').replaceAll('&quot;','"').replaceAll('&#x27;',"'"));
for (const copy of copyContract) assert.ok(plainHtml.includes(normalize(copy)), `Missing canonical learning copy: ${copy.slice(0,80)}`);
const resources = await read('resources.html');
assert.equal((html.match(/data-question=/gu)||[]).length,17);
for(const q of questions.filter(q=>!q.id.startsWith('P'))) assert.ok(html.includes(`data-question="${q.id}"`));
for(const id of ['hero','core-uses','events-locations','adjective-meanings','different-perspective','bueno-malo-bien-mal','practice-lab','results','quick-reference','pdf']) assert.ok(html.includes(`id="${id}"`));
assert.match(resources, /id="ser-estar"[\s\S]*?href="grammar\/ser-estar.html">Learn &amp; Practice<\/a>/u);
assert.match(resources, /id="ser-estar"[\s\S]*?href="assets\/resources\/grammar-quick-guides\/SER-ESTAR-Essential-Guide.pdf"[\s\S]*?>Open PDF<\/a>/u);
const pdf='/assets/resources/grammar-quick-guides/SER-ESTAR-Essential-Guide.pdf';assert.ok(html.includes(`href="${pdf}" download`));
assert.match(html,/role="status" aria-live="polite" aria-atomic="true"/u);
assert.match(html,/<fieldset><legend>/u);
execFileSync(process.execPath,['scripts/build.mjs'],{cwd:new URL('../',import.meta.url)});
for(const path of ['grammar/ser-estar.html','assets/grammar.css','assets/grammar-lesson.js','assets/grammar-practice.mjs','assets/ser-estar-content.mjs',pdf.slice(1)]) await access(new URL(`dist/${path}`,root));
const routes=JSON.parse(await read('dist/_routes.json'));assert.ok(routes.include.includes('/grammar/*'));
const denied=await middleware({request:new Request('https://portal.example/grammar/ser-estar.html'),env:{},next:()=>new Response('lesson')});assert.equal(denied.status,401);
const allowed=await middleware({request:new Request('https://portal.example/grammar/ser-estar.html'),env:{AUTH_ENABLED:'false'},next:()=>new Response('lesson')});assert.equal(await allowed.text(),'lesson');
for(const excluded of ['tests/fixtures/ser-estar-contract.json','docs/INTERACTIVE_GRAMMAR.md','data','functions']) await assert.rejects(access(new URL(`dist/${excluded}`,root)));
console.log('Grammar lesson: 28 canonical items, every option/feedback, first-attempt scoring, resets, 10 sections, Resources/PDF links, build allowlist and protected route passed.');
