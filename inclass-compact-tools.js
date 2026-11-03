// Small shared-facing entry point: show account feedback on the FIRST tap.
// The actual authentication options live in Apps/notes/v1/identity-picker.js.
(function(){
  const home=document.getElementById('inclassHomeTools');
  const lesson=document.getElementById('inclassLessonTools');
  if(!home||!lesson)return;
  home.dataset.compactReady='';lesson.dataset.compactReady='';
  const root=document.createElement('div');root.className='inclassCompactTools';
  const toggle=document.createElement('button');toggle.type='button';toggle.className='inclassCompactToggle';
  toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-haspopup','menu');
  toggle.textContent='✎ Notes  ▾';
  const menu=document.createElement('div');menu.className='inclassCompactMenu';menu.hidden=true;menu.setAttribute('role','menu');
  const make=(label,action)=>{
    const b=document.createElement('button');b.type='button';b.setAttribute('role','menuitem');
    b.dataset.action=action;b.textContent=label;menu.append(b);return b;
  };
  // Keep the welcome header to a single compact control. Preserve the
  // existing install button and app-progress status by moving them into menu.
  const header=document.querySelector('.welcomeAuth');
  if(header){
    header.append(home);
    const install=document.getElementById('installInClassButton');
    const progress=document.getElementById('authStatus');
    const account=document.getElementById('signInButton');
    if(install){install.setAttribute('role','menuitem');install.classList.add('inclassCompactInstall')}
    if(progress){progress.classList.add('inclassCompactStatus')}
    if(account)account.hidden=true;
    header.classList.add('inclassHeaderTidy');
  }
  const note=make('✎  Lesson notes','notes');
  const syncAction=make('☁  Account & sync · Local','sync');
  function setSyncStatus(state,details=''){
    const names={synced:'Synced',syncing:'Connecting',pending:'Pending',error:'Needs attention',local:'Local'};
    const description=names[state]||'Local';
    syncAction.textContent='☁  Account & sync · '+description;
    syncAction.title=details||'Manage private notes synchronisation';
  }
  make('⚑  Report an issue','issue');
  const installAction=document.getElementById('installInClassButton');
  const previewStatus=document.getElementById('authStatus');
  if(installAction)menu.append(installAction);
  if(previewStatus)menu.append(previewStatus);
  const message=document.createElement('p');message.setAttribute('role','status');
  message.setAttribute('aria-live','polite');menu.append(message);
  root.append(toggle,menu);
  const installButton=document.getElementById('installInClassButton');
  installButton?.addEventListener('click',()=>closeMenu());
  function closeMenu(){menu.hidden=true;toggle.setAttribute('aria-expanded','false');message.textContent=''}
  function place(){
    const inLesson=!document.getElementById('appShell')?.classList.contains('hidden');
    note.hidden=!inLesson;
    const target=inLesson?lesson:home;
    if(root.parentElement!==target){closeMenu();target.append(root)}
  }
  toggle.onclick=()=>{
    if(!menu.hidden){closeMenu();return}
    place();menu.hidden=false;toggle.setAttribute('aria-expanded','true');
  };
  document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))closeMenu()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();toggle.focus()}});
  async function openNotes(){
    closeMenu();
    const launcher=document.querySelector('.apps-notes-launcher');
    if(launcher){launcher.click();return}
    message.textContent='Notes are loading. Please try again.';
    menu.hidden=false;toggle.setAttribute('aria-expanded','true');
  }
  function openFeedback(){
    closeMenu();
    window.dispatchEvent(new Event('inclass:open-development-feedback'));
  }
  function waitForNotesAccount(){
    if(typeof window.InClassNotesShowIdentity==='function')return Promise.resolve(window.InClassNotesShowIdentity);
    return new Promise((resolve,reject)=>{
      let finished=false;
      const onReady=()=>{
        if(typeof window.InClassNotesShowIdentity!=='function')return;
        if(finished)return;finished=true;clearTimeout(limit);
        window.removeEventListener('inclass:notes-account-ready',onReady);
        resolve(window.InClassNotesShowIdentity);
      };
      const limit=setTimeout(()=>{
        if(finished)return;finished=true;
        window.removeEventListener('inclass:notes-account-ready',onReady);
        reject(Error('Notes login has not finished loading.'));
      },8000);
      window.addEventListener('inclass:notes-account-ready',onReady);
      onReady();
    });
  }
  function openSync(){
    closeMenu();
    const opened=document.querySelector('dialog.apps-notes-identity[open],dialog.inclassAccountLoader[open]');
    if(opened){opened.focus();return}
    const dialog=document.createElement('dialog');dialog.className='inclassAccountLoader';
    dialog.innerHTML='<h2>Notes account</h2><p data-progress role="status" aria-live="polite">Opening secure sign-in options…</p><div><button type="button" data-close>Close</button><button type="button" data-retry hidden>Retry</button></div>';
    document.body.append(dialog);
    dialog.addEventListener('close',()=>dialog.remove(),{once:true});
    dialog.querySelector('[data-close]').onclick=()=>dialog.close();
    const msg=dialog.querySelector('[data-progress]'),retry=dialog.querySelector('[data-retry]');
    let request=0;
    async function load(){
      const mine=++request;retry.hidden=true;
      msg.textContent='Opening secure sign-in options…';
      try{
        const handler=await waitForNotesAccount();
        if(!dialog.open||request!==mine)return;
        await handler();
        if(dialog.open&&request===mine)dialog.close();
      }catch(e){
        if(!dialog.open||request!==mine)return;
        msg.textContent='Sign-in options could not open. Local notes are safe. '+String(e?.message||e);
        retry.hidden=false;
      }
    }
    retry.onclick=load;
    dialog.showModal(); // Show feedback synchronously before any await.
    void load();
  }
  menu.onclick=e=>{
    if(e.target.closest('#installInClassButton')){closeMenu();return}
    const action=e.target.closest('button[data-action]')?.dataset.action;
    if(action==='notes')void openNotes();
    if(action==='sync')openSync();
    if(action==='issue')openFeedback();
  };
  window.InClassCompactTools={openSync,openMenu:()=>toggle.click(),closeMenu,setSyncStatus};
  window.addEventListener('inclass:toolshostchange',place);
  window.addEventListener('inclass:lessonchange',place);
  window.addEventListener('pageshow',place);
  const shell=document.getElementById('appShell');
  if(shell)new MutationObserver(place).observe(shell,{attributes:true,attributeFilter:['class','hidden']});
  place();
})();
