// Separate from private learning notes. Only explicitly approved, redacted
// development feedback may leave InClass for the administrator's issue queue.
const API='https://apps-monitor-api.nirav2000-github.workers.dev/app-monitor';
const sdk='https://nirav2000.github.io/Apps/apps-passkey-auth.js?v=1';
let adminAuth=null;
function loadScript(url){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=reject;document.head.append(s)})}
async function admin(){
 if(!window.AppsPasskeyAuth)await loadScript(sdk);
 if(!adminAuth){
  adminAuth=window.AppsPasskeyAuth.create({baseUrl:API,sessionStoreKey:'app-monitor.admin-session.v2',failureStoreKey:'app-monitor.auth-failures.v2'});
  adminAuth.restoreSession();
 }
 if(!(await adminAuth.validateSession()))await adminAuth.passkeyLogin();
 return adminAuth;
}
const launch=document.createElement('button');
launch.textContent='Development feedback';launch.type='button';
launch.style.cssText='position:fixed;bottom:115px;right:18px;z-index:2147482900;background:#fff;border:1px solid #bccbda;border-radius:12px;padding:8px 11px;font:600 12px sans-serif';
document.body.append(launch);
function visible(){launch.hidden=!!document.getElementById('appShell')?.classList.contains('hidden')}
document.getElementById('homeButton')?.addEventListener('click',()=>queueMicrotask(visible));
window.addEventListener('inclass:lessonchange',visible);
visible();
launch.onclick=async()=>{
 const pack=document.getElementById('weekSelect')?.value||'general';
 const dialog=document.createElement('dialog');
 dialog.style.cssText='border:0;border-radius:18px;padding:22px;max-width:500px;width:calc(100vw - 50px);background:#fff;color:#182f43';
 dialog.innerHTML='<h2>Submit development feedback</h2><p>Describe an app issue, not a learner observation. This text may be published in a GitHub Issue. Do not include names, school details, answers, login details or personal learning records.</p><label for="devFeedbackText">Public-safe description</label><textarea id="devFeedbackText" rows="6" maxlength="3000" style="display:block;width:100%;box-sizing:border-box;margin:10px 0;padding:12px"></textarea><label><input type="checkbox" id="devSafe"> I have removed all private information and approve submission to GitHub.</label><p id="devFeedbackStatus" role="status"></p><div style="display:flex;gap:10px;margin-top:14px"><button id="devCancel" type="button">Cancel</button><button id="devSubmit" type="button">Authenticate & submit</button></div>';
 document.body.append(dialog);dialog.showModal();
 const $=s=>dialog.querySelector(s);$('#devCancel').onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>dialog.remove());
 $('#devSubmit').onclick=async()=>{
  const text=$('#devFeedbackText').value.trim();
  if(text.length<12||!$('#devSafe').checked){$('#devFeedbackStatus').textContent='Provide a public-safe description and approve the submission.';return}
  if(!confirm('Create a GitHub issue in nirav2000/InClass with this exact text? It will be public.'))return;
  $('#devSubmit').disabled=true;$('#devFeedbackStatus').textContent='Checking administrator passkey…';
  try{
   const auth=await admin();
   const {createCloudTransport}=await import('https://nirav2000.github.io/Apps/notes/v1/cloud.js');
   const transport=createCloudTransport({appId:'inclass',apiBase:API+'/notes',getHeaders:()=>auth.authHeaders()});
   const id=crypto.randomUUID();
   const result=await transport.save({id,appId:'inclass',appVersion:window.INCLASS_CONFIG?.release||'unknown',page:'/InClass/'+pack,anchorId:'developer-feedback',anchorLabel:'Development feedback',type:'developer',text,status:'open',reviewRequired:true,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),metadata:{targetRepository:'nirav2000/InClass',publicSafeApproved:true}});
   const issue=result.note?.metadata?.developmentIssue;
   if(issue?.number){$('#devFeedbackStatus').textContent='GitHub issue #'+issue.number+' created.';const a=document.createElement('a');a.href=issue.url;a.target='_blank';a.rel='noopener';a.textContent='Open issue';$('#devFeedbackStatus').append(' ',a)}
   else $('#devFeedbackStatus').textContent='Feedback saved in the administrator queue, but GitHub issue creation was not confirmed. Retry from App Monitor.';
  }catch(error){$('#devFeedbackStatus').textContent='Submission not confirmed: '+error.message}
  finally{$('#devSubmit').disabled=false}
 };
};
