import assert from 'node:assert/strict';
import { findStudent } from '../assets/student-routing.mjs';
// Synthetic fixtures only; these URLs are never shipped as student records.
const active = {name:'Example', active:true, url:'https://www.notion.so/test-fixture'};
assert.equal(findStudent([active], '  EXAMPLE '), active.url);
assert.equal(findStudent([{...active, active:false}], 'Example'), null);
assert.equal(findStudent([active], 'Unknown'), null);
assert.equal(findStudent([active], '   '), null);
assert.equal(findStudent([active, active], 'Example'), null);
assert.equal(findStudent([{...active, url:'javascript:alert(1)'}], 'Example'), null);
assert.equal(findStudent([{...active, url:'https://notion.so.example.com/page'}], 'Example'), null);
assert.equal(findStudent([{...active, url:''}], 'Example'), null);
console.log('8 student routing checks passed.');
