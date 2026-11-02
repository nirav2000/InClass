// InClass consumes the canonical shared Notes UI and schema without forking them.
// Learning notes are local and never sent to GitHub automatically. The preview
// role switch is not authentication; it must not grant access to private notes.
const ROOT='https://nirav2000.github.io/Apps/notes/v1/index.js?v=1.2.6';
const notice='Notes are saved on this device. Parent sign-in enables encrypted-in-transit Firebase sync. Copy to ChatGPT only when approved.';
const status=document.createElement('span');
status.id='inclassNotesStatus';
status.setAttribute('role','status');
status.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147482999;font-size:12px;color:#41566d;max-width:210px;pointer-events:none';
document.body.append(status);
let controller=null,activeKey='',generation=0,notesModule=null,transport=null;
const family=await import('./services/family-notes.js');
const monitor=await import('./services/app-monitor-notes.js');
let identityPickerModule=null,identityPickerPromise=null;
function preloadIdentityPicker(){
 if(identityPickerModule)return Promise.resolve(identityPickerModule);
 if(!identityPickerPromise)identityPickerPromise=import('https://nirav2000.github.io/Apps/notes/v1/identity-picker.js?v=1.0.2').then(m=>(identityPickerModule=m,m)).catch(error=>{identityPickerPromise=null;throw error});
 return identityPickerPromise;
}
let mode='local',bridge=null;
const cloudUI=document.createElement('button');cloudUI.type='button';cloudUI.className='inclassSyncButton';cloudUI.dataset.inclassSyncButton='';cloudUI.textContent='Notes sync · Local';cloudUI.setAttribute('aria-label','Connect private lesson notes with parent Firebase account');
let lastSyncError='';
const syncState=(state,message='')=>{
 if(state==='error')lastSyncError=message||'Cloud sync could not complete';
 else if(state==='synced')lastSyncError='';
 cloudUI.textContent='Notes sync · '+({synced:'Synced',syncing:'Syncing',pending:'Saving locally',error:'Needs attention'}[state]||'Local');
 cloudUI.title=(lastSyncError||message||'Open notes synchronisation settings')+' · InClass '+String(window.INCLASS_CONFIG?.release||'unknown')+' · Notes '+String(controller?.version||'1.2.6');
 cloudUI.setAttribute('aria-label','Notes synchronisation. '+(lastSyncError||state));
};
function lesson(){
  const packId=document.getElementById('weekSelect')?.value;
  const week=(window.INCLASS_WEEKS||[]).find(x=>x.id===packId);
  const auth=window.InClassAuth?.getSession?.();
  if(!week||!auth)return null;
  // Preview role is cosmetic, not proof of parent access. In local mode notes
  // live in this browser's isolated owner namespace, not the public backend.
  const owner=String(auth.dataOwnerId||auth.userId||'local').replace(/[^a-zA-Z0-9_-]/g,'_');
  const learner=String(document.getElementById('learnerSelect')?.value||'learner').replace(/[^a-zA-Z0-9_-]/g,'_');
  return {week,owner,learner,page:'inclass:lesson:'+week.id+':'+learner,key:owner+'|'+learner+'|'+week.id};
}
function toggleVisibility(){
  const showingLesson=!document.getElementById('appShell')?.classList.contains('hidden');
  const home=document.getElementById('inclassHomeTools');
  const lessonHost=document.getElementById('inclassLessonTools');
  const host=showingLesson?lessonHost:home;
  if(host&&cloudUI.parentElement!==host)host.append(cloudUI);
  const launcher=document.querySelector('.apps-notes-launcher');
  if(launcher){
    launcher.hidden=!showingLesson;
    if(lessonHost&&launcher.parentElement!==lessonHost)lessonHost.prepend(launcher);
  }
  window.dispatchEvent(new Event('inclass:toolshostchange'));
}
async function refresh(){
  const details=lesson();
  if(!details){toggleVisibility();return;}
  const token=++generation;
  if(details.key===activeKey&&controller){controller.ui?.render();toggleVisibility();return;}
  try{
    if(!notesModule)notesModule=await import(ROOT);
    if(token!==generation)return;
    transport?.disconnect?.();controller?.ui?.destroy?.();
    const storageKey='inclass:private-notes:v1:'+details.owner+':'+details.learner+':'+details.week.id;
    const cloudKey=details.learner.toLowerCase()==='sai'?'sai':details.learner;
    transport=family.createFamilyNotesTransport({bridge,learner:cloudKey,pack:details.week.id,localKey:storageKey,onStatus:syncState,onData:async()=>{if(controller&&activeKey===details.key){await controller.load();controller.ui?.render();}}});
    const notes=await notesModule.default.init({
      appId:'inclass',appVersion:String(window.INCLASS_CONFIG?.release||'2026.11.02'),
      page:()=>details.page,transport,reviewFeed:false,
      defaultType:'feedback',reviewLabel:'Flag for my review (stays private)',
      ui:{launcherLabel:'✎ Lesson notes',title:details.week.title+' · '+details.learner,
        annotation:true,pageScope:true,chatGPTHandoff:true,
        defaultReviewRequired:false,reviewLabel:'Flag for my review (stays private)',notice}
    });
    if(token!==generation){notes.ui?.destroy?.();return;}
    controller=notes;activeKey=details.key;status.textContent='';
    if(mode!=='local')await transport.connect().then(async()=>{await controller.load();controller.ui?.render()}).catch(e=>syncState('error',e.message));
    toggleVisibility();
  }catch(error){status.textContent='Notes unavailable; lessons are unaffected.';console.warn('InClass Notes:',error);}
}
window.addEventListener('inclass:lessonchange',()=>refresh());
const shellObserver=new MutationObserver(()=>toggleVisibility());
const shell=document.getElementById('appShell');if(shell)shellObserver.observe(shell,{attributes:true,attributeFilter:['class','hidden']});
window.addEventListener('inclass:authchange',()=>{activeKey='';refresh()});
window.addEventListener('pageshow',toggleVisibility);
queueMicrotask(toggleVisibility);
document.getElementById('homeButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
document.getElementById('enterAppButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
window.addEventListener('inclass:notes-identity-request',()=>window.InClassCompactTools?.openSync());
document.addEventListener('DOMContentLoaded',()=>refresh());
if(document.readyState!=='loading')refresh();


async function adopt(modeName,bridgeImpl=null){
  mode=modeName;bridge=bridgeImpl;activeKey='';syncState(mode==='local'?'local':'syncing');
  await refresh();
}
async function recognise(){
  try{
    if(await family.currentParent()){await adopt('firebase');return;}
    const session=await monitor.existing();
    if(session)await adopt('app-monitor',monitor.createBridge(session));
  }catch(e){console.warn('Existing InClass note session unavailable',e);}
}
queueMicrotask(()=>recognise());
queueMicrotask(()=>preloadIdentityPicker().catch(()=>{}));
async function showSharedIdentityPicker(){
  const module=await preloadIdentityPicker();
  return module.showNotesIdentityPicker({
    mode,error:lastSyncError,title:'Keep your notes in sync',
    versionInfo:'InClass '+String(window.INCLASS_CONFIG?.release||'unknown')+' · Shared Notes '+String(controller?.version||'1.2.6'),
    onFirebase:async()=>{
      if(!await family.currentParent())throw Error('No parent Firebase session found in this browser. Use an existing App Monitor passkey, or sign in with Firebase below.');
      await adopt('firebase');
      if(lastSyncError)throw Error(lastSyncError);
    },
    onPasskey:async()=>{
      const a=await monitor.signIn();
      await adopt('app-monitor',monitor.createBridge(a));
      if(lastSyncError)throw Error(lastSyncError);
    },
    onEmail:async(email,password)=>{
      await family.signIn(email,password);
      await adopt('firebase');
      if(lastSyncError)throw Error(lastSyncError);
    },
    onLocal:async()=>{
      transport?.disconnect?.();
      await adopt('local');
      lastSyncError='';
      syncState('local');
    }
  });
}
window.InClassNotesShowIdentity=showSharedIdentityPicker;
window.dispatchEvent(new Event('inclass:notes-account-ready'));
cloudUI.onclick=()=>window.InClassCompactTools?.openSync();
