/* U1-01 Slice 13 learner-facing Explain Why phase. */
(function(){
  "use strict";
  var Explain=globalThis.BondLineExplainWhy;
  if(!Explain)throw new Error("BondLineExplainWhy is required");

  var panel=document.getElementById("lessonPanel"),phaseLabel=document.getElementById("phaseLabel"),status=document.getElementById("statusText"),controls=document.getElementById("watchControls"),live=document.getElementById("liveRegion");
  var session=null;

  var style=document.createElement("style");
  style.textContent=".why-pill{display:inline-flex;padding:7px 11px;border-radius:999px;background:#eee5f7;color:#4a236f;font-size:.78rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.why-input{width:100%;min-height:150px;border:1px solid var(--line);border-radius:16px;padding:14px;font:inherit;line-height:1.55;resize:vertical}.why-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.why-btn{appearance:none;border:0;border-radius:14px;min-height:48px;padding:12px 16px;background:var(--purple);color:#fff;font:inherit;font-weight:900;cursor:pointer}.why-btn.secondary{background:#fff;color:var(--purple-dark);border:1px solid var(--line)}.why-feedback{padding:14px 16px;border-radius:15px;background:#f6f3fa;font-weight:800;line-height:1.5;margin-top:15px}.why-feedback.good{background:var(--good-bg);color:#185c3d}.why-meta{display:flex;justify-content:space-between;gap:10px;align-items:center;flex-wrap:wrap;margin-bottom:16px}.why-progress{font-weight:900;color:var(--purple-dark)}";
  document.head.appendChild(style);

  function announce(t){if(live)live.textContent=t||"";}
  function baseId(id){return String(id||"").replace(/-R\d+$/i,"");}
  function promptIndex(){var base=baseId(session.currentPromptId),i=Explain.PROMPTS.findIndex(function(p){return p.id===base;});return i<0?0:i;}
  function shell(){controls.hidden=true;phaseLabel.textContent="Explain Why · reasoning evidence";status.textContent="Prompt "+(promptIndex()+1)+" of 3 · explain relationships, not memorized wording";}
  function currentPrompt(){return Explain.promptById(session.currentPromptId);}

  function renderPrompt(message){
    shell();var p=currentPrompt();
    panel.innerHTML='<div class="why-meta"><span class="why-pill">'+p.id+'</span><span class="why-progress">'+(promptIndex()+1)+' of 3</span></div><h1>Explain the chemistry in your own words.</h1><div class="prompt-card"><h2>'+p.prompt+'</h2></div><textarea class="why-input" data-explain-response aria-label="Explain your reasoning"></textarea><div class="why-actions"><button type="button" class="why-btn" data-submit-explain>Submit explanation</button></div>'+(message?'<div class="why-feedback">'+message+'</div>':'');
    panel.querySelector("[data-submit-explain]").addEventListener("click",function(){var text=panel.querySelector("[data-explain-response]").value;var result=Explain.submit(session,text);renderResult(result);});
  }

  function renderResult(result){
    shell();var base=baseId(session.currentPromptId);
    if(!result.correct){
      var label=result.code==="ROLE_REVERSAL"?"Some roles in the explanation are reversed.":"The required relationships are not all established yet.";
      panel.innerHTML='<h1>That explanation is not evidence yet.</h1><div class="why-feedback">'+label+' I am not giving you the answer here, because repeating this same prompt would no longer be fresh evidence.</div><div class="why-actions"><button type="button" class="why-btn" data-fresh-explain>Try a fresh explanation prompt</button></div>';
      panel.querySelector("[data-fresh-explain]").addEventListener("click",function(){var fresh=Explain.nextFreshPrompt(session);if(fresh)renderPrompt("Fresh prompt, same idea. Explain the relationship rather than memorizing a sentence.");});
      announce("This explanation did not preserve the required chemistry relationships. A fresh prompt is required.");return;
    }

    if(result.freshPromptRequired&&!result.countedAsExplanationEvidence){
      panel.innerHTML='<h1>Your correction makes sense, but this prompt is no longer fresh.</h1><div class="why-feedback">Because the earlier response on this same prompt was incorrect, this correction cannot be used as explanation evidence. Use a fresh prompt to prove the reasoning.</div><div class="why-actions"><button type="button" class="why-btn" data-fresh-explain>Use fresh prompt</button></div>';
      panel.querySelector("[data-fresh-explain]").addEventListener("click",function(){var fresh=Explain.nextFreshPrompt(session);if(fresh)renderPrompt();});return;
    }

    var evidenceText=result.countedAsExplanationEvidence?"This explanation was attached to an existing cold Independent success.":"The reasoning is correct, but there was no matching cold success to upgrade, so this explanation is not Independent evidence by itself.";
    panel.innerHTML='<h1>Reasoning accepted.</h1><div class="why-feedback good">'+evidenceText+'</div><div class="why-actions"><button type="button" class="why-btn" data-next-explain>'+(base==="E-W3"?'Finish Explain Why':'Next explanation')+'</button></div>';
    panel.querySelector("[data-next-explain]").addEventListener("click",function(){var next=Explain.advance(session);if(!next.accepted&&next.nextPhase==="transfer")renderComplete();else renderPrompt();});announce(evidenceText);
  }

  function renderComplete(){
    controls.hidden=false;Array.prototype.forEach.call(controls.querySelectorAll("button"),function(b){b.hidden=false;b.disabled=true;});var next=document.getElementById("nextBtn");next.textContent="Transfer next";phaseLabel.textContent="Explain Why · complete";status.textContent="Explanation phase complete. Mastery has not been declared.";
    panel.innerHTML='<h1>You explained the rules instead of just using them.</h1><div class="why-feedback good">Explain Why is complete. Correct explanations upgraded only matching cold successes. The next phase is a fresh <b>Transfer</b> problem that looks different from the teaching examples.</div>';
    announce("Explain Why complete. Transfer is next.");
  }

  function start(independentSession){
    if(!independentSession||!independentSession.skill)throw new Error("Explain Why requires the live Independent session");
    session=Explain.createSession(independentSession.skill);renderPrompt();
  }
  function getSession(){return session;}

  globalThis.BondLineExplainWhyUI=Object.freeze({start:start,getSession:getSession});
})();
