/* French pilot: shared-origin, local-first learning handoff. No existing keys are altered. */
(function(root){
  'use strict';
  const KEY='apps:learning-handoff:v1';
  const CONCEPTS=Object.freeze({
    'french.verb.conjugation':{title:'French verb conjugation',nextLessonId:'french-quitter-20260926'},
    'french.noun.gender':{title:'French noun gender',nextLessonId:null}
  });
  const read=()=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
  const save=rows=>{localStorage.setItem(KEY,JSON.stringify(rows));root.dispatchEvent(new CustomEvent('learning-handoff:changed',{detail:{count:rows.length}}))};
  const clean=s=>String(s||'').slice(0,200);
  function detect(attempts,{learnerId,packId,conceptId}={}){
    if(!learnerId||!packId||!CONCEPTS[conceptId])return null;
    const matched=(attempts||[]).filter(a=>a&&a.correct===false&&a.conceptId===conceptId&&a.scope!=='extension');
    const distinct=new Set(matched.map(a=>clean(a.item||a.skill||a.questionId)).filter(Boolean));
    if(matched.length<3||distinct.size<2)return null;
    const id=[learnerId,packId,conceptId].map(encodeURIComponent).join('|');
    const rows=read(),existing=rows.find(x=>x.id===id);
    if(existing)return existing;
    const item={schema:1,id,learnerId:clean(learnerId),sourceApp:'inclass',sourcePackId:clean(packId),conceptId,title:CONCEPTS[conceptId].title,evidence:{wrong:matched.length,distinctItems:distinct.size},status:'suggested',createdAt:new Date().toISOString(),nextLessonId:CONCEPTS[conceptId].nextLessonId,approvedAt:null};
    rows.push(item);save(rows);return item;
  }
  function approve(id){const rows=read(),item=rows.find(x=>x.id===id);if(!item||item.status!=='suggested')return null;item.status='approved';item.approvedAt=new Date().toISOString();save(rows);return item}
  function reject(id){const rows=read(),item=rows.find(x=>x.id===id);if(!item||item.status!=='suggested')return null;item.status='dismissed';save(rows);return item}
  function list(learnerId){return read().filter(x=>!learnerId||x.learnerId===learnerId)}
  root.LearningHandoffPilot=Object.freeze({version:1,concepts:CONCEPTS,detect,approve,reject,list});
})(window);
