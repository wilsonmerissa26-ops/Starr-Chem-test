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
  let changedRepresentation = false;

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
    if (session.state.supported) visual.innerHTML = ReadinessDayEngine.supportVisual(config.day, changedRepresentation);
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
    changedRepresentation = false; session.fresh(current); render(); answer.focus();
  }
  document.querySelectorAll("[data-area-button]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.areaButton).scrollIntoView()));
  document.querySelector("[data-check]").addEventListener("click", () => { const result = session.submit(answer.value, current); if (result.changeRepresentation) { session.state.supported = true; changedRepresentation = true; } result.taught ? teach(result) : show(result); if (result.correct) advance(result); });
  document.querySelector("[data-idk]").addEventListener("click", () => teach(session.submit("I do not know yet", current)));
  document.querySelectorAll("[data-help]").forEach(button => button.addEventListener("click", () => { const help = session.requestHelp(button.dataset.help); if (button.dataset.help === "walkthrough") teach({ reason: help, teaching: current.teaching }); else show(help); }));
  toolbox.insertAdjacentHTML("beforeend", `<div class="card" data-vocabulary-practice><h3>Produce a vocabulary relationship</h3><p>Define a term without choices, then apply its relationship to named species. This evidence never awards day mastery.</p><label>Term <select data-vocab-term>${config.vocabularyEntries.map(entry => `<option value="${entry.term}">${entry.term}</option>`).join("")}</select></label><label>My definition <textarea data-vocab-definition></textarea></label><label>Application to this problem <textarea data-vocab-application></textarea></label><p><button type="button" data-vocab-check>Check production</button><button type="button" data-vocab-idk>Teach this term</button><button type="button" data-vocab-retrieval hidden>Start later no-clue retrieval</button></p><div data-vocab-teaching hidden></div><p data-vocab-feedback role="status"></p></div>`);
  const vocabBox = toolbox.querySelector("[data-vocabulary-practice]");
  const vocabDefinition = vocabBox.querySelector("[data-vocab-definition]");
  const vocabApplication = vocabBox.querySelector("[data-vocab-application]");
  const vocabFeedback = vocabBox.querySelector("[data-vocab-feedback]");
  const vocabTeaching = vocabBox.querySelector("[data-vocab-teaching]");
  const vocabRetrieval = vocabBox.querySelector("[data-vocab-retrieval]");
  let vocabSession;
  function chooseVocabulary() { vocabSession = new ReadinessDayEngine.VocabularySession(config.vocabularyEntries.find(entry => entry.term === vocabBox.querySelector("[data-vocab-term]").value)); vocabFeedback.textContent = "Cold production: definition and application are both required."; vocabTeaching.hidden = true; vocabRetrieval.hidden = true; }
  function checkVocabulary(forceIdk) {
    const result = vocabSession.submit(forceIdk ? "I do not know" : vocabDefinition.value, vocabApplication.value);
    if (result.taught) {
      vocabTeaching.hidden = false; vocabTeaching.innerHTML = `<p>${result.teaching}</p><button type="button" data-vocab-teachback>Hide teaching and begin supported teach-back</button>`;
      vocabFeedback.textContent = "Study the relationship, then hide it before teach-back. A later fresh retrieval is still required.";
      vocabTeaching.querySelector("[data-vocab-teachback]").addEventListener("click", () => { vocabSession.beginTeachBack(); vocabTeaching.hidden = true; vocabDefinition.value = ""; vocabApplication.value = ""; vocabFeedback.textContent = "Teaching hidden. Supported teach-back: produce both parts from memory."; });
    } else if (!result.correct) vocabFeedback.textContent = result.feedback;
    else { vocabFeedback.textContent = result.complete ? "Fresh no-clue vocabulary retrieval complete; no day mastery was awarded." : "Relationship produced, but later fresh no-clue retrieval is required; vocabulary alone is not mastery."; vocabRetrieval.hidden = !result.retrievalPending; }
  }
  vocabBox.querySelector("[data-vocab-term]").addEventListener("change", chooseVocabulary);
  vocabBox.querySelector("[data-vocab-check]").addEventListener("click", () => checkVocabulary(false));
  vocabBox.querySelector("[data-vocab-idk]").addEventListener("click", () => checkVocabulary(true));
  vocabRetrieval.addEventListener("click", () => { vocabSession.beginRetrieval(); vocabDefinition.value = ""; vocabApplication.value = ""; vocabTeaching.hidden = true; vocabRetrieval.hidden = true; vocabFeedback.textContent = "Later no-clue retrieval: produce definition and application again without support."; });
  chooseVocabulary();
  if (!session.state.currentItemId) session.fresh(current);
  render();
})();
