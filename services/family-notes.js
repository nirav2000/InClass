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
  const app=A.getApps().find(a=>a.options.projectId===project.projectId&&a.name==='[DEFAULT]')||A.getApps().find(a=>a.options.projectId===project.projectId)||A.initializeApp(project,'inclass-notes');
  const auth=Auth.getAuth(app);await auth.authStateReady();
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
function version(note){return {text:note.text,status:note.status||'open',reviewRequired:note.reviewRequired===true,updatedAt:note.updatedAt||note.createdAt||''}}
const versionKey=note=>JSON.stringify([note.text,note.status||'open',note.reviewRequired===true,note.updatedAt||note.createdAt||'']);
export function mergeNotes(local=[],remote=[]){
 if(!Array.isArray(local)||!Array.isArray(remote))throw Error('Invalid notes collection');
 const map=new Map();
 for(const item of [...remote,...local]){
  if(!item||typeof item.id!=='string'||!item.text)continue;
  const n=clone(item),prior=map.get(n.id);
  if(!prior){map.set(n.id,n);continue;}
  const winner=date(n)>date(prior)?n:date(n)<date(prior)?prior:versionKey(n)>=versionKey(prior)?n:prior;
  const loser=winner===n?prior:n;
  const history=[...(prior.metadata?.syncConflicts||[]),...(n.metadata?.syncConflicts||[])];
  if(versionKey(winner)!==versionKey(loser))history.push(version(loser));
  const unique=new Map();
  for(const item of history){
   if(item&&typeof item.text==='string'&&item.text.length&&versionKey(item)!==versionKey(winner))unique.set(versionKey(item),item);
  }
  const values=[...unique.values()].sort((a,b)=>date(a)-date(b)||versionKey(a).localeCompare(versionKey(b))).slice(-8);
  const combined={...winner,metadata:{...(loser.metadata||{}),...(winner.metadata||{})}};
  if(values.length)combined.metadata.syncConflicts=values;
  else delete combined.metadata.syncConflicts;
  map.set(n.id,combined);
 }
 const result=[...map.values()].sort((a,b)=>a.id.localeCompare(b.id));
 if(result.length>50)throw Error('Lesson exceeds 50 notes: export a backup before saving more.');
 if(new TextEncoder().encode(JSON.stringify(result)).byteLength>700000)throw Error('Lesson notes exceed Firestore limit; local copy remains safe.');
 return result;
}
const same=(a,b)=>JSON.stringify([...a].sort((x,y)=>x.id.localeCompare(y.id)))===JSON.stringify([...b].sort((x,y)=>x.id.localeCompare(y.id)));
const valid=v=>/^[a-zA-Z0-9_.-]{1,120}$/.test(v);
export function createFamilyNotesTransport({learner,pack,localKey,onStatus=()=>{},onData=()=>{},getParent=currentParent,bridge=null}){
 if(!valid(learner)||!valid(pack)||!localKey)throw Error('Invalid lesson identity');
 const draftKey=localKey+'.draft';
 const read=(key,fallback)=>{try{return JSON.parse(localStorage.getItem(key)||'null')??fallback}catch{return fallback}};
 const write=rows=>localStorage.setItem(localKey,JSON.stringify(rows));
 let connected=false,pending=false,unsub=null,active=true,busy=Promise.resolve(),listeners=false;
 const doc=async()=>{const f=await getParent();if(!f)throw Error('Parent sign-in required');
  return {f,ref:f.F.doc(f.db,'families',owner,'learners',learner,'progress','inclass-notes-'+pack)};
 };
 function notify(error){pending=true;onStatus('error',String(error?.message||error));}
 async function sync(){
  if(!active||!connected)return null;
  if(typeof navigator!=='undefined'&&navigator.onLine===false){pending=true;onStatus('pending','Offline: notes remain saved on this device');return null;}
  const local=read(localKey,[]);
  const snapshot=bridge?await bridge.read(learner,pack):null;
  const f=bridge?null:await doc();
  const snap=bridge?null:await f.f.F.getDoc(f.ref);
  const remote=bridge?snapshot.notes:(snap.exists()?snap.data()?.notes||[]:[]);
  const merged=mergeNotes(local,remote);
  let result=merged;
  if(!same(merged,remote)){
   result=bridge?await bridge.write(learner,pack,merged,snapshot.revision):await f.f.F.runTransaction(f.f.db,async transaction=>{
    const fresh=await transaction.get(f.ref);
    const latest=mergeNotes(merged,fresh.exists()?fresh.data()?.notes||[]:[]);
    if(!same(latest,fresh.exists()?fresh.data()?.notes||[]:[]))
     transaction.set(f.ref,{app:'inclass',schema:1,learner,pack,notes:latest,updatedAt:new Date().toISOString()});
    return latest;
   });
  }
  if(!active)return null;
  const current=read(localKey,[]);
  result=mergeNotes(current,result);
  if(!same(result,current)){write(result);await onData(result);}
  pending=false;onStatus('synced');return result;
 }
 function queue(){
  const task=busy.catch(()=>{}).then(()=>sync());
  busy=task;
  return task;
 }
 function retry(){if(active&&connected)queue().catch(notify)}
 return {
  mode:'family-firebase',
  async connect(){
   if(!bridge&&!await getParent())throw Error('Parent sign-in required');
   active=true;connected=true;onStatus('syncing');
   try{
    await queue();
    if(!bridge){const {f,ref}=await doc();unsub=f.F.onSnapshot(ref,()=>{if(active&&connected)queue().catch(notify)},notify);}
    if(typeof window!=='undefined'&&!listeners){window.addEventListener('online',retry);listeners=true;}
    if(bridge&&typeof window!=='undefined'){window.addEventListener('focus',retry);window.addEventListener('pageshow',retry);}
   }catch(error){connected=false;notify(error);throw error;}
  },
  disconnect(){
   active=false;connected=false;unsub?.();unsub=null;
   if(typeof window!=='undefined'&&listeners){window.removeEventListener('online',retry);listeners=false;}
   if(bridge&&typeof window!=='undefined'){window.removeEventListener('focus',retry);window.removeEventListener('pageshow',retry);}
  },
  async list(){return read(localKey,[])},
  async save(note){
   if(!note||typeof note.text!=='string'||!note.text.trim())throw Error('Note text required');
   const rows=read(localKey,[]),i=rows.findIndex(x=>x.id===note.id);
   if(i<0)rows.push(note);else rows[i]=note;
   write(rows);pending=true;onStatus('pending');
   if(connected)queue().catch(notify);
   return note;
  },
  async remove(id){
   const rows=read(localKey,[]),i=rows.findIndex(x=>x.id===id);
   if(i>=0){rows[i]={...rows[i],status:'archived',updatedAt:new Date().toISOString()};write(rows);pending=true;onStatus('pending');if(connected)queue().catch(notify)}
  },
  async getDraft(){return read(draftKey,null)},
  async saveDraft(value){value?localStorage.setItem(draftKey,JSON.stringify(value)):localStorage.removeItem(draftKey)},
  async clearDraft(){localStorage.removeItem(draftKey)},
  async flush(){await queue();return !pending},
  get pending(){return pending}
 };
}
