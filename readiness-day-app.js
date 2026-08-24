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

  function prerequisiteStatus() {
    return (config.prerequisites || []).map(day => {
      const raw = localStorage.getItem(`astarryia.day${day}.v1`);
      try { return JSON.parse(raw || "null"); } catch (_) { return null; }
    });
  }
  const missing = prerequisiteStatus().map((state, i) => !state || (state.status !== "Transfer" && state.status !== "Independent") ? config.prerequisites[i] : null).filter(Boolean);
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
    notebook.innerHTML = session.state.notebook.length ? session.state.notebook.map(entry => `<li>${entry.item}: ${entry.clean ? "clean" : "supported"} ${entry.stage}</li>`).join("") : "<li>No recorded encounters yet.</li>";
    review.textContent = session.state.review.length ? `Targeted review: ${session.state.review.join(", ")}` : "No targeted repairs queued.";
    summary.textContent = `${session.state.independent.length}/${config.stopRule} clean independent items; transfer ${session.state.transfer ? "complete" : "not yet complete"}; status ${session.state.status}.`;
    save();
  }
  function show(value) {
    output.textContent = typeof value === "string" ? value : value.teaching || value.feedback || (value.correct ? `Recorded as ${value.status}.` : "Try again.");
    render();
  }
  function advance(result) {
    if (result.contaminated && current.fallbackId) current = byId[current.fallbackId];
    else {
      const index = normalItems.findIndex(candidate => candidate.id === current.id);
      current = normalItems[index + 1];
    }
    answer.value = "";
    if (!current) { show(`Day status: ${session.finish()}. Practice has stopped.`); practice.querySelectorAll("button,textarea").forEach(el => el.disabled = true); return; }
    session.fresh(current); render(); answer.focus();
  }
  document.querySelectorAll("[data-area-button]").forEach(button => button.addEventListener("click", () => document.getElementById(button.dataset.areaButton).scrollIntoView()));
  document.querySelector("[data-check]").addEventListener("click", () => { const result = session.submit(answer.value, current); show(result); if (result.correct) advance(result); });
  document.querySelector("[data-idk]").addEventListener("click", () => show(session.submit("I do not know yet", current)));
  document.querySelectorAll("[data-help]").forEach(button => button.addEventListener("click", () => { const help = session.requestHelp(button.dataset.help); show(`${help} ${button.dataset.help === "walkthrough" ? current.teaching : ""}`); }));
  if (!session.state.currentItemId) session.fresh(current);
  render();
})();
