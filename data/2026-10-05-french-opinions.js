window.INCLASS_WEEKS.push({
  id:"2026-10-05-french-opinions",
  subject:"French",
  subjectKey:"french",
  yearGroup:"Year 5",
  date:"Week 2 · 5 Oct",
  title:"Opinions about animals",
  lead:"Learn the opinion pattern, understand les, recycle animal vocabulary, then turn picture clues into fluent French quickly.",
  source:"Two French school sheets supplied by parent on 5 October 2026: the writing homework and the ‘Les opinions’ reference sheet, plus the teacher instruction quoted by the parent.",
  opinionsHomework:true,
  sourceNote:"The supplied ‘Les opinions’ sheet confirms the five opinion symbols and the animal vocabulary. The printed Chantal example on the writing sheet says ‘je déteste les oiseaux’ even though the negative picture is a fish/goldfish; the visual cue plus reference sheet support ‘les poissons rouges’. InClass keeps that source discrepancy visible.",
  sourceSheets:[
    {id:"homework",title:"Writing homework",kind:"homework",parts:["assets/source-sheets/2026-10-05-homework.01.b64","assets/source-sheets/2026-10-05-homework.02.b64","assets/source-sheets/2026-10-05-homework.03.b64"],mime:"image/webp"},
    {id:"opinions",title:"Les opinions reference sheet",kind:"reference",parts:["assets/source-sheets/2026-10-05-opinions.01.b64","assets/source-sheets/2026-10-05-opinions.02.b64","assets/source-sheets/2026-10-05-opinions.03.b64","assets/source-sheets/2026-10-05-opinions.04.b64","assets/source-sheets/2026-10-05-opinions.05.b64","assets/source-sheets/2026-10-05-opinions.06.b64","assets/source-sheets/2026-10-05-opinions.07.b64"],mime:"image/webp"}
  ],
  contentTiers:{
    required:[
      "recognise the five opinion symbols",
      "turn opinion + animal clues into a French phrase",
      "understand and use les for animals in general",
      "join two opinions with et or mais",
      "write the homework sentence efficiently and independently"
    ],
    understanding:[
      "J’aime / J’adore elision",
      "why French uses les where English often has no article",
      "plural animal forms including oiseaux and chevaux",
      "how et and mais change the relationship between ideas"
    ],
    extension:[
      "give personal animal opinions without picture prompts",
      "add a reason with parce que",
      "compare preferences using je préfère",
      "pronunciation comparison with the generated French model"
    ]
  },
  opinions:[
    {id:"adore",fr:"J’adore",display:"J’adore",en:"I love",symbol:"❤️❤️",strength:5},
    {id:"aime",fr:"J’aime",display:"J’aime (beaucoup)",en:"I like",symbol:"❤️",strength:4},
    {id:"prefere",fr:"Je préfère",display:"Je préfère",en:"I prefer",symbol:"❤️👍",strength:3},
    {id:"naimepas",fr:"Je n’aime pas",display:"Je n’aime pas (beaucoup)",en:"I don’t like",symbol:"❌❤️",strength:2},
    {id:"deteste",fr:"Je déteste",display:"Je déteste",en:"I hate",symbol:"❌❤️❌❤️",strength:1}
  ],
  opinionAnimals:[
    {id:"chiens",singular:"un chien",fr:"les chiens",en:"dogs",emoji:"🐕"},
    {id:"chats",singular:"un chat",fr:"les chats",en:"cats",emoji:"🐈"},
    {id:"lapins",singular:"un lapin",fr:"les lapins",en:"rabbits",emoji:"🐇"},
    {id:"hamsters",singular:"un hamster",fr:"les hamsters",en:"hamsters",emoji:"🐹"},
    {id:"souris",singular:"une souris",fr:"les souris",en:"mice",emoji:"🐭"},
    {id:"poissons",singular:"un poisson rouge",fr:"les poissons rouges",en:"goldfish",emoji:"🐟"},
    {id:"oiseaux",singular:"un oiseau",fr:"les oiseaux",en:"birds",emoji:"🐦"},
    {id:"chevaux",singular:"un cheval",fr:"les chevaux",en:"horses",emoji:"🐎"}
  ],
  priorKnowledge:{
    previousWeek:"Pets, colours and descriptions",
    bridge:[
      {before:"J’ai un chien noir.",after:"J’aime les chiens.",idea:"from one dog to dogs in general"},
      {before:"un chat",after:"les chats"},
      {before:"un lapin",after:"les lapins"},
      {before:"un oiseau",after:"les oiseaux"},
      {before:"un cheval",after:"les chevaux"}
    ]
  },
  people:[
    {
      id:"chantal",name:"Chantal",
      first:{opinion:"adore",animal:"oiseaux"},
      connector:"mais",
      second:{opinion:"deteste",animal:"poissons"},
      sourcePrintedExample:"Je m'appelle Chantal. J'adore les oiseaux mais je déteste les oiseaux.",
      ambiguity:true
    },
    {
      id:"ahmed",name:"Ahmed",
      first:{opinion:"aime",animal:"chiens"},
      connector:"et",
      second:{opinion:"prefere",animal:"poissons"}
    },
    {
      id:"ethan",name:"Ethan",
      first:{opinion:"naimepas",animal:"chiens"},
      connector:"et",
      second:{opinion:"deteste",animal:"souris"}
    },
    {
      id:"sophie",name:"Sophie",
      first:{opinion:"adore",animal:"chats"},
      connector:"mais",
      second:{opinion:"naimepas",animal:"chevaux"}
    }
  ]
});