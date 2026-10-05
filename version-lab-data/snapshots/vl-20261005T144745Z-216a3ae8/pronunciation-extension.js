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

  if(state.week&&state.week.opinionsHomework){
    setNav([
      ['frDecode','Decode'],
      ['frLearn','School words'],
      ['frBuild','Build'],
      ['frSpeak','Speak'],
      ['frWrite','Write'],
      ['frExplore','Understand']
    ]);
  }else{
    setNav([
      ['frLearn','School words'],
      ['frSpell','Spell'],
      ['frDictation','Write'],
      ['frBuild','Sentence'],
      ['frSpeak','Speak'],
      ['frExplore','Explore']
    ]);
  }

  const explore=document.getElementById('frExplore');
  if(!explore)return;
  const oldEyebrow=explore.querySelector('.sectionHead .eyebrow');
  if(oldEyebrow)oldEyebrow.textContent='STEP '+(state.week&&state.week.opinionsHomework?'6':'6');
  if(state.week&&state.week.opinionsHomework){
    const write=document.getElementById('frWrite');
    if(write){
      const writeEyebrow=write.querySelector('.sectionHead .eyebrow');
      if(writeEyebrow)writeEyebrow.textContent='STEP 5';
    }
  }

  const section=document.createElement('section');
  section.id='frSpeak';
  section.className='panel';
  section.innerHTML=
    '<div class="sectionHead"><div><p class="eyebrow">STEP '+(state.week&&state.week.opinionsHomework?'4':'5')+'</p><h3>Match the pronunciation</h3></div><span class="homeworkBadge">test feature</span></div>'+
    '<p class="tip">Use the sentence you just built. InClass prepares an AI-generated standard pronunciation automatically. A parent or teacher can replace it with their own model if needed, then the child records an attempt.</p>'+
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

  const referenceProvider=async function(payload){
    const config=window.INCLASS_CONFIG&&window.INCLASS_CONFIG.pronunciation||{};
    if(config.generatedReference===false||!config.referenceEndpoint)throw new Error('Generated reference disabled');
    const response=await fetch(config.referenceEndpoint,{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({targetText:payload.targetText,lang:payload.lang})
    });
    if(!response.ok){
      let message='Reference generation failed';
      try{const body=await response.json();if(body&&body.error)message=body.error;}catch(e){}
      throw new Error(message);
    }
    const model=response.headers.get('X-Pronunciation-Model')||'AI speech model';
    const label=model.indexOf('melotts')>=0?'AI-generated French model · Cloudflare MeloTTS':'AI-generated standard French model';
    return {blob:await response.blob(),label:label};
  };

  pronunciationCoach=window.AppsPronunciation.mount(host,{
    lang:'fr-FR',
    targetText:currentTarget(),
    title:'Match this French sentence',
    referenceProvider:referenceProvider
  });

  renderHistory();

  const syncTarget=function(){
    if(pronunciationCoach)pronunciationCoach.setTarget(currentTarget(),'fr-FR');
  };

  ['animalSelect','colourSelect','qualitySelect','opinionPerson'].forEach(function(id){
    const el=document.getElementById(id);
    if(el)el.addEventListener('change',function(){setTimeout(syncTarget,0);});
  });
  const shuffle=document.getElementById('shuffleFrench');
  if(shuffle)shuffle.addEventListener('click',function(){setTimeout(syncTarget,0);});
  document.addEventListener('inclass:pronunciation-target',function(e){
    if(pronunciationCoach&&e.detail&&e.detail.text)pronunciationCoach.setTarget(e.detail.text,e.detail.lang||'fr-FR');
  });

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