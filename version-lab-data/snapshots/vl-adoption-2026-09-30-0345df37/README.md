# InClass

A lightweight, dated school-homework app. Each homework pack is retained as a permanent week and selected by **subject → week**.

Current release: **v2026.09.29.9**

## Current packs

### English · Year 5 · Friday 25 September 2026
Source: the supplied school homework slides.

Focus: **Plurals — add -s or -es**

The app preserves the supplied Year 5 list:
1. benches
2. planets
3. volcanoes
4. statues
5. canyons
6. torches
7. mountains
8. serpents
9. protagonists
10. antagonists
11. suffixes
12. prefixes

It also includes the irregular-plural warm-up from the slides: mouse → mice, foot → feet, goose → geese, man → men, woman → women.

Practice follows the test structure shown by the school:
- 4 questions: hear a word and spell it
- 4 questions: read a definition and identify the spelling word
- 4 questions: use a spelling word in a sentence

The school slide leaves the test date blank and states that next week's rule is **Double consonants**.

Because the homework says pupils will be tested on meaning and sentence use but does not provide definitions for the 12 Year 5 words, InClass adds short learner-friendly definitions and example sentences. These are app-generated study support, not copied from the school slides.

### French · Year 5
Source: supplied pets/colours/descriptions vocabulary sheet.

Practice includes:
- tap-to-hear French pronunciation
- hear → spell
- pet + colour + description sentence building
- adjective agreement for *une souris*
- listen-and-repeat speaking practice
- a constrained mini-conversation using the taught vocabulary, with typed input and microphone speech recognition where the browser supports it

## Pronunciation lab prototype

French lessons now include a reusable pronunciation-coaching component loaded from the central `Apps` shared library: `apps-pronunciation.js`.

The prototype provides:
- an AI-generated standard pronunciation reference by default, requested through the server-side pronunciation worker;
- a live stylised speech waveform driven by the microphone;
- browser speech-to-text comparison against the target sentence;
- optional teacher/parent model recording that can replace the generated reference, including a model-vs-child contour trace after each attempt;
- separate words, rhythm, intonation and overall prototype scores;
- learner-facing coaching cues rather than a single unexplained mark;
- local-first student audio handling: recorded student audio is not uploaded by the default adapter; only the target text is sent to the reference generator.

The browser recogniser is **not treated as a phoneme-level pronunciation examiner**. The module exposes a `scoreAdapter` hook so a future specialist pronunciation service can return phoneme/word-level scores without changing the InClass UI. InClass records prototype metrics separately and does not treat the score as proof that pronunciation is mastered.

## Data model

Homework is split into permanent dated pack files under `data/` and loaded through `data/manifest.js`. Each pack has a permanent ID, subject, year group, source date and structured lesson data. Progress is stored separately for each learner and pack.

The interface is deliberately data-driven so later homework weeks can be added without rebuilding the page layout. A lightweight spaced-retrieval store schedules correctly answered English words for later review; when a later English pack is active, due words from older packs surface automatically.

## Learning design

The app distinguishes different retrieval tasks rather than treating all correct answers as equivalent:
- recognition / learning
- spelling from audio
- meaning retrieval
- applying a rule
- using vocabulary in a sentence
- speaking practice

English includes a generated 12-question practice test matching the format stated in the homework. Sentence answers receive a structural check only; semantic quality should still be judged by a parent or teacher.

## Technical approach

The app is static and suitable for GitHub Pages / PWA use on iPhone and iPad. It uses browser speech synthesis for audio and local storage for learner progress.

The service worker caches the app shell and current homework data for offline use.

## Planned ingestion workflow

The intended weekly workflow is:

**parent supplies homework image → homework is reviewed/extracted → a dated pack is added to the data store → the learner gets a structured lesson and test practice**

A future secure ingestion service can automate the image-to-pack step, but API credentials should not be exposed in client-side JavaScript.


## French extension vocabulary

The first French week now keeps the school vocabulary distinct from optional InClass extension material.

Extension material includes:
- the missing rainbow colours plus pink
- spider, rat, cow, lamb, sheep, worm and slug
- common UK garden birds such as robin, blue tit, great tit, blackbird, sparrow, magpie, woodpigeon, starling, chaffinch, goldfinch, dunnock and wren
- the practical sentence frame: **Aujourd’hui, j’ai vu … dans le jardin.**

The app explicitly teaches that noun gender and biological sex are different ideas. Animal nouns should normally be learnt with their article (for example **un oiseau**, **une souris**, **une araignée**) rather than generated by a simple “add e” rule.

It also teaches common adjective-agreement patterns and exceptions. The original school sentence frame remains visible, but the builder presents a clearer beginner version as two sentences, for example **J’ai un oiseau bleu. Il est intelligent.**

### Paper dictation mode

French now includes a parent checklist for handwriting practice. The parent can:
- choose school words, extension words or sentences
- hide the written French
- play each item aloud
- tick it correct or incorrect after Sai writes it on paper
- retain the marks locally for that learner and homework week


## Learning glossary and word help

Words in both English and French now have an information icon that opens a short definition, an example sentence and a Sai-relevant example. Examples draw on familiar contexts such as sailing, camping, garden birds, school, music and the book he is reading, without inventing a specific book title.

Grammar terminology is treated as learnable content rather than assumed knowledge. In the English plural lesson, **noun** is underlined/clickable and opens:
1. a concise definition,
2. clear examples,
3. a picture-supported noun-selection activity,
4. the same task with words only,
5. a transfer task using new words.

The plural explanation also shows one dog beside several dogs before introducing the written change **dog → dogs**.

The French grammar section explains why French has grammatical gender, why grammatical gender is not the same as biological sex, why **un/une** should be learnt with the noun, and how adjective agreement differs from noun gender.


## Homework-first hierarchy

InClass now treats each homework pack as three distinct layers:

1. **Required homework** — the source material Sai is likely to be tested on. This is always open and appears first.
2. **Understanding** — definitions, visual explanations, clickable grammar terms and short concept checks.
3. **Extension** — broader vocabulary, transfer activities, conversations and deeper exploration.

Optional material is collapsed by default so it cannot crowd out the school task.

For the current French pack:
- the original school animals, colours, descriptions and sentence frame remain visible,
- school words are the default hear/spell and handwriting sets,
- the original combined sentence frame remains the main sentence builder,
- grammatical-gender explanations, adjective patterns, garden birds and extension vocabulary are collapsed.

## Welcome screen and role dashboards

The app now opens on a dedicated InClass welcome screen rather than directly inside a lesson.

The local preview contains three role views:

- **Learner** — current homework, school work first.
- **Parent** — one or more linked children, completion, practice accuracy and weak items.
- **Teacher** — linked class roster, completion, attempts, accuracy, learner-level attention items and common class issues.

Only real local data is shown; no fictional classmates are generated to make the teacher dashboard look populated.

## Authentication and cloud-ready architecture

The app still runs locally, but authentication and persistence are now separated from lesson code:

- `config/app-config.js` — app mode and future Firebase configuration.
- `services/auth-service.js` — role/session boundary.
- `services/data-service.js` — user-scoped local cache, analytics and Firebase write-through hooks.
- `services/firebase-provider.template.js` — contract for the future Firebase implementation.
- `docs/FIREBASE_ARCHITECTURE.md` — proposed Firestore model, parent-child links, classes, enrolments and security-rule intent.

This means Firebase Authentication and Firestore can be connected later without rewriting each subject lesson.
