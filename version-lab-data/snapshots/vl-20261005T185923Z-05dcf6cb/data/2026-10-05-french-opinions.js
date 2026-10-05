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
    {id:"opinions",title:"Les opinions reference sheet",kind:"reference",parts:["assets/source-sheets/2026-10-05-opinions.01.b64","assets/source-sheets/2026-10-05-opinions.02.b64","assets/source-sheets/2026-10-05-opinions.03.b64","assets/source-sheets/2026-10-05-opinions.04.b64"],mime:"image/webp"}
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
    {id:"aime",fr:"J’aime",display:"J’aime",en:"I like",symbol:"❤️",strength:4},
    {id:"prefere",fr:"Je préfère",display:"Je préfère",en:"I prefer",symbol:"❤️👍",strength:3},
    {id:"naimepas",fr:"Je n’aime pas",display:"Je n’aime pas",en:"I don’t like",symbol:"❌❤️",strength:2},
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
  verbReference:{
    aimer:{infinitive:"aimer",en:"to like",type:"regular -er verb",forms:[["j’aime","I like"],["tu aimes","you like"],["il / elle aime","he / she likes"],["nous aimons","we like"],["vous aimez","you like"],["ils / elles aiment","they like"]],note:"Before a vowel, je becomes j’: je + aime → j’aime."},
    adorer:{infinitive:"adorer",en:"to love",type:"regular -er verb",forms:[["j’adore","I love"],["tu adores","you love"],["il / elle adore","he / she loves"],["nous adorons","we love"],["vous adorez","you love"],["ils / elles adorent","they love"]],note:"Before a vowel, je becomes j’: je + adore → j’adore."},
    faire:{infinitive:"faire",en:"to do / to make",type:"irregular verb",forms:[["je fais","I do / make"],["tu fais","you do / make"],["il / elle fait","he / she does / makes"],["nous faisons","we do / make"],["vous faites","you do / make"],["ils / elles font","they do / make"]],note:"In faire de la voile, French uses faire + de la voile for ‘to go sailing / to do sailing’."},
    jouer:{infinitive:"jouer",en:"to play",type:"regular -er verb",forms:[["je joue","I play"],["tu joues","you play"],["il / elle joue","he / she plays"],["nous jouons","we play"],["vous jouez","you play"],["ils / elles jouent","they play"]],note:"With games and sports, jouer commonly uses à: jouer au hockey. With an ensemble/place, it can use dans: jouer dans un orchestre."},
    nager:{infinitive:"nager",en:"to swim",type:"regular -er verb",forms:[["je nage","I swim"],["tu nages","you swim"],["il / elle nage","he / she swims"],["nous nageons","we swim"],["vous nagez","you swim"],["ils / elles nagent","they swim"]],note:"After aimer, the second verb stays in the infinitive: J’aime nager = I like to swim / I like swimming."}
  },
  personalInterests:[
    {id:"sailing",fr:"J’adore faire de la voile.",en:"I love sailing.",emoji:"⛵",verbs:[{surface:"J’adore",key:"adorer"},{surface:"faire",key:"faire"}]},
    {id:"hockey",fr:"J’aime jouer au hockey.",en:"I like playing hockey.",emoji:"🏑",verbs:[{surface:"J’aime",key:"aimer"},{surface:"jouer",key:"jouer"}]},
    {id:"netball",fr:"J’aime jouer au netball.",en:"I like playing netball.",emoji:"🏐",verbs:[{surface:"J’aime",key:"aimer"},{surface:"jouer",key:"jouer"}]},
    {id:"orchestra",fr:"J’adore jouer dans un orchestre.",en:"I love playing in an orchestra.",emoji:"🎼",verbs:[{surface:"J’adore",key:"adorer"},{surface:"jouer",key:"jouer"}]},
    {id:"swimming",fr:"J’aime nager.",en:"I like swimming.",emoji:"🏊",verbs:[{surface:"J’aime",key:"aimer"},{surface:"nager",key:"nager"}]}
  ],
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