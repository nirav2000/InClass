// Shared learning helpers: word help, grammar glossary and short micro-quizzes.
(function(){
  function ensureModal(){
    if(document.getElementById("learningModal")) return;
    document.body.insertAdjacentHTML("beforeend",
      '<div id="learningModal" class="learningModal hidden" role="dialog" aria-modal="true" aria-labelledby="learningModalTitle">'+
        '<div class="learningModalCard">'+
          '<button id="learningModalClose" class="modalClose" aria-label="Close">×</button>'+
          '<div id="learningModalBody"></div>'+
        '</div>'+
      '</div>');
    document.getElementById("learningModalClose").onclick=closeModal;
    document.getElementById("learningModal").addEventListener("click",function(e){
      if(e.target.id==="learningModal") closeModal();
    });
  }
  function closeModal(){ document.getElementById("learningModal").classList.add("hidden"); }
  function openModal(html){
    ensureModal();
    document.getElementById("learningModalBody").innerHTML=html;
    document.getElementById("learningModal").classList.remove("hidden");
  }

  const englishPersonalExamples={
    benches:"Sai left his sailing bag beside the benches at the club.",
    planets:"Sai compared the planets while reading about space.",
    volcanoes:"The explorers in Sai's book could see volcanoes beyond the mountains.",
    statues:"Sai noticed several statues on a school visit.",
    canyons:"The explorers looked down into the deep canyons.",
    torches:"Sai and his friends used torches while camping.",
    mountains:"Sai could see mountains beyond the lake.",
    serpents:"Sai imagined serpents appearing in a fantasy story.",
    protagonists:"Sai compared the protagonists in two books he had read.",
    antagonists:"Sai looked for the antagonists who were trying to stop the hero.",
    suffixes:"Sai spotted suffixes while practising his weekly spelling.",
    prefixes:"Sai used prefixes to work out how a word's meaning had changed."
  };

  function addEnglishWordInfo(){
    if(!state.week||!state.week.words)return;
    $$(".wordRow").forEach(function(row,i){
      if(row.querySelector(".infoIcon")) return;
      const word=state.week.words[i]; if(!word)return;
      const icon=document.createElement("span");
      icon.className="infoIcon";
      icon.textContent="ⓘ";
      icon.setAttribute("aria-label","Meaning and example for "+word.word);
      icon.onclick=function(e){
        e.stopPropagation();
        openModal(
          '<p class="eyebrow">WORD HELP</p>'+
          '<h2 id="learningModalTitle">'+word.word+'</h2>'+
          '<p class="modalDefinition"><strong>Meaning:</strong> '+word.definition+'.</p>'+
          '<div class="exampleCard"><span>Example</span><p>'+word.example+'</p></div>'+
          '<div class="exampleCard personal"><span>Sai example</span><p>'+(englishPersonalExamples[word.word]||word.example)+'</p></div>'+
          '<p class="modalTip"><strong>Spelling link:</strong> '+word.singular+' → '+word.word+' ('+word.rule+')</p>'
        );
      };
      row.children[1].appendChild(icon);
    });
  }

  function addDogPluralVisual(){
    const ruleGrid=document.querySelector("#rule .ruleGrid");
    if(!ruleGrid||document.querySelector(".pluralVisual"))return;
    ruleGrid.insertAdjacentHTML("beforebegin",
      '<div class="pluralVisual">'+
        '<div class="pluralPicture"><div class="dogPictures">🐶</div><strong>one dog</strong><span>singular = one</span></div>'+
        '<div class="pluralArrow">→ add <b>s</b> →</div>'+
        '<div class="pluralPicture"><div class="dogPictures">🐶 🐶 🐶</div><strong>three dogs</strong><span>plural = more than one</span></div>'+
      '</div>'
    );
  }

  const nounStages=[
    {title:"1 · Pictures + words",instruction:"Select the cards that name a person, place, animal or thing.",picture:true,items:[
      {visual:"🐶",text:"dog",noun:true},{visual:"⛵",text:"boat",noun:true},{visual:"🏃",text:"to run",noun:false},{visual:"😊",text:"happy",noun:false}
    ]},
    {title:"2 · Words only",instruction:"Now the pictures have gone. Select only the nouns.",picture:false,items:[
      {text:"dog",noun:true},{text:"boat",noun:true},{text:"to run",noun:false},{text:"happy",noun:false}
    ]},
    {title:"3 · New words",instruction:"Select only the noun phrases.",picture:false,items:[
      {text:"the garden",noun:true},{text:"carefully",noun:false},{text:"a bird",noun:true},{text:"because",noun:false},
      {text:"the bassoon",noun:true},{text:"very",noun:false},{text:"a school",noun:true},{text:"excited",noun:false}
    ]}
  ];
  let nounStage=0;

  function openNounLesson(){
    nounStage=0;
    openModal(
      '<p class="eyebrow">GRAMMAR REFRESHER</p>'+
      '<h2 id="learningModalTitle"><span class="termHighlight">noun</span></h2>'+
      '<p class="modalDefinition">A <strong>noun</strong> is a naming word. It names a <strong>person, place, animal, thing or idea</strong>.</p>'+
      '<div class="nounExamples"><span>Sai</span><span>garden</span><span>robin</span><span>bassoon</span><span>friendship</span></div>'+
      '<p class="modalTip">A word can sometimes do different jobs in different sentences, so the words around it matter. This quick test starts with very clear examples.</p>'+
      '<div id="nounQuiz"></div>'
    );
    renderNounStage();
  }
  function renderNounStage(){
    const s=nounStages[nounStage];
    const cards=s.items.map(function(x,i){
      return '<button class="nounChoice" data-index="'+i+'">'+
        (s.picture?'<span class="nounVisual">'+x.visual+'</span>':'')+
        '<span>'+x.text+'</span></button>';
    }).join("");
    document.getElementById("nounQuiz").innerHTML=
      '<div class="nounQuizHead"><strong>'+s.title+'</strong><p>'+s.instruction+'</p></div>'+
      '<div class="nounChoices">'+cards+'</div>'+
      '<button class="primary" id="checkNouns">Check</button>'+
      '<p id="nounFeedback" class="feedback"></p>';
    $$(".nounChoice").forEach(function(b){b.onclick=function(){b.classList.toggle("selected");};});
    $("#checkNouns").onclick=function(){
      let all=true;
      $$(".nounChoice").forEach(function(b){
        const item=s.items[+b.dataset.index],selected=b.classList.contains("selected");
        const correct=selected===item.noun;
        if(!correct)all=false;
        b.classList.add(correct?"choiceRight":"choiceWrong");
        b.disabled=true;
      });
      $("#nounFeedback").textContent=all?"Correct ✓ You selected the naming words.":"Look again: nouns name people, places, animals, things or ideas.";
      $("#nounFeedback").className="feedback "+(all?"good":"try");
      $("#checkNouns").textContent=nounStage<nounStages.length-1?"Next level":"Done";
      $("#checkNouns").onclick=function(){
        if(nounStage<nounStages.length-1){nounStage++;renderNounStage();}else closeModal();
      };
    };
  }

  function makeNounClickable(){
    $$("#rule .ruleCard p").forEach(function(p){
      if(p.querySelector(".glossaryTerm"))return;
      p.innerHTML=p.innerHTML.replace(/\bnouns?\b/gi,function(m){
        return '<button class="glossaryTerm" data-glossary="noun">'+m+'</button>';
      });
    });
    $$('[data-glossary="noun"]').forEach(function(b){b.onclick=openNounLesson;});
  }

  function frenchExample(term,meaning,group){
    const forms=term.split(" / "),first=forms[0],second=forms[1]||forms[0];
    if(group.indexOf("bird")>=0)return {fr:"Aujourd’hui, j’ai vu "+first+" dans le jardin.",en:"Today, I saw "+meaning+" in the garden."};
    if(group.indexOf("animal")>=0||group.indexOf("pet")>=0)return {fr:"J’ai vu "+first+".",en:"I saw "+meaning+"."};
    if(group.indexOf("colour")>=0||group.indexOf("Rainbow")>=0)return {fr:"un bateau "+first+" · une voile "+second,en:"a "+meaning+" boat · a "+meaning+" sail"};
    if(group.indexOf("Description")>=0)return {fr:"Le chien est "+first+". La souris est "+second+".",en:"The dog is "+meaning+". The mouse is "+meaning+"."};
    return {fr:first,en:meaning};
  }
  function frenchGrammar(term,group){
    if(/^un\s/.test(term))return "This noun is grammatically masculine. Learn the word together with un.";
    if(/^une\s/.test(term))return "This noun is grammatically feminine. Learn the word together with une.";
    if(term.indexOf(" / ")>=0)return "The two forms show masculine / feminine adjective agreement.";
    if(group.indexOf("colour")>=0||group.indexOf("Rainbow")>=0)return "This colour keeps the same written form here, or is normally invariable as a colour adjective.";
    return "Learn this as a complete chunk and notice how it behaves inside a sentence.";
  }

  function addFrenchWordInfo(){
    if(!state.week||state.week.subjectKey!=="french")return;
    $$(".vocabGroup").forEach(function(groupEl){
      const h=groupEl.querySelector("h4"),group=h?h.textContent:"French";
      groupEl.querySelectorAll(".wordButton").forEach(function(btn){
        if(btn.querySelector(".infoIcon"))return;
        const strong=btn.querySelector("strong"),small=btn.querySelector("small");
        if(!strong||!small)return;
        const term=strong.textContent,meaning=small.textContent;
        const icon=document.createElement("span");
        icon.className="infoIcon"; icon.textContent="ⓘ";
        icon.setAttribute("aria-label","Meaning and example for "+term);
        icon.onclick=function(e){
          e.stopPropagation();
          const ex=frenchExample(term,meaning,group);
          openModal(
            '<p class="eyebrow">'+group.toUpperCase()+'</p>'+
            '<h2 id="learningModalTitle">'+term+'</h2>'+
            '<p class="modalDefinition"><strong>Meaning:</strong> '+meaning+'</p>'+
            '<p class="modalTip">'+frenchGrammar(term,group)+'</p>'+
            '<div class="exampleCard personal"><span>Example for Sai</span><p class="exampleFrench">'+ex.fr+'</p><p>'+ex.en+'</p><button class="tiny infoSpeak" data-speak="'+encodeURIComponent(ex.fr)+'">🔊 Hear example</button></div>'
          );
          const sb=document.querySelector(".infoSpeak");
          if(sb)sb.onclick=function(){speak(decodeURIComponent(sb.dataset.speak),"fr-FR");};
        };
        btn.appendChild(icon);
      });
    });
  }

  const previousEnglish=window.renderEnglish;
  window.renderEnglish=function(){
    previousEnglish();
    addDogPluralVisual();
    makeNounClickable();
    addEnglishWordInfo();
  };

  const previousFrench=window.renderFrench;
  window.renderFrench=function(){
    previousFrench();
    addFrenchWordInfo();
  };
})();