"use strict";
const assert = require("assert");
const fs = require("fs");
const E = require("./readiness-day-engine");
const configs = Object.fromEntries([4,5,6,7,8,9].map(day => [day, require(`./day${day}/day${day}`)]));

function store(records) { return { getItem(key) { return Object.prototype.hasOwnProperty.call(records, key) ? JSON.stringify(records[key]) : null; } }; }

// Frozen-day compatibility is read-only and uses the keys/status shapes those
// runtimes actually persist, rather than inventing astarryia.day1/day3 records.
let frozen = store({
  "dr-merissa-math-evidence-v23": { areas: { logs: { independentCorrect: 2, supportedCorrect: 0 } } },
  "dr-merissa-day3-resonance-v1": { status: "Independent", screen: "mastered" }
});
assert.equal(E.prerequisiteEvidence(1, frozen).complete, true);
assert.equal(E.prerequisiteEvidence(3, frozen).complete, true);
assert.equal(E.prerequisiteEvidence(3, store({ "astarryia.day3.v1": { status: "Transfer" } })).complete, false);
assert.deepEqual(configs[4].prerequisites, [1,3]);
assert(configs[7].prerequisites.includes(3));

// Every fallback explicitly resumes after its contaminated source. This covers
// an ordinary independent item and the terminal transfer without wrapping.
for (const config of Object.values(configs)) {
  const normal = config.items.filter(item => !(item.tags || []).includes("fallback"));
  const byId = Object.fromEntries(config.items.map(item => [item.id, item]));
  normal.filter(item => item.fallbackId).forEach(source => {
    const index = normal.indexOf(source);
    const fallback = byId[source.fallbackId];
    assert(Object.prototype.hasOwnProperty.call(fallback, "nextItemId"), `${fallback.id} has explicit resume metadata`);
    assert.equal(E.nextItem(fallback, normal, byId), normal[index + 1] || null, `${fallback.id} resumes after ${source.id}`);
  });
}
const d6normal = configs[6].items.filter(item => !(item.tags || []).includes("fallback"));
const d6byId = Object.fromEntries(configs[6].items.map(item => [item.id, item]));
let source = d6byId["D6-I-PAIRS"], session = new E.Session(configs[6]);
session.fresh(source); session.requestHelp("hint"); let supported = session.submit(source.answerKey, source);
assert(supported.correct && supported.contaminated);
let fallback = d6byId[source.fallbackId]; session.fresh(fallback); assert(session.submit(fallback.answerKey, fallback).correct);
assert.equal(E.nextItem(fallback, d6normal, d6byId).id, "D6-I-DIRECTION");
const transfer = configs[6].items.find(item => item.stage === "transfer" && !(item.tags || []).includes("fallback"));
session.fresh(transfer); session.requestHelp("walkthrough"); assert(session.submit(transfer.answerKey, transfer).contaminated);
const transferFallback = d6byId[transfer.fallbackId]; session.fresh(transferFallback); assert(session.submit(transferFallback.answerKey, transferFallback).correct);
assert.equal(E.nextItem(transferFallback, d6normal, d6byId), null);

// Correct vocabulary cannot rescue reversed chemical relationships.
assert.equal(E.evaluate("NH4+ is the base, CN- is the acid, HCN is the conjugate base, and NH3 is the conjugate acid.", source.rubric).correct, false);
const roles = d6byId["D6-I-PAIRS"].rubric;
assert.equal(E.evaluate("NH4+ is acid; CN- is base; HCN is conjugate acid; NH3 is conjugate base.", roles).correct, true);
const d7roles = configs[7].items.find(item => item.id === "D7-I-ROLES");
assert.equal(E.evaluate("NH3 is electrophilic because it has a lone pair, while carbon is the nucleophile because C-Cl is polar.", d7roles.rubric).correct, false);
assert.equal(E.evaluate("NH3 is the nucleophile with a lone pair; carbon is electrophilic because C-Cl is polar.", d7roles.rubric).correct, true);

const app = fs.readFileSync("readiness-day-app.js", "utf8");
assert(app.includes("data-vocabulary-practice") && app.includes("data-vocab-definition") && app.includes("data-vocab-application"));
assert(app.includes("Start teach-back (hide answer)") && app.includes("Worked answer hidden"));
assert(app.includes("config.facts.map") && app.includes("support model"));
assert(!app.includes("normalItems[index + 1]"));
console.log("Days 4-9 round-two prerequisite, resume, relation, vocabulary, visual, and teach-back regressions passed");
