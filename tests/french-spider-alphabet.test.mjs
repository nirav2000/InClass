import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=p=>fs.readFileSync(path.join(root,p),"utf8");
const packs=[
  "data/2026-09-french-pets.js",
  "data/2026-10-05-french-opinions.js",
  "data/2026-10-05-french-opinions-v2.js",
  "data/2026-11-02-french-avoir.js",
  "data/2026-11-09-french-spider-alphabet.js"
];
function loadData(){
  const window={INCLASS_WEEKS:[]};
  for(const file of packs)vm.runInNewContext(read(file),{window},{filename:file});
  return window.INCLASS_WEEKS;
}

test("School assignment is preserved without inventing an official answer key",()=>{
  const all=loadData(),p=all.at(-1);
  assert.equal(all.length,5);
  assert.deepEqual(all.slice(0,4).map(x=>x.id),[
    "2026-09-french-pets","2026-10-05-french-opinions",
    "2026-10-05-french-opinions-v2","2026-11-02-french-avoir"
  ]);
  assert.equal(p.id,"2026-11-09-french-spider-alphabet");
  assert.equal(p.teacher,"Monsieur Bloom");
  assert.equal(p.className,"5F-Fr");
  assert.equal(p.dueAt,"2026-11-13T08:30:00Z");
  assert.equal(p.spiderCategories.length,5);
  assert.equal(p.alphabet.length,26);
  for(const [id,text] of Object.entries(p.schoolTask.printedExamples))
    assert.equal(p.spiderCategories.find(x=>x.id===id)?.printed,text);
  assert.match(p.note,/not a teacher-provided answer key/);
  assert.match(p.sourceInstruction,/next two lessons/);
});

test("Mixed 12-question mock uses distinct real prior-topic items",()=>{
  const w=loadData().at(-1);
  assert.equal(Object.values(w.mockDistribution).reduce((s,n)=>s+n,0),12);
  assert.equal(new Set(w.mockQuestions.map(q=>q.id)).size,w.mockQuestions.length);
  for(const [topic,n] of Object.entries(w.mockDistribution)){
    assert.ok(w.mockQuestions.filter(q=>q.topic===topic).length>=n,topic);
  }
  assert.equal(new Set(w.alphabet.map(a=>a[0])).size,26);
  assert.ok(w.mockQuestions.every(q=>q.prompt&&q.answer));
});

test("New pack appears after earlier packs, is routed and precached for offline",()=>{
  const index=read("index.html"),js=read("app.js"),home=read("welcome.js"),sw=read("sw.js");
  const newData="data/2026-11-09-french-spider-alphabet.js";
  assert.ok(index.includes(newData));
  assert.ok(index.includes('src="french-spider-alphabet.js"'));
  assert.ok(index.includes('href="french-spider-alphabet.css"'));
  assert.ok(index.indexOf(newData)>index.indexOf("data/2026-11-02-french-avoir.js"));
  assert.ok(index.indexOf('src="french-spider-alphabet.js"')>index.indexOf('src="french-avoir.js"'));
  assert.ok(js.includes("state.week.spiderAlphabetHomework"));
  assert.ok(home.includes("pack.spiderAlphabetHomework"));
  assert.ok(sw.includes(newData)&&sw.includes("./french-spider-alphabet.js")&&sw.includes("./french-spider-alphabet.css"));
});

test("Interactive lesson saves drafts, paper checks and unaided quiz attempts",()=>{
  const w=loadData().at(-1),elements=new Map(),buttons=new Map(),progress={},attempts=[];
  function getElementById(id){
    if(!elements.has(id)){
      elements.set(id,{id,innerHTML:"",textContent:"",value:"",disabled:false,
        classList:{add(){},remove(){},toggle(){}},
        dataset:{},onclick:null,onchange:null,oninput:null,onsubmit:null});
    }
    return elements.get(id);
  }
  const document={
    getElementById,
    querySelectorAll(selector){
      const match=/^\[data-(sa-[a-z-]+)\]$/.exec(selector);
      if(!match)return [];
      const attr=match[1];
      const html=(attr==="sa-option"?getElementById("saAlphabetArea"):getElementById("lessonRoot")).innerHTML;
      const re=new RegExp('data-'+attr+'="([^"]+)"',"g"),out=[];
      for(let m;(m=re.exec(html));){
        const key=attr+":"+m[1];
        if(!buttons.has(key))buttons.set(key,{dataset:{},disabled:false,classList:{add(){},remove(){}}});
        const button=buttons.get(key);
        button.dataset[attr.replace(/-([a-z])/g,(_,x)=>x.toUpperCase())]=m[1];
        button.disabled=false;out.push(button);
      }
      return out;
    }
  };
  const state={week:w,learner:"Sai"};
  const context={WEEKS:loadData(),window:{renderFrench(){throw Error("should route into new lesson")}},
    state,document,Date,Math,encodeURIComponent,decodeURIComponent,
    getProgress:()=>progress,saveProgress:p=>Object.assign(progress,p),
    recordLearningAttempt:(a,i,c,meta)=>attempts.push({a,i,c,meta}),
    renderProgress(){},setNav(){},speak(){},
    panel:(id,n,title,html)=>'<section id="'+id+'">'+html+"</section>"
  };
  vm.runInNewContext(read("french-spider-alphabet.js"),context,{filename:"french-spider-alphabet.js"});
  context.window.renderFrench();
  assert.match(getElementById("lessonRoot").innerHTML,/Spider diagram completed/);
  assert.match(getElementById("lessonRoot").innerHTML,/not an official school paper/);
  getElementById("saPaperComplete").onchange({target:{checked:true}});
  getElementById("saAlphabetRevised").onchange({target:{checked:true}});
  assert.equal(progress.spiderPaperDone,true);
  assert.equal(progress.alphabetRevised,true);
  const draft=document.querySelectorAll("[data-sa-draft]")[0];
  draft.value="j’aime\nj’adore";
  draft.oninput();
  assert.match(progress.spiderDrafts.opinions,/j’adore/);
  document.querySelectorAll("[data-sa-letter]")[0].onclick();
  assert.equal(progress.alphabetHeard.A,true);

  getElementById("saStartAlphabet").onclick();
  assert.match(getElementById("saAlphabetArea").innerHTML,/LETTER 1 OF 8/);
  for(let i=0;i<8;i++){
    const answers=document.querySelectorAll("[data-sa-option]");
    assert.equal(answers.length,4);
    answers[0].onclick();
    getElementById("saAlphabetNext").onclick();
  }
  assert.equal(progress.alphabetQuizzes,1);
  assert.equal(attempts.filter(a=>a.a==="alphabet-listen").length,8);

  getElementById("saStartMock").onclick();
  for(let i=0;i<12;i++){
    const html=getElementById("saMockArea").innerHTML;
    const q=w.mockQuestions.find(q=>html.includes(q.prompt));
    assert.ok(q,"mock question found");
    getElementById("saMockInput").value=q.answer;
    getElementById("saMockForm").onsubmit({preventDefault(){}});
    getElementById("saMockNext").onclick();
  }
  assert.equal(progress.mockBest,12);
  assert.equal(progress.mockHistory.length,1);
  assert.equal(attempts.filter(a=>a.a==="term-revision-mock").length,12);
});
