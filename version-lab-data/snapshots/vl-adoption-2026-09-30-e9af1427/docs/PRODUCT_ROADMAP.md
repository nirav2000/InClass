# InClass Product Roadmap

> **Product promise:** school homework first, understanding second, extension third.
>
> InClass should help a child do the homework that was actually set, understand the ideas behind it, remember it for longer, and then go beyond it when useful.

Last updated: **29 September 2026**

---

## 1. Why InClass exists

Most homework systems are good at distributing work and recording completion. InClass is intended to go further.

The product should answer four questions:

1. **What exactly has school asked the child to learn?**
2. **Can the child actually recall and use it, rather than just recognise it?**
3. **Do they understand why it works?**
4. **Can they transfer that understanding into unfamiliar examples?**

The core learning ladder is:

**Homework → Retrieval → Understanding → Transfer → Retention**

The app should never allow optional enrichment to hide the required homework.

---

## 2. Product principles

### A. Homework source of truth
The material supplied by the school is the required layer and remains visually prominent.

### B. Understanding should sit behind facts, not replace them
Definitions, grammar refreshers, visual explanations and micro-tests are there to resolve gaps in understanding.

### C. Extension is optional
Extra vocabulary, deeper questions, conversations and transfer tasks should normally be collapsed until the required work is secure.

### D. Measure learning, not taps
Completion is useful, but the more important measures are first-attempt accuracy, delayed recall, weak concepts and transfer.

### E. Explain the prerequisite
If a lesson uses a term such as *noun*, *adjective*, *prefix*, *suffix*, *conjugation* or *infinitive*, that term should be clickable and teachable rather than silently assumed.

### F. Parent and teacher views should be diagnostic
A dashboard should answer:
- What has the child completed?
- What can they actually do?
- What are they repeatedly getting wrong?
- Is the problem factual recall, understanding, transfer or hesitation?
- What should happen next?

### G. Child data should be treated as highly sensitive
Voice, handwriting, school work and performance data should be minimised, access-controlled and retained only when there is a clear educational reason.

---

## 3. Status legend

- ✅ **Implemented**
- 🟡 **Partially implemented / scaffold in place**
- ⬜ **To do**
- 💡 **Idea / experiment**

---

# 4. Implemented

## Core homework structure

✅ Subject → dated homework week architecture.

✅ Separate permanent homework packs rather than replacing last week's work.

✅ Current English Year 5 plural homework retained as the required source material.

✅ Current French Year 5 vocabulary retained as the required source material.

✅ Required homework, understanding and extension are represented as distinct content tiers.

✅ Optional French extension material is collapsed by default.

✅ Required French progress is separated from extension activity.

✅ Source notes distinguish school-provided content from InClass-added explanations.

---

## Retrieval and practice

✅ Hear → spell practice.

✅ Definition → word retrieval in English.

✅ Sentence-use practice.

✅ English practice test that mirrors the structure shown in the school homework.

✅ Paper dictation mode for French with:
- audio,
- hidden answers,
- parent ✓ / ✗ marking,
- locally retained marks.

✅ Lightweight spaced review architecture for previous English words.

✅ French sentence construction.

✅ French garden-sighting extension:
**Aujourd’hui, j’ai vu … dans le jardin.**

✅ Constrained French conversation practice.

---

## Understanding layer

✅ Clickable word-information icons.

✅ Child-friendly definitions.

✅ Example sentences.

✅ Sai-relevant examples using familiar contexts such as:
- sailing,
- camping,
- music,
- garden birds,
- school,
- reading.

✅ Clickable grammar terminology.

✅ Noun refresher with:
1. definition,
2. examples,
3. picture-supported selection task,
4. words-only task,
5. transfer task with unfamiliar words.

✅ Visual plural explanation:
**one dog → several dogs → dog → dogs**.

✅ French grammatical-gender explanation.

✅ Distinction between grammatical gender and biological sex.

✅ Explanation of **un / une** as part of learning the noun.

✅ French adjective-agreement patterns and exceptions.

---

## French extension

✅ Rainbow / extra colours.

✅ Pink.

✅ Extra animals.

✅ Common UK garden birds.

✅ Garden-bird vocabulary used in complete sentences.

✅ School sentence frame remains primary even when InClass also provides a clearer explanatory alternative.

---

## Product shell

✅ Dedicated InClass welcome page.

✅ Product message:
**School homework first → Explain the idea → Extend the thinking.**

✅ Learner dashboard preview.

✅ Parent dashboard preview.

✅ Teacher dashboard preview.

✅ Parent dashboard is designed for more than one child.

✅ Teacher dashboard is designed for a full class rather than one child.

✅ Required homework accuracy and extension activity are represented separately.

---

## Authentication and data architecture

🟡 Local-mode authentication abstraction exists.

🟡 User-scoped data service exists.

🟡 Firebase provider interface exists.

🟡 Firebase/Firestore architecture is documented.

🟡 Parent → child, teacher → class → learner relationships are designed.

🟡 Local cache can later become a Firestore write-through/offline cache.

✅ Individual learning attempts can be logged as events.

✅ Attempt events distinguish:
- required,
- understanding,
- extension.

---

# 5. Immediate work required for a stable public release

The goal should be a **v1.0 stable release** suitable for real parents, children and a small number of teachers.

## P0 — must be complete before calling it stable

### Authentication and accounts

⬜ Create the production Firebase project.

⬜ Enable Firebase Authentication.

⬜ Decide initial sign-in methods:
- email link / email and password,
- Google,
- Apple,
- school-managed account later.

⬜ Implement parent accounts.

⬜ Implement learner profiles independently of login accounts.

⬜ Implement parent → child linking.

⬜ Implement teacher accounts.

⬜ Implement teacher → class linking.

⬜ Implement class → learner enrolment.

⬜ Add password / account recovery.

⬜ Add account deletion.

⬜ Add export of personal data.

---

### Firestore and security

⬜ Implement Firestore collections described in `docs/FIREBASE_ARCHITECTURE.md`.

⬜ Write Firestore security rules.

⬜ Test security rules with the Firebase Emulator Suite.

⬜ Confirm:
- learner cannot read another learner,
- parent can only read linked children,
- teacher can only read learners in authorised classes,
- unauthorised users cannot enumerate children/classes.

⬜ Define data-retention rules.

⬜ Define deletion behaviour when:
- a child leaves a class,
- a parent unlinks,
- a teacher leaves a school,
- an account is deleted.

---

### Privacy / children / safeguarding

⬜ Write a privacy notice understandable by parents and schools.

⬜ Write an age-appropriate explanation for children.

⬜ Decide the lawful basis / consent flow for child data before public use.

⬜ Avoid storing raw child voice recordings by default.

⬜ Avoid storing raw handwriting images indefinitely by default.

⬜ Make voice upload/storage explicitly opt-in.

⬜ Add parent/teacher controls for any AI-generated feedback.

⬜ Add an audit log for teacher/admin access to child records.

⬜ Establish a policy for open-ended AI features used by children.

---

### Reliability

⬜ Add automated tests for:
- homework pack rendering,
- progress calculation,
- required vs extension separation,
- user data scoping,
- learner switching,
- role switching,
- dictation marks,
- test scoring,
- service-worker updates.

⬜ Add browser/device regression testing:
- iPhone Safari,
- iPad Safari,
- Chrome desktop,
- Safari desktop,
- Edge/Chrome school laptop.

⬜ Add error reporting.

⬜ Add a visible offline / syncing state.

⬜ Add conflict handling for the same learner using two devices.

⬜ Add backup / restore strategy.

⬜ Add a data migration/version strategy.

⬜ Add a release channel:
- stable,
- preview / beta.

---

### Accessibility

⬜ Keyboard navigation audit.

⬜ Screen-reader labels audit.

⬜ Colour-contrast audit.

⬜ Do not rely on colour alone for correct / incorrect.

⬜ Adjustable text size without breaking layouts.

⬜ Reduced-motion support.

⬜ Consider optional reading supports without forcing a special font on all learners.

---

### Content integrity

⬜ Every homework pack should store:
- source date,
- source type,
- who uploaded/created it,
- what is directly from school,
- what InClass added,
- whether AI generated any content,
- whether a human reviewed it.

⬜ Add a parent/teacher preview before publishing an AI-created pack.

⬜ Never silently “correct” school material without showing the difference.

⬜ Add an edit / override mechanism.

---

# 6. Homework ingestion

## Parent workflow

💡 Ideal flow:

**Photograph homework → InClass extracts it → parent reviews it → publish to child**

⬜ Homework image upload.

⬜ OCR / vision extraction.

⬜ Automatic identification of:
- subject,
- year group,
- required vocabulary,
- rules,
- test format,
- due/test date,
- teacher instructions.

⬜ Automatically separate content into:
- Required,
- Understanding,
- Extension.

⬜ Human confirmation screen before publishing.

⬜ Keep the source image attached to the pack for parent/teacher verification.

---

## Teacher workflow

💡 Teacher uploads homework once and publishes it to the whole class.

⬜ Teacher homework composer.

⬜ Upload PDF/image/Word/PowerPoint.

⬜ Import homework from school platforms later.

⬜ Assign to:
- class,
- group,
- individual learner.

⬜ Set due date/test date.

⬜ Preview learner view.

⬜ Reuse last year's homework pack.

⬜ Shared school homework library.

⬜ Copy/edit another teacher's pack where permitted.

---

# 7. Demonstrating that InClass improves learning

A stable product should not merely claim that it helps. It should collect evidence that the child is making progress **above what would likely have happened without the app**.

## Metrics that matter

### Required-homework outcomes

⬜ First-attempt accuracy.

⬜ Number of attempts to mastery.

⬜ Time to mastery.

⬜ School test result where entered/imported.

⬜ Items still wrong immediately before the test.

---

### Retention

⬜ Recall after 1 day.

⬜ Recall after 3 days.

⬜ Recall after 7 days.

⬜ Recall after 21 / 30 days.

A word answered correctly five times in ten minutes is not the same as a word remembered a week later.

---

### Understanding

⬜ Can explain the concept in their own words.

⬜ Can identify the concept in an example.

⬜ Can distinguish it from a near-miss.

Example for **noun**:
- recognise dog as a noun,
- recognise garden as a noun,
- reject quickly,
- handle an unfamiliar noun later.

---

### Transfer

⬜ Can use the learned rule on a word not present in the homework.

⬜ Can create a new sentence.

⬜ Can answer a new question using the same idea.

⬜ Can generalise across subjects where appropriate.

---

### Fluency / hesitation

💡 Capture response time as useful information.

⬜ Time each response.

⬜ Distinguish:
- correct + immediate,
- correct + hesitant,
- incorrect + confident,
- incorrect + hesitant.

This may identify fragile knowledge before an incorrect answer appears.

---

## Estimating the “InClass uplift”

There is no perfect counterfactual for one child, so the product should use several methods rather than pretend one number proves causation.

### Method A — baseline before learning

⬜ Give a short pre-test before the child sees the teaching.

Then compare:
**baseline → immediate mastery → delayed retention → school result**

### Method B — matched-item comparison

💡 For a larger word list, divide comparable items into matched groups.

For example:
- both groups receive the required school practice,
- one group additionally gets InClass explanation/retrieval treatment,
- compare delayed recall.

This tests the **additional InClass layer**, not whether the child was allowed to do their homework.

### Method C — crossover over several weeks

💡 Alternate which concepts receive deeper InClass treatment.

Across enough homework weeks, compare:
- accuracy,
- retention,
- transfer,
- time spent.

### Method D — parent / teacher comparison

⬜ Capture:
- school test result,
- teacher assessment,
- parent estimate of support time,
- child's confidence.

These are secondary measures, but useful alongside objective quiz data.

---

## Proposed learner impact dashboard

💡 Eventually show:

**Homework complete:** 100%  
**Required accuracy:** 88%  
**7-day retention:** 82%  
**Transfer:** 71%  
**Time to mastery:** 18 minutes  
**Likely InClass uplift:** experimental / evidence-based estimate only when enough comparison data exists

Avoid displaying a fake uplift percentage when the data is insufficient.

---

# 8. Parent dashboard roadmap

✅ Multiple-child architecture.

⬜ Current required homework.

⬜ Due/test dates.

⬜ Required completion.

⬜ Required accuracy.

⬜ Weak items.

⬜ Weak concepts.

⬜ Delayed-retention score.

⬜ Transfer score.

⬜ Extension activity shown separately.

⬜ Child-by-child history.

⬜ “What should we do for 10 minutes tonight?”

⬜ Suggested next activity based on weakness.

⬜ Parent can mark:
- child needed help,
- independent,
- guessed,
- knew instantly.

⬜ Weekly digest.

⬜ Export/share report.

---

# 9. Teacher dashboard roadmap

✅ Class-table architecture.

✅ Common-issue aggregation architecture.

⬜ Class completion heatmap.

⬜ Required accuracy by learner.

⬜ Common misconception view.

⬜ “Who needs help now?” filter.

⬜ “Who has not started?” filter.

⬜ “Who is secure and ready for extension?” filter.

⬜ Group pupils by common issue.

⬜ Click an issue to automatically create a 5-minute intervention task.

⬜ Compare class performance across homework weeks.

⬜ Identify homework questions that many pupils missed.

⬜ Teacher notes.

⬜ Intervention history.

⬜ Export / print.

⬜ School leadership aggregate view later.

---

# 10. Personalisation ideas

## Personalised examples

✅ Sai-relevant examples exist.

⬜ Store interests per learner.

⬜ Store current book being read.

⬜ Store preferred examples:
- sport,
- music,
- science,
- animals,
- games,
- books.

⬜ Generate examples from those interests without changing the required homework.

---

## Teacher voice

💡 A teacher could optionally record an approved voice sample so required words/instructions sound like the child's own teacher.

Possible benefits:
- familiarity,
- pronunciation consistency,
- school/home continuity.

Before implementation:

⬜ Explicit teacher consent.

⬜ School/admin approval where appropriate.

⬜ Clear voice-retention policy.

⬜ Do not allow covert voice cloning.

⬜ Allow teacher to revoke/delete the voice model.

⬜ Label synthetic voice clearly where appropriate.

💡 Lower-risk first version:
teacher records the actual homework word list directly rather than creating a reusable synthetic voice.

---

## Child voice comparison

💡 Child repeats a French word or sentence and compares it with a model.

Useful levels:

### Level 1
Speech recognition checks whether the intended word was understood.

✅ Basic browser speech recognition exists in some activities.

### Level 2
Show waveform / playback comparison.

⬜ Child can hear their own attempt immediately.

⬜ Default to ephemeral/local processing where possible.

### Level 3
Phoneme-level pronunciation feedback.

⬜ Proper pronunciation-analysis provider.

⬜ Highlight the sound that differed.

⬜ Avoid fake precision such as “87% French accent” unless the scoring system genuinely supports it.

⬜ Parent/school opt-in before retaining child voice.

---

# 11. AI features

## AI analysis

💡 Premium candidate.

Possible features:

⬜ Explain *why* the child got an answer wrong.

⬜ Detect recurring misconceptions across weeks.

⬜ Separate:
- careless mistake,
- misunderstood instruction,
- factual recall gap,
- grammar/concept gap,
- hesitation/fragile knowledge.

⬜ Generate a short targeted intervention.

⬜ Generate a parent explanation.

⬜ Generate a teacher class-summary explanation.

⬜ Suggest the next question at the right difficulty.

⬜ Use prior errors to create distractors in later multiple-choice questions.

⬜ Analyse written sentences beyond simple structural checks.

⬜ Analyse handwriting from an uploaded page.

⬜ Create extension tasks tailored to interests and current reading.

---

## AI tutor

💡 Premium candidate.

⬜ Dynamic questioning.

⬜ Socratic hints rather than immediately supplying the answer.

⬜ Stay constrained to the homework and approved extension level for children.

⬜ Parent/teacher control over how much freedom the tutor has.

⬜ Save useful learning events, not the entire conversation by default.

---

# 12. Monetisation

The free product should be genuinely useful. Paid features should add analysis, personalisation, automation and richer insight rather than locking the child's basic homework behind a paywall.

## Possible model

### Free — Homework

**For families**
- school-provided homework pack,
- core vocabulary/content,
- pronunciation playback,
- core spelling/retrieval,
- basic test practice,
- basic progress.

**For schools**
- teacher can publish basic homework,
- learner can complete required practice.

Goal:
make InClass useful enough that schools/parents are happy to adopt it widely.

---

### Family Plus — Understanding & personalisation

💡 Paid candidate.

Potential features:
- AI mistake analysis,
- deeper explanations,
- adaptive weak-item practice,
- spaced retrieval across weeks,
- personalised examples,
- retention tracking,
- parent weekly insight,
- child interests/current-book personalisation,
- richer progress history.

---

### Family Pro — AI tutor / voice

💡 Paid candidate.

Potential features:
- dynamic AI tutor,
- pronunciation analysis,
- child voice comparison,
- personalised learning plan,
- handwriting analysis,
- richer cross-subject recommendations.

Voice storage should be opt-in and privacy-sensitive.

---

### Teacher / School Pro

💡 Paid candidate.

Potential features:
- class analytics,
- common misconception detection,
- AI-generated interventions,
- differentiated assignments,
- homework ingestion from documents,
- homework-pack generation,
- school-wide content library,
- exports,
- integrations,
- leadership reporting,
- retention/transfer analytics,
- cross-class comparisons.

---

## Pricing experiments

Do not decide price solely in code.

⬜ Interview parents.

⬜ Interview teachers.

⬜ Pilot with a small number of families.

⬜ Pilot with one or two teachers/classes.

⬜ Test willingness to pay for:
- AI analysis,
- extension,
- voice/personalisation,
- automated homework ingestion,
- parent reports,
- teacher analytics.

💡 Candidate packaging to test, not final pricing:
- Free
- Family Plus
- Family Pro
- Teacher
- School

The first commercial question is not “what price?” but:
**which feature creates enough additional value that a parent or school will actively pay for it?**

---

# 13. Additional product ideas

## Learning

💡 Confidence button before answering:
**Know it / Think I know / Guessing**

💡 “Explain it to me” after an incorrect answer.

💡 “Explain it back” — child records or types their own explanation.

💡 Interleaving: mix old and new learning.

💡 Automatic weak-word drill.

💡 Automatic 2-minute / 5-minute / 10-minute practice modes.

💡 “Test me like school will.”

💡 “Challenge me” transfer mode.

💡 Exam mode with no hints.

💡 Revision mode with hints.

💡 Parent-led oral test mode.

💡 Teacher-led whole-class mode.

---

## Homework workflow

💡 Due-date calendar.

💡 Push reminders.

💡 Test-date countdown.

💡 Auto-create revision schedule.

💡 Photograph completed handwritten work and mark it against the pack.

💡 Let teacher attach answer criteria.

💡 Parent can photograph feedback returned from school and link it to the homework attempt.

---

## Motivation

💡 Mastery map rather than simple points.

💡 Celebrate retained knowledge, not repetitive tapping.

💡 “You remembered this after 7 days.”

💡 Personal best on speed only after accuracy is secure.

💡 Avoid addictive streak mechanics as the primary motivator.

---

## School / curriculum

💡 Build a reusable concept graph:
- noun,
- plural,
- adjective,
- prefix,
- suffix,
- tense,
- infinitive,
- conjugation,
- place value,
- etc.

A concept learnt in one homework pack can then support another subject/week.

💡 Curriculum mapping by topic and year group.

💡 Teacher can see prerequisite concepts a learner appears to have forgotten.

---

# 14. Stable-release definition

InClass should be called **Stable v1.0** only when:

- [ ] authentication is live,
- [ ] account roles are enforced by backend security,
- [ ] Firestore persistence is live,
- [ ] parent-child links work,
- [ ] teacher-class links work,
- [ ] required homework cannot be hidden by extension content,
- [ ] required vs extension analytics are separate,
- [ ] data survives device/browser changes,
- [ ] offline/sync behaviour is understandable,
- [ ] privacy/child-data policies exist,
- [ ] deletion/export work,
- [ ] automated tests cover core flows,
- [ ] iPhone/iPad/desktop regression testing is complete,
- [ ] no known P0/P1 defects remain,
- [ ] at least one parent pilot has completed multiple homework weeks,
- [ ] at least one teacher pilot has completed a class homework cycle,
- [ ] feedback from those pilots has been reviewed.

---

# 15. Suggested release sequence

## v0.7 — Current product shell
- Homework-first UX
- English/French packs
- Understanding layer
- Extension layer
- Welcome page
- Local dashboards
- Firebase-ready interfaces

## v0.8 — Cloud accounts
- Firebase Auth
- Firestore
- parent/learner profiles
- secure rules
- cross-device sync

## v0.9 — Teacher beta
- class roster
- homework publishing
- teacher dashboard
- common issues
- pilot class

## v0.95 — Evidence beta
- pre-test
- delayed recall
- transfer questions
- timing
- uplift experiments

## v1.0 — Stable
- privacy/security/accessibility complete
- reliability tested
- parent and teacher pilots complete
- account/data lifecycle complete

## v1.x — Commercial
- AI analysis
- adaptive learning
- paid family tier
- paid teacher/school analytics
- voice/personalisation experiments

---

# 16. Decisions to make later

⬜ Firebase project/account to use.

⬜ Authentication providers.

⬜ Whether the first paying customer should primarily be:
- parent,
- teacher,
- school.

⬜ Which AI features belong in free vs paid.

⬜ Whether extension is wholly paid, partly free or metered.

⬜ Whether teacher voice starts as recordings or synthetic voice.

⬜ Whether child pronunciation audio is ever stored.

⬜ How much open-ended AI interaction a child should have.

⬜ First pilot families.

⬜ First pilot teacher/class.

⬜ Stable-release support/contact process.

---

# 17. North-star outcomes

InClass is successful if it can demonstrate that:

1. Children complete the homework that was actually set.
2. They need less parent prompting over time.
3. They remember more of it days/weeks later.
4. They understand prerequisite concepts rather than memorising blindly.
5. They can transfer learning to unfamiliar questions.
6. Parents can quickly see where help is needed.
7. Teachers can quickly see class-wide issues.
8. The app saves adults time.
9. Children are willing to use it.
10. Some parents/schools value the additional analysis/personalisation enough to pay for it.
