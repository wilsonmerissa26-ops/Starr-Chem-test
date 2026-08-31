/* U1-01 Slice 15 learner-facing Later Retrieval. */
(function(){
  "use strict";
  var Retrieval=globalThis.BondLineRetrieval,Router=globalThis.StudentModelIdkRouter;
  if(!Retrieval||!Router)throw new Error("BondLineRetrieval and StudentModelIdkRouter are required");

  var panel=document.getElementById("lessonPanel"),phaseLabel=document.getElementById("phaseLabel"),status=document.getElementById("statusText"),controls=document.getElementById("watchControls"),live=document.getElementById("liveRegion");
  var session=null,carbonAnswer=null,hydrogenAnswer=null;

  var style=document.createElement("style");
  style.textContent=".retrieval-pill{display:inline-flex;padding:7px 11px;border-radius:999px;background:#191521;color:#fff;font-size:.78rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.retrieval-stage{border:1px solid var(--line);border-radius:20px;background:#fff;padding:8px;margin:18px 0}.retrieval-svg{display:block;width:100%;min-height:300px}.retrieval-bond{stroke:#312838;stroke-width:7;stroke-linecap:round}.retrieval-selected{fill:#eee5f7;stroke:#6f3aa8;stroke-width:5}.retrieval-choice-grid{display:grid;gap:10px;margin-top:12px}.retrieval-choice{appearance:none;border:1px solid var(--line);border-radius:14px;background:#fff;padding:13px;text-align:left;font:inherit;font-weight:850;cursor:pointer}.retrieval-choice.selected{background:var(--soft);border-color:var(--purple)}.retrieval-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:15px}.retrieval-btn{appearance:none;border:0;border-radius:14px;min-height:48px;padding:12px 16px;background:var(--purple);color:#fff;font:inherit;font-weight:900;cursor:pointer}.retrieval-btn:disabled{opacity:.45;cursor:not-allowed}.retrieval-help{appearance:none;border:1px solid var(--line);background:#fff;color:#5b5064;border-radius:999px;padding:9px 13px;font:inherit;font-weight:800;cursor:pointer}.retrieval-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.retrieval-feedback{padding:14px 16px;border-radius:15px;background:#f6f3fa;font-weight:800;line-height:1.5;margin-top:15px}.retrieval-feedback.good{background:var(--good-bg);color:#185c3d}.retrieval-help-grid{display:grid;gap:9px;margin-top:15px}.retrieval-help-grid button{appearance:none;border:1px solid var(--line);border-radius:14px;background:#fff;padding:13px;text-align:left;font:inherit;font-weight:800;cursor:pointer}";
  document.head.appendChild(style);

  function announce(t){if(live)live.textContent=t||"";}
  function shell(label,copy){controls.hidden=true;phaseLabel.textContent="Later Retrieval · "+label;status.textContent=copy;}
  function choices(values,attr){return '<div class="retrieval-choice-grid">'+values.map(function(v){return '<button type="button" class="retrieval-choice" '+attr+'="'+v+'">'+v+'</button>';}).join('')+'</div>';}
  function bindChoice(selector,callback){panel.querySelectorAll(selector).forEach(function(b){b.addEventListener("click",function(){panel.querySelectorAll(selector).forEach(function(x){x.classList.remove("selected");});b.classList.add("selected");callback(Number(b.getAttribute(selector.slice(1,-1).split('=')[0])));});});}

  function structureSvg(){
    return '<svg class="retrieval-svg" viewBox="0 0 720 330" aria-label="Fresh branched bond-line structure with an explicit oxygen heteroatom">'+
      '<line class="retrieval-bond" x1="60" y1="200" x2="170" y2="95"></line>'+
      '<line class="retrieval-bond" x1="170" y1="95" x2="290" y2="200"></line>'+
      '<line class="retrieval-bond" x1="290" y1="200" x2="410" y2="95"></line>'+
      '<line class="retrieval-bond" x1="410" y1="95" x2="530" y2="200"></line>'+
      '<line class="retrieval-bond" x1="290" y1="200" x2="290" y2="300"></line>'+
      '<line class="retrieval-bond" x1="530" y1="200" x2="605" y2="125"></line>'+
      '<text x="620" y="139" font-size="42" font-weight="900">O</text>'+
      '<line class="retrieval-bond" x1="650" y1="125" x2="685" y2="125"></line>'+
      '<text x="692" y="139" font-size="38" font-weight="900">H</text>'+
      '<circle class="retrieval-selected" cx="410" cy="95" r="20"></circle>'+
      '</svg>';
  }

  function renderNotDue(readiness){
    shell("scheduled","Retrieval stays closed until both time and intervening-work gates are satisfied.");
    var reason=readiness&&readiness.reason==="retrieval_delay_not_met"?"A meaningful activity has intervened, but the minimum retrieval interval has not passed yet.":"Complete at least one different lesson or meaningful activity before this check returns.";
    panel.innerHTML='<span class="retrieval-pill">Later, not immediately</span><h1>This check should come back after you do something else.</h1><div class="retrieval-feedback">'+reason+' There is no countdown that auto-advances the lesson. The course runtime rechecks this gate when you return.</div>';
  }

  function renderCold(){
    shell("BL-R1 · cold","Fresh retrieval: scaffold level 0. Two questions only.");carbonAnswer=null;hydrogenAnswer=null;
    panel.innerHTML='<div class="retrieval-head"><div><span class="retrieval-pill">BL-R1 · cold</span><h1>What do you still know after the break?</h1></div><button type="button" class="retrieval-help" data-retrieval-help>I need help</button></div><div class="retrieval-stage">'+structureSvg()+'</div><div class="prompt-card"><h2>1. What is the total carbon count?</h2></div>'+choices([5,6,7,8],"data-retrieval-carbon")+'<div class="prompt-card"><h2>2. How many implied hydrogens are on the selected carbon?</h2></div>'+choices([0,1,2,3],"data-retrieval-h")+'<div class="retrieval-actions"><button type="button" class="retrieval-btn" data-submit-retrieval disabled>Submit both answers</button></div>';
    panel.querySelector("[data-retrieval-help]").addEventListener("click",renderHelp);
    panel.querySelectorAll("[data-retrieval-carbon]").forEach(function(b){b.addEventListener("click",function(){panel.querySelectorAll("[data-retrieval-carbon]").forEach(function(x){x.classList.remove("selected");});b.classList.add("selected");carbonAnswer=Number(b.getAttribute("data-retrieval-carbon"));updateSubmit();});});
    panel.querySelectorAll("[data-retrieval-h]").forEach(function(b){b.addEventListener("click",function(){panel.querySelectorAll("[data-retrieval-h]").forEach(function(x){x.classList.remove("selected");});b.classList.add("selected");hydrogenAnswer=Number(b.getAttribute("data-retrieval-h"));updateSubmit();});});
    panel.querySelector("[data-submit-retrieval]").addEventListener("click",function(){var result=Retrieval.submit(session,{carbonCount:carbonAnswer,impliedHydrogenCount:hydrogenAnswer});renderResult(result);});
  }
  function updateSubmit(){var b=panel.querySelector("[data-submit-retrieval]");if(b)b.disabled=carbonAnswer===null||hydrogenAnswer===null;}

  function renderHelp(){
    shell("help changes evidence","Any help makes BL-R1 supported, not cold retrieval evidence.");
    panel.innerHTML='<h1>What kind of help do you need?</h1><div class="retrieval-feedback">If you choose support, this retrieval item cannot count toward mastery. The shared remediation router takes over.</div><div class="retrieval-help-grid">'+[
      [Router.IDK_REASONS.DONT_UNDERSTAND,"I don't understand what the question means"],
      [Router.IDK_REASONS.DONT_KNOW_START,"I understand it, but I don't know how to start"],
      [Router.IDK_REASONS.FORGOT_PREREQUISITE,"I forgot something I need"],
      [Router.IDK_REASONS.STARTED_STUCK,"I started but got stuck"],
      [Router.IDK_REASONS.SHOW_EXAMPLE,"I need to see an example"],
      [Router.IDK_REASONS.EXPLANATION_NOT_MAKING_SENSE,"This explanation isn't making sense"]
    ].map(function(x){return '<button type="button" data-retrieval-help-reason="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';
    panel.querySelectorAll("[data-retrieval-help-reason]").forEach(function(b){b.addEventListener("click",function(){var r=Retrieval.requestHelp(session,b.getAttribute("data-retrieval-help-reason"));if(r.accepted)renderSupportedBoundary(r);});});
  }

  function renderSupportedBoundary(result){
    shell("remediation required","BL-R1 was contaminated by support and cannot count as cold evidence.");
    panel.innerHTML='<h1>Cold retrieval stopped.</h1><div class="retrieval-feedback">The shared router opened <b>'+String(result.action||"remediation")+'</b>. After repair, the tutor needs a different fresh retrieval item; this one will not be recycled as mastery evidence.</div>';
  }

  function renderResult(result){
    if(!result.correct){
      shell("remediation required","The fresh retrieval was not clean.");
      panel.innerHTML='<h1>Not mastered yet.</h1><div class="retrieval-feedback">One or both retrieval answers were incorrect. BL-R1 is now spent as cold evidence and will not be repeated. Route to targeted remediation, then use another fresh retrieval later.</div>';
      return;
    }
    if(!result.countedAsIndependent){
      shell("supported result","Correct work after support is not cold retrieval evidence.");
      panel.innerHTML='<h1>Correct, but not mastery evidence.</h1><div class="retrieval-feedback">This item had support, so the correct answer cannot be used as the delayed cold confirmation.</div>';
      return;
    }
    if(result.mastery&&result.mastery.mastered){
      controls.hidden=false;Array.prototype.forEach.call(controls.querySelectorAll("button"),function(b){b.hidden=false;b.disabled=true;});
      phaseLabel.textContent="Mastery · bond-line structures";status.textContent="Shared Student Model mastery rule satisfied.";
      panel.innerHTML='<h1>Mastered.</h1><div class="retrieval-feedback good">You showed the skill cold, explained the chemistry correctly, and retrieved it again on a different fresh structure after intervening work. The shared Student Model, not this screen, returned the mastery verdict.</div>';
      announce("Bond-line structures mastered by the shared Student Model.");return;
    }
    shell("complete","Retrieval passed, but the shared mastery rule is not complete yet.");
    panel.innerHTML='<h1>Retrieval passed.</h1><div class="retrieval-feedback good">Both answers were clean and recorded as cold retrieval evidence. The shared Student Model still requires another missing evidence condition before Mastered can be shown.</div>';
  }

  function prepare(transferSession,createdAt){if(!transferSession||!transferSession.skill)throw new Error("Later Retrieval requires the live Transfer session");session=Retrieval.createSession(transferSession.skill,createdAt);renderNotDue(Retrieval.readiness(session,createdAt));return session;}
  function registerInterveningActivity(activityId,timestamp){if(!session)return{accepted:false,reason:"not_prepared"};return Retrieval.registerInterveningActivity(session,activityId,timestamp);}
  function readiness(now){return session?Retrieval.readiness(session,now):{ready:false,reason:"not_prepared"};}
  function startReady(now){if(!session)return{started:false,reason:"not_prepared"};var r=Retrieval.begin(session,now);if(r.started)renderCold();else renderNotDue(r);return r;}
  function getSession(){return session;}

  globalThis.BondLineRetrievalUI=Object.freeze({prepare:prepare,registerInterveningActivity:registerInterveningActivity,readiness:readiness,startReady:startReady,getSession:getSession});
})();
