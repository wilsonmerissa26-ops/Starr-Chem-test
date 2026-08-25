"use strict";
const assert = require("assert");
const E = require("./readiness-day-engine");
const configs = Object.fromEntries([4,5,6,7,8,9].map(day => [day, require(`./day${day}/day${day}`)]));

// Clause punctuation must preserve role assignments rather than create a bag of words.
const d7 = configs[7].items.find(item => item.id === "D7-I-ROLES");
assert.equal(E.evaluate("NH3 is electrophilic, carbon is nucleophile, NH3 has a lone pair, C-Cl is polar.", d7.rubric).correct, false);
assert.equal(E.evaluate("NH3 is the nucleophile because its lone pair donates; carbon is electrophilic because C-Cl is polar.", d7.rubric).correct, true);
const d6 = configs[6].items.find(item => item.id === "D6-I-PAIRS");
assert.equal(E.evaluate("NH4+ is base; CN- is acid; HCN is conjugate base; NH3 is conjugate acid.", d6.rubric).correct, false);
assert.equal(E.evaluate("NH4+ is the acid, CN- is the base; HCN is the conjugate acid, whereas NH3 is the conjugate base.", d6.rubric).correct, true);

// Vocabulary uses term-specific meaning and application rubrics, preserves work,
// teaches after IDK/three misses, requires hidden teach-back plus fresh retrieval,
// and explicitly cannot award day mastery.
const acid = configs[4].vocabularyEntries.find(entry => entry.term === "acid");
const acidContext = { encounter: 0, applicationRubric: { require: [["nh4+", "ammonium"]] } };
let vocabulary = new E.VocabularySession(acid);
let result = vocabulary.submit("acid acid acid", "This application is nonsense but contains acid and is definitely long enough.", acidContext);
assert.equal(result.correct, false);
assert.equal(result.preservedDefinition, "acid acid acid");
result = vocabulary.submit("A species that donates a proton", "NH4+ is the acid because it donates H+ to water.", acidContext);
assert(result.correct && result.retrievalPending && !result.masteryAwarded);
assert.equal(vocabulary.beginRetrieval(0), false);
assert.equal(vocabulary.beginRetrieval(1), true);
result = vocabulary.submit("It donates H+ to a base", "NH4+ donates its proton, so NH4+ acts as the acid.", { ...acidContext, encounter: 1 });
assert(result.correct && result.complete && !result.masteryAwarded);
vocabulary = new E.VocabularySession(acid);
result = vocabulary.submit("I do not know", "", acidContext);
assert(result.taught && vocabulary.state.supported && vocabulary.state.retrievalPending);
vocabulary.beginTeachBack();
result = vocabulary.submit("It donates a proton", "NH4+ is an acid because it donates H+.", acidContext);
assert(result.correct && !result.complete);
assert.equal(vocabulary.beginRetrieval(0), false);
vocabulary.beginRetrieval(1);
assert.equal(vocabulary.state.supported, false);

// Behavioral visual API returns an actual, topic-specific SVG. A representation
// change reverses the reasoning path, and fresh Session encounters remove support.
for (const day of [4,5,6,7,8,9]) assert.notEqual(E.supportVisualModel(day, false).kind, undefined);
const flow = E.supportVisualModel(7, false);
assert.deepEqual(flow.arrows.map(arrow => [arrow.from, arrow.to, arrow.action]), [["nh3-lone-pair", "methyl-carbon", "bond-formation"], ["carbon-chloride-bond", "chloride", "bond-breaking"]]);
assert.equal(flow.species.find(species => species.id === "nh3").role, "nucleophile");
assert.equal(flow.species.find(species => species.id === "methyl-carbon").role, "electrophile");
const coordinate = E.supportVisualModel(8, false);
assert(coordinate.points.transitionState.y < coordinate.points.reactants.y && coordinate.points.products.y > coordinate.points.reactants.y);
assert.deepEqual(coordinate.measures.map(measure => [measure.from, measure.to, measure.meaning]), [["reactants", "transitionState", "activation-barrier"], ["reactants", "products", "free-energy-change"]]);
let session = new E.Session(configs[7]);
const item = d7;
session.fresh(item);
session.submit("wrong", item);
result = session.submit("still wrong", item);
assert(result.changeRepresentation && session.state.contaminated);
session.state.supported = true;
session.fresh(configs[7].items.find(candidate => candidate.id === item.fallbackId));
assert.equal(session.state.supported, false);

console.log("Days 4-9 final vocabulary, visual/change-representation, and clause-relation regressions passed");
