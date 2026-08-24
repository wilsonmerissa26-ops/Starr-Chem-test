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

  // A relation is satisfied only when the named entity and its assigned role
  // occur in the same clause.  This prevents a bag of otherwise-correct words
  // from passing after the learner swaps two chemical roles.
  function relationsHold(text, relations) {
    const clauses = normalize(text).split(/\s*(?:,|;|\.|\bwhile\b|\bwhereas\b|\band\s+(?=(?:the\s+)?[a-z0-9]))\s*/).filter(Boolean);
    return (relations || []).every(relation => clauses.some(clause => has(clause, relation.entity) && has(clause, relation.role)));
  }

  function evaluate(answer, rubric) {
    const text = normalize(answer);
    if (!text || /^(idk|i don t know|i do not know yet|teach me)$/.test(text)) return { correct: false, idk: true, code: "IDK" };
    if ((rubric.reject || []).some(rule => has(text, rule.terms))) return { correct: false, code: ruleCode(rubric, text) };
    const missing = (rubric.require || []).filter(group => !has(text, group));
    if (!missing.length && !relationsHold(text, rubric.relations)) return { correct: false, code: rubric.relationError || "ROLE_RELATION_REVERSED" };
    return missing.length ? { correct: false, code: rubric.error || "INCOMPLETE", missing: missing.length } : { correct: true };
  }
  const PREREQUISITES = Object.freeze({
    1: { key: "dr-merissa-math-evidence-v23", complete: state => !!(state && state.areas && state.areas.logs && state.areas.logs.independentCorrect > 0) },
    3: { key: "dr-merissa-day3-resonance-v1", complete: state => !!(state && state.status === "Independent" && state.screen === "mastered") }
  });
  function prerequisiteEvidence(day, store) {
    const adapter = PREREQUISITES[day] || { key: `astarryia.day${day}.v1`, complete: state => !!(state && (state.status === LEVELS.TRANSFER || state.status === LEVELS.INDEPENDENT)) };
    let state = null;
    try { state = JSON.parse(store.getItem(adapter.key) || "null"); } catch (_) {}
    return { day, key: adapter.key, state, complete: adapter.complete(state) };
  }
  function nextItem(current, normalItems, byId) {
    if ((current.tags || []).includes("fallback")) return current.nextItemId ? byId[current.nextItemId] : null;
    const index = normalItems.findIndex(candidate => candidate.id === current.id);
    return normalItems[index + 1] || null;
  }
  function ruleCode(rubric, text) {
    const rule = (rubric.reject || []).find(item => has(text, item.terms));
    return rule ? rule.code : "CHEMISTRY_CONTRADICTION";
  }

  class Session {
    constructor(config, saved) {
      this.config = config;
      this.state = Object.assign({ version: 1, phase: "lesson", attempts: 0, supported: false, contaminated: false, independent: [], transfer: false, status: LEVELS.SEEN, notebook: [], currentItemId: null, review: [] }, saved || {});
    }
    requestHelp(kind) {
      if (!HELP[kind]) throw new Error("Unknown help kind");
      this.state.supported = true; this.state.contaminated = true;
      return this.config.support[kind];
    }
    submit(answer, item) {
      // The authored key is the canonical complete response. Semantic groups
      // accept natural-language equivalents; this exact-key path also prevents
      // a misconception phrase quoted in a correct negation from being rejected.
      const result = item.answerKey && normalize(answer) === normalize(item.answerKey) ? { correct: true } : evaluate(answer, item.rubric);
      if (result.idk) return this.teach(item, "You asked to be taught.");
      if (!result.correct) {
        this.state.attempts += 1; this.state.contaminated = true;
        if (result.code && !this.state.review.includes(result.code)) this.state.review.push(result.code);
        if (this.state.attempts >= 3) return this.teach(item, "Three unsuccessful explanations reached.");
        return Object.assign(result, { feedback: item.repairs[result.code] || item.repairs.INCOMPLETE, preservedAnswer: answer, changeRepresentation: this.state.attempts > 1 });
      }
      const clean = item.stage === "independent" && !this.state.contaminated;
      if (clean && !this.state.independent.includes(item.id)) this.state.independent.push(item.id);
      if (item.stage === "transfer" && !this.state.contaminated) this.state.transfer = true;
      this.state.status = item.stage === "guided" ? LEVELS.GUIDED : clean ? LEVELS.INDEPENDENT : this.state.transfer ? LEVELS.TRANSFER : LEVELS.DEVELOPING;
      this.state.notebook.push({ item: item.id, clean, stage: item.stage });
      this.state.attempts = 0;
      return { correct: true, clean, contaminated: this.state.contaminated, status: this.state.status };
    }
    teach(item, reason) {
      this.state.attempts = 0; this.state.supported = true; this.state.contaminated = true;
      return { correct: false, taught: true, reason, teaching: item.teaching, freshEncounterRequired: true };
    }
    fresh(item) { this.state.attempts = 0; this.state.supported = false; this.state.contaminated = false; this.state.phase = item.stage; this.state.currentItemId = item.id; }
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
  return { LEVELS, Session, evaluate, normalize, relationsHold, PREREQUISITES, prerequisiteEvidence, nextItem };
});
