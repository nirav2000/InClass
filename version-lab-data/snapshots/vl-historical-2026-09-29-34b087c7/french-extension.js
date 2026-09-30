// French homework-first renderer: required school work stays open; explanation and extension collapse by default.
(function(){
  const oldRenderFrench=window.renderFrench;

  window.renderFrench=function(){
    const w=state.week;
    if(!w.extensionAnimals)return oldRenderFrench();

    setNav([["frLearn","School words"],["frSpell","Spell"],["frDictation","Write"],["frBuild","Sentence"],["frExplore","Explore"]]);

    const makeGroup=(title,items,badge)=>'<div class="vocabGroup">'+
      '<div class="vocabGroupTitle"><h4>'+title+'</h4>'+(badge?'<span class="homeworkBadge">'+badge+'</span>':'')+'</div>'+
      '<div class="wordList">'+items.map(x=>'<button class="wordButton" data-audio="'+encodeURIComponent(x.audio)+'"><strong>'+x.term+'</strong><small>'+x.meaning+'</small></button>').join("")+'</div></div>';

    const school=[
      makeGroup("Animals",w.animals.map(x=>({term:x.fr,meaning:x.en,audio:x.fr})),"school"),
      makeGroup("Colours",w.colours.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m})),"school"),
      makeGroup("Descriptions",w.qualities.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m})),"school"),
      makeGroup("Sentence frame",[
        {term:"J’ai",meaning:"I have",audio:"J’ai"},
        {term:"et",meaning:"and",audio:"et"}
      ],"school")
    ].join("");

    const extension=[
      makeGroup("Rainbow + pink",w.extensionColours.map(x=>({term:x.m===x.f?x.m:x.m+" / "+x.f,meaning:x.en,audio:x.m}))),
      makeGroup("More animals",w.extensionAnimals.map(x=>({term:x.fr,meaning:x.en,audio:x.fr}))),
      makeGroup("UK garden birds",w.gardenBirds.map(x=>({term:x.fr,meaning:x.en,audio:x.fr})))
    ].join("");

    const grammar=w.grammarNotes.map(x=>'<div class="grammarCard"><strong>'+x.title+'</strong><p>'+x.text+'</p></div>').join("");

    $("#lessonRoot").innerHTML=
      panel("frLearn",1,"School vocabulary",
        '<div class="homeworkPriority"><span>✓</span><div><strong>Homework first</strong><p>These are the words from the sheet Sai is most likely to be tested on. Extra vocabulary is kept out of the way below.</p></div></div>'+
        '<div class="vocabGroups coreVocab">'+school+'</div>'
      )+
      panel("frSpell",2,"Hear → spell",
        '<div class="requiredFlag">REQUIRED PRACTICE</div>'+
        '<div class="practiceCard"><label class="wideLabel">Practice set<select id="frSpellMode"><option value="core">School words · required</option><option value="extension">Extension words · optional</option><option value="mixed">Mixed · optional</option></select></label>'+
        '<button class="soundButton" id="frSpellPlay">🔊</button><p id="frSpellMeaning" class="meaning"></p>'+
        '<form id="frSpellForm" class="inlineForm centred"><input id="frSpellInput" autocomplete="off" spellcheck="false" placeholder="Type the French"><button class="primary">Check</button></form>'+
        '<p id="frSpellFeedback" class="feedback"></p><button id="nextFrSpell" class="secondary hidden">Next →</button></div>'
      )+
      panel("frDictation",3,"Write it on paper",
        '<div class="requiredFlag">REQUIRED PRACTICE</div>'+
        '<p class="tip">For handwriting practice: hide the French, play the audio, let Sai write it, then mark ✓ or ✗.</p>'+
        '<div class="dictationToolbar"><label>Set<select id="dictationSet"><option value="core">School words · required</option><option value="extension">Extension words · optional</option><option value="sentences">Sentences · mixed</option></select></label>'+
        '<button class="secondary" id="toggleDictationAnswers">Hide French answers</button><button class="secondary" id="resetDictation">Clear marks</button></div>'+
        '<div id="dictationList" class="dictationList"></div>'
      )+
      panel("frBuild",4,"Use the school sentence frame",
        '<div class="requiredFlag">SCHOOL FORMAT</div>'+
        '<p class="tip">Keep the format from the homework sheet visible because this is the form Sai may be asked to produce.</p>'+
        '<div class="builder"><label>Animal<select id="animalSelect"></select></label><label>Colour<select id="colourSelect"></select></label><label>Description<select id="qualitySelect"></select></label></div>'+
        '<div class="sentenceCard"><p id="builtFrench" class="bigWord"></p><p id="builtEnglish" class="meaning"></p><div class="row"><button class="primary" id="hearFrenchSentence">🔊 Hear it</button><button class="secondary" id="shuffleFrench">Shuffle</button></div></div>'+
        '<details class="optionalBlock"><summary><span>Understand why it works</span><small>Optional explanation</small></summary>'+
          '<div class="optionalBody"><p><strong>Both adjectives describe the same animal.</strong> The school sentence is grammatical French even if some combinations sound deliberately silly.</p>'+
          '<div class="miniRule"><strong>Clearer beginner version</strong><span id="clearerFrench"></span></div>'+
          '<div class="miniRule"><strong>Agreement</strong><span id="frAgreement"></span></div></div>'+
        '</details>'
      )+
      panel("frExplore",5,"Go further",
        '<p class="tip">Nothing below replaces the homework. Open these only after the school material is secure.</p>'+
        '<details class="optionalBlock"><summary><span>Extension vocabulary</span><small>Rainbow, animals & garden birds</small></summary><div class="optionalBody"><div class="vocabGroups extensionVocab">'+extension+'</div></div></details>'+
        '<details class="optionalBlock"><summary><span>Patterns to notice</span><small>Masculine, feminine & adjective agreement</small></summary><div class="optionalBody"><div class="grammarGrid">'+grammar+'</div></div></details>'+
        '<details class="optionalBlock"><summary><span>Today, I saw … in the garden</span><small>Real-life bird vocabulary</small></summary><div class="optionalBody">'+
          '<label class="wideLabel">What did you see?<select id="gardenAnimalSelect"></select></label>'+
          '<div class="sentenceCard"><p id="gardenFrench" class="bigWord"></p><p id="gardenEnglish" class="meaning"></p><div class="row"><button class="primary" id="hearGarden">🔊 Hear sentence</button><button class="secondary" id="shuffleGarden">Another</button></div></div>'+
          '<div class="miniRule"><strong>Pattern</strong><span>Aujourd’hui = today · j’ai vu = I saw · dans le jardin = in the garden</span></div>'+
        '</div></details>'+
        '<details class="optionalBlock"><summary><span>Mini conversation</span><small>Use what you know</small></summary><div class="optionalBody">'+
          '<div class="conversation"><div class="bubble tutor"><span>InClass</span><p id="chatQuestion"></p><button class="tiny" id="hearChat">🔊 Hear</button></div>'+
          '<div class="bubble learner"><span>Your turn</span><p id="chatHelp"></p><div class="chatInputRow"><input id="chatInput" autocomplete="off" spellcheck="false" placeholder="Type your French answer, or use the microphone"><button class="secondary" id="chatMic">🎙 Speak</button><button class="primary" id="chatCheck">Check</button></div><p id="chatFeedback" class="feedback"></p><button class="secondary hidden" id="chatNext">Another turn →</button></div></div>'+
        '</div></details>'
      );

    setupFrenchHomeworkFirst();
  };

  function dictationKey(){return "inclass:dictation:"+state.week.id+":"+state.learner;}
  function getMarks(){
    if(window.InClassData)return window.InClassData.getJson(dictationKey(),{});
    try{return JSON.parse(localStorage.getItem(dictationKey()))||{};}catch(e){return {};}
  }
  function saveMarks(m){
    if(window.InClassData)window.InClassData.setJson(dictationKey(),m);
    else localStorage.setItem(dictationKey(),JSON.stringify(m));
  }

  function setupFrenchHomeworkFirst(){
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
    function nextSpell(){
      const k="fr_homework_"+$("#frSpellMode").value;
      if(!state.queues[k]||!state.queues[k].length)state.queues[k]=shuffle(pool());
      state.current.frSpell=state.queues[k].pop();
      $("#frSpellMeaning").textContent=state.current.frSpell.meaning;
      $("#frSpellInput").value="";$("#frSpellInput").disabled=false;$("#frSpellFeedback").textContent="";$("#nextFrSpell").classList.add("hidden");
    }
    $("#frSpellMode").onchange=nextSpell;
    $("#frSpellPlay").onclick=()=>speak(state.current.frSpell.text,"fr-FR");
    $("#frSpellForm").onsubmit=e=>{
      e.preventDefault();
      const p=getProgress();p.spellAttempts=(p.spellAttempts||0)+1;
      const ok=norm($("#frSpellInput").value)===norm(state.current.frSpell.text);
      recordLearningAttempt("spelling",state.current.frSpell.text,ok,{scope:$("#frSpellMode").value==="core"?"required":"extension"});
      if(ok){
        p.spellCorrect=(p.spellCorrect||0)+1;$("#frSpellFeedback").textContent="Correct ✓";$("#frSpellFeedback").className="feedback good";
        $("#frSpellInput").disabled=true;$("#nextFrSpell").classList.remove("hidden");
      }else{
        $("#frSpellFeedback").textContent="Try again and listen once more.";$("#frSpellFeedback").className="feedback try";speak(state.current.frSpell.text,"fr-FR");
      }
      saveProgress(p);
    };
    $("#nextFrSpell").onclick=nextSpell;nextSpell();

    let hidden=false;
    function renderDictation(){
      const set=$("#dictationSet").value,items=w.dictation[set],marks=getMarks();
      $("#dictationList").innerHTML=items.map((it,i)=>{
        const id=set+":"+i+":"+it.text,m=marks[id]||"";
        return '<div class="dictationRow '+m+'" data-id="'+encodeURIComponent(id)+'"><button class="dictationPlay" data-text="'+encodeURIComponent(it.text)+'">🔊</button><div class="dictationText"><strong>'+(hidden?"••••••••":it.text)+'</strong><small>'+it.label+'</small></div><div class="dictationMarks"><button class="markBtn correct" data-mark="correct">✓</button><button class="markBtn incorrect" data-mark="incorrect">✗</button></div></div>';
      }).join("");
      $$(".dictationPlay").forEach(b=>b.onclick=()=>speak(decodeURIComponent(b.dataset.text),"fr-FR"));
      $$(".markBtn").forEach(b=>b.onclick=()=>{
        const row=b.closest(".dictationRow"),id=decodeURIComponent(row.dataset.id),marks=getMarks(),correct=b.dataset.mark==="correct";
        marks[id]=b.dataset.mark;saveMarks(marks);
        const text=id.split(":").slice(2).join(":");
        recordLearningAttempt("handwriting",text,correct,{scope:set==="core"?"required":"extension"});
        renderDictation();
      });
      $("#toggleDictationAnswers").textContent=hidden?"Show French answers":"Hide French answers";
    }
    $("#dictationSet").onchange=renderDictation;
    $("#toggleDictationAnswers").onclick=()=>{hidden=!hidden;renderDictation();};
    $("#resetDictation").onclick=()=>{if(window.InClassData)window.InClassData.remove(dictationKey());else localStorage.removeItem(dictationKey());renderDictation();};
    renderDictation();

    const schoolAnimals=w.animals,schoolColours=w.colours;
    $("#animalSelect").innerHTML=schoolAnimals.map((x,i)=>'<option value="'+i+'">'+x.fr+' · '+x.en+'</option>').join("");
    $("#colourSelect").innerHTML=schoolColours.map((x,i)=>'<option value="'+i+'">'+x.m+' · '+x.en+'</option>').join("");
    $("#qualitySelect").innerHTML=w.qualities.map((x,i)=>'<option value="'+i+'">'+x.m+' · '+x.en+'</option>').join("");

    function currentSentence(){
      const a=schoolAnimals[+$("#animalSelect").value],c=schoolColours[+$("#colourSelect").value],q=w.qualities[+$("#qualitySelect").value];
      const col=a.gender==="f"?c.f:c.m,qual=a.gender==="f"?q.f:q.m,pron=a.gender==="f"?"Elle":"Il",noun=a.en.replace(/^(a|an) /,"");
      return {
        school:"J’ai "+a.fr+" "+col+" et "+qual+".",
        schoolEn:"I have a "+c.en+" "+noun+" that is "+q.en+".",
        clear:"J’ai "+a.fr+" "+col+". "+pron+" est "+qual+".",
        a,col,qual
      };
    }
    function showSentence(count){
      const s=currentSentence();
      $("#builtFrench").textContent=s.school;$("#builtEnglish").textContent=s.schoolEn;
      $("#clearerFrench").textContent=s.clear;
      $("#frAgreement").textContent=s.a.gender==="f"
        ?"The noun is feminine ("+s.a.fr+"), so adjective forms change where needed: "+s.col+", "+s.qual+"."
        :"The noun is masculine ("+s.a.fr+"), so use the masculine forms: "+s.col+", "+s.qual+".";
      if(count)bump("sentencesBuilt");
    }
    ["#animalSelect","#colourSelect","#qualitySelect"].forEach(x=>$(x).onchange=()=>showSentence(true));
    $("#hearFrenchSentence").onclick=()=>{speak(currentSentence().school,"fr-FR");bump("heard");};
    $("#shuffleFrench").onclick=()=>{
      $("#animalSelect").value=Math.floor(Math.random()*schoolAnimals.length);
      $("#colourSelect").value=Math.floor(Math.random()*schoolColours.length);
      $("#qualitySelect").value=Math.floor(Math.random()*w.qualities.length);
      showSentence(true);
    };
    showSentence(false);

    const gardenChoices=w.gardenBirds.concat(w.extensionAnimals);
    $("#gardenAnimalSelect").innerHTML=gardenChoices.map((x,i)=>'<option value="'+i+'">'+x.fr+' · '+x.en+'</option>').join("");
    function showGarden(){
      const a=gardenChoices[+$("#gardenAnimalSelect").value];
      state.current.gardenSentence=w.gardenFrame.fr.replace("{animal}",a.fr);
      $("#gardenFrench").textContent=state.current.gardenSentence;
      $("#gardenEnglish").textContent=w.gardenFrame.en.replace("{animal}",a.en);
    }
    $("#gardenAnimalSelect").onchange=showGarden;
    $("#hearGarden").onclick=()=>{speak(state.current.gardenSentence,"fr-FR");bump("heard");};
    $("#shuffleGarden").onclick=()=>{$("#gardenAnimalSelect").value=Math.floor(Math.random()*gardenChoices.length);showGarden();};
    showGarden();

    const allAnimals=w.animals.concat(w.extensionAnimals),allColours=w.colours.concat(w.extensionColours);
    function newChat(){
      state.current.chatType=Math.random()>.5?"garden":"have";
      state.current.chatQuestion=state.current.chatType==="garden"?"Qu’est-ce que tu as vu dans le jardin aujourd’hui ?":"Quel animal as-tu ?";
      $("#chatQuestion").textContent=state.current.chatQuestion;
      $("#chatHelp").innerHTML=state.current.chatType==="garden"
        ?'Try: <strong>Aujourd’hui, j’ai vu + animal/bird + dans le jardin.</strong>'
        :'Try: <strong>J’ai + animal + colour.</strong>';
      $("#chatInput").value="";$("#chatFeedback").textContent="";$("#chatNext").classList.add("hidden");
    }
    function checkChat(){
      const t=norm($("#chatInput").value);let ok=false;
      if(state.current.chatType==="garden"){
        ok=gardenChoices.some(a=>t.indexOf(norm(a.fr.replace(/^(un|une) /,"")))>=0)&&t.indexOf("j'ai vu")>=0&&t.indexOf("jardin")>=0;
        $("#chatFeedback").textContent=ok?"Très bien ✓ You used the garden-sighting pattern.":"Try again: include j’ai vu, an animal or bird, and dans le jardin.";
      }else{
        ok=allAnimals.some(a=>t.indexOf(norm(a.fr.replace(/^(un|une) /,"")))>=0)&&allColours.some(x=>t.indexOf(norm(x.m))>=0||t.indexOf(norm(x.f))>=0)&&(t.indexOf("j'ai")>=0||t.indexOf("jai")>=0);
        $("#chatFeedback").textContent=ok?"Très bien ✓ You said what animal you have and gave its colour.":"Try again: include J’ai, an animal and a colour.";
      }
      $("#chatFeedback").className="feedback "+(ok?"good":"try");
      recordLearningAttempt("conversation",state.current.chatType,ok,{scope:"extension",response:t});
      if(ok){bump("chatted");$("#chatNext").classList.remove("hidden");}
    }
    $("#hearChat").onclick=()=>{speak(state.current.chatQuestion,"fr-FR");bump("heard");};
    $("#chatCheck").onclick=checkChat;
    $("#chatMic").onclick=()=>{
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(!SR){$("#chatFeedback").textContent="Speech recognition is not available here. Type the answer instead.";return;}
      const r=new SR();r.lang="fr-FR";
      r.onresult=e=>{$("#chatInput").value=e.results[0][0].transcript;checkChat();};
      r.start();
    };
    $("#chatNext").onclick=newChat;newChat();
  }
})();