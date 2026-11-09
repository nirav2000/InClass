(function(){
"use strict";
const key=(pack,learner)=>"inclass:paper:"+pack+":"+learner;
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const link=(id,mode)=>"worksheets/print.html?lesson="+encodeURIComponent(id)+"&mode="+mode;
const get=(id,learner)=>window.InClassData?window.InClassData.getJson(key(id,learner),{}):safeRead(key(id,learner));
function safeRead(name){try{return JSON.parse(localStorage.getItem(name))||{};}catch{return {};}}
function store(id,learner,entry){
 if(window.InClassData)window.InClassData.setJson(key(id,learner),entry);
 else localStorage.setItem(key(id,learner),JSON.stringify(entry));
}
function metric(label,field,old){
 let mark=old[field]||{};
 return '<label class="paperMetric"><span>'+label+'</span><span class="paperMetricFields"><input inputmode="numeric" type="number" min="0" max="99" data-paper-field="'+field+'Correct" placeholder="✓" value="'+esc(mark.correct??"")+'" aria-label="'+label+' correct"> / <input inputmode="numeric" type="number" min="0" max="99" data-paper-field="'+field+'Total" placeholder="total" value="'+esc(mark.total??"")+'" aria-label="'+label+' questions"></span></label>';
}
function measure(fields,k){
 const n=fields[k+"Correct"]?.value?.trim()??"", t=fields[k+"Total"]?.value?.trim()??"";
 if(n===""&&t==="")return null;
 if(n===""||t===""||!/^\d+$/.test(n)||!/^\d+$/.test(t)||Number(t)<1||Number(n)>Number(t))throw Error("For "+k+", enter correct and total (correct must not exceed total).");
 return {correct:Number(n),total:Number(t)};
}
function render(pack,learner){
 const target=document.getElementById("stepNav");
 if(!target||!pack)return;
 let box=document.getElementById("inclassPaperPanel");
 if(!box){
  box=document.createElement("section");
  box.id="inclassPaperPanel";box.className="paperPanel";
  target.parentNode.insertBefore(box,target);
 }
 const old=get(pack,learner);
 const parent=(window.InClassAuth?.getSession?.()?.role||"parent")==="parent";
 const status=old.completed?"Completed on paper"+(old.updatedAt?" · review saved":""):"Not yet recorded";
 box.innerHTML='<div class="paperPanelHead"><div><div class="paperLabel">PAPER OR SCREEN · YOUR CHOICE</div><strong>Write by hand instead</strong><p>Print the lesson, work without a screen, then optionally record the paper results. The school task stays the same.</p></div><div class="paperActions"><a class="paperPrimary" target="_blank" rel="noopener" href="'+link(pack,"student")+'">Printable worksheet</a>'+(parent?'<a class="paperSecondary" target="_blank" rel="noopener" href="'+link(pack,"answers")+'">Parent answer guide</a>':"")+'</div></div>'+
 '<details class="paperRecord"><summary>Record paper completion &amp; review <small>'+esc(status)+'</small></summary>'+
 '<div class="paperRecordBody"><label class="paperDone"><input id="paperCompleted" type="checkbox" '+(old.completed?"checked":"")+'> Worksheet completed on paper</label>'+
 '<p>Three separate checks; leave a score blank if not assessed. Written meaning is reviewed by an adult rather than automatically marked.</p>'+
 '<div class="paperMetrics">'+metric("School recall","school",old)+metric("Explains why","understanding",old)+metric("New problems","transfer",old)+'</div>'+
 '<label class="paperNotes">Where was help needed? <textarea id="paperNotes" rows="2" placeholder="Concepts to revisit or useful observations">'+esc(old.notes||"")+'</textarea></label>'+
 '<div class="paperSaveRow"><button id="savePaperReview" type="button">Save paper review</button><span id="paperFeedback" role="status" aria-live="polite"></span></div>'+
 '</div></details>';
 box.querySelector("#savePaperReview").addEventListener("click",()=>{
  const fields={};
  box.querySelectorAll("[data-paper-field]").forEach(x=>fields[x.dataset.paperField]=x);
  const feedback=box.querySelector("#paperFeedback");
  try {
   const school=measure(fields,"school"),understanding=measure(fields,"understanding"),transfer=measure(fields,"transfer");
   const current={completed:box.querySelector("#paperCompleted").checked,school,understanding,transfer,notes:box.querySelector("#paperNotes").value.trim(),updatedAt:new Date().toISOString(),reviewMethod:"adult-entered-paper"};
   store(pack,learner,current);
   feedback.textContent="Paper review saved locally. No test scores were assumed.";
   box.querySelector("summary small").textContent=current.completed?"Completed on paper · review saved":"Review saved";
   document.dispatchEvent(new CustomEvent("inclass:paperreviewchange",{detail:{packId:pack,learner}}));
  }catch(e){feedback.textContent=e.message;}
 });
}
document.addEventListener("inclass:lessonchange",event=>{
 const d=event.detail||{};
 render(d.packId,d.learner);
});
window.InClassPaper={get,link,render};
})();
