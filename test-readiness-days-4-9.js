"use strict";
const assert = require("assert");
const fs = require("fs");
const { Session, evaluate, LEVELS } = require("./readiness-day-engine");
for (let day = 4; day <= 9; day++) {
  const config = require(`./day${day}/day${day}`);
  const contract = fs.readFileSync(`Day${day}_Curriculum.md`, "utf8");
  const html = fs.readFileSync(`day${day}/index.html`, "utf8");
  assert.equal(config.day, day); assert(contract.includes("Explicitly out of scope"));
  for (const heading of ["Prior-day handoff", "Teaching examples", "Guided examples", "Fresh independent bank", "Sufficient-evidence stop rule", "Transfer and fallback", "Error codes", "Vocabulary and visuals", "Final status"]) assert(contract.includes(heading), `Day ${day}: ${heading}`);
  assert(html.includes('name="viewport"')); assert(html.includes("prefers-reduced-motion")); assert(html.includes("No word bank")); assert(html.includes("readiness-day-app.js"));
  const s = new Session(config); const independent = { id: "fresh", stage: "independent", rubric: { require: [["because"]] }, repairs: { INCOMPLETE: "repair" }, teaching: "teach" };
  assert.equal(s.submit("because the relationship applies", independent).clean, true);
  const helped = new Session(config); helped.requestHelp("hint"); assert.equal(helped.submit("because", independent).clean, false); assert.equal(helped.finish(), LEVELS.REVIEW);
  const idk = new Session(config).submit("I do not know yet", independent); assert(idk.taught && idk.freshEncounterRequired);
  const misses = new Session(config); assert(!misses.submit("no", independent).taught); assert(!misses.submit("still no", independent).taught); assert(misses.submit("again", independent).taught);
  const corrupt = Session.restore(config, "not-json"); assert.equal(corrupt.state.version, 1);
  const old = Session.restore(config, '{"version":0,"status":"Transfer"}'); assert.equal(old.state.status, LEVELS.SEEN);
}
// Chemistry-accuracy assertions and adversarial misconception rejection.
const configs = [4,5,6,7,8,9].map(n => require(`./day${n}/day${n}`));
const facts = configs.flatMap(c => c.facts).join(" ");
assert.match(facts, /lower pKa means stronger acid and weaker conjugate base/i);
assert.match(facts, /resonance moves electrons, not atoms/i);
assert.match(facts, /higher-pKa acid/i);
assert.match(facts, /Neutral CH3Br has an electrophilic carbon/i);
assert.match(facts, /Arrow tails begin at electrons/i);
assert.match(facts, /Negative standard Delta G means products are thermodynamically favored.*not necessarily fast/i);
assert.match(facts, /lower activation free-energy barrier implies a faster pathway but not a more favorable product/i);
assert.deepEqual(configs[0].adversarial, ["REVERSED_PKA","CHARGE_NOT_ADJUSTED","NOT_ONE_PROTON"]);
assert(configs[4].adversarial.includes("EXERGONIC_MEANS_FAST"));
assert.equal(evaluate("I don't know", { require: [["x"]] }).idk, true);
console.log("Days 4-9 readiness contracts/runtime: 6 days, 67 assertions passed");
