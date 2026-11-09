// FLOSS spelling lesson. Other historical English lessons retain their existing renderer.
(function () {
  "use strict";
  const previousEnglish = window.renderEnglish;
  const byId = id => document.getElementById(id);
  const all = selector => Array.from(document.querySelectorAll(selector));
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
  const normalise = value => String(value || "").normalize("NFC").trim().toLowerCase().replace(/\s+/g, " ");
  const wordsIn = value => (String(value || "").match(/[a-z]+(?:'[a-z]+)?/gi) || []).map(x => x.toLowerCase());
  const sentenceCheck = (value, word) => {
    const t = String(value || "").trim();
    const tokens = wordsIn(t);
    return {
      usesWord: tokens.includes(word.toLowerCase()),
      enoughWords: tokens.length >= 5,
      capital: /^[A-Z]/.test(t),
      punctuation: /[.!?]["']?$/.test(t),
      valid: tokens.includes(word.toLowerCase()) && tokens.length >= 5
    };
  };
  function questionSet(words, random) {
    const pool = words.slice(), rng = random || Math.random;
    for(let i=pool.length-1;i>0;i--){
      const j = Math.floor(rng() * (i+1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    if(pool.length < 12) throw new Error("Twelve Year 5 words are required");
    return pool.map((word, i) => ({word, type:i<4?"spell":i<8?"meaning":"sentence"}));
  }
  window.InClassFloss = {sentenceCheck, questionSet, normalise};

  const progress = () => getProgress();
  function store(p) { saveProgress(p); }
  function attempt(activity, item, correct, scope, extra) {
    recordLearningAttempt(activity, item, correct, Object.assign({scope:scope || "understanding"},extra || {}));
  }
  const say = word => speak(word, "en-GB");

  function renderSchool(w) {
    return '<p class="fl-school-tag">SCHOOL REQUIREMENT · YEAR 5</p>'+
      '<p><strong>Learning objective:</strong> '+esc(w.schoolTask.learningObjective)+'</p>'+
      '<div class="fl-question"><strong>School starter:</strong> '+esc(w.schoolTask.starter)+
      '<details><summary>Understand the answer</summary><p><strong>forbid → forbidden</strong>. The second part of <em>forbid</em> is stressed, and the d is doubled before the ending. It is <strong>not</strong> the FLOSS rule: FLOSS is about final f, l, s or z in certain short words. Different spelling patterns can produce double letters.</p></details></div>'+
      '<p>Learn the exact <strong>12 Year 5 words</strong> below. The school says its assessment covers both spelling and meaning.</p>'+
      '<div class="testBreakdown"><div><strong>4</strong><span>hear and spell</span></div><div><strong>4</strong><span>definition → word</span></div><div><strong>4</strong><span>own sentences</span></div></div>'+
      '<p class="fl-note">The slide does <strong>not</strong> provide a test date. The Year 6 words are shown separately as optional extension, not the Year 5 assignment.</p>';
  }

  function renderConcepts(w) {
    const entries = w.glossary.map(x => '<details class="fl-glossary"><summary>'+esc(x.term)+'</summary>'+
      '<p>'+esc(x.meaning)+'</p><p class="fl-example">'+esc(x.example)+'</p></details>').join("");
    return '<p class="tip">First think about <strong>speech</strong>, then spelling. We can hear sounds, but we write letters. They do not always match one-for-one.</p>'+
      '<div class="fl-compare"><div><strong>hill</strong><span>short i sound</span><button class="secondary" type="button" data-fl-say="hill">▶ Hear hill</button></div>'+
      '<div><strong>heel</strong><span>long ee sound</span><button class="secondary" type="button" data-fl-say="heel">▶ Hear heel</button></div></div>'+
      '<p>The double <strong>ll</strong> in <em>hill</em> does not mean saying /l/ twice. It is a useful spelling clue to the short vowel sound before it.</p>'+
      '<p><strong>What is a syllable?</strong> A spoken beat. Clap once for <strong>hill</strong>, twice for <strong>muf-fin</strong>. The basic FLOSS rule was made for one-beat words.</p>'+
      '<div class="fl-glossary-grid">'+entries+'</div>';
  }

  function renderRule(w) {
    return '<p><strong>FLOSS</strong> is a memory name for the four ending sounds <strong>f, l, s, z</strong>. The name comes from a word that itself has double ss.</p>'+
      '<div class="fl-pattern"><div><span class="fl-pattern-label">SAY</span><strong>m i ss</strong><small>short i + final /s/</small></div><span class="fl-arrow">→</span><div><span class="fl-pattern-label">WRITE</span><strong>miss</strong><small>ss, usually one /s/ sound</small></div></div>'+
      '<ol class="fl-rule-steps">'+w.ruleSteps.map(x=>'<li>'+esc(x)+'</li>').join("")+'</ol>'+
      '<div class="fl-compare"><div><strong>FLOSS examples</strong><span>cliff · hill · miss · buzz</span></div>'+
      '<div><strong>Not FLOSS</strong><span>leaf (long vowel) · dog (different ending)</span></div></div>'+
      '<p class="fl-note"><strong>Important:</strong> This is a useful <em>usually</em> rule, not a law for every English word. <em>Bus</em> and <em>yes</em> are exceptions. Double letters can also appear inside longer words or through other patterns.</p>'+
      '<div class="fl-question"><strong>Compare three different reasons.</strong>'+
      '<p><strong>thrill</strong>: ll fits the final sound pattern.</p>'+
      '<p><strong>paddle</strong>: dd is a different short-vowel doubling pattern, not strict FLOSS.</p>'+
      '<p><strong>bristling</strong>: no doubled letter! It comes from <em>bristle</em> + <em>-ing</em> after dropping e.</p></div>';
  }

  function renderBank(w) {
    const rows = w.words.map((x,i) =>
      '<div class="fl-word" data-word="'+esc(x.word)+'"><div class="fl-word-line">'+
      '<span class="fl-index">'+(i+1)+'</span><div><strong>'+esc(x.word)+'</strong><small>'+esc(x.parts)+' · '+esc(x.pattern)+'</small></div>'+
      '<button type="button" class="secondary" data-fl-say="'+esc(x.word)+'" aria-label="Hear '+esc(x.word)+'">▶ Hear</button></div>'+
      '<button type="button" class="fl-reveal" data-fl-reveal="'+esc(x.word)+'" aria-expanded="false">Show meaning and spelling clue</button>'+
      '<div class="fl-word-more" id="fl-more-'+esc(x.word)+'" hidden><p><strong>Meaning:</strong> '+esc(x.definition)+'</p>'+
      '<p><strong>Example:</strong> '+esc(x.example)+'</p><p><strong>Why these letters?</strong> '+esc(x.hint)+'</p></div></div>'
    ).join("");
    return '<p class="tip">Listen, say the syllables, write without looking, then reveal the meaning. Do not just copy the spelling.</p>'+
      '<div class="fl-words">'+rows+'</div>';
  }

  function renderPractice(w) {
    const options=w.words.map(x=>'<option value="'+esc(x.word)+'">'+esc(x.word)+'</option>').join("");
    return '<div class="fl-practice-actions"><button class="primary" id="flStartSpelling" type="button">Practise hearing → spelling</button>'+
      '<button class="secondary" id="flStartMeaning" type="button">Practise meanings → word</button></div>'+
      '<div id="flPracticeArea" aria-live="polite"></div>'+
      '<div class="fl-sentence-builder"><h4>Build an original sentence</h4>'+
      '<p>Choose a word, say what it means, then use it in a sentence someone else could understand. Try not to copy the examples.</p>'+
      '<label for="flSentenceWord">Choose a word</label><select id="flSentenceWord">'+options+'</select>'+
      '<label for="flSentenceText">Your new sentence</label><textarea id="flSentenceText" rows="3" placeholder="Write your own sentence…"></textarea>'+
      '<button class="primary" type="button" id="flSentenceCheck">Check my sentence structure</button>'+
      '<p id="flSentenceFeedback" class="feedback" role="status"></p>'+
      '<p class="fl-note">The app can check whether you used the word and wrote a full sentence. It cannot reliably decide if you used the word with the correct meaning; check this separately.</p></div>';
  }

  function renderExtensions(w) {
    return '<details class="fl-extension"><summary>Optional: links to previous learning and next week</summary>'+
      '<p><strong>Backwards:</strong> '+esc(w.transferConnections.backward)+'</p>'+
      '<p><strong>Cross-topic:</strong> '+esc(w.transferConnections.crossTopic)+'</p>'+
      '<p><strong>Forwards:</strong> '+esc(w.transferConnections.forward)+'</p>'+
      '<p><strong>A spelling trap:</strong> In British English, travel → travelling and cancel → cancelled usually add a second l when a suffix is attached. The school slide contrasts the base words travel and cancel with incorrect base spellings travell and cancell.</p>'+
      '<p><strong>Another puzzle:</strong> Balloon has ll but is not a straightforward example of the final short-vowel FLOSS condition. Ask what you actually hear instead of forcing the rule.</p></details>'+
      '<details class="fl-extension"><summary>Optional Year 6 challenge words (not required for this Year 5 test)</summary>'+
      '<p>'+w.year6Optional.map(x=>'<span class="fl-y6">'+esc(x)+'</span>').join(" ")+'</p></details>';
  }

  function lesson() {
    const w=state.week;
    setNav([["fl-school","School work"],["fl-foundation","Sounds & words"],["fl-rule","FLOSS"],["fl-bank","12 words"],["fl-concepts","Why? checks"],["fl-practice","Practise"],["fl-test","12Q test"],["fl-extend","Connections"]]);
    byId("lessonRoot").innerHTML=
      panel("fl-school",1,"What school has set",renderSchool(w))+
      panel("fl-foundation",2,"What do sounds, vowels and syllables mean?",renderConcepts(w))+
      panel("fl-rule",3,"When do we double a consonant?",renderRule(w))+
      panel("fl-bank",4,"This week's 12 Year 5 spelling words",renderBank(w))+
      panel("fl-concepts",5,"Can you explain the rule, not just remember it?",
        '<p class="tip">These checks assess understanding <strong>separately</strong> from school spelling marks. Some examples are words you have not been taught.</p>'+
        '<button class="primary" type="button" id="flStartConcepts">Start 10 why-and-how checks</button><div id="flConceptArea" aria-live="polite"></div>'+
        '<div class="fl-teach-back"><h4>Teach the rule back in your own words</h4>'+
        '<p>Without looking at the examples: what is a short vowel, when do we use FLOSS, and why is <em>puff</em> spelt with ff but <em>roof</em> with one f? Explain why the rule cannot cover every double letter.</p>'+
        '<label for="flTeachBackText">My explanation (not a multiple-choice answer)</label>'+
        '<textarea id="flTeachBackText" rows="4" placeholder="I would explain it like this…"></textarea>'+
        '<button class="primary" type="button" id="flSaveTeachBack">Save my explanation</button>'+
        '<p id="flTeachBackFeedback" class="feedback" role="status"></p><div id="flTeachBackReview"></div></div>')+
      panel("fl-practice",6,"Practise spelling, meaning and sentences",renderPractice(w))+
      panel("fl-test",7,"School-format 12-question practice test",
        '<div class="testBreakdown"><div><strong>4</strong><span>hear & spell</span></div><div><strong>4</strong><span>definition → word</span></div><div><strong>4</strong><span>original sentences</span></div></div>'+
        '<p>The real school questions are unknown. These are newly generated practice questions using the exact Year 5 list. Each word is used once per practice test.</p>'+
        '<p class="fl-note">Spelling and definitions can be marked automatically. Sentence meaning needs a human check: a long sentence containing the word could still be wrong.</p>'+
        '<button class="primary" id="flStartTest" type="button">Start 12-question test</button><div id="flTestArea" aria-live="polite"></div>')+
      panel("fl-extend",8,"Optional extra connections",renderExtensions(w));
    all("[data-fl-say]").forEach(button=>{button.onclick=()=>say(button.dataset.flSay);});
    all("[data-fl-reveal]").forEach(button=>{
      button.onclick=()=>{
        const box=byId("fl-more-"+button.dataset.flReveal);
        box.hidden=!box.hidden;
        button.setAttribute("aria-expanded",String(!box.hidden));
        button.textContent=box.hidden?"Show meaning and spelling clue":"Hide meaning and spelling clue";
      };
    });
    byId("flStartConcepts").onclick=()=>startConceptChecks(w);
    byId("flSaveTeachBack").onclick=saveTeachBack;
    renderTeachBackReview();
    byId("flStartSpelling").onclick=()=>startDrill(w,"spell");
    byId("flStartMeaning").onclick=()=>startDrill(w,"meaning");
    byId("flSentenceCheck").onclick=checkSentencePractice;
    byId("flStartTest").onclick=()=>startTest(w);
    showExistingReview();
    renderProgress();
  }


  function saveTeachBack(){
    const text=byId("flTeachBackText").value.trim(), feedback=byId("flTeachBackFeedback");
    if(wordsIn(text).length < 15){
      feedback.textContent="Explain at least three ideas: short vowel, the FLOSS ending, and the puff versus roof example. Add enough detail for someone else to learn from you.";
      feedback.className="feedback try";return;
    }
    const p=progress();
    p.flossTeachBack={answer:text,reviewed:null,updatedAt:new Date().toISOString()};
    store(p);
    feedback.textContent="Saved for a parent or tutor to review. Writing a long answer does not prove it is correct.";
    feedback.className="feedback good";
    renderTeachBackReview();
  }
  function renderTeachBackReview(){
    const saved=progress().flossTeachBack, root=byId("flTeachBackReview");
    if(!root)return;
    if(!saved||!saved.answer){root.innerHTML="";return;}
    byId("flTeachBackText").value=saved.answer;
    root.innerHTML='<details class="fl-extension"><summary>Parent or tutor: review the explanation'+
      (saved.reviewed===true?" · demonstrated":saved.reviewed===false?" · revisit":" · not yet marked")+'</summary>'+
      '<p>Look for: (1) a <strong>short vowel sound</strong>; (2) usually a <strong>one-syllable</strong> word;'+
      ' (3) final <strong>f/l/s/z</strong>; (4) doubled final letter usually, not always;'+
      ' (5) <strong>puff</strong> has a short u, <strong>roof</strong> has a long oo sound;'+
      ' (6) other doubles such as <strong>dd</strong> can have different explanations.</p>'+
      '<p>Assess the meaning of the explanation, not its length. A parent/tutor should mark this; the app cannot verify the reviewer’s identity.</p>'+
      '<button type="button" class="secondary" data-fl-teach-mark="yes">Clear independent understanding</button> '+
      '<button type="button" class="secondary" data-fl-teach-mark="no">Needs another explanation</button></details>';
    all("[data-fl-teach-mark]").forEach(button=>{
      button.onclick=()=>{
        const p=progress(),ok=button.dataset.flTeachMark==="yes";
        if(p.flossTeachBack.reviewed!==ok){
          p.flossTeachBack.reviewed=ok;
          store(p);
          attempt("floss-teach-back","short vowel + FLOSS + puff/roof",ok,"understanding",{reviewed:true});
        }
        renderTeachBackReview();
      };
    });
  }

  function startConceptChecks(w) {
    const sequence=w.conceptChecks.slice(), history=[];
    let pos=0;
    function show() {
      const q=sequence[pos], host=byId("flConceptArea");
      if(!q) {
        const correct=history.filter(x=>x.correct).length, p=progress();
        p.flossConceptRuns=(p.flossConceptRuns||0)+1;
        p.flossConceptLast={correct,total:history.length,at:new Date().toISOString()};
        store(p);
        host.innerHTML='<div class="fl-result"><strong>'+correct+'/'+history.length+'</strong>'+
          '<p>Concept checks finished. Unlike spelling recall, these ask <em>why</em> patterns work.</p>'+
          '<p>Review explanations for the missed ideas, then try new examples.</p>'+
          '<button type="button" class="secondary" id="flRestartConcepts">Try the concept checks again</button></div>';
        byId("flRestartConcepts").onclick=()=>startConceptChecks(w);
        return;
      }
      host.innerHTML='<div class="fl-concept-card"><p class="promptLabel">UNDERSTANDING · '+(pos+1)+'/'+sequence.length+' · '+esc(q.kind)+'</p>'+
        '<p class="questionText">'+esc(q.prompt)+'</p>'+
        '<div class="fl-answers">'+q.options.map((x,i)=>'<button type="button" class="secondary" data-fl-choice="'+i+'">'+esc(x)+'</button>').join("")+'</div>'+
        '<p id="flConceptFeedback" class="feedback" role="status"></p>'+
        '<p id="flConceptWhy" class="fl-explanation" hidden></p>'+
        '<button id="flConceptNext" type="button" class="primary" hidden>Next question</button></div>';
      const buttons=all("[data-fl-choice]");
      buttons.forEach(button=>{
        button.onclick=()=>{
          const chosen=q.options[Number(button.dataset.flChoice)];
          const ok=chosen===q.answer;
          buttons.forEach(b=>b.disabled=true);
          const feedback=byId("flConceptFeedback");
          feedback.textContent=ok?"Yes — now explain why.":"Not yet. The best answer is: "+q.answer;
          feedback.className="feedback "+(ok?"good":"try");
          byId("flConceptWhy").textContent=q.why;
          byId("flConceptWhy").hidden=false;
          byId("flConceptNext").hidden=false;
          history.push({id:q.id,correct:ok});
          const p=progress();
          p.flossConceptAttempts=(p.flossConceptAttempts||0)+1;
          if(ok){
            p.flossConceptCorrect=(p.flossConceptCorrect||0)+1;
            p.flossConceptMastery=Object.assign({},p.flossConceptMastery||{},{[q.id]:true});
          } else {
            p.flossConceptMastery=Object.assign({},p.flossConceptMastery||{},{[q.id]:false});
          }
          store(p);
          attempt("floss-concept",q.id,ok,"understanding",{concept:q.kind});
        };
      });
      byId("flConceptNext").onclick=()=>{pos++;show();};
    }
    show();
  }

  function startDrill(w,type){
    const shuffled=questionSet(w.words).map(x=>x.word);
    let index=0, count=0, correct=0;
    const root=byId("flPracticeArea");
    function draw() {
      const item=shuffled[index];
      if(!item) {
        root.innerHTML='<div class="fl-result"><strong>'+correct+'/'+count+'</strong><p>'+
          (type==="spell"?"Hearing and spelling":"Meaning and word")+' practice complete.</p>'+
          '<button class="secondary" type="button" id="flDrillAgain">Practise again</button></div>';
        byId("flDrillAgain").onclick=()=>startDrill(w,type);
        return;
      }
      const lead=type==="spell"
        ?'<p>Listen without looking, then write the word you hear.</p><button id="flDrillHear" class="soundButton" type="button" aria-label="Play word">🔊</button>'
        :'<p class="questionText">'+esc(item.definition)+'</p>';
      root.innerHTML='<div class="fl-drill"><p class="promptLabel">'+(type==="spell"?"HEAR → SPELL":"MEANING → WORD")+' · '+(index+1)+'/12</p>'+
        lead+'<form id="flDrillForm" class="inlineForm centred"><input id="flDrillInput" autocomplete="off" spellcheck="false" aria-label="Answer" required>'+
        '<button type="submit" class="primary">Check</button></form>'+
        '<p id="flDrillFeedback" class="feedback" role="status"></p>'+
        '<button type="button" id="flDrillNext" class="secondary" hidden>Next word →</button></div>';
      if(type==="spell")byId("flDrillHear").onclick=()=>say(item.word);
      byId("flDrillForm").onsubmit=e=>{
        e.preventDefault();
        const answer=byId("flDrillInput").value, ok=normalise(answer)===normalise(item.word);
        count++;
        if(ok)correct++;
        const p=progress(), prefix=type==="spell"?"flossSpelling":"flossMeaning";
        p[prefix+"Attempts"]=(p[prefix+"Attempts"]||0)+1;
        if(ok)p[prefix+"Correct"]=(p[prefix+"Correct"]||0)+1;
        store(p);
        attempt(type==="spell"?"floss-spell":"floss-meaning",item.word,ok,"required");
        recordReview(item.word,ok,w.id);
        const feedback=byId("flDrillFeedback");
        feedback.textContent=ok?"Correct. "+item.hint:"Correct spelling: "+item.word+". "+item.hint;
        feedback.className="feedback "+(ok?"good":"try");
        byId("flDrillInput").disabled=true;
        byId("flDrillForm").querySelector("button").disabled=true;
        byId("flDrillNext").hidden=false;
      };
      byId("flDrillNext").onclick=()=>{index++;draw();};
    }
    draw();
  }

  function checkSentencePractice(){
    const text=byId("flSentenceText").value.trim(), word=byId("flSentenceWord").value;
    const shape=sentenceCheck(text,word), feedback=byId("flSentenceFeedback");
    if(!shape.valid){
      feedback.textContent=!shape.usesWord?"Use the exact word "+word+" in your sentence.":"Write at least five words to make the meaning clear.";
      feedback.className="feedback try";return;
    }
    const p=progress();
    p.flossSentenceDrafts=Object.assign({},p.flossSentenceDrafts||{},{[word]:text});
    p.flossSentenceSubmitted=(p.flossSentenceSubmitted||0)+1;
    store(p);
    feedback.textContent="Sentence structure looks plausible. "+(!shape.capital?"Add a capital letter. ":"")+(!shape.punctuation?"Add closing punctuation. ":"")+"Now explain what "+word+" means: a person still needs to check that your sentence uses it correctly.";
    feedback.className="feedback good";
  }

  let runningTest=null;
  function startTest(w){
    runningTest={items:questionSet(w.words),index:0,answers:[],startedAt:new Date().toISOString()};
    byId("flStartTest").hidden=true;
    renderQuestion(w);
  }
  function renderQuestion(w){
    const t=runningTest, q=t.items[t.index], root=byId("flTestArea");
    if(!q){finishTest(w);return;}
    let prompt;
    if(q.type==="spell")prompt='<p class="promptLabel">HEAR AND SPELL</p><button type="button" class="soundButton" id="flTestHear">🔊</button><p>Type the word you hear without looking at the bank.</p>';
    if(q.type==="meaning")prompt='<p class="promptLabel">DEFINITION → WORD</p><p class="questionText">'+esc(q.word.definition)+'</p>';
    if(q.type==="sentence")prompt='<p class="promptLabel">WRITE AN ORIGINAL SENTENCE</p><p class="bigWord">'+esc(q.word.word)+'</p><p>Use this word correctly so its meaning is clear.</p>';
    const input=q.type==="sentence"?'<textarea id="flTestAnswer" rows="3" aria-label="Original sentence" required></textarea>':
      '<input id="flTestAnswer" type="text" spellcheck="false" autocomplete="off" aria-label="Spelling answer" required>';
    root.innerHTML='<div class="fl-test-question"><p class="fl-step">Question '+(t.index+1)+' of 12</p>'+
      prompt+'<form id="flTestForm">'+input+'<button class="primary" type="submit">Submit answer</button></form>'+
      '<p id="flTestFeedback" class="feedback" role="status"></p>'+
      '<button id="flTestNext" type="button" class="secondary" hidden>'+(t.index===11?"View results":"Next question →")+'</button></div>';
    if(q.type==="spell")byId("flTestHear").onclick=()=>say(q.word.word);
    byId("flTestForm").onsubmit=e=>{
      e.preventDefault();
      const answer=byId("flTestAnswer").value.trim();
      if(!answer)return;
      if(q.type==="sentence"){
        const check=sentenceCheck(answer,q.word.word);
        if(!check.valid){
          byId("flTestFeedback").textContent=!check.usesWord?
            "Use the exact target word in your sentence.":"Make a fuller sentence (at least five words).";
          byId("flTestFeedback").className="feedback try";
          return;
        }
        t.answers.push({type:q.type,word:q.word.word,answer,review:null});
        byId("flTestFeedback").textContent="Saved for a meaning check. This sentence has not been marked correct.";
        byId("flTestFeedback").className="feedback";
      }else{
        const ok=normalise(answer)===normalise(q.word.word);
        t.answers.push({type:q.type,word:q.word.word,answer,correct:ok});
        const prefix=q.type==="spell"?"flossSpelling":"flossMeaning";
        const p=progress();
        p[prefix+"Attempts"]=(p[prefix+"Attempts"]||0)+1;
        if(ok)p[prefix+"Correct"]=(p[prefix+"Correct"]||0)+1;
        store(p);
        attempt("floss-test-"+q.type,q.word.word,ok,"required");
        recordReview(q.word.word,ok,w.id);
        byId("flTestFeedback").textContent=ok?"Correct.":"Correct answer: "+q.word.word;
        byId("flTestFeedback").className="feedback "+(ok?"good":"try");
      }
      byId("flTestForm").querySelector("button").disabled=true;
      byId("flTestAnswer").disabled=true;
      byId("flTestNext").hidden=false;
    };
    byId("flTestNext").onclick=()=>{t.index++;renderQuestion(w);};
  }
  function finishTest(){
    const t=runningTest, p=progress();
    p.flossTests=Array.isArray(p.flossTests)?p.flossTests:[];
    const recall=t.answers.filter(x=>x.type!=="sentence");
    const score=recall.filter(x=>x.correct).length;
    p.flossTests.push({startedAt:t.startedAt,answers:t.answers,recall:score});
    if(p.flossTests.length>30)p.flossTests=p.flossTests.slice(-30);
    p.flossTestsCompleted=(p.flossTestsCompleted||0)+1;
    p.flossBestRecall=Math.max(p.flossBestRecall||0,score);
    store(p);
    runningTest=null;
    showExistingReview();
  }
  function showExistingReview(){
    const root=byId("flTestArea"), p=progress(), history=p.flossTests||[];
    if(!root||!history.length)return;
    const index=history.length-1, latest=history[index];
    const sentences=latest.answers.filter(x=>x.type==="sentence");
    const accepted=sentences.filter(x=>x.review===true).length;
    const pending=sentences.filter(x=>x.review===null).length;
    const declined=sentences.filter(x=>x.review===false).length;
    root.innerHTML='<div class="fl-result"><p class="promptLabel">LATEST SCHOOL-FORMAT PRACTICE</p>'+
      '<strong>'+latest.recall+'/8</strong><p>Spelling and meanings marked automatically.</p>'+
      '<p><strong>'+sentences.length+'</strong> sentence answers submitted; <strong>'+pending+'</strong> awaiting meaning review. '+
      (pending===0?'Sentence reviews: '+accepted+' clear, '+declined+' need work.':'A 12/12 score cannot be claimed until sentence meanings are checked.')+'</p>'+
      '<details class="fl-extension" id="flParentReview"><summary>Review the four original sentences</summary>'+
      '<p>Check the meaning, not just whether the target word appears. A nonsensical sentence may look grammatically complete.</p>'+
      sentences.map(x=>{
        const j=latest.answers.indexOf(x);
        return '<div class="fl-review-row"><strong>'+esc(x.word)+'</strong><p>'+esc(x.answer)+'</p>'+
          '<p>Review: '+(x.review===null?"Not marked":x.review?"Meaning clear":"Needs work")+'</p>'+
          '<button class="secondary" type="button" data-fl-review="'+j+'" data-fl-mark="yes">Meaning clear</button> '+
          '<button class="secondary" type="button" data-fl-review="'+j+'" data-fl-mark="no">Needs work</button></div>';
      }).join("")+'</details>'+
      '<button id="flTryTestAgain" class="primary" type="button">Take another 12-question test</button></div>';
    byId("flStartTest").hidden=true;
    byId("flTryTestAgain").onclick=()=>startTest(state.week);
    all("[data-fl-review]").forEach(button=>{
      button.onclick=()=>{
        const p=progress(), h=p.flossTests, answer=h[index].answers[Number(button.dataset.flReview)];
        const correct=button.dataset.flMark==="yes";
        if(answer.review!==correct){
          answer.review=correct;
          store(p);
          attempt("floss-test-sentence",answer.word,correct,"required",{reviewed:true});
        }
        showExistingReview();
        const details=byId("flParentReview");
        if(details)details.open=true;
      };
    });
  }

  window.renderEnglish=function(){
    if(state.week && state.week.flossHomework)return lesson();
    return previousEnglish.apply(this,arguments);
  };
})();