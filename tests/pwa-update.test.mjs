import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const notes=readFileSync(new URL('../inclass-notes.js',import.meta.url),'utf8');
const conf=readFileSync(new URL('../config/app-config.js',import.meta.url),'utf8');
test('InClass no longer traps an older installed application on cache-first JavaScript',()=>{
 assert.match(sw,/defaultStrategy:\s*'network-first'/);
 assert.match(sw,/cacheName:\s*'inclass-shared-v\\d+'/);
 assert.match(sw,/\.\/inclass-notes\.js/);
 assert.match(sw,/\.\/services\/family-notes\.js/);
 assert.match(sw,/\.\/services\/app-monitor-notes\.js/);
});
test('Shared Notes is explicitly versioned, with a visible app build',()=>{
 assert.match(notes,/notes\/v1\/index\.js\?v=1\.2\.6/);
 assert.match(notes,/identity-picker\.js\?v=1\.0\.2/);
 assert.match(notes,/versionInfo:/);
 assert.match(conf,/release:\s*"\d{4}\.\d{2}\.\d{2}\.\d+"/);
});

test('compact Notes actions are available on fresh and offline loads',()=>{
 assert.match(sw,/\.\/inclass-compact-tools\.js/);
 assert.match(sw,/\.\/inclass-compact-tools\.css/);
 const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
 assert.match(html,/src="inclass-compact-tools\.js"/);
 assert.match(html,/href="inclass-compact-tools\.css"/);
 const compact=readFileSync(new URL('../inclass-compact-tools.js',import.meta.url),'utf8');
 assert.match(compact,/dialog\.showModal\(\)/);
 assert.match(compact,/window\.InClassCompactTools=/);
 assert.match(compact,/make\([^)]*'sync'\)/);
});
