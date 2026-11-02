import test from 'node:test';
import assert from 'node:assert/strict';
import {mergeNotes,createFamilyNotesTransport} from '../services/family-notes.js';
const note=(id,text,time)=>({id,text,status:'open',updatedAt:time,metadata:{}});
test('merges independent device notes',()=>{
 const result=mergeNotes([note('a','iPad','2026-11-01T10:00:00Z')],[note('b','iPhone','2026-11-01T11:00:00Z')]);
 assert.deepEqual(result.map(n=>n.id),['a','b']);
});
test('newer text wins but older conflicting content remains available',()=>{
 const a=note('a','older','2026-11-01T10:00:00Z'),b=note('a','newer','2026-11-01T11:00:00Z');
 const result=mergeNotes([a],[b]);
 assert.equal(result[0].text,'newer');
 assert.equal(result[0].metadata.syncConflicts[0].text,'older');
});
test('same merge does not create duplicate conflicts',()=>{
 const a=note('a','older','2026-11-01T10:00:00Z'),b=note('a','newer','2026-11-01T11:00:00Z');
 const first=mergeNotes([a],[b]);
 const second=mergeNotes(first,[b]);
 assert.equal(second[0].metadata.syncConflicts.length,1);
});
test('invalid pack paths rejected before any Firestore request',()=>{
 assert.throws(()=>createFamilyNotesTransport({learner:'sai',pack:'../../private',localKey:'x'}),/Invalid lesson/);
});

test('re-merging remote conflicts is idempotent',()=>{
 const local=note('a','draft','2026-11-01T10:00:00Z'),remote=note('a','final','2026-11-01T11:00:00Z');
 const once=mergeNotes([local],[remote]);
 const twice=mergeNotes(once,[remote]);
 assert.deepEqual(twice,once);
});
test('conflict history from both devices is preserved',()=>{
 const old=note('a','first','2026-11-01T10:00:00Z');
 const newer={...note('a','third','2026-11-01T12:00:00Z'),metadata:{syncConflicts:[{text:'second',status:'open',reviewRequired:false,updatedAt:'2026-11-01T11:00:00Z'}]}};
 const merged=mergeNotes([old],[newer]);
 assert.equal(merged[0].text,'third');
 assert.deepEqual(merged[0].metadata.syncConflicts.map(x=>x.text).sort(),['first','second']);
});
