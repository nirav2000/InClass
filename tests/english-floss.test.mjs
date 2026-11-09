import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = name => fs.readFileSync(path.join(root,name),"utf8");
const dataPath="data/2026-11-09-english-floss-y5.js";
const required=["thrill","drizzle","grizzled","muffled","tassel","bristling","snazzy","nuzzling","paddle","muzzle","sniffle","tussle"];
function load(){
  const window={INCLASS_WEEKS:[]};
  vm.runInNewContext(read(dataPath),{window},{filename:dataPath});
  return window.INCLASS_WEEKS[0];
}

test("The Year 5 homework, test format and date are transcribed faithfully",()=>{
  const w=load();
  assert.equal(w.id,"2026-11-09-english-floss-y5");
  assert.deepEqual(Array.from(w.schoolTask.year5Words),required);
  assert.deepEqual(Array.from(w.words,x=>x.word),required);
  assert.equal(w.schoolTask.testFormat.heardSpelling,4);
  assert.equal(w.schoolTask.testFormat.definitionToWord,4);
  assert.equal(w.schoolTask.testFormat.ownSentences,4);
  assert.equal(w.testDate,undefined);
  assert.equal(w.schoolTask.testDate,null);
  assert.equal(w.year6Optional.length,12);
  assert.equal(w.schoolTask.nextRule,"sion and tion");
  assert.match(w.schoolTask.starter,/forbidden/);
});

test("The terminology audit, word meanings and exceptions are explicit",()=>{
  const w=load();
  const terms=Array.from(w.glossary,x=>x.term);
  for(const required of ["Letter","Sound","Vowel","Consonant","Syllable","Short vowel","Long vowel","Double consonant","Root or base word","Suffix","Stress","Exception"])
    assert.ok(terms.includes(required),required);
  assert.equal(w.words.length,12);
  for(const word of w.words){
    for(const field of ["word","definition","example","hint","pattern","parts"])
      assert.ok(word[field],word.word+" lacks "+field);
  }
  assert.match(w.words.find(x=>x.word==="bristling").hint,/No double/);
  assert.match(w.words.find(x=>x.word==="paddle").hint,/not part of strict/i);
  assert.ok(w.conceptChecks.some(x=>x.id==="forbidden"));
  assert.ok(w.conceptChecks.some(x=>x.id==="new-cliff"));
  assert.ok(w.conceptChecks.some(x=>x.id==="plural-bridge"));
  for(const q of w.conceptChecks){
    assert.equal(new Set(q.options).size,q.options.length);
    assert.ok(q.options.includes(q.answer));
    assert.ok(q.why.length>25);
  }
  assert.match(w.transferConnections.backward,/bristling/i);
  assert.match(w.transferConnections.forward,/sion/i);
});

test("Loaded from correct script order and retained offline, with prior weeks untouched",()=>{
  const html=read("index.html"),sw=read("sw.js"),app=read("app.js"),home=read("welcome.js");
  for(const file of [dataPath,"english-floss.js","english-floss.css"]){
    assert.ok(html.includes(file),file+" missing in HTML");
    assert.ok(sw.includes("./"+file),file+" missing in offline list");
  }
  assert.ok(html.indexOf("english-floss.js")>html.indexOf("learning-tools.js"));
  assert.ok(html.indexOf(dataPath)>html.indexOf("data/2026-11-09-french-spider-alphabet.js"));
  assert.ok(app.includes("state.week.flossHomework"));
  assert.ok(home.includes("pack.flossHomework"));
  assert.ok(html.includes("data/2026-09-25-english-plurals-y5.js"));
  assert.ok(html.includes("data/2026-10-05-english-cat-vocabulary.js"));
  assert.ok(html.includes("data/2026-11-09-french-spider-alphabet.js"));
  assert.match(sw,/inclass-shared-v19/);
});

function makeBrowser(){
  const w=load(),elements=new Map(),attempts=[],selectorCache=new Map();
  let p={};
  const get=id=>{
    if(!elements.has(id)){
      const node={
        id,innerHTML:"",textContent:"",value:"",hidden:false,disabled:false,
        dataset:{},onclick:null,onsubmit:null,setAttribute(){},
        querySelector(){return {disabled:false};},classList:{add(){},remove(){},toggle(){}}
      };
      elements.set(id,node);
    }
    return elements.get(id);
  };
  const document={
    getElementById:get,
    querySelectorAll(selector){
      let html="",matches=[],rx=null;
      if(selector==="[data-fl-choice]"){
        html=get("flConceptArea").innerHTML;
        rx=/data-fl-choice="(\d+)"/g;
        for(let m;(m=rx.exec(html));)matches.push({dataset:{flChoice:m[1]},disabled:false,onclick:null});
      } else if(selector==="[data-fl-review]"){
        html=get("flTestArea").innerHTML;
        rx=/data-fl-review="(\d+)" data-fl-mark="(yes|no)"/g;
        for(let m;(m=rx.exec(html));)matches.push({dataset:{flReview:m[1],flMark:m[2]},onclick:null});
      }
      const key=selector+"\n"+html;
      if(selectorCache.has(key))return selectorCache.get(key);
      selectorCache.set(key,matches);
      return matches;
    }
  };
  const state={week:w,learner:"Sai"};
  const mockMath=Object.create(Math);
  mockMath.random=()=>0;
  let fallback=0;
  const context={
    window:{renderEnglish:()=>{fallback++;}},
    document,state,Math:mockMath,Date,Array,Set,Object,
    getProgress:()=>JSON.parse(JSON.stringify(p)),
    saveProgress:x=>{p=JSON.parse(JSON.stringify(x));},
    recordLearningAttempt:(activity,item,correct,extra)=>attempts.push({activity,item,correct,extra}),
    recordReview(){},renderProgress(){},speak(){},setNav(){},
    panel:(id,n,title,body)=>'<section id="'+id+'"><h3>'+title+"</h3>"+body+"</section>"
  };
  vm.runInNewContext(read("english-floss.js"),context,{filename:"english-floss.js"});
  context.window.renderEnglish();
  return {w,get,document,state,context,attempts,progress:()=>p,fallback:()=>fallback};
}

test("Renders complete age-appropriate lesson and separately scores concept understanding",()=>{
  const ui=makeBrowser(),html=ui.get("lessonRoot").innerHTML;
  for(const heading of ["What school has set","What do sounds, vowels and syllables mean","When do we double","12 Year 5","why-and-how","School-format","Optional extra"])
    assert.match(html,new RegExp(heading,"i"));
  ui.get("flStartConcepts").onclick();
  assert.match(ui.get("flConceptArea").innerHTML,/Which word has a short vowel sound/i);
  let choice=ui.document.querySelectorAll("[data-fl-choice]");
  assert.equal(choice.length,3);
  choice[0].onclick();
  assert.equal(ui.progress().flossConceptMastery["short-vowel"],true);
  assert.equal(ui.attempts.at(-1).extra.scope,"understanding");
  assert.equal(ui.progress().flossTestsCompleted,undefined);
  ui.get("flConceptNext").onclick();
  assert.match(ui.get("flConceptArea").innerHTML,/How many syllables/);
});

test("Generated school-format test uses each exact word once; sentences require review",()=>{
  const ui=makeBrowser();
  const expected=ui.context.window.InClassFloss.questionSet(ui.w.words,()=>0);
  assert.deepEqual(Array.from(expected,x=>x.type),["spell","spell","spell","spell","meaning","meaning","meaning","meaning","sentence","sentence","sentence","sentence"]);
  assert.equal(new Set(Array.from(expected,x=>x.word.word)).size,12);
  assert.equal(ui.context.window.InClassFloss.sentenceCheck("The thrill will eat the banana.","thrill").valid,true,
    "A nonsense sentence passes structure; human meaning review is required.");
  ui.get("flStartTest").onclick();
  for(const q of expected){
    ui.get("flTestAnswer").value=q.type==="sentence"
      ?"The "+q.word.word+" made the story exciting."
      :q.word.word;
    ui.get("flTestForm").onsubmit({preventDefault(){}});
    ui.get("flTestNext").onclick();
  }
  const p=ui.progress();
  assert.equal(p.flossTestsCompleted,1);
  assert.equal(p.flossTests.length,1);
  assert.equal(p.flossBestRecall,8);
  assert.equal(p.flossTests[0].answers.filter(x=>x.type==="sentence"&&x.review===null).length,4);
  assert.match(ui.get("flTestArea").innerHTML,/cannot be claimed until sentence meanings/i);
  const sentenceIndices=p.flossTests[0].answers.map((x,i)=>x.type==="sentence"?i:-1).filter(x=>x>=0);
  for(const index of sentenceIndices){
    const buttons=ui.document.querySelectorAll("[data-fl-review]");
    const button=buttons.find(x=>Number(x.dataset.flReview)===index&&x.dataset.flMark==="yes");
    assert.ok(button);
    button.onclick();
  }
  assert.equal(ui.progress().flossTests[0].answers.filter(x=>x.type==="sentence"&&x.review===true).length,4);
  assert.equal(ui.attempts.filter(x=>x.activity==="floss-test-sentence").length,4);
  ui.state.week={subjectKey:"english",flossHomework:false};
  ui.context.window.renderEnglish();
  assert.equal(ui.fallback(),1,"Existing English weeks must still use previous renderer");
});
