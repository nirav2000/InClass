(() => {
  const base=(window.INCLASS_WEEKS||[]).find(w=>w.id==="2026-10-05-french-opinions");
  if(!base) return;
  const v2=JSON.parse(JSON.stringify(base));
  v2.id="2026-10-05-french-opinions-v2";
  v2.date="Week 2 · Version 2 · 5 Oct";
  v2.title="Opinions about animals · Language acquisition";
  v2.lead="Hear it, understand it, copy the sound, discover the pattern, manipulate it, generate unseen French, then read and write it.";
  v2.opinionsV2=true;
  v2.versionLabel="First-principles version";
  v2.sourceNote="Version 2 keeps the same Week 2 French content and school source material, but changes the teaching sequence: sound and meaning first; pattern discovery; varied oral retrieval; sentence transformation; unseen generation; reading; then writing.";
  window.INCLASS_WEEKS.push(v2);
})();