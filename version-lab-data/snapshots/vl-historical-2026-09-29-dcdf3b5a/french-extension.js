// French v2 overrides: extension vocabulary, garden birds, grammar notes and paper dictation.
(function(){
  const oldRenderFrench = window.renderFrench;
  window.renderFrench = function(){
    const w=state.week;
    if(!w.extensionAnimals){ return oldRenderFrench(); }
    setNav([["frLearn","Learn"],["frGarden","Garden"],["frSpell","Spell"],["frDictation","Dictation"],["frBuild","Build"],["frChat","Chat"]]);

    const makeGroup=(title,items)=>'<div class="vocabGroup"><h4>'+title+'</h4><div class="wordList">'+items.map(x=>'<button class="wordButton" data-audio="'+encodeURIComponent(x.audio)+'"><strong>'+x.term+'</strong><small>'+x.meaning+'</small></button>').join("")+'</div></div>';
    const school=[
      makeGroup("School pets",w.animals.map(x=>({term:x.fr,meaning:x.en,audio:x.fr}))),
      makeGroup("School colours",w.colours.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m}))),
      makeGroup("Descriptions",w.qualities.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m})))
    ].join("");
    const extension=[
      makeGroup("Rainbow + pink",w.extensionColours.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m}))),
      makeGroup("More animals",w.extensionAnimals.map(x=>({term:x.fr,meaning:x.en,audio:x.fr}))),
      makeGroup("UK garden birds",w.gardenBirds.map(x=>({term:x.fr,meaning:x.en,audio:x.fr})))
    ].join("");
    const grammar=w.grammarNotes.map(x=>'<div class="grammarCard"><strong>'+x.title+'</strong><p>'+x.text+'</p></div>').join("");

    $("#lessonRoot").innerHTML=
      panel("frLearn",1,"Learn the words",
        '<p class="tip"><strong>School vocabulary</strong> is kept separate from <strong>InClass extension vocabulary</strong>. Tap a word to hear it.</p>'+
        '<div class="vocabGroups">'+school+'</div>'+
        '<div class="extensionHead"><p class="eyebrow">EXTENSION</p><h4>Rainbow colours, more animals & UK garden birds</h4></div>'+
        '<div class="vocabGroups extensionVocab">'+extension+'</div>'+
        '<div class="grammarSection"><p class="eyebrow">PATTERNS TO NOTICE</p><h4>Masculine, feminine and adjective agreement</h4><div class="grammarGrid">'+grammar+'</div></div>'
      )+
      panel("frGarden",2,"Today, I saw … in the garden",
        '<p class="tip">Useful real-life French for Sai’s garden-bird interest.</p>'+
        '<label class="wideLabel">What did you see?<select id="gardenAnimalSelect"></select></label>'+
        '<div class="sentenceCard"><p id="gardenFrench" class="bigWord"></p><p id="gardenEnglish" class="meaning"></p>'+
        '<div class="row"><button class="primary" id="hearGarden">🔊 Hear sentence</button><button class="secondary" id="shuffleGarden">Another</button></div></div>'+
        '<div class="miniRule"><strong>Pattern</strong><span>Aujourd’hui = today · j’ai vu = I saw · dans le jardin = in the garden</span></div>'
      )+
      panel("frSpell",3,"Hear → spell",
        '<div class="practiceCard"><label class="wideLabel">Practice set<select id="frSpellMode"><option value="core">School words</option><option value="extension">Extension words</option><option value="mixed">Mixed</option></select></label>'+
        '<button class="soundButton" id="frSpellPlay">🔊</button><p id="frSpellMeaning" class="meaning"></p>'+
        '<form id="frSpellForm" class="inlineForm centred"><input id="frSpellInput" autocomplete="off" spellcheck="false" placeholder="Type the French"><button class="primary">Check</button></form>'+
        '<p id="frSpellFeedback" class="feedback"></p><button id="nextFrSpell" class="secondary hidden">Next →</button></div>'
      )+
      panel("frDictation",4,"Write it on paper: parent checklist",
        '<p class="tip">Tap 🔊, let Sai write the answer on paper, then mark ✓ or ✗. Hide the French answer while dictating.</p>'+
        '<div class="dictationToolbar"><label>Set<select id="dictationSet"><option value="core">School words</option><option value="extension">Extension words</option><option value="sentences">Sentences</option></select></label>'+
        '<button class="secondary" id="toggleDictationAnswers">Hide French answers</button><button class="secondary" id="resetDictation">Clear marks</button></div>'+
        '<div id="dictationList" class="dictationList"></div>'
      )+
      panel("frBuild",5,"Build a clearer sentence",
        '<p class="tip">The school frame is grammatical, but two short sentences are often clearer for a beginner: colour first, then description.</p>'+
        '<div class="builder"><label>Animal<select id="animalSelect"></select></label><label>Colour<select id="colourSelect"></select></label><label>Description<select id="qualitySelect"></select></label></div>'+
        '<div class="sentenceCard"><p id="builtFrench" class="bigWord"></p><p id="builtEnglish" class="meaning"></p><div class="row"><button class="primary" id="hearFrenchSentence">🔊 Hear it</button><button class="secondary" id="shuffleFrench">Shuffle</button></div></div>'+
        '<div class="miniRule"><strong>School-frame version</strong><span id="schoolFrameExample"></span></div>'+
        '<div class="miniRule"><strong>Agreement</strong><span id="frAgreement"></span></div>'
      )+
      panel("frChat",6,"Mini conversation",
        '<div class="conversation"><div class="bubble tutor"><span>InClass</span><p id="chatQuestion"></p><button class="tiny" id="hearChat">🔊 Hear</button></div>'+
        '<div class="bubble learner"><span>Your turn</span><p id="chatHelp"></p><div class="chatInputRow"><input id="chatInput" autocomplete="off" spellcheck="false" placeholder="Type your French answer, or use the microphone"><button class="secondary" id="chatMic">🎙 Speak</button><button class="primary" id="chatCheck">Check</button></div><p id="chatFeedback" class="feedback"></p><button class="secondary hidden" id="chatNext">Another turn →</button></div></div>'
      );
    setupFrenchV2();
  };

  function dictationKey(){ return "inclass:dictation:"+state.week.id+":"+state.learner; }
  function getMarks(){ try{return JSON.parse(localStorage.getItem(dictationKey()))||{};}catch(e){return {};} }
  function saveMarks(m){ localStorage.setItem(dictationKey(),JSON.stringify(m)); }

  function setupFrenchV2(){
    const w=state.week;
    $$(".wordButton").forEach(b=>b.onclick=()=>{speak(decodeURIComponent(b.dataset.audio),"fr-FR");bump("heard");});

    const core=[];
    w.animals.forEach(x=>core.push({text:x.fr,meaning:x.en}));
    w.colours.forEach(x=>x.m===x.f?core.push({text:x.m,meaning:x.en}):(core.push({text:x.m,meaning:x.en+" (masculine)"}),core.push({text:x.f,meaning:x.en+" (feminine)"})));
    w.qualities.forEach(x=>x.m===x.f?core.push({text:x.m,meaning:x.en}):(core.push({text:x.m,meaning:x.en+" (masculine)"}),core.push({text:x.f,meaning:x.en+" (feminine)"})));
    core.push({text:"J’ai",meaning:"I have"},{text:"et",meaning:"and"});

    const extension=[];
    w.extensionColours.forEach(x=>x.m===x.f?extension.push({text:x.m,meaning:x.en+" · extension"}):(extension.push({text:x.m,meaning:x.en+" (masculine)"}),extension.push({text:x.f,meaning:x.en+" (feminine)"})));
    w.extensionAnimals.forEach(x=>extension.push({text:x.fr,meaning:x.en+" · extension"}));
    w.gardenBirds.forEach(x=>extension.push({text:x.fr,meaning:x.en+" · garden bird"}));
    extension.push({text:"Aujourd’hui",meaning:"today"},{text:"j’ai vu",meaning:"I saw"},{text:"dans le jardin",meaning:"in the garden"});

    function pool(){const m=$("#frSpellMode").value;return m==="core"?core:m==="extension"?extension:core.concat(extension);}
    function nextSpell(){const k="fr2_"+$("#frSpellMode").value;if(!state.queues[k]||!state.queues[k].length)state.queues[k]=shuffle(pool());state.current.frSpell=state.queues[k].pop();$("#frSpellMeaning").textContent=state.current.frSpell.meaning;$("#frSpellInput").value="";$("#frSpellInput").disabled=false;$("#frSpellFeedback").textContent="";$("#nextFrSpell").classList.add("hidden");}
    $("#frSpellMode").onchange=nextSpell;$("#frSpellPlay").onclick=()=>speak(state.current.frSpell.text,"fr-FR");
    $("#frSpellForm").onsubmit=e=>{e.preventDefault();const p=getProgress();p.spellAttempts=(p.spellAttempts||0)+1;const ok=norm($("#frSpellInput").value)===norm(state.current.frSpell.text);if(ok){p.spellCorrect=(p.spellCorrect||0)+1;$("#frSpellFeedback").textContent="Correct ✓";$("#frSpellFeedback").className="feedback good";$("#frSpellInput").disabled=true;$("#nextFrSpell").classList.remove("hidden");}else{$("#frSpellFeedback").textContent="Try again and listen once more.";$("#frSpellFeedback").className="feedback try";speak(state.current.frSpell.text,"fr-FR");}saveProgress(p);};
    $("#nextFrSpell").onclick=nextSpell;nextSpell();

    const gardenChoices=w.gardenBirds.concat(w.extensionAnimals);
    $("#gardenAnimalSelect").innerHTML=gardenChoices.map((x,i)=>'<option value="'+i+'">'+x.fr+' · '+x.en+'</option>').join("");
    function showGarden(){const a=gardenChoices[+$("#gardenAnimalSelect").value];state.current.gardenSentence=w.gardenFrame.fr.replace("{animal}",a.fr);$("#gardenFrench").textContent=state.current.gardenSentence;$("#gardenEnglish").textContent=w.gardenFrame.en.replace("{animal}",a.en);}
    $("#gardenAnimalSelect").onchange=showGarden;$("#hearGarden").onclick=()=>{speak(state.current.gardenSentence,"fr-FR");bump("heard");};$("#shuffleGarden").onclick=()=>{$("#gardenAnimalSelect").value=Math.floor(Math.random()*gardenChoices.length);showGarden();};showGarden();

    let hidden=false;
    function renderDictation(){
      const set=$("#dictationSet").value,items=w.dictation[set],marks=getMarks();
      $("#dictationList").innerHTML=items.map((it,i)=>{const id=set+":"+i+":"+it.text,m=marks[id]||"";return '<div class="dictationRow '+m+'" data-id="'+encodeURIComponent(id)+'"><button class="dictationPlay" data-text="'+encodeURIComponent(it.text)+'">🔊</button><div class="dictationText"><strong>'+(hidden?"••••••••":it.text)+'</strong><small>'+it.label+'</small></div><div class="dictationMarks"><button class="markBtn correct" data-mark="correct">✓</button><button class="markBtn incorrect" data-mark="incorrect">✗</button></div></div>';}).join("");
      $$(".dictationPlay").forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.text),"fr-FR"));
      $$(".markBtn").forEach(b=>b.onclick=()=>{const row=b.closest(".dictationRow"),id=decodeURIComponent(row.dataset.id),marks=getMarks();marks[id]=b.dataset.mark;saveMarks(marks);renderDictation();});
      $("#toggleDictationAnswers").textContent=hidden?"Show French answers":"Hide French answers";
    }
    $("#dictationSet").onchange=renderDictation;$("#toggleDictationAnswers").onclick=()=>{hidden=!hidden;renderDictation();};$("#resetDictation").onclick=()=>{localStorage.removeItem(dictationKey());renderDictation();};renderDictation();

    const allAnimals=w.animals.concat(w.extensionAnimals),allColours=w.colours.concat(w.extensionColours);
    $("#animalSelect").innerHTML=allAnimals.map((x,i)=>'<option value="'+i+'">'+x.fr+' · '+x.en+'</option>').join("");
    $("#colourSelect").innerHTML=allColours.map((x,i)=>'<option value="'+i+'">'+x.m+' · '+x.en+'</option>').join("");
    $("#qualitySelect").innerHTML=w.qualities.map((x,i)=>'<option value="'+i+'">'+x.m+' · '+x.en+'</option>').join("");
    function currentSentence(){const a=allAnimals[+$("#animalSelect").value],c=allColours[+$("#colourSelect").value],q=w.qualities[+$("#qualitySelect").value],col=a.gender==="f"?c.f:c.m,qual=a.gender==="f"?q.f:q.m,pron=a.gender==="f"?"Elle":"Il",noun=a.en.replace(/^(a|an) /,"");return {fr:"J’ai "+a.fr+" "+col+". "+pron+" est "+qual+".",en:"I have a "+c.en+" "+noun+". It is "+q.en+".",school:"J’ai "+a.fr+" "+col+" et "+qual+".",a,col,qual};}
    function showSentence(count){const s=currentSentence();$("#builtFrench").textContent=s.fr;$("#builtEnglish").textContent=s.en;$("#schoolFrameExample").textContent=s.school+" — both adjectives describe the same animal.";$("#frAgreement").textContent=s.a.gender==="f"?"The noun is feminine ("+s.a.fr+"), so use feminine adjective forms where they change: "+s.col+", "+s.qual+".":"The noun is masculine ("+s.a.fr+"), so use masculine adjective forms: "+s.col+", "+s.qual+".";if(count)bump("sentencesBuilt");}
    ["#animalSelect","#colourSelect","#qualitySelect"].forEach(x=>$(x).onchange=()=>showSentence(true));$("#hearFrenchSentence").onclick=()=>{speak(currentSentence().fr,"fr-FR");bump("heard");};$("#shuffleFrench").onclick=()=>{$("#animalSelect").value=Math.floor(Math.random()*allAnimals.length);$("#colourSelect").value=Math.floor(Math.random()*allColours.length);$("#qualitySelect").value=Math.floor(Math.random()*w.qualities.length);showSentence(true);};showSentence(false);

    function newChat(){state.current.chatType=Math.random()>.5?"garden":"have";state.current.chatQuestion=state.current.chatType==="garden"?"Qu’est-ce que tu as vu dans le jardin aujourd’hui ?":"Quel animal as-tu ?";$("#chatQuestion").textContent=state.current.chatQuestion;$("#chatHelp").innerHTML=state.current.chatType==="garden"?'Try: <strong>Aujourd’hui, j’ai vu + animal/bird + dans le jardin.</strong>':'Try: <strong>J’ai + animal + colour.</strong> Then add <strong>Il/Elle est + description.</strong>';$("#chatInput").value="";$("#chatFeedback").textContent="";$("#chatNext").classList.add("hidden");}
    function checkChat(){const t=norm($("#chatInput").value);let ok=false;if(state.current.chatType==="garden"){ok=gardenChoices.some(a=>t.indexOf(norm(a.fr.replace(/^(un|une) /,"")))>=0)&&t.indexOf("j'ai vu")>=0&&t.indexOf("jardin")>=0;$("#chatFeedback").textContent=ok?"Très bien ✓ You used the garden-sighting pattern.":"Try again: include j’ai vu, a known animal or bird, and dans le jardin.";}else{ok=allAnimals.some(a=>t.indexOf(norm(a.fr.replace(/^(un|une) /,"")))>=0)&&allColours.some(x=>t.indexOf(norm(x.m))>=0||t.indexOf(norm(x.f))>=0)&&(t.indexOf("j'ai")>=0||t.indexOf("jai")>=0);$("#chatFeedback").textContent=ok?"Très bien ✓ You said what animal you have and gave its colour.":"Try again: include J’ai, an animal and a colour.";}$("#chatFeedback").className="feedback "+(ok?"good":"try");if(ok){bump("chatted");$("#chatNext").classList.remove("hidden");}}
    $("#hearChat").onclick=()=>{speak(state.current.chatQuestion,"fr-FR");bump("heard");};$("#chatCheck").onclick=checkChat;$("#chatMic").onclick=()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){$("#chatFeedback").textContent="Speech recognition is not available here. Type the answer instead.";return;}const r=new SR();r.lang="fr-FR";r.onresult=e=>{$("#chatInput").value=e.results[0][0].transcript;checkChat();};r.start();};$("#chatNext").onclick=newChat;newChat();
  }
})();