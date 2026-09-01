/* Real-device release fixes for U1-01 Bond-Line.
 * Keeps the frozen lesson/state engine intact while repairing phone layout
 * and the learner-facing Step 4 unsure/wrong repair experience.
 */
(function(){
  "use strict";
  if(typeof document==="undefined"||typeof window==="undefined")return;

  var style=document.createElement("style");
  style.setAttribute("data-bond-line-phone-release-fix","");
  style.textContent="@media(max-width:620px){.shell{padding-bottom:190px!important}.topbar{position:static!important;padding-top:8px!important;padding-bottom:7px!important;backdrop-filter:none!important}.brand>.muted{display:none!important}.phase-row{margin-top:8px!important;gap:4px!important}.lesson{padding-top:12px!important}.learner-toolbar{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:6px!important;margin-top:7px!important;padding-top:7px!important}.learner-toolbar-group{display:contents!important}.learner-tool,.learner-nav{width:100%!important;min-height:46px!important;padding:7px 4px!important;font-size:.78rem!important;line-height:1.1!important;text-align:center!important}.watch-controls{bottom:max(6px,env(safe-area-inset-bottom))!important;padding:8px!important;gap:6px!important}.watch-controls .control-btn{min-height:52px!important;padding:10px 8px!important}.card{padding-bottom:24px!important}}";
  document.head.appendChild(style);

  function phaseText(){
    var node=document.getElementById("phaseLabel");
    return node?(node.textContent||"").trim():"";
  }

  function patchStep4Repair(){
    if(!/Step\s*4/i.test(phaseText())||!/repair/i.test(phaseText()))return;
    var panel=document.getElementById("lessonPanel");
    if(!panel||panel.getAttribute("data-step4-release-repair")==="true")return;
    var prompt=panel.querySelector("#step4PredictionPrompt");
    if(!prompt)return;

    panel.setAttribute("data-step4-release-repair","true");

    var teaching=document.createElement("div");
    teaching.className="prediction-feedback";
    teaching.setAttribute("data-step4-idk-teaching","");
    teaching.setAttribute("role","status");
    teaching.innerHTML="<strong>Look at what stayed:</strong> the corner did not move and the two bonds are still attached to that same position. The letter C is hidden by the shorthand, but the carbon atom is still represented by the corner.";
    var promptCard=prompt.closest(".prompt-card");
    if(promptCard)panel.insertBefore(teaching,promptCard);

    var eyebrow=promptCard&&promptCard.querySelector(".eyebrow");
    if(eyebrow)eyebrow.textContent="Quick check after the new view";
    prompt.textContent="The C label is hidden, but the corner and both bonds stayed in the same place. Which statement is true?";

    var buttons=Array.prototype.slice.call(panel.querySelectorAll(".step4-prediction-grid button"));
    buttons.forEach(function(button){
      var text=(button.textContent||"").trim();
      if(text==="Yes")button.textContent="The carbon disappeared";
      else if(/^No, the corner now stands for the carbon$/i.test(text))button.textContent="The same corner is still the carbon";
      else if(/^I am not sure yet$/i.test(text))button.textContent="Show me the same-position example again";
    });

    var status=document.getElementById("statusText");
    if(status)status.textContent="New view first. Then answer the simpler check.";
  }

  var queued=false;
  function schedulePatch(){
    if(queued)return;
    queued=true;
    Promise.resolve().then(function(){queued=false;patchStep4Repair();});
  }

  patchStep4Repair();
  var observer=new MutationObserver(schedulePatch);
  observer.observe(document.body,{childList:true,subtree:true});
})();
