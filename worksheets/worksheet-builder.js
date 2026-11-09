(function(root){
"use strict";
// A curated print variant of every permanent InClass lesson. Do not fall back to a
// generic dump of app exercises: the coverage test requires an explicit case.
const Q=(prompt,answer,category="recall",lines=1,extra={})=>Object.assign({prompt,answer,category,lines},extra);
const S=(title,tier,questions,note="",pageBreak=false)=>({title,tier,questions,note,pageBreak});
const T=(term,meaning)=>({term,meaning});
const study=(title,text)=>({title,text});
const code={required:"School task",understanding:"Understand why",extension:"Optional extension"};
function build(w){
 if(!w||!w.id)return null;
 let school="",note="",focus="",concepts=[],guide=[],sections=[],source=w.source||"";
 const english=w.subjectKey==="english";
 if(w.id==="2026-09-25-english-plurals-y5"){
  focus="Spell the twelve assigned plurals, explain the spelling choice, and use words accurately.";
  school="Learn the 12 Year 5 plural words, meanings and original sentences. Practise the school's 4 dictated spellings + 4 definitions + 4 sentences.";
  guide=[study("School word list (cover for the independent test)",w.words.map(x=>x.word).join(" · ")),study("Starter","A noun names something; a plural means more than one. Most nouns add -s; many ending s, x, z, ch or sh add -es.")];
  concepts=[T("Noun","A naming word such as bench or planet."),T("Plural","A form meaning more than one."),T("Suffix","Letters added to the end of a word, such as -es in benches."),T("Irregular plural","A plural that changes in a less predictable way, like mouse to mice.")];
  sections=[
   S("School-style spelling check","required",w.words.slice(0,4).map((x,i)=>Q("Dictation "+(i+1)+": adult says the word. Write it without looking at the word list.",x.word,"recall",1,{adultCue:"Read aloud: "+x.word})).concat(w.words.slice(4,8).map((x,i)=>Q("Definition "+(i+1)+": "+x.definition+".",x.word,"recall",1))).concat(w.words.slice(8,12).map((x,i)=>Q("Sentence "+(i+1)+": write your own meaningful sentence using '"+x.word+"'.","Accept an original sentence using '"+x.word+"' correctly in context.","writing",2))),"Parent: read the four dictation words from the answer key. Fold away the word list during the test.",true),
   S("Explain the rule","understanding",[
    Q("What is the difference between a noun and its plural? Show an example.","A noun names a thing. Its plural means more than one, e.g. bench/benches.","concept",2),
    Q("Why does torch become torches, but planet becomes planets?","Torch ends ch, so add -es; planet uses the usual -s.","concept",2),
    Q("Write the plurals of mouse, foot and goose. Why cannot we just add -s?", "mice; feet; geese. These are irregular plurals.","concept",2),
    Q("Volcano becomes volcanoes. Is the final -o covered by the s/x/z/ch/sh rule?","No. Volcanoes is an extra spelling pattern/exception to the displayed rule.","concept",2)
   ]),
   S("Make a new connection","extension",[
    Q("Write the plural of 'class'. Explain why it ends -sses.","classes. Class already ends ss; add -es.","transfer",2),
    Q("Invent a short museum sign using at least two of: statues, protagonists, volcanoes.","Any natural sign using two listed plural words correctly.","transfer",3)
   ])
  ];
 } else if(w.id==="2026-10-05-english-cat-vocabulary"){
  focus="Choose the word that fits the context, then explain its effect.";
  school="Complete all 20 choices from the two supplied pages, then write three original sentences. The third source page was not supplied.";
  note="Only pages 1 and 2 of 3 were supplied. This printable practice covers those 20 visible questions, not an invented third page.";
  concepts=[T("Context clue","Nearby words that help us work out the meaning."),T("Precise vocabulary","A word that gives a more exact picture than a vague word."),T("Mood","The feeling that a piece of writing creates."),T("Effect","What the reader pictures or feels because of a word.")];
  guide=[study("Worked example","The cat PROWLED silently. 'Prowled' means moved quietly, often while hunting; 'walked' is less precise.")];
  sections=[
   S("All 20 choices from the supplied pages","required",w.questions.map((x,i)=>Q(x.sentence.replace(/^\d+\.\s*/,"")+"  Choose: "+x.options.join(" / ")+".",x.answer+" — "+x.explanation,"recall",1)),"Circle or write the best word, then compare your reasoning with the parent key."),
   S("Create your own writing","required",[
    Q("Write an original sentence using 'inquisitive'.","Accept a sentence showing curiosity/eagerness to discover.","writing",2),
    Q("Write an original sentence using 'bedraggled'.","Accept a sentence meaning wet, dirty and untidy.","writing",2),
    Q("Write an original sentence using 'poised'.","Accept a sentence showing being balanced/prepared to act.","writing",2)
   ]),
   S("Explain rather than guess","understanding",[
    Q("Why is 'slunk' stronger than 'walked' for a frightened cat?","It implies quiet, cautious movement, which conveys nervousness.","concept",2),
    Q("What is the difference between 'stalked' and 'chased'?","Stalked is quiet deliberate following; chased suggests fast pursuit.","concept",2),
    Q("Choose 'placid' or 'skittish' for a relaxed cat by the fire. Explain.","Placid: calm and peaceful; skittish: easily startled.","concept",2)
   ]),
   S("Unseen transfer","extension",[
    Q("A dog crept under a chair whenever it heard thunder. Choose a precise word for its movement and explain the mood.","Possible: slunk. Creates a frightened, cautious mood; accept justified alternatives.","transfer",3)
   ])
  ];
 } else if(w.id==="2026-11-09-english-floss-y5"){
  focus="Distinguish the FLOSS ending pattern from other reasons English doubles letters.";
  school="Learn all 12 Year 5 spellings and meanings. Practise the school's 4 heard spellings + 4 definitions + 4 original sentences. Test date not supplied.";
  note="The Year 6 list is optional and is NOT set as Year 5 work. 'Forbidden' is the school starter but its dd is not strict final f/l/s/z FLOSS.";
  guide=[study("All 12 required Year 5 spellings (cover for the test)",w.schoolTask.year5Words.join(" · ")),study("Worked example","Hill: one syllable, short i and final l, so we usually write ll. Heel has a different vowel sound, so the same rule does not apply.")];
  concepts=[T("Vowel sound","A sound such as short i in sit. A written vowel letter is not always a whole sound."),T("Consonant","A sound made with some airflow stopped; f, l, s and z are consonant letters."),T("Syllable","One beat of speech: hill has one; muf-fin has two."),T("FLOSS rule","A usual spelling pattern for one-beat words with a short vowel followed by final f, l, s or z; the consonant is often doubled."),T("Base word and suffix","The original word and an ending added to it, such as nuzzle + -ing becoming nuzzling.")];
  sections=[
   S("School-format 12-question test","required",w.words.slice(0,4).map((x,i)=>Q("Dictation "+(i+1)+": listen to the adult. Write the spelling.",x.word,"recall",1,{adultCue:"Read aloud: "+x.word})).concat(w.words.slice(4,8).map((x,i)=>Q("Definition "+(i+1)+": "+x.definition+".",x.word,"recall",1))).concat(w.words.slice(8,12).map((x,i)=>Q("Sentence "+(i+1)+": use '"+x.word+"' in an original sentence.","Accept the exact spelling and a sentence showing its meaning: "+x.definition+".","writing",2))),"Hide the word bank for this independent check. Parent reads the first four words from the answer sheet.",true),
   S("Why does the spelling change?","understanding",[
    Q("What is a syllable? Count the beats in hill and muffin.","One spoken beat. Hill has 1; muf-fin has 2.","concept",2),
    Q("Why does 'miss' have ss but 'leaf' has one final f?","Miss has a one-beat short vowel followed by final s; leaf has a long vowel sound.","concept",2),
    Q("The school starter asks about 'forbidden'. Is its dd the strict FLOSS rule? Explain.","No. FLOSS covers final f/l/s/z in certain one-beat words. Forbidden is a different double-consonant pattern related to forbid.","concept",3),
    Q("Which does NOT have doubled letters: drizzle, bristling, paddle? Why?", "Bristling. Bristle loses the e before -ing; it has no doubled consonant.","concept",2)
   ]),
   S("Try unfamiliar examples","extension",[
    Q("Spell the one-syllable word /fiz/ meaning a gentle bubbling sound. Why?","fizz: short i then final z, usually zz.","transfer",2),
    Q("What is the plural of 'class'? Connect two spelling rules.","classes: keep the ss and add -es because the singular ends in s.","transfer",2)
   ])
  ];
 } else if(w.id==="2026-09-french-pets"){
  focus="Build new French sentences from animals, colours and descriptions, not just recall a list.";
  school="Learn pet words, colours and describing words. Use the school frame J'ai + animal + colour + et + description.";
  guide=[study("Quick vocabulary",w.animals.slice(0,8).map(x=>x.fr+" = "+x.en).join(" · ")),study("Sentence pattern","J'ai un chien noir et mignon. = I have a black and cute dog.  J'ai une souris blanche et mignonne. = I have a white and cute mouse.")];
  concepts=[T("Noun gender","French nouns belong to grammatical groups called masculine and feminine; a mouse is 'une souris', even if its sex is unknown."),T("Article","A little word attached to the noun: un for masculine; une for feminine here."),T("Adjective","A word that describes a noun, such as colour or personality."),T("Agreement","In French, the describing word may change to match the noun's grammatical gender.")];
  sections=[
   S("School vocabulary and sentences","required",[
    ...w.animals.slice(0,6).map(x=>Q("Translate into French, including 'a': "+x.en+".",x.fr,"recall",1)),
    Q("Write in French: I have a black dog.","J'ai un chien noir.","writing",2),
    Q("Write in French: I have a white mouse.","J'ai une souris blanche.","writing",2),
    Q("Write in French: I have a cute, blue bird. Join the colour and quality with 'et'.","J'ai un oiseau bleu et mignon.","writing",2),
    Q("Create your OWN French sentence using a pet, a colour and a description.", "Accept J'ai + un/une animal + correctly agreeing colour + et + description, with sensible meaning.","writing",3)
   ],"Say the French aloud before you write it."),
   S("Find the reason","understanding",[
    Q("Why is it 'un chien' but 'une souris'? Does this tell us the animal's sex?","They belong to different grammatical noun-gender groups; it does not necessarily describe the individual animal's sex.","concept",2),
    Q("Compare un chat noir and une souris noire. What changed and why?","Noir changes to noire to agree with the feminine noun souris.","concept",2),
    Q("What is the purpose of 'et' in a sentence?","It means 'and' and connects descriptions/ideas.","concept",2)
   ]),
   S("Build something new","extension",[
    Q("Change 'J'ai un chien vert et intelligent' so it describes a mouse.","J'ai une souris verte et intelligente.","transfer",2),
    Q("Draw your own imaginary pet. Label it using three French words.", "Accept a labelled pet with correctly formed noun, colour, description.","transfer",2,{draw:true})
   ])
  ];
 } else if(w.id==="2026-10-05-french-opinions"||w.id==="2026-10-05-french-opinions-v2"){
  const v2=!!w.opinionsV2;
  focus=v2?"Say, understand, change and then write new French opinions.":"Express likes and dislikes about animals using plural nouns.";
  school="Use the five opinion phrases and animal words to write joined opinions for Chantal, Ahmed, Ethan and Sophie from the supplied clues.";
  note="The school's printed Chantal sentence says she hates birds although the negative picture appears to show a goldfish. The answer guide follows the picture/reference sheet and flags this as uncertain, not an official correction.";
  guide=[study("Opinion phrase bank",w.opinions.map(x=>x.fr+" = "+x.en).join(" · ")),study("Useful nouns",w.opinionAnimals.map(x=>x.fr+" = "+x.en).join(" · ")),study("Worked example","J'aime les chats mais je n'aime pas les chiens. = I like cats but I do not like dogs.")];
  concepts=[T("Opinion","A statement about what you think or feel, not a proven fact."),T("Plural","More than one; French often says les chiens for dogs in general."),T("Elision","French shortens je to j' before a vowel, so je + aime becomes j'aime."),T("Connector","Et means and; mais means but, often showing contrast.")];
  const people=[
   Q("Chantal loves birds but hates the pictured goldfish. Write 'Je m'appelle Chantal' then her two opinions joined by mais.","Je m'appelle Chantal. J'adore les oiseaux mais je déteste les poissons rouges. (Picture-led interpretation; printed text conflicts.)","writing",3),
   Q("Ahmed likes dogs AND prefers goldfish. Write two joined French opinions.","J'aime les chiens et je préfère les poissons rouges.","writing",3),
   Q("Ethan does NOT like dogs AND hates mice. Write two joined French opinions.","Je n'aime pas les chiens et je déteste les souris.","writing",3),
   Q("Sophie loves cats BUT dislikes horses. Write two joined French opinions.","J'adore les chats mais je n'aime pas les chevaux.","writing",3)
  ];
  sections=[
   S("The school writing task","required",people,"Write the sentences in French without copying the word bank after practice."),
   S("Why these words?","understanding",[
    Q("Why is 'J'aime les chiens' used for dogs in general, rather than 'un chien'?","Les refers to dogs as a group/in general; un chien is one dog.","concept",2),
    Q("Why does je + adore become j'adore?","French drops the e in je before the vowel at the start of adore.","concept",2),
    Q("How is 'et' different from 'mais'? Give an example.","Et links ideas (and); mais sets up a contrast (but).","concept",2),
    ...(v2?[Q("Change 'J'aime les chats' into 'I do not like cats'. What stays the same?","Je n'aime pas les chats. The animal phrase les chats stays the same; negation changes the verb phrase.","concept",2)]:[])
   ]),
   S(v2?"Unseen speak → transform → write":"Make an original opinion","extension",[
    Q("Write one NEW sentence about an animal not used in the four homework rows.","Any grammatically correct opinion with les + plural animal and sensible meaning.","transfer",2),
    Q("Say a joined opinion aloud, then write it with the opposite feeling in the second half.","Accept original pair with et or mais and correct changes to the second opinion.","transfer",3)
   ],v2?"Say each answer aloud before writing; this is the optional first-principles version.":"Optional practice, not additional school requirements.")
  ];
 } else if(w.id==="2026-11-02-french-avoir"){
  focus="Know what each avoir form means and select the correct spelling from the subject.";
  school="Learn all six present-tense forms of avoir; spelling matters for je, tu, il/elle, nous, vous and ils/elles. School quick test: Friday 6 Nov 2026.";
  guide=[study("Worked example","Tu as un chien. = You have a dog. Il a un chien. = He has a dog. As and a sound similar but the subject changes the spelling."),study("Revision video (optional, screen required)",w.videoUrl||"")];
  concepts=[T("Verb","A word that tells us what someone does or what is true, like 'have'."),T("Infinitive","The naming form of a verb: avoir = to have."),T("Pronoun","A short word that stands for a person or group: I, you, he, she, we, they."),T("Verb form","A version of the same verb that fits the subject, such as ai/as/a."),T("Present tense","A verb form used for what is happening or generally true now; past and future refer to other times.")];
  sections=[
   S("Six-form school spelling test","required",w.forms.map((x,i)=>Q("Write in French: "+x.english+" ("+x.pronouns+").",x.french,"recall",1)),"Cover the example and try from memory. Match the pronoun to the spelling.",true),
   S("Explain your choice","understanding",[
    Q("Why do tu as and il a have different spellings, although they sound similar?","The subject/pronoun selects a different form of avoir: tu -> as, il/elle -> a.","concept",3),
    Q("What is an infinitive? What is the infinitive of 'j'ai'?","The naming form of a verb; avoir.","concept",2),
    Q("What is present tense? Name another tense without having to learn it.","Used for now/general truth; past or future are other tenses.","concept",2),
    Q("Why do we write j'ai rather than je ai?","Je loses its final e before the vowel sound in ai: j'ai.","concept",2)
   ]),
   S("Connect back to animals","extension",[
    Q("Translate: We have a rabbit.","Nous avons un lapin.","transfer",2),
    Q("Change 'J'ai une souris' to 'They have a mouse' (mixed group).","Ils ont une souris.","transfer",2),
    Q("Write a new French sentence using a different subject and pet.","Accept correct pronoun + avoir form + article + pet noun.","transfer",2)
   ])
  ];
 } else if(w.id==="2026-11-09-french-spider-alphabet"){
  focus="Recall connected animal vocabulary, complete the book diagram and practise French letter names.";
  school="Complete the ORIGINAL spider diagram in the school exercise book, revise the ORIGINAL alphabet sheet in the book; two end-of-unit tests were announced without exact test papers.";
  note="This worksheet is extra revision; it does not replace the diagram glued into the exercise book or submit anything to Microsoft Teams. Only the five anchors are confirmed on the school sheet.";
  concepts=[T("Spider diagram","A central idea with branches for related words. It helps organise and retrieve what you know."),T("Alphabet letter name","The spoken name of a letter; it may sound different in French and English."),T("Opinion vs possession","J'aime means I like; j'ai means I have. Different verbs even though both start with j'."),T("Agreement","Some French adjectives change spelling depending on the noun they describe.")];
  guide=[study("Five printed branch examples","Opinions: j'aime · Pets: un chien · Colours: rouge · Size: petit · Personality: intelligent"),study("Alphabet rehearsal","Ask an adult to say the letters A–Z in random order. Point to each, say its French name, then write the letters you hear.")];
  sections=[
   S("School exercise-book task","required",[
    Q("In your EXERCISE BOOK, finish all five branches: Opinions / Pets / Colours / Size / Personality. On the space here, sketch your own memory spider without a word bank.","Check the school-book diagram is completed. Extra memory spider should have the five categories and relevant French words.","writing",1,{draw:true}),
    Q("Revise the ORIGINAL French alphabet sheet in your exercise book. Ask an adult to dictate eight different letter names; write the eight letters you hear.","Check eight letter names using the full 26-letter key. Adult should record which were spoken; do not invent the teacher's official test.","recall",2,{adultCue:"Choose 8 from the 26 letter names in the parent key."})
   ]),
   S("Unofficial mixed-term practice","understanding",[
    Q("What is the difference between j'ai and j'aime? Use each in a sentence.","J'ai = I have; J'aime = I like. E.g. J'ai un chat. J'aime les chats.","concept",3),
    Q("Why is un chien noir but une souris noire?","Chien is masculine; souris feminine. The adjective often changes to agree.","concept",2),
    ...w.mockQuestions.filter(x=>["pet-dog","pet-mouse","colour-red","opinion-like","avoir-tu","avoir-nous"].includes(x.id)).map(x=>Q(x.prompt,x.answer,"recall",1))
   ],"These are revision examples, NOT a claim about the official end-of-unit test."),
   S("Link three earlier lessons","extension",[
    Q("Write: 'I have a black dog, but I like mice' in two French sentences.","J'ai un chien noir. Mais j'aime les souris. Accept two correct sentences using avoir + opinions.","transfer",3),
    Q("Create your own three-sentence French pet story using avoir, colour and opinion.","Accept accurate sentences connecting a pet, its colour and a personal opinion.","transfer",4)
   ])
  ];
 } else return null;
 return {id:w.id,title:w.title,subject:w.subject,yearGroup:w.yearGroup||"Year 5",date:w.date,focus,school,note,source,guide,concepts,sections,version:1};
}
function audit(pack){
 if(!pack)return ["No curated worksheet for lesson"];
 const issues=[];
 if(!pack.school||!pack.focus)issues.push("Missing purpose or preserved school assignment");
 if(!Array.isArray(pack.concepts)||pack.concepts.length<3)issues.push("Missing term/prerequisite explanations");
 for(const tier of ["required","understanding","extension"]){
  const qs=pack.sections.filter(s=>s.tier===tier).flatMap(s=>s.questions);
  if(qs.length<(tier==="required"?2:1))issues.push("Insufficient "+tier+" practice");
  for(const x of qs)if(!x.prompt||!x.answer||!x.category||!(x.lines>=1))issues.push("Incomplete question in "+tier);
 }
 if(!pack.sections.some(s=>s.questions.some(q=>q.category==="concept")))issues.push("No independent conceptual explanation");
 if(!pack.sections.some(s=>s.questions.some(q=>q.category==="transfer")))issues.push("No unseen transfer");
 return issues;
}
root.InClassWorksheets={build,audit,labels:code};
})(window);
