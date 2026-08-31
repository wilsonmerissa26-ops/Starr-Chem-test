/* U1-01 Slice 12 handoff: Guided complete -> cold Independent. */
(function(){
  "use strict";

  var phaseLabel=document.getElementById("phaseLabel");
  var nextBtn=document.getElementById("nextBtn");
  if(!phaseLabel||!nextBtn)return;

  var armed=false;

  function independentReady(){
    return !!(globalThis.BondLineIndependentUI&&typeof globalThis.BondLineIndependentUI.start==="function");
  }

  function launch(event){
    if(!armed||!independentReady())return;
    event.preventDefault();
    event.stopImmediatePropagation();
    armed=false;
    nextBtn.removeEventListener("click",launch,true);
    globalThis.BondLineIndependentUI.start();
  }

  function sync(){
    if(!/^Guided\s*·\s*complete/i.test(phaseLabel.textContent||""))return;
    if(!independentReady()){
      nextBtn.textContent="Cold Independent loading";
      nextBtn.disabled=true;
      return;
    }
    nextBtn.textContent="Start Cold Independent";
    nextBtn.disabled=false;
    if(!armed){
      armed=true;
      nextBtn.addEventListener("click",launch,true);
    }
  }

  var observer=new MutationObserver(sync);
  observer.observe(phaseLabel,{childList:true,subtree:true,characterData:true});
  sync();
  globalThis.BondLineIndependentHandoff=Object.freeze({sync:sync});
})();

/* Slice 13 browser continuation: Explain Why loads after cold runtime is ready. */
(function(){
  if(typeof document==="undefined"||typeof window==="undefined")return;
  var sources=["bond-line-explain-why.js","bond-line-explain-why-ui.js","bond-line-explain-why-handoff.js"];
  function load(index){
    if(index>=sources.length)return;
    var script=document.createElement("script");script.src=sources[index];script.async=false;
    script.onload=function(){load(index+1);};
    script.onerror=function(){console.error("Unable to load Bond-Line Slice 13 runtime:",sources[index]);};
    document.head.appendChild(script);
  }
  load(0);
})();
