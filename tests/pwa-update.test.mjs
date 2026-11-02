import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const sw=readFileSync(new URL('../sw.js',import.meta.url),'utf8');
const notes=readFileSync(new URL('../inclass-notes.js',import.meta.url),'utf8');
const conf=readFileSync(new URL('../config/app-config.js',import.meta.url),'utf8');
test('InClass no longer traps an older installed application on cache-first JavaScript',()=>{
 assert.match(sw,/defaultStrategy:\s*'network-first'/);
 assert.match(sw,/cacheName:\s*'inclass-shared-v13'/);
 assert.match(sw,/\.\/inclass-notes\.js/);
 assert.match(sw,/\.\/services\/family-notes\.js/);
 assert.match(sw,/\.\/services\/app-monitor-notes\.js/);
});
test('Shared Notes is explicitly versioned, with a visible app build',()=>{
 assert.match(notes,/notes\/v1\/index\.js\?v=1\.2\.5/);
 assert.match(notes,/identity-picker\.js\?v=1\.0\.1/);
 assert.match(notes,/versionInfo:/);
 assert.match(conf,/release:\s*"2026\.11\.02\.6"/);
});
