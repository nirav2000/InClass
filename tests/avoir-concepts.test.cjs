/* InClass: dependency-free integration test for the 2 Nov avoir lesson.
 * Run: node tests/avoir-concepts.test.cjs
 * No user progress is read or modified. This tests the real lesson renderer in a tiny DOM harness.
 */
"use strict";
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html"), css=read("french-avoir.css");
const packs={INCLASS_WEEKS:[],renderFrench(){throw Error("Old lesson renderer invoked");}};
vm.runInNewContext(read("data/2026-11-02-french-avoir.js"),{window:packs});
const pack=packs.INCLASS_WEEKS[0];
assert.equal(pack.forms.map(f=>f.verb).join(" "),"ai as a avons avez ont","School six spellings unchanged");
assert(pack.videoUrl.includes("3kWwS1_Kark"),"Teacher's video link preserved");
assert(html.includes('data/2026-11-02-french-avoir.js'));
assert(html.indexOf('<script src="french-avoir.js"')>html.indexOf('<script src="pronunciation-extension.js"'));
assert(css.includes(".avoirTenseCards")&&css.includes(".avoirTenseCard.is-current")&&css.includes("background:#001611"));
assert(css.includes(".avoirConceptDefinition")&&css.includes(".avoirConceptFeedback"));

const idMap=new Map();
const convertDataset=s=>s.slice(5).replace(/-([a-z])/g,(_,x)=>x.toUpperCase());
const parseAttrs=src=>{
  const a={};let m;const re=/([a-zA-Z][\w-]*)\s*=\s*"([^"]*)"/g;
  while((m=re.exec(src)))a[m[1]]=m[2];
  return a;
};
class Node{
  constructor(tag,attrs={}){
    this.tagName=tag.toUpperCase();this.attributes={...attrs};this.id=attrs.id||null;
    this.dataset={};this.children=[];this.parent=null;this.textContent="";
    this.value="";this.disabled=false;this.onclick=null;this.className=attrs.class||"";
    this.classList={
      add:name=>{this.className=[...new Set(this.className.split(/\s+/).concat(name))].filter(Boolean).join(" ");},
      remove:name=>{this.className=this.className.split(/\s+/).filter(x=>x&&x!==name).join(" ");},
      toggle:(name,force)=>{
        const has=this.className.split(/\s+/).includes(name);
        if(force===true||(!has&&force!==false)){this.classList.add(name);return true;}
        if(has)this.classList.remove(name);return false;
      },
      contains:name=>this.className.split(/\s+/).includes(name)
    };
    Object.entries(attrs).forEach(([k,v])=>{if(k.startsWith("data-"))this.dataset[convertDataset(k)]=v;});
    if(this.id)idMap.set(this.id,this);
  }
  setAttribute(k,v){this.attributes[k]=String(v);}
  getAttribute(k){return this.attributes[k]||null;}
  focus(){}
  matches(sel){
    if(sel==="button")return this.tagName==="BUTTON";
    if(sel.startsWith("[")&&sel.endsWith("]"))return Object.hasOwn(this.attributes,sel.slice(1,-1));
    return false;
  }
  querySelectorAll(sel){
    const result=[];
    const walk=x=>{x.children.forEach(ch=>{if(ch.matches(sel))result.push(ch);walk(ch);});};
    walk(this);return result;
  }
  querySelector(sel){return this.querySelectorAll(sel)[0]||null;}
  set innerHTML(content){
    const forget=x=>{x.children.forEach(forget);if(x.id&&idMap.get(x.id)===x)idMap.delete(x.id);};
    this.children.forEach(forget);this.children=[];this._html=content;
    const stack=[this];
    const tags=/<(\/?)([a-zA-Z][\w-]*)([^>]*)>/g;
    const voidTags=new Set(["input","img","br","hr","meta","link"]);
    let m;
    while((m=tags.exec(content))){
      const tag=m[2].toLowerCase();
      if(m[1]==="/"){if(stack.length>1)stack.pop();continue;}
      const attrs=parseAttrs(m[3]);
      const node=new Node(tag,attrs);
      const parent=stack[stack.length-1];node.parent=parent;parent.children.push(node);
      if(!voidTags.has(tag)&&!m[3].trim().endsWith("/"))stack.push(node);
    }
  }
  get innerHTML(){return this._html||"";}
}
const lessonRoot=new Node("div",{id:"lessonRoot"});
const document={
  getElementById:id=>idMap.get(id)||null,
  querySelectorAll:sel=>lessonRoot.querySelectorAll(sel)
};
const $=id=>{const n=document.getElementById(id);assert(n,"Missing element "+id);return n;};
const state={week:pack,learner:"Sai"};
const clone=x=>JSON.parse(JSON.stringify(x));
let progress={},attempts=[],sounds=[],steps=[],cleanupCalls=0;
packs.InClassPronunciationCleanup=()=>cleanupCalls++;
const globals={
  window:packs,document,state,
  setNav:x=>steps=x,
  panel:(id,number,title,body)=>'<section id="'+id+'" class="panel"><h3>'+title+'</h3>'+body+'</section>',
  norm:s=>String(s||"").normalize("NFC").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g," "),
  shuffle:arr=>arr.slice().reverse(),
  getProgress:()=>clone(progress),saveProgress:p=>{progress=clone(p)},
  recordLearningAttempt:(activity,item,correct,extra)=>attempts.push({activity,item,correct,extra}),
  speak:(text,lang)=>sounds.push({text,lang}),
  renderProgress:()=>{},
  bump:(key,n=1)=>{const p=clone(progress);p[key]=(p[key]||0)+n;progress=p}
};
vm.runInNewContext(read("french-avoir.js"),globals);
packs.renderFrench();
assert.equal(cleanupCalls,1,"Old pronunciation coach cleaned up");
assert.equal(steps.length,9);
assert.equal(Array.from(steps.slice(0,4),x=>x[0]).join(","),"avSchool,avFoundations,avTenses,avReference");
assert.equal(document.querySelectorAll("[data-av-concept]").length,4);
assert.equal(document.querySelectorAll("[data-av-tense]").length,3);
assert.equal(document.querySelectorAll("[data-av-hear]").length,6);
assert.equal(document.querySelectorAll("[data-av-quiz]").length,6);
assert($("lessonRoot").innerHTML.includes("Infinitive"));
assert($("lessonRoot").innerHTML.includes("Past")&&$("lessonRoot").innerHTML.includes("Present")&&$("lessonRoot").innerHTML.includes("Future"));
assert($("lessonRoot").innerHTML.includes("J’avais")&&$("lessonRoot").innerHTML.includes("J’aurai"));

// Reasoning diagnostics: wrong answer gives a scaffold, retry teaches the principle.
// These attempts do NOT change the school test score.
const questions=document.querySelectorAll("[data-av-concept]");
const pronoun=questions.find(q=>q.dataset.avConcept==="pronoun");
assert(pronoun);
const choices=pronoun.querySelectorAll("[data-av-concept-answer]");
choices.find(c=>c.dataset.avConceptAnswer==="dog").onclick();
assert.equal(progress.avoirConceptMastery,undefined);
assert.equal(progress.avoirConceptMisses.pronoun,1);
assert(pronoun.querySelector("[data-av-concept-feedback]").textContent.includes("Try again"));
choices.find(c=>c.dataset.avConceptAnswer==="he").onclick();
assert.equal(progress.avoirConceptMastery.pronoun,true);
assert.equal(progress.avoirConceptAttempts,2);
assert.equal(progress.avoirConceptCorrect,1);
assert(choices.every(c=>c.disabled),"Correct question locks after success");
assert.equal(attempts.at(-1).extra.scope,"understanding");

// Other concepts require independent choices; check one genuine misconception.
const conjugation=questions.find(q=>q.dataset.avConcept==="conjugation");
conjugation.querySelectorAll("[data-av-concept-answer]").find(c=>c.dataset.avConceptAnswer==="subject").onclick();
const form=questions.find(q=>q.dataset.avConcept==="form");
form.querySelectorAll("[data-av-concept-answer]").find(c=>c.dataset.avConceptAnswer==="have-has").onclick();
const tense=questions.find(q=>q.dataset.avConcept==="tense");
tense.querySelectorAll("[data-av-concept-answer]").find(c=>c.dataset.avConceptAnswer==="future").onclick();
assert.equal(Object.keys(progress.avoirConceptMastery).length,4);
assert.equal($("avConceptProgress").textContent,"4/4 ideas understood");
assert.equal($("avConceptProgressTime").textContent,"4/4 ideas understood");
assert($("avHistory").innerHTML.includes("Understanding:"));
assert($("avHistory").innerHTML.includes("Pronouns"));

// Pressing any tense card plays its own French example and selects it.
const cards=document.querySelectorAll("[data-av-tense]");
const future=cards.find(c=>c.dataset.avTense==="future");
future.onclick();
assert.equal(sounds.at(-1).text,"J’aurai");
assert.equal(sounds.at(-1).lang,"fr-FR");
assert($("avTenseDetail").textContent.includes("later"));
assert(future.classList.contains("is-selected"));
assert(cards.every(c=>c===future||!c.classList.contains("is-selected")));

// Existing school test remains exclusively six spellings; score unchanged by conceptual checks.
assert.equal(progress.testsCompleted||0,0);
const quiz=document.querySelectorAll("[data-av-quiz]");
quiz.forEach((input,i)=>input.value=pack.forms[i].verb);
$("avQuizSubmit").onclick();
assert.equal(progress.bestTest,6);
assert.equal(progress.testsCompleted,1);
assert.equal(attempts.filter(a=>a.activity==="avoir-school-test").length,6);
$("avQuizSubmit").onclick();
assert.equal(progress.testsCompleted,1,"No duplicate submission");
$("avQuizReset").onclick();
quiz.forEach((input,i)=>input.value=pack.forms[i].verb);
quiz[2].value="as";
$("avQuizSubmit").onclick();
assert.equal(progress.avoirTestHistory.at(-1).score,5,"Tu as != Il a");
assert.equal(progress.bestTest,6);

// Old results and understanding state persist when reopening the lesson.
packs.renderFrench();
assert.equal(cleanupCalls,2);
const remembered=document.querySelectorAll("[data-av-concept]").find(q=>q.dataset.avConcept==="pronoun");
assert(remembered.dataset.avConceptCompleted==="true");
assert(remembered.querySelectorAll("[data-av-concept-answer]").every(c=>c.disabled));
assert($("avHistory").innerHTML.includes("Understanding:"));
assert.equal(progress.testsCompleted,2);

// Independently verify the shared data service keeps different domains separate.
const fakeStorage=new Map();
const localStorage={
 getItem:k=>fakeStorage.has(k)?fakeStorage.get(k):null,
 setItem:(k,v)=>fakeStorage.set(k,v),
 removeItem:k=>fakeStorage.delete(k)
};
const dataWindow={InClassAuth:{getSession:()=>({userId:"parent"})},addEventListener:()=>{}};
vm.runInNewContext(read("services/data-service.js"),{window:dataWindow,localStorage,Date,Promise});
dataWindow.InClassData.recordAttempt({learnerId:"Sai",scope:"understanding",item:"form",correct:false});
dataWindow.InClassData.recordAttempt({learnerId:"Sai",scope:"required",item:"avoir",correct:true});
const summary=dataWindow.InClassData.learnerSummary("Sai");
assert.equal(summary.requiredTotal,1);
assert.equal(summary.requiredAccuracy,100);
assert.equal(summary.understandingTotal,1);
assert.equal(summary.understandingAccuracy,0);
assert.equal(summary.understandingIssues[0].item,"form");
console.log("PASS: Avoir concepts, tense cards, helpful retry, mastery persistence, parent analytics, unchanged school test and separate understanding counters.");
