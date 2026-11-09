# InClass

A lightweight, dated school-homework app. Each homework pack is retained as a permanent week and selected by **subject → week**.

Current release: **v2026.11.09.1**

## Current packs

### French · 5F-Fr · 9 November 2026 (due Friday 13 November, 08:30)
Source: parent-provided screenshot of Mr Bloom's Microsoft Teams assignment **French Prep (9.11.26)**.

The assignment requires two physical-book tasks: complete the **pets spider diagram** (opinions, pets, colours, size and personality) and revise the **French alphabet reference sheet** stuck in the exercise book last week. The teacher also announced two upcoming end-of-unit tests; no official test paper, exact tested topics, or alphabet sheet was supplied.

InClass now provides:
- school instructions and self-reported **paper diagram** / **alphabet revision** checkboxes, explicitly distinct from submission to Teams;
- five free-response spider branches with locally saved drafts, the exact five printed examples (j’aime, un chien, rouge, petit, intelligent), and **collapsed, labelled** study suggestions reused from older French packs;
- 26 French letter-name playback buttons with listening and letter-recognition practice (8 questions);
- optional explanations connecting j’ai / j’aime, adjective agreement and plural nouns;
- a twelve-question **unofficial** mixed-term revision mock spanning existing pets, colours, opinions, size, personality and avoir content, with attempt-level accuracy and elapsed-time records;
- a visible **5F-Fr · Mr Bloom** class context and direct links to previous lesson packs, without replacing historical packs or progress.

The printed worksheet and alphabet sheet remain in the exercise book. InClass does **not** claim a complete official answer key or a direct Teams connection. No screenshot containing school-account data was committed to this public repository. The new pack is loaded after earlier French data and precached for offline access. Regression coverage: `tests/french-spider-alphabet.test.mjs`.

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

## Session recording (November 2026)

- **Auto-record** is an optional one-time setting in **Notes ▾ → Session recorder**. It is off on a new browser profile; turn it on once on the iPad that will be used for homework. Future homework launches from the dashboard request recording automatically.
- There is no extra parental-approval checkbox. Browser and operating-system screen-sharing/microphone permissions are **not** bypassed: the iPad may ask on each recording. Choosing to cancel shows an unobtrusive **Try recording** action and does not block learning.
- The recorder dialogue closes *before* the screen-sharing picker, avoiding recording the InClass dialogue itself. A visible timer with **Mark stuck** and **Stop & save** remains while recording.
- Returning home stops and saves the current recording automatically. Automatic capture saves privately without reopening the review dialogue. If the learner stops manually, review is available in the Session recorder library. There is **no fixed 20-minute recording cutoff**. The recorder writes data to IndexedDB approximately every five seconds and finalises an independently downloadable video part every five minutes using the same screen/microphone streams (without requesting the system picker again). A crash may still damage the most recent unfinished part, but already committed, finalised parts remain available. Recording stops and saves when the learner exits, presses Stop & save, browser capture ends, or storage becomes critically low.
- Videos and interaction metadata remain in **this browser's IndexedDB only**. They are not uploaded to Firebase, Notes or GitHub. Export recordings before clearing browser site data; review, export and deletion remain available in the same menu.
- On devices without the required browser screen-capture API, use Apple Control Centre → Screen Recording (microphone on), then **Import Apple screen recording**.
- Automated checks cover saving, controls, opt-in preference, duplicate picker prevention, cancellation recovery and the simulated mobile browser workflow. A physical iPad run is needed to verify the real Chrome/iPadOS system picker and microphone capture.

### Browser storage and session recovery

- The **Storage & recording time** area uses `navigator.storage.estimate()`, when available, to display a browser-origin allowance and its used/remaining amounts in MB or GB. This is **not a measurement of free device storage**. The origin is shared with other apps hosted under `nirav2000.github.io`, so their usage contributes to the total. InClass's separately tracked recording size is also shown; very old videos may have unknown sizes. Browsers may revise or evict the allowance.
- Remaining recording time is an **estimate**, initially assuming around 15 MB per minute and adjusting to previously measured (or current) actual recording size once at least 30 seconds have been captured. The estimate reserves a 20% safety margin; file size varies considerably with video movement, resolution and codec. A missing storage estimate is shown explicitly, never guessed as device capacity.
- The live badge shows how much has been stored and, when available, the remaining browser allowance. Under 200 MB it warns; below 50 MB it attempts to stop safely and finalise the most recent part.
- When the browser supports persistent storage, a **Request storage protection** button asks the browser to reduce automatic eviction. This may be denied or unsupported (including on iPad Safari), and it is not a substitute for a downloaded backup. Backgrounding the app also triggers a best-effort data flush.
- For multi-part sessions, **Review** can play parts in order and jump between parts. **Download this part** exports the currently selected segment; export all segments separately before deleting or clearing browser data. These are independent media files and should not be concatenated byte-for-byte.
- On opening the library, a stale recording with no recent saved data is marked **interrupted**. Its completed video parts remain available; the final part is labelled incomplete and may not play, depending on browser/container behaviour. An interrupted browser page cannot resume the same screen-sharing stream without a new user permission gesture.
- The IndexedDB schema was upgraded from v1 to v2 **in place**, retaining historical `sessions` and `videos` data. Existing imported screen recordings remain accessible.
- The new long-session design is covered by browser regression tests with a deterministic simulated recorder and actual IndexedDB transactions. Test results do **not** replace physical iPad Safari verification of native capture permissions, audio and video codecs.
