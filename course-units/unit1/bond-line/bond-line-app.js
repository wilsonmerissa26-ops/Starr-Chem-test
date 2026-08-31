(function () {
  "use strict";

  var Slice = globalThis.BondLineSlice1;
  var Watch = globalThis.WatchMode;
  if (!Slice || !Watch) throw new Error("Bond-Line runtime dependencies are missing");

  var session = Slice.createSession();
  var watchSession = null;
  var watchFinished = false;
  var repairFeedback = { P1: "", P2: "" };
  var step4GateCleanups = [];

  var panel = document.getElementById("lessonPanel");
  var phaseLabel = document.getElementById("phaseLabel");
  var status = document.getElementById("statusText");
  var controls = document.getElementById("watchControls");
  var nextBtn = document.getElementById("nextBtn");
  var backBtn = document.getElementById("backBtn");
  var replayBtn = document.getElementById("replayBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var live = document.getElementById("liveRegion");

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }

  function announce(text) { live.textContent = text || ""; }

  function speak(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    var utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.92;
    window.speechSynthesis.speak(utterance);
  }

  function teacher(text) {
    return '<div class="teacher"><div class="teacher-avatar" aria-hidden="true">DM</div><div><div class="teacher-name">Dr. Merissa</div><p>' + escapeHtml(text) + "</p></div></div>";
  }

  function choiceButtons(choices, handler) {
    var wrap = document.createElement("div");
    wrap.className = "choice-grid";
    choices.forEach(function (choice) {
      var value = typeof choice === "object" ? choice.id : choice;
      var label = typeof choice === "object" ? choice.label : choice;
      var button = document.createElement("button");
      button.type = "button";
      button.className = "choice-btn";
      button.textContent = label;
      button.addEventListener("click", function () { handler(value, button); });
      wrap.appendChild(button);
    });
    return wrap;
  }

  function setPhase(label, text) {
    phaseLabel.textContent = label;
    status.textContent = text;
  }

  function hideWatchControls() { controls.hidden = true; }

  function reducedMotionQuery() {
    return typeof window.matchMedia === "function" ?
      window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  }

  function prefersReducedMotion() {
    var query = reducedMotionQuery();
    return !!(query && query.matches);
  }

  function addMediaChangeListener(query, handler) {
    if (!query) return function () {};
    if (typeof query.addEventListener === "function") {
      query.addEventListener("change", handler);
      return function () {
        if (typeof query.removeEventListener === "function") query.removeEventListener("change", handler);
      };
    }
    if (typeof query.addListener === "function") {
      query.addListener(handler);
      return function () {
        if (typeof query.removeListener === "function") query.removeListener(handler);
      };
    }
    return function () {};
  }

  function clearStep4GateListeners() {
    step4GateCleanups.splice(0).forEach(function (cleanup) { cleanup(); });
  }

  function trackStep4GateCleanup(cleanup) {
    step4GateCleanups.push(cleanup);
  }

  function hasNamedAnimation(node, animationName) {
    var computed = typeof window.getComputedStyle === "function" ? window.getComputedStyle(node) : null;
    return !!(computed && computed.animationName && computed.animationName !== "none" &&
      String(computed.animationName).split(",").some(function (name) { return name.trim() === animationName; }));
  }

  function gateChoiceGridUntilAnimationEnd(grid, node, animationName, readyMessage) {
    var buttons = Array.prototype.slice.call(grid.querySelectorAll("button"));
    if (!buttons.length || !node) return;
    var motionQuery = reducedMotionQuery();
    var cleaned = false;
    var removeMotionListener = function () {};
    function setEnabled(enabled) { buttons.forEach(function (button) { button.disabled = !enabled; }); }
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      node.removeEventListener("animationend", onAnimationFinished);
      node.removeEventListener("animationcancel", onAnimationFinished);
      removeMotionListener();
    }
    function release() {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      setEnabled(true);
      if (readyMessage) announce(readyMessage);
    }
    function armForCurrentMotion() {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      if (motionQuery && motionQuery.matches) { setEnabled(true); return; }
      if (hasNamedAnimation(node, animationName)) setEnabled(false);
      else setEnabled(true);
    }
    function onAnimationFinished(event) {
      if (event && event.animationName && event.animationName !== animationName) return;
      release();
    }
    function onMotionChange(event) {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      if (event && event.matches) release();
      else armForCurrentMotion();
    }
    node.addEventListener("animationend", onAnimationFinished);
    node.addEventListener("animationcancel", onAnimationFinished);
    removeMotionListener = addMediaChangeListener(motionQuery, onMotionChange);
    trackStep4GateCleanup(cleanup);
    armForCurrentMotion();
  }

  function gateControlUntilAnimationEnd(control, node, animationName, readyMessage) {
    if (!control || !node) return;
    var motionQuery = reducedMotionQuery();
    var cleaned = false;
    var removeMotionListener = function () {};
    function controlReady() { return !(watchSession && watchSession.paused) && !watchFinished && session.watchStep4Complete; }
    function cleanup() {
      if (cleaned) return;
      cleaned = true;
      node.removeEventListener("animationend", onAnimationFinished);
      node.removeEventListener("animationcancel", onAnimationFinished);
      removeMotionListener();
    }
    function markComplete() {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      node.setAttribute("data-animation-gate-complete", "true");
      control.disabled = !controlReady();
      if (readyMessage) announce(readyMessage);
    }
    function armForCurrentMotion() {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      if (motionQuery && motionQuery.matches) { markComplete(); return; }
      if (hasNamedAnimation(node, animationName)) {
        node.setAttribute("data-animation-gate-complete", "false");
        control.disabled = true;
      } else markComplete();
    }
    function onAnimationFinished(event) {
      if (event && event.animationName && event.animationName !== animationName) return;
      markComplete();
    }
    function onMotionChange(event) {
      if (cleaned || !node.isConnected) { cleanup(); return; }
      if (event && event.matches) markComplete();
      else armForCurrentMotion();
    }
    node.addEventListener("animationend", onAnimationFinished);
    node.addEventListener("animationcancel", onAnimationFinished);
    removeMotionListener = addMediaChangeListener(motionQuery, onMotionChange);
    trackStep4GateCleanup(cleanup);
    armForCurrentMotion();
  }

  function updateRepairFeedbackInPlace(repairId, text) {
    repairFeedback[repairId] = text || "";
    var feedback = panel.querySelector(".repair-feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.className = "repair-feedback";
      feedback.setAttribute("role", "status");
      var choices = panel.querySelector(".choice-grid");
      if (choices) panel.insertBefore(feedback, choices);
      else panel.appendChild(feedback);
    }
    feedback.innerHTML = "<strong>Try this:</strong> " + escapeHtml(text);
  }

  function renderOrientation() {
    clearStep4GateListeners(); hideWatchControls();
    setPhase("Orient", "No score. We are setting up the mental model.");
    panel.innerHTML = '<h1>' + escapeHtml(Slice.ORIENTATION.title) + "</h1>" + teacher(Slice.ORIENTATION.narration) + '<div class="prompt-card"><div class="eyebrow">Before we start</div><h2>' + escapeHtml(Slice.ORIENTATION.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(Slice.ORIENTATION.choices, function (choiceId) {
      var result = Slice.answerOrientation(session, choiceId); announce(result.feedback); speak(result.feedback); render();
    }));
  }

  function renderGateP1() {
    clearStep4GateListeners(); hideWatchControls();
    setPhase("Diagnose · prerequisite 1 of 2", "This is the smallest check Bond-Line needs.");
    var gate = Slice.GATES.P1;
    panel.innerHTML = '<h1>One tiny carbon check</h1>' + teacher("Before we hide any atom labels, I need one small piece: the neutral carbon bond pattern we will use here.") + '<div class="prompt-card"><h2>' + escapeHtml(gate.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(gate.choices, function (value) {
      var result = Slice.submitGate(session, "P1", value, Date.now()); repairFeedback.P1 = "";
      announce(result.correct ? "Yes. Carbon commonly reaches four total bonds in these structures." : "That tells me exactly what to repair first. We are not restarting anything."); render();
    }));
  }

  function renderRepairP1() {
    clearStep4GateListeners(); hideWatchControls();
    setPhase("Teach · tiny prerequisite repair", "Only the missing carbon-bond idea is being repaired.");
    var repair = Slice.REPAIRS.P1;
    panel.innerHTML = '<h1>' + escapeHtml(repair.title) + "</h1>" + teacher(repair.narration) + '<div class="slot-visual" aria-label="Carbon with four bond slots; one slot is already occupied by a carbon-carbon bond"><div class="slot top">?</div><div class="slot left">?</div><div class="carbon-core">C</div><div class="bond-right"></div><div class="neighbor-c">C</div><div class="slot bottom">?</div></div>' + '<div class="prompt-card"><h2>' + escapeHtml(repair.prompt) + '</h2><p class="support-note">One bond slot is already occupied by C—C. Count what remains.</p></div>' + (repairFeedback.P1 ? '<div class="repair-feedback" role="status"><strong>Try this:</strong> ' + escapeHtml(repairFeedback.P1) + "</div>" : "");
    panel.appendChild(choiceButtons([1,2,3,4], function (value) {
      var result = Slice.submitRepair(session, "P1", value); announce(result.feedback);
      if (!result.correct) { updateRepairFeedbackInPlace("P1", result.feedback); return; }
      repairFeedback.P1 = ""; speak(result.feedback); render();
    }));
  }

  function renderGateP2() {
    clearStep4GateListeners(); hideWatchControls();
    setPhase("Diagnose · prerequisite 2 of 2", "One last tiny check before teaching begins.");
    var gate = Slice.GATES.P2;
    panel.innerHTML = '<h1>What is the line doing?</h1>' + teacher("Now separate the atoms from the connection between them. That distinction will matter when carbon letters disappear.") + '<div class="cc-visual" aria-label="Carbon single bonded to carbon"><span>C</span><span class="cc-line" aria-hidden="true"></span><span>C</span></div>' + '<div class="prompt-card"><h2>' + escapeHtml(gate.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(gate.choices, function (value) {
      var result = Slice.submitGate(session, "P2", value, Date.now()); repairFeedback.P2 = "";
      announce(result.correct ? "Right. The line is the bond connecting the atoms." : "Good. We found the exact distinction to repair before the shortcut starts."); render();
    }));
  }

  function renderRepairP2() {
    clearStep4GateListeners(); hideWatchControls();
    setPhase("Teach · tiny prerequisite repair", "Atoms are positions. Lines are connections.");
    var repair = Slice.REPAIRS.P2;
    panel.innerHTML = '<h1>' + escapeHtml(repair.title) + "</h1>" + teacher(repair.narration) + '<div class="three-carbon" aria-label="Three carbon atoms connected by two single bonds"><span>C</span><span class="mini-line"></span><span>C</span><span class="mini-line"></span><span>C</span></div>' + '<div class="prompt-card"><h2>' + escapeHtml(repair.prompt) + "</h2></div>" + (repairFeedback.P2 ? '<div class="repair-feedback" role="status"><strong>Try this:</strong> ' + escapeHtml(repairFeedback.P2) + "</div>" : "");
    panel.appendChild(choiceButtons([1,2,3,4], function (value) {
      var result = Slice.submitRepair(session, "P2", value); announce(result.feedback);
      if (!result.correct) { updateRepairFeedbackInPlace("P2", result.feedback); return; }
      repairFeedback.P2 = ""; speak(result.feedback); render();
    }));
  }

  function butaneSvg(selectedIds) {
    var selected = {}; selectedIds.forEach(function (id) { selected[id] = true; });
    var carbons = [["C1",130,190],["C2",270,190],["C3",410,190],["C4",550,190]];
    var hydrogens = [[75,190,130,190],[130,105,130,158],[130,275,130,222],[270,105,270,158],[270,275,270,222],[410,105,410,158],[410,275,410,222],[550,105,550,158],[550,275,550,222],[605,190,550,190]];
    var svg = '<svg class="molecule-svg" viewBox="0 0 680 330" role="group" aria-label="Fully expanded butane with four carbon atoms and all ten hydrogens visible">';
    svg += '<g class="bonds" aria-hidden="true"><line x1="158" y1="190" x2="242" y2="190"/><line x1="298" y1="190" x2="382" y2="190"/><line x1="438" y1="190" x2="522" y2="190"/>';
    hydrogens.forEach(function (h) { svg += '<line x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '"/>'; }); svg += "</g>";
    hydrogens.forEach(function (h) { var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10); var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7); svg += '<text class="hydrogen" x="' + tx + '" y="' + ty + '">H</text>'; });
    carbons.forEach(function (c) { svg += '<g class="carbon-target' + (selected[c[0]] ? " selected" : "") + '" data-carbon-id="' + c[0] + '" role="button" tabindex="0" aria-label="Carbon ' + c[0].slice(1) + (selected[c[0]] ? ", selected" : "") + '"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>'; });
    return svg + "</svg>";
  }

  function butaneSkeletonSvg() {
    var carbons = [["C1",130,190],["C2",270,190],["C3",410,190],["C4",550,190]];
    var hydrogens = [[75,190,130,190],[130,105,130,158],[130,275,130,222],[270,105,270,158],[270,275,270,222],[410,105,410,158],[410,275,410,222],[550,105,550,158],[550,275,550,222],[605,190,550,190]];
    var svg = '<svg class="molecule-svg skeleton-stage" viewBox="0 0 680 330" role="group" aria-label="Butane with four carbon atoms and three carbon-carbon bonds emphasized. All ten carbon-bound hydrogens are still present but visually lighter.">';
    svg += '<g class="skeleton-bonds" aria-hidden="true"><line x1="158" y1="190" x2="242" y2="190"/><line x1="298" y1="190" x2="382" y2="190"/><line x1="438" y1="190" x2="522" y2="190"/></g><g class="hydrogen-bonds-light" aria-hidden="true">';
    hydrogens.forEach(function (h) { svg += '<line x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '"/>'; }); svg += "</g>";
    hydrogens.forEach(function (h,index) { var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10); var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7); svg += '<text data-step2-hydrogen="H' + (index+1) + '" class="hydrogen hydrogen-light" x="' + tx + '" y="' + ty + '">H</text>'; });
    carbons.forEach(function (c) { svg += '<g data-step2-carbon="' + c[0] + '" class="step2-carbon" aria-hidden="true"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>'; });
    return svg + "</svg>";
  }

  var butaneCarbonSkeletonGeometry = {
    carbons: [["C1",100,220],["C2",260,120],["C3",420,220],["C4",580,120]],
    bonds: [[100,220,260,120],[260,120,420,220],[420,220,580,120]]
  };
  var butaneZigzagHydrogens = [[45,220,68,220],[75,140,88,190],[75,300,88,250],[240,45,254,88],[310,65,278,95],[390,295,410,252],[470,275,438,245],[635,120,612,120],[555,45,570,88],[625,60,600,92]];

  function carbonSkeletonBonds(className) {
    var svg = '<g class="' + className + '" aria-hidden="true">';
    butaneCarbonSkeletonGeometry.bonds.forEach(function (bond) { svg += '<line x1="' + bond[0] + '" y1="' + bond[1] + '" x2="' + bond[2] + '" y2="' + bond[3] + '"/>'; });
    return svg + "</g>";
  }

  function butaneImpliedHydrogensSvg(showGhosts) {
    var carbons = butaneCarbonSkeletonGeometry.carbons;
    var svg = '<svg class="molecule-svg step3-stage" viewBox="0 0 680 330" role="group" aria-label="The same butane molecule. Four carbon labels and three carbon-carbon bonds are written. Ten carbon-bound hydrogens are still part of the molecular model but their labels are now omitted.">';
    svg += carbonSkeletonBonds("step3-cc-bonds");
    butaneZigzagHydrogens.forEach(function (h,index) { var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10); var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7); var fadeDelay = index*180; svg += '<line class="step3-hydrogen-bond-hidden" data-fade-order="' + (index+1) + '" style="animation-delay:' + fadeDelay + 'ms" x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '" aria-hidden="true"/><text data-step3-hydrogen="H' + (index+1) + '" data-fade-order="' + (index+1) + '" class="hydrogen step3-hydrogen-hidden" style="animation-delay:' + fadeDelay + 'ms" x="' + tx + '" y="' + ty + '" aria-hidden="true">H</text>'; });
    carbons.forEach(function (c,index) { svg += '<g data-step3-carbon="' + c[0] + '" data-carbon-x="' + c[1] + '" data-carbon-y="' + c[2] + '" class="step3-carbon' + (index===0 ? " terminal-carbon-highlight" : "") + '" aria-hidden="true"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>'; });
    if (showGhosts) svg += '<text class="implied-h-ghost" x="70" y="197">H</text><text class="implied-h-ghost" x="118" y="105">H</text><text class="implied-h-ghost" x="118" y="287">H</text>';
    return svg + "</svg>";
  }

  function butaneCarbonCollapseSvg(allCollapsed, repairMode, replayVisual) {
    var phases=["first","second","third","fourth"], carbons=butaneCarbonSkeletonGeometry.carbons, collapseSpacing=320;
    var svg='<svg data-step4-visual class="molecule-svg step4-stage' + (replayVisual ? ' replay-all' : '') + '" viewBox="0 0 680 340" role="group" aria-label="The same four-carbon butane skeleton. Carbon labels are being abbreviated into line ends and vertices while the carbon atoms and bonds remain.">' + carbonSkeletonBonds("step4-bonds");
    carbons.forEach(function(c,index){ var collapsed=false,labelClass="step4-carbon-label",delay=0; if(replayVisual&&allCollapsed){collapsed=true;labelClass+=" step4-collapse-now";delay=index*collapseSpacing;} else if(repairMode){collapsed=index<2;labelClass+=index<2?" step4-collapsed-static":" step4-visible-label";} else if(allCollapsed){collapsed=true;if(index<2)labelClass+=" step4-collapsed-static";else{labelClass+=" step4-collapse-now";delay=(index-2)*collapseSpacing;}} else {collapsed=index<2;if(index<2){labelClass+=" step4-collapse-now";delay=index*collapseSpacing;}else labelClass+=" step4-visible-label";} svg+='<g data-step4-carbon="'+c[0]+'" data-carbon-x="'+c[1]+'" data-carbon-y="'+c[2]+'" data-collapse-phase="'+phases[index]+'" data-collapsed="'+String(collapsed)+'" class="step4-carbon-position"><text class="'+labelClass+'" data-step4-label="'+c[0]+'" style="animation-delay:'+delay+'ms" x="'+(c[1]-13)+'" y="'+(c[2]+11)+'">C</text></g>'; });
    if(repairMode) svg+='<text data-step4-toggle-carbon="C2" data-toggle-count="3" class="step4-toggle-label" x="247" y="131">C</text>';
    return svg+"</svg>";
  }

  function step5MarkerSvg(c, index, selected, expanded) {
    var roles=["left line end","first vertex","second vertex","right line end"];
    var label="Carbon position "+(index+1)+", "+roles[index]+(selected?", selected":"");
    var markerY=c[2] < 170 ? c[2]-36 : c[2]+48;
    var svg='<g data-step5-carbon="'+c[0]+'" role="button" tabindex="0" aria-pressed="'+String(selected)+'" aria-label="'+label+'" class="step5-carbon-target'+(selected?' selected':'')+'">';
    svg+='<circle class="step5-hit-area" cx="'+c[1]+'" cy="'+c[2]+'" r="34" style="fill:transparent;stroke:transparent;pointer-events:all"/>';
    if(expanded) svg+='<text class="step5-carbon-label" x="'+(c[1]-12)+'" y="'+(c[2]+10)+'" style="font-weight:800">C</text>';
    svg+='<text data-step5-marker="'+c[0]+'" class="step5-marker'+(selected?' selected':'')+'" x="'+(c[1]-6)+'" y="'+markerY+'" style="font-weight:900;fill:#174f59">'+(index+1)+'</text></g>';
    return svg;
  }

  function step5BondOverlays() {
    var svg="";
    butaneCarbonSkeletonGeometry.bonds.forEach(function(bond,index){ svg+='<g data-step5-bond="BOND_'+(index+1)+'" role="button" tabindex="0" aria-label="Bond segment '+(index+1)+', not a carbon"><line x1="'+bond[0]+'" y1="'+bond[1]+'" x2="'+bond[2]+'" y2="'+bond[3]+'" style="stroke:transparent;stroke-width:34;pointer-events:stroke"/></g>'; });
    return svg;
  }

  function butaneStep5Svg(expanded) {
    var selected={}; session.watchStep5CarbonIds.forEach(function(id){selected[id]=true;});
    var svg='<svg class="molecule-svg step5-stage" viewBox="0 0 680 340" role="group" aria-label="'+(expanded?'Expanded butane comparison':'Finished four-carbon bond-line structure')+' with numbered carbon mapping">';
    svg+=carbonSkeletonBonds("step5-visible-bonds");
    if(expanded){
      svg+='<g class="step5-expanded-h-bonds" aria-hidden="true">';
      butaneZigzagHydrogens.forEach(function(h){svg+='<line x1="'+h[2]+'" y1="'+h[3]+'" x2="'+h[0]+'" y2="'+h[1]+'"/>';}); svg+='</g>';
      butaneZigzagHydrogens.forEach(function(h){var tx=h[0]+(h[0]<100?-14:h[0]>590?6:-10);var ty=h[1]+(h[1]<150?-3:h[1]>230?18:7);svg+='<text class="hydrogen" x="'+tx+'" y="'+ty+'">H</text>';});
    }
    svg+=step5BondOverlays();
    butaneCarbonSkeletonGeometry.carbons.forEach(function(c,index){svg+=step5MarkerSvg(c,index,!!selected[c[0]],expanded);});
    return svg+'</svg>';
  }

  function butaneStep6Svg() {
    var target=session.watchStep6Target;
    var svg='<svg data-step6-visual class="molecule-svg step6-stage" viewBox="0 0 680 340" role="group" aria-label="Finished butane bond-line structure. Carbon 2 is the worked example and '+target+' is selected for the learner hydrogen count.">';
    svg+=carbonSkeletonBonds("step6-visible-bonds");
    butaneCarbonSkeletonGeometry.carbons.forEach(function(c,index){
      var teaching=c[0]==="C2", active=c[0]===target;
      svg+='<g data-step6-carbon="'+c[0]+'" class="step6-carbon'+(teaching?' teaching':'')+(active?' active':'')+'" aria-label="Carbon '+(index+1)+(teaching?', worked example':'')+(active?', selected question':'')+'">';
      if(teaching||active) svg+='<circle cx="'+c[1]+'" cy="'+c[2]+'" r="34" style="fill:none;stroke:currentColor;stroke-width:'+(active?'6':'3')+'"/>';
      svg+='<text x="'+(c[1]-6)+'" y="'+(c[2] < 170 ? c[2]-40 : c[2]+52)+'" style="font-weight:900">'+(index+1)+'</text></g>';
    });
    return svg+'</svg>';
  }

  function updateCarbonSelectionInPlace(node,result) {
    var carbonId=node.getAttribute("data-carbon-id"); node.classList.add("selected"); node.setAttribute("aria-label","Carbon "+carbonId.slice(1)+", selected");
    var progress=document.getElementById("carbonProgress"); if(progress)progress.textContent=result.count+" of 4 carbons found";
    if(result.stepComplete){status.textContent="Four carbons identified. You control when to move on.";if(!document.getElementById("watchStepSuccess")){var success=document.createElement("div");success.id="watchStepSuccess";success.className="success-box";success.textContent="Four carbons. Keep that number in mind. We are about to make the drawing shorter without changing the molecule.";panel.appendChild(success);}}
    nextBtn.disabled=!session.watchStep1Complete||watchSession.paused||watchFinished;
  }

  function bindCarbonTargets(){panel.querySelectorAll("[data-carbon-id]").forEach(function(node){function choose(){if(watchSession&&watchSession.paused){announce("Watch is paused. Press Pause again to resume.");return;}var result=Slice.tapWatchCarbon(session,node.getAttribute("data-carbon-id"));if(result.accepted){announce(result.stepComplete?"Four carbons. Keep that number in mind.":result.count+" of 4 carbons found.");updateCarbonSelectionInPlace(node,result);}else if(result.reason==="already_tapped")announce("You already counted that carbon. Find a different carbon.");}node.addEventListener("click",choose);node.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();choose();}});});}

  function step2FeedbackForStoredChoice(step){if(!session.watchStep2Complete)return"";return session.watchStep2Prediction===step.prediction.answer?step.prediction.correctFeedback:step.prediction.repairFeedback;}
  function updateStep2PredictionInPlace(button,result){panel.querySelectorAll(".prediction-choice").forEach(function(choice){choice.setAttribute("aria-pressed",choice===button?"true":"false");choice.classList.toggle("selected",choice===button);});var feedback=document.getElementById("step2PredictionFeedback");if(!feedback){feedback=document.createElement("div");feedback.id="step2PredictionFeedback";feedback.className="prediction-feedback";feedback.setAttribute("role","status");var grid=panel.querySelector(".prediction-grid");if(grid&&grid.nextSibling)panel.insertBefore(feedback,grid.nextSibling);else panel.appendChild(feedback);}feedback.textContent=result.feedback;nextBtn.disabled=!session.watchStep2Complete||watchSession.paused||watchFinished;}

  function showStep3SuccessInPlace(button,result){if(button){panel.querySelectorAll(".step3-choice").forEach(function(choice){choice.classList.toggle("selected",choice===button);choice.setAttribute("aria-pressed",choice===button?"true":"false");});}var svg=panel.querySelector(".step3-stage");if(svg&&!svg.querySelector(".implied-h-ghost")){[["70","197"],["118","105"],["118","287"]].forEach(function(point){var ghost=document.createElementNS("http://www.w3.org/2000/svg","text");ghost.setAttribute("class","implied-h-ghost");ghost.setAttribute("x",point[0]);ghost.setAttribute("y",point[1]);ghost.textContent="H";svg.appendChild(ghost);});}var feedback=document.getElementById("step3Feedback");if(!feedback){feedback=document.createElement("div");feedback.id="step3Feedback";feedback.className="success-box";feedback.setAttribute("role","status");panel.appendChild(feedback);}feedback.textContent=result.feedback;status.textContent="Three implied hydrogens recovered. You control when to move on.";nextBtn.disabled=watchSession.paused||watchFinished;}

  function ensureWatchSession(){if(!watchSession){watchSession=Watch.createWatchSession(Slice.WATCH_SEQUENCE,{timestamp:Date.now()});Watch.begin(watchSession,Slice.WATCH_SEQUENCE,Date.now());Slice.syncWatchPhase(session,watchSession.currentIndex);}}
  function reopenCompletedWatch(){watchFinished=false;watchSession=Watch.createWatchSession(Slice.WATCH_SEQUENCE,{timestamp:Date.now()});Watch.begin(watchSession,Slice.WATCH_SEQUENCE,Date.now());while(watchSession.currentIndex<Slice.WATCH_SEQUENCE.steps.length-1)Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());Slice.syncWatchPhase(session,watchSession.currentIndex);}

  function renderWatchStep1(){clearStep4GateListeners();setPhase("Watch · I Do · Step 1",session.watchStep1Complete?"Four carbons identified. You control when to move on.":"Tap all four carbon atoms before moving on.");var narration=Slice.WATCH_SEQUENCE.steps[0].narration;panel.innerHTML='<h1>Start with everything visible</h1>'+teacher(narration)+'<div class="watch-stage">'+butaneSvg(session.watchCarbonIds)+'</div><div class="prompt-card"><div class="eyebrow">Low-risk interaction</div><h2>Tap each carbon once.</h2><p id="carbonProgress" class="progress-copy">'+session.watchCarbonIds.length+' of 4 carbons found</p></div>'+(session.watchStep1Complete?'<div id="watchStepSuccess" class="success-box">Four carbons. Keep that number in mind. We are about to make the drawing shorter without changing the molecule.</div>':"");bindCarbonTargets();backBtn.disabled=true;replayBtn.disabled=false;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep1Complete||watchSession.paused||watchFinished;}

  function renderWatchStep2(){clearStep4GateListeners();var step=Slice.WATCH_SEQUENCE.steps[1];setPhase("Watch · I Do · Step 2",session.watchStep2Complete?"Prediction recorded. You control when to move on.":"Notice what is emphasized before you predict what changes.");panel.innerHTML='<h1>See the carbon skeleton</h1>'+teacher(step.narration)+'<div class="prompt-card vocabulary-card"><div class="eyebrow">New term</div><h2>Carbon skeleton</h2><p>When we say <strong>carbon skeleton</strong>, we mean '+escapeHtml(step.vocabulary.definition)+'.</p></div><div class="watch-stage">'+butaneSkeletonSvg()+'</div><div class="prompt-card"><div class="eyebrow">Predict before reveal</div><h2 id="step2PredictionPrompt">'+escapeHtml(step.prediction.prompt)+'</h2></div>';var predictionGrid=choiceButtons(step.prediction.choices,function(choiceId,button){if(watchSession.paused){announce("Watch is paused. Press Pause again to resume before answering.");return;}var result=Slice.submitWatchStep2Prediction(session,choiceId);if(!result.accepted){if(result.reason==="already_answered")announce("Your prediction is already recorded. Use Next when you are ready.");return;}updateStep2PredictionInPlace(button,result);announce(result.feedback);speak(result.feedback);});predictionGrid.classList.add("prediction-grid");predictionGrid.setAttribute("role","group");predictionGrid.setAttribute("aria-labelledby","step2PredictionPrompt");predictionGrid.querySelectorAll("button").forEach(function(button){button.classList.add("prediction-choice");button.setAttribute("aria-pressed","false");var label=button.textContent.trim(),stored=session.watchStep2Prediction;if((stored==="yes"&&label==="Yes")||(stored==="no"&&label==="No")||(stored==="unsure"&&label==="I am not sure yet")){button.classList.add("selected");button.setAttribute("aria-pressed","true");}});panel.appendChild(predictionGrid);var existing=step2FeedbackForStoredChoice(step);if(existing){var feedback=document.createElement("div");feedback.id="step2PredictionFeedback";feedback.className="prediction-feedback";feedback.setAttribute("role","status");feedback.textContent=existing;panel.appendChild(feedback);}backBtn.disabled=watchSession.paused;replayBtn.disabled=false;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep2Complete||watchSession.paused||watchFinished;}

  function renderWatchStep3Repair(){clearStep4GateListeners();var step=Slice.WATCH_SEQUENCE.steps[2];setPhase("Watch · I Do · Step 3 · representation switch","Same carbon, different view. Count the slots instead of guessing the hidden H count.");panel.innerHTML='<h1>Switch views: count the bond slots</h1>'+teacher("We are not going to repeat the same sentence. We will show carbon's four bond slots and mark the C—C bond that is already using one of them.")+'<div class="step3-slot-board" data-step3-repair-slots aria-label="Carbon with four bond slots; one occupied by the carbon-carbon bond and three still open"><div class="step3-slot occupied" data-step3-slot="occupied">C—C</div><div class="step3-slot open" data-step3-slot="open">open</div><div class="step3-slot open" data-step3-slot="open">open</div><div class="step3-slot open" data-step3-slot="open">open</div><div class="step3-slot-carbon">C</div></div><div class="prompt-card"><div class="eyebrow">Different representation</div><h2 id="step3RepairPrompt" tabindex="-1">'+escapeHtml(step.repair.prompt)+'</h2></div>';var repairChoices=choiceButtons(step.repair.choices,function(value,button){if(watchSession.paused){announce("Watch is paused. Press Pause again to resume before answering.");return;}var result=Slice.submitWatchStep3Repair(session,value);if(!result.accepted)return;announce(result.feedback);if(!result.correct){var feedback=panel.querySelector(".step3-repair-feedback");if(!feedback){feedback=document.createElement("div");feedback.className="prediction-feedback step3-repair-feedback";feedback.setAttribute("role","status");panel.appendChild(feedback);}feedback.textContent=result.feedback;return;}panel.querySelectorAll(".step3-repair-choice").forEach(function(choice){choice.classList.toggle("selected",choice===button);});var success=document.createElement("div");success.id="step3Feedback";success.className="success-box";success.setAttribute("role","status");success.textContent=result.feedback;panel.appendChild(success);status.textContent="Three implied hydrogens reconnected. You control when to move on.";nextBtn.disabled=watchSession.paused||watchFinished;speak(result.feedback);});repairChoices.querySelectorAll("button").forEach(function(button){button.classList.add("step3-repair-choice");});repairChoices.setAttribute("role","group");repairChoices.setAttribute("aria-labelledby","step3RepairPrompt");panel.appendChild(repairChoices);backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep3Complete||watchSession.paused||watchFinished;var prompt=document.getElementById("step3RepairPrompt");if(prompt)prompt.focus();}

  function renderWatchStep3(options){clearStep4GateListeners();if(session.watchStep3RepairActive){renderWatchStep3Repair();return;}var step=Slice.WATCH_SEQUENCE.steps[2],suppressCompletionGhosts=!!(options&&options.suppressCompletionGhosts);setPhase("Watch · I Do · Step 3",session.watchStep3Complete?"Three implied hydrogens recovered. You control when to move on.":"The H labels are omitted, but the atoms are still implied.");panel.innerHTML='<h1>Hide the carbon-bound H labels</h1>'+teacher(step.narration)+'<div class="same-molecule-banner">'+escapeHtml(step.visual.banner)+'</div><div class="watch-stage">'+butaneImpliedHydrogensSvg(session.watchStep3Complete&&!suppressCompletionGhosts)+'</div><div class="prompt-card"><div class="eyebrow">Recover what is hidden</div><h2 id="step3HydrogenPrompt">'+escapeHtml(step.interaction.prompt)+'</h2></div>';var choices=choiceButtons(step.interaction.choices,function(value,button){if(watchSession.paused){announce("Watch is paused. Press Pause again to resume before answering.");return;}var result=Slice.submitWatchStep3Hydrogen(session,value);if(!result.accepted){if(result.reason==="already_answered")announce("This Watch interaction is already complete. Use Next when you are ready.");return;}announce(result.feedback);if(!result.correct&&result.repairRequired){renderWatchStep3Repair();return;}showStep3SuccessInPlace(button,result);speak(result.feedback);});choices.classList.add("step3-choice-grid");choices.setAttribute("role","group");choices.setAttribute("aria-labelledby","step3HydrogenPrompt");choices.querySelectorAll("button").forEach(function(button){button.classList.add("step3-choice");button.setAttribute("aria-pressed",String(session.watchStep3Complete&&Number(button.textContent.trim())===3));if(session.watchStep3Complete&&Number(button.textContent.trim())===3)button.classList.add("selected");});panel.appendChild(choices);if(session.watchStep3Complete){var existing=document.createElement("div");existing.id="step3Feedback";existing.className="success-box";existing.setAttribute("role","status");existing.textContent="Yes. The three remaining bond slots reconnect to three implied hydrogens.";panel.appendChild(existing);}var step3Stage=panel.querySelector(".step3-stage");if(step3Stage&&watchSession.paused)step3Stage.classList.add("is-paused");backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep3Complete||watchSession.paused||watchFinished;}

  function renderWatchStep4(options){clearStep4GateListeners();var step=Slice.WATCH_SEQUENCE.steps[3],replayVisual=!!(options&&options.replayVisual),repairMode=session.watchStep4RepairActive,allCollapsed=session.watchStep4Complete;setPhase(repairMode?"Watch · I Do · Step 4 · same-position repair":"Watch · I Do · Step 4",allCollapsed?"All four carbon labels are now abbreviated. The carbon atoms and bonds are still there.":repairMode?"Same position, same bonds, same carbon. Watch the label change without moving the atom.":"Watch the first two carbon labels become bond-line positions, then make the prediction.");panel.innerHTML='<h1>Hide the carbon letters one carbon at a time</h1>'+teacher(step.narration)+'<div class="prompt-card vocabulary-card"><div class="eyebrow">New term</div><h2>Line ends and vertices</h2><p>'+escapeHtml(step.vocabulary.vertex)+'</p></div><div class="watch-stage">'+butaneCarbonCollapseSvg(allCollapsed,repairMode,replayVisual)+'</div>'+(repairMode?'<div id="step4RepairFocus" tabindex="-1" class="prediction-feedback"><strong>Look at the same corner:</strong> '+escapeHtml(step.repair.narration)+'</div>':'')+'<div class="prompt-card"><div class="eyebrow">Prediction pause</div><h2 id="step4PredictionPrompt">'+escapeHtml(step.prediction.prompt)+'</h2></div>';var predictionChoices=choiceButtons(step.prediction.choices,function(choiceId){if(watchSession.paused){announce("Watch is paused. Resume before answering.");return;}var result=Slice.submitWatchStep4Prediction(session,choiceId);if(!result.accepted){if(result.reason==="already_answered")announce("This prediction is already complete. Use Next when you are ready.");return;}announce(result.feedback);speak(result.feedback);renderWatchStep4();if(result.correct){var doneFocus=document.getElementById("step4CompleteFocus");if(doneFocus)doneFocus.focus();}else{var repairFocus=document.getElementById("step4RepairFocus");if(repairFocus)repairFocus.focus();}});predictionChoices.classList.add("step4-prediction-grid");predictionChoices.setAttribute("role","group");predictionChoices.setAttribute("aria-labelledby","step4PredictionPrompt");predictionChoices.querySelectorAll("button").forEach(function(button){button.setAttribute("aria-pressed","false");var label=button.textContent.trim(),selected=(session.watchStep4Prediction==="yes"&&label==="Yes")||(session.watchStep4Prediction==="no_corner_carbon"&&label==="No, the corner now stands for the carbon")||(session.watchStep4Prediction==="unsure"&&label==="I am not sure yet");if(selected){button.classList.add("selected");button.setAttribute("aria-pressed","true");}});panel.appendChild(predictionChoices);if(!allCollapsed){if(repairMode)gateChoiceGridUntilAnimationEnd(predictionChoices,panel.querySelector('[data-step4-toggle-carbon="C2"]'),"step4ToggleCarbon","Same position, same bonds, same carbon. Now answer the prediction again.");else gateChoiceGridUntilAnimationEnd(predictionChoices,panel.querySelector('[data-step4-label="C2"]'),"step4HideCarbon","The first two carbon labels are now abbreviated. Make your prediction.");}if(allCollapsed){var success=document.createElement("div");success.id="step4CompleteFocus";success.tabIndex=-1;success.className="success-box";success.setAttribute("role","status");success.textContent="Same positions, same bonds, same four carbons. The labels are abbreviated into two line ends and two vertices.";panel.appendChild(success);}var stage=panel.querySelector(".step4-stage");if(stage&&watchSession.paused)stage.classList.add("is-paused");backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep4Complete||watchSession.paused||watchFinished;if(allCollapsed&&session.watchStep4Complete)gateControlUntilAnimationEnd(nextBtn,panel.querySelector('[data-step4-label="C4"]'),"step4HideCarbon","All four carbon labels are now abbreviated. You control when to move on.");}

  function setStep5Feedback(text,success){var feedback=document.getElementById("step5Feedback");if(!feedback){feedback=document.createElement("div");feedback.id="step5Feedback";feedback.setAttribute("role","status");panel.appendChild(feedback);}feedback.className=success?"success-box":"prediction-feedback";feedback.textContent=text;}
  function updateStep5SelectionInPlace(node,result){var id=node.getAttribute("data-step5-carbon");node.classList.add("selected");node.setAttribute("aria-pressed","true");node.setAttribute("aria-label",node.getAttribute("aria-label").replace(/, selected$/,"") + ", selected");var marker=panel.querySelector('[data-step5-marker="'+id+'"]');if(marker)marker.classList.add("selected");var progress=document.getElementById("step5Progress");if(progress)progress.textContent=result.count+" of 4 carbons found";if(result.feedback)setStep5Feedback(result.feedback,result.stepComplete);status.textContent=result.stepComplete?"All four carbon positions found. Compare the two notations or move on.":result.count+" of 4 carbon positions found.";nextBtn.disabled=!session.watchStep5Complete||watchSession.paused||watchFinished;if(result.stepComplete){var compare=document.getElementById("step5CompareButton");if(!compare){compare=document.createElement("button");compare.type="button";compare.id="step5CompareButton";compare.className="choice-btn";compare.textContent="Show expanded view";compare.addEventListener("click",toggleStep5Comparison);panel.appendChild(compare);}}}
  function updateStep5FeedbackInPlace(text){setStep5Feedback(text,false);}
  function bindStep5Targets(){panel.querySelectorAll("[data-step5-carbon]").forEach(function(node){function choose(){if(watchSession.paused){announce("Watch is paused. Resume before tapping carbon positions.");return;}var result=Slice.tapWatchStep5Carbon(session,node.getAttribute("data-step5-carbon"));if(result.accepted){announce(result.feedback||result.count+" of 4 carbons found.");updateStep5SelectionInPlace(node,result);}else if(result.reason==="already_tapped")announce("You already found that carbon position.");}node.addEventListener("click",choose);node.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();choose();}});});panel.querySelectorAll("[data-step5-bond]").forEach(function(node){function chooseBond(){if(watchSession.paused){announce("Watch is paused. Resume before answering.");return;}var result=Slice.tapWatchStep5Carbon(session,node.getAttribute("data-step5-bond"));if(result&&result.feedback){announce(result.feedback);updateStep5FeedbackInPlace(result.feedback);}}node.addEventListener("click",chooseBond);node.addEventListener("keydown",function(event){if(event.key==="Enter"||event.key===" "){event.preventDefault();chooseBond();}});});}
  function toggleStep5Comparison(){if(watchSession.paused)return;var result=Slice.toggleWatchStep5View(session);if(!result.accepted)return;renderWatchStep5();var compare=document.getElementById("step5CompareButton");if(compare)compare.focus();}
  function renderWatchStep5(){clearStep4GateListeners();var step=Slice.WATCH_SEQUENCE.steps[4],expanded=session.watchStep5View==="expanded";setPhase(expanded?"Watch · I Do · Step 5 · expanded comparison":"Watch · I Do · Step 5",session.watchStep5Complete?"Exactly four carbon positions found. Compare the same numbered carbons across views.":"Find every unlabeled carbon position: both line ends and both vertices.");panel.innerHTML='<h1>Finished bond-line structure</h1>'+teacher(step.narration)+'<div class="watch-stage">'+butaneStep5Svg(expanded)+'</div><div class="prompt-card"><div class="eyebrow">Immediate interaction</div><h2 id="step5TapPrompt">'+escapeHtml(step.interaction.prompt)+'</h2><p id="step5Progress" class="progress-copy">'+session.watchStep5CarbonIds.length+' of 4 carbons found</p></div>';if(session.watchStep5Complete){setStep5Feedback(step.interaction.completeFeedback,true);var compare=document.createElement("button");compare.type="button";compare.id="step5CompareButton";compare.className="choice-btn";compare.textContent=expanded?"Show bond-line view":"Show expanded view";compare.addEventListener("click",toggleStep5Comparison);panel.appendChild(compare);}bindStep5Targets();backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep5Complete||watchSession.paused||watchFinished;}

  function setStep6Feedback(result) {
    var feedback=document.getElementById("step6Feedback");
    if(!feedback){feedback=document.createElement("div");feedback.id="step6Feedback";feedback.setAttribute("role","status");panel.appendChild(feedback);}
    feedback.className=result.correct?"success-box":"prediction-feedback";
    feedback.innerHTML=escapeHtml(result.feedback||"");
    if(result.formula) feedback.innerHTML += '<div class="support-note"><strong>'+escapeHtml(result.formula)+'</strong></div>';
  }

  function renderWatchStep6() {
    clearStep4GateListeners();
    var step=Slice.WATCH_SEQUENCE.steps[5];
    var targetKey=session.watchStep6Target==="C4"?"carbon4":"carbon3";
    var interaction=step.interactions[targetKey];
    setPhase("Watch · I Do · Step 6",session.watchStep6Complete?"Both hidden-hydrogen counts recovered. You control when to move on.":session.watchStep6Target==="C3"?"Use visible bond order to recover the hidden hydrogens on carbon 3.":"Now apply the same total-bond count to the terminal carbon 4.");
    panel.innerHTML='<h1>Recover the hydrogens that are not written</h1>'+teacher(step.narration)+'<div class="watch-stage">'+butaneStep6Svg()+'</div><div class="prompt-card"><div class="eyebrow">Visible bond order + implied H = 4</div><h2 id="step6Prompt" tabindex="-1">'+escapeHtml(interaction.prompt)+'</h2></div>';
    var choices=choiceButtons(interaction.choices,function(value,button){
      if(watchSession.paused){announce("Watch is paused. Resume before answering.");return;}
      var previousTarget=session.watchStep6Target;
      var result=Slice.submitWatchStep6Hydrogens(session,value);
      if(!result.accepted)return;
      announce(result.feedback);
      if(!result.correct){setStep6Feedback(result);return;}
      speak(result.feedback);
      if(previousTarget==="C3"&&!session.watchStep6Complete){renderWatchStep6();var prompt=document.getElementById("step6Prompt");if(prompt)prompt.focus();return;}
      panel.querySelectorAll(".choice-grid button").forEach(function(choice){choice.classList.toggle("selected",choice===button);});
      setStep6Feedback(result);
      status.textContent="Carbon 3 is CH2 and carbon 4 is CH3. You control when to move on.";
      nextBtn.disabled=watchSession.paused||watchFinished;
    });
    choices.setAttribute("role","group");choices.setAttribute("aria-labelledby","step6Prompt");panel.appendChild(choices);
    if(session.watchStep6Complete){var complete={correct:true,feedback:"Carbon 3 has two implied hydrogens. Carbon 4 has three implied hydrogens. Both counts come from reaching four total bonds."};setStep6Feedback(complete);}
    backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;pauseBtn.disabled=false;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";nextBtn.disabled=!session.watchStep6Complete||watchSession.paused||watchFinished;
  }

  function renderWatch(){ensureWatchSession();controls.hidden=false;if(watchSession.currentIndex===5||session.phase==="watch_step_6")renderWatchStep6();else if(watchSession.currentIndex===4||session.phase==="watch_step_5")renderWatchStep5();else if(watchSession.currentIndex===3||session.phase==="watch_step_4")renderWatchStep4();else if(watchSession.currentIndex===2||session.phase==="watch_step_3")renderWatchStep3();else if(watchSession.currentIndex===1||session.phase==="watch_step_2")renderWatchStep2();else renderWatchStep1();}

  function renderSliceComplete(){clearStep4GateListeners();controls.hidden=false;setPhase("Watch · Step 6 complete","Slice 6 stops here. No mastery claim has been made.");panel.innerHTML='<h1>Step 6 is working.</h1>'+teacher("You recovered hidden hydrogens from the visible bond order on an internal carbon and a terminal carbon. Nothing here counts as independent mastery evidence.")+'<div class="success-box">Runtime Slice 6 complete: visible bond order was used to recover implied hydrogens.</div>';nextBtn.disabled=true;backBtn.disabled=false;replayBtn.disabled=false;pauseBtn.disabled=true;}

  function render(){if(watchFinished){renderSliceComplete();return;}if(session.phase==="orientation")renderOrientation();else if(session.phase==="gate_p1")renderGateP1();else if(session.phase==="repair_p1")renderRepairP1();else if(session.phase==="gate_p2")renderGateP2();else if(session.phase==="repair_p2")renderRepairP2();else if(/^watch_step_[1-6]$/.test(session.phase))renderWatch();}

  nextBtn.addEventListener("click",function(){
    if(!watchSession||watchSession.paused)return;
    if(watchSession.currentIndex===0){if(!session.watchStep1Complete)return;var r1=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r1.changed&&watchSession.currentIndex===1){Slice.syncWatchPhase(session,1);announce("Watch Step 2. The carbon skeleton is now emphasized while the hydrogens remain present.");renderWatch();}return;}
    if(watchSession.currentIndex===1){if(!session.watchStep2Complete)return;var r2=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r2.changed&&watchSession.currentIndex===2){Slice.syncWatchPhase(session,2);announce("Watch Step 3. The carbon-bound hydrogen labels are no longer written, but the hydrogens are still implied.");renderWatch();}return;}
    if(watchSession.currentIndex===2){if(!session.watchStep3Complete)return;var r3=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r3.changed&&watchSession.currentIndex===3){Slice.syncWatchPhase(session,3);announce("Watch Step 4. Carbon labels are shortening into line ends and vertices without removing any carbon atoms.");renderWatch();}return;}
    if(watchSession.currentIndex===3){if(!session.watchStep4Complete||nextBtn.disabled)return;var r4=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r4.changed&&watchSession.currentIndex===4){Slice.syncWatchPhase(session,4);announce("Watch Step 5. The finished zig-zag has three bond lines but four carbon positions. Find the two ends and two vertices.");renderWatch();}return;}
    if(watchSession.currentIndex===4){if(!session.watchStep5Complete||nextBtn.disabled)return;var r5=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r5.changed&&watchSession.currentIndex===5){Slice.syncWatchPhase(session,5);announce("Watch Step 6. Recover the hydrogens that are implied by carbon's visible bond order.");renderWatch();}return;}
    if(watchSession.currentIndex===5){if(!session.watchStep6Complete||nextBtn.disabled)return;var r6=Watch.next(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(r6.reason==="completed"){watchFinished=true;announce("Watch Step 6 complete.");render();}}
  });

  backBtn.addEventListener("click",function(){if(watchFinished){reopenCompletedWatch();var completionBack=Watch.back(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(completionBack.changed)Slice.syncWatchPhase(session,watchSession.currentIndex);announce("Back one Watch step.");renderWatch();return;}if(!watchSession||watchSession.paused||watchSession.currentIndex===0)return;var result=Watch.back(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(result.changed){Slice.syncWatchPhase(session,watchSession.currentIndex);announce("Back one Watch step.");renderWatch();}});

  replayBtn.addEventListener("click",function(){if(!watchSession)return;if(watchSession.paused){announce("Watch is paused. Resume before replaying this step.");return;}if(watchFinished){reopenCompletedWatch();renderWatch();}Watch.replay(watchSession,Slice.WATCH_SEQUENCE,Date.now());if(session.phase==="watch_step_3"&&!session.watchStep3RepairActive)renderWatchStep3({suppressCompletionGhosts:true});if(session.phase==="watch_step_4")renderWatchStep4({replayVisual:!session.watchStep4RepairActive});if(session.phase==="watch_step_5")renderWatchStep5();if(session.phase==="watch_step_6")renderWatchStep6();announce("Replaying the current Watch step only.");speak(Slice.WATCH_SEQUENCE.steps[watchSession.currentIndex].narration);});

  pauseBtn.addEventListener("click",function(){if(!watchSession||watchFinished)return;var result=Watch.pause(watchSession,Slice.WATCH_SEQUENCE,Date.now());announce(result.reason==="paused"?"Watch paused. The visual will stay exactly here.":"Watch resumed.");if(session.phase==="watch_step_3"){var step3Stage=panel.querySelector(".step3-stage");if(step3Stage)step3Stage.classList.toggle("is-paused",watchSession.paused);backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;nextBtn.disabled=watchSession.paused||!session.watchStep3Complete||watchFinished;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";return;}if(session.phase==="watch_step_4"){var step4Stage=panel.querySelector(".step4-stage");if(step4Stage)step4Stage.classList.toggle("is-paused",watchSession.paused);backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;if(watchSession.paused)nextBtn.disabled=true;else if(!session.watchStep4Complete||watchFinished)nextBtn.disabled=true;else{var finalCollapse=panel.querySelector('[data-step4-label="C4"]');nextBtn.disabled=!finalCollapse||finalCollapse.getAttribute("data-animation-gate-complete")!=="true";}pauseBtn.textContent=watchSession.paused?"Resume":"Pause";return;}if(session.phase==="watch_step_5"){backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;nextBtn.disabled=watchSession.paused||!session.watchStep5Complete||watchFinished;var compare=document.getElementById("step5CompareButton");if(compare)compare.disabled=watchSession.paused;pauseBtn.textContent=watchSession.paused?"Resume":"Pause";return;}if(session.phase==="watch_step_6"){backBtn.disabled=watchSession.paused;replayBtn.disabled=watchSession.paused;nextBtn.disabled=watchSession.paused||!session.watchStep6Complete||watchFinished;panel.querySelectorAll(".choice-grid button").forEach(function(button){button.disabled=watchSession.paused;});pauseBtn.textContent=watchSession.paused?"Resume":"Pause";return;}renderWatch();});

  render();
})();