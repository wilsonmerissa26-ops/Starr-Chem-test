"use strict";
const assert = require("assert");
const E = require("./readiness-day-engine");
const configs = Object.fromEntries([4, 5, 6, 7, 8, 9].map(day => [day, require(`./day${day}/day${day}`)]));

// Visuals expose inspectable chemistry structures, not a shared labeled-node template.
const proton = E.supportVisualModel(4, false);
assert.deepEqual(proton.transfers[0], { particle: "H+", from: "nh4", to: "h2o" });
assert.deepEqual(proton.products, [{ from: "nh4", becomes: "nh3" }, { from: "h2o", becomes: "h3o" }]);
assert.equal(proton.species.find(species => species.id === "nh4").role, "proton-donor");
assert.equal(proton.species.find(species => species.id === "h2o").role, "proton-acceptor");
const resonance = E.supportVisualModel(5, false);
assert.equal(resonance.contributors.length, 2);
assert.notEqual(resonance.contributors[0].negativeOn, resonance.contributors[1].negativeOn);
assert.deepEqual(resonance.induction.strength, [3, 2, 1]);
const equilibrium = E.supportVisualModel(6, false);
assert(equilibrium.sides.find(side => side.id === equilibrium.equilibrium.favors).acidPka > equilibrium.sides.find(side => side.id !== equilibrium.equilibrium.favors).acidPka);
const flow = E.supportVisualModel(7, false);
assert(flow.arrows.some(arrow => arrow.from === "nh3-lone-pair" && arrow.to === "methyl-carbon" && arrow.action === "bond-formation"));
assert(flow.arrows.some(arrow => arrow.from === "carbon-chloride-bond" && arrow.to === "chloride" && arrow.action === "bond-breaking"));
const energy = E.supportVisualModel(8, false);
const barrier = energy.measures.find(measure => measure.meaning === "activation-barrier");
const freeEnergy = energy.measures.find(measure => measure.meaning === "free-energy-change");
assert.deepEqual([barrier.from, barrier.to], ["reactants", "transitionState"]);
assert.deepEqual([freeEnergy.from, freeEnergy.to], ["reactants", "products"]);
assert(energy.points.transitionState.y < energy.points.reactants.y);

// Alternate support is structurally reorganized while its public chemistry
// relationships remain invariant.
for (const day of [4, 5, 6, 7, 8, 9]) {
  const initial = E.supportVisualModel(day, false), alternate = E.supportVisualModel(day, true);
  assert.notDeepEqual(initial.layout, alternate.layout);
  const stripPresentation = model => { const copy = JSON.parse(JSON.stringify(model)); delete copy.layout; delete copy.representation; return copy; };
  assert.deepEqual(stripPresentation(initial), stripPresentation(alternate));
  assert.notEqual(E.supportVisual(day, false), E.supportVisual(day, true));
}

// A correct generic definition cannot double as application evidence: the current
// problem's authored species and relationship are independently required.
const acid = configs[4].vocabularyEntries.find(entry => entry.term === "acid");
const item = configs[4].items.find(candidate => candidate.id === "D4-G-DONOR");
const context = { itemId: item.id, encounter: 0, applicationRubric: { require: item.rubric.require.slice(0, 2) } };
let vocabulary = new E.VocabularySession(acid);
let result = vocabulary.submit("An acid donates H+.", "An acid donates H+.", context);
assert.equal(result.correct, false);
result = vocabulary.submit("An acid donates H+.", "NH4+ is the acid and donates H+ to water.", context);
assert(result.correct && result.retrievalPending && !result.masteryAwarded);

// Retrieval cannot happen in the same encounter, and the pending gate survives
// the exact serialize/restore cycle used by a browser reload.
const daySession = new E.Session(configs[4]);
daySession.state.vocabulary.acid = { ...vocabulary.state };
const restoredDay = E.Session.restore(configs[4], daySession.serialize());
vocabulary = new E.VocabularySession(acid, restoredDay.state.vocabulary.acid);
assert.equal(vocabulary.beginRetrieval(0), false);
assert(vocabulary.state.retrievalPending && !vocabulary.state.complete);
restoredDay.state.notebook.push({ item: item.id, clean: true, stage: item.stage });
assert.equal(vocabulary.beginRetrieval(restoredDay.state.notebook.length), true);
result = vocabulary.submit("An acid donates H+.", "NH4+ acts as the acid by donating H+ to H2O.", { ...context, encounter: 1 });
assert(result.correct && result.complete && !result.masteryAwarded);
assert.equal(restoredDay.state.independent.length, 0);

// IDK cannot expose retrieval before a successful supported teach-back and one
// later chemistry encounter.
vocabulary = new E.VocabularySession(acid);
result = vocabulary.submit("I do not know", "", context);
assert(result.taught && vocabulary.state.teachbackRequired && !vocabulary.state.retrievalPending);
assert.equal(vocabulary.beginRetrieval(99), false);
vocabulary.beginTeachBack();
assert.equal(vocabulary.beginRetrieval(99), false);
result = vocabulary.submit("An acid donates H+.", "NH4+ is the acid and donates H+ to water.", context);
assert(result.correct && vocabulary.state.teachbackComplete && vocabulary.state.retrievalPending);
assert.equal(vocabulary.beginRetrieval(0), false);
assert.equal(vocabulary.beginRetrieval(1), true);

console.log("Days 4-9 topic-visual, contextual-vocabulary, and delayed-retrieval regressions passed");
