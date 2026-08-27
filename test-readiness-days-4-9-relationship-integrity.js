"use strict";
const assert = require("assert");
const E = require("./readiness-day-engine");
const curricula = require("./readiness-day-curricula");
const items = Object.values(curricula).flatMap(config => config.items || []);
const byId = Object.fromEntries(items.map(item => [item.id, item]));

// The complete bank is explicitly audited. Relationship-dependent prompts may
// not silently fall back to an unordered bag of words.
assert.equal(items.length, 56);
for (const item of items) {
  assert(item.relationshipAudit, `${item.id} has an audit classification`);
  assert(["relations", "simple"].includes(item.relationshipAudit.classification));
  if (item.relationshipAudit.classification === "relations") {
    assert(item.rubric.relations.length, `${item.id} has an enforced guard`);
    assert(item.relationshipAudit.relationships.length, `${item.id} records all audited associations`);
  } else assert(item.relationshipAudit.reason, `${item.id} explains its exception`);
}

function submit(id, answer) {
  const item = byId[id];
  const session = new E.Session(curricula[Number(id[1])]);
  session.fresh(item);
  return session.submit(answer, item);
}
const attacks = {
  "D4-G-DONOR": "NH4+ is the base and accepts H+; H2O is the acid and donates H+.",
  "D5-I-ATOM": "Methoxide is less stable on electronegative oxygen; amide is more stable, so methanol is the stronger acid.",
  "D6-I-DIRECTION": "Reactants are not favored; HCN is the higher pKa weaker acid and acetate is the weaker base.",
  "D9-I-EQUILIBRIUM-FLOW": "Reactants are not favored although methanol is the higher pKa weaker acid; CN- is nucleophile, carbon is electrophilic, C-C bond forms and C-Br bond goes to bromine."
};
for (const [id, answer] of Object.entries(attacks)) {
  const result = submit(id, answer);
  assert.equal(result.correct, false, `${id} rejects its reproduced relationship attack`);
  assert.equal(result.code, "ROLE_RELATION_REVERSED", `${id} fails for the relationship, not missing vocabulary`);
  assert(submit(id, byId[id].answerKey).correct, `${id} still accepts its chemistry key through Session.submit()`);
}

// Permanent known-good guards: swapped assignments fail, while reasonable
// natural-language variants pass through the learner-facing path.
assert.equal(submit("D6-I-PAIRS", "NH4+ is the base; CN- is the acid; HCN is the conjugate base; NH3 is the conjugate acid.").correct, false);
assert(submit("D6-I-PAIRS", "Ammonium acts as acid, cyanide as base. HCN is their conjugate acid and ammonia is the conjugate base.").correct);
assert.equal(submit("D7-I-ROLES", "NH3 is electrophilic because it has a lone pair; carbon is the nucleophile because C-Cl is polar.").correct, false);
assert(submit("D7-I-ROLES", "Ammonia is the nucleophile because its lone pair donates; the polarized C-Cl carbon is electrophilic.").correct);

// Required attack categories are represented by real bank items. Each response
// contains the expected vocabulary but assigns the conclusion incorrectly.
const categoryAttacks = [
  ["D4-G-DONOR", attacks["D4-G-DONOR"]], // acid/base swap
  ["D6-I-PAIRS", "NH4+ is acid; CN- is base; HCN is conjugate base; NH3 is conjugate acid."],
  ["D5-I-ATOM", attacks["D5-I-ATOM"]], // stability and acid-strength reversal
  ["D4-I-BASE-STRENGTH", "Acetate is the stronger base and ethoxide the weaker base because pKa 16 is higher than 4.8."],
  ["D6-I-DIRECTION", attacks["D6-I-DIRECTION"]],
  ["D7-I-ROLES", "NH3 is electrophilic with a lone pair; carbon is nucleophile in the polar C-Cl bond."],
  ["D7-I-SOURCE", "Carbon is the electron source and arrow tail; oxygen lone pair is the destination and arrow head, forming the C-O bond."],
  ["D7-I-ARROWS", "The C-Br bond forms while the oxygen lone pair breaks the C-O bond; bromine preserves carbon valence and octet."],
  ["D8-I-CONTRAST", "Negative -40 delta G means a high 150 activation barrier and slow kinetics; the barrier means products are thermodynamically favored."],
  ["D9-I-ENERGY", "Delta G -25 means a slow product; the 85 barrier means products are favored despite the high barrier."],
  ["D6-F-DIRECTION", "Products are not favored; NH3 is the higher pKa 38 weaker acid."],
  ["D7-T-CYANIDE", "CN- is not the nucleophile; carbon is electrophilic, its electron pair forms C-C, and C-Cl bond breaks to Cl-."],
  ["D9-I-EQUILIBRIUM-FLOW", attacks["D9-I-EQUILIBRIUM-FLOW"]]
];
for (const [id, answer] of categoryAttacks) assert.equal(submit(id, answer).correct, false, `${id} rejects adversarial assignment`);

console.log(`Days 4-9 relationship integrity: ${items.length} items audited; adversarial assignments rejected`);
