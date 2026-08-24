"use strict";
const assert = require("assert");
const { Session, evaluate, LEVELS } = require("./readiness-day-engine");
const configs = [4,5,6,7,8,9].map(day => require(`./day${day}/day${day}`));
for (const config of configs) {
  const independent = config.items.filter(item => item.stage === "independent" && !(item.tags || []).includes("fallback"));
  assert(independent.length >= config.stopRule, `Day ${config.day} has a satisfiable stop rule`);
  assert(config.items.some(item => item.stage === "transfer"));
  for (const item of config.items) {
    assert(item.prompt && item.answerKey && item.teaching.includes(item.answerKey));
    assert(item.rubric.require.length >= 3, `${item.id} requires multi-part semantic evidence`);
    assert.equal(evaluate("because therefore higher lower electron energy", item.rubric).correct, false, `${item.id} rejects connective-word gaming`);
    if (item.fallbackId) assert(config.items.some(candidate => candidate.id === item.fallbackId));
  }
  const session = new Session(config);
  for (const item of independent.slice(0, config.stopRule)) {
    session.fresh(item);
    assert(session.submit(item.answerKey, item).clean, `${item.id} answer key is accepted cleanly`);
  }
  const transfer = config.items.find(item => item.stage === "transfer" && !(item.tags || []).includes("fallback"));
  session.fresh(transfer); assert(session.submit(transfer.answerKey, transfer).correct);
  assert.equal(session.finish(), LEVELS.TRANSFER);
  const contaminated = new Session(config); contaminated.fresh(independent[0]); contaminated.requestHelp("hint");
  const result = contaminated.submit(independent[0].answerKey, independent[0]);
  assert(result.correct && result.contaminated && !result.clean && independent[0].fallbackId);
}
assert.equal(evaluate("Acetic acid is stronger because its pKa 4.8 is lower", configs[0].items.find(x=>x.id==='D4-I-ACID-STRENGTH').rubric).correct,true);
assert.equal(evaluate("Acetate is stronger because lower pKa means stronger base", configs[0].items.find(x=>x.id==='D4-I-BASE-STRENGTH').rubric).correct,false);
assert.equal(evaluate("Products are favored therefore fast", configs[2].items.find(x=>x.id==='D6-I-EXPLAIN').rubric).correct,false);
assert.equal(evaluate("Products favored and it must be fast", configs[4].items.find(x=>x.id==='D8-I-THERMO').rubric).correct,false);
console.log("Days 4-9 semantic, adversarial, fallback, and stop-rule tests passed");
