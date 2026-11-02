# French learning handoff — pilot (not deployed)
This branch is a preservation-first staging area. No existing lesson, progress, or release file is changed.

## Audit baseline (2026-11-02)
- Next: `lessons/catalog.json` contains 4 lessons, including `french-quitter-20260926` and `french-animal-opinions-homework-20261005`.
- InClass: dated homework packs under `data/`, loaded via `data/manifest.js`. The app's README describes French pets/colours/descriptions and later extension vocabulary. Recent main commits add November *avoir* homework.
- Overlap is semantic, not yet proven to be identical files. Preserve both.
- Next local progress key: `next-learning.v1`; InClass user-scoped key prefix: `inclass:v2:`. Never rewrite either.
- History baseline: Git main commits at the start of this pilot; compare with `git diff main...feature/french-learning-handoff-pilot`.

## Contract
`learning-handoff.js` is a pure opt-in local-first prototype. It is not loaded by the app yet. It writes only `apps:learning-handoff:v1`. A suggestion needs >=3 wrong required-homework attempts over >=2 distinct items with an explicitly tagged `conceptId`. No inference from a single error. It never creates a lesson. A parent must call `approve(id)` before the request becomes eligible for Next. Rejections are retained to avoid repeated prompts. Reuse Next's existing `french-quitter-20260926` where appropriate.

## Remaining integration and validation gates
1. Tag French attempt events with stable `conceptId` and `sourcePackId`; inspect current InClass UI and data events first.
2. Show parent-only suggestion approval UI; never show developer/provider controls to the learner.
3. Load approved requests in Next with explicit learner identity and a stable deep link. For unknown concepts, propose (do not publish) a new lesson.
4. Implement secure per-user cloud sync using existing authenticated Firebase infrastructure. LocalStorage is shared across GitHub Pages paths on the same origin but **not** a safe cross-device or cross-user transport.
5. Add bidirectional evidence (not an unverified mastery claim), deduplication, and rollback.
6. Test on iPad/iPhone, check offline behaviour, release gates, accessibility, and historical versions before merging.
