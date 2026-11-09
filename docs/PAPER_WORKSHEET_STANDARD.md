# InClass: printable worksheet standard (mandatory for every new lesson)

## Aim
Offer a **paper-first alternative** to interactive exercises. A worksheet must be a deliberately authored teaching experience, not a screenshot of the app or a long list of copied questions. It should let a Year 5 child work independently and write by hand while keeping screen time low.

## Release contract: every lesson version
When a new homework pack is added to `window.INCLASS_WEEKS`:

1. Preserve exactly what the teacher set, including dates only if verified, supplied vocabulary, wording, expected answer type and assessment format. Keep the source/school requirement separate from our explanations and extensions. Never infer missing pages or an official answer key.
2. Audit every **new word, symbol, rule and prerequisite**. Define them without unexplained terminology. Explain **what it is, why it exists, how it works, where it fits, when to use it**, and test whether the child can use it independently on something unfamiliar.
3. Add a **curated ID-specific case** in `worksheets/worksheet-builder.js`; create the worksheet object with learning goal, preserved school task, term cards, worked model, required questions, why/how reasoning, unfamiliar transfer, meaningful answer guide and three **backward / forward / cross-topic** connections. The `audit()` function must return no problems. Do not silently use a generic fallback when a lesson is new.
4. Add the lesson data script in source order to **both** `index.html` and `worksheets/print.html` (after its dependencies); keep all historical packs/versions available. Make sure the offline worker precaches the new data script. The printer and app stay data-driven.
5. Check the actual school practice structure: e.g. for 12-word spelling tests, **four adult-dictated spellings, four definition prompts, four original-sentence tasks**; for French, include spoken rehearsal via an adult and real handwriting, not just word recognition. Mark when an answer needs adult review instead of automatically awarding a correct score.
6. Design for **A4 single-sided** printing with generous writing space, legible text, short meaningful tasks, print-friendly colour, drawing/sketch spaces when useful, minimal ink, no unnecessary cover pages, and a clearly separate adult guide. The student sheet must not accidentally reveal the answers to the independent section (study word bank can be folded or covered). Use UK spelling.
7. Quality-assure both views (student and parent) in the browser or headless print rendering. Confirm pages do not clip, overlap, lose accents or split an important question and response space across pages. Test printed content, not just JS syntax.
8. Run `node --test tests/worksheets.test.mjs` plus the lesson's own tests and `node tests/pwa-assets.test.mjs`. The GitHub Actions worksheet workflow runs when lesson data changes; it should **fail** for new packs that lack a curated print case. Ensure it passes before treating the lesson as ready.

## Paper workflow
Open a lesson in InClass and choose **Printable worksheet** (or use the link on its dashboard card). In the print view select a lesson and **Child worksheet**. Use **Print / save PDF** and your device's print dialogue; set A4, single-sided. The separate **Parent answer & marking guide** has answers, the adult's dictated cues, and a three-part review area.

Sai completes the **school requirement first**. Glossary and worked models can be read before the independent test; cover them for recall. Optional connections are clearly labelled and should not inflate the amount of mandatory school homework.

The lesson includes an optional **Record paper completion & review** area. Adult-entered school recall, conceptual explanation and unfamiliar transfer results are stored separately under `inclass:paper:<packId>:<learner>`; they **must not be conflated with interactive test results**. A parent can note prompts or misconceptions and see these in the parent's homework overview. Paper progress does not automatically synchronise with Teams or represent a teacher-marked score. Sync remains subject to the app's existing `InClassData` configuration.

## Automatic QA question
Before declaring a new worksheet done, ask:

> Could an intelligent Year 5 learner encountering these ideas for the first time explain what the important terminology means, why the underlying concepts exist, how they work, what alternatives exist, and apply the learning to an example they have never seen before?

If not, improve instruction or create a better transfer question before release.

## File map
- `worksheets/worksheet-builder.js`: one curated print pack for each ID, with answer key and audit.
- `worksheets/print.html` + `worksheets/worksheet-print.js` + `worksheets/worksheet-print.css`: standalone print preview and A4 rendering.
- `worksheets/worksheet-links.js` + CSS: in-app entry points and manual paper review, separate from interactive progress.
- `tests/worksheets.test.mjs` / `.github/workflows/worksheet-tests.yml`: content preservation, coverage and renderer checks.

## Known limitations
Printing uses the device's built-in print/save-to-PDF dialogue; the app does not yet store a scanned handwritten submission or automatically OCR/mark handwriting. The parent key is a separate view, not an authenticated secret. Where official school worksheets are already physically pasted into a book, these InClass pages are **extra revision**, never a replacement for work in the book unless the teacher agrees.
