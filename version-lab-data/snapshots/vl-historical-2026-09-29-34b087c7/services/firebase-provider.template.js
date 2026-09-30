// InClass Firebase provider template.
// Copy/adapt this file when the Firebase project is ready, then load it before auth-service.js.
// This file deliberately contains no credentials and is not loaded by the app today.
//
// Expected provider contract:
//
// window.InClassFirebaseProvider = {
//   async signIn() {
//     // Use Firebase Authentication.
//     // Return:
//     // { userId, displayName, role, children:[{id,name,yearGroup}], classes:[], provider:"firebase" }
//   },
//
//   async signOut() {
//     // firebaseAuth.signOut()
//   },
//
//   async hydrateUser(session) {
//     // Fetch data the signed-in user is authorised to read.
//     // Return an object keyed exactly like InClassData local-cache keys.
//     // Example:
//     // {
//     //   "inclass:2026-09-french-pets:Sai": {...progress},
//     //   "analytics:Sai": [...attempts]
//     // }
//   },
//
//   async setJson({userId,key,value}) {
//     // Write user-scoped cached state to Firestore.
//     // Prefer typed Firestore documents for production rather than one generic blob.
//   },
//
//   async remove({userId,key}) {
//     // Delete/reset the corresponding Firestore document.
//   },
//
//   async recordAttempt(event) {
//     // Append an immutable attempt document:
//     // learnerId, packId, subject, activity, item, correct, ts, scope, response...
//   }
// };
