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
    const rels = relations || [];
    // First preserve hard clause boundaries. Then split "and" only when it
    // actually introduces another audited entity. This keeps separate role
    // assignments apart without breaking a valid predicate such as
    // "the barrier is high and makes the reaction slow."
    const entityTerms = rels.flatMap(relation => relation.entity || []).map(normalize).filter(term => term.length > 1);
    const beginsWithEntity = value => {
      const clause = normalize(value).replace(/^the\s+/, "");
      return entityTerms.some(term => clause === term || clause.startsWith(`${term} `) || clause.startsWith(`${term}s `));
    };
    const clauses = [];
    String(text || "").split(/\s*(?:[,;.]|\bwhile\b|\bwhereas\b)\s*/i).forEach(segment => {
      const chunks = segment.split(/\s+\band\b\s+/i);
      let current = chunks.shift() || "";
      chunks.forEach(chunk => {
        if (beginsWithEntity(chunk)) {
          if (normalize(current)) clauses.push(normalize(current));
          current = chunk;
        } else current += ` and ${chunk}`;
      });
      if (normalize(current)) clauses.push(normalize(current));
    });
    return rels.every(relation => clauses.some(clause => {
      if (!has(clause, relation.entity) || !has(clause, relation.role)) return false;
      // A role word inside an explicit denial is not evidence for that role.
      // Keep this local to relational clauses so legitimate explanations such
      // as "pKa predicts equilibrium, not rate" remain available elsewhere.
      const words = clause.split(/\s+/);
      const denied = words.some(word => ["not", "isnt", "isn't", "doesnt", "doesn't", "cannot", "never"].includes(word));
      return !denied;
    }));
  }

  // The model is intentionally public: tests and assistive renderers can inspect
  // chemical relationships instead of trusting captions or label strings.
  function supportVisualModel(day, changed) {
    const models = {
      4: { kind: "proton-transfer-pka", species: [{ id: "nh4", side: "reactant", role: "proton-donor", charge: 1 }, { id: "h2o", side: "reactant", role: "proton-acceptor", charge: 0 }, { id: "nh3", side: "product", role: "conjugate-base", charge: 0 }, { id: "h3o", side: "product", role: "conjugate-acid", charge: 1 }], transfers: [{ particle: "H+", from: "nh4", to: "h2o" }], products: [{ from: "nh4", becomes: "nh3" }, { from: "h2o", becomes: "h3o" }], scale: { property: "pKa", lowMeans: "stronger-acid", highMeans: "weaker-acid" } },
      5: { kind: "resonance-induction", contributors: [{ negativeOn: "left-O" }, { negativeOn: "right-O" }], resonance: { moves: "electrons", fixed: "atoms" }, induction: { through: "sigma-bonds", strength: [3, 2, 1] } },
      6: { kind: "acid-base-equilibrium", sides: [{ id: "reactants", acidPka: 4 }, { id: "products", acidPka: 10 }], equilibrium: { favors: "products", criterion: "higher-acid-pKa" } },
      7: { kind: "substitution-electron-flow", species: [{ id: "nh3", role: "nucleophile", lonePair: true }, { id: "methyl-carbon", role: "electrophile", bondedTo: "chloride" }, { id: "chloride", role: "leaving-group" }], arrows: [{ from: "nh3-lone-pair", to: "methyl-carbon", action: "bond-formation" }, { from: "carbon-chloride-bond", to: "chloride", action: "bond-breaking" }] },
      8: { kind: "reaction-coordinate", points: { reactants: { x: 55, y: 150 }, transitionState: { x: 210, y: 35 }, products: { x: 370, y: 185 } }, measures: [{ id: "delta-g-dagger", from: "reactants", to: "transitionState", meaning: "activation-barrier" }, { id: "delta-g", from: "reactants", to: "products", meaning: "free-energy-change" }] },
      9: { kind: "integrated-map", links: [{ from: "resonance-stability", to: "acid-base" }, { from: "electron-source", to: "bond-change" }, { from: "delta-g", to: "favorability" }, { from: "delta-g-dagger", to: "rate" }] }
    };
    const model = JSON.parse(JSON.stringify(models[day] || models[9]));
    model.representation = changed ? "alternate" : "initial";
    // Layout is presentation state, while the chemistry objects above remain
    // invariant. Alternate support must reorganize the relationship rather than
    // merely relabel the same drawing.
    model.layout = changed ? { direction: "vertical", encoding: day === 8 ? "energy-bars" : "role-columns" } : { direction: "horizontal", encoding: day === 8 ? "coordinate-curve" : "reaction-path" };
    return model;
  }
  function supportVisual(day, changed) {
    const m = supportVisualModel(day, changed), marker = `<defs><marker id="chem-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z"/></marker></defs>`;
    let body;
    if (day === 4) body = changed
      ? `<g data-layout="role-columns"><text x="35" y="35">donor NH₄⁺</text><text x="35" y="165">product NH₃</text><text x="300" y="35">acceptor H₂O</text><text x="300" y="165">product H₃O⁺</text><path data-particle="H+" data-from="nh4" data-to="h2o" d="M115 45 Q230 105 300 45" marker-end="url(#chem-arrow)"/><path data-becomes="nh3" d="M75 50 V140" marker-end="url(#chem-arrow)"/><path data-becomes="h3o" d="M345 50 V140" marker-end="url(#chem-arrow)"/></g>`
      : `<g data-layout="reaction-path"><text x="25" y="65">NH₄⁺ + H₂O</text><path data-particle="H+" data-from="nh4" data-to="h2o" d="M75 48 Q115 5 150 48" marker-end="url(#chem-arrow)"/><path data-reaction="equilibrium" d="M175 58 H285" marker-end="url(#chem-arrow)"/><text x="310" y="65">NH₃ + H₃O⁺</text><line data-scale="pka" x1="35" y1="120" x2="480" y2="120"/><text x="35" y="145">low pKa: stronger acid</text><text x="350" y="145">high pKa: weaker acid</text></g>`;
    else if (day === 5) body = `<text x="25" y="60">⁻O—C=O</text><path data-action="electron-delocalization" d="M125 45 Q180 5 235 45" marker-end="url(#chem-arrow)"/><text x="250" y="60">O=C—O⁻</text><g data-through="sigma-bonds"><line x1="40" y1="120" x2="280" y2="120"/><circle cx="80" cy="120" r="14"/><circle cx="160" cy="120" r="9"/><circle cx="235" cy="120" r="5"/></g>`;
    else if (day === 6) body = `<g data-side="reactants"><text x="25" y="65">acid pKa 4 + base</text></g><path data-equilibrium-favors="products" d="M170 55 H310" marker-end="url(#chem-arrow)"/><g data-side="products"><text x="330" y="65">acid pKa 10 + base</text><rect x="320" y="85" width="190" height="18"/></g>`;
    else if (day === 7) body = changed
      ? `<g data-layout="role-columns"><g data-species="nh3" data-role="nucleophile"><text x="45" y="35">H₃N:</text><circle data-electron-source="lone-pair" cx="105" cy="25" r="4"/></g><g data-species="methyl-carbon" data-role="electrophile"><text x="45" y="145">CH₃—Cl</text><line data-bond="carbon-chloride" x1="90" y1="137" x2="125" y2="137"/></g><path data-from="nh3-lone-pair" data-to="methyl-carbon" data-action="bond-formation" d="M105 30 C180 55 180 105 90 130" marker-end="url(#chem-arrow)"/><path data-from="carbon-chloride-bond" data-to="chloride" data-action="bond-breaking" d="M108 132 C210 105 300 105 390 132" marker-end="url(#chem-arrow)"/><text x="410" y="145">Cl⁻</text><text x="250" y="45">new N—C bond</text></g>`
      : `<g data-layout="reaction-path"><g data-species="nh3" data-role="nucleophile"><text x="25" y="80">H₃N:</text><circle data-electron-source="lone-pair" cx="88" cy="68" r="4"/></g><g data-species="methyl-carbon" data-role="electrophile"><text x="250" y="80">CH₃—Cl</text><line data-bond="carbon-chloride" x1="294" y1="72" x2="330" y2="72"/></g><path data-from="nh3-lone-pair" data-to="methyl-carbon" data-action="bond-formation" d="M92 65 Q165 5 250 62" marker-end="url(#chem-arrow)"/><path data-from="carbon-chloride-bond" data-to="chloride" data-action="bond-breaking" d="M310 68 Q365 15 405 62" marker-end="url(#chem-arrow)"/><text x="420" y="80">Cl⁻</text></g>`;
    else if (day === 8) body = changed
      ? `<g data-layout="energy-bars"><line data-level="reactants" x1="55" y1="150" x2="180" y2="150"/><line data-level="transition-state" x1="210" y1="35" x2="335" y2="35"/><line data-level="products" x1="365" y1="185" x2="490" y2="185"/><path data-measure="delta-g-dagger" data-from="reactants" data-to="transition-state" d="M195 150 V35" marker-end="url(#chem-arrow)"/><path data-measure="delta-g" data-from="reactants" data-to="products" d="M510 150 V185" marker-end="url(#chem-arrow)"/></g>`
      : `<g data-layout="coordinate-curve"><path data-curve="reaction-coordinate" d="M55 150 C120 150 135 35 210 35 S300 185 370 185"/><line data-level="reactants" x1="35" y1="150" x2="90" y2="150"/><line data-level="transition-state" x1="185" y1="35" x2="235" y2="35"/><line data-level="products" x1="345" y1="185" x2="400" y2="185"/><path data-measure="delta-g-dagger" data-from="reactants" data-to="transition-state" d="M105 150 V35" marker-end="url(#chem-arrow)"/><path data-measure="delta-g" data-from="reactants" data-to="products" d="M420 150 V185" marker-end="url(#chem-arrow)"/></g>`;
    else body = m.links.map((link, i) => `<path data-from="${link.from}" data-to="${link.to}" d="M${30+i*105} 110 Q${65+i*105} 35 ${100+i*105} 110" marker-end="url(#chem-arrow)"/>`).join("");
    if (changed && ![4, 7, 8].includes(day)) body = `<g data-layout="role-columns" transform="translate(520 0) scale(-1 1)">${body}</g>`;
    return `<figure class="topic-visual" data-day="${day}" data-kind="${m.kind}" data-representation="${m.representation}"><svg viewBox="0 0 540 210" role="img" aria-label="Topic-specific chemistry support">${marker}${body}</svg><figcaption>${changed ? "Alternate representation for the same chemical relationships." : "Trace the encoded chemical relationships."}</figcaption></figure>`;
  }

  class VocabularySession {
    constructor(entry, saved) { this.entry = entry; this.state = Object.assign({ attempts: 0, mode: "production", supported: false, teachbackRequired: false, teachbackComplete: false, retrievalPending: false, retrievalEligibleAfter: null, complete: false }, saved || {}); }
    submit(definition, application, context) {
      const idk = /^(idk|i don t know|i do not know|teach me)$/i.test(normalize(definition));
      const definitionResult = evaluate(definition, this.entry.definitionRubric);
      const applicationResult = evaluate(application, this.entry.applicationRubric);
      const contextResult = context && context.applicationRubric ? evaluate(application, context.applicationRubric) : { correct: false };
      if (idk || !definitionResult.correct || !applicationResult.correct || !contextResult.correct) {
        this.state.attempts += 1;
        if (idk || this.state.attempts >= 3) return this.teach(definition, application);
        return { correct: false, preservedDefinition: definition, preservedApplication: application, feedback: !definitionResult.correct ? this.entry.definitionFeedback : this.entry.applicationFeedback };
      }
      this.state.attempts = 0;
      if (this.state.mode === "retrieval" && !this.state.supported) this.state.complete = true;
      else { this.state.teachbackComplete = this.state.mode === "teachback"; this.state.teachbackRequired = false; this.state.retrievalPending = true; this.state.retrievalEligibleAfter = (context.encounter || 0) + 1; }
      return { correct: true, complete: this.state.complete, retrievalPending: this.state.retrievalPending, masteryAwarded: false };
    }
    teach(definition, application) {
      this.state.attempts = 0; this.state.mode = "teaching"; this.state.supported = true; this.state.teachbackRequired = true; this.state.teachbackComplete = false; this.state.retrievalPending = false; this.state.retrievalEligibleAfter = null;
      return { correct: false, taught: true, teaching: this.entry.teaching, preservedDefinition: definition, preservedApplication: application };
    }
    beginTeachBack() { this.state.mode = "teachback"; this.state.supported = true; }
    beginRetrieval(encounter) { if (this.state.teachbackRequired || !this.state.retrievalPending || this.state.retrievalEligibleAfter == null || encounter < this.state.retrievalEligibleAfter) return false; this.state.mode = "retrieval"; this.state.supported = false; this.state.retrievalPending = false; return true; }
  }

  function evaluate(answer, rubric) {
    const text = normalize(answer);
    if (!text || /^(idk|i don t know|i do not know yet|teach me)$/.test(text)) return { correct: false, idk: true, code: "IDK" };
    if ((rubric.reject || []).some(rule => has(text, rule.terms))) return { correct: false, code: ruleCode(rubric, text) };
    const missing = (rubric.require || []).filter(group => !has(text, group));
    if (!missing.length && !relationsHold(answer, rubric.relations)) return { correct: false, code: rubric.relationError || "ROLE_RELATION_REVERSED" };
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
  function rubricForItem(item) {
    const audited = item && item.relationshipAudit && item.relationshipAudit.classification === "relations" && Array.isArray(item.relationshipAudit.relationships) && item.relationshipAudit.relationships.length
      ? item.relationshipAudit.relationships
      : null;
    return audited ? Object.assign({}, item.rubric, { relations: audited }) : item.rubric;
  }

  class Session {
    constructor(config, saved) {
      this.config = config;
      this.state = Object.assign({ version: 1, phase: "lesson", attempts: 0, supported: false, contaminated: false, independent: [], transfer: false, status: LEVELS.SEEN, notebook: [], currentItemId: null, review: [], vocabulary: {} }, saved || {});
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
      const rubric = rubricForItem(item);
      const result = item.answerKey && normalize(answer) === normalize(item.answerKey) ? { correct: true } : evaluate(answer, rubric);
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
  return { LEVELS, Session, VocabularySession, evaluate, normalize, relationsHold, rubricForItem, supportVisualModel, supportVisual, PREREQUISITES, prerequisiteEvidence, nextItem };
});
