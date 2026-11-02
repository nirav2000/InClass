(() => {
"use strict";

// A distinct homework pack. Do not change any previous French lesson or version.
const previousFrench = window.renderFrench;
const $a = id => document.getElementById(id);
const h = value => String(value == null ? "" : value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const normalized = value => norm(String(value || "")).replace(/\s*'\s*/g, "'").replace(/[.!?]+$/g, "").trim();
const randomOrder = items => shuffle(items);
const AUTO_FORM = ["J’ai", "Tu as", "Il a", "Nous avons", "Vous avez", "Ils ont"];

function registerHeard(group) {
  const p = getProgress();
  p.avoirHeard = p.avoirHeard || {};
  if (p.avoirHeard[group]) return;
  p.avoirHeard[group] = true;
  p.requiredHeard = Object.keys(p.avoirHeard).length;
  saveProgress(p);
}

function recordAvoir(activity, item, correct, extra) {
  recordLearningAttempt(activity, item, correct, Object.assign({scope:"required"}, extra || {}));
}

function explainMismatch(answer, target, subject) {
  const got = normalized(answer);
  if ((got === "a" || got === "as" || got.endsWith(" a") || got.endsWith(" as")) &&
      (target.endsWith(" a") || target.endsWith(" as"))) {
    return "You can hear the same final vowel in a and as. The subject " + subject +
      " determines the spelling: tu as, but il/elle a.";
  }
  if (normalized(target) === "j'ai" && (got === "je ai" || got === "je a")) {
    return "French shortens je to j’ before ai, because ai starts with a vowel.";
  }
  return "Look at the subject first, then choose its matching verb. Keep the spelling exact.";
}

// Conceptual understanding is tracked independently from the six-mark spelling test.
const AVOIR_CONCEPT_CHECKS = [
  {
    id:"pronoun", section:"foundations", label:"Pronouns",
    prompt:"Sai has a dog. He has a dog. Which word is a pronoun that refers to Sai?",
    choices:[{id:"sai",text:"Sai"},{id:"he",text:"He"},{id:"dog",text:"Dog"}],
    answer:"he",
    explain:"Yes. He is a pronoun: a short word referring to Sai, so we do not need to repeat his name.",
    hint:"A pronoun points to a person or thing. Here it replaces the name Sai."
  },
  {
    id:"form", section:"foundations", label:"Verb forms",
    prompt:"Which pair shows two different forms of the SAME verb?",
    choices:[{id:"have-has",text:"have / has"},{id:"have-dog",text:"have / dog"},{id:"dog-cat",text:"dog / cat"}],
    answer:"have-has",
    explain:"Correct. Have and has are two forms of one verb: to have. They both describe having something.",
    hint:"Choose two words that both express the idea of having something."
  },
  {
    id:"conjugation", section:"foundations", label:"Conjugation",
    prompt:"Why do we write 'I have' but 'he has'?",
    choices:[{id:"time",text:"Because 'he' is in the past"},{id:"subject",text:"Because the verb matches who has something"},{id:"animal",text:"Because the object changes"}],
    answer:"subject",
    explain:"Exactly. The subject changes (I → he), so the verb changes (have → has). This is conjugation.",
    hint:"Both sentences are in the present. Look at who is having something."
  },
  {
    id:"tense", section:"tenses", label:"Tense",
    prompt:"Which sentence is about the FUTURE?",
    choices:[{id:"past",text:"I had a dog."},{id:"present",text:"I have a dog."},{id:"future",text:"I will have a dog."}],
    answer:"future",
    explain:"Yes. Will have points to the future. Had is past; have is present.",
    hint:"Which sentence describes something that will be true later, rather than now or earlier?"
  }
];
const AVOIR_TIMES = [
  {
    id:"past", name:"Past", english:"I had", french:"J’avais", symbol:"↶",
    detail:"Past means earlier. J’avais can mean “I had” or “I used to have”; it is a past form called the imperfect."
  },
  {
    id:"present", name:"Present", english:"I have", french:"J’ai", symbol:"◎",
    detail:"Present means now, or something that is generally true. J’ai means “I have”. THIS is the tense in Friday’s test."
  },
  {
    id:"future", name:"Future", english:"I will have", french:"J’aurai", symbol:"➜",
    detail:"Future means later. J’aurai means “I will have”. You do not need to memorise this form for Friday."
  }
];
function avoirConceptCard(q) {
  return '<div class="avoirConceptQuestion" data-av-concept="' + h(q.id) + '">' +
    '<div class="avoirConceptQuestionHead"><span class="avoirConceptDot" aria-hidden="true">?</span>' +
    '<strong>' + h(q.prompt) + '</strong></div>' +
    '<div class="avoirConceptChoices">' + q.choices.map(choice =>
      '<button type="button" class="avoirConceptChoice" data-av-concept-answer="' + h(choice.id) + '">' +
        h(choice.text) + '</button>'
    ).join("") + '</div>' +
    '<p class="avoirConceptFeedback" data-av-concept-feedback aria-live="polite"></p></div>';
}
function avoirTenseCard(t) {
  return '<button type="button" class="avoirTenseCard' + (t.id === "present" ? ' is-current is-selected' : '') + '"' +
    ' data-av-tense="' + h(t.id) + '" aria-pressed="' + (t.id === "present" ? "true" : "false") + '"' +
    ' aria-label="' + h(t.name + " tense: " + t.english + "; " + t.french + ". Play French example") + '">' +
      '<span class="avoirTenseIcon" aria-hidden="true">' + h(t.symbol) + '</span>' +
      '<strong class="avoirTenseTitle">' + h(t.name) + '</strong>' +
      '<span class="avoirTenseEnglish">' + h(t.english) + '</span>' +
      '<span class="avoirTenseFrench" lang="fr-FR">' + h(t.french) + '</span>' +
      '<span class="avoirTenseSpeaker" aria-hidden="true">🔊 Hear</span>' +
    '</button>';
}

function renderAvoir() {
  const w = state.week;
  const forms = w.forms;
  const subjects = w.practiceSubjects;
  const bySubject = Object.fromEntries(subjects.map(s => [s.id, s]));
  setNav([
    ["avSchool","School task"],
    ["avFoundations","Why forms?"],
    ["avTenses","Past · Present · Future"],
    ["avReference","Six forms"],
    ["avHear","Hear + recall"],
    ["avNotice","Spelling patterns"],
    ["avWrite","Spell from memory"],
    ["avTest","Friday test"],
    ["avTransfer","Use new sentences"]
  ]);

  $a("lessonRoot").innerHTML =
    '<section class="avoirIntro" id="avSchool">' +
      '<p class="eyebrow">MONSIEUR BLOOM · YEAR 5 FRENCH PREP</p>' +
      '<h3>One verb, six essential forms.</h3>' +
      '<p><strong>Avoir</strong> means <strong>to have</strong>. Learn the meaning and sound of each form, then produce the exact spelling without a prompt.</p>' +
      '<div class="avoirIntroLine"><span class="avoirDeadline">📅 School test · Fri 6 Nov</span>' +
      '<a class="avoirVideo" href="' + h(w.videoUrl) + '" target="_blank" rel="noopener noreferrer">▶ Pink Panther avoir video ↗</a></div>' +
      '<p>School focus: <strong>je, tu, il/elle, nous, vous, ils/elles</strong>. ' +
        'Important: <strong>tu as</strong> and <strong>il/elle a</strong> sound alike at the end, but the spellings differ.</p>' +
      '<details class="avoirSource"><summary>See Monsieur Bloom’s instructions</summary>' +
      '<p>' + h(w.sourceInstruction) + '</p><p>Original source: ' + h(w.source) + '</p></details>' +
    '</section>' +

    panel("avFoundations",1,"Why do verbs have different forms?",
      '<p class="tip">We will learn six spellings shortly. First, discover what a <strong>verb</strong>, a <strong>pronoun</strong> and a <strong>form</strong> are — and why languages need them.</p>' +
      '<div class="avoirConceptCompare"><div><span class="avoirMiniLabel">English</span>' +
        '<p>I <strong>have</strong> a dog.</p><p>He <strong>has</strong> a dog.</p></div>' +
        '<div><span class="avoirMiniLabel">French</span>' +
        '<p>J’<strong>ai</strong> un chien.</p><p>Il <strong>a</strong> un chien.</p></div></div>' +
      '<p class="avoirConceptInsight">The <strong>person changes</strong>, but the idea of <strong>having</strong> something stays the same. The verb changes to fit the person. Those different versions are called <strong>forms</strong>.</p>' +
      '<div class="avoirConceptDefinitions">' +
        '<div class="avoirConceptDefinition"><span>01</span><div><strong>Verb</strong><p>A word about doing, being or having something. <em>Have</em>, <em>has</em> and French <em>avoir</em> are connected to the same idea.</p></div></div>' +
        '<div class="avoirConceptDefinition"><span>02</span><div><strong>Subject</strong><p>The person or thing the sentence is about — in these examples, <em>I</em>, <em>he</em>, <em>je</em> or <em>il</em>.</p></div></div>' +
        '<div class="avoirConceptDefinition"><span>03</span><div><strong>Pronoun</strong><p>A short word referring to someone or something, often instead of repeating a name: <em>Sai</em> → <em>he</em>. French has <em>je, tu, il, elle, nous, vous, ils, elles</em>.</p></div></div>' +
        '<div class="avoirConceptDefinition"><span>04</span><div><strong>Form and conjugation</strong><p>A <em>form</em> is one version of a verb, such as <em>have</em> or <em>has</em>. <em>Conjugation</em> means changing the verb to match who is involved (and the time).</p></div></div>' +
        '<div class="avoirConceptDefinition"><span>05</span><div><strong>Infinitive</strong><p>The dictionary name of a verb, without choosing who is doing it. <em>Avoir</em> means <em>to have</em>; <em>j’ai</em> is a form used with <em>je</em>.</p></div></div>' +
        '<div class="avoirConceptDefinition"><span>06</span><div><strong>Why have forms?</strong><p>They help us make a sentence grammatically correct and show who is doing or having something. English changes <em>have → has</em>; French changes the verb more often.</p></div></div>' +
      '</div>' +
      '<p class="avoirConceptBridge">One verb can also change for <strong>when</strong> something happens. That brings us to <strong>tense</strong>.</p>' +
      '<div class="avoirConceptQuizHead"><div><strong>Check the idea</strong><p>Explain the reason, not just the answer.</p></div><small id="avConceptProgress">0/4 ideas understood</small></div>' +
      AVOIR_CONCEPT_CHECKS.filter(q => q.section === "foundations").map(avoirConceptCard).join("")
    ) +

    panel("avTenses",2,"What is present tense? Are there other tenses?",
      '<p class="tip"><strong>Tense tells us when something happens or is true.</strong> The three big time ideas are past, present and future. We use them in English too.</p>' +
      '<div class="avoirTenseMap"><div class="avoirTenseCards">' +
        AVOIR_TIMES.map(avoirTenseCard).join("") + '</div>' +
        '<p id="avTenseDetail" class="avoirTenseDetail" aria-live="polite">' + h(AVOIR_TIMES[1].detail) + '</p>' +
        '<p class="avoirTenseNote">French has several past tenses and other verb constructions too. This is a simplified first map, not the complete system. Tap a card to hear its French example.</p>' +
      '</div>' +
      '<p class="avoirTenseExplanation">The <strong>present tense</strong> describes what is happening now or what is generally true. The <strong>past</strong> describes what was true earlier; the <strong>future</strong> describes what will be true later.</p>' +
      '<details class="avoirTenseMore"><summary>Are these the only French tenses?</summary>' +
        '<p>No. For instance, <strong>j’avais</strong> is one way to talk about the past, and <strong>j’ai eu</strong> is another. You will learn the differences later. <strong>Friday’s homework is only the present tense</strong>: j’ai, tu as, il/elle a, nous avons, vous avez, ils/elles ont.</p></details>' +
      '<div class="avoirConceptQuizHead"><strong>Check your understanding of time</strong><small id="avConceptProgressTime">0/4 ideas understood</small></div>' +
      AVOIR_CONCEPT_CHECKS.filter(q => q.section === "tenses").map(avoirConceptCard).join("")
    ) +

    panel("avReference",3,"The six forms you need for school",
      '<p class="tip">Say each French phrase after listening. Notice that the coloured word is the part of <em>avoir</em> that changes.</p>' +
      '<table class="avoirTable"><thead><tr><th>Pronoun</th><th>French</th><th>Meaning</th><th>Hear</th></tr></thead><tbody>' +
      forms.map((f, i) =>
        '<tr><td>' + h(f.pronouns) + '</td><td><span class="avoirBlue">' +
        (i===0 ? "J’" : (i===2 ? "Il / Elle " : i===5 ? "Ils / Elles " : f.french.split(" ")[0] + " ")) +
        h(f.verb) + '</span></td><td>' + h(f.english) + '</td><td><button type="button" class="avoirHear" data-av-hear="' +
        i + '" aria-label="Hear ' + h(f.pronouns) + '">🔊</button></td></tr>'
      ).join("") + '</tbody></table>' +
      '<div class="avoirChecklist"><div><strong id="avHeardCount">0/6</strong>forms heard</div>' +
      '<div><strong>6</strong>forms to memorise</div><div><strong>100%</strong>spelling target</div></div>'
    ) +

    panel("avHear",4,"Hear it, picture its meaning, recall it",
      '<p class="tip">First understand who has something. Say the French from memory, then reveal and compare it to the spoken model.</p>' +
      '<div class="avoirPrompt"><p class="promptLabel">SAY IT IN FRENCH</p><div id="avHearCue" class="avoirPromptText"></div>' +
      '<div class="avoirActions"><button id="avHearPlay" type="button" class="primary">🔊 Hear French</button>' +
      '<button id="avHearReveal" type="button" class="secondary">Reveal spelling</button>' +
      '<button id="avHearNext" type="button" class="secondary">Next →</button></div>' +
      '<div id="avHearAnswer" class="avoirReveal" aria-live="polite"></div>' +
      '<small>Say it aloud before revealing. Pronunciation is best learnt from audio, not English-looking spellings.</small></div>'
    ) +

    panel("avNotice",5,"Understand why the spelling changes",
      '<p class="tip"><strong>Present tense</strong> tells us about what someone has now. ' +
      '<strong>Conjugating</strong> means changing the verb to match who is doing or having something.</p>' +
      '<div class="avoirNoticeGrid">' +
        '<div class="avoirNotice"><strong>Same sound, different spelling</strong><p class="avoirComparison">tu <u>as</u> / il <u>a</u></p>' +
        '<p>The final verb sounds alike. When the subject is <em>tu</em>, write <strong>as</strong>; with <em>il</em> or <em>elle</em>, write <strong>a</strong>.</p>' +
        '<button class="secondary" id="avContrastHear">🔊 Compare</button></div>' +
        '<div class="avoirNotice"><strong>Why J’ai, not Je ai?</strong><p class="avoirComparison">je + ai → j’ai</p>' +
        '<p><em>Je</em> loses its <em>e</em> before the vowel in <em>ai</em>. That is called <strong>elision</strong>.</p>' +
        '<button class="secondary" id="avElisionHear">🔊 Hear J’ai</button></div>' +
        '<div class="avoirNotice"><strong>Link sounds together</strong><p class="avoirComparison">nous avons</p>' +
        '<p>Listen for the linking <strong>z</strong> sound in <em>nous avons</em>, <em>vous avez</em> and <em>ils ont</em>. That link is called <strong>liaison</strong>.</p>' +
        '<button class="secondary" id="avLiaisonHear">🔊 Hear the links</button></div>' +
      '</div>' +
      '<div class="avoirPrompt"><p class="promptLabel">QUICK CHOICE · RECALL THE ENDING</p>' +
      '<div id="avChooseCue" class="avoirPromptText"></div><div id="avChooseOptions" class="avoirActions"></div>' +
      '<p class="feedback" id="avChooseFeedback" aria-live="polite"></p>' +
      '<button id="avChooseNext" class="secondary" type="button">Different pronoun →</button></div>'
    ) +

    panel("avWrite",6,"Spell the whole French form from memory",
      '<p class="tip">Look at the English meaning and write the complete French phrase. Exact spelling matters; <em>a</em> and <em>as</em> are not interchangeable.</p>' +
      '<div class="avoirPrompt"><p class="promptLabel">TRANSLATE INTO FRENCH</p>' +
      '<div id="avWriteCue" class="avoirPromptText"></div>' +
      '<div class="avoirModeBar" role="group" aria-label="Answer method">' +
        '<button type="button" class="answerMode active" id="avModeType" aria-pressed="true">⌨️ Type</button>' +
        '<button type="button" class="answerMode" id="avModePencil" aria-pressed="false">✏️ Apple Pencil</button>' +
        '<span class="answerLanguage">Français · fr-FR</span></div>' +
      '<p id="avPencilHelp" class="avoirModeHelp hidden">Use iPadOS Scribble directly in this box. For better French handwriting recognition, choose the <strong>Français</strong> keyboard with the 🌐 key. A website cannot switch iPad keyboards automatically. Check the recognised text before marking; transcription errors need not count as mistakes.</p>' +
      '<textarea id="avWriteInput" class="avoirInput" rows="2" lang="fr-FR" inputmode="text" spellcheck="true" autocomplete="off" autocapitalize="none" placeholder="Write the French phrase…" aria-label="French answer"></textarea>' +
      '<div class="avoirActions"><button id="avWriteCheck" type="button" class="primary">Check spelling</button>' +
      '<button id="avWriteModel" type="button" class="secondary">🔊 Hear model</button>' +
      '<button id="avWriteNext" type="button" class="secondary">Another form →</button></div>' +
      '<p id="avWriteReadback" class="avoirTranscription hidden"></p>' +
      '<p id="avWriteFeedback" class="feedback" aria-live="polite"></p></div>'
    ) +

    panel("avTest",7,"Friday’s school-style spelling test",
      '<p class="tip">No multiple choice, no hints. Fill in the correct form of <strong>avoir</strong> for each pronoun. ' +
      'There are six marks. All spellings must be correct.</p>' +
      '<div class="avoirQuizFields">' + forms.map((f, i) =>
        '<div class="avoirQuizField"><label for="avQuiz' + i + '">' + (i+1) + '. ' +
        h(f.pronouns) + ' …</label><small>' + h(f.english) + '</small>' +
        '<input id="avQuiz' + i + '" data-av-quiz="' + i + '" aria-label="Verb for ' + h(f.pronouns) +
        '" lang="fr-FR" autocorrect="off" autocomplete="off" autocapitalize="none" spellcheck="false" /></div>'
      ).join("") + '</div>' +
      '<div class="avoirActions"><button id="avQuizSubmit" type="button" class="primary">Mark my six answers</button>' +
      '<button id="avQuizReset" type="button" class="secondary">Start a fresh test</button></div>' +
      '<div id="avQuizResults" aria-live="polite"></div><div id="avHistory" class="avoirHistory"></div>'
    ) +

    panel("avTransfer",8,"Use avoir to make sentences of your own",
      '<p class="tip"><strong>Optional extension:</strong> use the animal words from previous French lessons. ' +
      'This checks whether you can change the pronoun and still use the correct verb.</p>' +
      '<div class="avoirBuilder">' +
        '<label>Who has it?<select id="avBuilderSubject">' +
        subjects.map(s => '<option value="' + h(s.id) + '">' + h(s.english) + '</option>').join("") +
        '</select></label>' +
        '<label>What do they have?<select id="avBuilderObject">' +
        w.objects.map((o,i) => '<option value="' + i + '">' + h(o.emoji + " " + o.english) + '</option>').join("") +
        '</select></label></div>' +
      '<div class="avoirPrompt"><p class="promptLabel">MAKE A NEW SENTENCE</p>' +
      '<div id="avBuilderCue" class="avoirPromptText"></div>' +
      '<input id="avBuilderInput" class="avoirInput" lang="fr-FR" autocorrect="off" spellcheck="true" placeholder="Write your French sentence">' +
      '<div class="avoirActions"><button id="avBuilderCheck" type="button" class="primary">Check my sentence</button>' +
      '<button id="avBuilderHear" type="button" class="secondary">🔊 Hear model</button>' +
      '<button id="avBuilderNext" type="button" class="secondary">New combination →</button></div>' +
      '<p id="avBuilderFeedback" class="feedback" aria-live="polite"></p></div>'
    );

  // This check lives in the understanding strand; it never inflates the school spelling score.
  function refreshAvoirConceptProgress() {
    const p = getProgress();
    const mastered = AVOIR_CONCEPT_CHECKS.filter(q => (p.avoirConceptMastery || {})[q.id]).length;
    const summary = mastered + "/" + AVOIR_CONCEPT_CHECKS.length + " ideas understood";
    ["avConceptProgress","avConceptProgressTime"].forEach(id => {
      const item = $a(id);
      if (item) item.textContent = summary;
    });
  }
  document.querySelectorAll("[data-av-concept]").forEach(card => {
    const question = AVOIR_CONCEPT_CHECKS.find(q => q.id === card.dataset.avConcept);
    if (!question) return;
    card.querySelectorAll("[data-av-concept-answer]").forEach(button => {
      button.onclick = () => {
        if (card.dataset.avConceptCompleted === "true") return;
        const answer = button.dataset.avConceptAnswer;
        const correct = answer === question.answer;
        const p = getProgress();
        p.avoirConceptAttempts = (p.avoirConceptAttempts || 0) + 1;
        if (correct) {
          p.avoirConceptCorrect = (p.avoirConceptCorrect || 0) + 1;
          p.avoirConceptMastery = p.avoirConceptMastery || {};
          p.avoirConceptMastery[question.id] = true;
        } else {
          p.avoirConceptMisses = p.avoirConceptMisses || {};
          p.avoirConceptMisses[question.id] = (p.avoirConceptMisses[question.id] || 0) + 1;
        }
        saveProgress(p);
        recordAvoir("avoir-concept-check",question.id,correct,{
          scope:"understanding",concept:question.id,response:answer,expected:question.answer
        });
        const feedback = card.querySelector("[data-av-concept-feedback]");
        feedback.textContent = correct ? question.explain : question.hint + " Try again.";
        feedback.className = "avoirConceptFeedback " + (correct ? "good" : "try");
        if (correct) {
          card.dataset.avConceptCompleted = "true";
          card.classList.add("is-understood");
          card.querySelectorAll("[data-av-concept-answer]").forEach(option => {
            option.disabled = true;
            if (option === button) option.classList.add("is-correct");
          });
        } else button.classList.add("was-tried");
        refreshAvoirConceptProgress();
        renderTestHistory();
      };
    });
  });
  document.querySelectorAll("[data-av-tense]").forEach(card => {
    card.onclick = () => {
      const tense = AVOIR_TIMES.find(t => t.id === card.dataset.avTense);
      if (!tense) return;
      document.querySelectorAll("[data-av-tense]").forEach(other => {
        const active = other === card;
        other.classList.toggle("is-selected",active);
        other.setAttribute("aria-pressed",String(active));
      });
      $a("avTenseDetail").textContent = tense.detail;
      speak(tense.french,"fr-FR");
    };
  });
  refreshAvoirConceptProgress();

  const heardCount = () => Object.keys(getProgress().avoirHeard || {}).length;
  function updateHeardCount() { $a("avHeardCount").textContent = heardCount() + "/6"; }
  function audio(subject) {
    speak(subject.french, "fr-FR");
    registerHeard(subject.group);
    updateHeardCount();
  }

  document.querySelectorAll("[data-av-hear]").forEach(btn => {
    btn.onclick = () => {
      const i = Number(btn.dataset.avHear);
      speak(AUTO_FORM[i], "fr-FR");
      registerHeard(forms[i].id);
      updateHeardCount();
    };
  });
  updateHeardCount();

  // Audio → meaning → retrieval, separately from the spelling examination.
  const hearing = randomOrder(subjects);
  let hearingIndex = 0;
  const currentHearing = () => hearing[hearingIndex % hearing.length];
  const renderHearing = () => {
    $a("avHearCue").textContent = currentHearing().english;
    $a("avHearAnswer").textContent = "";
  };
  $a("avHearPlay").onclick = () => audio(currentHearing());
  $a("avHearReveal").onclick = () => { $a("avHearAnswer").textContent = currentHearing().french; };
  $a("avHearNext").onclick = () => { hearingIndex++; renderHearing(); };
  renderHearing();

  $a("avContrastHear").onclick = () => speak("Tu as. Il a. Elle a.", "fr-FR");
  $a("avElisionHear").onclick = () => speak("J’ai.", "fr-FR");
  $a("avLiaisonHear").onclick = () => speak("Nous avons. Vous avez. Ils ont.", "fr-FR");

  // Small recognition activity before independent writing.
  let pickIndex = 0, pickAnswered = false;
  const pickOrder = randomOrder(subjects);
  function renderChoice() {
    const target = pickOrder[pickIndex % pickOrder.length];
    pickAnswered = false;
    $a("avChooseCue").textContent = "For " + target.pronoun + " (" + target.subject + "), which verb ending?";
    let alternatives = randomOrder(["ai", "as", "a", "avons", "avez", "ont"].filter(x => x !== target.verb)).slice(0, 3);
    if ((target.verb === "a" || target.verb === "as") && !alternatives.includes(target.verb === "a" ? "as" : "a")) {
      alternatives[0] = target.verb === "a" ? "as" : "a";
    }
    $a("avChooseOptions").innerHTML = randomOrder([target.verb].concat(alternatives))
      .map(x => '<button type="button" class="secondary" data-av-option="' + h(x) + '">' + h(x) + '</button>').join("");
    $a("avChooseFeedback").textContent = "";
    $a("avChooseFeedback").className = "feedback";
    $a("avChooseOptions").querySelectorAll("button").forEach(btn => {
      btn.onclick = () => {
        if (pickAnswered) return;
        pickAnswered = true;
        const answer = btn.dataset.avOption;
        const correct = answer === target.verb;
        const p = getProgress();
        p.avoirRecognitionAttempts = (p.avoirRecognitionAttempts || 0) + 1;
        if (correct) p.avoirRecognitionCorrect = (p.avoirRecognitionCorrect || 0) + 1;
        saveProgress(p);
        recordAvoir("avoir-choose-ending",target.group,correct,{response:answer,expected:target.verb});
        $a("avChooseFeedback").textContent = correct ?
          "Correct! " + target.french : "That is " + answer + ", but " + target.pronoun + " needs " + target.verb + ". " +
          explainMismatch(answer, target.french, target.pronoun);
        $a("avChooseFeedback").className = "feedback " + (correct ? "good" : "try");
        $a("avChooseOptions").querySelectorAll("button").forEach(b => {b.disabled = true;});
      };
    });
  }
  $a("avChooseNext").onclick = () => { pickIndex++; renderChoice(); };
  renderChoice();

  // Typed answers and Apple Scribble use the same check with a deliberate
  // transcription confirmation step for handwriting errors.
  let writeIndex = 0, writeMode = "type", writeAnswered = false;
  const writing = randomOrder(subjects);
  const currentWriting = () => writing[writeIndex % writing.length];
  function setWriteMode(next) {
    writeMode = next;
    const pencil = next === "pencil";
    $a("avModePencil").classList.toggle("active", pencil);
    $a("avModeType").classList.toggle("active", !pencil);
    $a("avModePencil").setAttribute("aria-pressed", String(pencil));
    $a("avModeType").setAttribute("aria-pressed", String(!pencil));
    $a("avWriteInput").classList.toggle("pencilAnswer", pencil);
    $a("avPencilHelp").classList.toggle("hidden", !pencil);
    $a("avWriteInput").placeholder = pencil ? "Write French here with Apple Pencil…" : "Type the whole French phrase…";
    $a("avWriteInput").focus();
  }
  $a("avModeType").onclick = () => setWriteMode("type");
  $a("avModePencil").onclick = () => setWriteMode("pencil");

  function renderWriting() {
    writeAnswered = false;
    $a("avWriteCue").textContent = currentWriting().english;
    $a("avWriteInput").value = "";
    $a("avWriteFeedback").textContent = "";
    $a("avWriteFeedback").className = "feedback";
    $a("avWriteReadback").textContent = "";
    $a("avWriteReadback").classList.add("hidden");
    $a("avWriteCheck").disabled = false;
  }
  $a("avWriteModel").onclick = () => audio(currentWriting());
  $a("avWriteCheck").onclick = () => {
    if (writeAnswered) return;
    const item = currentWriting();
    const answer = $a("avWriteInput").value.trim();
    const correct = normalized(answer) === normalized(item.french);
    if (writeMode === "pencil") {
      $a("avWriteReadback").textContent = "The iPad recognised: " + (answer || "(nothing)") +
        ". Check this transcription before treating the mark as final.";
      $a("avWriteReadback").classList.remove("hidden");
    }
    const reliable = correct || writeMode !== "pencil";
    if (reliable) {
      const p = getProgress();
      p.spellAttempts = (p.spellAttempts || 0) + 1;
      if (correct) p.spellCorrect = (p.spellCorrect || 0) + 1;
      saveProgress(p);
      recordAvoir("avoir-full-form-spelling",item.group,correct,{response:answer,expected:item.french,inputMode:writeMode});
    }
    $a("avWriteFeedback").textContent = correct ?
      "Perfect spelling ✓ " + item.french :
      "Not quite. Correct answer: " + item.french + ". " +
      explainMismatch(answer, item.french, item.pronoun) +
      (!reliable ? " Correct any Scribble transcription errors and check again; this is not recorded as a wrong answer." : "");
    $a("avWriteFeedback").className = "feedback " + (correct ? "good" : "try");
    if (reliable) {
      writeAnswered = true;
      $a("avWriteCheck").disabled = true;
    }
  };
  $a("avWriteNext").onclick = () => {writeIndex++;renderWriting();};
  renderWriting();

  // The school-style assessment deliberately marks the verb spelling only:
  // a / as (and all other forms) must match exactly, not merely sound right.
  let testSubmitted = false;
  function renderTestHistory() {
    const p = getProgress();
    const scores = p.avoirTestHistory || [];
    const last = scores[scores.length - 1];
    const masteredConcepts = AVOIR_CONCEPT_CHECKS.filter(q => (p.avoirConceptMastery || {})[q.id]).length;
    const conceptRevisit = AVOIR_CONCEPT_CHECKS.filter(q => (p.avoirConceptMisses || {})[q.id])
      .map(q => h(q.label) + " (" + p.avoirConceptMisses[q.id] + ")");
    $a("avHistory").innerHTML = "<strong>Parent review · saved for " + h(state.learner) + "</strong>" +
      "<p><strong>Understanding:</strong> " + masteredConcepts + "/" + AVOIR_CONCEPT_CHECKS.length +
        " concepts understood · " + (p.avoirConceptAttempts || 0) + " checks attempted" +
        (conceptRevisit.length ? " · Earlier misconceptions: " + conceptRevisit.join(", ") : "") + "</p>" +
      "<p>Attempts: " + (p.testsCompleted || 0) + " · Best: " +
        (typeof p.bestTest === "number" ? p.bestTest + "/6" : "not taken") +
        (last ? " · Latest: " + last.score + "/6" : "") + "</p>" +
      (last && last.mistakes.length ?
        "<p>Revisit: " + last.mistakes.map(m => h(m.pronoun + " → " + m.verb)).join(" · ") + "</p>" :
        last ? "<p>All six forms were correct in the last test ✓</p>" :
        "<p>Take a test to save the results and see which forms need more practice.</p>") +
      "<small>Results and per-answer attempts are learner-scoped. Cloud syncing depends on a connected data provider; without one, they remain on this device.</small>";
  }
  $a("avQuizSubmit").onclick = () => {
    if (testSubmitted) return;
    testSubmitted = true;
    const answers = forms.map((f, i) => ({
      pronoun: f.pronouns, verb:f.verb,
      answer:$a("avQuiz" + i).value.trim(),
      correct:normalized($a("avQuiz" + i).value) === normalized(f.verb),
      id:f.id
    }));
    const score = answers.filter(a => a.correct).length;
    const mistakes = answers.filter(a => !a.correct).map(a => ({pronoun:a.pronoun,verb:a.verb,answer:a.answer}));
    const p = getProgress();
    p.testsCompleted = (p.testsCompleted || 0) + 1;
    p.bestTest = Math.max(typeof p.bestTest === "number" ? p.bestTest : 0, score);
    p.avoirTestHistory = (p.avoirTestHistory || []).concat([{date:new Date().toISOString(),score:score,mistakes:mistakes}]).slice(-20);
    saveProgress(p);
    answers.forEach(a => recordAvoir("avoir-school-test",a.id,a.correct,{response:a.answer,expected:a.verb,assessment:"school-6"}));
    document.querySelectorAll("[data-av-quiz]").forEach(input => {input.disabled = true;});
    $a("avQuizSubmit").disabled = true;
    $a("avQuizResults").innerHTML =
      '<div class="avoirScore">' + score + '/6 · ' +
      (score === 6 ? "Ready for Friday! ✓" : "Good practice — revisit the highlighted forms.") + '</div>' +
      '<div class="avoirQuizAnswers">' + answers.map(a =>
        '<div class="avoirQuizAnswer ' + (a.correct ? "correct" : "incorrect") +
        '"><strong>' + (a.correct ? "✓ " : "✗ ") + h(a.pronoun) + " → " + h(a.verb) +
        '</strong><span>' + (a.correct ? "Correct" : "You wrote: " + h(a.answer || "(blank)")) +
        '</span></div>'
      ).join("") + '</div>';
    renderTestHistory();
  };
  $a("avQuizReset").onclick = () => {
    testSubmitted = false;
    document.querySelectorAll("[data-av-quiz]").forEach(input => {input.value = "";input.disabled = false;});
    $a("avQuizSubmit").disabled = false;
    $a("avQuizResults").innerHTML = "";
  };
  renderTestHistory();

  // Transfer: combinations from familiar animal words rather than memorised examples.
  function builderData() {
    return {subject:bySubject[$a("avBuilderSubject").value],object:w.objects[Number($a("avBuilderObject").value)]};
  }
  function builderModel() {
    const data = builderData();
    return data.subject.french + " " + data.object.french + ".";
  }
  function renderBuilder() {
    const data = builderData();
    const who = data.subject.subject;
    const auxiliary = who === "he" || who === "she" ? "has" : "have";
    $a("avBuilderCue").textContent = who.charAt(0).toUpperCase() +
      who.slice(1) + " " + auxiliary + " " + data.object.english;
    $a("avBuilderInput").value = "";
    $a("avBuilderFeedback").textContent = "";
    $a("avBuilderFeedback").className = "feedback";
  }
  $a("avBuilderSubject").onchange = renderBuilder;
  $a("avBuilderObject").onchange = renderBuilder;
  $a("avBuilderCheck").onclick = () => {
    const model = builderModel();
    const answer = $a("avBuilderInput").value.trim();
    const correct = normalized(answer) === normalized(model);
    $a("avBuilderFeedback").textContent = correct ?
      "Bravo! ✓ You created a sentence using the matching avoir form." :
      "Compare with: " + model + ". " + explainMismatch(answer, model, builderData().subject.pronoun);
    $a("avBuilderFeedback").className = "feedback " + (correct ? "good" : "try");
    recordLearningAttempt("avoir-unseen-sentence",builderData().subject.id,correct,
      {scope:"extension",response:answer,expected:model});
    if (correct) bump("sentencesBuilt");
  };
  $a("avBuilderHear").onclick = () => speak(builderModel(),"fr-FR");
  $a("avBuilderNext").onclick = () => {
    $a("avBuilderSubject").value = subjects[Math.floor(Math.random() * subjects.length)].id;
    $a("avBuilderObject").value = String(Math.floor(Math.random() * w.objects.length));
    renderBuilder();
  };
  $a("avBuilderSubject").value = subjects[0].id;
  $a("avBuilderObject").value = "0";
  renderBuilder();

  renderProgress();
}

window.renderFrench = function() {
  if (state.week && state.week.avoirHomework) {
    if (typeof window.InClassPronunciationCleanup === "function") {
      window.InClassPronunciationCleanup();
    }
    return renderAvoir();
  }
  return previousFrench();
};
})();