/* U1-01 Slice 13 handoff: cold Independent bank -> Explain Why. */
(function(){
  "use strict";
  var phaseLabel=document.getElementById("phaseLabel"),nextBtn=document.getElementById("nextBtn");
  if(!phaseLabel||!nextBtn)return;
  var armed=false;

  function ready(){
    return !!(globalThis.BondLineExplainWhyUI&&typeof globalThis.BondLineExplainWhyUI.start==="function"&&globalThis.BondLineIndependentUI&&typeof globalThis.BondLineIndependentUI.getSession==="function");
  }
  function launch(event){
    if(!armed||!ready())return;
    event.preventDefault();event.stopImmediatePropagation();armed=false;nextBtn.removeEventListener("click",launch,true);
    var independentSession=globalThis.BondLineIndependentUI.getSession();
    if(!independentSession||!independentSession.skill){nextBtn.disabled=true;return;}
    globalThis.BondLineExplainWhyUI.start(independentSession);
  }
  function sync(){
    if(!/^Independent bank\s*·\s*attempted/i.test(phaseLabel.textContent||""))return;
    if(!ready()){nextBtn.textContent="Explain Why loading";nextBtn.disabled=true;return;}
    nextBtn.textContent="Start Explain Why";nextBtn.disabled=false;
    if(!armed){armed=true;nextBtn.addEventListener("click",launch,true);}
  }
  var observer=new MutationObserver(sync);observer.observe(phaseLabel,{childList:true,subtree:true,characterData:true});sync();
  globalThis.BondLineExplainWhyHandoff=Object.freeze({sync:sync});
})();

/* Slice 14 browser continuation: Transfer loads after Explain Why runtime is ready. */
(function(){
  if(typeof document==="undefined"||typeof window==="undefined")return;
  var sources=["bond-line-transfer.js","bond-line-transfer-ui.js","bond-line-transfer-handoff.js"];
  function load(index){
    if(index>=sources.length)return;
    var script=document.createElement("script");script.src=sources[index];script.async=false;
    script.onload=function(){load(index+1);};
    script.onerror=function(){console.error("Unable to load Bond-Line Slice 14 runtime:",sources[index]);};
    document.head.appendChild(script);
  }
  load(0);
})();
