import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn, execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve, extname, sep } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const ROOT=resolve(fileURLToPath(new URL("../",import.meta.url)));
const OUT=join(ROOT,".tmp","worksheet-pdfs");
const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const read=file=>readFileSync(join(ROOT,file),"utf8");
const sources=Array.from(read("index.html").matchAll(/src="(data[/][^"]+[.]js)"/g),m=>m[1]).filter(x=>x!=="data/manifest.js");
const lessonIds=sources.filter(x=>x!=="data/2026-10-05-french-opinions-v2.js").map(file=>file.replace(/^data[/]/,"").replace(/[.]js$/,""))
  .concat(["2026-10-05-french-opinions-v2"]);
// The URLs, not inferred filename IDs, are the authority; derive all lesson IDs
// from executing the same lesson data files that the app itself loads.
function serve(){
 return createServer((request,response)=>{
  const p=decodeURIComponent(new URL(request.url,"http://localhost").pathname);
  if(!p.startsWith("/InClass/")){response.writeHead(404);response.end();return;}
  const file=resolve(ROOT,p.slice("/InClass/".length)||"index.html");
  if(file!==ROOT&&!file.startsWith(ROOT+sep)){response.writeHead(403);response.end();return;}
  try{
   const buffer=readFileSync(file);
   const type={".js":"text/javascript",".css":"text/css",".html":"text/html",".svg":"image/svg+xml"}[extname(file)]||"text/plain";
   response.writeHead(200,{"Content-Type":type,"Cache-Control":"no-store"});
   response.end(buffer);
  }catch{response.writeHead(404);response.end("Missing file");}
 });
}
async function launchChrome(){
 const binary=process.env.CHROME_BIN||["chromium","google-chrome","chromium-browser"].map(bin=>{try{return execFileSync("which",[bin],{encoding:"utf8"}).trim();}catch{return "";}}).find(Boolean);
 if(!binary)throw Error("No Chromium browser installed on runner");
 const temp=mkdtempSync(join(tmpdir(),"inclass-print-"));
 const chrome=spawn(binary,["--headless=new","--no-sandbox","--disable-dev-shm-usage","--no-first-run","--no-default-browser-check","--remote-allow-origins=*","--remote-debugging-port=0","--user-data-dir="+temp,"about:blank"],{stdio:["ignore","ignore","pipe"],detached:true});
 const devtools=await new Promise((resolve,reject)=>{
  let output="";
  const timer=setTimeout(()=>reject(Error("No Chrome devtools endpoint "+output.slice(-700))),30000);
  chrome.stderr.on("data",buf=>{
   output+=String(buf);
   const match=output.match(/DevTools listening on (ws:[/][/][^\s]+)/);
   if(match){clearTimeout(timer);resolve(match[1]);}
  });
  chrome.on("error",err=>{clearTimeout(timer);reject(err);});
  chrome.on("exit",code=>{clearTimeout(timer);reject(Error("Chrome exited "+code+" "+output.slice(-700)));});
 });
 const endpoint=new URL(devtools).origin.replace(/^ws/,"http");
 const tab=await (await fetch(endpoint+"/json/new?about:blank",{method:"PUT"})).json();
 const ws=new WebSocket(tab.webSocketDebuggerUrl);
 await new Promise((resolve,reject)=>{ws.onopen=resolve;ws.onerror=reject;});
 let num=0;
 const pending=new Map();
 ws.onmessage=msg=>{
  const data=JSON.parse(String(msg.data)),job=pending.get(data.id);
  if(!job)return;
  pending.delete(data.id);
  data.error?job.reject(Error(data.error.message)):job.resolve(data.result||{});
 };
 const send=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++num;pending.set(id,{resolve,reject});
  ws.send(JSON.stringify({id,method,params}));
 });
 const evalJS=async expression=>{
  const result=await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if(result.exceptionDetails)throw Error("Page JS error: "+(result.exceptionDetails.exception?.description||result.exceptionDetails.text));
  return result.result?.value;
 };
 const close=()=>{
  ws.close();
  try{process.kill(-chrome.pid,"SIGKILL");}catch{chrome.kill("SIGKILL");}
  rmSync(temp,{recursive:true,force:true});
 };
 return {send,evalJS,close};
}

test("Actual headless Chrome renders every lesson as 2 separate printable PDFs", {timeout:180000}, async t=>{
 const http=serve();
 await new Promise(resolve=>http.listen(0,"127.0.0.1",resolve));
 let chrome;
 t.after(async()=>{
  if(chrome)chrome.close();
  http.closeAllConnections();
  await new Promise(resolve=>http.close(resolve));
 });
 chrome=await launchChrome();
 await chrome.send("Page.enable");
 await chrome.send("Runtime.enable");
 const url="http://127.0.0.1:"+http.address().port+"/InClass/worksheets/print.html";
 // Fetch the exact pack list from the live page, not duplicated file names.
 await chrome.send("Page.navigate",{url});
 let ids=[];
 for(let tick=0;tick<100;tick++){
  const value=await chrome.evalJS('window.INCLASS_WEEKS?.map(x=>x.id)||[]');
  if(value.length>=8){ids=value;break;}
  await wait(80);
 }
 assert.ok(ids.length>=8,"All permanent lessons loaded in real browser");
 mkdirSync(OUT,{recursive:true});
 const made=[];
 for(const id of ids){
  for(const mode of ["student","answers"]){
   await chrome.send("Page.navigate",{url:url+"?lesson="+encodeURIComponent(id)+"&mode="+mode});
   let result;
   for(let tick=0;tick<100;tick++){
    result=await chrome.evalJS('(function(){const root=document.getElementById("printRoot"),error=document.getElementById("error");return {ready:!!root?.querySelector(".sheetTitle"),error:error?.hidden===false?error.textContent:"",n:root?.querySelectorAll(".question").length||0,answers:root?.querySelectorAll(".answerBlock").length||0,title:root?.querySelector(".sheetTitle")?.textContent||"",oversize:!!(root&&root.scrollWidth>root.clientWidth+3)};})()');
    if(result?.error)throw Error("Print view error "+id+": "+result.error);
    if(result?.ready&&result.n>=3)break;
    await wait(80);
   }
   assert.ok(result?.ready&&result.n>=3,id+" "+mode+" did not render");
   assert.equal(result.oversize,false,id+" "+mode+" has horizontal overflow");
   if(mode==="student")assert.equal(result.answers,0,id+" child sheet accidentally reveals answers");
   else assert.ok(result.answers>=result.n,id+" parent sheet missing an answer");
   const pdf=await chrome.send("Page.printToPDF",{printBackground:true,preferCSSPageSize:true,paperWidth:8.2677,paperHeight:11.6929,marginTop:0,marginBottom:0,marginLeft:0,marginRight:0});
   const buffer=Buffer.from(pdf.data,"base64");
   assert.equal(buffer.subarray(0,5).toString(),"%PDF-",id+" missing valid PDF header");
   assert.ok(buffer.length>5000,id+" PDF suspiciously small: "+buffer.length);
   const file=join(OUT,id+"-"+mode+".pdf");
   writeFileSync(file,buffer);
   made.push(file);
   console.log("PASS",id,mode,result.n+" prompts",buffer.length+" PDF bytes");
  }
 }
 assert.equal(made.length,ids.length*2);
});
