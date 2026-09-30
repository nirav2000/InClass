# InClass Firebase architecture

The app currently runs in **local mode**. The UI, authentication boundary and data boundary are now separated so Firebase can be connected later without rewriting each lesson.

## Product roles

### Learner
A learner sees:
- their own homework packs,
- their own progress,
- their own attempts,
- their own extension material.

A learner must not be able to read another learner's records.

### Parent / guardian
A parent can be linked to **one or more learner profiles**. A parent sees:
- each linked child's current homework and completion,
- accuracy and weak items,
- historical homework,
- optional extension activity.

A parent account is not the same thing as a learner account. A child can therefore have a learner profile before they have their own email/login.

### Teacher
A teacher is linked to one or more classes. A teacher sees:
- all enrolled learners in those classes,
- homework completion at a glance,
- learner-level accuracy and weak items,
- common issues across the class,
- drill-down into a learner when permitted.

A teacher must not gain access to learners outside their classes.

## Suggested Firestore model

### `users/{uid}`
Authentication-facing profile.

Fields:
- `displayName`
- `role`: `parent | teacher | learner | admin`
- `createdAt`
- `disabled`

### `learners/{learnerId}`
Child/learner profile.

Fields:
- `displayName`
- `yearGroup`
- `schoolId` (optional)
- `authUid` (optional; allows a learner profile to exist before the child has a login)
- `active`

### `guardianLinks/{linkId}`
Links parents to children.

Fields:
- `guardianUid`
- `learnerId`
- `relationship`
- `active`

### `classes/{classId}`
Fields:
- `name`
- `schoolId`
- `yearGroup`
- `teacherUids[]`
- `active`

### `classEnrollments/{enrollmentId}`
Fields:
- `classId`
- `learnerId`
- `active`

### `homeworkPacks/{packId}`
Canonical homework metadata.

Fields:
- `subject`
- `yearGroup`
- `title`
- `sourceDate`
- `sourceType`
- `requiredContent`
- `understandingContent`
- `extensionContent`
- `publishedAt`

The important design principle is to keep **required homework** structurally distinct from explanation and extension. The UI can then guarantee that school-set material is always surfaced first.

### `progress/{learnerId_packId}`
One summary document per learner per homework pack.

Fields:
- `learnerId`
- `packId`
- `completionPercent`
- `requiredCompletionPercent`
- `practiceCounts`
- `bestScore`
- `lastActivityAt`
- `updatedAt`

### `attempts/{attemptId}`
Immutable event-level practice data.

Fields:
- `learnerId`
- `packId`
- `subject`
- `activity`
- `item`
- `correct`
- `scope`: `required | understanding | extension`
- `response` (where appropriate)
- `durationMs` (future)
- `ts`

This collection powers:
- weak-item detection,
- class common-issue detection,
- hesitation / timing analysis later,
- spaced retrieval,
- parent and teacher dashboards.

## Security rules intent

Rules should enforce relationships, not rely on the UI hiding data.

- Learner: read/write only documents with their own `learnerId`.
- Parent: read linked learners through active `guardianLinks`.
- Teacher: read learners with an active enrollment in a class where their UID is in `teacherUids`.
- Homework pack content: readable by authorised users; writeable only by admin/teacher roles as appropriate.
- Attempts: learners can create their own; historical attempts should generally be append-only.
- Admin: explicit privileged role, audited.

## Current code boundaries

### `services/auth-service.js`
The lesson UI asks this service who is signed in and what role they have.

Today: local preview session.

Later: `InClassFirebaseProvider.signIn()` and `signOut()`.

### `services/data-service.js`
Lessons read/write through a user-scoped cache.

Today:
- localStorage,
- legacy local data migrates into a user namespace.

Later:
- local cache remains useful for speed/offline use,
- writes can flow through to Firestore,
- `hydrateUser()` can populate the cache after authentication,
- attempt events can be written to Firestore independently.

### `services/firebase-provider.template.js`
Documents the provider interface expected by the auth/data services.

## Dashboard behaviour

### Parent dashboard
The code is already written to iterate over an array of children rather than assuming one child. It can therefore render two or more children once Firebase returns additional guardian links.

### Teacher dashboard
The local preview deliberately shows only the learner data that actually exists. Once Firebase returns a class roster, the same dashboard can render all enrolled learners and aggregate common missed items.

No synthetic classmates should be created merely to make the dashboard look populated.

## Recommended next Firebase implementation order

1. Create Firebase project and web app.
2. Enable Authentication providers.
3. Add `users`, `learners`, guardian links, classes and enrollments.
4. Implement security rules and emulator tests.
5. Implement the provider contract from `firebase-provider.template.js`.
6. Hydrate current learner progress into Firestore.
7. Switch `config/app-config.js` from `mode: "local"` to cloud-enabled configuration.
8. Keep local cache/offline support as a write-through cache rather than removing it.
