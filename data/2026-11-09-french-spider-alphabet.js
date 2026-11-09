// French Prep set 9 November 2026. Parent-provided Teams screenshot, not a live Teams sync.
// The source worksheet is in Sai's exercise book. Examples below beyond the five
// printed anchors are InClass revision support, not a teacher-provided answer key.
window.INCLASS_WEEKS.push({
  id: "2026-11-09-french-spider-alphabet",
  subject: "French",
  subjectKey: "french",
  yearGroup: "Year 5",
  className: "5F-Fr",
  teacher: "Monsieur Bloom",
  date: "9 Nov 2026 · due 13 Nov",
  sourceDate: "2026-11-09",
  dueAt: "2026-11-13T08:30:00Z",
  title: "French Prep · Pets spider diagram & alphabet",
  lead: "Finish the paper spider diagram, revise the French alphabet and prepare for two end-of-unit tests.",
  spiderAlphabetHomework: true,
  source: "Mr Bloom's Teams assignment 'French Prep (9.11.26)', supplied as a parent screenshot on 9 November 2026.",
  sourceInstruction: "Complete the spider diagram sheet which were stuck into your books in today's lesson (see below) and revise the French alphabet which was stuck into your books last week. The next two lessons will be end-of-unit tests on what we have covered so far this term.",
  schoolTask: {
    spider: "Complete the printed spider diagram in the French exercise book.",
    alphabet: "Revise the French alphabet from the reference sheet stuck into the exercise book last week.",
    tests: "The next two lessons are end-of-unit tests; the precise tested content and dates are not specified.",
    printedExamples: {opinions:"j’aime", pets:"un chien", colours:"rouge", size:"petit", personality:"intelligent"}
  },
  note: "Only the five printed anchor examples are directly visible as answers. Other examples in InClass are collected from earlier packs or labelled additional study support; the number and wording of worksheet blanks are not treated as an official answer key.",
  contentTiers: {
    required: ["complete the spider diagram on paper", "revise the alphabet reference sheet", "retrieve vocabulary from the five spider branches"],
    understanding: ["connect avoir with pets; distinguish j’ai from j’aime", "recognise when French adjectives change", "listen and respond to French letter names"],
    extension: ["combine previous topics into new sentences", "take an unofficial mixed-term diagnostic quiz"]
  },
  spiderCategories: [
    {id:"opinions", label:"Opinions", printed:"j’aime", suggested:["J’aime","J’adore","Je préfère","Je n’aime pas","Je déteste"], source:"Prior InClass opinions lesson, 5 October"},
    {id:"pets", label:"Pets", printed:"un chien", suggested:["un chien","un chat","un cheval","un poisson","un hamster","un serpent","un lapin","un oiseau","un cochon d’Inde","une souris"], source:"Prior InClass pets lesson, September"},
    {id:"colours", label:"Colours", printed:"rouge", suggested:["rouge","bleu","vert","jaune","noir","blanc","gris","brun","marron"], source:"Prior InClass pets/colours lesson, September"},
    {id:"size", label:"Size", printed:"petit", suggested:["petit","grand"], source:"Petit appears on the printed worksheet; grand is additional revision support"},
    {id:"personality", label:"Personality", printed:"intelligent", suggested:["intelligent","méchant","mignon","stupide"], source:"Prior InClass descriptions lesson, September"}
  ],
  alphabet: [
    ["A","a"],["B","bé"],["C","cé"],["D","dé"],["E","e"],["F","effe"],
    ["G","gé"],["H","ache"],["I","i"],["J","ji"],["K","ka"],["L","elle"],
    ["M","emme"],["N","enne"],["O","o"],["P","pé"],["Q","ku"],["R","erre"],
    ["S","esse"],["T","té"],["U","u"],["V","vé"],["W","double vé"],
    ["X","iks"],["Y","i grec"],["Z","zède"]
  ],
  mockQuestions: [
    {id:"pet-dog",topic:"Pets",prompt:"Write ‘a dog’ in French.",answer:"un chien"},
    {id:"pet-mouse",topic:"Pets",prompt:"Write ‘a mouse’ in French.",answer:"une souris"},
    {id:"pet-horse",topic:"Pets",prompt:"Write ‘a horse’ in French.",answer:"un cheval"},
    {id:"pet-bird",topic:"Pets",prompt:"Write ‘a bird’ in French.",answer:"un oiseau"},
    {id:"colour-red",topic:"Colours",prompt:"Write ‘red’ in French.",answer:"rouge"},
    {id:"colour-blue",topic:"Colours",prompt:"Write ‘blue’ in French (masculine form).",answer:"bleu"},
    {id:"colour-green",topic:"Colours",prompt:"Write ‘green’ in French (masculine form).",answer:"vert"},
    {id:"colour-white",topic:"Colours",prompt:"Write ‘white’ in French (masculine form).",answer:"blanc"},
    {id:"opinion-like",topic:"Opinions",prompt:"Write ‘I like’ in French.",answer:"J’aime"},
    {id:"opinion-love",topic:"Opinions",prompt:"Write ‘I love’ in French.",answer:"J’adore"},
    {id:"opinion-dislike",topic:"Opinions",prompt:"Write ‘I do not like’ in French.",answer:"Je n’aime pas"},
    {id:"opinion-hate",topic:"Opinions",prompt:"Write ‘I hate’ in French.",answer:"Je déteste"},
    {id:"size-small",topic:"Size",prompt:"Write ‘small’ in French (masculine form).",answer:"petit"},
    {id:"size-big",topic:"Size",prompt:"Write ‘big’ in French (masculine form).",answer:"grand"},
    {id:"person-clever",topic:"Personality",prompt:"Write ‘intelligent’ in French (masculine form).",answer:"intelligent"},
    {id:"person-cute",topic:"Personality",prompt:"Write ‘cute’ in French (masculine form).",answer:"mignon"},
    {id:"person-naughty",topic:"Personality",prompt:"Write ‘naughty’ in French (masculine form).",answer:"méchant"},
    {id:"avoir-je",topic:"Avoir",prompt:"Write ‘I have’ in French.",answer:"J’ai"},
    {id:"avoir-tu",topic:"Avoir",prompt:"Write ‘you have’ (one person) in French.",answer:"Tu as"},
    {id:"avoir-il",topic:"Avoir",prompt:"Write ‘he has’ in French.",answer:"Il a"},
    {id:"avoir-nous",topic:"Avoir",prompt:"Write ‘we have’ in French.",answer:"Nous avons"},
    {id:"avoir-vous",topic:"Avoir",prompt:"Write ‘you have’ (a group) in French.",answer:"Vous avez"},
    {id:"avoir-ils",topic:"Avoir",prompt:"Write ‘they have’ (boys or mixed group) in French.",answer:"Ils ont"}
  ],
  mockDistribution: {Pets:2, Colours:2, Opinions:2, Size:1, Personality:1, Avoir:4},
  priorPacks: ["2026-09-french-pets","2026-10-05-french-opinions-v2","2026-11-02-french-avoir"]
});
