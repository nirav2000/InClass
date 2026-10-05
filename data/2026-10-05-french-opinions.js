window.INCLASS_WEEKS.push({
  id:"2026-10-05-french-opinions",
  subject:"French",
  subjectKey:"french",
  yearGroup:"Year 5",
  date:"Week 2 · 5 Oct",
  title:"Opinions about animals",
  lead:"Decode the picture clues, build the school sentence, say it clearly, then write it independently.",
  source:"French homework screenshot supplied by parent on 5 October 2026, plus the teacher instruction quoted by the parent.",
  opinionsHomework:true,
  sourceNote:"The teacher says to use the separate ‘Les Opinions’ and animals sheets. Those sheets have not yet been supplied to InClass, so the heart-symbol meanings below are inferred from the worksheet pattern. The printed Chantal example appears to say ‘je déteste les oiseaux’ although the crossed-heart symbol is beside a fish; InClass uses ‘les poissons’ for that pictured clue and flags this as a source ambiguity.",
  contentTiers:{
    required:["Je m’appelle + name","opinion phrase + les + animal","et / mais","decode the picture clues","write the two sentences independently"],
    understanding:["J’aime / J’adore elision","why general animal likes use les","difference between et and mais","opinion-strength ladder"],
    extension:["pronunciation comparison with the generated French model"]
  },
  opinions:[
    {id:"adore",fr:"J’adore",en:"I love",symbol:"❤️❤️",strength:4},
    {id:"aime",fr:"J’aime",en:"I like",symbol:"❤️",strength:3},
    {id:"naimepas",fr:"Je n’aime pas",en:"I don’t like",symbol:"💔",strength:2},
    {id:"deteste",fr:"Je déteste",en:"I hate",symbol:"❌❤️❤️",strength:1}
  ],
  opinionAnimals:[
    {id:"oiseaux",fr:"les oiseaux",en:"birds",emoji:"🐦"},
    {id:"poissons",fr:"les poissons",en:"fish",emoji:"🐟"},
    {id:"chiens",fr:"les chiens",en:"dogs",emoji:"🐕"},
    {id:"souris",fr:"les souris",en:"mice",emoji:"🐭"},
    {id:"chats",fr:"les chats",en:"cats",emoji:"🐈"},
    {id:"chevaux",fr:"les chevaux",en:"horses",emoji:"🐎"}
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
      connector:"mais",
      second:{opinion:"naimepas",animal:"poissons"}
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