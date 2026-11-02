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
 // Passkey challenge starts directly from the click handler.
 const session=await a.validateSession();
 if(session?.method!=='passkey')await a.passkeyLogin();
 const verified=await a.validateSession();
 if(verified?.method!=='passkey')throw Error('Administrator passkey verification required');
 return a;
}
export function createBridge(a){
 async function request(learner,pack,method='GET',notes=null,revision=null){
  const query='?learner='+encodeURIComponent(learner)+'&pack='+encodeURIComponent(pack);
  const response=await fetch(ROOT+'/inclass/family-notes'+query,{method,cache:'no-store',
   headers:{...a.authHeaders(),...(method==='POST'?{'Content-Type':'application/json'}:{})},
   ...(method==='POST'?{body:JSON.stringify({notes,revision})}:{})});
  if(!response.ok)throw Error(response.status===401?'App Monitor session expired':response.status===403?'App Monitor passkey required':'Notes cloud returned '+response.status);
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
