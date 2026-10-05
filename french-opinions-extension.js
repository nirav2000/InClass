(function(){
'use strict';

const previousFrench=window.renderFrench;

function getById(list,id){return list.find(function(x){return x.id===id;});}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):s;}
function opinionSentence(w,p){
  const firstOpinion=getById(w.opinions,p.first.opinion),firstAnimal=getById(w.opinionAnimals,p.first.animal);
  const secondOpinion=getById(w.opinions,p.second.opinion),secondAnimal=getById(w.opinionAnimals,p.second.animal);
  const connector=p.connector||'mais';
  const second=secondOpinion.fr.charAt(0).toLowerCase()+secondOpinion.fr.slice(1);
  return {
    fr:"Je m’appelle "+p.name+". "+firstOpinion.fr+" "+firstAnimal.fr+" "+connector+" "+second+" "+secondAnimal.fr+".",
    en:"My name is "+p.name+". "+firstOpinion.en+" "+firstAnimal.en+" "+connector+" "+secondOpinion.en.toLowerCase()+" "+secondAnimal.en+".",
    firstOpinion:firstOpinion,firstAnimal:firstAnimal,secondOpinion:secondOpinion,secondAnimal:secondAnimal
  };
}
function clueCard(w,p,compact){
  const s=opinionSentence(w,p);
  return '<div class="practiceCard opinionPersonCard" data-person="'+p.id+'">'+
    '<div class="sectionHead"><div><p class="eyebrow">'+(compact?'PICTURE CLUES':'DECODE THE CLUES')+'</p><h4>'+p.name+'</h4></div><span class="homeworkBadge">school</span></div>'+
    '<div class="opinionClues">'+
      '<div class="opinionClue"><span class="opinionSymbol">'+s.firstOpinion.symbol+'</span><span class="opinionAnimal">'+s.firstAnimal.emoji+'</span><small>'+s.firstAnimal.en+'</small></div>'+
      '<div class="opinionConnector">'+(p.connector==='et'?'ET':'MAIS')+'</div>'+
      '<div class="opinionClue"><span class="opinionSymbol">'+s.secondOpinion.symbol+'</span><span class="opinionAnimal">'+s.secondAnimal.emoji+'</span><small>'+s.secondAnimal.en+'</small></div>'+
    '</div>'+
    (p.ambiguity?'<p class="feedback try"><strong>Worksheet ambiguity:</strong> the printed Chantal example says “je déteste les oiseaux”, but the crossed-heart picture is beside a fish. This practice follows the pictured fish clue.</p>':'')+
  '</div>';
}

function renderOpinions(){
  const w=state.week;
  setNav([
    ['frDecode','Decode'],
    ['frLearn','School words'],
    ['frBuild','Build'],
    ['frWrite','Write'],
    ['frExplore','Understand']
  ]);

  const opinionWords=w.opinions.map(function(x){
    return '<button class="wordButton" data-audio="'+encodeURIComponent(x.fr)+'"><strong>'+x.fr+'</strong><small>'+x.symbol+' · '+x.en+'</small></button>';
  }).join('');
  const animalWords=w.opinionAnimals.map(function(x){
    return '<button class="wordButton" data-audio="'+encodeURIComponent(x.fr)+'"><strong>'+x.fr+'</strong><small>'+x.emoji+' · '+x.en+'</small></button>';
  }).join('');
  const frames=[
    {fr:"Je m’appelle",en:"my name is"},
    {fr:"et",en:"and"},
    {fr:"mais",en:"but"}
  ].map(function(x){return '<button class="wordButton" data-audio="'+encodeURIComponent(x.fr)+'"><strong>'+x.fr+'</strong><small>'+x.en+'</small></button>';}).join('');

  $("#lessonRoot").innerHTML=
    panel("frDecode",1,"Decode the picture clues",
      '<div class="requiredFlag">SCHOOL HOMEWORK</div>'+
      '<p class="tip">Start with what the picture means. Identify the person, the opinion and the animal before trying to write the French.</p>'+
      '<div id="decodeCard"></div>'+
      '<div class="builder opinionBuilder"><label>First opinion<select id="decodeOpinion1"></select></label><label>First animal<select id="decodeAnimal1"></select></label><label>Second opinion<select id="decodeOpinion2"></select></label><label>Second animal<select id="decodeAnimal2"></select></label></div>'+
      '<div class="row"><button class="primary" id="checkDecode">Check clues</button><button class="secondary" id="nextDecode">Another person</button></div>'+
      '<p id="decodeFeedback" class="feedback"></p>'
    )+
    panel("frLearn",2,"School words",
      '<div class="requiredFlag">WORDS NEEDED FOR THIS SHEET</div>'+
      '<p class="tip">Tap any French item to hear it.</p>'+
      '<div class="vocabGroups">'+
        '<div class="vocabGroup"><div class="vocabGroupTitle"><h4>Opinions</h4><span class="homeworkBadge">school</span></div><div class="wordList">'+opinionWords+'</div></div>'+
        '<div class="vocabGroup"><div class="vocabGroupTitle"><h4>Animals</h4><span class="homeworkBadge">school</span></div><div class="wordList">'+animalWords+'</div></div>'+
        '<div class="vocabGroup"><div class="vocabGroupTitle"><h4>Sentence frame</h4><span class="homeworkBadge">school</span></div><div class="wordList">'+frames+'</div></div>'+
      '</div>'
    )+
    panel("frBuild",3,"Build the school sentence",
      '<div class="requiredFlag">SCHOOL FORMAT</div>'+
      '<p class="tip">Like the example: start with <strong>Je m’appelle</strong> + the person’s name, then give both animal opinions and join them with <strong>et</strong> or <strong>mais</strong>.</p>'+
      '<label class="wideLabel">Person<select id="opinionPerson"></select></label>'+
      '<div id="buildClue"></div>'+
      '<div class="sentenceCard"><p id="builtFrench" class="bigWord"></p><p id="builtEnglish" class="meaning"></p><div class="row"><button class="primary" id="hearFrenchSentence">🔊 Hear model</button><button class="secondary" id="hideBuiltSentence">Hide sentence</button></div></div>'+
      '<div class="miniRule"><strong>Pattern</strong><span>Je m’appelle + name. Opinion + les + animal + et/mais + opinion + les + animal.</span></div>'
    )+
    panel("frWrite",4,"Write it independently",
      '<div class="requiredFlag">HOMEWORK READINESS</div>'+
      '<p class="tip">Use the picture clues only. Write the two school sentences yourself before revealing the model answer.</p>'+
      '<label class="wideLabel">Person<select id="writePerson"></select></label>'+
      '<div id="writeClue"></div>'+
      '<textarea id="writeAnswer" rows="4" spellcheck="false" placeholder="Je m’appelle …"></textarea>'+
      '<div class="row"><button class="primary" id="checkWrite">Check my sentence</button><button class="secondary" id="revealWrite">Reveal model</button></div>'+
      '<p id="writeFeedback" class="feedback"></p>'+
      '<div id="writeChecklist" class="grammarGrid"></div>'
    )+
    panel("frExplore",5,"Understand why it works",
      '<p class="tip">This explanation sits behind the homework. The school task comes first.</p>'+
      '<div class="grammarGrid">'+
        '<div class="grammarCard"><strong>Why J’adore and J’aime?</strong><p><em>Je</em> loses its final e before a vowel sound: je + adore → <strong>j’adore</strong>; je + aime → <strong>j’aime</strong>.</p></div>'+
        '<div class="grammarCard"><strong>Why les animaux?</strong><p>When French talks about liking or disliking animals in general, it normally uses the definite article: <strong>les chiens, les chats, les oiseaux</strong>.</p></div>'+
        '<div class="grammarCard"><strong>et or mais?</strong><p><strong>et</strong> joins ideas that sit together; <strong>mais</strong> introduces a contrast: “I like dogs <em>but</em> I don’t like fish.”</p></div>'+
        '<div class="grammarCard"><strong>Opinion strength</strong><p><strong>J’adore</strong> is stronger than <strong>J’aime</strong>. <strong>Je n’aime pas</strong> is dislike; <strong>Je déteste</strong> is much stronger.</p></div>'+
      '</div>'+
      '<details class="optionalBlock"><summary><span>Source note</span><small>Worksheet ambiguity</small></summary><div class="optionalBody"><p>'+w.sourceNote+'</p></div></details>'
    );

  setupOpinions();
}

function setupOpinions(){
  const w=state.week;
  $$(".wordButton").forEach(function(b){b.onclick=function(){speak(decodeURIComponent(b.dataset.audio),"fr-FR");bump("requiredHeard");};});

  function optionHtml(items,labelFn){
    return items.map(function(x){return '<option value="'+x.id+'">'+labelFn(x)+'</option>';}).join('');
  }
  const opinionOptions=optionHtml(w.opinions,function(x){return x.symbol+' · '+x.fr;});
  const animalOptions=optionHtml(w.opinionAnimals,function(x){return x.emoji+' · '+x.fr;});
  ["#decodeOpinion1","#decodeOpinion2"].forEach(function(id){$(id).innerHTML=opinionOptions;});
  ["#decodeAnimal1","#decodeAnimal2"].forEach(function(id){$(id).innerHTML=animalOptions;});

  let decodeIndex=0;
  function showDecode(){
    const p=w.people[decodeIndex%w.people.length];
    state.current.decodePerson=p;
    $("#decodeCard").innerHTML=clueCard(w,p,false);
    ["#decodeOpinion1","#decodeOpinion2","#decodeAnimal1","#decodeAnimal2"].forEach(function(id){$(id).value=$(id).options[0].value;});
    $("#decodeFeedback").textContent='';
    $("#decodeFeedback").className='feedback';
  }
  $("#checkDecode").onclick=function(){
    const p=state.current.decodePerson;
    const ok=$("#decodeOpinion1").value===p.first.opinion && $("#decodeAnimal1").value===p.first.animal &&
      $("#decodeOpinion2").value===p.second.opinion && $("#decodeAnimal2").value===p.second.animal;
    $("#decodeFeedback").textContent=ok?"Correct ✓ You decoded the picture before writing the French.":"Not quite. Match each heart symbol to its opinion and each picture to its animal.";
    $("#decodeFeedback").className="feedback "+(ok?"good":"try");
    recordLearningAttempt("decode-opinions",p.name,ok,{scope:"required"});
    if(ok)bump("decodedCorrect");
  };
  $("#nextDecode").onclick=function(){decodeIndex=(decodeIndex+1)%w.people.length;showDecode();};
  showDecode();

  const peopleOptions=w.people.map(function(p){return '<option value="'+p.id+'">'+p.name+'</option>';}).join('');
  $("#opinionPerson").innerHTML=peopleOptions;
  $("#writePerson").innerHTML=peopleOptions;

  let sentenceHidden=false;
  function renderBuild(){
    const p=getById(w.people,$("#opinionPerson").value),s=opinionSentence(w,p);
    $("#buildClue").innerHTML=clueCard(w,p,true);
    $("#builtFrench").textContent=sentenceHidden?"••••••••":s.fr;
    $("#builtEnglish").textContent=s.en;
    state.current.opinionSentence=s.fr;
    document.dispatchEvent(new CustomEvent("inclass:pronunciation-target",{detail:{text:s.fr,lang:"fr-FR"}}));
  }
  $("#opinionPerson").onchange=function(){sentenceHidden=false;$("#hideBuiltSentence").textContent="Hide sentence";renderBuild();};
  $("#hearFrenchSentence").onclick=function(){speak(state.current.opinionSentence,"fr-FR");bump("requiredHeard");};
  $("#hideBuiltSentence").onclick=function(){sentenceHidden=!sentenceHidden;$("#hideBuiltSentence").textContent=sentenceHidden?"Show sentence":"Hide sentence";renderBuild();};
  renderBuild();

  function renderWrite(){
    const p=getById(w.people,$("#writePerson").value);
    $("#writeClue").innerHTML=clueCard(w,p,true);
    $("#writeAnswer").value='';
    $("#writeFeedback").textContent='';
    $("#writeChecklist").innerHTML='';
  }
  $("#writePerson").onchange=renderWrite;
  $("#revealWrite").onclick=function(){
    const p=getById(w.people,$("#writePerson").value),s=opinionSentence(w,p);
    $("#writeFeedback").textContent=s.fr;
    $("#writeFeedback").className="feedback try";
  };
  $("#checkWrite").onclick=function(){
    const p=getById(w.people,$("#writePerson").value),s=opinionSentence(w,p),answer=norm($("#writeAnswer").value);
    const firstStem=norm(s.firstOpinion.fr),firstAnimal=norm(s.firstAnimal.fr),secondStem=norm(s.secondOpinion.fr),secondAnimal=norm(s.secondAnimal.fr);
    const checks=[
      ["Je m’appelle + "+p.name,answer.indexOf(norm("Je m’appelle "+p.name))>=0],
      [s.firstOpinion.fr+" "+s.firstAnimal.fr,answer.indexOf(firstStem)>=0&&answer.indexOf(firstAnimal)>=0],
      [cap(p.connector),answer.indexOf(norm(p.connector))>=0],
      [s.secondOpinion.fr+" "+s.secondAnimal.fr,answer.indexOf(secondStem)>=0&&answer.indexOf(secondAnimal)>=0]
    ];
    const ok=checks.every(function(x){return x[1];});
    $("#writeChecklist").innerHTML=checks.map(function(x){return '<div class="grammarCard"><strong>'+(x[1]?'✓ ':'○ ')+x[0]+'</strong></div>';}).join('');
    $("#writeFeedback").textContent=ok?"Ready ✓ You included the identity, both opinions, both animals and the connective.":"Nearly there. Use the checklist to see which part is missing.";
    $("#writeFeedback").className="feedback "+(ok?"good":"try");
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