// InClass consumes the canonical shared Notes UI and schema without forking them.
// Learning notes are local and never sent to GitHub automatically. The preview
// role switch is not authentication; it must not grant access to private notes.
const ROOT='https://nirav2000.github.io/Apps/notes/v1/index.js';
const notice='Private device notes. Not synced to cloud. Copy to ChatGPT only when you approve.';
const status=document.createElement('span');
status.id='inclassNotesStatus';
status.setAttribute('role','status');
status.style.cssText='position:fixed;left:12px;bottom:12px;z-index:2147482999;font-size:12px;color:#41566d;max-width:210px;pointer-events:none';
document.body.append(status);
let controller=null,activeKey='',generation=0,notesModule=null;
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
}
async function refresh(){
  const details=lesson();
  if(!details)return;
  const token=++generation;
  if(details.key===activeKey&&controller){controller.ui?.render();toggleVisibility();return;}
  try{
    if(!notesModule)notesModule=await import(ROOT);
    if(token!==generation)return;
    controller?.ui?.destroy?.();
    const storageKey='inclass:private-notes:v1:'+details.owner+':'+details.learner+':'+details.week.id;
    const transport=notesModule.createLocalStorageTransport({storageKey});
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
