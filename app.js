const WEEKS = window.INCLASS_WEEKS || [];
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const state = { learner:"Sai", week:null, queues:{}, current:{}, test:null };

function shuffle(a){ return a.slice().sort(function(){ return Math.random()-.5; }); }
function norm(s){ return (s||"").normalize("NFC").trim().toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g," "); }
function hasWholeWord(text,word){
  var clean = norm(text).replace(/[.,!?;:()"']/g," ");
  return clean.split(/\s+/).indexOf(norm(word)) !== -1;
}
function progressKey(){ return "inclass:"+state.week.id+":"+state.learner; }
function getProgress(){
  if(window.InClassData) return window.InClassData.getJson(progressKey(),{});
  try { return JSON.parse(localStorage.getItem(progressKey())) || {}; }
  catch(e) { return {}; }
}
function saveProgress(p){
  if(window.InClassData) window.InClassData.setJson(progressKey(),p);
  else localStorage.setItem(progressKey(),JSON.stringify(p));
  renderProgress();
}
function bump(k,n){ var p=getProgress(); p[k]=(p[k]||0)+(n||1); saveProgress(p); }
function recordLearningAttempt(activity,item,correct,extra){
  if(!window.InClassData)return;
  window.InClassData.recordAttempt(Object.assign({
    learnerId:state.learner,
    subject:state.week?state.week.subject:null,
    packId:state.week?state.week.id:null,
    activity:activity,
    item:item,
    correct:correct
  },extra||{}));
}

function reviewKey(){ return "inclass:review:"+state.learner+":"+state.week.subjectKey; }
function getReviewStore(){
  if(window.InClassData)return window.InClassData.getJson(reviewKey(),{});
  try { return JSON.parse(localStorage.getItem(reviewKey())) || {}; }
  catch(e){ return {}; }
}
function recordReview(label,ok,sourcePackId){
  var store=getReviewStore();
  var old=store[label]||{stage:0};
  var stage=ok?Math.min((old.stage||0)+1,4):0;
  var intervals=[1,3,7,14,30];
  var days=intervals[stage];
  store[label]={label:label,packId:sourcePackId||state.week.id,stage:stage,due:Date.now()+days*86400000,lastCorrect:!!ok};
  if(window.InClassData)window.InClassData.setJson(reviewKey(),store);
  else localStorage.setItem(reviewKey(),JSON.stringify(store));
}
function dueReviewItems(){
  var store=getReviewStore(),now=Date.now();
  return Object.keys(store).map(function(k){return store[k];}).filter(function(x){
    return x.packId!==state.week.id && x.due<=now;
  });
}
function findEnglishWord(label){
  for(var i=0;i<WEEKS.length;i++){
    var pack=WEEKS[i];
    if(pack.subjectKey!=="english"||!pack.words)continue;
    var word=pack.words.find(function(x){return x.word===label;});
    if(word)return {pack:pack,word:word};
  }
  return null;
}
function renderReviewBanner(){
  var due=state.week.subjectKey==="english"?dueReviewItems():[];
  if(!due.length){ $("#reviewBanner").innerHTML=""; return; }
  $("#reviewBanner").innerHTML='<div class="reviewBanner"><div><strong>Previous-week review due</strong><span>'+due.length+' item'+(due.length===1?"":"s")+' ready for spaced retrieval.</span></div><button class="primary" id="startReview">Review now</button></div>';
  $("#startReview").onclick=function(){ startSpacedReview(due); };
}
function startSpacedReview(items){
  state.queues.spaced=shuffle(items);
  $("#reviewBanner").innerHTML='<section class="panel reviewPanel"><div class="sectionHead"><div><p class="eyebrow">SPACED REVIEW</p><h3>Previous homework</h3></div></div><div id="reviewCard" class="practiceCard"></div></section>';
  nextSpacedReview();
}
function nextSpacedReview(){
  if(!state.queues.spaced||!state.queues.spaced.length){ $("#reviewCard").innerHTML='<p class="feedback good">Review complete ✓</p>'; return; }
  var item=state.queues.spaced.pop(),found=findEnglishWord(item.label);
  if(!found){ nextSpacedReview(); return; }
  state.current.spaced={item:item,found:found};
  var useMeaning=Math.random()>.5;
  $("#reviewCard").innerHTML=useMeaning
    ? '<p class="promptLabel">DEFINITION → WORD</p><p class="questionText">'+found.word.definition+'</p><input id="reviewInput" autocomplete="off" spellcheck="false" placeholder="Type the word"><button class="primary testSubmit" id="reviewCheck">Check</button><p id="reviewFeedback" class="feedback"></p>'
    : '<p class="promptLabel">HEAR → SPELL</p><button class="soundButton" id="reviewAudio">🔊</button><input id="reviewInput" autocomplete="off" spellcheck="false" placeholder="Type the word"><button class="primary testSubmit" id="reviewCheck">Check</button><p id="reviewFeedback" class="feedback"></p>';
  if(!useMeaning)$("#reviewAudio").onclick=function(){speak(found.word.word,"en-GB");};
  $("#reviewCheck").onclick=function(){
    var ok=norm($("#reviewInput").value)===norm(found.word.word);
    recordReview(found.word.word,ok,item.packId);
    $("#reviewFeedback").textContent=ok?"Correct ✓":"Answer: "+found.word.word;
    $("#reviewFeedback").className="feedback "+(ok?"good":"try");
    $("#reviewCheck").textContent="Next";
    $("#reviewCheck").onclick=nextSpacedReview;
  };
}

var voices=[];
function loadVoices(){ if("speechSynthesis" in window) voices=speechSynthesis.getVoices(); }
if("speechSynthesis" in window){ loadVoices(); speechSynthesis.onvoiceschanged=loadVoices; }
function speak(text,lang){
  if(!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();
  var u=new SpeechSynthesisUtterance(text);
  u.lang=lang;
  u.rate=lang.indexOf("fr")===0 ? .82 : .88;
  var base=lang.slice(0,2);
  var v=voices.find(function(x){ return x.lang===lang; }) || voices.find(function(x){ return x.lang.indexOf(base)===0; });
  if(v)u.voice=v;
  speechSynthesis.speak(u);
}

function initSelectors(){
  var subjects=Array.from(new Set(WEEKS.map(function(w){return w.subject;})));
  $("#subjectSelect").innerHTML=subjects.map(function(s){return "<option>"+s+"</option>";}).join("");
  var session=window.InClassAuth?window.InClassAuth.getSession():{role:"parent",children:[{name:"Sai"}]};
  var learners=(session.children&&session.children.length?session.children:[{name:"Sai"}]);
  $("#learnerSelect").innerHTML=learners.map(function(x){return '<option value="'+x.name+'">'+x.name+'</option>';}).join("");
  state.learner=localStorage.getItem("inclass:learner")||learners[0].name||"Sai";
  if(!learners.some(function(x){return x.name===state.learner;}))state.learner=learners[0].name;
  $("#learnerSelect").value=state.learner;

  $("#learnerSelect").addEventListener("change",function(e){
    state.learner=e.target.value;
    localStorage.setItem("inclass:learner",state.learner);
    renderWeek();
  });
  $("#subjectSelect").addEventListener("change",function(){ populateWeeks(); });
  $("#weekSelect").addEventListener("change",function(){
    state.week=WEEKS.find(function(w){return w.id===$("#weekSelect").value;});
    localStorage.setItem("inclass:lastWeek",state.week.id);
    renderWeek();
  });

  var last=localStorage.getItem("inclass:lastWeek");
  var lastWeek=WEEKS.find(function(w){return w.id===last;});
  if(lastWeek) $("#subjectSelect").value=lastWeek.subject;
  else $("#subjectSelect").value=(WEEKS.find(function(w){return w.subject==="English";})||{}).subject || subjects[0];
  populateWeeks(last);
}

function populateWeeks(preferred){
  var subject=$("#subjectSelect").value;
  var matches=WEEKS.filter(function(w){return w.subject===subject;});
  $("#weekSelect").innerHTML=matches.map(function(w){
    return '<option value="'+w.id+'">'+w.date+' · '+w.title+'</option>';
  }).join("");
  if(preferred && matches.some(function(w){return w.id===preferred;})) $("#weekSelect").value=preferred;
  state.week=WEEKS.find(function(w){return w.id===$("#weekSelect").value;})||matches[0];
  renderWeek();
}

function setHero(){
  $("#heroMeta").textContent=state.week.subject.toUpperCase()+" · "+state.week.yearGroup.toUpperCase()+" · "+state.week.date.toUpperCase();
  $("#heroTitle").textContent=state.week.title;
  $("#heroLead").textContent=state.week.lead;
  $("#weekHero").className="weekHero "+state.week.subjectKey;
}

function setNav(items){
  $("#stepNav").innerHTML=items.map(function(x,i){
    return '<button data-scroll="'+x[0]+'">'+(i+1)+' · '+x[1]+'</button>';
  }).join("");
  setTimeout(function(){
    $$("[data-scroll]").forEach(function(b){
      b.onclick=function(){
        var el=document.getElementById(b.dataset.scroll);
        if(el)el.scrollIntoView({behavior:"smooth"});
      };
    });
  },0);
}

function panel(id,step,title,body,action){
  return '<section id="'+id+'" class="panel">'+
    '<div class="sectionHead"><div><p class="eyebrow">STEP '+step+'</p><h3>'+title+'</h3></div>'+(action||"")+'</div>'+
    body+'</section>';
}

function renderProgress(){
  if(!state.week)return;
  var p=getProgress(), pct=0, stats=[];
  if(state.week.subjectKey==="english"){
    var measures=[
      Math.min((p.ruleCorrect||0)/4,1),
      Math.min((p.spellCorrect||0)/8,1),
      Math.min((p.meaningCorrect||0)/6,1),
      Math.min((p.sentencesGood||0)/4,1),
      Math.min((p.testsCompleted||0),1)
    ];
    pct=Math.round(measures.reduce(function(a,b){return a+b;},0)/measures.length*100);
    stats=[
      ["Rule practice",p.ruleCorrect||0],
      ["Spelling",(p.spellCorrect||0)+"/"+(p.spellAttempts||0)],
      ["Meanings",(p.meaningCorrect||0)+"/"+(p.meaningAttempts||0)],
      ["Best test",p.bestTest===undefined?"—":p.bestTest+"/12"]
    ];
  } else {
    var measuresFr=[
      Math.min((p.heard||0)/8,1),
      Math.min((p.spellCorrect||0)/8,1),
      Math.min((p.sentencesBuilt||0)/4,1),
      Math.min((p.spoken||0)/3,1),
      Math.min((p.chatted||0)/2,1)
    ];
    pct=Math.round(measuresFr.reduce(function(a,b){return a+b;},0)/measuresFr.length*100);
    stats=[
      ["Heard",p.heard||0],
      ["Spelling",(p.spellCorrect||0)+"/"+(p.spellAttempts||0)],
      ["Sentences",p.sentencesBuilt||0],
      ["Speaking",(p.spoken||0)+(p.chatted||0)]
    ];
  }
  $("#progressPercent").textContent=pct+"%";
  $("#parentStats").innerHTML=stats.map(function(x){
    return '<div class="stat"><strong>'+x[1]+'</strong><span>'+x[0]+'</span></div>';
  }).join("");
}

function renderSourceNote(){
  if(state.week.subjectKey==="english"){
    $("#sourceNote").innerHTML=
      '<strong>From the supplied homework</strong>'+
      '<p>The lesson keeps the school\'s Year 5 word list, plural rule, irregular-plural warm-up and stated 12-question test structure. The supplied slide leaves the test date blank and says next week\'s rule is <em>Double consonants</em>.</p>'+
      '<p><strong>Added by InClass:</strong> short learner-friendly definitions and example sentences, because the homework says meaning and sentence use will be tested but does not provide definitions for the 12 Year 5 words.</p>';
  } else {
    $("#sourceNote").innerHTML='<strong>From the supplied homework</strong><p>The French pack uses the pets, colours, descriptions and sentence frame from the uploaded vocabulary sheet.</p>';
  }
}

function renderWeek(){
  if(!state.week)return;
  setHero();
  $("#reviewBanner").innerHTML="";
  if(state.week.subjectKey==="english") renderEnglish();
  else renderFrench();
  renderSourceNote();
  renderProgress();
  renderReviewBanner();
  $("#resetProgress").onclick=function(){
    if(confirm("Reset "+state.learner+"'s progress for this pack?")){
      if(window.InClassData)window.InClassData.remove(progressKey());
      else localStorage.removeItem(progressKey());
      renderWeek();
    }
  };
}

function renderEnglish(){
  var w=state.week;
  setNav([["rule","Rule"],["words","Words"],["spell","Spell"],["meaning","Meaning"],["sentences","Sentences"],["test","Test"]]);

  var ruleCards=w.rules.map(function(r,i){
    return '<div class="ruleCard"><span class="ruleNo">'+(i+1)+'</span><div><strong>'+r.title+'</strong><p>'+r.text+'</p></div></div>';
  }).join("");

  var irregular=w.irregulars.map(function(x){
    return '<button class="flipCard" data-answer="'+x.plural+'"><span>'+x.singular+'</span><strong>Tap to reveal</strong></button>';
  }).join("");

  var wordRows=w.words.map(function(x,i){
    return '<button class="wordRow" data-word="'+x.word+'">'+
      '<span class="wordIndex">'+(i+1)+'</span>'+
      '<span><strong>'+x.word+'</strong><small>'+x.singular+' → '+x.word+'</small></span>'+
      '<span class="ruleTag '+(x.rule.indexOf("exception")>=0?"exception":"")+'">'+x.rule+'</span>'+
      '<span class="speaker">🔊</span></button>';
  }).join("");

  $("#lessonRoot").innerHTML=
    panel("rule",1,"Understand the plural rule",
      '<p class="tip">The school lesson starts with the rule, then asks you to notice where it works and where a word behaves differently.</p>'+
      '<div class="ruleGrid">'+ruleCards+'</div>'+
      '<div class="practiceStrip"><div><p class="promptLabel">Quick rule check</p><p id="rulePrompt" class="questionText"></p></div>'+
      '<form id="ruleForm" class="inlineForm"><input id="ruleInput" autocomplete="off" spellcheck="false" placeholder="Type the plural"><button class="primary">Check</button></form>'+
      '<p id="ruleFeedback" class="feedback"></p><button id="nextRule" class="secondary hidden">Next →</button></div>'+
      '<h4 class="subhead">Irregular plurals from the lesson</h4><div class="flipGrid">'+irregular+'</div>'
    )+
    panel("words",2,"This week's 12 Year 5 words",
      '<p class="tip">Tap a word to hear it. Notice which words simply add <strong>-s</strong>, which add <strong>-es</strong>, and the highlighted likely exception.</p>'+
      '<div class="wordRows">'+wordRows+'</div>'
    )+
    panel("spell",3,"Hear → spell",
      '<div class="practiceCard"><p class="promptLabel">One of this week\'s words</p><button class="soundButton" id="enSpellPlay">🔊</button>'+
      '<p class="meaning">Do not look at the word list. Type exactly what you hear.</p>'+
      '<form id="enSpellForm" class="inlineForm centred"><input id="enSpellInput" autocomplete="off" spellcheck="false" placeholder="Type the word"><button class="primary">Check</button></form>'+
      '<p id="enSpellFeedback" class="feedback"></p><button id="nextEnSpell" class="secondary hidden">Next word →</button></div>'
    )+
    panel("meaning",4,"Definition → word",
      '<div class="practiceCard"><p class="promptLabel">Which spelling word matches?</p><p id="meaningPrompt" class="questionText"></p>'+
      '<form id="meaningForm" class="inlineForm centred"><input id="meaningInput" autocomplete="off" spellcheck="false" placeholder="Type the matching word"><button class="primary">Check</button></form>'+
      '<p id="meaningFeedback" class="feedback"></p><button id="nextMeaning" class="secondary hidden">Next definition →</button></div>'
    )+
    panel("sentences",5,"Use the word in your own sentence",
      '<div class="practiceCard"><p class="promptLabel">Target word</p><p id="sentenceWord" class="bigWord"></p><p id="sentenceDefinition" class="meaning"></p>'+
      '<form id="sentenceForm"><textarea id="sentenceInput" rows="3" placeholder="Write a complete sentence using the word…"></textarea><button class="primary" type="submit">Check sentence</button></form>'+
      '<p id="sentenceFeedback" class="feedback"></p><button id="showExample" class="secondary">Show an example</button>'+
      '<p id="sentenceExample" class="example hidden"></p><button id="nextSentence" class="secondary hidden">Next word →</button></div>'
    )+
    panel("test",6,"12-question practice test",
      '<div class="testIntro" id="testIntro"><div class="testBreakdown">'+
      '<div><strong>4</strong><span>hear & spell</span></div><div><strong>4</strong><span>definition → word</span></div><div><strong>4</strong><span>use in a sentence</span></div></div>'+
      '<p>This mirrors the test structure shown in the homework. Questions are drawn from the 12 Year 5 words.</p>'+
      '<button class="primary" id="startTest">Start practice test</button></div><div id="testArea" class="hidden"></div>'
    );

  setupEnglish();
}

function setupEnglish(){
  var w=state.week;
  var singularItems=w.words.map(function(x){return {q:x.singular,a:x.word};});

  function nextRule(){
    if(!state.queues.rule || !state.queues.rule.length)state.queues.rule=shuffle(singularItems);
    state.current.rule=state.queues.rule.pop();
    $("#rulePrompt").textContent='Make "'+state.current.rule.q+'" plural.';
    $("#ruleInput").value=""; $("#ruleFeedback").textContent=""; $("#nextRule").classList.add("hidden"); $("#ruleInput").disabled=false;
  }
  $("#ruleForm").onsubmit=function(e){
    e.preventDefault();
    var ok=norm($("#ruleInput").value)===norm(state.current.rule.a);
    recordLearningAttempt("rule",state.current.rule.q+" → "+state.current.rule.a,ok,{scope:"required"});
    if(ok){
      $("#ruleFeedback").textContent="Correct ✓"; $("#ruleFeedback").className="feedback good";
      $("#nextRule").classList.remove("hidden"); $("#ruleInput").disabled=true; bump("ruleCorrect");
    }else{
      $("#ruleFeedback").textContent="Not yet. Look at the ending of the singular and try again."; $("#ruleFeedback").className="feedback try";
    }
  };
  $("#nextRule").onclick=nextRule;
  nextRule();

  $$(".flipCard").forEach(function(b){
    b.onclick=function(){
      var shown=b.classList.toggle("revealed");
      b.querySelector("strong").textContent=shown?b.dataset.answer:"Tap to reveal";
    };
  });
  $$(".wordRow").forEach(function(b){ b.onclick=function(){ speak(b.dataset.word,"en-GB"); bump("heard"); }; });

  function nextSpell(){
    if(!state.queues.enSpell || !state.queues.enSpell.length)state.queues.enSpell=shuffle(w.words);
    state.current.enSpell=state.queues.enSpell.pop();
    $("#enSpellInput").value=""; $("#enSpellInput").disabled=false; $("#enSpellFeedback").textContent=""; $("#nextEnSpell").classList.add("hidden");
  }
  $("#enSpellPlay").onclick=function(){speak(state.current.enSpell.word,"en-GB");};
  $("#enSpellForm").onsubmit=function(e){
    e.preventDefault();
    var p=getProgress(); p.spellAttempts=(p.spellAttempts||0)+1;
    var ok=norm($("#enSpellInput").value)===norm(state.current.enSpell.word);
    recordLearningAttempt("spelling",state.current.enSpell.word,ok,{scope:"required"});
    if(ok){
      p.spellCorrect=(p.spellCorrect||0)+1; $("#enSpellFeedback").textContent="Correct ✓"; $("#enSpellFeedback").className="feedback good";
      $("#enSpellInput").disabled=true; $("#nextEnSpell").classList.remove("hidden");
    }else{
      $("#enSpellFeedback").textContent="Try again. Listen carefully to the ending."; $("#enSpellFeedback").className="feedback try";
      speak(state.current.enSpell.word,"en-GB");
    }
    recordReview(state.current.enSpell.word,ok,state.week.id);
    saveProgress(p);
  };
  $("#nextEnSpell").onclick=nextSpell;
  nextSpell();

  function nextMeaning(){
    if(!state.queues.meaning || !state.queues.meaning.length)state.queues.meaning=shuffle(w.words);
    state.current.meaning=state.queues.meaning.pop();
    $("#meaningPrompt").textContent=state.current.meaning.definition;
    $("#meaningInput").value=""; $("#meaningInput").disabled=false; $("#meaningFeedback").textContent=""; $("#nextMeaning").classList.add("hidden");
  }
  $("#meaningForm").onsubmit=function(e){
    e.preventDefault();
    var p=getProgress(); p.meaningAttempts=(p.meaningAttempts||0)+1;
    var ok=norm($("#meaningInput").value)===norm(state.current.meaning.word);
    recordLearningAttempt("meaning",state.current.meaning.word,ok,{scope:"required"});
    if(ok){
      p.meaningCorrect=(p.meaningCorrect||0)+1; $("#meaningFeedback").textContent="Correct ✓"; $("#meaningFeedback").className="feedback good";
      $("#meaningInput").disabled=true; $("#nextMeaning").classList.remove("hidden");
    }else{
      $("#meaningFeedback").textContent="Not that one. Think through the 12-word list and try again."; $("#meaningFeedback").className="feedback try";
    }
    recordReview(state.current.meaning.word,ok,state.week.id);
    saveProgress(p);
  };
  $("#nextMeaning").onclick=nextMeaning;
  nextMeaning();

  function nextSentence(){
    if(!state.queues.sentence || !state.queues.sentence.length)state.queues.sentence=shuffle(w.words);
    state.current.sentence=state.queues.sentence.pop();
    $("#sentenceWord").textContent=state.current.sentence.word;
    $("#sentenceDefinition").textContent=state.current.sentence.definition;
    $("#sentenceInput").value=""; $("#sentenceFeedback").textContent=""; $("#sentenceExample").classList.add("hidden"); $("#nextSentence").classList.add("hidden");
  }
  $("#sentenceForm").onsubmit=function(e){
    e.preventDefault();
    var text=$("#sentenceInput").value.trim(), target=state.current.sentence.word;
    var uses=hasWholeWord(text,target);
    var enough=text.split(/\s+/).filter(Boolean).length>=5;
    var sentenceOk=uses&&enough;
    recordLearningAttempt("sentence",target,sentenceOk,{scope:"required"});
    if(sentenceOk){
      $("#sentenceFeedback").textContent="Good: you used the target word in a complete-looking sentence. Read it once for sense and punctuation.";
      $("#sentenceFeedback").className="feedback good"; $("#nextSentence").classList.remove("hidden"); bump("sentencesGood");
    }else if(!uses){
      $("#sentenceFeedback").textContent='Use the exact target word "'+target+'" in your sentence.'; $("#sentenceFeedback").className="feedback try";
    }else{
      $("#sentenceFeedback").textContent="Make it a fuller sentence so the meaning of the word is clear."; $("#sentenceFeedback").className="feedback try";
    }
  };
  $("#showExample").onclick=function(){ $("#sentenceExample").textContent=state.current.sentence.example; $("#sentenceExample").classList.remove("hidden"); };
  $("#nextSentence").onclick=nextSentence;
  nextSentence();

  $("#startTest").onclick=startEnglishTest;
}

function startEnglishTest(){
  var w=state.week, used={}, questions=[];
  function take(n){
    var pool=shuffle(w.words.filter(function(x){return !used[x.word];}));
    var out=pool.slice(0,n);
    out.forEach(function(x){used[x.word]=true;});
    return out;
  }
  take(4).forEach(function(x){questions.push({type:"spell",word:x});});
  take(4).forEach(function(x){questions.push({type:"meaning",word:x});});
  take(4).forEach(function(x){questions.push({type:"sentence",word:x});});
  state.test={questions:questions,index:0,score:0,answers:[]};
  $("#testIntro").classList.add("hidden"); $("#testArea").classList.remove("hidden");
  renderTestQuestion();
}

function renderTestQuestion(){
  var t=state.test, q=t.questions[t.index], total=t.questions.length, prompt="";
  if(q.type==="spell") prompt='<p class="promptLabel">HEAR & SPELL</p><button class="soundButton" id="testAudio">🔊</button><p class="meaning">Type the word you hear.</p>';
  if(q.type==="meaning") prompt='<p class="promptLabel">DEFINITION → WORD</p><p class="questionText">'+q.word.definition+'</p>';
  if(q.type==="sentence") prompt='<p class="promptLabel">USE IN A SENTENCE</p><p class="bigWord">'+q.word.word+'</p><p class="meaning">Write a sentence that shows you understand the word.</p>';
  var answerField=q.type==="sentence"?'<textarea id="testAnswer" rows="3" placeholder="Write your sentence…"></textarea>':'<input id="testAnswer" autocomplete="off" spellcheck="false" placeholder="Type your answer…">';
  $("#testArea").innerHTML=
    '<div class="testTop"><span>Question '+(t.index+1)+' of '+total+'</span><strong>'+t.score+' correct so far</strong></div>'+
    '<div class="practiceCard">'+prompt+answerField+'<button class="primary testSubmit" id="testSubmit">Submit</button><p id="testFeedback" class="feedback"></p></div>';
  if(q.type==="spell")$("#testAudio").onclick=function(){speak(q.word.word,"en-GB");};
  $("#testSubmit").onclick=function(){markTestQuestion(q);};
}

function markTestQuestion(q){
  var answer=$("#testAnswer").value.trim();
  if(!answer)return;
  var ok=false,note="";
  if(q.type==="spell"||q.type==="meaning"){
    ok=norm(answer)===norm(q.word.word);
    note=ok?"Correct ✓":"Answer: "+q.word.word;
  }else{
    var uses=hasWholeWord(answer,q.word.word);
    var enough=answer.split(/\s+/).filter(Boolean).length>=5;
    ok=uses&&enough;
    note=ok?"Accepted ✓ Check for sense, capital letter and full stop.":'Use "'+q.word.word+'" in a fuller sentence that shows its meaning.';
  }
  if(ok)state.test.score++;
  recordLearningAttempt("practice-test-"+q.type,q.word.word,ok,{scope:"required"});
  state.test.answers.push({type:q.type,word:q.word.word,answer:answer,ok:ok});
  $("#testFeedback").textContent=note; $("#testFeedback").className="feedback "+(ok?"good":"try");
  $("#testSubmit").textContent=state.test.index===state.test.questions.length-1?"Finish test":"Next question";
  $("#testSubmit").onclick=function(){
    state.test.index++;
    if(state.test.index>=state.test.questions.length)finishEnglishTest();
    else renderTestQuestion();
  };
}

function finishEnglishTest(){
  var t=state.test,p=getProgress();
  p.testsCompleted=(p.testsCompleted||0)+1;
  p.bestTest=Math.max(p.bestTest||0,t.score);
  saveProgress(p);
  var missed=t.answers.filter(function(x){return !x.ok;}).map(function(x){return x.word;});
  var review=missed.length?'Review: '+Array.from(new Set(missed)).join(", ")+'.':"";
  $("#testArea").innerHTML=
    '<div class="testResult"><p class="eyebrow">PRACTICE TEST COMPLETE</p><strong>'+t.score+'/12</strong><p>'+
    (t.score===12?"All 12 responses met the app check.":review)+'</p>'+
    '<p class="tip">Sentence answers receive a structural check only; a parent or teacher should still judge whether the sentence genuinely demonstrates the meaning.</p>'+
    '<button class="primary" id="againTest">Take another test</button></div>';
  $("#againTest").onclick=function(){ $("#testIntro").classList.remove("hidden"); $("#testArea").classList.add("hidden"); };
}

function renderFrench(){
  var w=state.week;
  setNav([["frLearn","Learn"],["frSpell","Spell"],["frBuild","Build"],["frSpeak","Speak"],["frChat","Chat"]]);
  var groups=[
    ["Pets",w.animals.map(function(x){return {term:x.fr,meaning:x.en,audio:x.fr};})],
    ["Colours",w.colours.map(function(x){return {term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m};})],
    ["Descriptions",w.qualities.map(function(x){return {term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m};})],
    ["Sentence frame",[{term:"J’ai",meaning:"I have",audio:"J’ai"},{term:"et",meaning:"and",audio:"et"}]]
  ];
  var vocab=groups.map(function(g){
    return '<div class="vocabGroup"><h4>'+g[0]+'</h4><div class="wordList">'+g[1].map(function(x){
      return '<button class="wordButton" data-audio="'+encodeURIComponent(x.audio)+'"><strong>'+x.term+'</strong><small>'+x.meaning+'</small></button>';
    }).join("")+'</div></div>';
  }).join("");

  $("#lessonRoot").innerHTML=
    panel("frLearn",1,"Learn the words",'<p class="tip">Tap any French item to hear it.</p><div class="vocabGroups">'+vocab+'</div>')+
    panel("frSpell",2,"Hear → spell",'<div class="practiceCard"><button class="soundButton" id="frSpellPlay">🔊</button><p id="frSpellMeaning" class="meaning"></p><form id="frSpellForm" class="inlineForm centred"><input id="frSpellInput" autocomplete="off" spellcheck="false" placeholder="Type the French"><button class="primary">Check</button></form><p id="frSpellFeedback" class="feedback"></p><button id="nextFrSpell" class="secondary hidden">Next →</button></div>')+
    panel("frBuild",3,"Build a sentence",'<div class="builder"><label>Pet<select id="animalSelect"></select></label><label>Colour<select id="colourSelect"></select></label><label>Description<select id="qualitySelect"></select></label></div><div class="sentenceCard"><p id="builtFrench" class="bigWord"></p><p id="builtEnglish" class="meaning"></p><div class="row"><button class="primary" id="hearFrenchSentence">🔊 Hear sentence</button><button class="secondary" id="shuffleFrench">Shuffle</button></div></div><div class="miniRule"><strong>Agreement</strong><span id="frAgreement"></span></div>')+
    panel("frSpeak",4,"Listen → speak",'<div class="practiceCard"><p id="frSpeakTarget" class="bigWord"></p><div class="row"><button class="primary" id="hearFrTarget">🔊 Hear it</button><button class="secondary" id="newFrTarget">New sentence</button></div><p class="tip">Repeat the sentence aloud. Browser speech recognition varies by device, so this version records speaking practice without pretending to give a precise accent score.</p><button class="primary" id="markSpoken">I said it aloud ✓</button></div>')+
    panel("frChat",5,"Mini conversation",'<div class="conversation"><div class="bubble tutor"><span>InClass</span><p id="chatQuestion">Quel animal as-tu ?</p><button class="tiny" id="hearChat">🔊 Hear</button></div><div class="bubble learner"><span>Your turn</span><p>Use the vocabulary you have learnt: <strong>J’ai + pet + colour + et + description</strong>.</p><div class="chatInputRow"><input id="chatInput" autocomplete="off" spellcheck="false" placeholder="Type your French answer, or use the microphone"><button class="secondary" id="chatMic">🎙 Speak</button><button class="primary" id="chatCheck">Check</button></div><p id="chatFeedback" class="feedback"></p><button class="secondary hidden" id="chatNext">Another turn →</button></div></div>');
  setupFrench();
}

function setupFrench(){
  var w=state.week;
  $$(".wordButton").forEach(function(b){b.onclick=function(){speak(decodeURIComponent(b.dataset.audio),"fr-FR");bump("heard");};});
  var spellItems=[];
  w.animals.forEach(function(x){spellItems.push({text:x.fr,meaning:x.en});});
  w.colours.forEach(function(x){
    if(x.m===x.f) spellItems.push({text:x.m,meaning:x.en});
    else {spellItems.push({text:x.m,meaning:x.en+" (masculine)"});spellItems.push({text:x.f,meaning:x.en+" (feminine)"});}
  });
  w.qualities.forEach(function(x){
    if(x.m===x.f) spellItems.push({text:x.m,meaning:x.en});
    else {spellItems.push({text:x.m,meaning:x.en+" (masculine)"});spellItems.push({text:x.f,meaning:x.en+" (feminine)"});}
  });
  spellItems.push({text:"J’ai",meaning:"I have"},{text:"et",meaning:"and"});

  function nextFrSpell(){
    if(!state.queues.frSpell || !state.queues.frSpell.length)state.queues.frSpell=shuffle(spellItems);
    state.current.frSpell=state.queues.frSpell.pop();
    $("#frSpellMeaning").textContent=state.current.frSpell.meaning;
    $("#frSpellInput").value="";$("#frSpellInput").disabled=false;$("#frSpellFeedback").textContent="";$("#nextFrSpell").classList.add("hidden");
  }
  $("#frSpellPlay").onclick=function(){speak(state.current.frSpell.text,"fr-FR");};
  $("#frSpellForm").onsubmit=function(e){
    e.preventDefault();
    var p=getProgress();p.spellAttempts=(p.spellAttempts||0)+1;
    var ok=norm($("#frSpellInput").value)===norm(state.current.frSpell.text);
    if(ok){
      p.spellCorrect=(p.spellCorrect||0)+1;$("#frSpellFeedback").textContent="Correct ✓";$("#frSpellFeedback").className="feedback good";
      $("#frSpellInput").disabled=true;$("#nextFrSpell").classList.remove("hidden");
    }else{
      $("#frSpellFeedback").textContent="Try again and listen once more.";$("#frSpellFeedback").className="feedback try";speak(state.current.frSpell.text,"fr-FR");
    }
    saveProgress(p);
  };
  $("#nextFrSpell").onclick=nextFrSpell;nextFrSpell();

  $("#animalSelect").innerHTML=w.animals.map(function(x,i){return '<option value="'+i+'">'+x.fr+'</option>';}).join("");
  $("#colourSelect").innerHTML=w.colours.map(function(x,i){return '<option value="'+i+'">'+x.m+' · '+x.en+'</option>';}).join("");
  $("#qualitySelect").innerHTML=w.qualities.map(function(x,i){return '<option value="'+i+'">'+x.m+' · '+x.en+'</option>';}).join("");

  function currentSentence(){
    var a=w.animals[+$("#animalSelect").value],c=w.colours[+$("#colourSelect").value],q=w.qualities[+$("#qualitySelect").value];
    var colour=a.gender==="f"?c.f:c.m,quality=a.gender==="f"?q.f:q.m;
    return {fr:"J’ai "+a.fr+" "+colour+" et "+quality+".",en:"I have "+a.en+" that is "+c.en+" and "+q.en+".",a:a,colour:colour,quality:quality};
  }
  function showSentence(count){
    var s=currentSentence();$("#builtFrench").textContent=s.fr;$("#builtEnglish").textContent=s.en;
    $("#frAgreement").textContent=s.a.gender==="f"?'“une souris” is feminine, so use forms such as '+s.colour+" and "+s.quality+" where they change.":"Use the masculine adjective forms with these pet nouns.";
    if(count)bump("sentencesBuilt");
  }
  ["#animalSelect","#colourSelect","#qualitySelect"].forEach(function(x){$(x).onchange=function(){showSentence(true);};});
  $("#hearFrenchSentence").onclick=function(){speak(currentSentence().fr,"fr-FR");bump("heard");};
  $("#shuffleFrench").onclick=function(){
    $("#animalSelect").value=Math.floor(Math.random()*w.animals.length);
    $("#colourSelect").value=Math.floor(Math.random()*w.colours.length);
    $("#qualitySelect").value=Math.floor(Math.random()*w.qualities.length);
    showSentence(true);
  };
  showSentence(false);

  function randomFrenchSentence(){
    var a=w.animals[Math.floor(Math.random()*w.animals.length)],c=w.colours[Math.floor(Math.random()*w.colours.length)],q=w.qualities[Math.floor(Math.random()*w.qualities.length)];
    return "J’ai "+a.fr+" "+(a.gender==="f"?c.f:c.m)+" et "+(a.gender==="f"?q.f:q.m)+".";
  }
  function newTarget(){state.current.frTarget=randomFrenchSentence();$("#frSpeakTarget").textContent=state.current.frTarget;}
  $("#hearFrTarget").onclick=function(){speak(state.current.frTarget,"fr-FR");bump("heard");};
  $("#newFrTarget").onclick=newTarget;
  $("#markSpoken").onclick=function(){bump("spoken");};
  function checkChatAnswer(){
    var text=norm($("#chatInput").value);
    var hasPet=w.animals.some(function(a){return text.indexOf(norm(a.fr.replace(/^(un|une) /,"")))>=0;});
    var hasColour=w.colours.some(function(x){return text.indexOf(norm(x.m))>=0||text.indexOf(norm(x.f))>=0;});
    var hasQuality=w.qualities.some(function(x){return text.indexOf(norm(x.m))>=0||text.indexOf(norm(x.f))>=0;});
    var hasFrame=text.indexOf("j'ai")>=0||text.indexOf("jai")>=0;
    var ok=hasPet&&hasColour&&hasQuality&&hasFrame;
    $("#chatFeedback").textContent=ok?"Très bien ✓ You used the taught sentence frame and all three vocabulary parts.":"Try again: include J’ai, a pet, a colour and a description from this week's list.";
    $("#chatFeedback").className="feedback "+(ok?"good":"try");
    if(ok){bump("chatted");$("#chatNext").classList.remove("hidden");}
  }
  $("#hearChat").onclick=function(){speak("Quel animal as-tu ?","fr-FR");bump("heard");};
  $("#chatCheck").onclick=checkChatAnswer;
  $("#chatMic").onclick=function(){
    var SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){$("#chatFeedback").textContent="Speech recognition is not available in this browser. Type the answer instead.";$("#chatFeedback").className="feedback try";return;}
    var r=new SR();r.lang="fr-FR";r.interimResults=false;r.maxAlternatives=3;
    $("#chatFeedback").textContent="Listening…";
    r.onresult=function(e){$("#chatInput").value=e.results[0][0].transcript;checkChatAnswer();};
    r.onerror=function(){$("#chatFeedback").textContent="I couldn't hear that clearly. Try again or type the answer.";$("#chatFeedback").className="feedback try";};
    r.start();
  };
  $("#chatNext").onclick=function(){$("#chatInput").value="";$("#chatFeedback").textContent="";$("#chatNext").classList.add("hidden");speak("Quel animal as-tu ?","fr-FR");};
  newTarget();
}

document.addEventListener("DOMContentLoaded",initSelectors);