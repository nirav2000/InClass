import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'node:fs';
import { join, resolve, extname, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT=fileURLToPath(new URL('../',import.meta.url));
const APPS=resolve(ROOT,'../SharedApps');
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const importmap={imports:{
  'https://nirav2000.github.io/Apps/notes/v1/index.js?v=1.2.6':'/Apps/notes/v1/index.js?v=1.2.6',
  'https://nirav2000.github.io/Apps/notes/v1/identity-picker.js?v=1.0.1':'/Apps/notes/v1/identity-picker.js?v=1.0.1',
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
    const html=body.toString().replace('<head>',`<head><base href="/InClass/"><script type="importmap">${JSON.stringify(importmap)}</script>`);
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
  const timer=setTimeout(()=>fail(Error('Chrome did not start')),16000);
  processChrome.stderr.on('data',b=>{const match=String(b).match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);ok(match[1])}});
  processChrome.on('error',fail);
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
test('InClass mobile UI: safe controls, two-stage feedback, notes and navigation', {timeout:90000},async t=>{
 const http=server();
 await new Promise(ok=>http.listen(0,'127.0.0.1',ok));
 let browser;
 t.after(async()=>{await browser?.close();http.closeAllConnections();await new Promise(ok=>http.close(ok))});
 browser=await chrome();
 const {send,evalJS}=browser;
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:390,height:740,deviceScaleFactor:2,mobile:true});
 await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
 await send('Page.addScriptToEvaluateOnNewDocument',{source:`
  window.__submitCalls=[];
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
 await until(()=>evalJS('return document.querySelector("#enterAppButton")?.offsetWidth>0&&document.querySelector("[data-inclass-dev-launch]")!==null'),'welcome tools');
 const overlap=await evalJS(`
  const main=document.querySelector('#enterAppButton').getBoundingClientRect();
  return [...document.querySelectorAll('[data-inclass-dev-launch],[data-inclass-sync-button]')].some(el=>{
   const r=el.getBoundingClientRect();return r.left<main.right&&r.right>main.left&&r.top<main.bottom&&r.bottom>main.top;
  });
 `);
 assert.equal(overlap,false,'Parent tools must not cover Continue latest homework');
 await evalJS('document.querySelector("[data-inclass-dev-launch]").click();return true');
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
 await evalJS('document.querySelector("[data-dev-back]").click();document.querySelector("[data-dev-cancel]").click();return true');
 await until(()=>evalJS('return !document.querySelector("dialog.inclass-dev-dialog")'),'cancel closes dialog');
 await evalJS('document.querySelector("#enterAppButton").click();return true');
 await until(()=>evalJS('return !document.querySelector("#appShell").classList.contains("hidden")'),'homework lesson');
 assert.equal(await evalJS('return !!document.querySelector("[data-inclass-sync-button]")?.getClientRects().length'),true,'Sync button accessible within lesson');
 assert.equal(await evalJS('return !!document.querySelector(".apps-notes-launcher")?.getClientRects().length'),true,'Notes button accessible within lesson');
 await evalJS('document.querySelector("#homeButton").click();return true');
 await until(()=>evalJS('return !document.querySelector("#welcomeScreen").classList.contains("hidden")'),'home navigation');
 assert.equal(await evalJS('return document.querySelector("#enterAppButton").getClientRects().length>0'),true);
});
