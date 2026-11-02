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


## Home Screen app installation and icon workflow (November 2026)

InClass consumes the **shared** Apps PWA v1 infrastructure rather than maintaining a separate installation library. The app already has one `sw.js` worker that imports the shared worker, an app-specific manifest and a visible `Install app` control on the welcome page.

- Open [InClass](https://nirav2000.github.io/InClass/) in **Safari** on an iPhone or iPad. Use **Share → Add to Home Screen**, then launch it from the new icon. Inside InClass, **Install app** displays the shared installation/standalone diagnostic.
- The current initial brand is `insight-book`: a book with an understanding spark. The full set of editable SVG concept previews is available in the [PWA Icon Lab](https://nirav2000.github.io/Apps/pwa/v1/icon-gallery.html).
- `pwa.config.json` controls app name, colours, URL scope and icon concept. `.github/workflows/pwa-assets.yml` uses the shared generator to create `icon.svg`, `icons/favicon.svg`, PNG 180/192/512 and a 512px maskable PNG. The workflow checks icon dimensions, manifest integrity and the preservation of French lessons before committing updated assets to main.
- The [PWA portfolio readiness dashboard](https://nirav2000.github.io/Apps/pwa/v1/portfolio.html) distinguishes verified manifest/icon files from on-device service-worker and standalone testing.

**Device verification is separate:** GitHub Actions passing does not verify Add to Home Screen, actual offline behaviour or updates on a physical iPhone/iPad.

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

## Shared Notes & Annotations (InClass)

InClass uses the canonical `Apps/notes/v1` module (currently **v1.2.6**), never a forked note editor. The shared editor supports note creation, touch element selection, drafts, history, editing, archiving, reopening, and a reviewed ChatGPT JSON text-edit round trip. Shared identity selection is provided by `Apps/notes/v1/identity-picker.js`, while the shared App Monitor passkey client remains `Apps/apps-passkey-auth.js`.

**Storage and roles:** All notes save first into a local store scoped to the preview data owner, learner and permanent homework-pack ID. The preview role switch is not security. The optional verified `kk-syllabus` parent Firebase identity syncs the corresponding `families/{ownerUid}/learners/{learnerId}/progress/inclass-notes-{packId}` document. The existing parent session is reused via the default Firebase app identity, with a legacy InClass login fallback. An existing verified App Monitor administrator passkey can use the Cloudflare Worker bridge to the same per-lesson Firestore document. If the cloud connection fails, notes remain locally saved with an actionable status; do not interpret passkey recognition as proof of a successful Firestore write.

**Privacy:** Lesson notes and learner observations never automatically become GitHub Issues. A separate administrator-only development-feedback form requires a public-safe description and explicit confirmation before submission. The browser never contains Firebase administrator credentials or GitHub tokens.

**Release and PWA:** InClass v2026.11.02.8 uses the shared Notes v1.2.6 editor and the shared identity picker v1.0.2. The service worker uses the `inclass-shared-v14` cache with a network-first strategy online and an offline fallback. The Notes sync chooser displays the build versions. Do not erase Safari site storage to resolve a cache problem: it contains local notes and homework progress.

**Quality assurance:** InClass CI checks notes merging, scope enforcement and PWA release configuration. Apps CI runs Chromium interactions for create/save/edit/archive/reopen/ChatGPT import and touchscreen annotation, then deploys the shared Worker. GitHub Actions success does not replace a real signed-in iPad/iPhone Firebase round trip. Full acceptance also requires verifying cross-device reads/writes, conflict history, offline recovery and the optional administrator-approved development-issue lifecycle. Existing lessons and progress keys remain unchanged.

## Mobile notes and development feedback acceptance (2 November 2026)

The welcome-screen Notes account action now opens the canonical Shared Notes identity picker rather than the unconfigured application-wide Firebase sign-in. The parent/development tools sit in inline bars on both home and homework screens; they no longer float over the lesson or illustrations. Entry controls remain disabled until their handlers are ready, avoiding silent early taps. The development-feedback dialog shows clear inline validation, privacy consent, an exact before-submit preview, and a keyboard-safe scrolling layout. Feedback is submitted only after verified App Monitor passkey authentication and explicit confirmation.

The independent `.github/workflows/mobile-browser-tests.yml` runs a real Chromium mobile integration test with the actual InClass page and a checkout of the shared Apps library. It verifies phone-sized layout, short-viewport keyboard accessibility, empty and unapproved feedback validation, exactly one explicitly confirmed mock issue, local note saving, navigation to/from homework, shared identity picker opening, full-page reload retaining notes, and iPad-width controls. External issue creation is stubbed during this test; no real GitHub issue is posted and no private learner notes are transmitted to the test backend.

The shared Apps browser test separately verifies the identity picker renders its version element; its missing element caused a real pre-open JavaScript exception and was corrected in the canonical library. Successful CI does not establish a real cross-device authenticated Firestore round trip or genuine iOS Safari/WebKit acceptance, which remain distinct checks.
