# InClass Shared Notes: owner sync and development feedback

## Architecture and scope
- Canonical notes UI and note schema remain in `nirav2000/Apps/notes/v1`.
- `services/family-notes.js` is the InClass-specific, local-first Firestore adapter. No independent notes UI is created.
- Private notes use the existing authenticated `kk-syllabus` project and existing owner-only rules:
  `families/{ownerUid}/learners/{learnerId}/progress/inclass-notes-{packId}`.
- Parent must sign in to Firebase with the same account used by Beyond100 and LearnLatin. The preview learner/teacher role switch is not authentication and grants no cloud permissions.
- Local copies remain under `inclass:private-notes:v1:{owner}:{learner}:{pack}`. Cloud connection does not delete old notes.
- The active lesson syncs through a Firestore transaction, merging by note ID and retaining conflicting historical text in `metadata.syncConflicts`. A single active listener receives other-device changes.
- Drafts remain local until saved. Note deletion is treated as archival to prevent resurrection by older devices. Offline writes remain local and are retried during the next successful connection. Existing learning scores and lesson content are unchanged.
- Sync status appears alongside the floating editor launcher. Cloud data cannot be accessed without the owner Firebase identity.

## Administrator development feedback
- The separate `inclass-development-feedback.js` button collects a NEW public-safe description; it never uploads private lesson notes.
- The submitting administrator explicitly confirms that the text contains no personal data and signs in with the existing App Monitor passkey.
- The shared Worker uses its existing server-side Firestore and GitHub credentials. The issue repository routing in `Apps/notes/v1/server.js` now chooses `nirav2000/InClass` only for `appId:inclass` and retains `nirav2000/Apps` for existing consumers.
- The GitHub token must have Issues write and commit-read permission for `nirav2000/InClass`. A token limited to Apps will save the note in the admin queue without claiming issue creation.
- The existing Worker deployment, end-to-end issue flow and verified implementation return require live testing. Do not mark them complete from committed source alone.

## Required live checks
1. Sign in as the owner on iPad; create notes in two different homework weeks.
2. Sign in as the same parent on iPhone; confirm each week retrieves the expected notes and unrelated weeks remain unchanged.
3. Edit separate notes while both devices are open; check both changes survive.
4. Edit the same note offline on the two devices; check the newer version and retained conflict history.
5. Disconnect and reconnect; confirm no data loss or false 'synced' indicator.
6. Confirm an unauthorised Firebase account cannot read or write the owner-only learner record.
7. Confirm ordinary InClass notes never create public issues.
8. Submit a deliberately redacted development note using App Monitor passkey, confirm exactly one `nirav2000/InClass` issue and status return after real deployment evidence.
9. Test notes editor on iPad and iPhone, verify school lessons, answers, analytics and PWA/offline still function.
10. Inspect the Worker deployment and Pages CI logs; retain status as unverified until live checks pass.

## Limitations
- This is an owner-only pilot, not yet multi-parent or teacher-access sync.
- Legacy local note keys are not automatically copied into another account. No automatic transfer of private notes to ChatGPT or GitHub.
- Cross-device note storage is separate from InClass's still-local homework progress and attempts.
- The sync conflict strategy is record-level with bounded conflict history, not collaborative per-character editing.
