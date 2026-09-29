(function(){
  const cfg=window.INCLASS_CONFIG||{};
  const demo=(cfg.demoProfile||{userId:"local-user",displayName:"Local user",role:"parent",children:[]});
  let session=JSON.parse(localStorage.getItem("inclass:session")||"null")||{
    userId:demo.userId,displayName:demo.displayName,role:demo.role,children:demo.children||[],classes:demo.classes||[],provider:"local"
  };

  function persist(){ localStorage.setItem("inclass:session",JSON.stringify(session)); }
  function getSession(){ return Object.assign({},session); }
  function setPreviewRole(role){
    session.role=role;
    if(role==="learner"){session.userId="sai";session.displayName="Sai";}
    else {session.userId=demo.userId;session.displayName=demo.displayName;}
    session.provider="local";
    persist();
    window.dispatchEvent(new CustomEvent("inclass:authchange",{detail:getSession()}));
    return getSession();
  }
  async function signIn(){
    if(window.InClassFirebaseProvider&&typeof window.InClassFirebaseProvider.signIn==="function"){
      const result=await window.InClassFirebaseProvider.signIn();
      session=result;persist();return getSession();
    }
    throw new Error("Firebase authentication is not connected yet. InClass is currently running in local mode.");
  }
  async function signOut(){
    if(window.InClassFirebaseProvider&&typeof window.InClassFirebaseProvider.signOut==="function"){
      await window.InClassFirebaseProvider.signOut();
    }
    session={userId:demo.userId,displayName:demo.displayName,role:demo.role,children:demo.children||[],classes:demo.classes||[],provider:"local"};
    persist();
    window.dispatchEvent(new CustomEvent("inclass:authchange",{detail:getSession()}));
  }
  window.InClassAuth={getSession,setPreviewRole,signIn,signOut,isFirebaseConnected:()=>!!window.InClassFirebaseProvider};
})();