// Owner-only Firestore notes transport for InClass.
// Reuses the kk-syllabus project and its existing owner-only family rules.
const project={apiKey:'AIzaSyDrreK9rhsoOpIYNr4QeNZ7CsXgQiMPW0E',authDomain:'kk-syllabus.firebaseapp.com',projectId:'kk-syllabus',appId:'1:821660665663:web:c708860329bb97dc24758a'};
const owner='2AJSfYdtg5URWHv7HCzpNMmKIlg2';
let sdkPromise=null;
export async function firebase(){
 if(sdkPromise)return sdkPromise;
 sdkPromise=(async()=>{
  const [A,Auth,F]=await Promise.all([
   import('https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js'),
   import('https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js'),
   import('https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js')
  ]);
  const app=A.getApps().find(a=>a.name==='inclass-notes')||A.initializeApp(project,'inclass-notes');
  const auth=Auth.getAuth(app);await Auth.setPersistence(auth,Auth.browserLocalPersistence);await auth.authStateReady();
  return {Auth,F,auth,db:F.getFirestore(app)};
 })().catch(e=>{sdkPromise=null;throw e});
 return sdkPromise;
}
export async function currentParent(){
 const f=await firebase();return f.auth.currentUser?.uid===owner&&!f.auth.currentUser.isAnonymous?f:null;
}
export async function signIn(email,password){
 const f=await firebase();const credential=await f.Auth.signInWithEmailAndPassword(f.auth,email,password);
 if(credential.user.uid!==owner){await f.Auth.signOut(f.auth);throw Error('This account is not authorised to manage InClass notes.');}
 return credential.user;
}
export async function signOut(){const f=await firebase();await f.Auth.signOut(f.auth);}
const clone=x=>JSON.parse(JSON.stringify(x));
const date=n=>Date.parse(n?.updatedAt||n?.createdAt||'')||0;
const summary=n=>JSON.stringify([n.text,n.status,n.reviewRequired,n.updatedAt]);
export function mergeNotes(local=[],remote=[]){
 const map=new Map();
 for(const item of [...remote,...local]){
  if(!item||typeof item.id!=='string'||!item.text)continue;
  const n=clone(item),prior=map.get(n.id);
  if(!prior){map.set(n.id,n);continue;}
  const winner=date(n)>date(prior)?n:date(n)<date(prior)?prior:summary(n)>=summary(prior)?n:prior;
  const loser=winner===n?prior:n;
  if(summary(winner)!==summary(loser)){
   const conflicts=[...(prior.metadata?.syncConflicts||[]),...(n.metadata?.syncConflicts||[]),
    {text:loser.text,updatedAt:loser.updatedAt,status:loser.status}];
   winner.metadata={...winner.metadata,syncConflicts:[...new Map(conflicts.map(c=>[JSON.stringify(c),c])).values()].slice(-8)};
  }
  map.set(n.id,winner);
 }
 return [...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
}
const same=(a,b)=>JSON.stringify([...a].sort((x,y)=>x.id.localeCompare(y.id)))===JSON.stringify([...b].sort((x,y)=>x.id.localeCompare(y.id)));
const valid=v=>/^[a-zA-Z0-9_.-]{1,120}$/.test(v);
export function createFamilyNotesTransport({learner,pack,localKey,onStatus=()=>{}}){
 if(!valid(learner)||!valid(pack))throw Error('Invalid lesson identity');
 const draftKey=localKey+'.draft';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const write=rows=>localStorage.setItem(localKey,JSON.stringify(rows));
 let connected=false,cloud=[],pending=false,unsub=null,active=true,busy=Promise.resolve();
 const doc=async()=>{const f=await currentParent();if(!f)throw Error('Parent sign-in required');
  return {f,ref:f.F.doc(f.db,'families',owner,'learners',learner,'progress','inclass-notes-'+pack)};
 };
 async function sync(){
  if(!active||!connected)return;
  const {f,ref}=await doc();
  const snap=await f.F.getDoc(ref),remote=snap.exists()?snap.data()?.notes||[]:[];
  const merged=mergeNotes(read(localKey,[]),remote);
  if(!same(merged,remote)){
   const result=await f.F.runTransaction(f.db,async transaction=>{
    const fresh=await transaction.get(ref);
    const latest=mergeNotes(merged,fresh.exists()?fresh.data()?.notes||[]:[]);
    transaction.set(ref,{app:'inclass',schema:1,learner,pack,notes:latest,updatedAt:new Date().toISOString()});
    return latest;
   });
   write(result);cloud=result;
  }else{write(merged);cloud=merged;}
  pending=false;onStatus('synced');return merged;
 }
 const queue=()=>{busy=busy.catch(()=>{}).then(()=>sync()).catch(e=>{pending=true;onStatus('error',e.message)});return busy};
 return {
  mode:'family-firebase',
  async connect(){
   if(!await currentParent())throw Error('Parent sign-in required');
   connected=true;onStatus('syncing');await queue();
   const {f,ref}=await doc();
   unsub=f.F.onSnapshot(ref,()=>{if(active&&connected)queue() },error=>onStatus('error',error.message));
  },
  disconnect(){active=false;connected=false;unsub?.();unsub=null},
  async list(){return read(localKey,[])},
  async save(note){
   const rows=read(localKey,[]),i=rows.findIndex(x=>x.id===note.id);
   if(i<0)rows.push(note);else rows[i]=note;
   write(rows);pending=true;onStatus('pending');if(connected)queue();
   return note;
  },
  async remove(id){
   // Preserve deletion as an archive marker rather than silently resurrecting.
   const rows=read(localKey,[]),i=rows.findIndex(x=>x.id===id);
   if(i>=0){rows[i]={...rows[i],status:'archived',updatedAt:new Date().toISOString()};write(rows);pending=true;if(connected)queue();}
  },
  async getDraft(){return read(draftKey,null)},
  async saveDraft(value){value?localStorage.setItem(draftKey,JSON.stringify(value)):localStorage.removeItem(draftKey)},
  async clearDraft(){localStorage.removeItem(draftKey)},
  async flush(){await queue();return !pending},
  get pending(){return pending}
 };
}
