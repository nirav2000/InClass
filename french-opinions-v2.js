(() => {
'use strict';
const previousFrenchV2 = window.renderFrench;

function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));}
function byId(list,id){return list.find(x=>x.id===id);}
function sentence(o,a){return o.fr+" "+a.fr+".";}
function random(arr){return arr[Math.floor(Math.random()*arr.length)];}

function renderOpinionsV2(){
  const w=state.week;
  setNav([
    ["v2Hear","Hear + meaning"],
    ["v2Notice","Notice pattern"],
    ["v2Echo","Pronunciation"],
    ["v2Transform","Transform"],
    ["v2Generate","Unseen"],
    ["v2Read","Read"],
    ["v2Write","Write"],
    ["v2Own","Make it yours"]
  ]);

  $("#lessonRoot").innerHTML =
    '<section class="v2Manifesto"><p class="eyebrow">FIRST-PRINCIPLES VERSION</p><h3>Build a little French system, not a set of worksheet answers.</h3><p>Sound → meaning → pattern → fluent retrieval → manipulation → unseen generation → reading → writing.</p><div class="v2RuleRow"><span>👂 Hear</span><span>🧠 Understand</span><span>🗣️ Say</span><span>🔁 Change</span><span>✨ Generate</span><span>📖 Read</span><span>✍️ Write</span></div></section>'+

    panel("v2Hear",1,"Hear the meaning before seeing the spelling",
      '<div class="requiredFlag">SOUND + MEANING FIRST</div>'+
      '<p class="tip">Look at the meaning cue. Hear the French. Copy it aloud. Only reveal the written French after you have heard and attempted it.</p>'+
      '<div class="v2HearCard"><div id="v2HearCue" class="v2MegaCue"></div><button id="v2HearPlay" class="primary">🔊 Hear French</button><button id="v2HearReveal" class="secondary">Reveal spelling</button><button id="v2HearNext" class="secondary">Next</button><strong id="v2HearText" class="v2Answer"></strong><small>Try to understand the whole utterance before dissecting individual words.</small></div>'
    )+

    panel("v2Notice",2,"Discover the reusable sentence pattern",
      '<div class="requiredFlag">MEANING → PATTERN</div>'+
      '<p class="tip">Now compare sentences you already understand. What stays fixed? What changes?</p>'+
      '<div id="v2PatternExamples" class="v2PatternExamples"></div>'+
      '<div class="v2SlotMachine"><span>[ OPINION ]</span><b>+</b><span>les</span><b>+</b><span>[ ANIMAL ]</span></div>'+
      '<div class="grammarSpotlight"><div class="grammarSpotlightWord">les</div><div><h4>Why is <em>les</em> there?</h4><p>French normally keeps the definite article when talking about a whole category. So <strong>J’aime les chiens</strong> literally contains “the dogs”, while natural English is “I like dogs”.</p><p>At this point the grammar names the pattern Sai has already heard, rather than being the starting point.</p></div></div>'
    )+

    panel("v2Echo",3,"Make the sound pattern automatic",
      '<div class="requiredFlag">IMITATE, THEN RETRIEVE</div>'+
      '<p class="tip">Hear one short phrase, copy its rhythm, then try to produce it again from the cue without looking at the spelling.</p>'+
      '<div class="v2EchoCard"><div id="v2EchoCue" class="v2MegaCue"></div><div class="row"><button id="v2EchoHear" class="primary">1 · Hear</button><button id="v2EchoShow" class="secondary">2 · Show words</button><button id="v2EchoAgain" class="secondary">3 · New cue</button></div><strong id="v2EchoText" class="v2Answer"></strong><p class="tip">Aim for the French sound and rhythm, not an English reading of the spelling.</p></div>'
    )+

    panel("v2Transform",4,"Transform one sentence again and again",
      '<div class="requiredFlag">THE ENGINE OF THE LESSON</div>'+
      '<p class="tip">Change one thing at a time. This teaches what can move inside the sentence and what must stay fixed.</p>'+
      '<div class="v2TransformCard"><p class="promptLabel">STARTING SENTENCE</p><div id="v2TransformStart" class="bigWord"></div><div id="v2TransformInstruction" class="questionText"></div><input id="v2TransformInput" lang="fr-FR" autocomplete="off" spellcheck="true" placeholder="Say it first, then type it"><div class="row"><button id="v2TransformCheck" class="primary">Check</button><button id="v2TransformModel" class="secondary">Hear model</button><button id="v2TransformNext" class="secondary">Next change</button></div><p id="v2TransformFeedback" class="feedback"></p></div>'
    )+

    panel("v2Generate",5,"Generate French you have never been shown",
      '<div class="requiredFlag">TRANSFER TEST</div>'+
      '<p class="tip">This is the key test. The exact combination below is generated from the system, not memorised as a worksheet answer. Say it before revealing anything.</p>'+
      '<div class="v2GenerateCard"><div id="v2GenerateCue" class="v2MegaCue"></div><input id="v2GenerateInput" lang="fr-FR" autocomplete="off" spellcheck="true" placeholder="Type the sentence you just said"><div class="row"><button id="v2GenerateCheck" class="primary">Check my French</button><button id="v2GenerateHear" class="secondary">Hear model</button><button id="v2GenerateNext" class="secondary">New unseen combination</button></div><p id="v2GenerateFeedback" class="feedback"></p></div>'
    )+

    panel("v2Read",6,"Connect the sound in your head to written French",
      '<div class="requiredFlag">READ A NEW SENTENCE</div>'+
      '<p class="tip">Read the sentence aloud before pressing the speaker. It contains familiar building blocks in a fresh combination.</p>'+
      '<div class="v2ReadCard"><div id="v2ReadText" class="bigWord"></div><div class="row"><button id="v2ReadHear" class="primary">🔊 Compare with model</button><button id="v2ReadMeaning" class="secondary">Reveal meaning</button><button id="v2ReadNext" class="secondary">Another sentence</button></div><p id="v2ReadMeaningText" class="feedback"></p></div>'
    )+

    panel("v2Write",7,"Build writing in five smaller steps",
      '<div class="requiredFlag">COPY → REBUILD → DICTATION → CUE → FREE</div>'+
      '<div class="v2WritingLadder"><button data-write-stage="0" class="active">1 Copy</button><button data-write-stage="1">2 Rebuild</button><button data-write-stage="2">3 Dictation</button><button data-write-stage="3">4 Meaning cue</button><button data-write-stage="4">5 Independent</button></div>'+
      '<div class="v2WriteCard"><p id="v2WriteInstruction" class="tip"></p><div id="v2WriteStimulus"></div><textarea id="v2WriteInput" rows="3" lang="fr-FR" autocomplete="off" spellcheck="true" placeholder="Write in French…"></textarea><div class="row"><button id="v2WriteHear" class="secondary">🔊 Hear</button><button id="v2WriteCheck" class="primary">Check</button><button id="v2WriteNew" class="secondary">New sentence</button></div><p id="v2WriteFeedback" class="feedback"></p></div>'
    )+

    panel("v2Own",8,"Make the pattern yours",
      '<div class="requiredFlag">PERSONAL + LASTING</div>'+
      '<p class="tip">Finish by producing French that is true for you. The school task is then an assessment of an underlying skill, not the lesson itself.</p>'+
      '<div class="v2OwnGrid"><div class="grammarCard"><strong>Speak</strong><p>Choose two animals and say your real opinions without looking at a model.</p></div><div class="grammarCard"><strong>Write</strong><p>Write two true sentences from memory.</p></div><div class="grammarCard"><strong>Stretch</strong><p>Join them with <em>et</em> or <em>mais</em>, or add <em>parce que</em> when ready.</p></div><div class="grammarCard"><strong>Retrieve later</strong><p>Come back tomorrow and next week. Durable recall matters more than one perfect session.</p></div></div>'+
      '<div class="v2Mastery"><strong>Mastery means:</strong><span>understand heard French · pronounce it intelligibly · manipulate the pattern · generate an unseen sentence · read a new combination · write from sound or meaning.</span></div>'
    );

  const combos=[];
  w.opinions.filter(o=>o.id!=="prefere").forEach(o=>w.opinionAnimals.forEach(a=>combos.push({o,a})));

  let hearIndex=0;
  function hearItem(){ return combos[(hearIndex*11+2)%combos.length]; }
  function renderHear(){
    const x=hearItem();
    $("#v2HearCue").innerHTML='<span>'+x.o.symbol+'</span><span>'+x.a.emoji+'</span>';
    $("#v2HearText").textContent="";
  }
  $("#v2HearPlay").onclick=()=>{const x=hearItem();speak(sentence(x.o,x.a),"fr-FR");bump("requiredHeard");};
  $("#v2HearReveal").onclick=()=>{$("#v2HearText").textContent=sentence(hearItem().o,hearItem().a);};
  $("#v2HearNext").onclick=()=>{hearIndex++;renderHear();};
  renderHear();

  const patterns=[
    [byId(w.opinions,"aime"),byId(w.opinionAnimals,"chiens")],
    [byId(w.opinions,"adore"),byId(w.opinionAnimals,"chats")],
    [byId(w.opinions,"deteste"),byId(w.opinionAnimals,"souris")]
  ];
  $("#v2PatternExamples").innerHTML=patterns.map(x=>'<div><span>'+x[0].symbol+' '+x[1].emoji+'</span><strong>'+esc(sentence(x[0],x[1]))+'</strong><button class="inlineSpeak v2PatternHear" data-v2say="'+encodeURIComponent(sentence(x[0],x[1]))+'">🔊</button></div>').join("");
  $$(".v2PatternHear").forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.v2say),"fr-FR"));

  let echoIndex=3;
  function echoItem(){return combos[(echoIndex*5)%combos.length];}
  function renderEcho(){const x=echoItem();$("#v2EchoCue").innerHTML='<span>'+x.o.symbol+'</span><span>'+x.a.emoji+'</span>';$("#v2EchoText").textContent="";}
  $("#v2EchoHear").onclick=()=>{const x=echoItem();speak(sentence(x.o,x.a),"fr-FR");bump("requiredHeard");};
  $("#v2EchoShow").onclick=()=>{$("#v2EchoText").textContent=sentence(echoItem().o,echoItem().a);};
  $("#v2EchoAgain").onclick=()=>{echoIndex++;renderEcho();bump("fluencyAttempts");};
  renderEcho();

  let transformIndex=0;
  const transforms=[
    {from:["aime","chiens"],to:["aime","chats"],instruction:"Keep the opinion. Change dogs → cats."},
    {from:["aime","chats"],to:["adore","chats"],instruction:"Keep the animal. Change like → love."},
    {from:["adore","chats"],to:["deteste","chats"],instruction:"Keep the animal. Change love → hate."},
    {from:["aime","souris"],to:["naimepas","souris"],instruction:"Make it negative: like → don’t like."},
    {from:["naimepas","souris"],to:["naimepas","chevaux"],instruction:"Keep don’t like. Change mice → horses."}
  ];
  function tSentence(pair){return sentence(byId(w.opinions,pair[0]),byId(w.opinionAnimals,pair[1]));}
  function renderTransform(){
    const t=transforms[transformIndex%transforms.length];
    $("#v2TransformStart").textContent=tSentence(t.from);
    $("#v2TransformInstruction").textContent=t.instruction;
    $("#v2TransformInput").value="";$("#v2TransformFeedback").textContent="";
  }
  $("#v2TransformCheck").onclick=()=>{
    const t=transforms[transformIndex%transforms.length], target=tSentence(t.to);
    const ok=norm($("#v2TransformInput").value)===norm(target);
    $("#v2TransformFeedback").textContent=ok?"Correct ✓ You changed the pattern, not just recalled an answer.":"Not yet. Change only the requested part. Model: "+target;
    $("#v2TransformFeedback").className="feedback "+(ok?"good":"try");
    if(ok)bump("sentencesBuilt");
  };
  $("#v2TransformModel").onclick=()=>speak(tSentence(transforms[transformIndex%transforms.length].to),"fr-FR");
  $("#v2TransformNext").onclick=()=>{transformIndex++;renderTransform();};
  renderTransform();

  let gen={};
  function newGenerate(){
    let o1=random(w.opinions.filter(o=>o.id!=="prefere")), a1=random(w.opinionAnimals), o2=random(w.opinions.filter(o=>o.id!=="prefere")), a2=random(w.opinionAnimals), connector=Math.random()>.5?"mais":"et";
    gen={o1,a1,o2,a2,connector};
    $("#v2GenerateCue").innerHTML='<span>'+o1.symbol+' '+a1.emoji+'</span><b>'+connector.toUpperCase()+'</b><span>'+o2.symbol+' '+a2.emoji+'</span>';
    $("#v2GenerateInput").value="";$("#v2GenerateFeedback").textContent="";
  }
  function genSentence(){return oText(gen.o1)+" "+gen.a1.fr+" "+gen.connector+" "+lowerOpinion(gen.o2)+" "+gen.a2.fr+".";}
  function oText(o){return o.fr;}
  function lowerOpinion(o){return o.fr.charAt(0).toLowerCase()+o.fr.slice(1);}
  $("#v2GenerateCheck").onclick=()=>{
    const target=genSentence(),ok=norm($("#v2GenerateInput").value)===norm(target);
    $("#v2GenerateFeedback").textContent=ok?"Excellent ✓ This exact combination was not given to you first.":"Compare with the pattern: "+target;
    $("#v2GenerateFeedback").className="feedback "+(ok?"good":"try");
    recordLearningAttempt("unseen-generation",target,ok,{scope:"v2-transfer"});
    if(ok)bump("sentencesBuilt");
  };
  $("#v2GenerateHear").onclick=()=>speak(genSentence(),"fr-FR");
  $("#v2GenerateNext").onclick=newGenerate;
  newGenerate();

  let read={};
  function newRead(){
    const o=random(w.opinions.filter(x=>x.id!=="prefere")),a=random(w.opinionAnimals);
    read={o,a};$("#v2ReadText").textContent=sentence(o,a);$("#v2ReadMeaningText").textContent="";
  }
  $("#v2ReadHear").onclick=()=>{speak(sentence(read.o,read.a),"fr-FR");bump("requiredHeard");};
  $("#v2ReadMeaning").onclick=()=>{$("#v2ReadMeaningText").textContent=read.o.en+" "+read.a.en+".";};
  $("#v2ReadNext").onclick=newRead;
  newRead();

  let writeStage=0, writeTarget={};
  function newWriteTarget(){writeTarget=random(combos);renderWriteStage();}
  function writeSentence(){return sentence(writeTarget.o,writeTarget.a);}
  function renderWriteStage(){
    const target=writeSentence();
    const instructions=[
      "Copy this accurately. Say it quietly as you write.",
      "Rebuild the sentence from shuffled chunks.",
      "Listen only, then write what you hear.",
      "Use the meaning cue to produce the French from memory.",
      "Write a true animal opinion of your own. Use the target below only as a pattern reminder."
    ];
    $("#v2WriteInstruction").textContent=instructions[writeStage];
    $("#v2WriteInput").value="";$("#v2WriteFeedback").textContent="";
    $("#v2WriteHear").classList.toggle("hidden",writeStage!==2);
    if(writeStage===0) $("#v2WriteStimulus").innerHTML='<div class="bigWord">'+esc(target)+'</div>';
    else if(writeStage===1) $("#v2WriteStimulus").innerHTML='<div class="v2Chunks">'+shuffle(target.replace(/[.]/g,"").split(" ")).map(x=>'<span>'+esc(x)+'</span>').join("")+'</div>';
    else if(writeStage===2) $("#v2WriteStimulus").innerHTML='<div class="v2MegaCue">👂</div>';
    else if(writeStage===3) $("#v2WriteStimulus").innerHTML='<div class="v2MegaCue"><span>'+writeTarget.o.symbol+'</span><span>'+writeTarget.a.emoji+'</span></div>';
    else $("#v2WriteStimulus").innerHTML='<div class="v2SlotMachine"><span>[ OPINION ]</span><b>+</b><span>les</span><b>+</b><span>[ ANIMAL ]</span></div>';
  }
  $(".v2WritingLadder").querySelectorAll("button").forEach(b=>b.onclick=()=>{
    writeStage=Number(b.dataset.writeStage);
    $(".v2WritingLadder").querySelectorAll("button").forEach(x=>x.classList.toggle("active",x===b));
    newWriteTarget();
  });
  $("#v2WriteHear").onclick=()=>speak(writeSentence(),"fr-FR");
  $("#v2WriteCheck").onclick=()=>{
    if(writeStage===4){
      const val=norm($("#v2WriteInput").value);
      const hasOpinion=w.opinions.some(o=>val.startsWith(norm(o.fr)));
      const hasAnimal=w.opinionAnimals.some(a=>val.includes(norm(a.fr)));
      const ok=hasOpinion&&hasAnimal;
      $("#v2WriteFeedback").textContent=ok?"Good ✓ You generated a complete opinion sentence.":"Use one opinion phrase + les + a plural animal.";
      $("#v2WriteFeedback").className="feedback "+(ok?"good":"try");
      if(ok)bump("independentCorrect");
      return;
    }
    const ok=norm($("#v2WriteInput").value)===norm(writeSentence());
    $("#v2WriteFeedback").textContent=ok?"Correct ✓":"Model: "+writeSentence();
    $("#v2WriteFeedback").className="feedback "+(ok?"good":"try");
    if(ok)bump("independentCorrect");
  };
  $("#v2WriteNew").onclick=newWriteTarget;
  newWriteTarget();

  renderProgress();
}

window.renderFrench=function(){
  if(state.week&&state.week.opinionsV2)return renderOpinionsV2();
  return previousFrenchV2();
};
})();