/* U1-01 Slice 15 handoff: Transfer -> genuinely later retrieval. */
(function(){
  "use strict";
  var phaseLabel=document.getElementById("phaseLabel"),nextBtn=document.getElementById("nextBtn");
  if(!phaseLabel||!nextBtn)return;
  var prepared=false,armed=false;

  function runtimeReady(){
    return !!(globalThis.BondLineRetrievalUI&&typeof globalThis.BondLineRetrievalUI.prepare==="function"&&globalThis.BondLineTransferUI&&typeof globalThis.BondLineTransferUI.getSession==="function");
  }
  function prepareIfNeeded(createdAt){
    if(prepared)return true;
    if(!/^Transfer\s*·\s*complete/i.test(phaseLabel.textContent||""))return false;
    if(!runtimeReady()){nextBtn.textContent="Later Retrieval loading";nextBtn.disabled=true;return false;}
    var transferSession=globalThis.BondLineTransferUI.getSession();
    if(!transferSession||!transferSession.skill){nextBtn.disabled=true;return false;}
    globalThis.BondLineRetrievalUI.prepare(transferSession,createdAt||Date.now());
    prepared=true;
    return true;
  }
  function launch(event){
    if(!armed||!prepared)return;
    event.preventDefault();event.stopImmediatePropagation();armed=false;nextBtn.removeEventListener("click",launch,true);
    var result=globalThis.BondLineRetrievalUI.startReady(Date.now());
    if(!result.started)sync(Date.now());
  }
  function sync(now){
    prepareIfNeeded(now);
    if(!prepared)return;
    var readiness=globalThis.BondLineRetrievalUI.readiness(now||Date.now());
    if(!readiness.ready){
      nextBtn.textContent=readiness.reason==="intervening_activity_required"?"Later Retrieval after another activity":"Later Retrieval not due yet";
      nextBtn.disabled=true;
      return;
    }
    nextBtn.textContent="Start Later Retrieval";nextBtn.disabled=false;
    if(!armed){armed=true;nextBtn.addEventListener("click",launch,true);}
  }
  function registerInterveningActivity(activityId,timestamp){
    if(!prepared)return{accepted:false,reason:"retrieval_not_prepared"};
    var result=globalThis.BondLineRetrievalUI.registerInterveningActivity(activityId,timestamp);
    sync(timestamp||Date.now());
    return result;
  }

  var observer=new MutationObserver(function(){if(/^Transfer\s*·\s*complete/i.test(phaseLabel.textContent||""))sync(Date.now());});
  observer.observe(phaseLabel,{childList:true,subtree:true,characterData:true});
  sync(Date.now());
  globalThis.BondLineRetrievalHandoff=Object.freeze({sync:sync,registerInterveningActivity:registerInterveningActivity});
})();
