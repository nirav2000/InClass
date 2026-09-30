(function(){
  function session(){return window.InClassAuth?window.InClassAuth.getSession():{userId:"local-user"};}
  function provider(){return window.InClassFirebaseProvider||null;}
  function scoped(key){const s=session();return "inclass:v2:"+(s.dataOwnerId||s.userId)+":"+key;}

  function getJson(key,fallback){
    try{
      const modern=localStorage.getItem(scoped(key));
      if(modern!==null)return JSON.parse(modern);
      const legacy=localStorage.getItem(key);
      if(legacy!==null){
        const value=JSON.parse(legacy);
        localStorage.setItem(scoped(key),JSON.stringify(value));
        return value;
      }
    }catch(e){}
    return fallback;
  }

  function setJson(key,value){
    localStorage.setItem(scoped(key),JSON.stringify(value));
    const p=provider();
    if(p&&typeof p.setJson==="function"){
      Promise.resolve(p.setJson({userId:session().userId,key,value})).catch(()=>{});
    }
    return value;
  }

  function remove(key){
    localStorage.removeItem(scoped(key));
    localStorage.removeItem(key);
    const p=provider();
    if(p&&typeof p.remove==="function")Promise.resolve(p.remove({userId:session().userId,key})).catch(()=>{});
  }

  function attemptKey(learnerId){return "analytics:"+learnerId;}
  function recordAttempt(evt){
    const learnerId=evt.learnerId||"unknown";
    const event=Object.assign({ts:Date.now()},evt);
    const key=attemptKey(learnerId);
    const rows=getJson(key,[]);
    rows.push(event);
    localStorage.setItem(scoped(key),JSON.stringify(rows.slice(-1000)));
    const p=provider();
    if(p&&typeof p.recordAttempt==="function")Promise.resolve(p.recordAttempt(Object.assign({userId:session().userId},event))).catch(()=>{});
  }
  function getAttempts(learnerId){return getJson(attemptKey(learnerId),[]);}

  function learnerSummary(learnerId){
    const attempts=getAttempts(learnerId);
    const total=attempts.length;
    const correct=attempts.filter(x=>x.correct===true).length;
    const byItem={};
    attempts.forEach(x=>{
      const k=x.item||x.skill||"Unknown";
      byItem[k]=byItem[k]||{item:k,total:0,wrong:0};
      byItem[k].total++;
      if(x.correct===false)byItem[k].wrong++;
    });
    const issues=Object.values(byItem).filter(x=>x.wrong>0).sort((a,b)=>b.wrong-a.wrong).slice(0,6);
    return {learnerId,total,correct,accuracy:total?Math.round(correct/total*100):null,issues};
  }

  function classSummary(learnerIds){
    const learners=(learnerIds||[]).map(learnerSummary);
    const common={};
    learners.forEach(l=>l.issues.forEach(x=>{common[x.item]=(common[x.item]||0)+x.wrong;}));
    const commonIssues=Object.entries(common).map(([item,wrong])=>({item,wrong})).sort((a,b)=>b.wrong-a.wrong).slice(0,8);
    return {learners,commonIssues};
  }

  async function hydrateUser(){
    const p=provider();
    if(!p||typeof p.hydrateUser!=="function")return false;
    const snapshot=await p.hydrateUser(session());
    if(!snapshot||typeof snapshot!=="object")return false;
    Object.entries(snapshot).forEach(([key,value])=>localStorage.setItem(scoped(key),JSON.stringify(value)));
    window.dispatchEvent(new CustomEvent("inclass:datahydrated"));
    return true;
  }

  window.addEventListener("inclass:authchange",()=>{hydrateUser().catch(()=>{});});

  window.InClassData={
    getJson,setJson,remove,recordAttempt,getAttempts,learnerSummary,classSummary,
    scopedKey:scoped,hydrateUser,isCloudConnected:()=>!!provider()
  };
})();