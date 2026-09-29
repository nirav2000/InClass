(function(){
'use strict';

const previousFrench=window.renderFrench;
let pronunciationCoach=null;

function currentTarget(){
  const el=document.getElementById('builtFrench');
  return (el&&el.textContent||'J’ai un chien noir et intelligent.').trim();
}

function addPronunciationLab(){
  if(!state.week||state.week.subjectKey!=='french')return;

  setNav([
    ['frLearn','School words'],
    ['frSpell','Spell'],
    ['frDictation','Write'],
    ['frBuild','Sentence'],
    ['frSpeak','Speak'],
    ['frExplore','Explore']
  ]);

  const explore=document.getElementById('frExplore');
  if(!explore)return;
  const oldEyebrow=explore.querySelector('.sectionHead .eyebrow');
  if(oldEyebrow)oldEyebrow.textContent='STEP 6';

  const section=document.createElement('section');
  section.id='frSpeak';
  section.className='panel';
  section.innerHTML=
    '<div class="sectionHead"><div><p class="eyebrow">STEP 5</p><h3>Match the pronunciation</h3></div><span class="homeworkBadge">test feature</span></div>'+
    '<p class="tip">Use the sentence you just built. First listen to it. For rhythm and intonation comparison, a parent or teacher can record a model once, then the child records an attempt.</p>'+
    '<div id="pronunciationLab"></div>'+
    '<div id="pronunciationHistory" class="miniRule"><strong>Practice history</strong><span>No attempts yet.</span></div>';
  explore.parentNode.insertBefore(section,explore);

  const host=document.getElementById('pronunciationLab');
  if(!window.AppsPronunciation){
    host.innerHTML='<div class="practiceCard"><p class="feedback try">The shared pronunciation module could not be loaded. The rest of the French lesson still works normally.</p></div>';
    return;
  }

  const renderHistory=function(){
    const p=getProgress(),el=document.querySelector('#pronunciationHistory span');
    if(!el)return;
    if(!p.pronunciationAttempts){el.textContent='No attempts yet.';return;}
    el.textContent=p.pronunciationAttempts+' attempt'+(p.pronunciationAttempts===1?'':'s')+
      (Number.isFinite(p.bestPronunciationScore)?' · best prototype score '+p.bestPronunciationScore+'%':'');
  };

  pronunciationCoach=window.AppsPronunciation.mount(host,{
    lang:'fr-FR',
    targetText:currentTarget(),
    title:'Match this French sentence'
  });

  renderHistory();

  const syncTarget=function(){
    if(pronunciationCoach)pronunciationCoach.setTarget(currentTarget(),'fr-FR');
  };

  ['animalSelect','colourSelect','qualitySelect'].forEach(function(id){
    const el=document.getElementById(id);
    if(el)el.addEventListener('change',function(){setTimeout(syncTarget,0);});
  });
  const shuffle=document.getElementById('shuffleFrench');
  if(shuffle)shuffle.addEventListener('click',function(){setTimeout(syncTarget,0);});

  host.addEventListener('apps-pronunciation:result',function(e){
    const result=e.detail||{},p=getProgress();
    p.pronunciationAttempts=(p.pronunciationAttempts||0)+1;
    if(Number.isFinite(result.overall)){
      p.lastPronunciationScore=Math.round(result.overall);
      p.bestPronunciationScore=Math.max(p.bestPronunciationScore||0,Math.round(result.overall));
    }
    saveProgress(p);
    renderHistory();
    recordLearningAttempt('pronunciation',currentTarget(),null,{
      scope:'required',
      prototype:true,
      score:result.overall,
      words:result.words,
      rhythm:result.rhythm,
      intonation:result.pitch,
      transcript:result.transcript||''
    });
  });
}

window.renderFrench=function(){
  if(pronunciationCoach&&typeof pronunciationCoach.destroy==='function'){
    Promise.resolve(pronunciationCoach.destroy()).catch(function(){});
    pronunciationCoach=null;
  }
  previousFrench();
  addPronunciationLab();
};
})();