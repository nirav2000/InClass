(function () {
  "use strict";
  // Self-contained lesson for 9 Nov 2026. Earlier French packs are deliberately untouched.
  const previousFrench = window.renderFrench;
  const byId = id => document.getElementById(id);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c]);
  const clean = value => String(value == null ? "" : value).normalize("NFC").trim().toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, " ").replace(/[.!?]+$/g, "");
  const unique = values => Array.from(new Set(values));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const rotate = arr => arr.slice().sort(() => Math.random() - .5);

  function getPack() { return state.week; }
  function data() { return getProgress(); }
  function update(changes) { const p=data(); Object.assign(p, changes); saveProgress(p); return p; }
  function attempt(activity, item, correct, meta) {
    recordLearningAttempt(activity, item, correct, Object.assign({scope:"understanding"}, meta || {}));
  }
  function heading(step, title, content) { return panel("sa-" + step, step, title, content); }

  function schoolChecklist(p) {
    return '<div class="sa-checks">' +
      '<label><input id="saPaperComplete" type="checkbox"' + (p.spiderPaperDone ? " checked" : "") +
      '> <span><strong>Spider diagram completed in my French exercise book</strong><small>This is a self-reported paper task, not a Teams hand-in.</small></span></label>' +
      '<label><input id="saAlphabetRevised" type="checkbox"' + (p.alphabetRevised ? " checked" : "") +
      '> <span><strong>French alphabet revision completed</strong><small>Check the sheet in your book as well as using the practice below.</small></span></label>' +
      '</div>';
  }

  function spiderHTML(w, p) {
    return '<p class="tip">First, try filling the five branches from memory. The five words marked <strong>Printed example</strong> appear on Mr Bloom’s diagram. The rest are InClass study suggestions from previous lessons, not an official marking scheme.</p>' +
      '<div class="sa-map"><div class="sa-map-center">PETS<span>5 branches from your worksheet</span></div><div class="sa-map-grid">' +
      w.spiderCategories.map(category => {
        const written = (p.spiderDrafts || {})[category.id] || "";
        return '<article class="sa-branch"><div class="sa-branch-head"><h4>' + esc(category.label) + '</h4><span>Printed example: <strong>' + esc(category.printed) + '</strong></span></div>' +
        '<label for="sa-draft-' + category.id + '">What other French words do you remember?</label>' +
        '<textarea id="sa-draft-' + category.id + '" data-sa-draft="' + category.id + '" rows="3" placeholder="Try from memory; one word or phrase per line.">' + esc(written) + '</textarea>' +
        '<details><summary>Show InClass study words</summary><div class="sa-branch-bank">' +
          category.suggested.map(french => '<button class="tiny sa-say" type="button" data-sa-say="' + encodeURIComponent(french) + '" title="Hear ' + esc(french) + '">' + esc(french) + ' 🔊</button>').join("") +
          '</div><p class="sa-attribution">' + esc(category.source) + '</p></details></article>';
      }).join("") + '</div></div>' +
      '<div class="sa-actions"><button id="saCopyToPaper" class="secondary" type="button">How to transfer it to my book</button><span id="saDraftStatus" role="status" class="sa-status">Drafts are saved on this device.</span></div>' +
      '<p id="saPaperHint" class="tip hidden">Copy your recalled French words into the corresponding branches on the paper diagram. Use the printed examples and your school notebook to check. You can return here and add more words.</p>';
  }

  function alphabetHTML(w, p) {
    return '<p class="tip">Listen to letter names in French, then identify them. French letter names differ from English ones. <strong>Use the alphabet sheet in your book as the school reference.</strong> This practice uses standard French letter names; speech quality depends on your device.</p>' +
      '<div class="sa-alphabet">' + w.alphabet.map(([letter, name]) =>
      '<button class="sa-letter" data-sa-letter="' + esc(letter) + '" type="button"><strong>' + esc(letter) + '</strong><span>' + esc(name) + '</span><small>🔊</small></button>'
      ).join("") + '</div>' +
      '<div class="sa-practice-box"><div class="sa-practice-top"><div><strong>Listen and identify · 8 questions</strong><p>Hear a French letter name. Choose the letter you heard.</p></div><button id="saStartAlphabet" type="button" class="primary">Start alphabet quiz</button></div><div id="saAlphabetArea" aria-live="polite"></div></div>' +
      '<p class="sa-footnote">Practice letters heard: ' + Object.keys(p.alphabetHeard || {}).length + '/26 · Best alphabet quiz: ' + (typeof p.alphabetBest === "number" ? p.alphabetBest + '/8' : 'not yet taken') + '.</p>';
  }

  function understandingHTML() {
    return '<details class="sa-optional"><summary>Understanding · connect earlier French lessons</summary><div class="sa-explain-grid">' +
      '<article><strong>J’ai ≠ J’aime</strong><p><em>J’ai un chien.</em> = I have a dog. The verb is <em>avoir</em> (to have).</p><p><em>J’aime les chiens.</em> = I like dogs. The verb is <em>aimer</em> (to like); <em>les</em> refers to dogs generally.</p></article>' +
      '<article><strong>Why petit / petite?</strong><p>French adjectives often match the noun. For example: <em>un petit chien</em>, but <em>une petite souris</em>.</p><p><em>Intelligent</em> becomes <em>intelligente</em> with a feminine noun. This is a common pattern, not a universal add-e rule.</p></article>' +
      '<article><strong>Singular / plural</strong><p><em>un cheval</em> = a horse; <em>les chevaux</em> = horses. Not every noun makes a plural just by adding -s.</p></article>' +
      '<article><strong>Verb forms</strong><p><em>Je, tu, il/elle, nous, vous, ils/elles</em> are pronouns. <em>J’ai, tu as, il a, nous avons, vous avez, ils ont</em> are present-tense forms of <em>avoir</em>.</p></article>' +
      '</div></details>';
  }

  function mockHTML() {
    return '<p class="tip">InClass practice, <strong>not an official school paper</strong>. The teacher has not supplied an end-of-unit test specification. This quiz draws on the French lessons already stored in InClass. Spell carefully and answer independently before checking.</p>' +
      '<div class="sa-practice-box"><div class="sa-practice-top"><div><strong>12-question mixed revision</strong><p>Pets, colours, opinions, size, personality and <em>avoir</em>.</p></div><button class="primary" id="saStartMock" type="button">Start mock test</button></div><div id="saMockArea" aria-live="polite"></div></div>' +
      '<p class="sa-footnote">No school test dates or marking criteria have been assumed. Check the Teams assignment and school exercise book for the teacher’s instructions.</p>';
  }

  function renderHomework() {
    const w=getPack(), p=data();
    setNav([["sa-1","School homework"],["sa-2","Spider diagram"],["sa-3","Alphabet"],["sa-4","Revision"]]);
    byId("lessonRoot").innerHTML =
      heading(1,"What Mr Bloom asked you to do",
        '<div class="sa-brief"><span class="sa-due">Due Friday 13 November 2026 · 08:30</span>' +
        '<p><strong>Required 1:</strong> Complete the spider diagram on the sheet stuck into your French exercise book.</p>' +
        '<p><strong>Required 2:</strong> Revise the French alphabet using the sheet stuck into your book last week.</p>' +
        '<p><strong>Coming next:</strong> Two end-of-unit tests covering work taught so far this term.</p></div>' + schoolChecklist(p) +
        '<p class="sa-footnote">Checking these boxes saves progress in InClass only. It does not submit homework to Microsoft Teams.</p>') +
      heading(2,"Rebuild the pet spider diagram",spiderHTML(w,p)) +
      heading(3,"French alphabet · listen and recognise",alphabetHTML(w,p)) +
      heading(4,"Prepare for the end-of-unit tests",understandingHTML()+mockHTML());

    byId("saPaperComplete").onchange = e => update({spiderPaperDone: e.target.checked});
    byId("saAlphabetRevised").onchange = e => update({alphabetRevised: e.target.checked});
    byId("saCopyToPaper").onclick = () => byId("saPaperHint").classList.toggle("hidden");
    document.querySelectorAll("[data-sa-draft]").forEach(field => {
      field.oninput = () => {
        const p=data();
        p.spiderDrafts = p.spiderDrafts || {};
        p.spiderDrafts[field.dataset.saDraft] = field.value;
        saveProgress(p);
        byId("saDraftStatus").textContent = "Draft saved locally.";
      };
    });
    document.querySelectorAll("[data-sa-say]").forEach(button => {
      button.onclick = () => speak(decodeURIComponent(button.dataset.saSay),"fr-FR");
    });
    document.querySelectorAll("[data-sa-letter]").forEach(button => {
      button.onclick = () => {
        const x=w.alphabet.find(x => x[0] === button.dataset.saLetter);
        if (!x) return;
        speak(x[1],"fr-FR");
        const p=data(); p.alphabetHeard=p.alphabetHeard || {};
        p.alphabetHeard[x[0]]=true; saveProgress(p);
      };
    });
    byId("saStartAlphabet").onclick = startAlphabet;
    byId("saStartMock").onclick = startMock;
    renderProgress();
  }

  let alphabetQuiz = null;
  let mockQuiz = null;
  function startAlphabet() {
    const w=getPack();
    const shuffled=rotate(w.alphabet);
    alphabetQuiz={packId:w.id,questions:shuffled.slice(0,8),index:0,score:0,answers:[]};
    byId("saStartAlphabet").textContent="Restart quiz";
    nextAlphabet();
  }
  function nextAlphabet() {
    const q=alphabetQuiz, area=byId("saAlphabetArea");
    if (!q || !area || state.week.id !== q.packId) return;
    if (q.index >= q.questions.length) {
      const p=data(); p.alphabetQuizzes=(p.alphabetQuizzes || 0)+1;
      p.alphabetBest=Math.max(p.alphabetBest || 0,q.score); p.alphabetLast=q.score;
      saveProgress(p);
      area.innerHTML='<div class="sa-result"><strong>'+q.score+'/8</strong><p>Alphabet listening practice finished. Revisit any missed letters, then try again.</p><button id="saAgainAlphabet" class="secondary">Try another set</button></div>';
      byId("saAgainAlphabet").onclick=startAlphabet;
      return;
    }
    const target=q.questions[q.index], other=rotate(state.week.alphabet.filter(x => x[0]!==target[0])).slice(0,3);
    const options=rotate([target,...other]);
    area.innerHTML='<div class="sa-quiz"><p class="promptLabel">LETTER '+(q.index+1)+' OF 8</p><h4>Which letter do you hear?</h4><div class="row"><button type="button" id="saHearQuizLetter" class="secondary">🔊 Play letter</button></div>' +
      '<div class="sa-options">' + options.map(x=>'<button type="button" data-sa-option="'+esc(x[0])+'">'+esc(x[0])+'</button>').join("") +
      '</div><p id="saAlphabetFeedback" class="feedback" role="status"></p><button id="saAlphabetNext" class="primary hidden">Next letter →</button></div>';
    byId("saHearQuizLetter").onclick=()=>speak(target[1],"fr-FR");
    document.querySelectorAll("[data-sa-option]").forEach(button => {
      button.onclick=()=>{
        const ok=button.dataset.saOption===target[0];
        q.score+=Number(ok); q.answers.push({letter:target[0],correct:ok});
        attempt("alphabet-listen",target[0],ok,{response:button.dataset.saOption});
        document.querySelectorAll("[data-sa-option]").forEach(b=>{b.disabled=true; if(b.dataset.saOption===target[0])b.classList.add("sa-correct");});
        byId("saAlphabetFeedback").textContent=ok?"Correct — "+target[0]+".":"That was "+target[0]+" ("+target[1]+"). Listen again.";
        byId("saAlphabetFeedback").className="feedback "+(ok?"good":"try");
        byId("saAlphabetNext").classList.remove("hidden");
      };
    });
    byId("saAlphabetNext").onclick=()=>{q.index++;nextAlphabet();};
    // Playback is user-initiated via the button to work consistently on iPads.
  }

  function assembleMock(w) {
    let selected=[];
    Object.keys(w.mockDistribution).forEach(topic=>{
      const pool=rotate(w.mockQuestions.filter(q=>q.topic===topic));
      selected.push(...pool.slice(0,w.mockDistribution[topic]));
    });
    return rotate(selected);
  }
  function startMock() {
    const w=getPack();
    mockQuiz={packId:w.id,questions:assembleMock(w),index:0,score:0,answers:[],start:Date.now()};
    byId("saStartMock").textContent="Restart mock test";
    nextMock();
  }
  function nextMock() {
    const q=mockQuiz, area=byId("saMockArea");
    if (!q || !area || state.week.id!==q.packId) return;
    if(q.index >= q.questions.length){
      const p=data();
      p.mockAttempts=(p.mockAttempts || 0)+1;
      p.mockBest=Math.max(p.mockBest || 0,q.score);
      p.mockLast=q.score;
      p.mockHistory=(p.mockHistory || []).slice(-9);
      p.mockHistory.push({at:new Date().toISOString(),score:q.score,total:q.questions.length,answers:q.answers.map(a=>({id:a.id,topic:a.topic,correct:a.correct,elapsedMs:a.elapsedMs}))});
      saveProgress(p);
      const missed=unique(q.answers.filter(a=>!a.correct).map(a=>a.topic));
      area.innerHTML='<div class="sa-result"><strong>'+q.score+'/'+q.questions.length+'</strong><p>'+(missed.length?'Topics to revisit: '+esc(missed.join(", "))+'.':'All answers matched this InClass practice key.')+'</p>' +
        '<p>Accuracy and response time are recorded. A high score alone does not prove complete understanding.</p><button id="saAgainMock" class="secondary" type="button">Try another mock</button></div>';
      byId("saAgainMock").onclick=startMock;
      return;
    }
    const question=q.questions[q.index];
    const questionStart=Date.now();
    area.innerHTML='<div class="sa-quiz"><p class="promptLabel">MOCK QUESTION '+(q.index+1)+' OF '+q.questions.length+' · '+esc(question.topic)+'</p>' +
      '<h4>'+esc(question.prompt)+'</h4><form id="saMockForm" class="sa-answer"><label for="saMockInput">Write your French answer</label><input id="saMockInput" spellcheck="false" autocomplete="off" autocapitalize="none" aria-describedby="saMockFeedback" required><button class="primary" id="saCheckMock" type="submit">Check answer</button></form>' +
      '<p class="feedback" role="status" id="saMockFeedback"></p><button id="saMockNext" type="button" class="primary hidden">Next question →</button></div>';
    byId("saMockForm").onsubmit=e=>{
      e.preventDefault();
      const input=byId("saMockInput"), answer=input.value.trim();
      if(!answer){byId("saMockFeedback").textContent="Write an answer before checking.";return;}
      const correct=clean(answer)===clean(question.answer);
      q.score+=Number(correct);
      const elapsedMs=Math.max(0,Date.now()-questionStart);
      q.answers.push({id:question.id,topic:question.topic,correct,elapsedMs});
      attempt("term-revision-mock",question.id,correct,{response:answer,elapsedMs,topic:question.topic});
      const feedback=byId("saMockFeedback");
      feedback.textContent=correct?"Correct.":"Target spelling: "+question.answer+". Compare it with your answer.";
      feedback.className="feedback "+(correct?"good":"try");
      input.disabled=true;byId("saCheckMock").disabled=true;
      byId("saMockNext").classList.remove("hidden");
    };
    byId("saMockNext").onclick=()=>{q.index++;nextMock();};
  }

  window.renderFrench = function () {
    if (state.week && state.week.spiderAlphabetHomework) {
      if (typeof window.InClassPronunciationCleanup === "function") window.InClassPronunciationCleanup();
      alphabetQuiz=null;mockQuiz=null;
      return renderHomework();
    }
    return previousFrench();
  };
})();