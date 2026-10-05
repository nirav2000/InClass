(function(){
'use strict';

const previousFrench=window.renderFrench;

function getById(list,id){return list.find(function(x){return x.id===id;});}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function escapeHtml(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
function englishConnector(fr){return fr==='et'?'and':'but';}
function audioButton(text,label){
  return '<button type="button" class="inlineSpeak" data-say="'+encodeURIComponent(text)+'" aria-label="'+(label||'Hear French pronunciation')+'">🔊</button>';
}
function personalSentenceHtml(x){
  let html=escapeHtml(x.fr), cursor=0, raw=x.fr, out='';
  (x.verbs||[]).forEach(function(v){
    const idx=raw.indexOf(v.surface,cursor);
    if(idx<0)return;
    out+=escapeHtml(raw.slice(cursor,idx));
    out+='<button type="button" class="verbExplain" data-verb="'+escapeHtml(v.key)+'" data-surface="'+encodeURIComponent(v.surface)+'">'+escapeHtml(v.surface)+'</button>';
    cursor=idx+v.surface.length;
  });
  out+=escapeHtml(raw.slice(cursor));
  return out;
}

function opinionSentence(w,p){
  const firstOpinion=getById(w.opinions,p.first.opinion),firstAnimal=getById(w.opinionAnimals,p.first.animal);
  const secondOpinion=getById(w.opinions,p.second.opinion),secondAnimal=getById(w.opinionAnimals,p.second.animal);
  const connector=p.connector||'mais';
  const second=secondOpinion.fr.charAt(0).toLowerCase()+secondOpinion.fr.slice(1);
  return {
    fr:"Je m’appelle "+p.name+". "+firstOpinion.fr+" "+firstAnimal.fr+" "+connector+" "+second+" "+secondAnimal.fr+".",
    en:"My name is "+p.name+". "+firstOpinion.en+" "+firstAnimal.en+" "+englishConnector(connector)+" "+secondOpinion.en.toLowerCase()+" "+secondAnimal.en+".",
    firstOpinion,firstAnimal,secondOpinion,secondAnimal,connector
  };
}

function personPortrait(p){
  const tones={chantal:'#e5b56e',ahmed:'#b9825b',ethan:'#5e3b2b',sophie:'#f0c7a8'};
  const hair={chantal:'#7a4b24',ahmed:'#151515',ethan:'#21140f',sophie:'#c79652'};
  const shirt={chantal:'#e84d7a',ahmed:'#384d8d',ethan:'#5d8f6e',sophie:'#f2688d'};
  const tone=tones[p.id]||'#d7aa80',h=hair[p.id]||'#55331e',sh=shirt[p.id]||'#527aa6';
  return '<svg class="personPortraitSvg" viewBox="0 0 160 190" role="img" aria-label="Illustrated portrait of '+p.name+'">'+
    '<rect width="160" height="190" rx="24" fill="#fff"/>'+
    '<circle cx="80" cy="74" r="42" fill="'+tone+'"/>'+
    '<path d="M37 70c2-36 24-53 44-53 29 0 48 22 44 55-13-11-24-16-43-16-18 0-30 5-45 14Z" fill="'+h+'"/>'+
    '<circle cx="64" cy="76" r="3.5" fill="#172b3a"/><circle cx="96" cy="76" r="3.5" fill="#172b3a"/>'+
    '<path d="M67 95c8 6 18 6 26 0" fill="none" stroke="#9c5f54" stroke-width="3" stroke-linecap="round"/>'+
    '<path d="M28 190c3-39 22-61 52-61s49 22 52 61Z" fill="'+sh+'"/>'+
    '<text x="80" y="178" text-anchor="middle" font-size="18" font-weight="700" fill="#fff">'+p.name+'</text>'+
  '</svg>';
}
function animalPicture(a){return '<span class="animalEmoji">'+(a.emoji||'🐾')+'</span>';}
function clueCard(w,p,compact){
  const s=opinionSentence(w,p);
  return '<div class="opinionWorksheetCard '+(compact?'isCompact':'')+'" data-person="'+p.id+'">'+
    '<div class="worksheetPerson">'+personPortrait(p)+'</div>'+
    '<div class="worksheetClues">'+
      '<div class="worksheetOpinionBlock"><div class="worksheetOpinionSymbol">'+s.firstOpinion.symbol+'</div><div class="worksheetAnimalPicture">'+animalPicture(s.firstAnimal)+'</div></div>'+
      '<div class="worksheetConnector">'+(p.connector==='et'?'ET':'MAIS')+'</div>'+
      '<div class="worksheetOpinionBlock"><div class="worksheetOpinionSymbol">'+s.secondOpinion.symbol+'</div><div class="worksheetAnimalPicture">'+animalPicture(s.secondAnimal)+'</div></div>'+
    '</div>'+
    (p.ambiguity?'<div class="worksheetNote"><strong>Source discrepancy</strong><span>The worked example prints “je déteste les oiseaux”, but the pictured animal is a goldfish. The reference sheet supports <em>les poissons rouges</em>.</span></div>':'')+
  '</div>';
}

function sourceButtons(w){
  return '<div class="sourceSheetBar"><strong>School source sheets</strong>'+
    w.sourceSheets.map(function(s){return '<button class="secondary sourceSheetButton" data-source-sheet="'+s.id+'">View '+escapeHtml(s.title)+'</button>';}).join('')+
    '<small>Use these whenever you want to check that InClass still matches the work actually set.</small></div>';
}
async function openSourceSheet(w,id){
  const s=w.sourceSheets.find(function(x){return x.id===id;});
  if(!s)return;
  const dialog=document.getElementById('sourceSheetDialog'),img=document.getElementById('sourceSheetImage'),title=document.getElementById('sourceSheetTitle'),status=document.getElementById('sourceSheetStatus');
  title.textContent=s.title;img.removeAttribute('src');status.textContent='Loading original school sheet…';
  if(dialog.showModal)dialog.showModal();else dialog.setAttribute('open','');
  try{
    const parts=await Promise.all(s.parts.map(function(path){return fetch(path).then(function(r){if(!r.ok)throw new Error('Could not load source sheet');return r.text();});}));
    img.src='data:'+s.mime+';base64,'+parts.join('').replace(/\s+/g,'');
    img.onload=function(){status.textContent='';};
  }catch(e){status.textContent='The stored source sheet could not be loaded.';}
}

function renderOpinions(){
  const w=state.week;
  setNav([
    ['frBridge','Bridge'],
    ['frOpinions','Opinions'],
    ['frNegation','Don’t / ne…pas'],
    ['frBuild','Build'],
    ['frFluency','Fluency'],
    ['frWrite','Homework ready'],
    ['frExplore','Extend']
  ]);

  const opinionLadder=w.opinions.map(function(x){
    return '<button class="opinionLadderRow wordButton" data-audio="'+encodeURIComponent(x.fr)+'" data-opinion="'+x.id+'"><span class="opinionLadderSymbol">'+x.symbol+'</span><span><strong>'+x.display+'</strong><small>'+x.en+'</small></span><span class="speakerHint">🔊</span></button>';
  }).join('');

  const animalWords=w.opinionAnimals.map(function(x){
    return '<button class="animalRecallButton revealWord" type="button" data-audio="'+encodeURIComponent(x.fr)+'" data-meaning="'+escapeHtml(x.en)+'"><span class="animalEmojiSmall">'+x.emoji+'</span><strong>'+x.fr+'</strong><small class="revealMeaning">Tap to reveal English</small><span class="speakerHint">🔊</span></button>';
  }).join('');

  const bridgeRows=w.priorKnowledge.bridge.map(function(x){
    return '<div class="bridgeRow"><span class="bridgeOld">'+x.before+' '+audioButton(x.before)+'</span><span class="bridgeArrow">→</span><span class="bridgeNew">'+x.after+' '+audioButton(x.after)+'</span></div>';
  }).join('');

  $("#lessonRoot").innerHTML=
    sourceButtons(w)+
    '<dialog id="sourceSheetDialog" class="sourceSheetDialog"><div class="sourceSheetDialogHead"><h3 id="sourceSheetTitle">Source sheet</h3><button class="secondary" id="closeSourceSheet">Close</button></div><p id="sourceSheetStatus" class="tip"></p><img id="sourceSheetImage" alt="Original school worksheet"></dialog>'+
    '<dialog id="verbDialog" class="verbDialog"><div class="sourceSheetDialogHead"><div><p class="eyebrow">VERB EXPLORER</p><h3 id="verbDialogTitle"></h3></div><button class="secondary" id="closeVerbDialog">Close</button></div><div id="verbDialogBody"></div></dialog>'+
    panel("frBridge",1,"Connect this to what you already know",
      '<div class="requiredFlag">BUILD ON LAST WEEK</div>'+
      '<div class="lessonThesis"><strong>The new idea:</strong> last week you described <em>one</em> animal. This week you give an opinion about animals <em>in general</em>.</div>'+
      '<div class="bridgeGrid">'+bridgeRows+'</div>'+
      '<div class="grammarSpotlight"><div class="grammarSpotlightWord">les</div><div><h4><em>les</em> means <strong>“the”</strong></h4><p>A <strong>definite article</strong> is a small word that comes before a noun and points to a definite thing or group. English mainly uses one: <strong>the</strong>.</p><p>French changes “the” depending on the noun: <strong>le</strong> = masculine singular, <strong>la</strong> = feminine singular, <strong>l’</strong> = singular before a vowel sound, and <strong>les</strong> = plural for <em>both</em> masculine and feminine nouns.</p><p>So <strong>J’aime les chiens</strong> literally contains “the dogs”, but natural English is <strong>“I like dogs.”</strong> French normally keeps the definite article when talking about a whole category.</p></div></div>'+
      '<div class="articleGrid"><div><strong>le</strong><span>the · masculine singular</span></div><div><strong>la</strong><span>the · feminine singular</span></div><div><strong>l’</strong><span>the · singular before vowel/silent h</span></div><div><strong>les</strong><span>the · all plurals</span></div></div>'+
      '<div class="miniRule"><strong>Fast rule</strong><span>Opinion + <b>les</b> + plural animal: <span class="speakable">J’adore les chats. '+audioButton("J’adore les chats.")+'</span> <span class="speakable">Je déteste les souris. '+audioButton("Je déteste les souris.")+'</span></span></div>'+
      '<div class="challengeStrip"><strong>Notice the spelling</strong><span>un oiseau → <b>les oiseaux</b> · un cheval → <b>les chevaux</b> · un poisson rouge → <b>les poissons rouges</b></span></div>'
    )+
    panel("frOpinions",2,"Make the opinion symbols automatic",
      '<div class="requiredFlag">CORE VOCABULARY</div>'+
      '<p class="tip">This is the school’s own opinion key. Tap each row to hear it. The aim is to see the symbol and know the French without translating through English.</p>'+
      '<div class="miniRule"><strong>About “beaucoup” on the school sheet</strong><span><strong>beaucoup</strong> means <strong>“a lot”</strong>. The sheet puts it in brackets after <em>J’aime</em> and <em>Je n’aime pas</em>, so it is optional here. Learn the core phrases first: <strong>J’aime</strong> and <strong>Je n’aime pas</strong>.</span></div>'+
      '<div class="opinionLadder">'+opinionLadder+'</div>'+
      '<div class="quickCheckCard"><div><p class="eyebrow">5-SECOND RECALL</p><h4 id="opinionPrompt">❤️❤️</h4><p id="opinionPromptHelp">Say the French aloud before revealing it.</p></div><button class="primary" id="revealOpinion">Reveal</button><button class="secondary" id="nextOpinion">Next</button><strong id="opinionReveal"></strong></div>'
    )+
    panel("frNegation",3,"How French says “don’t”: ne … pas",
      '<div class="requiredFlag">NEW GRAMMAR</div>'+
      '<div class="lessonThesis"><strong>French wraps the verb in two parts:</strong> <em>ne</em> comes before the verb and <em>pas</em> comes after it.</div>'+
      '<div class="negationEquation"><span>Je</span><span class="negPart">n’</span><span>aime</span><span class="negPart">pas</span><span>les chiens.</span>'+audioButton("Je n’aime pas les chiens.")+'</div>'+
      '<p class="tip">Because <strong>aime</strong> starts with a vowel sound, <strong>ne</strong> shortens to <strong>n’</strong>: <strong>ne + aime → n’aime</strong>. So <strong>Je n’aime pas</strong> means <strong>I don’t like</strong>.</p>'+
      '<div class="miniRule"><strong>Pattern</strong><span>positive: <b>J’aime les chats.</b> '+audioButton("J’aime les chats.")+' → negative: <b>Je n’aime pas les chats.</b> '+audioButton("Je n’aime pas les chats.")+'</span></div>'+
      '<div class="negationPractice"><label>Make this negative<select id="negationAnimal"></select></label><div id="negationPrompt" class="bigWord"></div><button class="primary" id="checkNegation">Reveal negative</button><div id="negationAnswer" class="feedback"></div></div>'
    )+
    panel("frBuild",4,"Turn meaning into a French sentence",
      '<div class="requiredFlag">THE CORE SKILL</div>'+
      '<p class="tip">Do not translate word by word. Think in four reusable chunks: <strong>name → opinion → les + animal → connector → opinion → les + animal</strong>.</p>'+
      '<label class="wideLabel">Person<select id="opinionPerson"></select></label>'+
      '<div id="buildClue"></div>'+
      '<div class="sentenceMachine">'+
        '<div class="sentenceMachineRow"><span class="sentenceChunk fixed">Je m’appelle <b id="machineName"></b>.</span></div>'+
        '<div class="sentenceMachineRow"><select id="machineOpinion1"></select><select id="machineAnimal1"></select><select id="machineConnector"></select><select id="machineOpinion2"></select><select id="machineAnimal2"></select></div>'+
        '<div class="row"><button class="primary" id="checkMachine">Check sentence</button><button class="secondary" id="showMachineAnswer">Show model</button></div>'+
        '<p id="machineFeedback" class="feedback"></p><p id="machineModel" class="bigWord"></p>'+
      '</div>'+
      '<div class="miniRule"><strong>Connector meaning</strong><span><b>et</b> = and. <b>mais</b> = but. Choose by the relationship between the ideas, not by a memorised position.</span></div>'
    )+
    panel("frFluency",5,"Build speed: see it → say it",
      '<div class="requiredFlag">AUTOMATICITY</div>'+
      '<p class="tip">This is the quickest route to making the homework feel easy. Look at the cue and try to say the French phrase before pressing reveal.</p>'+
      '<div class="fluencyCard"><div id="fluencyCue" class="fluencyCue"></div><p id="fluencyInstruction">Say the opinion + animal in French.</p><strong id="fluencyAnswer" class="fluencyAnswer"></strong><div class="row"><button class="primary" id="fluencyReveal">Reveal</button><button class="secondary" id="fluencyNext">Next cue</button><button class="secondary" id="fluencyHear">🔊 Hear</button></div></div>'+
      '<div class="vocabGroup"><div class="vocabGroupTitle"><h4>Animal bank</h4><span class="homeworkBadge">previous + new</span></div><div class="wordList">'+animalWords+'</div></div>'
    )+
    panel("frWrite",6,"Homework-ready rehearsal",
      '<div class="requiredFlag">SCHOOL TASK</div>'+
      '<p class="tip">Now do what the worksheet asks, but after the teaching rather than before it. Use the source sheet if you genuinely need it; aim to need it less each time.</p>'+
      '<label class="wideLabel">Person<select id="writePerson"></select></label>'+
      '<div id="writeClue"></div>'+
      '<textarea id="writeAnswer" rows="4" spellcheck="false" placeholder="Je m’appelle …"></textarea>'+
      '<div class="row"><button class="primary" id="checkWrite">Check my sentence</button><button class="secondary sourceSheetButton" data-source-sheet="opinions">View Les opinions</button><button class="secondary" id="revealWrite">Reveal model</button></div>'+
      '<p id="writeFeedback" class="feedback"></p><div id="writeChecklist" class="grammarGrid"></div>'
    )+
    panel("frExplore",7,"Extend towards real French",
      '<p class="tip">These are not required for this week’s homework. They turn the same language into something personal and reusable—the direction we want for long-term fluency.</p>'+
      '<div class="grammarGrid">'+
        '<div class="grammarCard"><strong>Make it true about you</strong><p>Choose two animals and give your real opinions without a person card: <em>J’adore les chiens mais je n’aime pas les souris.</em> '+audioButton("J’adore les chiens mais je n’aime pas les souris.")+'</p></div>'+
        '<div class="grammarCard"><strong>Use the new verb</strong><p><em>Je préfère</em> means “I prefer”. Stretch: <strong>Je préfère les chats aux chiens.</strong> '+audioButton("Je préfère les chats aux chiens.")+'</p></div>'+
        '<div class="grammarCard"><strong>Add a reason</strong><p>GCSE runway: <strong>parce que</strong> = because. Example: <em>J’aime les chiens parce qu’ils sont intelligents.</em> '+audioButton("J’aime les chiens parce qu’ils sont intelligents.")+'</p></div>'+
        '<div class="grammarCard"><strong>Listen → speak → write</strong><p>Use the pronunciation activity below to make a correct sentence sound familiar before writing it from memory.</p></div>'+
      '</div>'+
      '<div class="personalFrench"><p class="eyebrow">MAKE FRENCH ABOUT SAI</p><h4>Things you might genuinely have an opinion about</h4><p class="tip">Tap the English reveal if needed. Tap any <strong>underlined verb</strong> to see what it means, its infinitive and the present-tense forms.</p><div class="personalInterestGrid">'+w.personalInterests.map(function(x){return '<div class="personalInterestCard" data-audio="'+encodeURIComponent(x.fr)+'" data-meaning="'+escapeHtml(x.en)+'"><span>'+x.emoji+'</span><strong class="personalSentence">'+personalSentenceHtml(x)+'</strong><button class="personalMeaning" type="button">Tap for English</button><button class="personalSpeak" type="button" aria-label="Hear sentence">🔊</button></div>';}).join('')+'</div></div>'+
      '<details class="optionalBlock"><summary><span>Source note</span><small>Why Chantal looks inconsistent</small></summary><div class="optionalBody"><p>'+escapeHtml(w.sourceNote)+'</p></div></details>'
    );

  setupOpinions();
}

function openVerbDialog(w,key,surface){
  const v=w.verbReference&&w.verbReference[key];
  if(!v)return;
  const d=$("#verbDialog"),title=$("#verbDialogTitle"),body=$("#verbDialogBody");
  title.textContent=(surface||v.infinitive)+" → "+v.infinitive;
  body.innerHTML=
    '<div class="verbMeaning"><strong>'+escapeHtml(v.infinitive)+'</strong><span>'+escapeHtml(v.en)+'</span><small>'+escapeHtml(v.type)+'</small></div>'+
    '<div class="miniRule"><strong>Infinitive</strong><span>The <strong>infinitive</strong> is the dictionary form of a verb — the unconjugated “to …” form, such as <em>'+escapeHtml(v.en)+'</em>.</span></div>'+
    '<div class="verbForms">'+v.forms.map(function(row){return '<button type="button" class="verbFormSpeak" data-say="'+encodeURIComponent(row[0])+'"><strong>'+escapeHtml(row[0])+'</strong><span>'+escapeHtml(row[1])+'</span><b>🔊</b></button>';}).join('')+'</div>'+
    '<p class="tip">'+escapeHtml(v.note||'')+'</p>';
  Array.from(body.querySelectorAll(".verbFormSpeak")).forEach(function(b){b.onclick=function(){speak(decodeURIComponent(b.dataset.say),"fr-FR");};});
  if(d.showModal)d.showModal();else d.setAttribute("open","");
}
function bindInlineAudio(){
  Array.from(document.querySelectorAll(".inlineSpeak")).forEach(function(b){
    if(b.dataset.bound)return;
    b.dataset.bound="1";
    b.onclick=function(e){e.preventDefault();e.stopPropagation();speak(decodeURIComponent(b.dataset.say),"fr-FR");};
  });
}
function setupOpinions(){
  const w=state.week;
  bindInlineAudio();
  Array.from(document.querySelectorAll(".wordButton")).forEach(function(b){b.onclick=function(){speak(decodeURIComponent(b.dataset.audio),"fr-FR");bump("requiredHeard");};});
  Array.from(document.querySelectorAll(".revealWord")).forEach(function(b){b.onclick=function(){
    const m=b.querySelector(".revealMeaning");
    if(m.dataset.revealed==="1"){speak(decodeURIComponent(b.dataset.audio),"fr-FR");return;}
    m.textContent=b.dataset.meaning;m.dataset.revealed="1";
  };});
  Array.from(document.querySelectorAll(".personalInterestCard")).forEach(function(card){
    const meaning=card.querySelector(".personalMeaning"),play=card.querySelector(".personalSpeak");
    meaning.onclick=function(e){
      e.stopPropagation();
      if(meaning.dataset.revealed==="1"){meaning.textContent="Hide English";meaning.dataset.revealed="2";return;}
      if(meaning.dataset.revealed==="2"){meaning.textContent=card.dataset.meaning;meaning.dataset.revealed="1";return;}
      meaning.textContent=card.dataset.meaning;meaning.dataset.revealed="1";
    };
    play.onclick=function(e){e.stopPropagation();speak(decodeURIComponent(card.dataset.audio),"fr-FR");};
  });
  Array.from(document.querySelectorAll(".verbExplain")).forEach(function(b){b.onclick=function(e){e.preventDefault();e.stopPropagation();openVerbDialog(w,b.dataset.verb,decodeURIComponent(b.dataset.surface));};});
  $("#closeVerbDialog").onclick=function(){const d=$("#verbDialog");if(d.close)d.close();else d.removeAttribute("open");};
  $$(".sourceSheetButton").forEach(function(b){b.onclick=function(){openSourceSheet(w,b.dataset.sourceSheet);};});
  $("#closeSourceSheet").onclick=function(){const d=$("#sourceSheetDialog");if(d.close)d.close();else d.removeAttribute('open');};

  function optionHtml(items,labelFn){return items.map(function(x){return '<option value="'+x.id+'">'+labelFn(x)+'</option>';}).join('');}
  const opinionOptions=optionHtml(w.opinions,function(x){return x.symbol+' · '+x.fr;});
  const animalOptions=optionHtml(w.opinionAnimals,function(x){return x.emoji+' · '+x.fr;});
  const peopleOptions=w.people.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('');

  $("#negationAnimal").innerHTML=animalOptions;
  function renderNegation(){
    const a=getById(w.opinionAnimals,$("#negationAnimal").value);
    $("#negationPrompt").textContent="J’aime "+a.fr+".";
    $("#negationAnswer").textContent="";
  }
  $("#negationAnimal").onchange=renderNegation;
  $("#checkNegation").onclick=function(){
    const a=getById(w.opinionAnimals,$("#negationAnimal").value);
    const text="Je n’aime pas "+a.fr+".";
    $("#negationAnswer").innerHTML='<strong>'+text+'</strong> '+audioButton(text);
    bindInlineAudio();
  };
  renderNegation();

  let opinionIndex=0;
  function renderOpinionPrompt(){
    const x=w.opinions[opinionIndex%w.opinions.length];
    $("#opinionPrompt").textContent=x.symbol;$("#opinionReveal").textContent='';$("#opinionPromptHelp").textContent='Say the French aloud before revealing it.';state.current.opinionPrompt=x;
  }
  $("#revealOpinion").onclick=function(){const x=state.current.opinionPrompt;$("#opinionReveal").textContent=x.display+' — '+x.en;speak(x.fr,"fr-FR");};
  $("#nextOpinion").onclick=function(){opinionIndex=(opinionIndex+1)%w.opinions.length;renderOpinionPrompt();};
  renderOpinionPrompt();

  $("#opinionPerson").innerHTML=peopleOptions;
  ["#machineOpinion1","#machineOpinion2"].forEach(function(id){$(id).innerHTML=opinionOptions;});
  ["#machineAnimal1","#machineAnimal2"].forEach(function(id){$(id).innerHTML=animalOptions;});
  $("#machineConnector").innerHTML='<option value="et">et — and</option><option value="mais">mais — but</option>';

  function renderBuild(){
    const p=getById(w.people,$("#opinionPerson").value),s=opinionSentence(w,p);
    $("#buildClue").innerHTML=clueCard(w,p,true);$("#machineName").textContent=p.name;$("#machineFeedback").textContent='';$("#machineModel").textContent='';
    state.current.buildPerson=p;state.current.opinionSentence=s.fr;
    document.dispatchEvent(new CustomEvent("inclass:pronunciation-target",{detail:{text:s.fr,lang:"fr-FR"}}));
  }
  $("#opinionPerson").onchange=renderBuild;
  $("#checkMachine").onclick=function(){
    const p=state.current.buildPerson;
    const ok=$("#machineOpinion1").value===p.first.opinion && $("#machineAnimal1").value===p.first.animal && $("#machineConnector").value===p.connector && $("#machineOpinion2").value===p.second.opinion && $("#machineAnimal2").value===p.second.animal;
    $("#machineFeedback").textContent=ok?'Correct ✓ You built the meaning into French chunks.':'Not yet. Read the picture meaning first, then choose the matching French chunks.';
    $("#machineFeedback").className='feedback '+(ok?'good':'try');
    if(ok)bump("sentencesBuilt");
  };
  $("#showMachineAnswer").onclick=function(){const s=opinionSentence(w,state.current.buildPerson);$("#machineModel").textContent=s.fr;speak(s.fr,"fr-FR");};
  renderBuild();

  let fluencyIndex=0;
  const fluencyPairs=[];
  w.opinions.forEach(function(o){w.opinionAnimals.forEach(function(a){fluencyPairs.push({o,a});});});
  function renderFluency(){
    const x=fluencyPairs[(fluencyIndex*7+3)%fluencyPairs.length];
    state.current.fluency=x;$("#fluencyCue").innerHTML='<span class="fluencySymbol">'+x.o.symbol+'</span><span class="fluencyAnimal">'+x.a.emoji+'</span>';$("#fluencyAnswer").textContent='';
  }
  $("#fluencyReveal").onclick=function(){const x=state.current.fluency;$("#fluencyAnswer").textContent=x.o.fr+' '+x.a.fr+'.';};
  $("#fluencyHear").onclick=function(){const x=state.current.fluency;speak(x.o.fr+' '+x.a.fr,"fr-FR");bump("requiredHeard");};
  $("#fluencyNext").onclick=function(){fluencyIndex++;renderFluency();bump("fluencyAttempts");};
  renderFluency();

  $("#writePerson").innerHTML=peopleOptions;
  function renderWrite(){
    const p=getById(w.people,$("#writePerson").value);
    $("#writeClue").innerHTML=clueCard(w,p,true);$("#writeAnswer").value='';$("#writeFeedback").textContent='';$("#writeChecklist").innerHTML='';state.current.writePerson=p;
  }
  $("#writePerson").onchange=renderWrite;
  $("#revealWrite").onclick=function(){const s=opinionSentence(w,state.current.writePerson);$("#writeFeedback").textContent=s.fr;$("#writeFeedback").className="feedback try";};
  $("#checkWrite").onclick=function(){
    const p=state.current.writePerson,s=opinionSentence(w,p),answer=norm($("#writeAnswer").value);
    const checks=[
      ["Je m’appelle + "+p.name,answer.indexOf(norm("Je m’appelle "+p.name))>=0],
      [s.firstOpinion.fr+" "+s.firstAnimal.fr,answer.indexOf(norm(s.firstOpinion.fr))>=0&&answer.indexOf(norm(s.firstAnimal.fr))>=0],
      [p.connector+" = "+englishConnector(p.connector),answer.indexOf(norm(p.connector))>=0],
      [s.secondOpinion.fr+" "+s.secondAnimal.fr,answer.indexOf(norm(s.secondOpinion.fr))>=0&&answer.indexOf(norm(s.secondAnimal.fr))>=0]
    ];
    const ok=checks.every(function(x){return x[1];});
    $("#writeChecklist").innerHTML=checks.map(function(x){return '<div class="grammarCard"><strong>'+(x[1]?'✓ ':'○ ')+escapeHtml(x[0])+'</strong></div>';}).join('');
    $("#writeFeedback").textContent=ok?'Homework ready ✓ You produced the whole sentence from the visual clues.':'Nearly there. Fix the missing chunk rather than rewriting everything.';
    $("#writeFeedback").className='feedback '+(ok?'good':'try');
    recordLearningAttempt("independent-writing",p.name,ok,{scope:"required",response:answer});
    if(ok)bump("independentCorrect");
  };
  renderWrite();
}

window.renderFrench=function(){
  if(state.week&&state.week.opinionsHomework)return renderOpinions();
  return previousFrench();
};
})();