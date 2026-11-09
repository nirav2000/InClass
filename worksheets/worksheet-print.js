(function(){
"use strict";
const list=window.INCLASS_WEEKS||[],catalog=window.InClassWorksheets;
const byId=id=>list.find(w=>w.id===id);
const pick=document.getElementById("lessonPicker");
const modePick=document.getElementById("modePicker");
const root=document.getElementById("printRoot");
const error=document.getElementById("error");
const esc=x=>String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
function url(id,mode){return "print.html?lesson="+encodeURIComponent(id)+"&mode="+encodeURIComponent(mode);}
function render(){
 const params=new URLSearchParams(location.search),id=params.get("lesson")||list.at(-1)?.id;
 const w=byId(id),mode=params.get("mode")==="answers"?"answers":"student";
 const p=catalog?.build(w),issues=catalog?.audit(p)||["Builder not loaded"];
 pick.innerHTML=list.map(x=>'<option value="'+esc(x.id)+'">'+esc(x.subject+" · "+x.date+" · "+x.title)+'</option>').join("");
 pick.value=id; modePick.value=mode;
 if(!w||issues.length){root.innerHTML="";error.hidden=false;error.textContent="This lesson does not yet have a validated paper pack: "+issues.join("; ");return;}
 error.hidden=true;
 document.title="InClass · "+p.title+" · "+(mode==="answers"?"Parent key":"Worksheet");
 const header='<header class="sheetHead"><div class="brand">INCLASS / '+esc(p.subject)+' / '+esc(p.yearGroup)+'</div><h1 class="sheetTitle">'+esc(p.title)+'</h1><p class="sheetSub">'+esc(p.date)+' · '+(mode==="answers"?"Parent answer and marking guide":"Pencil-and-paper learning alternative")+'</p>'+ (mode==="student"?'<div class="pupilMeta"><span>Name <i class="blankShort"></i></span><span>Date <i class="blankShort"></i></span></div>':"")+'</header>';
 const purpose='<div class="purpose"><strong>Learning goal</strong><p>'+esc(p.focus)+'</p><strong>School requirement</strong><p>'+esc(p.school)+'</p></div>'+ (p.note?'<p class="notice">'+esc(p.note)+'</p>':"");
 const studyHtml=p.guide.map(g=>'<div class="study"><strong>'+esc(g.title)+'</strong><p>'+esc(g.text)+'</p></div>').join("");
 const concepts='<section class="conceptIntro"><h2>First, understand the ideas</h2><div class="conceptGrid">'+p.concepts.map(c=>'<div class="concept"><strong>'+esc(c.term)+'</strong>'+esc(c.meaning)+'</div>').join("")+'</div></section>';
 const sections=p.sections.map((s,i)=>{
  let qs=s.questions.map((q,j)=>'<li class="question"><div class="qPrompt">'+esc(q.prompt)+'</div>'+(mode==="answers"?'<div class="answerBlock"><strong>Answer / what to look for</strong><div class="answerText">'+esc(q.answer)+'</div>'+(q.adultCue?'<div class="parentNote">'+esc(q.adultCue)+'</div>':"")+'</div>':q.draw?'<div class="draw" aria-label="Large space for drawing"></div>':'<div class="writing" style="--lines:'+Math.max(1,Math.min(5,q.lines))*9+'mm"></div>')+'</li>').join("");
  return '<section class="worksheetSection '+((mode==="student"&&s.pageBreak)?"printBreak":"")+'"><div class="tier">'+esc(catalog.labels[s.tier])+'</div><h2>'+esc(s.title)+'</h2>'+(s.note?'<p class="sectionNote">'+esc(s.note)+'</p>':"")+'<ol class="questions '+(mode==="answers"?"answers":"")+'">'+qs+'</ol></section>';
 }).join("");
 const links='<section class="worksheetSection"><div class="tier">OPTIONAL CONNECTIONS</div><h2>Link this lesson to other learning</h2><div class="connectionList"><p><strong>Earlier learning:</strong> '+esc(p.connections.backward)+'</p><p><strong>Next building block:</strong> '+esc(p.connections.forward)+'</p><p><strong>Skills together:</strong> '+esc(p.connections.crossTopic)+'</p></div></section>';
 const rubric=mode==="answers"?'<section class="reflection"><h2>Record learning separately</h2><div class="markGrid"><div class="markCell">School / recall<br>Correct: ___ / ___</div><div class="markCell">Explains why<br>Secure: ___ / ___</div><div class="markCell">Unseen transfer<br>Independent: ___ / ___</div></div><p class="small">Mark an answer as secure only if the learner explains it without prompting. If an answer needed help, jot down the misconception and retry on a different day. Writing tasks require judgement of meaning, not only spelling.</p><p>What needed a prompt? ____________________________________________________________</p><p>Next retrieval date: __________________</p></section>':'<section class="reflection"><strong>My final check</strong><p>One rule I can explain without looking: __________________________________________________</p><p>I want to practise again: ______________________________________________________________</p></section>';
 root.innerHTML=header+purpose+'<section><h2>Study and reference</h2><div class="studyList">'+studyHtml+'</div></section>'+concepts+sections+links+rubric+'<footer><span>InClass · School first · Understand · Apply</span><span>Lesson '+esc(p.id)+'</span></footer>';
}
pick.addEventListener("change",()=>{location.href=url(pick.value,modePick.value);});
modePick.addEventListener("change",()=>{location.href=url(pick.value,modePick.value);});
document.getElementById("printButton").addEventListener("click",()=>window.print());
render();
})();
