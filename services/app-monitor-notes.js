// App Monitor session adapter for InClass private lesson notes.
// Reuses the existing App Monitor browser session; a passkey is required.
const ROOT='https://apps-monitor-api.nirav2000-github.workers.dev/app-monitor';
const STORE='app-monitor.admin-session.v2';
const load=async()=>{if(!window.AppsPasskeyAuth)await new Promise((resolve,reject)=>{const el=document.createElement('script');el.src='https://nirav2000.github.io/Apps/apps-passkey-auth.js?v=1';el.onload=resolve;el.onerror=reject;document.head.append(el)});};
let client=null;
async function auth(){
 await load();
 if(!client){client=window.AppsPasskeyAuth.create({baseUrl:ROOT,sessionStoreKey:STORE,failureStoreKey:'app-monitor.auth-failures.v2'});client.restoreSession();}
 return client;
}
export async function existing(){
 const a=await auth(),s=await a.validateSession();
 return s?.method==='passkey'?a:null;
}
export async function signIn(){
 const a=await auth();
 const session=await a.validateSession();
 if(session?.method!=='passkey'){
  let config;
  try{config=await a.status()}
  catch{throw Error('App Monitor authentication service could not be reached. Check your connection and retry.')}
  if(config?.bootstrapNeeded||config?.passkeyCount===0)
   throw Error('No App Monitor administrator passkey is registered on the backend. Open App Monitor to finish passkey setup.');
  if(!config?.ok)
   throw Error('App Monitor passkey backend did not report ready.');
  await a.passkeyLogin();
 }
 const verified=await a.validateSession();
 if(verified?.method!=='passkey')throw Error('Administrator passkey verification required');
 return a;
}
// Requires an administrator passkey session; returns only a health stage, never
// Firebase credentials, account details, or any learner notes.
export async function checkHealth(a){
 let response;
 try{response=await fetch(ROOT+'/inclass/family-notes/status',{cache:'no-store',headers:a.authHeaders()})}
 catch{throw Error('App Monitor notes backend could not be reached. The passkey session is retained; local notes remain available.')}
 const detail=await response.json().catch(()=>({}));
 if(response.ok&&detail.ok)return detail;
 const stage=String(detail.stage||'').slice(0,70);
 const reason={
  'firebase-credential-missing':'Firebase service-account secret is missing from the Cloudflare Worker.',
  'firebase-google-auth-failed':'Firebase service-account authentication failed.',
  'firestore-permission-denied':'Firebase accepted the credential but Firestore access was denied.',
  'firestore-unreachable':'Firestore could not be reached by the Worker.',
  'firestore-read-failed':'The Firestore health request failed.'
 }[stage]|| (response.status===404?'The current Cloudflare Worker has not been updated with the notes diagnostics endpoint.':
 response.status===401?'The App Monitor passkey session expired.':
 response.status===403?'An App Monitor administrator passkey is required.':'The notes backend failed its health check.');
 throw Error('App Monitor passkey connected, but private notes sync is not ready: '+reason);
}

export function createBridge(a){
 async function request(learner,pack,method='GET',notes=null,revision=null){
  const query='?learner='+encodeURIComponent(learner)+'&pack='+encodeURIComponent(pack);
  const response=await fetch(ROOT+'/inclass/family-notes'+query,{method,cache:'no-store',
   headers:{...a.authHeaders(),...(method==='POST'?{'Content-Type':'application/json'}:{})},
   ...(method==='POST'?{body:JSON.stringify({notes,revision})}:{})});
  if(!response.ok){
   const detail=await response.json().catch(()=>null);
   const reason=typeof detail?.error==='string'?detail.error.slice(0,170):'';
   const message=response.status===401?'App Monitor session expired':response.status===403?'App Monitor passkey required':response.status===503?'Firebase notes backend is not configured (server-side service account required)':response.status===502?'Firebase notes backend failed':response.status===409?'409: Another device changed these notes':response.status===400?'Notes rejected by server': 'Notes cloud returned '+response.status;
   throw Error(message+(reason?' · '+reason:''));
  }
  return response.json();
 }
 return {
  async read(learner,pack){return request(learner,pack)},
  async write(learner,pack,notes,revision){
   for(let tries=0;tries<4;tries++){
    try{
     const result=await request(learner,pack,'POST',notes,revision);
     return result.notes;
    }catch(e){
     if(!String(e.message).includes('409')||tries===3)throw e;
     const fresh=await request(learner,pack);
     const {mergeNotes}=await import('./family-notes.js');
     notes=mergeNotes(notes,fresh.notes);revision=fresh.revision;
    }
   }
  }
 };
}
