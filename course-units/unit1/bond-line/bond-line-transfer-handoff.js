/* U1-01 Slice 14 handoff: Explain Why -> Transfer. */
(function(){
  "use strict";
  var phaseLabel=document.getElementById("phaseLabel"),nextBtn=document.getElementById("nextBtn");
  if(!phaseLabel||!nextBtn)return;
  var armed=false;

  function ready(){
    return !!(globalThis.BondLineTransferUI&&typeof globalThis.BondLineTransferUI.start==="function"&&globalThis.BondLineExplainWhyUI&&typeof globalThis.BondLineExplainWhyUI.getSession==="function");
  }
  function launch(event){
    if(!armed||!ready())return;
    event.preventDefault();event.stopImmediatePropagation();armed=false;nextBtn.removeEventListener("click",launch,true);
    var explainSession=globalThis.BondLineExplainWhyUI.getSession();
    if(!explainSession||!explainSession.skill){nextBtn.disabled=true;return;}
    globalThis.BondLineTransferUI.start(explainSession);
  }
  function sync(){
    if(!/^Explain Why\s*·\s*complete/i.test(phaseLabel.textContent||""))return;
    if(!ready()){nextBtn.textContent="Transfer loading";nextBtn.disabled=true;return;}
    nextBtn.textContent="Start Transfer";nextBtn.disabled=false;
    if(!armed){armed=true;nextBtn.addEventListener("click",launch,true);}
  }
  var observer=new MutationObserver(sync);observer.observe(phaseLabel,{childList:true,subtree:true,characterData:true});sync();
  globalThis.BondLineTransferHandoff=Object.freeze({sync:sync});
})();

/* Slice 15 browser continuation: delayed retrieval loads after Transfer. */
(function(){
  if(typeof document==="undefined"||typeof window==="undefined")return;
  var sources=["bond-line-retrieval.js","bond-line-retrieval-ui.js","bond-line-retrieval-handoff.js","bond-line-intervening-activity.js"];
  function load(index){
    if(index>=sources.length)return;
    var script=document.createElement("script");script.src=sources[index];script.async=false;
    script.onload=function(){load(index+1);};
    script.onerror=function(){console.error("Unable to load Bond-Line Slice 15 runtime:",sources[index]);};
    document.head.appendChild(script);
  }
  load(0);
})();
