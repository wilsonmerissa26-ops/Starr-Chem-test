(function () {
  "use strict";

  var Slice = globalThis.BondLineSlice1;
  var Watch = globalThis.WatchMode;
  if (!Slice || !Watch) throw new Error("Bond-Line runtime dependencies are missing");

  var session = Slice.createSession();
  var watchSession = null;
  var watchFinished = false;
  var repairFeedback = { P1: "", P2: "" };

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

  function announce(text) {
    live.textContent = text || "";
  }

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

  function hideWatchControls() {
    controls.hidden = true;
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
    hideWatchControls();
    setPhase("Orient", "No score. We are setting up the mental model.");
    panel.innerHTML =
      '<h1>' + escapeHtml(Slice.ORIENTATION.title) + "</h1>" +
      teacher(Slice.ORIENTATION.narration) +
      '<div class="prompt-card"><div class="eyebrow">Before we start</div><h2>' + escapeHtml(Slice.ORIENTATION.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(Slice.ORIENTATION.choices, function (choiceId) {
      var result = Slice.answerOrientation(session, choiceId);
      announce(result.feedback);
      speak(result.feedback);
      render();
    }));
  }

  function renderGateP1() {
    hideWatchControls();
    setPhase("Diagnose · prerequisite 1 of 2", "This is the smallest check Bond-Line needs.");
    var gate = Slice.GATES.P1;
    panel.innerHTML =
      '<h1>One tiny carbon check</h1>' +
      teacher("Before we hide any atom labels, I need one small piece: the neutral carbon bond pattern we will use here.") +
      '<div class="prompt-card"><h2>' + escapeHtml(gate.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(gate.choices, function (value) {
      var result = Slice.submitGate(session, "P1", value, Date.now());
      repairFeedback.P1 = "";
      announce(result.correct ? "Yes. Carbon commonly reaches four total bonds in these structures." : "That tells me exactly what to repair first. We are not restarting anything.");
      render();
    }));
  }

  function renderRepairP1() {
    hideWatchControls();
    setPhase("Teach · tiny prerequisite repair", "Only the missing carbon-bond idea is being repaired.");
    var repair = Slice.REPAIRS.P1;
    panel.innerHTML =
      '<h1>' + escapeHtml(repair.title) + "</h1>" +
      teacher(repair.narration) +
      '<div class="slot-visual" aria-label="Carbon with four bond slots; one slot is already occupied by a carbon-carbon bond"><div class="slot top">?</div><div class="slot left">?</div><div class="carbon-core">C</div><div class="bond-right"></div><div class="neighbor-c">C</div><div class="slot bottom">?</div></div>' +
      '<div class="prompt-card"><h2>' + escapeHtml(repair.prompt) + '</h2><p class="support-note">One bond slot is already occupied by C—C. Count what remains.</p></div>' +
      (repairFeedback.P1 ? '<div class="repair-feedback" role="status"><strong>Try this:</strong> ' + escapeHtml(repairFeedback.P1) + "</div>" : "");
    panel.appendChild(choiceButtons([1, 2, 3, 4], function (value) {
      var result = Slice.submitRepair(session, "P1", value);
      announce(result.feedback);
      if (!result.correct) {
        updateRepairFeedbackInPlace("P1", result.feedback);
        return;
      }
      repairFeedback.P1 = "";
      speak(result.feedback);
      render();
    }));
  }

  function renderGateP2() {
    hideWatchControls();
    setPhase("Diagnose · prerequisite 2 of 2", "One last tiny check before teaching begins.");
    var gate = Slice.GATES.P2;
    panel.innerHTML =
      '<h1>What is the line doing?</h1>' +
      teacher("Now separate the atoms from the connection between them. That distinction will matter when carbon letters disappear.") +
      '<div class="cc-visual" aria-label="Carbon single bonded to carbon"><span>C</span><span class="cc-line" aria-hidden="true"></span><span>C</span></div>' +
      '<div class="prompt-card"><h2>' + escapeHtml(gate.prompt) + "</h2></div>";
    panel.appendChild(choiceButtons(gate.choices, function (value) {
      var result = Slice.submitGate(session, "P2", value, Date.now());
      repairFeedback.P2 = "";
      announce(result.correct ? "Right. The line is the bond connecting the atoms." : "Good. We found the exact distinction to repair before the shortcut starts.");
      render();
    }));
  }

  function renderRepairP2() {
    hideWatchControls();
    setPhase("Teach · tiny prerequisite repair", "Atoms are positions. Lines are connections.");
    var repair = Slice.REPAIRS.P2;
    panel.innerHTML =
      '<h1>' + escapeHtml(repair.title) + "</h1>" +
      teacher(repair.narration) +
      '<div class="three-carbon" aria-label="Three carbon atoms connected by two single bonds"><span>C</span><span class="mini-line"></span><span>C</span><span class="mini-line"></span><span>C</span></div>' +
      '<div class="prompt-card"><h2>' + escapeHtml(repair.prompt) + "</h2></div>" +
      (repairFeedback.P2 ? '<div class="repair-feedback" role="status"><strong>Try this:</strong> ' + escapeHtml(repairFeedback.P2) + "</div>" : "");
    panel.appendChild(choiceButtons([1, 2, 3, 4], function (value) {
      var result = Slice.submitRepair(session, "P2", value);
      announce(result.feedback);
      if (!result.correct) {
        updateRepairFeedbackInPlace("P2", result.feedback);
        return;
      }
      repairFeedback.P2 = "";
      speak(result.feedback);
      render();
    }));
  }

  function butaneSvg(selectedIds) {
    var selected = {};
    selectedIds.forEach(function (id) { selected[id] = true; });
    var carbons = [
      ["C1", 130, 190], ["C2", 270, 190], ["C3", 410, 190], ["C4", 550, 190]
    ];
    var hydrogens = [
      [75,190,130,190],[130,105,130,158],[130,275,130,222],
      [270,105,270,158],[270,275,270,222],
      [410,105,410,158],[410,275,410,222],
      [550,105,550,158],[550,275,550,222],[605,190,550,190]
    ];
    var svg = '<svg class="molecule-svg" viewBox="0 0 680 330" role="group" aria-label="Fully expanded butane with four carbon atoms and all ten hydrogens visible">';
    svg += '<g class="bonds" aria-hidden="true"><line x1="158" y1="190" x2="242" y2="190"/><line x1="298" y1="190" x2="382" y2="190"/><line x1="438" y1="190" x2="522" y2="190"/>';
    hydrogens.forEach(function (h) { svg += '<line x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '"/>'; });
    svg += "</g>";
    hydrogens.forEach(function (h) {
      var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10);
      var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7);
      svg += '<text class="hydrogen" x="' + tx + '" y="' + ty + '">H</text>';
    });
    carbons.forEach(function (c) {
      svg += '<g class="carbon-target' + (selected[c[0]] ? " selected" : "") + '" data-carbon-id="' + c[0] + '" role="button" tabindex="0" aria-label="Carbon ' + c[0].slice(1) + (selected[c[0]] ? ", selected" : "") + '"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>';
    });
    svg += "</svg>";
    return svg;
  }

  function butaneSkeletonSvg() {
    var carbons = [
      ["C1",130,190],["C2",270,190],["C3",410,190],["C4",550,190]
    ];
    var hydrogens = [
      [75,190,130,190],[130,105,130,158],[130,275,130,222],
      [270,105,270,158],[270,275,270,222],
      [410,105,410,158],[410,275,410,222],
      [550,105,550,158],[550,275,550,222],[605,190,550,190]
    ];
    var svg = '<svg class="molecule-svg skeleton-stage" viewBox="0 0 680 330" role="group" aria-label="Butane with four carbon atoms and three carbon-carbon bonds emphasized. All ten carbon-bound hydrogens are still present but visually lighter.">';
    svg += '<g class="skeleton-bonds" aria-hidden="true"><line x1="158" y1="190" x2="242" y2="190"/><line x1="298" y1="190" x2="382" y2="190"/><line x1="438" y1="190" x2="522" y2="190"/></g>';
    svg += '<g class="hydrogen-bonds-light" aria-hidden="true">';
    hydrogens.forEach(function (h) { svg += '<line x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '"/>'; });
    svg += "</g>";
    hydrogens.forEach(function (h, index) {
      var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10);
      var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7);
      svg += '<text data-step2-hydrogen="H' + (index + 1) + '" class="hydrogen hydrogen-light" x="' + tx + '" y="' + ty + '">H</text>';
    });
    carbons.forEach(function (c) {
      svg += '<g data-step2-carbon="' + c[0] + '" class="step2-carbon" aria-hidden="true"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>';
    });
    svg += "</svg>";
    return svg;
  }

  function butaneImpliedHydrogensSvg(showGhosts) {
    var carbons = [
      ["C1",130,190],["C2",270,190],["C3",410,190],["C4",550,190]
    ];
    var hydrogens = [
      [75,190,130,190],[130,105,130,158],[130,275,130,222],
      [270,105,270,158],[270,275,270,222],
      [410,105,410,158],[410,275,410,222],
      [550,105,550,158],[550,275,550,222],[605,190,550,190]
    ];
    var svg = '<svg class="molecule-svg step3-stage" viewBox="0 0 680 330" role="group" aria-label="The same butane molecule. Four carbon labels and three carbon-carbon bonds are written. Ten carbon-bound hydrogens are still part of the molecular model but their labels are now omitted.">';
    svg += '<g class="step3-cc-bonds" aria-hidden="true"><line x1="158" y1="190" x2="242" y2="190"/><line x1="298" y1="190" x2="382" y2="190"/><line x1="438" y1="190" x2="522" y2="190"/></g>';
    hydrogens.forEach(function (h, index) {
      var tx = h[0] + (h[0] < 100 ? -14 : h[0] > 590 ? 6 : -10);
      var ty = h[1] + (h[1] < 150 ? -3 : h[1] > 230 ? 18 : 7);
      svg += '<line class="step3-hydrogen-bond-hidden" data-fade-order="' + (index + 1) + '" x1="' + h[2] + '" y1="' + h[3] + '" x2="' + h[0] + '" y2="' + h[1] + '" aria-hidden="true"/>';
      svg += '<text data-step3-hydrogen="H' + (index + 1) + '" data-fade-order="' + (index + 1) + '" class="hydrogen step3-hydrogen-hidden" x="' + tx + '" y="' + ty + '" aria-hidden="true">H</text>';
    });
    carbons.forEach(function (c, index) {
      svg += '<g data-step3-carbon="' + c[0] + '" class="step3-carbon' + (index === 0 ? " terminal-carbon-highlight" : "") + '" aria-hidden="true"><circle cx="' + c[1] + '" cy="' + c[2] + '" r="31"/><text x="' + (c[1]-12) + '" y="' + (c[2]+10) + '">C</text></g>';
    });
    if (showGhosts) {
      svg += '<text class="implied-h-ghost" x="70" y="197">H</text>';
      svg += '<text class="implied-h-ghost" x="118" y="105">H</text>';
      svg += '<text class="implied-h-ghost" x="118" y="287">H</text>';
    }
    svg += "</svg>";
    return svg;
  }

  function updateCarbonSelectionInPlace(node, result) {
    var carbonId = node.getAttribute("data-carbon-id");
    node.classList.add("selected");
    node.setAttribute("aria-label", "Carbon " + carbonId.slice(1) + ", selected");
    var progress = document.getElementById("carbonProgress");
    if (progress) progress.textContent = result.count + " of 4 carbons found";
    if (result.stepComplete) {
      status.textContent = "Four carbons identified. You control when to move on.";
      if (!document.getElementById("watchStepSuccess")) {
        var success = document.createElement("div");
        success.id = "watchStepSuccess";
        success.className = "success-box";
        success.textContent = "Four carbons. Keep that number in mind. We are about to make the drawing shorter without changing the molecule.";
        panel.appendChild(success);
      }
    }
    nextBtn.disabled = !session.watchStep1Complete || watchSession.paused || watchFinished;
  }

  function bindCarbonTargets() {
    panel.querySelectorAll("[data-carbon-id]").forEach(function (node) {
      function choose() {
        if (watchSession && watchSession.paused) {
          announce("Watch is paused. Press Pause again to resume.");
          return;
        }
        var result = Slice.tapWatchCarbon(session, node.getAttribute("data-carbon-id"));
        if (result.accepted) {
          announce(result.stepComplete ? "Four carbons. Keep that number in mind." : result.count + " of 4 carbons found.");
          updateCarbonSelectionInPlace(node, result);
        } else if (result.reason === "already_tapped") {
          announce("You already counted that carbon. Find a different carbon.");
        }
      }
      node.addEventListener("click", choose);
      node.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); choose(); }
      });
    });
  }

  function step2FeedbackForStoredChoice(step) {
    if (!session.watchStep2Complete) return "";
    return session.watchStep2Prediction === step.prediction.answer
      ? step.prediction.correctFeedback
      : step.prediction.repairFeedback;
  }

  function updateStep2PredictionInPlace(button, result) {
    panel.querySelectorAll(".prediction-choice").forEach(function (choice) {
      choice.setAttribute("aria-pressed", choice === button ? "true" : "false");
      choice.classList.toggle("selected", choice === button);
    });
    var feedback = document.getElementById("step2PredictionFeedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.id = "step2PredictionFeedback";
      feedback.className = "prediction-feedback";
      feedback.setAttribute("role", "status");
      var grid = panel.querySelector(".prediction-grid");
      if (grid && grid.nextSibling) panel.insertBefore(feedback, grid.nextSibling);
      else panel.appendChild(feedback);
    }
    feedback.textContent = result.feedback;
    nextBtn.disabled = !session.watchStep2Complete || watchSession.paused || watchFinished;
  }

  function showStep3SuccessInPlace(button, result) {
    if (button) {
      panel.querySelectorAll(".step3-choice").forEach(function (choice) {
        choice.classList.toggle("selected", choice === button);
        choice.setAttribute("aria-pressed", choice === button ? "true" : "false");
      });
    }
    var svg = panel.querySelector(".step3-stage");
    if (svg && !svg.querySelector(".implied-h-ghost")) {
      [
        ["70","197"], ["118","105"], ["118","287"]
      ].forEach(function (point) {
        var ghost = document.createElementNS("http://www.w3.org/2000/svg", "text");
        ghost.setAttribute("class", "implied-h-ghost");
        ghost.setAttribute("x", point[0]);
        ghost.setAttribute("y", point[1]);
        ghost.textContent = "H";
        svg.appendChild(ghost);
      });
    }
    var feedback = document.getElementById("step3Feedback");
    if (!feedback) {
      feedback = document.createElement("div");
      feedback.id = "step3Feedback";
      feedback.className = "success-box";
      feedback.setAttribute("role", "status");
      panel.appendChild(feedback);
    }
    feedback.textContent = result.feedback;
    status.textContent = "Three implied hydrogens recovered. You control when to move on.";
    nextBtn.disabled = watchSession.paused || watchFinished;
  }

  function ensureWatchSession() {
    if (!watchSession) {
      watchSession = Watch.createWatchSession(Slice.WATCH_SEQUENCE, { timestamp: Date.now() });
      Watch.begin(watchSession, Slice.WATCH_SEQUENCE, Date.now());
      Slice.syncWatchPhase(session, watchSession.currentIndex);
    }
  }

  function reopenCompletedWatch() {
    watchFinished = false;
    watchSession = Watch.createWatchSession(Slice.WATCH_SEQUENCE, { timestamp: Date.now() });
    Watch.begin(watchSession, Slice.WATCH_SEQUENCE, Date.now());
    while (watchSession.currentIndex < Slice.WATCH_SEQUENCE.steps.length - 1) {
      Watch.next(watchSession, Slice.WATCH_SEQUENCE, Date.now());
    }
    Slice.syncWatchPhase(session, watchSession.currentIndex);
  }

  function renderWatchStep1() {
    setPhase("Watch · I Do · Step 1", session.watchStep1Complete ? "Four carbons identified. You control when to move on." : "Tap all four carbon atoms before moving on.");
    var narration = Slice.WATCH_SEQUENCE.steps[0].narration;
    panel.innerHTML =
      '<h1>Start with everything visible</h1>' +
      teacher(narration) +
      '<div class="watch-stage">' + butaneSvg(session.watchCarbonIds) + '</div>' +
      '<div class="prompt-card"><div class="eyebrow">Low-risk interaction</div><h2>Tap each carbon once.</h2><p id="carbonProgress" class="progress-copy">' + session.watchCarbonIds.length + ' of 4 carbons found</p></div>' +
      (session.watchStep1Complete ? '<div id="watchStepSuccess" class="success-box">Four carbons. Keep that number in mind. We are about to make the drawing shorter without changing the molecule.</div>' : "");
    bindCarbonTargets();
    backBtn.disabled = true;
    replayBtn.disabled = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = watchSession.paused ? "Resume" : "Pause";
    nextBtn.disabled = !session.watchStep1Complete || watchSession.paused || watchFinished;
  }

  function renderWatchStep2() {
    var step = Slice.WATCH_SEQUENCE.steps[1];
    setPhase("Watch · I Do · Step 2", session.watchStep2Complete ? "Prediction recorded. You control when to move on." : "Notice what is emphasized before you predict what changes.");
    panel.innerHTML =
      '<h1>See the carbon skeleton</h1>' +
      teacher(step.narration) +
      '<div class="prompt-card vocabulary-card"><div class="eyebrow">New term</div><h2>Carbon skeleton</h2><p>When we say <strong>carbon skeleton</strong>, we mean ' + escapeHtml(step.vocabulary.definition) + '.</p></div>' +
      '<div class="watch-stage">' + butaneSkeletonSvg() + '</div>' +
      '<div class="prompt-card"><div class="eyebrow">Predict before reveal</div><h2 id="step2PredictionPrompt">' + escapeHtml(step.prediction.prompt) + '</h2></div>';

    var predictionGrid = choiceButtons(step.prediction.choices, function (choiceId, button) {
      if (watchSession.paused) {
        announce("Watch is paused. Press Pause again to resume before answering.");
        return;
      }
      var result = Slice.submitWatchStep2Prediction(session, choiceId);
      if (!result.accepted) {
        if (result.reason === "already_answered") announce("Your prediction is already recorded. Use Next when you are ready.");
        return;
      }
      updateStep2PredictionInPlace(button, result);
      announce(result.feedback);
      speak(result.feedback);
    });
    predictionGrid.classList.add("prediction-grid");
    predictionGrid.setAttribute("role", "group");
    predictionGrid.setAttribute("aria-labelledby", "step2PredictionPrompt");
    predictionGrid.querySelectorAll("button").forEach(function (button) {
      button.classList.add("prediction-choice");
      button.setAttribute("aria-pressed", "false");
      var label = button.textContent.trim();
      var stored = session.watchStep2Prediction;
      if ((stored === "yes" && label === "Yes") || (stored === "no" && label === "No") || (stored === "unsure" && label === "I am not sure yet")) {
        button.classList.add("selected");
        button.setAttribute("aria-pressed", "true");
      }
    });
    panel.appendChild(predictionGrid);

    var existing = step2FeedbackForStoredChoice(step);
    if (existing) {
      var feedback = document.createElement("div");
      feedback.id = "step2PredictionFeedback";
      feedback.className = "prediction-feedback";
      feedback.setAttribute("role", "status");
      feedback.textContent = existing;
      panel.appendChild(feedback);
    }

    backBtn.disabled = watchSession.paused;
    replayBtn.disabled = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = watchSession.paused ? "Resume" : "Pause";
    nextBtn.disabled = !session.watchStep2Complete || watchSession.paused || watchFinished;
  }

  function renderWatchStep3Repair() {
    var step = Slice.WATCH_SEQUENCE.steps[2];
    setPhase("Watch · I Do · Step 3 · representation switch", "Same carbon, different view. Count the slots instead of guessing the hidden H count.");
    panel.innerHTML =
      '<h1>Switch views: count the bond slots</h1>' +
      teacher("We are not going to repeat the same sentence. We will show carbon's four bond slots and mark the C—C bond that is already using one of them.") +
      '<div class="step3-slot-board" data-step3-repair-slots aria-label="Carbon with four bond slots; one occupied by the carbon-carbon bond and three still open">' +
        '<div class="step3-slot occupied" data-step3-slot="occupied">C—C</div>' +
        '<div class="step3-slot open" data-step3-slot="open">open</div>' +
        '<div class="step3-slot open" data-step3-slot="open">open</div>' +
        '<div class="step3-slot open" data-step3-slot="open">open</div>' +
        '<div class="step3-slot-carbon">C</div>' +
      '</div>' +
      '<div class="prompt-card"><div class="eyebrow">Different representation</div><h2 id="step3RepairPrompt" tabindex="-1">' + escapeHtml(step.repair.prompt) + '</h2></div>';

    var repairChoices = choiceButtons(step.repair.choices, function (value, button) {
      if (watchSession.paused) {
        announce("Watch is paused. Press Pause again to resume before answering.");
        return;
      }
      var result = Slice.submitWatchStep3Repair(session, value);
      if (!result.accepted) return;
      announce(result.feedback);
      if (!result.correct) {
        var feedback = panel.querySelector(".step3-repair-feedback");
        if (!feedback) {
          feedback = document.createElement("div");
          feedback.className = "prediction-feedback step3-repair-feedback";
          feedback.setAttribute("role", "status");
          panel.appendChild(feedback);
        }
        feedback.textContent = result.feedback;
        return;
      }
      panel.querySelectorAll(".step3-repair-choice").forEach(function (choice) {
        choice.classList.toggle("selected", choice === button);
      });
      var success = document.createElement("div");
      success.id = "step3Feedback";
      success.className = "success-box";
      success.setAttribute("role", "status");
      success.textContent = result.feedback;
      panel.appendChild(success);
      status.textContent = "Three implied hydrogens reconnected. You control when to move on.";
      nextBtn.disabled = watchSession.paused || watchFinished;
      speak(result.feedback);
    });
    repairChoices.querySelectorAll("button").forEach(function (button) { button.classList.add("step3-repair-choice"); });
    panel.appendChild(repairChoices);
    backBtn.disabled = watchSession.paused;
    replayBtn.disabled = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = watchSession.paused ? "Resume" : "Pause";
    nextBtn.disabled = !session.watchStep3Complete || watchSession.paused || watchFinished;
    var prompt = document.getElementById("step3RepairPrompt");
    if (prompt) prompt.focus();
  }

  function renderWatchStep3() {
    if (session.watchStep3RepairActive) {
      renderWatchStep3Repair();
      return;
    }
    var step = Slice.WATCH_SEQUENCE.steps[2];
    setPhase("Watch · I Do · Step 3", session.watchStep3Complete ? "Three implied hydrogens recovered. You control when to move on." : "The H labels are omitted, but the atoms are still implied.");
    panel.innerHTML =
      '<h1>Hide the carbon-bound H labels</h1>' +
      teacher(step.narration) +
      '<div class="same-molecule-banner">' + escapeHtml(step.visual.banner) + '</div>' +
      '<div class="watch-stage">' + butaneImpliedHydrogensSvg(session.watchStep3Complete) + '</div>' +
      '<div class="prompt-card"><div class="eyebrow">Recover what is hidden</div><h2 id="step3HydrogenPrompt">' + escapeHtml(step.interaction.prompt) + '</h2></div>';

    var choices = choiceButtons(step.interaction.choices, function (value, button) {
      if (watchSession.paused) {
        announce("Watch is paused. Press Pause again to resume before answering.");
        return;
      }
      var result = Slice.submitWatchStep3Hydrogen(session, value);
      if (!result.accepted) {
        if (result.reason === "already_answered") announce("This Watch interaction is already complete. Use Next when you are ready.");
        return;
      }
      announce(result.feedback);
      if (!result.correct && result.repairRequired) {
        renderWatchStep3Repair();
        return;
      }
      showStep3SuccessInPlace(button, result);
      speak(result.feedback);
    });
    choices.classList.add("step3-choice-grid");
    choices.setAttribute("role", "group");
    choices.setAttribute("aria-labelledby", "step3HydrogenPrompt");
    choices.querySelectorAll("button").forEach(function (button) {
      button.classList.add("step3-choice");
      button.setAttribute("aria-pressed", String(session.watchStep3Complete && Number(button.textContent.trim()) === 3));
      if (session.watchStep3Complete && Number(button.textContent.trim()) === 3) button.classList.add("selected");
    });
    panel.appendChild(choices);

    if (session.watchStep3Complete) {
      var existing = document.createElement("div");
      existing.id = "step3Feedback";
      existing.className = "success-box";
      existing.setAttribute("role", "status");
      existing.textContent = "Yes. The three remaining bond slots reconnect to three implied hydrogens.";
      panel.appendChild(existing);
    }

    backBtn.disabled = watchSession.paused;
    replayBtn.disabled = false;
    pauseBtn.disabled = false;
    pauseBtn.textContent = watchSession.paused ? "Resume" : "Pause";
    nextBtn.disabled = !session.watchStep3Complete || watchSession.paused || watchFinished;
  }

  function renderWatch() {
    ensureWatchSession();
    controls.hidden = false;
    if (watchSession.currentIndex === 2 || session.phase === "watch_step_3") renderWatchStep3();
    else if (watchSession.currentIndex === 1 || session.phase === "watch_step_2") renderWatchStep2();
    else renderWatchStep1();
  }

  function renderSliceComplete() {
    controls.hidden = false;
    setPhase("Watch · Step 3 complete", "Slice 3 stops here. No mastery claim has been made.");
    panel.innerHTML =
      '<h1>Step 3 is working.</h1>' +
      teacher("You kept the same butane molecule while its carbon-bound hydrogen labels disappeared, then recovered a terminal carbon's implied hydrogens by counting from the visible bond total to four. If that count was uncertain, we switched to four bond slots instead of repeating the same explanation. Nothing here counts as independent mastery evidence.") +
      '<div class="success-box">Runtime Slice 3 complete: same molecule, fewer written labels, with hidden hydrogens recovered from carbon bond count.</div>';
    nextBtn.disabled = true;
    backBtn.disabled = false;
    replayBtn.disabled = false;
    pauseBtn.disabled = true;
  }

  function render() {
    if (watchFinished) { renderSliceComplete(); return; }
    if (session.phase === "orientation") renderOrientation();
    else if (session.phase === "gate_p1") renderGateP1();
    else if (session.phase === "repair_p1") renderRepairP1();
    else if (session.phase === "gate_p2") renderGateP2();
    else if (session.phase === "repair_p2") renderRepairP2();
    else if (session.phase === "watch_step_1" || session.phase === "watch_step_2" || session.phase === "watch_step_3") renderWatch();
  }

  nextBtn.addEventListener("click", function () {
    if (!watchSession || watchSession.paused) return;

    if (watchSession.currentIndex === 0) {
      if (!session.watchStep1Complete) return;
      var step1Result = Watch.next(watchSession, Slice.WATCH_SEQUENCE, Date.now());
      if (step1Result.changed && watchSession.currentIndex === 1) {
        Slice.syncWatchPhase(session, 1);
        announce("Watch Step 2. The carbon skeleton is now emphasized while the hydrogens remain present.");
        renderWatch();
      }
      return;
    }

    if (watchSession.currentIndex === 1) {
      if (!session.watchStep2Complete) return;
      var step2Result = Watch.next(watchSession, Slice.WATCH_SEQUENCE, Date.now());
      if (step2Result.changed && watchSession.currentIndex === 2) {
        Slice.syncWatchPhase(session, 2);
        announce("Watch Step 3. The carbon-bound hydrogen labels are no longer written, but the hydrogens are still implied.");
        renderWatch();
      }
      return;
    }

    if (watchSession.currentIndex === 2) {
      if (!session.watchStep3Complete) return;
      var step3Result = Watch.next(watchSession, Slice.WATCH_SEQUENCE, Date.now());
      if (step3Result.reason === "completed") {
        watchFinished = true;
        announce("Watch Step 3 complete.");
        render();
      }
    }
  });

  backBtn.addEventListener("click", function () {
    if (watchFinished) {
      reopenCompletedWatch();
      var completionBack = Watch.back(watchSession, Slice.WATCH_SEQUENCE, Date.now());
      if (completionBack.changed) Slice.syncWatchPhase(session, watchSession.currentIndex);
      announce("Back one Watch step.");
      renderWatch();
      return;
    }
    if (!watchSession || watchSession.paused || watchSession.currentIndex === 0) return;
    var result = Watch.back(watchSession, Slice.WATCH_SEQUENCE, Date.now());
    if (result.changed) {
      Slice.syncWatchPhase(session, watchSession.currentIndex);
      announce("Back one Watch step.");
      renderWatch();
    }
  });

  replayBtn.addEventListener("click", function () {
    if (!watchSession) return;
    if (watchFinished) {
      reopenCompletedWatch();
      renderWatch();
    }
    Watch.replay(watchSession, Slice.WATCH_SEQUENCE, Date.now());
    announce("Replaying the current Watch step only.");
    speak(Slice.WATCH_SEQUENCE.steps[watchSession.currentIndex].narration);
  });

  pauseBtn.addEventListener("click", function () {
    if (!watchSession || watchFinished) return;
    var result = Watch.pause(watchSession, Slice.WATCH_SEQUENCE, Date.now());
    announce(result.reason === "paused" ? "Watch paused. The visual will stay exactly here." : "Watch resumed.");
    renderWatch();
  });

  render();
})();
