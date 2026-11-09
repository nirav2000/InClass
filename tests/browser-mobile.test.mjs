import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT=resolve(fileURLToPath(new URL('../',import.meta.url)));
const APPS=resolve(ROOT,'SharedApps');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const importmap={imports:{
  'https://nirav2000.github.io/Apps/notes/v1/index.js?v=1.2.6':'/Apps/notes/v1/index.js?v=1.2.6',
  'https://nirav2000.github.io/Apps/notes/v1/identity-picker.js?v=1.0.2':'/Apps/notes/v1/identity-picker.js?v=1.0.2',
  'https://nirav2000.github.io/Apps/notes/v1/cloud.js':'/Apps/notes/v1/cloud.js',
  'https://nirav2000.github.io/Apps/pwa/v1/index.js':'/Apps/pwa/v1/index.js'
}};
function server(){
 return createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1'),p=decodeURIComponent(url.pathname);
  if(p==='/favicon.ico'){res.writeHead(204);res.end();return}
  let file;
  if(p.startsWith('/Apps/'))file=resolve(APPS,p.slice('/Apps/'.length));
  else if(p.startsWith('/InClass/'))file=resolve(ROOT,p.slice('/InClass/'.length)||'index.html');
  else {res.writeHead(404);res.end();return}
  const base=p.startsWith('/Apps/')?APPS:ROOT;
  if(file!==base&&!file.startsWith(base+sep)){res.writeHead(403);res.end();return}
  try{
   let body=readFileSync(file);
   if(file.endsWith('index.html')){
    const html=body.toString().replace('<head>',`<head><base href="/InClass/"><script type="importmap">${JSON.stringify(importmap)}</script>`).replace('https://nirav2000.github.io/Apps/apps-pronunciation.js?v=3','/Apps/apps-pronunciation.js?v=3');
    body=Buffer.from(html);
   }
   const type={'.js':'text/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.webmanifest':'application/manifest+json'}[extname(file)]||'text/plain';
   res.writeHead(200,{'Content-Type':type,'Cache-Control':'no-store'});res.end(body);
  }catch(e){res.writeHead(404);res.end('Missing local test asset: '+p)}
 });
}
async function chrome(){
 const dir=mkdtempSync(join(tmpdir(),'inclass-mobile-'));
 const bin=process.env.CHROME_BIN||['chromium','google-chrome','chromium-browser'].map(x=>{try{return execFileSync('which',[x],{encoding:'utf8'}).trim()}catch{return''}}).find(Boolean);
 if(!bin)throw Error('Chrome/Chromium missing from test runner');
 const processChrome=spawn(bin,['--headless=new','--no-sandbox','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check','--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+dir,'about:blank'],{stdio:['ignore','ignore','pipe'],detached:true});
 const wsurl=await new Promise((ok,fail)=>{
  let stderr='';
  const timer=setTimeout(()=>fail(Error('Chrome did not start: '+stderr.slice(-1800))),45000);
  processChrome.stderr.on('data',b=>{
    stderr+=String(b);
    const match=String(b).match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if(match){clearTimeout(timer);ok(match[1])}
  });
  processChrome.on('error',e=>{clearTimeout(timer);fail(e)});
  processChrome.on('exit',(code,signal)=>{clearTimeout(timer);fail(Error('Chrome exited before starting: '+code+' '+signal+' '+stderr.slice(-1800)))});
 });
 const endpoint=new URL(wsurl).origin.replace('ws:','http:');
 const tab=await (await fetch(endpoint+'/json/new?about:blank',{method:'PUT'})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((ok,fail)=>{ws.onopen=ok;ws.onerror=fail});
 let next=0;const jobs=new Map();
 ws.onmessage=e=>{
  const event=JSON.parse(String(e.data)),job=jobs.get(event.id);
  if(!job)return;jobs.delete(event.id);
  event.error?job.fail(Error(event.error.message)):job.ok(event.result||{});
 };
 const send=(method,params={})=>new Promise((ok,fail)=>{
  const id=++next;jobs.set(id,{ok,fail});ws.send(JSON.stringify({id,method,params}));
  setTimeout(()=>{if(jobs.delete(id))fail(Error('Chrome request timed out: '+method))},12000).unref?.();
 });
 const evalJS=async code=>{
  const result=await send('Runtime.evaluate',{expression:'(async()=>{'+code+'})()',returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw Error('Browser exception: '+(result.exceptionDetails.exception?.description||result.exceptionDetails.text));
  return result.result?.value;
 };
 const close=async()=>{
  ws.close();try{process.kill(-processChrome.pid,'SIGKILL')}catch{processChrome.kill('SIGKILL')}
  try{rmSync(dir,{recursive:true,force:true})}catch{}
 };
 return {send,evalJS,close};
}
async function until(callback,what){
 for(let i=0;i<100;i++){if(await callback())return;await wait(100)}
 throw Error('Timed out waiting for '+what);
}
test('InClass mobile UI: safe controls, two-stage feedback, notes and navigation', {timeout:155000},async t=>{
 const http=server();
 await new Promise(ok=>http.listen(0,'127.0.0.1',ok));
 let browser;
 t.after(async()=>{await browser?.close();http.closeAllConnections();await new Promise(ok=>http.close(ok))});
 browser=await chrome();
 const {send,evalJS}=browser;
 async function touch(selector){
   await evalJS(`document.querySelector(${JSON.stringify(selector)})?.scrollIntoView({block:'center',inline:'nearest',behavior:'instant'});return true`);
   await wait(200);
   const point=await evalJS(`
     const el=document.querySelector(${JSON.stringify(selector)});
     if(!el)return null;
     const r=el.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;
     const hit=document.elementFromPoint(x,y);
     return {x,y,visible:r.width>0&&r.height>=35,hit:hit?.outerHTML.slice(0,160),direct:hit===el||!!hit?.closest('button')?.isSameNode(el),disabled:el.disabled}
   `);
   console.log('INCLASS_TOUCH_TARGET',selector,JSON.stringify(point));
   assert.ok(point?.visible,'Touch target must be visible and large enough: '+selector);
   assert.ok(!point.disabled,'Touch target must be enabled: '+selector);
   assert.ok(point.direct,'Another element intercepted the touch: '+selector+' hit '+point.hit);
   await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:0,x:point.x,y:point.y}]});
   await wait(65);
   await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 }
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:2,mobile:true});
 await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
  window.__submitCalls=[];
  window.__browserErrors=[];
  window.__touchClicks=[];document.addEventListener('click',e=>window.__touchClicks.push(e.target?.id||e.target?.getAttribute('data-action')||e.target?.className||'unknown'),true);
  window.addEventListener('error',event=>window.__browserErrors.push(String(event.message||event.error)));
  window.addEventListener('unhandledrejection',event=>window.__browserErrors.push(String(event.reason)));
  window.AppsPasskeyAuth={create:()=>({
   restoreSession:()=>{},validateSession:async()=>({method:'passkey'}),
   passkeyLogin:async()=>{},authHeaders:()=>({'X-App-Monitor-Session':'test-session'})
  })};
  const nativeFetch=window.fetch.bind(window);
  window.fetch=(input,init)=> {
   if(String(input).includes('/app-monitor/notes')){
    window.__submitCalls.push({url:String(input),body:String(init?.body||'')});
    return Promise.resolve(new Response(JSON.stringify({note:{metadata:{developmentIssue:{number:123,url:'https://github.com/nirav2000/InClass/issues/123'}}}}),{status:200,headers:{'Content-Type':'application/json'}}));
   }
   return nativeFetch(input,init);
  };
 `});
 await send('Page.navigate',{url:'http://127.0.0.1:'+http.address().port+'/InClass/'});
 await wait(1500);
 console.log('INCLASS_BROWSER_DIAG',JSON.stringify(await evalJS(`return {ready:document.readyState,url:location.href,enter:!!document.querySelector('#enterAppButton'),enterWidth:document.querySelector('#enterAppButton')?.offsetWidth,dev:!!document.querySelector('[data-inclass-dev-launch]'),sync:!!document.querySelector('[data-inclass-sync-button]'),errors:window.__browserErrors||[],body:document.body?.textContent.slice(0,150)}`)));
 await until(()=>evalJS('const b=document.querySelector("#enterAppButton");return document.readyState==="complete"&&!!b?.offsetWidth&&!b.disabled&&typeof b.onclick==="function"&&document.querySelector("[data-inclass-dev-launch]")!==null'),'welcome tools');
 const overlap=await evalJS(`
  const main=document.querySelector('#enterAppButton').getBoundingClientRect();
  return [...document.querySelectorAll('[data-inclass-dev-launch],[data-inclass-sync-button]')].some(el=>{
   const r=el.getBoundingClientRect();return r.left<main.right&&r.right>main.left&&r.top<main.bottom&&r.bottom>main.top;
  });
 `);
 assert.equal(overlap,false,'Parent tools must not cover Continue latest homework');
 await evalJS('document.querySelector(".inclassCompactToggle").click();document.querySelector(".inclassCompactMenu [data-action=issue]").click();return true');
 await until(()=>evalJS('return !!document.querySelector("dialog.inclass-dev-dialog[open]")'),'feedback dialog');
 let within=await evalJS('const r=document.querySelector("dialog.inclass-dev-dialog").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight');
 assert.equal(within,true,'Feedback modal must fit phone viewport');
 await evalJS('document.querySelector("[data-dev-review]").click();return true');
 assert.match(await evalJS('return document.querySelector("[data-dev-error]").textContent'),/describe|characters|write|text/i);
 assert.equal(await evalJS('return window.__submitCalls.length'),0,'Empty form must not contact GitHub');
 await evalJS(`document.querySelector("[data-dev-text]").value="On iPhone, the notes button covers the homework button.";
  document.querySelector("[data-dev-text]").dispatchEvent(new Event('input',{bubbles:true}));
  document.querySelector("[data-dev-review]").click();return true`);
 assert.match(await evalJS('return document.querySelector("[data-dev-error]").textContent'),/confirm|approval|privacy|tick|check/i);
 await evalJS('document.querySelector("[data-dev-consent]").checked=true;document.querySelector("[data-dev-review]").click();return true');
 await until(()=>evalJS('return !document.querySelector("[data-dev-preview]").hidden'),'preview phase');
 assert.equal(await evalJS('return window.__submitCalls.length'),0,'Preview alone must not submit');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:490,deviceScaleFactor:2,mobile:true});
 const actionVisible=await evalJS(`
  const d=document.querySelector('dialog.inclass-dev-dialog'),b=d.querySelector('[data-dev-submit-final]');
  b.scrollIntoView({block:'end'});const r=b.getBoundingClientRect();
  return {within: r.top>=0&&r.bottom<=innerHeight, height:d.getBoundingClientRect().height,inner:innerHeight};
 `);
 assert.equal(actionVisible.within,true,'Final confirmation must remain reachable above the virtual keyboard');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:2,mobile:true});
 await evalJS('document.querySelector("[data-dev-back]").click();document.querySelector("[data-dev-review]").click();document.querySelector("[data-dev-submit-final]").click();return true');
 await until(()=>evalJS('return window.__submitCalls.length===1'),'one approved mock development issue');
 assert.match(await evalJS('return document.querySelector("[data-dev-result]").textContent'),/issue #123 created successfully/i);
 assert.equal(await evalJS('return window.__submitCalls.length'),1,'Review and confirmation may create only one issue');
 await evalJS('document.querySelector("dialog.inclass-dev-dialog").close();return true');
 await until(()=>evalJS('return !document.querySelector("dialog.inclass-dev-dialog")'),'cancel closes dialog');
 await evalJS('document.querySelector("#enterAppButton").click();return true');
 await until(()=>evalJS('return !document.querySelector("#appShell").classList.contains("hidden")'),'homework lesson');
 assert.equal(await evalJS('return document.querySelectorAll("#inclassLessonTools>.inclassCompactTools").length===1'),true,'One compact Notes button replaces the three large tools');
 assert.equal(await evalJS('return !!document.querySelector("#inclassLessonTools .inclassCompactToggle")?.getClientRects().length'),true,'Notes menu visible within lesson');
 assert.equal(await evalJS('return [...document.querySelectorAll("#inclassLessonTools>.apps-notes-launcher,#inclassLessonTools>.inclassSyncButton,#inclassLessonTools>.inclassDevButton")].every(b=>b.getClientRects().length===0)'),true,'Legacy full-size buttons must be visually hidden');
 await evalJS('document.querySelector(".inclassCompactToggle").click();document.querySelector(".inclassCompactMenu [data-action=notes]").click();document.querySelector(".apps-notes-dialog [data-new]").click();return true');
 await until(()=>evalJS('return !document.querySelector(".apps-notes-dialog .note-composer").hidden'),'notes composer');
 await evalJS('const input=document.querySelector(".apps-notes-dialog .note-composer textarea");input.value="InClass mobile browser persistent test note";input.dispatchEvent(new Event("input",{bubbles:true}));document.querySelector(".apps-notes-dialog [data-save]").click();return true');
 await until(()=>evalJS('return Array.from({length:localStorage.length},(_,i)=>localStorage.getItem(localStorage.key(i))).some(s=>s?.includes("InClass mobile browser persistent test note"))'),'local-first note save');
 assert.match(await evalJS('return document.querySelector(".apps-notes-dialog .list").textContent'),/InClass mobile browser persistent test note/);
 await evalJS('document.querySelector(".apps-notes-dialog [data-close]").click();return true');
 await evalJS('document.querySelector("#homeButton").click();return true');
 await until(()=>evalJS('return !document.querySelector("#welcomeScreen").classList.contains("hidden")'),'home navigation');
 assert.equal(await evalJS('return document.querySelector("#enterAppButton").getClientRects().length>0'),true);
 // Only ONE persistent header action is visible on mobile: the Notes menu.
 const header=await evalJS(`const bar=document.querySelector('.welcomeAuth');return {buttons:[...bar.querySelectorAll('button')].filter(b=>b.getClientRects().length>0).map(b=>b.className),accountHidden:document.querySelector('#signInButton')?.getClientRects().length===0,installInside:!!document.querySelector('.inclassCompactMenu #installInClassButton'),progressInside:!!document.querySelector('.inclassCompactMenu #authStatus')}`);
 assert.deepEqual(header.buttons,['inclassCompactToggle'],'Welcome header must show only one small Notes control');
 assert.ok(header.accountHidden&&header.installInside&&header.progressInside,'Install app, preview status and sign-in must be inside the menu');
 await touch('#inclassHomeTools .inclassCompactToggle');
 await touch('#inclassHomeTools .inclassCompactMenu [data-action=sync]');
 await wait(160);
 console.log('INCLASS_HEADER_ACCOUNT',JSON.stringify(await evalJS(`return {loader:!!document.querySelector('dialog.inclassAccountLoader[open]'),picker:!!document.querySelector('dialog.apps-notes-identity[open]'),errors:window.__browserErrors}`)));
 assert.equal(await evalJS('return !!document.querySelector("dialog.inclassAccountLoader[open]")||!!document.querySelector("dialog.apps-notes-identity[open]")'),true,'First touchscreen tap on Account & sync must show a dialog');
 await wait(800);
 console.log('INCLASS_PICKER_DIAG',JSON.stringify(await evalJS(`return {status:document.querySelector('#inclassNotesStatus')?.textContent,buttonDisabled:document.querySelector('[data-inclass-sync-button]')?.disabled,picker:!!document.querySelector('dialog.apps-notes-identity'),message:document.querySelector('#authMessage')?.textContent,errors:window.__browserErrors||[]}`)));
 await until(()=>evalJS('return !!document.querySelector("dialog.apps-notes-identity[open]")'),'shared Notes sign-in picker from home');
 assert.equal(await evalJS('return document.querySelector("#authMessage").classList.contains("hidden")'),true,'The generic unavailable Firebase error must not appear');
 await evalJS('document.querySelector("dialog.apps-notes-identity [data-action=close]").click();return true');
 await touch('#inclassHomeTools .inclassCompactToggle');
 assert.equal(await evalJS('return !document.querySelector("#inclassHomeTools .inclassCompactMenu").hidden'),true,'Header Notes menu opens after login');
 await touch('#inclassHomeTools .inclassCompactMenu #installInClassButton');
 await wait(140);
 assert.equal(await evalJS('return !document.querySelector("#inclassPwaHelp").hidden'),true,'Install app is accessible from the compact menu');
 assert.equal(await evalJS('return document.querySelector(".inclassCompactMenu").hidden'),true,'Install action closes the compact menu');


 // A first tap on the compact sync action must open a dialog even when
 // the shared options fail. Errors must be visible and recoverable.
 await evalJS('window.__goodIdentityHandler=window.InClassNotesShowIdentity;window.InClassNotesShowIdentity=()=>Promise.reject(Error("Simulated connection failure"));return true');
 await touch('.inclassCompactToggle');
 await touch('.inclassCompactMenu [data-action=sync]');
 assert.equal(await evalJS('return !!document.querySelector("dialog.inclassAccountLoader[open]")'),true,'A real touchscreen tap on Notes sync must open the account dialog');
 await until(()=>evalJS('return !document.querySelector("dialog.inclassAccountLoader [data-retry]")?.hidden'),'retry after failed notes account import');
 assert.match(await evalJS('return document.querySelector("dialog.inclassAccountLoader [data-progress]").textContent'),/Simulated connection failure/);
 await evalJS('window.InClassNotesShowIdentity=window.__goodIdentityHandler;document.querySelector("dialog.inclassAccountLoader [data-retry]").click();return true');
 await until(()=>evalJS('return !!document.querySelector("dialog.apps-notes-identity[open]")'),'sync account picker after retry');
 await evalJS('document.querySelector("dialog.apps-notes-identity [data-action=close]").click();return true');

 const previousOrigin=await evalJS('return performance.timeOrigin');
 await send('Page.reload',{ignoreCache:true});
 await wait(450);
 await until(()=>evalJS('const b=document.querySelector("#enterAppButton");return performance.timeOrigin>'+previousOrigin+'&&document.readyState==="complete"&&!!b?.offsetWidth&&!b.disabled&&typeof b.onclick==="function"'),'fresh interactive app reload');
 const launchResult=await evalJS('try{document.querySelector("#enterAppButton").onclick();return "ok"}catch(error){return error?.stack||String(error)}');
 console.log('INCLASS_LAUNCH_RESULT',launchResult);
 assert.equal(launchResult,'ok','Latest lesson must open without throwing an exception');
 await wait(500);
 console.log('INCLASS_RELOAD_DIAG',JSON.stringify(await evalJS(`return {ready:document.readyState,lesson:document.querySelector('#weekSelect')?.value,shellHidden:document.querySelector('#appShell')?.classList.contains('hidden'),notesStatus:document.querySelector('#inclassNotesStatus')?.textContent,launchers:document.querySelectorAll('.apps-notes-launcher').length,syncButtons:document.querySelectorAll('[data-inclass-sync-button]').length,errors:window.__browserErrors||[]}`)));
 await until(()=>evalJS('return !!document.querySelector("#inclassLessonTools .inclassCompactToggle")?.getClientRects().length'),'compact Notes menu after reload');
 await evalJS('document.querySelector(".inclassCompactToggle").click();document.querySelector(".inclassCompactMenu [data-action=notes]").click();return true');
 await until(()=>evalJS('return document.querySelector(".apps-notes-dialog .list")?.textContent.includes("InClass mobile browser persistent test note")'),'saved note after full page reload');
 await evalJS('document.querySelector(".apps-notes-dialog [data-close]").click();return true');
 await send('Emulation.setDeviceMetricsOverride',{width:820,height:1180,deviceScaleFactor:2,mobile:true});
 const ipad=await evalJS(`const dock=document.querySelector('#inclassLessonTools').getBoundingClientRect();return {viewport:innerWidth,dockLeft:dock.left,dockRight:dock.right,buttons:[...document.querySelectorAll('#inclassLessonTools button')].map(b=>{const r=b.getBoundingClientRect();return {label:b.textContent.trim(),left:r.left,right:r.right,height:r.height}})}`);
 assert.ok(ipad.dockLeft>=0&&ipad.dockRight<=ipad.viewport+1,'iPad tools must stay within viewport');
 const visibleButtons=ipad.buttons.filter(b=>b.height>0);
 assert.equal(visibleButtons.length,1,'Only the compact Notes control is shown on the iPad toolbar');
 assert.ok(visibleButtons.every(b=>b.left>=0&&b.right<=ipad.viewport+1&&b.height>=40),'Compact iPad Notes control must fit and be tappable');
 await evalJS('document.querySelector(".inclassCompactToggle").click();document.querySelector(".inclassCompactMenu [data-action=issue]").click();return true');
 await until(()=>evalJS('return !!document.querySelector("dialog.inclass-dev-dialog[open]")'),'development form on iPad');
 assert.equal(await evalJS('const r=document.querySelector("dialog.inclass-dev-dialog").getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight'),true,'Feedback panel fits iPad screen');
 await evalJS('document.querySelector("[data-dev-cancel]").click();return true');

 // Recorder must be reachable inside the existing ONE compact iPad toolbar.
 await evalJS('document.querySelector(".inclassCompactToggle").click();document.querySelector(".inclassCompactMenu [data-action=record]").click();return true');
 assert.equal(await evalJS('return !!document.querySelector("dialog.inclassRecorderDialog[open]")'),true,'Recorder opens on the first tap from the compact menu');
 assert.equal(await evalJS('return !!document.querySelector("dialog.inclassRecorderDialog video")'),true,'Parent review video exists');
 assert.equal(await evalJS('return document.querySelector("dialog.inclassRecorderDialog [data-session-consent]") === null'),true,'Parent approval checkbox is gone');
 assert.equal(await evalJS('return document.querySelector("dialog.inclassRecorderDialog [data-session-auto]").checked'),false,'Auto-record is initially off on a new browser');
 await evalJS('const d=document.querySelector("dialog.inclassRecorderDialog");const input=d.querySelector("[data-session-file]");const f=new File([new Uint8Array(512)],"sample-learning.mp4",{type:"video/mp4"});Object.defineProperty(input,"files",{configurable:true,value:[f]});input.dispatchEvent(new Event("change",{bubbles:true}));return true');
 await until(()=>evalJS('const d=document.querySelector("dialog.inclassRecorderDialog");return !!d?.querySelector(".inclassRecorderItem")&&!d.querySelector("[data-session-review]").hidden'),'local video import and preview');
 await evalJS('const d=document.querySelector("dialog.inclassRecorderDialog");d.querySelector("[data-session-note-type]").value="confusion";d.querySelector("[data-session-note-text]").value="Learner asked why the rule changes";d.querySelector("[data-session-note]").click();return true');
 await until(()=>evalJS('return /Observation saved locally/.test(document.querySelector("[data-session-status]")?.textContent||"")'),'locally saved parent observation');
 const recordedMeta=await evalJS('return await new Promise((resolve,reject)=>{const req=indexedDB.open("inclass-session-recordings-v1");req.onerror=()=>reject(req.error);req.onsuccess=()=>{const q=req.result.transaction("sessions").objectStore("sessions").getAll();q.onerror=()=>reject(q.error);q.onsuccess=()=>resolve(q.result.map(v=>({source:v.source,markers:v.markers.length})));}})');
 assert.equal(recordedMeta.length,1,'One locally imported recording');
 assert.equal(recordedMeta[0].source,'import');
 assert.equal(recordedMeta[0].markers,1,'Parent observation saved');
 assert.equal(await evalJS('return window.__submitCalls.length'),0,'Child recording never creates a public GitHub issue (fresh page after reload)');
 await evalJS('window.confirm=()=>true;document.querySelector("dialog.inclassRecorderDialog [data-session-delete]").click();return true');
 await until(()=>evalJS('return document.querySelector("dialog.inclassRecorderDialog [data-session-review]")?.hidden===true'),'local video deleted');
 assert.equal(await evalJS('return document.querySelectorAll("dialog.inclassRecorderDialog .inclassRecorderItem").length'),0,'No deleted video remains in the library');
 await evalJS('const d=document.querySelector("dialog.inclassRecorderDialog");const sw=d.querySelector("[data-session-auto]");sw.checked=true;sw.dispatchEvent(new Event("change",{bubbles:true}));d.close();return true');
 // A cancelled iPad sharing picker must leave the lesson usable and offer retry.
 await evalJS('window.__screenCalls=0;Object.defineProperty(navigator.mediaDevices,"getDisplayMedia",{configurable:true,value:()=>{window.__screenCalls++;return Promise.reject(Object.assign(new Error("Picker cancelled"),{name:"NotAllowedError"}))}});return true');
 await evalJS('document.querySelector("#homeButton").click();document.querySelector(".welcomeHomeworkCard").click();return true');
 await until(()=>evalJS('return window.__screenCalls === 1 && !!document.querySelector(".inclassRecorderNotification:not([hidden])")'),'auto-record picker and retry notice');
 assert.equal(await evalJS('return document.querySelector(".inclassRecorderNotification [data-recorder-notice-action]").textContent'), 'Try recording','Permission error offers a retry');
 assert.equal(await evalJS('return !!document.querySelector("dialog.inclassRecorderDialog[open]")'),false,'The recorder dialog does not block the lesson');
 await evalJS('window.InClassSessionRecorder.setAutoEnabled(false);document.querySelector("#homeButton").click();document.querySelector(".welcomeHomeworkCard").click();return true');
 assert.equal(await evalJS('return window.__screenCalls'),1,'Turning off auto-record prevents permission prompts');
 // Exercise real IndexedDB persistence with a deterministic media encoder.
 // This verifies multiple segments, no repeated sharing picker, review and recovery
 // without waiting five actual minutes in CI.
 await evalJS('window.__screens=0;window.__mics=0;window.__encoders=[];class TestTrack{constructor(kind){this.kind=kind;this.readyState="live"}stop(){this.readyState="ended"}addEventListener(name,callback){if(name==="ended")this.onended=callback}}class TestStream{constructor(tracks=[]){this.tracks=tracks}getTracks(){return this.tracks}getVideoTracks(){return this.tracks.filter(t=>t.kind==="video")}getAudioTracks(){return this.tracks.filter(t=>t.kind==="audio")}}class TestRecorder{static isTypeSupported(type){return type==="video/webm"}constructor(stream){this.stream=stream;this.state="inactive";this.mimeType="video/webm";window.__encoders.push(this)}start(){this.state="recording"}requestData(){if(this.state==="recording")this.ondataavailable?.({data:new Blob(["checkpoint-data-"+window.__encoders.indexOf(this)],{type:"video/webm"})})}stop(){this.requestData();this.state="inactive";queueMicrotask(()=>this.onstop?.())}}window.MediaRecorder=TestRecorder;window.MediaStream=TestStream;Object.defineProperty(navigator.mediaDevices,"getDisplayMedia",{configurable:true,value:()=>{window.__screens++;return Promise.resolve(new TestStream([new TestTrack("video")]))}});Object.defineProperty(navigator.mediaDevices,"getUserMedia",{configurable:true,value:()=>{window.__mics++;return Promise.resolve(new TestStream([new TestTrack("audio")]))}});Object.defineProperty(navigator,"storage",{configurable:true,value:{estimate:async()=>({quota:1000000000,usage:250000000})}});return true');
 await evalJS('window.__partsState=async()=>{const db=await new Promise((ok,bad)=>{const r=indexedDB.open("inclass-session-recordings-v1");r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});return await new Promise((ok,bad)=>{const tx=db.transaction(["sessions","segments","chunks"]);const a=tx.objectStore("sessions").getAll(),b=tx.objectStore("segments").getAll(),c=tx.objectStore("chunks").getAll();tx.oncomplete=()=>{db.close();ok({sessions:a.result,parts:b.result,chunks:c.result})};tx.onerror=()=>bad(tx.error)})};window.__simulateInterruption=async()=>{const db=await new Promise((ok,bad)=>{const r=indexedDB.open("inclass-session-recordings-v1");r.onsuccess=()=>ok(r.result);r.onerror=()=>bad(r.error)});await new Promise((ok,bad)=>{const tx=db.transaction("sessions","readwrite");const store=tx.objectStore("sessions"),req=store.getAll();req.onsuccess=()=>{const meta=req.result.find(x=>x.storageFormat==="chunks-v2");meta.status="recording";meta.updatedAt=new Date(Date.now()-120000).toISOString();store.put(meta)};tx.oncomplete=ok;tx.onerror=()=>bad(tx.error)});db.close()};return true');
 await evalJS('window.InClassSessionRecorder.setAutoEnabled(true);document.querySelector("#homeButton").click();document.querySelector(".welcomeHomeworkCard").click();return true');
 await until(()=>evalJS('return !!document.querySelector(".inclassRecordingBadge:not([hidden])") && window.__encoders.length===1'),'synthetic recording underway');
 await evalJS('window.InClassSessionRecorder.checkpointNow();return true');
 await until(()=>evalJS('return window.__partsState().then(x=>x.parts.length===1&&x.parts[0].status==="complete"&&window.__encoders.length===2)'),'first durable five-minute segment');
 assert.equal(await evalJS('return window.__screens'),1,'Rotating into the next part does not request screen permission again');
 assert.equal(await evalJS('return window.__mics'),1,'Microphone permission is not requested again');
 await evalJS('document.querySelector(".inclassRecordingBadge [data-session-stop]").click();return true');
 await until(()=>evalJS('return window.__partsState().then(x=>x.sessions.length===1&&x.sessions[0].status==="saved"&&x.parts.length===2&&x.chunks.length===2)'),'stop saves a second part and finalises session');
 const recordedParts=await evalJS('return await window.__partsState()');
 assert.equal(recordedParts.parts.every(p=>p.status==='complete'&&p.sizeBytes>0),true,'Each part has independently durable video data');
 assert.equal(recordedParts.sessions[0].storageFormat,'chunks-v2');
 assert.equal(await evalJS('return window.__screens'),1,'One screen picker per session, even with multiple parts');
 await evalJS('window.InClassSessionRecorder.open();return true');
 await until(()=>evalJS('return document.querySelector("[data-session-storage-usage]")?.textContent.includes("750.0 MB")'),'storage allowance shown in MB');
 assert.match(await evalJS('return document.querySelector("[data-session-storage-time]").textContent'),/Estimated recording time remaining: about/);
 await evalJS('document.querySelector("dialog.inclassRecorderDialog .inclassRecorderItem").click();return true');
 await until(()=>evalJS('return document.querySelectorAll("[data-session-part-list] button").length===2'),'segmented video review');
 assert.match(await evalJS('return document.querySelector("[data-session-part-status]").textContent'),/Part 1 of 2/);
 await evalJS('document.querySelector("[data-session-part-next]").click();return true');
 await until(()=>evalJS('return document.querySelector("[data-session-part-status]").textContent.includes("Part 2 of 2")'),'next-part navigation');
 assert.match(await evalJS('return document.querySelector("[data-session-download]").textContent'),/Download this part/);
 // Simulate an old recording whose last tab vanished before updating status.
 await evalJS('return await window.__simulateInterruption()');
 await evalJS('document.querySelector("dialog.inclassRecorderDialog").close();window.InClassSessionRecorder.open();return true');
 await until(()=>evalJS('return document.querySelector(".inclassRecorderItem")?.textContent.includes("Recoverable parts")'),'recover stale recording without discarding saved parts');
 assert.equal((await evalJS('return await window.__partsState()')).parts.length,2,'Recovery leaves committed parts untouched');
 await evalJS('document.querySelector("dialog.inclassRecorderDialog .inclassRecorderItem").click();return true');
 await until(()=>evalJS('return document.querySelectorAll("[data-session-part-list] button").length===2'),'recovered parts are reviewable');
 await evalJS('document.querySelector("dialog.inclassRecorderDialog [data-session-delete]").click();return true');
 await until(()=>evalJS('return window.__partsState().then(x=>x.sessions.length===0&&x.parts.length===0&&x.chunks.length===0)'),'delete clears session metadata and every stored chunk');


 // Newly assigned English pack: exercise actual iPhone-sized tap targets,
 // correct route, concept feedback, independent explanation and mock test launch.
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:2,mobile:true});
 await evalJS('window.InClassSessionRecorder.setAutoEnabled(false);document.querySelector("dialog.inclassRecorderDialog[open]")?.close();document.querySelector("#subjectSelect").value="English";document.querySelector("#subjectSelect").dispatchEvent(new Event("change",{bubbles:true}));document.querySelector("#weekSelect").value="2026-11-09-english-floss-y5";document.querySelector("#weekSelect").dispatchEvent(new Event("change",{bubbles:true}));return true');
 await until(()=>evalJS('return !!document.querySelector("#fl-school") && !!document.querySelector("#flStartConcepts")'),'FLOSS Year 5 lesson route');
 const spellBank=await evalJS('return Array.from(document.querySelectorAll("#fl-bank .fl-word-line strong"),e=>e.textContent)');
 assert.deepEqual(spellBank,['thrill','drizzle','grizzled','muffled','tassel','bristling','snazzy','nuzzling','paddle','muzzle','sniffle','tussle']);
 await touch('#flStartConcepts');
 await until(()=>evalJS('return !!document.querySelector("#flConceptArea [data-fl-choice]")'),'FLOSS concept buttons');
 await touch('#flConceptArea [data-fl-choice="0"]');
 assert.match(await evalJS('return document.querySelector("#flConceptWhy").textContent'),/short.*sound/i);
 await touch('#flConceptNext');
 assert.match(await evalJS('return document.querySelector("#flConceptArea").textContent'),/syllables/i);
 await evalJS('document.querySelector("#flTeachBackText").value="The short vowel sound is like u in puff. FLOSS words usually have one syllable and finish with f l s or z. Puff uses ff but roof has a long oo and just f. Not every double letter follows FLOSS.";return true');
 await touch('#flSaveTeachBack');
 assert.match(await evalJS('return document.querySelector("#flTeachBackFeedback").textContent'),/Saved for a parent or tutor/i);
 await touch('#flStartTest');
 await until(()=>evalJS('return !!document.querySelector("#flTestAnswer") && !!document.querySelector("#flTestHear")'),'12-question English practice test');
 await touch('#flTestHear');
 assert.equal(await evalJS('return document.querySelector("#flTestAnswer").getBoundingClientRect().width>100'),true,'School-format test input is usable on iPhone width');

});
