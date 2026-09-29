const WEEK = {
  id: "2026-09-french-pets",
  title: "Pets, colours & descriptions",
  animals: [
    {fr:"un chien", en:"a dog", gender:"m"},
    {fr:"un chat", en:"a cat", gender:"m"},
    {fr:"un cheval", en:"a horse", gender:"m"},
    {fr:"un poisson", en:"a fish", gender:"m"},
    {fr:"un hamster", en:"a hamster", gender:"m"},
    {fr:"un serpent", en:"a snake", gender:"m"},
    {fr:"un lapin", en:"a rabbit", gender:"m"},
    {fr:"un oiseau", en:"a bird", gender:"m"},
    {fr:"un cochon d'inde", en:"a guinea pig", gender:"m"},
    {fr:"une souris", en:"a mouse", gender:"f"}
  ],
  colours: [
    {m:"bleu",f:"bleue",en:"blue"},{m:"vert",f:"verte",en:"green"},
    {m:"rouge",f:"rouge",en:"red"},{m:"jaune",f:"jaune",en:"yellow"},
    {m:"noir",f:"noire",en:"black"},{m:"blanc",f:"blanche",en:"white"},
    {m:"gris",f:"grise",en:"grey"},{m:"brun",f:"brune",en:"brown"},
    {m:"marron",f:"marron",en:"brown"}
  ],
  qualities: [
    {m:"méchant",f:"méchante",en:"naughty"},{m:"mignon",f:"mignonne",en:"cute"},
    {m:"intelligent",f:"intelligente",en:"intelligent"},{m:"stupide",f:"stupide",en:"stupid"}
  ]
};

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const state = { learner:"Sai", spellOrder:[], currentSpell:null, speakTarget:"" };

function normalise(s){
  return s.normalize("NFC").trim().toLocaleLowerCase("fr")
    .replace(/[’‘]/g,"'").replace(/\s+/g," ");
}
function plain(s){ return normalise(s).normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

function progressKey(){ return `inclass:${WEEK.id}:${state.learner}`; }
function getProgress(){
  try { return JSON.parse(localStorage.getItem(progressKey())) || {heard:0,spellRight:0,spellAttempts:0,built:0,spoken:0,chatted:0}; }
  catch { return {heard:0,spellRight:0,spellAttempts:0,built:0,spoken:0,chatted:0}; }
}
function saveProgress(p){ localStorage.setItem(progressKey(),JSON.stringify(p)); renderProgress(); }
function bump(field,amount=1){ const p=getProgress(); p[field]=(p[field]||0)+amount; saveProgress(p); }
function renderProgress(){
  const p=getProgress();
  const measures=[Math.min(p.heard/8,1),Math.min(p.spellRight/8,1),Math.min(p.built/4,1),Math.min(p.spoken/3,1),Math.min(p.chatted/2,1)];
  const pct=Math.round(measures.reduce((a,b)=>a+b,0)/measures.length*100);
  $("#progressPercent").textContent=pct+"%";
  $("#spellScore").textContent=p.spellRight||0;
  $("#parentStats").innerHTML=[
    ["Heard",p.heard||0],["Spelling",`${p.spellRight||0}/${p.spellAttempts||0}`],
    ["Sentences",p.built||0],["Speaking turns",(p.spoken||0)+(p.chatted||0)]
  ].map(([k,v])=>`<div class="stat"><strong>${v}</strong><span>${k}</span></div>`).join("");
}

let frenchVoice=null;
function chooseVoice(){
  const voices=speechSynthesis.getVoices();
  frenchVoice=voices.find(v=>/^fr-FR/i.test(v.lang))||voices.find(v=>/^fr/i.test(v.lang))||null;
}
if("speechSynthesis" in window){ chooseVoice(); speechSynthesis.onvoiceschanged=chooseVoice; }
function speak(text,mark=true){
  if(!("speechSynthesis" in window)){ alert("Speech playback is not available in this browser."); return; }
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text); u.lang="fr-FR"; u.rate=.82; u.pitch=1;
  if(frenchVoice) u.voice=frenchVoice;
  speechSynthesis.speak(u);
  if(mark) bump("heard");
}

function renderVocab(){
  const groups=[
    ["Pets",WEEK.animals.map(x=>({fr:x.fr,en:x.en}))],
    ["Colours",WEEK.colours.map(x=>({fr:x.m===x.f?x.m:`${x.m} / ${x.f}`,audio:x.m,en:x.en}))],
    ["Descriptions",WEEK.qualities.map(x=>({fr:x.m===x.f?x.m:`${x.m} / ${x.f}`,audio:x.m,en:x.en}))],
    ["Sentence frame",[{fr:"J’ai",audio:"J’ai",en:"I have"},{fr:"et",audio:"et",en:"and"}]]
  ];
  $("#vocabGroups").innerHTML=groups.map(([name,items])=>`
    <div class="vocabGroup"><h4>${name}</h4><div class="wordList">
      ${items.map(x=>`<button class="wordButton" data-audio="${encodeURIComponent(x.audio||x.fr)}"><strong>${x.fr}</strong><small>${x.en}</small></button>`).join("")}
    </div></div>`).join("");
  $$(".wordButton").forEach(b=>b.addEventListener("click",()=>speak(decodeURIComponent(b.dataset.audio))));
}

function allSpellItems(){
  return [
    ...WEEK.animals.map(x=>({fr:x.fr,en:x.en})),
    ...WEEK.colours.flatMap(x=>x.m===x.f?[{fr:x.m,en:x.en}]:[{fr:x.m,en:x.en+" (masculine)"},{fr:x.f,en:x.en+" (feminine)"}]),
    ...WEEK.qualities.flatMap(x=>x.m===x.f?[{fr:x.m,en:x.en}]:[{fr:x.m,en:x.en+" (masculine)"},{fr:x.f,en:x.en+" (feminine)"}]),
    {fr:"J’ai",en:"I have"},{fr:"et",en:"and"}
  ];
}
function shuffle(a){ return [...a].sort(()=>Math.random()-.5); }
function newSpellRound(){
  if(!state.spellOrder.length) state.spellOrder=shuffle(allSpellItems());
  state.currentSpell=state.spellOrder.pop();
  $("#spellMeaning").textContent=state.currentSpell.en;
  $("#spellInput").value=""; $("#spellFeedback").textContent=""; $("#spellFeedback").className="feedback";
  $("#nextSpell").classList.add("hidden"); $("#spellInput").disabled=false; $("#spellInput").focus();
}
function checkSpell(e){
  e.preventDefault(); const input=$("#spellInput").value; if(!input.trim()) return;
  const p=getProgress(); p.spellAttempts=(p.spellAttempts||0)+1;
  if(normalise(input)===normalise(state.currentSpell.fr)){
    p.spellRight=(p.spellRight||0)+1;
    $("#spellFeedback").textContent="Correct ✓"; $("#spellFeedback").className="feedback good";
    $("#spellInput").disabled=true; $("#nextSpell").classList.remove("hidden");
  } else if(plain(input)===plain(state.currentSpell.fr)){
    $("#spellFeedback").textContent=`Nearly — check the accent: ${state.currentSpell.fr}`; $("#spellFeedback").className="feedback try";
  } else {
    $("#spellFeedback").textContent="Try again. Listen once more."; $("#spellFeedback").className="feedback try"; speak(state.currentSpell.fr,false);
  }
  saveProgress(p);
}

function populateBuilder(){
  $("#animalSelect").innerHTML=WEEK.animals.map((x,i)=>`<option value="${i}">${x.fr}</option>`).join("");
  $("#colourSelect").innerHTML=WEEK.colours.map((x,i)=>`<option value="${i}">${x.m} · ${x.en}</option>`).join("");
  $("#qualitySelect").innerHTML=WEEK.qualities.map((x,i)=>`<option value="${i}">${x.m} · ${x.en}</option>`).join("");
  ["#animalSelect","#colourSelect","#qualitySelect"].forEach(s=>$(s).addEventListener("change",()=>updateSentence(true)));
  updateSentence(false);
}
function currentSentence(){
  const a=WEEK.animals[+$("#animalSelect").value], c=WEEK.colours[+$("#colourSelect").value], q=WEEK.qualities[+$("#qualitySelect").value];
  const colour=a.gender==="f"?c.f:c.m, quality=a.gender==="f"?q.f:q.m;
  return {fr:`J’ai ${a.fr} ${colour} et ${quality}.`,en:`I have ${a.en} that is ${c.en} and ${q.en}.`,a,c,q,colour,quality};
}
function updateSentence(count=false){
  const s=currentSentence(); $("#builtSentence").textContent=s.fr; $("#builtEnglish").textContent=s.en;
  const changed=s.a.gender==="f"&&(s.c.m!==s.c.f||s.q.m!==s.q.f);
  $("#agreementNote").textContent=s.a.gender==="f"
    ? (changed?`“une souris” is feminine, so this becomes ${s.colour} and ${s.quality}.`:"“une souris” is feminine; these particular adjective forms stay the same.")
    : "These are masculine pet nouns, so use the masculine colour and description forms.";
  if(count) bump("built");
}
function randomiseBuilder(){
  $("#animalSelect").value=Math.floor(Math.random()*WEEK.animals.length);
  $("#colourSelect").value=Math.floor(Math.random()*WEEK.colours.length);
  $("#qualitySelect").value=Math.floor(Math.random()*WEEK.qualities.length);
  updateSentence(true);
}
function randomSentence(){
  const a=WEEK.animals[Math.floor(Math.random()*WEEK.animals.length)], c=WEEK.colours[Math.floor(Math.random()*WEEK.colours.length)], q=WEEK.qualities[Math.floor(Math.random()*WEEK.qualities.length)];
  return `J’ai ${a.fr} ${a.gender==="f"?c.f:c.m} et ${a.gender==="f"?q.f:q.m}.`;
}
function newSpeakTarget(){
  state.speakTarget=randomSentence(); $("#speakTarget").textContent=state.speakTarget;
  $("#speechTranscript").classList.add("hidden");
  $("#speechStatus").textContent="Listen once, then try to say the whole sentence."; $("#speechStatus").className="feedback";
}
function recognise(expected){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    $("#speechStatus").textContent="Speech recognition is not available in this browser. You can still use Hear it and repeat aloud.";
    $("#speechStatus").className="feedback try"; return;
  }
  const r=new SR(); r.lang="fr-FR"; r.interimResults=false; r.maxAlternatives=3;
  const status=$("#speechStatus"); status.textContent="Listening…"; status.className="feedback";
  r.onresult=e=>{
    const transcript=e.results[0][0].transcript||"";
    $("#speechTranscript").textContent="I heard: "+transcript; $("#speechTranscript").classList.remove("hidden");
    const targetWords=plain(expected).replace(/[.,!?]/g,"").split(" ");
    const heard=plain(transcript).replace(/[.,!?]/g,"");
    const hit=targetWords.filter(w=>heard.includes(w)).length/targetWords.length;
    if(hit>=.78){ status.textContent="Good match ✓ Now say it once more without looking."; status.className="feedback good"; bump("spoken"); }
    else { status.textContent="Some words were missed. Hear the model again and retry."; status.className="feedback try"; }
  };
  r.onerror=()=>{ status.textContent="I couldn’t get a clear speech result. Try again somewhere quieter."; status.className="feedback try"; };
  r.start();
}

function setupChat(){
  $("#playChatPrompt").addEventListener("click",()=>speak($("#chatPrompt").textContent));
  $("#chatExample").addEventListener("click",()=>{ $("#chatResult").textContent=randomSentence(); $("#chatResult").className="feedback good"; });
  $("#chatSpeak").addEventListener("click",()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){ $("#chatResult").textContent="Speech recognition is unavailable here. Build a sentence above and say it aloud after the model."; $("#chatResult").className="feedback try"; return; }
    const r=new SR(); r.lang="fr-FR"; r.interimResults=false; r.maxAlternatives=3; $("#chatResult").textContent="Listening…";
    r.onresult=e=>{
      const t=e.results[0][0].transcript; const heard=plain(t);
      const hasAnimal=WEEK.animals.some(a=>heard.includes(plain(a.fr.replace(/^(un|une) /,""))));
      const hasColour=WEEK.colours.some(c=>heard.includes(plain(c.m))||heard.includes(plain(c.f)));
      const hasQuality=WEEK.qualities.some(q=>heard.includes(plain(q.m))||heard.includes(plain(q.f)));
      $("#chatResult").textContent=`I heard: “${t}” — ${hasAnimal&&hasColour&&hasQuality?"great: pet + colour + description ✓":"try to include a pet, a colour and a description."}`;
      $("#chatResult").className=hasAnimal&&hasColour&&hasQuality?"feedback good":"feedback try";
      if(hasAnimal&&hasColour&&hasQuality) bump("chatted");
    };
    r.onerror=()=>{ $("#chatResult").textContent="I couldn’t hear that clearly. Try again."; $("#chatResult").className="feedback try"; };
    r.start();
  });
}

function init(){
  state.learner=localStorage.getItem("inclass:learner")||"Sai"; $("#learnerSelect").value=state.learner;
  $("#learnerSelect").addEventListener("change",e=>{ state.learner=e.target.value; localStorage.setItem("inclass:learner",state.learner); renderProgress(); });
  $$("[data-scroll]").forEach(b=>b.addEventListener("click",()=>document.getElementById(b.dataset.scroll).scrollIntoView({behavior:"smooth"})));
  renderVocab(); populateBuilder(); newSpellRound(); newSpeakTarget(); setupChat(); renderProgress();
  $("#playAll").addEventListener("click",()=>{
    const list=["J’ai",...WEEK.animals.map(x=>x.fr),...WEEK.colours.map(x=>x.m),...WEEK.qualities.map(x=>x.m)];
    let i=0;
    const next=()=>{ if(i>=list.length) return; const u=new SpeechSynthesisUtterance(list[i++]); u.lang="fr-FR"; u.rate=.75; if(frenchVoice)u.voice=frenchVoice; u.onend=next; speechSynthesis.speak(u); };
    speechSynthesis.cancel(); next(); bump("heard",3);
  });
  $("#spellPlay").addEventListener("click",()=>speak(state.currentSpell.fr));
  $("#spellForm").addEventListener("submit",checkSpell); $("#nextSpell").addEventListener("click",newSpellRound);
  $("#playSentence").addEventListener("click",()=>speak(currentSentence().fr)); $("#shuffleSentence").addEventListener("click",randomiseBuilder);
  $("#hearSpeakTarget").addEventListener("click",()=>speak(state.speakTarget)); $("#newSpeakTarget").addEventListener("click",newSpeakTarget);
  $("#startSpeaking").addEventListener("click",()=>recognise(state.speakTarget));
  $("#resetProgress").addEventListener("click",()=>{ if(confirm(`Reset ${state.learner}’s progress for this week?`)){ localStorage.removeItem(progressKey()); renderProgress(); } });
  if("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(()=>{});
}
document.addEventListener("DOMContentLoaded",init);