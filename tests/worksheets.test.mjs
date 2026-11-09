import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const sourceFiles=[
 "data/2026-09-25-english-plurals-y5.js",
 "data/2026-10-05-english-cat-vocabulary.js",
 "data/2026-09-french-pets.js",
 "data/2026-10-05-french-opinions.js",
 "data/2026-10-05-french-opinions-v2.js",
 "data/2026-11-02-french-avoir.js",
 "data/2026-11-09-french-spider-alphabet.js",
 "data/2026-11-09-english-floss-y5.js"
];
function load(){
 const window={INCLASS_WEEKS:[]};
 const context=vm.createContext({window});
 for(const file of sourceFiles)vm.runInContext(read(file),context,{filename:file});
 vm.runInContext(read("worksheets/worksheet-builder.js"),context,{filename:"worksheets/worksheet-builder.js"});
 return {packs:window.INCLASS_WEEKS,api:window.InClassWorksheets};
}
const {packs,api}=load();

test("Eight existing lesson versions each have an individually curated worksheet and answer key",()=>{
 assert.equal(packs.length,8);
 assert.equal(new Set(packs.map(w=>w.id)).size,8);
 for(const lesson of packs){
   const worksheet=api.build(lesson);
   assert.ok(worksheet,lesson.id+" needs a curated paper worksheet");
   assert.deepEqual(Array.from(api.audit(worksheet)),[],lesson.id);
   assert.equal(worksheet.subject,lesson.subject);
   assert.ok(worksheet.school.length>60,lesson.id+" loses the school task");
   assert.ok(worksheet.concepts.length>=3);
   const school=worksheet.sections.filter(s=>s.tier==="required").flatMap(s=>s.questions);
   const understanding=worksheet.sections.filter(s=>s.tier==="understanding").flatMap(s=>s.questions);
   const extension=worksheet.sections.filter(s=>s.tier==="extension").flatMap(s=>s.questions);
   assert.ok(school.length>=2&&understanding.length>=1&&extension.length>=1,lesson.id);
   assert.ok(worksheet.sections.flatMap(s=>s.questions).every(q=>q.prompt&&q.answer&&q.lines>=1),lesson.id+" incomplete answer key");
 }
});

test("English school assessment formats and exact lists are kept",()=>{
 for(const id of ["2026-09-25-english-plurals-y5","2026-11-09-english-floss-y5"]){
  const w=packs.find(x=>x.id===id),p=api.build(w),school=p.sections.find(s=>s.tier==="required").questions;
  assert.equal(school.length,12,id+" requires a 12-question test");
  assert.equal(school.filter(q=>q.adultCue).length,4,id+" requires 4 adult dictation prompts");
  assert.equal(school.filter(q=>q.category==="writing").length,4,id+" requires 4 original sentences");
  const words=w.schoolTask?.year5Words||w.words.map(x=>x.word);
  assert.equal(words.length,12);
  for(const word of words)assert.ok(school.some(q=>q.answer.includes(word)||q.prompt.includes(word)),id+": "+word);
 }
 const floss=api.build(packs.find(x=>x.flossHomework));
 assert.match(floss.note,/Year 6.*optional/);
 assert.match(floss.note,/Forbidden.*not strict|forbidden.*not strict/i);
 const cat=api.build(packs.find(x=>x.vocabularyChoiceHomework));
 assert.equal(cat.sections[0].questions.length,20);
 assert.match(cat.note,/third page/);
});

test("French paper sheets do not invent official school questions",()=>{
 const p=packs.find(x=>x.spiderAlphabetHomework),sheet=api.build(p);
 assert.match(sheet.school,/ORIGINAL spider diagram/i);
 assert.match(sheet.school,/ORIGINAL alphabet sheet/i);
 assert.match(sheet.note,/extra revision/);
 assert.match(sheet.sections[1].note,/NOT a claim about the official/);
 const avoir=api.build(packs.find(x=>x.avoirHomework));
 assert.equal(avoir.sections[0].questions.length,6);
 assert.match(avoir.school,/Friday 6 Nov/);
 const opinion=api.build(packs.find(x=>x.id==="2026-10-05-french-opinions"));
 const v2=api.build(packs.find(x=>x.opinionsV2));
 assert.match(opinion.note,/conflicts/i);
 assert.match(v2.focus,/say/i);
 assert.equal(v2.sections[0].questions.length,4);
});

test("Printing includes all lessons, parent mode, A4, screen-free writing space and PWA offline files",()=>{
 const html=read("worksheets/print.html");
 for(const file of sourceFiles)assert.ok(html.includes('../'+file),file+" absent from print page");
 assert.match(html,/Parent answer &amp; marking guide/);
 const css=read("worksheets/worksheet-print.css");
 assert.match(css,/@page\s*\{\s*size:A4/i);
 assert.match(css,/@media print/);
 assert.match(css,/writing/);
 const app=read("index.html"),sw=read("sw.js"),home=read("welcome.js");
 for(const file of ["worksheets/print.html","worksheets/worksheet-builder.js","worksheets/worksheet-print.js","worksheets/worksheet-print.css","worksheets/worksheet-links.js","worksheets/worksheet-links.css"]){
  assert.ok(sw.includes('./'+file),file+" must be available offline");
 }
 assert.match(app,/worksheets\/worksheet-links.js/);
 assert.match(home,/Printable worksheet/);
 assert.match(home,/Paper completed/);
 assert.match(read("worksheets/worksheet-links.js"),/inclass:paper:/);
 assert.match(read("worksheets/worksheet-links.js"),/understanding/);
 assert.match(read("worksheets/worksheet-links.js"),/transfer/);
});

function renderPage(id,mode){
 const dom=new Map(),printed={count:0};
 const element=key=>{
   if(!dom.has(key))dom.set(key,{value:"",innerHTML:"",textContent:"",hidden:false,events:{},addEventListener(type,callback){this.events[type]=callback;}});
   return dom.get(key);
 };
 const window={INCLASS_WEEKS:packs,InClassWorksheets:api,print(){printed.count++;}};
 const document={getElementById:element};
 const location={search:"?lesson="+encodeURIComponent(id)+"&mode="+mode,href:""};
 vm.runInNewContext(read("worksheets/worksheet-print.js"),{window,document,location,URLSearchParams,encodeURIComponent},{filename:"worksheets/worksheet-print.js"});
 return {element,location,printed};
}
test("Child print preview and separate parent guide actually render and print controls work",()=>{
 const id="2026-11-09-english-floss-y5";
 const child=renderPage(id,"student");
 assert.equal(child.element("error").hidden,true);
 assert.match(child.element("printRoot").innerHTML,/Pencil-and-paper learning alternative/);
 assert.match(child.element("printRoot").innerHTML,/Dictation 1/);
 assert.match(child.element("printRoot").innerHTML,/My final check/);
 assert.doesNotMatch(child.element("printRoot").innerHTML,/Answer \/ what to look for/);
 child.element("printButton").events.click();
 assert.equal(child.printed.count,1);
 child.element("modePicker").value="answers";
 child.element("modePicker").events.change();
 assert.match(child.location.href,/mode=answers/);
 const adult=renderPage(id,"answers");
 assert.match(adult.element("printRoot").innerHTML,/Parent answer and marking guide/);
 assert.match(adult.element("printRoot").innerHTML,/Answer \/ what to look for/);
 assert.match(adult.element("printRoot").innerHTML,/Record learning separately/);
 assert.doesNotMatch(adult.element("printRoot").innerHTML,/My final check/);
});

test("Saving paper review does not falsely auto-award interactive test marks",()=>{
 const storage=new Map(),listeners={};
 const view={innerHTML:"",elements:{},callbacks:{},
   querySelector(x){
     if(x==="#savePaperReview")return {addEventListener(type,callback){view.callbacks[type]=callback;}};
     if(x==="#paperCompleted")return {checked:true};
     if(x==="#paperNotes")return {value:"Needed a clue about short vowels"};
     if(x==="#paperFeedback")return (view.elements.feedback??={textContent:""});
     if(x==="summary small")return (view.elements.summary??={textContent:""});
   },
   querySelectorAll(){
     return [["schoolCorrect","3"],["schoolTotal","4"],["understandingCorrect","1"],["understandingTotal","2"],["transferCorrect",""],["transferTotal",""]].map(([f,v])=>({dataset:{paperField:f},value:v}));
   }
 };
 const target={parentNode:{insertBefore(node){assert.equal(node,view);}}};
 const document={addEventListener(type,fn){listeners[type]=fn;},
  getElementById(id){return id==="stepNav"?target:id==="inclassPaperPanel"?null:null;},
  createElement(){return view;},
  dispatchEvent(){}
 };
 const window={InClassAuth:{getSession(){return {role:"parent"};}},InClassData:{getJson(k,d){return storage.get(k)??d;},setJson(k,v){storage.set(k,v);}}};
 vm.runInNewContext(read("worksheets/worksheet-links.js"),{document,window,localStorage:{},Date,CustomEvent:class{},encodeURIComponent},{filename:"worksheets/worksheet-links.js"});
 listeners["inclass:lessonchange"]({detail:{packId:"2026-11-09-english-floss-y5",learner:"Sai"}});
 assert.match(view.innerHTML,/Printable worksheet/);
 assert.match(view.innerHTML,/Parent answer guide/);
 view.callbacks.click();
 const value=storage.get("inclass:paper:2026-11-09-english-floss-y5:Sai");
 assert.equal(value.completed,true);
 assert.equal(value.school.correct,3);
 assert.equal(value.school.total,4);
 assert.equal(value.understanding.correct,1);
 assert.equal(value.transfer,null);
 assert.equal(value.reviewMethod,"adult-entered-paper");
 assert.equal(storage.has("inclass:2026-11-09-english-floss-y5:Sai"),false);
});
