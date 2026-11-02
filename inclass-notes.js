// InClass consumes the canonical shared Notes UI and schema without forking them.
// Learning notes are local and never sent to GitHub automatically. The preview
// role switch is not authentication; it must not grant access to private notes.
const ROOT='https://nirav2000.github.io/Apps/notes/v1/index.js';
const notice='Notes are saved on this device. Parent sign-in enables encrypted-in-transit Firebase sync. Copy to ChatGPT only when approved.';
const status=document.createElement('span');
status.id='inclassNotesStatus';
status.setAttribute('role','status');
status.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147482999;font-size:12px;color:#41566d;max-width:210px;pointer-events:none';
document.body.append(status);
let controller=null,activeKey='',generation=0,notesModule=null,transport=null;
const family=await import('./services/family-notes.js');
const cloudUI=document.createElement('button');cloudUI.type='button';cloudUI.textContent='Notes sync · Local';cloudUI.setAttribute('aria-label','Connect private lesson notes with parent Firebase account');cloudUI.style.cssText='position:fixed;bottom:70px;right:18px;z-index:2147482900;border:1px solid #aebfd0;border-radius:14px;background:#fff;color:#132e45;padding:8px 12px;font:600 12px sans-serif';document.body.append(cloudUI);
const syncState=(mode,message='')=>{cloudUI.textContent='Notes sync · '+({synced:'Synced',syncing:'Syncing',pending:'Saving',error:'Needs attention'}[mode]||'Local');cloudUI.title=message};
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
  cloudUI.hidden=!!document.getElementById('appShell')?.classList.contains('hidden');
}
async function refresh(){
  const details=lesson();
  if(!details)return;
  const token=++generation;
  if(details.key===activeKey&&controller){controller.ui?.render();toggleVisibility();return;}
  try{
    if(!notesModule)notesModule=await import(ROOT);
    if(token!==generation)return;
    transport?.disconnect?.();controller?.ui?.destroy?.();
    const storageKey='inclass:private-notes:v1:'+details.owner+':'+details.learner+':'+details.week.id;
    const cloudKey=details.learner.toLowerCase()==='sai'?'sai':details.learner;
    transport=family.createFamilyNotesTransport({learner:cloudKey,pack:details.week.id,localKey:storageKey,onStatus:syncState});
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
    if(await family.currentParent())await transport.connect().then(async()=>{await controller.load();controller.ui?.render()}).catch(e=>syncState('error',e.message));
    toggleVisibility();
  }catch(error){status.textContent='Notes unavailable; lessons are unaffected.';console.warn('InClass Notes:',error);}
}
window.addEventListener('inclass:lessonchange',()=>refresh());
window.addEventListener('inclass:authchange',()=>{activeKey='';refresh()});
window.addEventListener('pageshow',toggleVisibility);
document.getElementById('homeButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
document.getElementById('enterAppButton')?.addEventListener('click',()=>queueMicrotask(toggleVisibility));
document.addEventListener('DOMContentLoaded',()=>refresh());
if(document.readyState!=='loading')refresh();

cloudUI.onclick=async()=>{
 if(!controller)return;
 try{
  if(await family.currentParent()){
   if(confirm('Disconnect this device from the parent notes account? Notes already on this device remain available.')){transport.disconnect();await family.signOut();syncState('local');activeKey='';await refresh();}
   else{syncState('syncing');await transport.flush();await controller.load();controller.ui?.render();}
   return;
  }
  const email=prompt('Parent Firebase email (same account used by LearnLatin):');
  if(!email)return;
  const password=prompt('Parent Firebase password (used only to sign in to Firebase):');
  if(!password)return;
  syncState('syncing');
  await family.signIn(email.trim(),password);
  await transport.connect();await controller.load();controller.ui?.render();
 }catch(e){syncState('error',e.message);alert('Notes sync: '+e.message)}
};
