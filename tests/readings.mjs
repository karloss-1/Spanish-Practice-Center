import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
import {onRequest} from '../functions/_middleware.js';
import {createSession,SESSION_COOKIE} from '../functions/_lib/auth.js';
const root=new URL('../',import.meta.url);
const json=async path=>JSON.parse(await readFile(new URL(path,root),'utf8'));
const catalog=await json('assets/readings/index.json');
assert.deepEqual(catalog.map(r=>r.level),['A1','A2','B1']);
assert.equal(new Set(catalog.map(r=>r.slug)).size,catalog.length);
const expected=[{paragraphs:4,vocabulary:5,answers:[1,0,0,[1,2,0],2]},{paragraphs:5,vocabulary:6,answers:[1,1,[1,2,0],2,0,1]},{paragraphs:6,vocabulary:8,answers:[1,2,0,0,2,1,2]}];
for(const [i,meta] of catalog.entries()) {
 const r=await json(`assets/readings/${meta.slug}.json`);
 for(const [key,value] of Object.entries(meta)) assert.deepEqual(r[key],value);
 assert.equal(r.paragraphs.length,expected[i].paragraphs);
 assert.ok(r.paragraphs.every(p=>p.es && p.en));
 assert.equal(r.vocabulary.length,expected[i].vocabulary);
 assert.ok(r.vocabulary.every(v=>v.word && v.definition && v.english));
 assert.equal(r.discussion.length,3);
 assert.deepEqual(r.questions.map(q=>q.answer),expected[i].answers);
 for(const q of r.questions) {
  assert.ok(q.options.every(Boolean));
  if(q.type==='order') assert.deepEqual([...q.answer].sort(),q.options.map((_,i)=>i));
  else assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);
  assert.equal(q.explanation,undefined);assert.equal(q.rationale,undefined);
 }
 const source=JSON.stringify(r);
 for(const term of ['SOURCES','EDITORIAL NOTES','Respuestas y explicaciones','Claves y explicaciones','VERIFY BEFORE PUBLISHING']) assert.ok(!source.includes(term));
 for(const file of [r.image,r.thumbnail,r.audio.src]) assert.ok((await stat(new URL(file,root))).size>10000);
 const audio=await readFile(new URL(r.audio.src,root));assert.ok(audio.subarray(0,40).toString().includes('ftyp'));
}
const routes=await json('dist/_routes.json');
const protectedPaths=['/read','/read.html','/reading','/reading.html','/reading.html?slug=que-es-un-tianguis','/assets/readings/index.json','/assets/readings/que-es-un-tianguis.json','/assets/readings/que-es-un-tianguis.m4a'];
const env={SESSION_SECRET:crypto.randomUUID(),STUDENT_PASSWORD:crypto.randomUUID()};
const session=await createSession(env);
for(const path of protectedPaths) {
 assert.ok(routes.include.some(pattern=>new RegExp('^'+pattern.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/\\\*/g,'.*')+'$').test(path.split('?')[0])));
 let called=false;
 const denied=await onRequest({request:new Request('https://test.example'+path),env,next:()=>{called=true;}});
 assert.equal(denied.status,401);assert.equal(called,false);
 const allowed=await onRequest({request:new Request('https://test.example'+path,{headers:{Cookie:`${SESSION_COOKIE}=${session}`}}),env,next:()=>new Response('OK')});
 assert.equal(await allowed.text(),'OK');
}
for(const file of ['index.html','my-learning-space.html','practice.html','read.html','reading.html','resources.html','course-roadmap.html']) {
 const html=await readFile(new URL(file,root),'utf8');
 const nav=html.match(/<nav id="navigation"[^>]*>(.*?)<\/nav>/s)[1];
 assert.deepEqual([...nav.matchAll(/href="([^\"]+)"/g)].map(m=>m[1]),['index.html','my-learning-space.html','practice.html','read.html','resources.html','course-roadmap.html']);
 assert.equal((nav.match(/aria-current="page"/g)||[]).length,1);
}
console.log('Read checks passed: approved answer keys, content schema, media, navigation, and protected page/data/audio routes.');
