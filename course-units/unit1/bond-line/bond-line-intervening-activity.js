/* U1-01 pilot bridge: meaningful non-bond-line work before delayed retrieval. */
(function(){
  "use strict";
  var panel=document.getElementById("lessonPanel"),phaseLabel=document.getElementById("phaseLabel"),status=document.getElementById("statusText");
  if(!panel||!phaseLabel||!status)return;

  var activities=[
    {
      id:"unit1.switch.alkane_formula",
      label:"Alkane formula switch",
      prompt:"A saturated acyclic alkane has 4 carbon atoms. What is its molecular formula?",
      choices:["C4H8","C4H10","C4H12","C5H12"],
      correct:"C4H10",
      teach:"For an acyclic saturated alkane, use CnH2n+2. With n = 4, the formula is C4H10."
    },
    {
      id:"unit1.switch.functional_group",
      label:"Functional-group switch",
      prompt:"CH3CH2OH contains which functional group?",
      choices:["Alcohol","Ketone","Alkene","Amine"],
      correct:"Alcohol",
      teach:"The OH attached to a saturated carbon makes this an alcohol."
    }
  ];
  var activityIndex=0,completed={};

  function runtimeReady(){
    return !!(globalThis.BondLineRetrievalUI&&globalThis.BondLineRetrievalHandoff&&typeof globalThis.BondLineRetrievalUI.readiness==="function"&&typeof globalThis.BondLineRetrievalHandoff.registerInterveningActivity==="function");
  }
  function isScheduled(){return /^Later Retrieval\s*·\s*scheduled/i.test(phaseLabel.textContent||"");}
  function currentReadiness(){return runtimeReady()?globalThis.BondLineRetrievalUI.readiness(Date.now()):{ready:false,reason:"runtime_not_ready"};}
  function syncHandoff(){if(globalThis.BondLineRetrievalHandoff&&typeof globalThis.BondLineRetrievalHandoff.sync==="function")globalThis.BondLineRetrievalHandoff.sync(Date.now());}

  function readyCopy(){
    status.textContent="The delayed check is ready. Start it when you choose.";
    panel.innerHTML='<span class="retrieval-pill">Intervening work complete</span><h1>Now return to the bond-line skill cold.</h1><div class="retrieval-feedback good">You switched to a different chemistry skill first. The time gate is also satisfied. Use <b>Start Later Retrieval</b> below when you are ready.</div>';
  }

  function waitingCopy(){
    status.textContent="Intervening work is complete; the minimum retrieval interval is still active.";
    panel.innerHTML='<span class="retrieval-pill">Intervening work complete</span><h1>Good switch. The bond-line check is still intentionally later.</h1><div class="retrieval-feedback">You already did the required different chemistry activity. There is no auto-countdown. Review the rule you just used, then use the button below to recheck readiness.</div><div class="retrieval-actions"><button type="button" class="retrieval-btn" data-check-retrieval-readiness>Check retrieval readiness</button></div>';
    panel.querySelector("[data-check-retrieval-readiness]").addEventListener("click",function(){
      syncHandoff();
      var r=currentReadiness();
      if(r.ready)readyCopy();
      else if(activityIndex<activities.length-1){activityIndex++;renderActivity(activities[activityIndex]);}
      else waitingCopy();
    });
  }

  function afterMeaningfulActivity(){
    syncHandoff();
    var r=currentReadiness();
    if(r.ready)readyCopy();
    else if(activityIndex<activities.length-1){activityIndex++;renderActivity(activities[activityIndex]);}
    else waitingCopy();
  }

  function record(activity){
    if(completed[activity.id])return;
    var result=globalThis.BondLineRetrievalHandoff.registerInterveningActivity(activity.id,Date.now());
    if(result&&result.accepted)completed[activity.id]=true;
  }

  function renderFreshAfterTeach(activity){
    var nextIndex=Math.min(activityIndex+1,activities.length-1),next=activities[nextIndex];
    activityIndex=nextIndex;
    panel.innerHTML='<span class="retrieval-pill">Switch gears · supported</span><h1>Use the correction, then prove the different skill on a fresh question.</h1><div class="retrieval-feedback">'+activity.teach+'</div><div class="retrieval-actions"><button type="button" class="retrieval-btn" data-fresh-switch>Try a fresh switch question</button></div>';
    panel.querySelector("[data-fresh-switch]").addEventListener("click",function(){renderActivity(next);});
  }

  function renderActivity(activity){
    if(!isScheduled()||!runtimeReady())return;
    status.textContent="Do one different chemistry activity before the bond-line retrieval returns.";
    panel.innerHTML='<span class="retrieval-pill">Switch gears first</span><h1>Do something different before we check bond-line again.</h1><div class="prompt-card"><div class="eyebrow">'+activity.label+'</div><h2>'+activity.prompt+'</h2></div><div class="retrieval-choice-grid">'+activity.choices.map(function(choice){return '<button type="button" class="retrieval-choice" data-switch-answer="'+choice+'">'+choice+'</button>';}).join("")+'</div><div class="retrieval-feedback" data-switch-feedback>This activity is a different chemistry skill. It does not add bond-line mastery evidence.</div>';
    panel.querySelectorAll("[data-switch-answer]").forEach(function(button){
      button.addEventListener("click",function(){
        var answer=button.getAttribute("data-switch-answer");
        if(answer===activity.correct){
          record(activity);
          panel.querySelector("[data-switch-feedback]").classList.add("good");
          panel.querySelector("[data-switch-feedback]").innerHTML="Correct. That counts as the required intervening chemistry activity, not as bond-line evidence.";
          Array.prototype.forEach.call(panel.querySelectorAll("[data-switch-answer]"),function(b){b.disabled=true;});
          var continueButton=document.createElement("button");continueButton.type="button";continueButton.className="retrieval-btn";continueButton.setAttribute("data-complete-switch","");continueButton.textContent="Continue";
          var actions=document.createElement("div");actions.className="retrieval-actions";actions.appendChild(continueButton);panel.appendChild(actions);
          continueButton.addEventListener("click",afterMeaningfulActivity);
        }else{
          Array.prototype.forEach.call(panel.querySelectorAll("[data-switch-answer]"),function(b){b.disabled=true;});
          renderFreshAfterTeach(activity);
        }
      });
    });
  }

  function startIfNeeded(){
    if(!isScheduled()||!runtimeReady())return;
    var r=currentReadiness();
    if(r.ready){syncHandoff();readyCopy();return;}
    if(r.reason==="intervening_activity_required")renderActivity(activities[activityIndex]);
    else if(r.reason==="retrieval_delay_not_met")waitingCopy();
  }

  var observer=new MutationObserver(startIfNeeded);observer.observe(phaseLabel,{childList:true,subtree:true,characterData:true});
  startIfNeeded();
  globalThis.BondLineInterveningActivity=Object.freeze({start:startIfNeeded});
})();
