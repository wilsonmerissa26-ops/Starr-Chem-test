(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.ReadinessDayEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const LEVELS = Object.freeze({ SEEN: "Seen", GUIDED: "Guided", DEVELOPING: "Developing", INDEPENDENT: "Independent", TRANSFER: "Transfer", REVIEW: "Needs review" });
  const HELP = Object.freeze({ hint: 1, firstStep: 2, walkthrough: 3 });
  const normalize = value => String(value || "").toLowerCase().replace(/[−–—]/g, "-").replace(/[^a-z0-9+-.\s]/g, " ").replace(/\s+/g, " ").trim();
  const has = (text, terms) => terms.some(term => normalize(text).includes(normalize(term)));
  const all = (text, groups) => groups.every(group => has(text, group));

  function evaluate(answer, rubric) {
    const text = normalize(answer);
    if (!text || /^(idk|i don t know|i do not know yet|teach me)$/.test(text)) return { correct: false, idk: true, code: "IDK" };
    if ((rubric.reject || []).some(rule => has(text, rule.terms))) return { correct: false, code: ruleCode(rubric, text) };
    const missing = (rubric.require || []).filter(group => !has(text, group));
    return missing.length ? { correct: false, code: rubric.error || "INCOMPLETE", missing: missing.length } : { correct: true };
  }
  function ruleCode(rubric, text) {
    const rule = (rubric.reject || []).find(item => has(text, item.terms));
    return rule ? rule.code : "CHEMISTRY_CONTRADICTION";
  }

  class Session {
    constructor(config, saved) {
      this.config = config;
      this.state = Object.assign({ version: 1, phase: "lesson", attempts: 0, supported: false, contaminated: false, independent: [], transfer: false, status: LEVELS.SEEN, notebook: [] }, saved || {});
    }
    requestHelp(kind) {
      if (!HELP[kind]) throw new Error("Unknown help kind");
      this.state.supported = true; this.state.contaminated = true;
      return this.config.support[kind];
    }
    submit(answer, item) {
      const result = evaluate(answer, item.rubric);
      if (result.idk) return this.teach(item, "You asked to be taught.");
      if (!result.correct) {
        this.state.attempts += 1; this.state.contaminated = true;
        if (this.state.attempts >= 3) return this.teach(item, "Three unsuccessful explanations reached.");
        return Object.assign(result, { feedback: item.repairs[result.code] || item.repairs.INCOMPLETE, preservedAnswer: answer, changeRepresentation: this.state.attempts > 1 });
      }
      const clean = item.stage === "independent" && !this.state.contaminated;
      if (clean && !this.state.independent.includes(item.id)) this.state.independent.push(item.id);
      if (item.stage === "transfer" && !this.state.contaminated) this.state.transfer = true;
      this.state.status = item.stage === "guided" ? LEVELS.GUIDED : clean ? LEVELS.INDEPENDENT : this.state.transfer ? LEVELS.TRANSFER : LEVELS.DEVELOPING;
      this.state.notebook.push({ item: item.id, clean, stage: item.stage });
      this.state.attempts = 0;
      return { correct: true, clean, status: this.state.status };
    }
    teach(item, reason) {
      this.state.attempts = 0; this.state.supported = true; this.state.contaminated = true;
      return { correct: false, taught: true, reason, teaching: item.teaching, freshEncounterRequired: true };
    }
    fresh(item) { this.state.attempts = 0; this.state.supported = false; this.state.contaminated = false; this.state.phase = item.stage; }
    finish() {
      if (this.state.independent.length >= this.config.stopRule && this.state.transfer) this.state.status = LEVELS.TRANSFER;
      else this.state.status = LEVELS.REVIEW;
      return this.state.status;
    }
    serialize() { return JSON.stringify(this.state); }
    static restore(config, raw) {
      try { const saved = JSON.parse(raw); return new Session(config, saved && saved.version === 1 ? saved : undefined); }
      catch (_) { return new Session(config); }
    }
  }
  return { LEVELS, Session, evaluate, normalize };
});
