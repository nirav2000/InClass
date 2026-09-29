(function(){
  const $=s=>document.querySelector(s);
  const $$=s=>Array.from(document.querySelectorAll(s));

  function session(){
    return window.InClassAuth?.getSession()||{displayName:"Parent",role:"parent",children:[{id:"sai",name:"Sai",yearGroup:"Year 5"}],provider:"local"};
  }
  function children(){
    const s=session();
    return s.children&&s.children.length?s.children:[{id:"sai",name:s.role==="learner"?s.displayName:"Sai",yearGroup:"Year 5"}];
  }
  function progressFor(pack,learnerName){
    const key="inclass:"+pack.id+":"+learnerName;
    return window.InClassData?window.InClassData.getJson(key,{}):{};
  }
  function progressPercent(pack,p){
    if(pack.subjectKey==="english"){
      const m=[Math.min((p.ruleCorrect||0)/4,1),Math.min((p.spellCorrect||0)/8,1),Math.min((p.meaningCorrect||0)/6,1),Math.min((p.sentencesGood||0)/4,1),Math.min((p.testsCompleted||0),1)];
      return Math.round(m.reduce((a,b)=>a+b,0)/m.length*100);
    }
    const heard=p.requiredHeard||p.heard||0;
    const marks=window.InClassData?window.InClassData.getJson("inclass:dictation:"+pack.id+":"+(window.__progressLearner||"Sai"),{}):{};
    const core=Object.keys(marks).filter(k=>k.indexOf("core:")===0);
    const correct=core.filter(k=>marks[k]==="correct").length;
    const m=[Math.min(heard/8,1),Math.min((p.spellCorrect||0)/8,1),Math.min(correct/8,1),Math.min((p.sentencesBuilt||0)/4,1)];
    return Math.round(m.reduce((a,b)=>a+b,0)/m.length*100);
  }
  function completionFor(pack,learnerName){
    window.__progressLearner=learnerName;
    const result=progressPercent(pack,progressFor(pack,learnerName));
    delete window.__progressLearner;
    return result;
  }
  function averageCompletion(learnerName){
    if(!WEEKS.length)return 0;
    return Math.round(WEEKS.reduce((sum,p)=>sum+completionFor(p,learnerName),0)/WEEKS.length);
  }
  function homeworkCards(learnerName){
    return WEEKS.map(pack=>{
      const p=progressFor(pack,learnerName),pct=completionFor(pack,learnerName);
      return '<button class="welcomeHomeworkCard" data-pack="'+pack.id+'" data-learner="'+learnerName+'">'+
        '<span class="subjectOrb '+pack.subjectKey+'">'+(pack.subjectKey==="french"?"FR":"EN")+'</span>'+
        '<span class="welcomeHomeworkText"><small>'+pack.subject+' · '+pack.date+'</small><strong>'+pack.title+'</strong><span>'+pct+'% complete</span></span>'+
        '<span class="homeworkArrow">→</span>'+
      '</button>';
    }).join("");
  }
  function issuesFor(name){
    return window.InClassData?.learnerSummary(name)||{total:0,accuracy:null,issues:[]};
  }

  function parentBoard(){
    const kids=children();
    return '<div class="dashboardHeader"><div><p class="eyebrow">PARENT VIEW</p><h2>Your children</h2><p>Required homework stays first. Understanding and extension sit behind it, not in front of it.</p></div><span class="dashboardMode">Local preview</span></div>'+
      kids.map(child=>{
        const s=issuesFor(child.name),completion=averageCompletion(child.name);
        return '<section class="parentChildSection">'+
          '<div class="childCard"><div class="childAvatar">'+child.name.charAt(0).toUpperCase()+'</div><div class="childIdentity"><strong>'+child.name+'</strong><span>'+child.yearGroup+'</span></div>'+
          '<div class="childMetric"><b>'+completion+'%</b><small>homework progress</small></div><div class="childMetric"><b>'+(s.requiredAccuracy===null?"—":s.requiredAccuracy+"%")+'</b><small>required accuracy</small></div><div class="childMetric"><b>'+s.extensionTotal+'</b><small>extension attempts</small></div></div>'+
          '<div class="welcomeHomeworkGrid">'+homeworkCards(child.name)+'</div>'+
          '<div class="issuesCard"><strong>Things to revisit</strong><div>'+(s.issues.length?s.issues.map(x=>'<span>'+x.item+' · '+x.wrong+' miss'+(x.wrong===1?"":"es")+'</span>').join(""):'<span>No item-level issues recorded yet. Missed answers will appear here automatically.</span>')+'</div></div>'+
        '</section>';
      }).join("");
  }

  function teacherBoard(){
    const kids=children();
    const names=kids.map(x=>x.name);
    const summary=window.InClassData?.classSummary(names)||{learners:[],commonIssues:[]};
    const rows=kids.map(child=>{
      const l=summary.learners.find(x=>x.learnerId===child.name)||{total:0,accuracy:null,issues:[]};
      return '<div class="teacherRow"><span><strong>'+child.name+'</strong><small>'+child.yearGroup+'</small></span><span>'+averageCompletion(child.name)+'%</span><span>'+l.requiredTotal+'</span><span>'+(l.requiredAccuracy===null?"—":l.requiredAccuracy+"%")+'</span><span>'+(l.issues[0]?.item||"—")+'</span></div>';
    }).join("");
    return '<div class="dashboardHeader"><div><p class="eyebrow">TEACHER VIEW · LOCAL PREVIEW</p><h2>Class overview</h2><p>Designed to show every linked learner at a glance, then surface patterns shared across the class.</p></div><span class="dashboardMode">Roster connects with Firebase</span></div>'+
      '<div class="teacherStats"><div><strong>'+kids.length+'</strong><span>linked learner'+(kids.length===1?"":"s")+'</span></div><div><strong>'+summary.commonIssues.length+'</strong><span>common issues</span></div><div><strong>'+Math.round(kids.reduce((a,k)=>a+averageCompletion(k.name),0)/Math.max(kids.length,1))+'%</strong><span>average completion</span></div></div>'+
      '<div class="teacherTable"><div class="teacherRow teacherHead"><span>Learner</span><span>Completion</span><span>Attempts</span><span>Accuracy</span><span>Needs attention</span></div>'+rows+'</div>'+
      '<div class="issuesCard"><strong>Common issues across the class</strong><div>'+(summary.commonIssues.length?summary.commonIssues.map(x=>'<span>'+x.item+' · '+x.wrong+' misses</span>').join(""):'<span>Common issues will appear as learners answer questions.</span>')+'</div></div>';
  }

  function learnerBoard(){
    const s=session(),name=s.role==="learner"?s.displayName:(children()[0]?.name||"Sai");
    return '<div class="dashboardHeader"><div><p class="eyebrow">LEARNER VIEW</p><h2>What are we doing today?</h2><p>Finish what school asked for first. Open the explanation or extension only when you need it.</p></div></div><div class="welcomeHomeworkGrid">'+homeworkCards(name)+'</div>';
  }

  function renderRole(role){
    $$(".roleTab").forEach(b=>b.classList.toggle("active",b.dataset.role===role));
    $("#welcomeDashboard").innerHTML=role==="parent"?parentBoard():role==="teacher"?teacherBoard():learnerBoard();
    bindHomework();
  }
  function bindHomework(){
    $$(".welcomeHomeworkCard").forEach(card=>card.onclick=()=>launchPack(card.dataset.pack,card.dataset.learner));
  }
  function selectLearner(name){
    if(!name)return;
    const option=Array.from($("#learnerSelect").options).find(o=>o.value===name);
    if(option){
      $("#learnerSelect").value=name;
      state.learner=name;
      localStorage.setItem("inclass:learner",name);
    }
  }
  function launchPack(id,learnerName){
    const pack=WEEKS.find(w=>w.id===id);
    selectLearner(learnerName);
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
    const s=session();
    $("#welcomeName").textContent=s.role==="learner"?s.displayName:s.displayName;
    renderRole(s.role||"parent");
    window.scrollTo({top:0,behavior:"smooth"});
  }

  document.addEventListener("DOMContentLoaded",()=>{
    const s=session();
    $("#welcomeName").textContent=s.role==="learner"?s.displayName:s.displayName;
    $("#authStatus").textContent=s.provider==="local"?"Local mode · Firebase not connected":"Signed in";
    $$(".roleTab").forEach(b=>b.onclick=()=>{
      const next=window.InClassAuth?.setPreviewRole(b.dataset.role)||Object.assign({},s,{role:b.dataset.role});
      $("#welcomeName").textContent=next.role==="learner"?next.displayName:next.displayName;
      renderRole(b.dataset.role);
    });
    $("#signInButton").onclick=async()=>{
      try{await window.InClassAuth.signIn();}
      catch(e){$("#authMessage").textContent=e.message;$("#authMessage").classList.remove("hidden");}
    };
    $("#enterAppButton").onclick=()=>{
      const last=localStorage.getItem("inclass:lastWeek")||WEEKS[0]?.id;
      const name=s.role==="learner"?s.displayName:(children()[0]?.name||"Sai");
      launchPack(last,name);
    };
    $("#homeButton").onclick=showHome;
    renderRole(s.role);
  });
})();