/* U1-01 Slice 14 learner-facing Transfer. */
(function(){
  "use strict";
  var Transfer=globalThis.BondLineTransfer,Router=globalThis.StudentModelIdkRouter;
  if(!Transfer||!Router)throw new Error("BondLineTransfer and StudentModelIdkRouter are required");

  var panel=document.getElementById("lessonPanel"),phaseLabel=document.getElementById("phaseLabel"),status=document.getElementById("statusText"),controls=document.getElementById("watchControls"),live=document.getElementById("liveRegion");
  var session=null,t1Count=null,t2Count=null;

  var style=document.createElement("style");
  style.textContent=".transfer-pill{display:inline-flex;padding:7px 11px;border-radius:999px;background:#191521;color:#fff;font-size:.78rem;font-weight:900;letter-spacing:.05em;text-transform:uppercase}.transfer-input{width:100%;min-height:125px;border:1px solid var(--line);border-radius:16px;padding:14px;font:inherit;line-height:1.55;resize:vertical}.transfer-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px}.transfer-btn{appearance:none;border:0;border-radius:14px;min-height:48px;padding:12px 16px;background:var(--purple);color:#fff;font:inherit;font-weight:900;cursor:pointer}.transfer-btn.secondary{background:#fff;color:var(--purple-dark);border:1px solid var(--line)}.transfer-btn:disabled{opacity:.45;cursor:not-allowed}.transfer-help{appearance:none;border:1px solid var(--line);background:#fff;color:#5b5064;border-radius:999px;padding:9px 13px;font:inherit;font-weight:800;cursor:pointer}.transfer-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}.transfer-stage{border:1px solid var(--line);border-radius:20px;background:#fff;padding:8px;margin:18px 0}.transfer-svg{display:block;width:100%;min-height:280px}.transfer-bond{stroke:#312838;stroke-width:7;stroke-linecap:round}.transfer-double{stroke:#312838;stroke-width:5;stroke-linecap:round}.transfer-target{fill:#fff;fill-opacity:.02;stroke:transparent;stroke-width:3;cursor:pointer}.transfer-target.selected{fill:var(--good-bg);fill-opacity:.95;stroke:var(--good);stroke-width:5}.transfer-center-target{fill:#fff;fill-opacity:.01;stroke:transparent;cursor:pointer}.transfer-feedback{padding:14px 16px;border-radius:15px;background:#f6f3fa;font-weight:800;line-height:1.5;margin-top:15px}.transfer-feedback.good{background:var(--good-bg);color:#185c3d}.transfer-help-grid{display:grid;gap:9px;margin-top:15px}.transfer-help-grid button{appearance:none;border:1px solid var(--line);border-radius:14px;background:#fff;padding:13px;text-align:left;font:inherit;font-weight:800;cursor:pointer}.transfer-choice-grid{display:grid;gap:10px;margin-top:12px}.transfer-choice{appearance:none;border:1px solid var(--line);border-radius:14px;background:#fff;padding:13px;text-align:left;font:inherit;font-weight:850;cursor:pointer}.transfer-choice.selected{background:var(--soft);border-color:var(--purple)}";
  document.head.appendChild(style);

  function announce(t){if(live)live.textContent=t||"";}
  function shell(label,copy){controls.hidden=true;phaseLabel.textContent="Transfer · "+label;status.textContent=copy;}
  function head(title){return '<div class="transfer-head"><div><span class="transfer-pill">Fresh transfer</span><h1>'+title+'</h1></div><button type="button" class="transfer-help" data-transfer-help>I need help</button></div>';}
  function choices(values,attr){return '<div class="transfer-choice-grid">'+values.map(function(v){return '<button type="button" class="transfer-choice" '+attr+'="'+v+'">'+v+'</button>';}).join('')+'</div>';}
  function bindSelected(selector,callback){panel.querySelectorAll(selector).forEach(function(b){b.addEventListener("click",function(){panel.querySelectorAll(selector).forEach(function(x){x.classList.remove("selected");});b.classList.add("selected");callback(b);});});}
  function bindHelp(){var b=panel.querySelector("[data-transfer-help]");if(b)b.addEventListener("click",renderHelp);}

  function t1Svg(repair){
    var html='<svg class="transfer-svg" viewBox="0 0 680 300" aria-label="Transfer structure with four corners and two line ends">';
    var pts=[[55,195],[165,85],[275,195],[385,85],[495,195],[625,85]];
    for(var i=1;i<pts.length;i++){html+='<line class="transfer-bond" x1="'+pts[i-1][0]+'" y1="'+pts[i-1][1]+'" x2="'+pts[i][0]+'" y2="'+pts[i][1]+'"></line>';}
    if(repair){
      html+='<circle class="transfer-target'+(session.repairEnds.indexOf("END_LEFT")!==-1?' selected':'')+'" data-transfer-repair="END_LEFT" cx="55" cy="195" r="25"></circle>';
      html+='<circle class="transfer-target'+(session.repairEnds.indexOf("END_RIGHT")!==-1?' selected':'')+'" data-transfer-repair="END_RIGHT" cx="625" cy="85" r="25"></circle>';
      html+='<circle class="transfer-center-target" data-transfer-repair="BOND_CENTER_2" cx="220" cy="140" r="28"></circle>';
    }
    return html+'</svg>';
  }

  function renderT1(message){
    shell("BL-T1","Different-looking problem. Transfer success is not a mastery verdict.");t1Count=null;
    panel.innerHTML=head("Your classmate counted only the four corners")+'<div class="transfer-stage">'+t1Svg(false)+'</div><div class="prompt-card"><h2>'+Transfer.TASKS.T1.prompt+'</h2></div><p><b>Total carbon atoms</b></p>'+choices([4,5,6,7],"data-t1-count")+'<p><b>Explain what your classmate missed.</b></p><textarea class="transfer-input" data-t1-explanation></textarea><div class="transfer-actions"><button type="button" class="transfer-btn" data-submit-t1 disabled>Submit transfer answer</button></div>'+(message?'<div class="transfer-feedback">'+message+'</div>':'');
    bindHelp();bindSelected("[data-t1-count]",function(b){t1Count=Number(b.getAttribute("data-t1-count"));panel.querySelector("[data-submit-t1]").disabled=false;});
    panel.querySelector("[data-submit-t1]").addEventListener("click",function(){var r=Transfer.submitT1(session,{carbonCount:t1Count,explanation:panel.querySelector("[data-t1-explanation]").value});if(r.correct)renderComplete("BL-T1");else renderRepair(r.code);});
  }

  function renderHelp(){
    shell("BL-T1 · help changes evidence","Choosing support contaminates BL-T1 and opens the shared remediation gate.");
    panel.innerHTML='<h1>What kind of help do you need?</h1><div class="transfer-feedback">This Transfer item will no longer be treated as a clean attempt. After support, you will repair the exact issue and then receive fresh BL-T2 instead of repeating BL-T1.</div><div class="transfer-help-grid">'+[
      [Router.IDK_REASONS.DONT_UNDERSTAND,"I don't understand what the question means"],
      [Router.IDK_REASONS.DONT_KNOW_START,"I understand it, but I don't know how to start"],
      [Router.IDK_REASONS.FORGOT_PREREQUISITE,"I forgot something I need"],
      [Router.IDK_REASONS.STARTED_STUCK,"I started but got stuck"],
      [Router.IDK_REASONS.SHOW_EXAMPLE,"I need to see an example"],
      [Router.IDK_REASONS.EXPLANATION_NOT_MAKING_SENSE,"This explanation isn't making sense"]
    ].map(function(x){return '<button type="button" data-transfer-help-reason="'+x[0]+'">'+x[1]+'</button>';}).join('')+'</div>';
    panel.querySelectorAll("[data-transfer-help-reason]").forEach(function(b){b.addEventListener("click",function(){var r=Transfer.requestHelp(session,b.getAttribute("data-transfer-help-reason"));if(r.accepted)renderRepair("HELP_REQUESTED");});});
  }

  function repairMessage(code){
    if(code==="BOND_CENTER_AS_CARBON")return"Bond centers are connections, not carbon positions. Find the two carbon positions the four-corner count missed.";
    if(code==="MISSING_LINE_END_RELATION")return"You must identify exactly what the four-corner count missed. Tap the missing carbon positions.";
    if(code==="CARBON_COUNT")return"The four visible corners are not the whole carbon count. Find the missing carbon positions.";
    return"Use the picture to identify the two positions the corner-only count leaves out.";
  }
  function renderRepair(code){
    shell("BL-T1 · interactive repair","Repair the misconception before a fresh transfer problem.");
    var rs=Transfer.repairStatus(session);
    panel.innerHTML='<h1>Find what the “four corners” count missed.</h1><div class="transfer-feedback">'+repairMessage(code)+'</div><div class="transfer-stage">'+t1Svg(true)+'</div><div class="prompt-card"><h2>Tap the two carbon positions your classmate did not count.</h2><p>'+rs.endsFound+' of 2 missing line ends found.</p></div>';
    panel.querySelectorAll("[data-transfer-repair]").forEach(function(node){node.addEventListener("click",function(){var r=Transfer.tapT1Repair(session,node.getAttribute("data-transfer-repair"));if(!r.accepted&&r.reason==="bond_center"){status.textContent="That is a bond center. A bond connects carbons; it is not another carbon.";announce(status.textContent);return;}if(r.complete){renderT2("Repair complete. Now use the same chemistry on a fresh multiple-bond problem.");return;}renderRepair(code);});});
  }

  function t2Svg(){return '<svg class="transfer-svg" viewBox="0 0 660 300" aria-label="Selected carbon with one double bond and two single bonds"><line class="transfer-double" x1="315" y1="145" x2="150" y2="75"></line><line class="transfer-double" x1="321" y1="159" x2="156" y2="89"></line><line class="transfer-bond" x1="318" y1="152" x2="515" y2="82"></line><line class="transfer-bond" x1="318" y1="152" x2="430" y2="250"></line><circle cx="318" cy="152" r="20" fill="#eee5f7" stroke="#6f3aa8" stroke-width="5"></circle></svg>';}
  function renderT2(message){
    shell("BL-T2","Fresh transfer after repair. Do not repeat BL-T1.");t2Count=null;
    panel.innerHTML='<div class="transfer-head"><div><span class="transfer-pill">BL-T2 · fresh</span><h1>Use bond order, not neighbor count.</h1></div></div>'+(message?'<div class="transfer-feedback good">'+message+'</div>':'')+'<div class="transfer-stage">'+t2Svg()+'</div><div class="prompt-card"><h2>'+Transfer.TASKS.T2.prompt+'</h2></div><p><b>Hydrogens attached to the selected carbon</b></p>'+choices([0,1,2],"data-t2-count")+'<p><b>Explain.</b></p><textarea class="transfer-input" data-t2-explanation></textarea><div class="transfer-actions"><button type="button" class="transfer-btn" data-submit-t2 disabled>Submit fresh transfer</button></div>';
    bindSelected("[data-t2-count]",function(b){t2Count=Number(b.getAttribute("data-t2-count"));panel.querySelector("[data-submit-t2]").disabled=false;});
    panel.querySelector("[data-submit-t2]").addEventListener("click",function(){var r=Transfer.submitT2(session,{hydrogenCount:t2Count,explanation:panel.querySelector("[data-t2-explanation]").value});if(r.correct)renderComplete("BL-T2");else renderRemediation(r);});
  }

  function renderRemediation(result){
    shell("remediation required","Fresh BL-T2 did not transfer cleanly. Do not repeat the same transfer prompt.");
    panel.innerHTML='<h1>Transfer is not secure yet.</h1><div class="transfer-feedback">The fresh transfer item showed a bond-order difficulty ('+String(result.code||"transfer_error")+'). This prompt will not be recycled. The tutor should route to targeted remediation and later use another fresh verification.</div>';
    announce("Transfer needs targeted remediation. The same transfer item will not repeat.");
  }

  function renderComplete(taskId){
    shell("complete","Transfer result recorded. Mastery still waits for later retrieval.");
    controls.hidden=false;Array.prototype.forEach.call(controls.querySelectorAll("button"),function(b){b.hidden=false;b.disabled=true;});var next=document.getElementById("nextBtn");next.textContent="Later Retrieval next";
    panel.innerHTML='<h1>You carried the rule into a different-looking problem.</h1><div class="transfer-feedback good">'+taskId+' passed as Transfer evidence. No new cold Independent success was created here. <b>Later Retrieval</b> is next, after meaningful intervening work.</div>';
    announce("Transfer complete. Later Retrieval is next.");
  }

  function start(explainSession){if(!explainSession||!explainSession.skill)throw new Error("Transfer requires the live Explain Why session");session=Transfer.createSession(explainSession.skill);renderT1();}
  function getSession(){return session;}
  globalThis.BondLineTransferUI=Object.freeze({start:start,getSession:getSession});
})();
