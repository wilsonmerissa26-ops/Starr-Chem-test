(function () {
  "use strict";
  const match = location.pathname.match(/day(\d+)/); if (!match) return;
  const config = globalThis[`Day${match[1]}Config`]; if (!config || !globalThis.ReadinessDayEngine) return;
  const savedRaw = localStorage.getItem(config.storageKey);
  const session = ReadinessDayEngine.Session.restore(config, savedRaw);
  const normalItems = config.items.filter(candidate => !(candidate.tags || []).includes("fallback"));
  const byId = Object.fromEntries(config.items.map(candidate => [candidate.id, candidate]));
  let current = byId[session.state.currentItemId] || normalItems[0];
  const answer = document.querySelector("textarea");
  const prompt = document.querySelector("[data-item-prompt]");
  const meta = document.querySelector("[data-item-meta]");
  const output = document.querySelector("[data-feedback]");
  const visual = document.querySelector("[data-support-only]");
  const notebook = document.querySelector("[data-notebook]");
  const review = document.querySelector("[data-review]");
  const summary = document.querySelector("[data-summary]");
  const practice = document.querySelector("[data-practice]");
  const toolbox = document.getElementById("toolbox");

  function prerequisiteStatus() {
    return (config.prerequisites || []).map(day => ReadinessDayEngine.prerequisiteEvidence(day, localStorage));
  }
  const missing = prerequisiteStatus().filter(evidence => !evidence.complete).map(evidence => evidence.day);
  if (missing.length) {
    practice.hidden = true;
    output.textContent = `Prerequisite evidence is missing for Day ${missing.join(", Day ")}. Open Review for that day before beginning cold proof.`;
    review.textContent = `Review route: Day ${missing.join(", Day ")}. Earlier completed days are not reset.`;
  }

  function save() { localStorage.setItem(config.storageKey, session.serialize()); }
  function render() {
    prompt.textContent = current.prompt;
    meta.textContent = `${current.stage === "guided" ? "Guided practice" : current.stage === "transfer" ? "Cold transfer" : "Cold independent proof"} · ${current.id}`;
    visual.hidden = !session.state.supported;
    if (session.state.supported) visual.innerHTML = `<strong>${config.title} support model</strong><p>${current.prompt}</p><ol>${config.facts.map(fact => `<li>${fact}</li>`).join("")}</ol><p>Use the model to trace the named proton, electron pair, stability, or energy relationship. It will disappear on fresh proof.</p>`;
    notebook.innerHTML = session.state.notebook.length ? session.state.notebook.map(entry => `<li>${entry.item}: ${entry.clean ? "clean" : "supported"} ${entry.stage}</li>`).join("") : "<li>No recorded encounters yet.</li>";
    review.textContent = session.state.review.length ? `Targeted review: ${session.state.review.join(", ")}` : "No targeted repairs queued.";
    summary.textContent = `${session.state.independent.length}/${config.stopRule} clean independent items; transfer ${session.state.transfer ? "complete" : "not yet complete"}; status ${session.state.status}.`;
    save();
  }
  function show(value) {
    output.textContent = typeof value === "string" ? value : value.teaching || value.feedback || (value.correct ? `Recorded as ${value.status}.` : "Try again.");
    render();
  }
  function beginTeachBack() {
    output.textContent = "Worked answer hidden. Explain this same application from memory now. This is supported teach-back, not mastery proof.";
    answer.disabled = false; answer.value = ""; answer.focus(); render();
  }
  function teach(result) {
    output.innerHTML = `<p>${result.reason || "Direct teaching requested"}</p><p>${result.teaching}</p><button type="button" data-teach-back>Start teach-back (hide answer)</button>`;
    answer.disabled = true; render();
    output.querySelector("[data-teach-back]").addEventListener("click", beginTeachBack);
  }
  function advance(result) {
    if (result.contaminated && current.fallbackId) current = byId[current.fallbackId];
    else current = ReadinessDayEngine.nextItem(current, normalItems, byId);
    answer.value = "";
    if (!current) { show(`Day status: ${session.finish()}. Practice has stopped.`); practice.querySelectorAll("button,textarea").forEach(el => el.disabled = true); return; }
    session.fresh(current); render(); answer.focus();
  }
  document.querySelectorAll("[data-area-button]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.areaButton).scrollIntoView()));
  document.querySelector("[data-check]").addEventListener("click", () => { const result = session.submit(answer.value, current); result.taught ? teach(result) : show(result); if (result.correct) advance(result); });
  document.querySelector("[data-idk]").addEventListener("click", () => teach(session.submit("I do not know yet", current)));
  document.querySelectorAll("[data-help]").forEach(button => button.addEventListener("click", () => { const help = session.requestHelp(button.dataset.help); if (button.dataset.help === "walkthrough") teach({ reason: help, teaching: current.teaching }); else show(help); }));
  toolbox.insertAdjacentHTML("beforeend", `<div class="card" data-vocabulary-practice><h3>Produce a vocabulary relationship</h3><p>Choose a term, define it without choices, then apply it to the current exercise.</p><label>Term <select data-vocab-term>${config.vocabulary.map(term => `<option>${term}</option>`).join("")}</select></label><label>My definition <textarea data-vocab-definition></textarea></label><label>Application to this problem <textarea data-vocab-application></textarea></label><button type="button" data-vocab-check>Check production</button><p data-vocab-feedback role="status"></p></div>`);
  toolbox.querySelector("[data-vocab-check]").addEventListener("click", () => { const term = toolbox.querySelector("[data-vocab-term]").value.toLowerCase(); const definition = toolbox.querySelector("[data-vocab-definition]").value.toLowerCase(); const application = toolbox.querySelector("[data-vocab-application]").value.trim(); const feedback = toolbox.querySelector("[data-vocab-feedback]"); feedback.textContent = definition.includes(term) && application.length >= 20 ? "Production recorded. Now use the relationship in the chemistry response; vocabulary work alone is not mastery evidence." : "Not yet: define the selected term explicitly and apply it in a complete sentence. No definition is revealed during this cold attempt."; });
  if (!session.state.currentItemId) session.fresh(current);
  render();
})();
