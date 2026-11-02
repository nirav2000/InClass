import assert from 'node:assert/strict';
import fs from 'node:fs';
function read(path){return fs.readFileSync(path,'utf8');}
const config=JSON.parse(read('pwa.config.json'));
const manifest=JSON.parse(read('manifest.webmanifest'));
const html=read('index.html'),sw=read('sw.js');
assert.equal(manifest.id,config.id);
assert.equal(manifest.display,'standalone');
assert.equal(manifest.short_name,config.short_name);
assert.equal(manifest.scope,'./');
assert.equal(manifest.start_url,'./');
assert.match(html,/rel=["']manifest["']/);
assert.match(html,/rel=["']apple-touch-icon["'][^>]*icons\/icon-180.png/);
assert.match(html,/Apps\/pwa\/v1\/index.js/);
assert.match(html,/serviceWorkerUrl:\s*['"]\.\/sw.js['"]/);
assert.match(sw,/Apps\/pwa\/v1\/service-worker.js/);
assert.match(sw,/APPS_PWA_CONFIG/);
assert.match(sw,/2026-11-02-french-avoir\.js/,'Latest French homework must remain precached');
assert.match(sw,/2026-09-french-pets\.js/,'Earlier French homework must stay preserved');
const want=new Map([['icons/icon-180.png',180],['icons/icon-192.png',192],['icons/icon-512.png',512],['icons/icon-maskable-512.png',512]]);
for(const [file,size] of want){
 assert.ok(fs.existsSync(file),'Missing '+file);
 const bytes=fs.readFileSync(file);
 assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a',file+' PNG signature');
 assert.equal(bytes.readUInt32BE(16),size,file+' width');
 assert.equal(bytes.readUInt32BE(20),size,file+' height');
 assert.ok(bytes.length>512,file+' appears incomplete');
}
for(const icon of manifest.icons){
 assert.ok(fs.existsSync(icon.src),'Missing manifest icon '+icon.src);
 assert.ok(/image\/png/.test(icon.type),'Manifest should use reliable raster icons');
}
assert.ok(manifest.icons.some(icon=>icon.sizes==='192x192'));
assert.ok(manifest.icons.some(icon=>icon.sizes==='512x512'&&icon.purpose==='maskable'));
assert.ok(fs.existsSync('icons/favicon.svg'));
console.log('PASS: InClass iOS/Android icons, manifest, shared worker, old and new lessons');
