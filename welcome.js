(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));

  function learnerId(){return (window.InClassAuth?.getSession().role==="learner")?"sai":"sai";}
  function progressFor(pack,learner){
    const key="inclass:"+pack.id+":"+learner;
    return window.InClassData?window.InClassData.getJson(key,{}):{};
  }
  function progressPercent(pack,p){
    if(pack.subjectKey==="english"){
      const m=[Math.min((p.ruleCorrect||0)/4,1),Math.min((p.spellCorrect||0)/8,1),Math.min((p.meaningCorrect||0)/6,1),Math.min((p.sentencesGood||0)/4,1),Math.min((p.testsCompleted||0),1)];
      return Math.round(m.reduce((a,b)=>a+b,0)/m.length*100);
    }
    const m=[Math.min((p.heard||0)/8,1),Math.min((p.spellCorrect||0)/8,1),Math.min((p.sentencesBuilt||0)/4,1),Math.min((p.spoken||0)/3,1),Math.min((p.chatted||0)/2,1)];
    return Math.round(m.reduce((a,b)=>a+b,0)/m.length*100);
  }
  function homeworkCards(){
    return WEEKS.map(pack=>{
      const p=progressFor(pack,"Sai"),pct=progressPercent(pack,p);
      return '<button class="welcomeHomeworkCard" data-pack="'+pack.id+'">'+
        '<span class="subjectOrb '+pack.subjectKey+'">'+(pack.subjectKey==="french"?"FR":"EN")+'</span>'+
        '<span class="welcomeHomeworkText"><small>'+pack.subject+' · '+pack.date+'</small><strong>'+pack.title+'</strong><span>'+pct+'% complete</span></span>'+
        '<span class="homeworkArrow">→</span>'+
      '</button>';
    }).join("");
  }
  function parentBoard(){
    const s=window.InClassData?.learnerSummary("Sai")||{total:0,accuracy:null,issues:[]};
    const packs=WEEKS.map(p=>({p,progress:progressFor(p,"Sai")})); 
    return '<div class="dashboardHeader"><div><p class="eyebrow">PARENT VIEW</p><h2>Your children</h2><p>One place to see required homework first, then understanding and extension.</p></div></div>'+
      '<div class="childCard"><div class="childAvatar">S</div><div><strong>Sai</strong><span>Year 5</span></div><div class="childMetric"><b>'+(s.accuracy===null?"—":s.accuracy+"%")+'</b><small>practice accuracy</small></div></div>'+
      '<div class="dashboardGrid">'+packs.map(x=>'<div class="dashCard"><span>'+x.p.subject+'</span><strong>'+progressPercent(x.p,x.progress)+'%</strong><small>'+x.p.title+'</small></div>').join("")+'</div>'+
      '<div class="issuesCard"><strong>Things to revisit</strong><div>'+(s.issues.length?s.issues.map(x=>'<span>'+x.item+' · '+x.wrong+' miss'+(x.wrong===1?"":"es")+'</span>').join(""):'<span>No item-level issues recorded yet. New practice attempts will populate this automatically.</span>')+'</div></div>';
  }
  function teacherBoard(){
    const summary=window.InClassData?.classSummary(["Sai"])||{learners:[],commonIssues:[]};
    return '<div class="dashboardHeader"><div><p class="eyebrow">TEACHER VIEW · LOCAL PREVIEW</p><h2>Class overview</h2><p>When Firebase is connected, this view will load every learner linked to the teacher’s classes.</p></div></div>'+
      '<div class="teacherStats"><div><strong>'+summary.learners.length+'</strong><span>linked learner</span></div><div><strong>'+summary.commonIssues.length+'</strong><span>issues surfaced</span></div><div><strong>—</strong><span>class completion until roster connected</span></div></div>'+
      '<div class="teacherTable"><div class="teacherRow teacherHead"><span>Learner</span><span>Attempts</span><span>Accuracy</span><span>Needs attention</span></div>'+
      summary.learners.map(l=>'<div class="teacherRow"><span><strong>'+l.learnerId+'</strong></span><span>'+l.total+'</span><span>'+(l.accuracy===null?"—":l.accuracy+"%")+'</span><span>'+(l.issues[0]?.item||"—")+'</span></div>').join("")+'</div>'+
      '<div class="issuesCard"><strong>Common issues</strong><div>'+(summary.commonIssues.length?summary.commonIssues.map(x=>'<span>'+x.item+' · '+x.wrong+' misses</span>').join(""):'<span>Common issues will appear as learners complete work.</span>')+'</div></div>';
  }
  function learnerBoard(){
    return '<div class="dashboardHeader"><div><p class="eyebrow">LEARNER VIEW</p><h2>What are we doing today?</h2><p>Finish what school asked for first. Open the extra thinking only when you are ready.</p></div></div><div class="welcomeHomeworkGrid">'+homeworkCards()+'</div>';
  }
  function renderRole(role){
    $$(".roleTab").forEach(b=>b.classList.toggle("active",b.dataset.role===role));
    const host=$("#welcomeDashboard");
    host.innerHTML=role==="parent"?parentBoard():role==="teacher"?teacherBoard():learnerBoard();
    bindHomework();
  }
  function bindHomework(){
    $$(".welcomeHomeworkCard").forEach(card=>card.onclick=()=>launchPack(card.dataset.pack));
  }
  function launchPack(id){
    const pack=WEEKS.find(w=>w.id===id);
    if(pack){
      $("#subjectSelect").value=pack.subject;
      populateWeeks(pack.id);
      $("#weekSelect").value=pack.id;
      state.week=pack;
      localStorage.setItem("inclass:lastWeek",pack.id);
      renderWeek();
    }
    $("#welcomeScreen").classList.add("hidden");
    $("#appShell").classList.remove("hidden");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  function showHome(){
    $("#appShell").classList.add("hidden");
    $("#welcomeScreen").classList.remove("hidden");
    renderRole(window.InClassAuth?.getSession().role||"parent");
    window.scrollTo({top:0,behavior:"smooth"});
  }
  document.addEventListener("DOMContentLoaded",()=>{
    const s=window.InClassAuth?.getSession()||{role:"parent",displayName:"Parent",provider:"local"};
    $("#welcomeName").textContent=s.role==="learner"?"Sai":s.displayName;
    $("#authStatus").textContent=s.provider==="local"?"Local mode":"Signed in";
    $$(".roleTab").forEach(b=>b.onclick=()=>{window.InClassAuth?.setPreviewRole(b.dataset.role);renderRole(b.dataset.role);});
    $("#signInButton").onclick=async()=>{
      try{await window.InClassAuth.signIn();}
      catch(e){$("#authMessage").textContent=e.message;$("#authMessage").classList.remove("hidden");}
    };
    $("#enterAppButton").onclick=()=>{const last=localStorage.getItem("inclass:lastWeek")||WEEKS[0]?.id;launchPack(last);};
    $("#homeButton").onclick=showHome;
    renderRole(s.role);
  });
})();