// InClass's app-specific development feedback workflow.
// Private learning notes use the separate, canonical shared Notes editor.
// No student notes, screen content or application state is uploaded here.
const API='https://apps-monitor-api.nirav2000-github.workers.dev/app-monitor';
const SDK='https://nirav2000.github.io/Apps/apps-passkey-auth.js?v=1';
let adminAuth=null,adminScript=null;
function loadAdminScript(){
  if(window.AppsPasskeyAuth)return Promise.resolve();
  if(adminScript)return adminScript;
  adminScript=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src=SDK;
    script.onload=resolve;
    script.onerror=()=>reject(Error('App Monitor login could not load. Your feedback has not been sent.'));
    document.head.append(script);
  }).catch(error=>{adminScript=null;throw error});
  return adminScript;
}
async function administrator(){
  await loadAdminScript();
  if(!adminAuth){
    adminAuth=window.AppsPasskeyAuth.create({
      baseUrl:API,sessionStoreKey:'app-monitor.admin-session.v2',
      failureStoreKey:'app-monitor.auth-failures.v2'
    });
    adminAuth.restoreSession();
  }
  const session=await adminAuth.validateSession();
  if(!session||session.method!=='passkey')await adminAuth.passkeyLogin();
  const verified=await adminAuth.validateSession();
  if(!verified||verified.method!=='passkey')throw Error('An App Monitor administrator passkey is required.');
  return adminAuth;
}

const launcher=document.createElement('button');
launcher.type='button';
launcher.className='inclassDevButton';
launcher.dataset.inclassDevLaunch='';
launcher.textContent='Development feedback';
launcher.setAttribute('aria-label','Report an InClass app problem for administrator review');

function placeLauncher(){
  const showingLesson=!document.getElementById('appShell')?.classList.contains('hidden');
  const host=document.getElementById(showingLesson?'inclassLessonTools':'inclassHomeTools');
  if(host&&launcher.parentElement!==host)host.append(launcher);
}
queueMicrotask(placeLauncher);
window.addEventListener('inclass:toolshostchange',placeLauncher);
window.addEventListener('inclass:lessonchange',placeLauncher);
const appShell=document.getElementById('appShell');
if(appShell)new MutationObserver(placeLauncher).observe(appShell,{attributes:true,attributeFilter:['class','hidden']});

window.addEventListener('inclass:open-development-feedback',()=>launcher.click());
launcher.addEventListener('click',()=>{
  // Avoid accidentally opening duplicate dialogs on repeated touch events.
  const previous=document.querySelector('dialog.inclass-dev-dialog');
  if(previous){previous.focus();return;}
  const dialog=document.createElement('dialog');
  dialog.className='inclass-dev-dialog';
  dialog.setAttribute('aria-label','Submit development feedback');
  dialog.innerHTML=`
    <p class="inclass-dev-eyebrow">INCLASS · APP IMPROVEMENTS</p>
    <h2>Report an app issue</h2>
    <p class="inclass-dev-intro">Tell us what in the app is not working.
      This will only be submitted after you have reviewed the exact message.</p>
    <section data-dev-form>
      <label class="inclass-dev-field" for="devFeedbackText">
        What needs fixing?
        <textarea id="devFeedbackText" data-dev-text rows="5" minlength="12" maxlength="3000"
          placeholder="Example: On my phone, the notes button covers part of the homework."></textarea>
      </label>
      <label class="inclass-dev-consent">
        <input type="checkbox" data-dev-consent>
        <span>I have removed personal information and approve submitting this text to a GitHub issue.</span>
      </label>
      <p class="inclass-dev-warning">A GitHub issue may be public. Never include a child's name, schoolwork,
        passwords, account information, private notes or screenshots containing personal information.</p>
      <p data-dev-error class="inclass-dev-error" role="status" aria-live="polite"></p>
      <div class="inclass-dev-actions">
        <button type="button" data-dev-cancel>Cancel</button>
        <button type="button" data-dev-review class="inclass-dev-primary">Review issue</button>
      </div>
    </section>
    <section data-dev-preview hidden>
      <p><strong>Review exactly what will be submitted</strong></p>
      <div data-dev-preview-text class="inclass-dev-preview-text"></div>
      <p class="inclass-dev-warning">This text will be shared with the developer issue queue and may
        appear in the public InClass GitHub repository.</p>
      <p data-dev-result class="inclass-dev-error" role="status" aria-live="polite"></p>
      <div class="inclass-dev-actions">
        <button type="button" data-dev-back>Edit wording</button>
        <button type="button" data-dev-submit-final class="inclass-dev-primary">Authenticate & submit issue</button>
      </div>
    </section>
  `;
  document.body.append(dialog);
  dialog.showModal();
  const $=selector=>dialog.querySelector(selector);
  const form=$('[data-dev-form]'),preview=$('[data-dev-preview]');
  const input=$('[data-dev-text]'),consent=$('[data-dev-consent]');
  const error=$('[data-dev-error]'),result=$('[data-dev-result]');
  const final=$('[data-dev-submit-final]');
  dialog.addEventListener('close',()=>dialog.remove(),{once:true});
  $('[data-dev-cancel]').addEventListener('click',()=>dialog.close());
  $('[data-dev-back]').addEventListener('click',()=>{
    preview.hidden=true;form.hidden=false;result.textContent='';input.focus();
  });
  input.addEventListener('input',()=>{error.textContent=''});
  consent.addEventListener('change',()=>{error.textContent=''});
  $('[data-dev-review]').addEventListener('click',()=>{
    const text=input.value.trim();
    if(text.length<12){
      error.textContent='Please describe the problem in at least 12 characters.';
      input.focus();return;
    }
    if(!consent.checked){
      error.textContent='Please tick the privacy approval box before reviewing.';
      consent.focus();return;
    }
    error.textContent='';
    $('[data-dev-preview-text]').textContent=text; // Never interpret user text as HTML.
    form.hidden=true;preview.hidden=false;
    final.focus();
  });
  final.addEventListener('click',async()=>{
    const text=$('[data-dev-preview-text]').textContent;
    // The earlier privacy approval is checked again before posting.
    if(!consent.checked||text!==input.value.trim()){
      result.textContent='The wording or approval changed. Please review again.';return;
    }
    final.disabled=true;result.textContent='Verifying administrator passkey…';
    try{
      const auth=await administrator();
      result.textContent='Submitting your approved development issue…';
      const {createCloudTransport}=await import('https://nirav2000.github.io/Apps/notes/v1/cloud.js');
      const transport=createCloudTransport({appId:'inclass',apiBase:API+'/notes',getHeaders:()=>auth.authHeaders()});
      const pack=document.getElementById('weekSelect')?.value||'general';
      const time=new Date().toISOString();
      const note={
        id:crypto.randomUUID(),appId:'inclass',appVersion:window.INCLASS_CONFIG?.release||'unknown',
        page:'/InClass/'+pack,anchorId:'developer-feedback',anchorLabel:'Development feedback',
        type:'developer',text,status:'open',reviewRequired:true,createdAt:time,updatedAt:time,
        metadata:{targetRepository:'nirav2000/InClass',publicSafeApproved:true}
      };
      const saved=await transport.save(note);
      const issue=saved.note?.metadata?.developmentIssue;
      if(issue?.number){
        result.classList.add('inclass-dev-success');
        result.textContent='GitHub issue #'+issue.number+' created successfully. ';
        if(/^https:\/\/github\.com\/nirav2000\/InClass\/issues\/\d+$/.test(String(issue.url||''))){
          const link=document.createElement('a');link.href=issue.url;link.target='_blank';
          link.rel='noopener noreferrer';link.textContent='View issue';result.append(link);
        }
        final.textContent='Submitted';final.disabled=true;
      }else{
        result.textContent='Saved to the administrator queue, but GitHub issue creation was not confirmed. Review the queue before retrying to avoid a duplicate.';
        final.disabled=true;
      }
    }catch(e){
      result.classList.remove('inclass-dev-success');
      result.textContent='Not submitted: '+String(e?.message||e);
      final.disabled=false;
    }
  });
});
