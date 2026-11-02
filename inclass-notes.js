// InClass consumes the canonical shared Notes UI and schema without forking them.
// Learning notes are local and never sent to GitHub automatically. The preview
// role switch is not authentication; it must not grant access to private notes.
const ROOT='https://nirav2000.github.io/Apps/notes/v1/index.js?v=1.2.4';
const notice='Notes are saved on this device. Parent sign-in enables encrypted-in-transit Firebase sync. Copy to ChatGPT only when approved.';
const status=document.createElement('span');
status.id='inclassNotesStatus';
status.setAttribute('role','status');
status.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147482999;font-size:12px;color:#41566d;max-width:210px;pointer-events:none';
document.body.append(status);
let controller=null,activeKey='',generation=0,notesModule=null,transport=null;
const family=await import('./services/family-notes.js');
const monitor=await import('./services/app-monitor-notes.js');
let mode='local',bridge=null;
const cloudUI=document.createElement('button');cloudUI.type='button';cloudUI.textContent='Notes sync · Local';cloudUI.setAttribute('aria-label','Connect private lesson notes with parent Firebase account');cloudUI.style.cssText='position:fixed;bottom:72px;right:max(16px,env(safe-area-inset-right));z-index:2147482900;border:1px solid #b4c7d9;border-radius:999px;background:#fff;color:#132e45;padding:10px 14px;font:600 13px -apple-system,BlinkMacSystemFont,sans-serif;box-shadow:0 5px 22px #102a4322';document.body.append(cloudUI);
let lastSyncError='';
const syncState=(state,message='')=>{
 if(state==='error')lastSyncError=message||'Cloud sync could not complete';
 else if(state==='synced')lastSyncError='';
 cloudUI.textContent='Notes sync · '+({synced:'Synced',syncing:'Syncing',pending:'Saving locally',error:'Needs attention'}[state]||'Local');
 cloudUI.title=lastSyncError||message||'Open notes synchronisation settings';
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
  const launcher=document.querySelector('.apps-notes-launcher');
  if(launcher)launcher.hidden=!!document.getElementById('appShell')?.classList.contains('hidden');
  cloudUI.hidden=false;
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
document.getElementById('homeButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
document.getElementById('enterAppButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
document.addEventListener('DOMContentLoaded',()=>refresh());
if(document.readyState!=='loading')refresh();


async function adopt(modeName,bridgeImpl=null){
  mode=modeName;bridge=bridgeImpl;activeKey='';syncState('syncing');
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
cloudUI.onclick=async()=>{
 const dialog=document.createElement('dialog');
 dialog.className='inclass-notes-sync-dialog';
 dialog.innerHTML='<div class="inclass-sync-top"><span class="inclass-sync-icon">☁</span><div><p class="inclass-sync-eyebrow">PRIVATE LEARNING NOTES</p><h2>Keep your notes in sync</h2></div></div><p class="inclass-sync-subtitle">Access the same homework notes across your iPad, iPhone and other devices.</p><div class="inclass-sync-current"><span class="inclass-sync-dot"></span><div><strong id="notesIdentityInfo">Checking connection</strong><p id="notesSyncDetail"></p></div></div><div class="inclass-sync-options"><button data-action="firebase"><span class="inclass-sync-option-icon">✓</span><span><strong>Existing Firebase account</strong><small>Use the parent session already saved on this device</small></span><span aria-hidden="true">›</span></button><button data-action="monitor"><span class="inclass-sync-option-icon">⌁</span><span><strong>App Monitor passkey</strong><small>Secure sign-in without entering a password</small></span><span aria-hidden="true">›</span></button><button data-action="email"><span class="inclass-sync-option-icon">@</span><span><strong>Firebase email</strong><small>Alternative sign-in method</small></span><span aria-hidden="true">›</span></button></div><p id="notesIdentityMessage" role="status" aria-live="polite"></p><div class="inclass-sync-bottom"><button data-action="disconnect">Use this device only</button><button data-action="close" class="inclass-sync-close">Done</button></div>';
 document.body.append(dialog);dialog.showModal();
 dialog.querySelector('#notesIdentityInfo').textContent=mode==='firebase'?'Connected with Firebase':mode==='app-monitor'?'Connected with App Monitor passkey':'Notes saved on this device';
 dialog.querySelector('#notesSyncDetail').textContent=lastSyncError|| (mode==='local'?'Sign in below to turn on cross-device synchronisation.':'Your sign-in is recognised. Note storage is checked separately.');
 dialog.querySelector('.inclass-sync-dot').classList.toggle('has-error',!!lastSyncError);
 dialog.querySelector('.inclass-sync-dot').classList.toggle('is-connected',mode!=='local'&&!lastSyncError);
 const $=s=>dialog.querySelector(s);
 dialog.addEventListener('close',()=>dialog.remove());
 dialog.onclick=async event=>{
  const action=event.target.closest('button')?.dataset.action;
  if(!action)return;
  if(action==='close'){dialog.close();return;}
  try{
   if(action==='firebase'){
    if(!await family.currentParent())throw Error('No existing parent Firebase session in this browser. Use App Monitor passkey or another Firebase sign-in method.');
    await adopt('firebase');dialog.close();return;
   }
   if(action==='monitor'){
    // Initiate WebAuthn while handling the direct user tap.
    const a=await monitor.signIn();await adopt('app-monitor',monitor.createBridge(a));dialog.close();return;
   }
   if(action==='email'){
    const email=prompt('Firebase parent account email');if(!email)return;
    const password=prompt('Firebase password');if(!password)return;
    await family.signIn(email.trim(),password);await adopt('firebase');dialog.close();return;
   }
   if(action==='disconnect'){transport?.disconnect?.();await adopt('local');lastSyncError='';syncState('local');dialog.close();return;}
  }catch(e){$('#notesIdentityMessage').textContent=e.message;syncState('error',e.message);}
 };
};
