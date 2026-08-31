/*
 * U1-01 Slice 9 UI bridge.
 * Intercepts learner-controlled Next after Watch Step 8 and opens the
 * supported four-item concept check without changing Watch/mastery logic.
 */
(function () {
  "use strict";

  var Concept = globalThis.BondLineConceptCheck;
  if (!Concept) throw new Error("BondLineConceptCheck is required");

  var panel = document.getElementById("lessonPanel");
  var phaseLabel = document.getElementById("phaseLabel");
  var status = document.getElementById("statusText");
  var controls = document.getElementById("watchControls");
  var nextBtn = document.getElementById("nextBtn");
  var backBtn = document.getElementById("backBtn");
  var replayBtn = document.getElementById("replayBtn");
  var pauseBtn = document.getElementById("pauseBtn");
  var live = document.getElementById("liveRegion");

  var state = Concept.createState();
  var conceptActive = false;
  var revisitActive = false;
  var routing = false;
  var currentWatchIndex = 7;

  function announce(text) { if (live) live.textContent = text || ""; }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  }
  function setWatchControlVisibility(inConcept) {
    controls.hidden = false;
    replayBtn.hidden = !!inConcept;
    pauseBtn.hidden = !!inConcept;
    backBtn.hidden = false;
    nextBtn.hidden = false;
  }
  function phaseToIndex(phase) {
    var match = /^watch_step_([1-8])$/.exec(phase || "");
    return match ? Number(match[1]) - 1 : null;
  }
  function routeToWatch(phase) {
    var target = phaseToIndex(phase);
    if (target === null) return;
    conceptActive = false;
    revisitActive = false;
    routing = true;
    setWatchControlVisibility(false);
    while (currentWatchIndex > target) {
      backBtn.click();
      currentWatchIndex--;
    }
    while (currentWatchIndex < target) {
      nextBtn.click();
      currentWatchIndex++;
    }
    routing = false;
    revisitActive = true;
    status.textContent = "Review only this relevant Watch visual, then press Next to return to the concept check.";
    announce("Targeted review opened. Press Next when you are ready to retry the concept check.");
  }
  function renderConceptCheck() {
    conceptActive = true;
    revisitActive = false;
    setWatchControlVisibility(true);
    phaseLabel.textContent = "Check · supported concept check";
    status.textContent = "Supported instruction. This does not count as independent or mastery evidence.";
    nextBtn.textContent = "Start Build Together";
    nextBtn.disabled = !state.conceptCheckComplete;
    backBtn.disabled = false;

    var html = '<h1>Quick check before you build</h1>' +
      '<div class="teacher"><div class="teacher-avatar" aria-hidden="true">DM</div><div><div class="teacher-name">Dr. Merissa</div><p>Four quick ideas. Mark each one true or false. If one is shaky, I will take you back to only the Watch visual that fixes that idea, then bring you right back here.</p></div></div>' +
      '<div class="success-box" style="background:#f6f0fb;color:#4a236f">This is still supported learning. Nothing here can award mastery.</div>';

    Concept.CONCEPT_CHECK.items.forEach(function (item, index) {
      var response = state.conceptCheckResponses[index];
      var correct = state.conceptCheckCorrect[index];
      html += '<div class="prompt-card" data-concept-item="' + index + '">' +
        '<div class="eyebrow">Statement ' + (index + 1) + ' of 4</div>' +
        '<h2>' + escapeHtml(item.statement) + '</h2>' +
        '<div class="choice-grid concept-answer-grid" role="group" aria-label="True or false">' +
        '<button type="button" class="choice-btn concept-answer' + (response === true ? ' selected' : '') + '" data-answer="true" aria-pressed="' + (response === true ? 'true' : 'false') + '">True</button>' +
        '<button type="button" class="choice-btn concept-answer' + (response === false ? ' selected' : '') + '" data-answer="false" aria-pressed="' + (response === false ? 'true' : 'false') + '">False</button>' +
        '</div>' +
        (response !== null ? '<div class="' + (correct ? 'success-box' : 'prediction-feedback') + '">' + (correct ? 'Correct.' : 'Review complete. Try this statement again.') + '</div>' : '') +
        '</div>';
    });
    panel.innerHTML = html;

    panel.querySelectorAll("[data-concept-item]").forEach(function (card) {
      var index = Number(card.getAttribute("data-concept-item"));
      card.querySelectorAll("[data-answer]").forEach(function (button) {
        button.addEventListener("click", function () {
          var value = button.getAttribute("data-answer") === "true";
          var result = Concept.submitConceptCheck(state, index, value);
          if (!result.accepted) return;
          announce(result.feedback);
          if (!result.correct) {
            routeToWatch(result.revisitPhase);
            return;
          }
          renderConceptCheck();
        });
      });
    });
  }
  function renderSliceComplete() {
    conceptActive = false;
    revisitActive = false;
    setWatchControlVisibility(true);
    replayBtn.hidden = true;
    pauseBtn.hidden = true;
    phaseLabel.textContent = "Check complete · 4 of 4";
    status.textContent = "Supported concept check complete. No mastery claim has been made.";
    panel.innerHTML = '<h1>Now you build it.</h1>' +
      '<div class="teacher"><div class="teacher-avatar" aria-hidden="true">DM</div><div><div class="teacher-name">Dr. Merissa</div><p>You cleared the four supported ideas. The next screen starts Build Together from a blank canvas with pentane, where you make the decisions and I guide only when needed.</p></div></div>' +
      '<div class="success-box">Concept check complete. Next slice: blank-canvas Build Together with pentane.</div>';
    nextBtn.textContent = "Build Together next";
    nextBtn.disabled = true;
    backBtn.disabled = false;
    announce("Supported concept check complete. Build Together is next.");
  }

  nextBtn.addEventListener("click", function (event) {
    if (routing) return;
    if (revisitActive) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderConceptCheck();
      return;
    }
    if (conceptActive) {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (state.conceptCheckComplete) {
        conceptActive = false;
        if (globalThis.BondLineBuildTogetherUI && typeof globalThis.BondLineBuildTogetherUI.start === "function") globalThis.BondLineBuildTogetherUI.start();
        else renderSliceComplete();
      }
      return;
    }
    if (/Watch\s*·\s*I Do\s*·\s*Step 8/i.test(phaseLabel.textContent) && !nextBtn.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      currentWatchIndex = 7;
      renderConceptCheck();
    }
  }, true);

  backBtn.addEventListener("click", function (event) {
    if (routing) return;
    if (revisitActive) {
      event.preventDefault();
      event.stopImmediatePropagation();
      renderConceptCheck();
      return;
    }
    if (conceptActive) {
      event.preventDefault();
      event.stopImmediatePropagation();
      routeToWatch("watch_step_8");
    }
  }, true);
})();
