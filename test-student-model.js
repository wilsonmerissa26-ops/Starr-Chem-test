/* ============================================================
   BEHAVIORAL ACCEPTANCE TESTS, v2
   Rewritten after five confirmed defects: premature item return
   on IDK, no minimum retrieval interval, restated_explanation as
   the first representation switch, consecutiveWrong never
   resetting, and no actual gate preventing return before a
   prerequisite check passes. All five reproduced with real output
   before being fixed, not assumed.
   Run: node test-student-model.js
   ============================================================ */
var M = require("./student-model-idk-router.js");

var passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { console.log("PASS  " + label); passed++; }
  else { console.log("FAIL  " + label); failed++; }
}

var ALGEBRA_BANK = [
  { id: "alg_A", a:7, b:2, c:3, d:26, x:6, text:"7x+2=3x+26" },
  { id: "alg_B", a:5, b:3, c:2, d:27, x:8, text:"5x+3=2x+27" },
  { id: "alg_C", a:6, b:5, c:4, d:13, x:4, text:"6x+5=4x+13" }
];

console.log("=== TEST 1: IDK opens a gate, it does NOT hand back a next item ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  var r = M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A", "integer_signs");
  assert("handleIdk returns no nextItem field at all", !("nextItem" in r));
  assert("remediation is active", skill.remediation && skill.remediation.active === true);
  assert("prerequisite check has not passed yet", skill.remediation.prerequisiteCheckPassed === false);
  assert("originating item recorded", skill.remediation.originatingItemId === "alg_A");
  assert("required skill recorded", skill.remediation.requiredSkillId === "integer_signs");
}

console.log("\n=== TEST 1a: exitRemediation refuses before the prerequisite check passes ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A");
  var attempt = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("exit is refused with the gate closed", attempt.allowed === false);
  assert("no item is handed back while refused", attempt.nextItem === null);
}

console.log("\n=== TEST 1b: exitRemediation only succeeds once the prerequisite check actually passed ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A");
  M.recordRemediationCheck(skill, false); // she got the smaller check wrong too
  var stillClosed = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("a failed prerequisite check keeps the gate closed", stillClosed.allowed === false);
  M.recordRemediationCheck(skill, true); // now she gets it right
  var opened = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("a passed prerequisite check opens the gate", opened.allowed === true);
  assert("the returned item is not the one she originally left", opened.nextItem.id !== "alg_A");
  assert("remediation closes once exited", skill.remediation.active === false);
}

console.log("\n=== TEST 1f: a remediation gate can only be exited once ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A");
  M.recordRemediationCheck(skill, true);
  var firstExit = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("first exit succeeds after prerequisite check passes", firstExit.allowed === true);
  var secondExit = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("closed remediation cannot be exited a second time", secondExit.allowed === false);
  assert("second exit hands back no additional item", secondExit.nextItem === null);
}

console.log("\n=== TEST 1g: a wrong prerequisite check does something real, and remediation stays open ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A");
  var before = JSON.stringify(skill.remediation);
  var r = M.recordRemediationCheck(skill, false, "prereq_1", 1000);
  assert("a wrong check reports passed:false", r.passed === false);
  assert("a representation is offered on failure", !!r.representation);
  assert("remediation.active remains true, nothing exits on a wrong answer", skill.remediation.active === true);
  assert("prerequisiteCheckPassed stays false explicitly", skill.remediation.prerequisiteCheckPassed === false);
  assert("the attempt is actually recorded, not a no-op", JSON.stringify(skill.remediation) !== before);
  assert("exitRemediation still refuses after a wrong check", M.exitRemediation(skill, ALGEBRA_BANK).allowed === false);

  var r2 = M.recordRemediationCheck(skill, false, "prereq_2", 2000);
  assert("a second wrong check offers a DIFFERENT representation than the first", r2.representation !== r.representation);
  assert("two failures in this remediation cycle trigger the escalation signal", r2.needsEscalation === true);

  var r3 = M.recordRemediationCheck(skill, true, "prereq_3", 3000);
  assert("a subsequent correct check still opens the gate after prior failures", r3.passed === true);
  assert("gate is genuinely open now", M.exitRemediation(skill, ALGEBRA_BANK).allowed === true);
  assert("successful prerequisite check clears the STORED escalation flag, not just the returned one",
    skill.remediation.needsEscalation === false);
}

console.log("\n=== TEST 1h: exhausted bank is explicit and does not close the gate or recycle ===");
{
  var skill = M.createSkill("algebra");
  var twoItemBank = [{ id: "X" }, { id: "Y" }];
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "X");
  M.recordRemediationCheck(skill, true);
  var first = M.exitRemediation(skill, twoItemBank);
  assert("first exit succeeds normally", first.allowed === true && first.nextItem.id === "Y");

  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "Y");
  M.recordRemediationCheck(skill, true);
  var second = M.exitRemediation(skill, twoItemBank); // X and Y both recently seen now
  assert("exhausted bank is refused, not silently recycled", second.allowed === false);
  assert("exhaustion is explicitly labeled, not just a generic refusal", second.reason === "bank_exhausted");
  assert("the item that WOULD be recycled is not handed back", second.nextItem === null);
  assert("remediation stays active on exhaustion, the gate does not silently close on nothing",
    skill.remediation.active === true);
}

console.log("\n=== TEST 1i: nextRemediationCheckItem gives a genuinely different prerequisite item, same exhaustion discipline ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_UNDERSTAND, "alg_A");
  M.recordRemediationCheck(skill, false, "prereq_A");
  var next = M.nextRemediationCheckItem(skill, [{id:"prereq_A"},{id:"prereq_B"}]);
  assert("hands back a different prerequisite item than the one just failed", next.item && next.item.id === "prereq_B");
  M.recordRemediationCheck(skill, false, "prereq_B");
  var exhausted = M.nextRemediationCheckItem(skill, [{id:"prereq_A"},{id:"prereq_B"}]);
  assert("exhausting the prerequisite bank is explicit, not recycled", exhausted.item === null && exhausted.reason === "bank_exhausted");
}

console.log("\n=== TEST 1c: unknown IDK reason is rejected, not silently allowed ===");
{
  var skill = M.createSkill("algebra");
  var threw = false;
  try { M.handleIdk(skill, "something_not_in_v1", "alg_A"); }
  catch (e) { threw = true; }
  assert("unshipped IDK reason throws rather than routing somewhere undefined", threw);
}

console.log("\n=== TEST 1d: at the scaffold ceiling, IDK escalates instead of a same-skill no-op ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill); // scaffoldLevel starts at WORKED (4), the ceiling
  var r = M.handleIdk(skill, M.IDK_REASONS.SHOW_EXAMPLE, "alg_A");
  assert("action escalates to prerequisite regression", r.action === "ESCALATE_TO_PREREQUISITE_REGRESSION");
  assert("ceiling flag set", skill.atScaffoldCeiling === true);
}

console.log("\n=== TEST 1e: with room to add support, scaffold moves toward MORE help, not less ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.moveToGuided(skill); // scaffoldLevel = EXPLICIT (3)
  M.handleIdk(skill, M.IDK_REASONS.SHOW_EXAMPLE, "alg_A");
  assert("scaffold increased toward WORKED, not decreased", skill.scaffoldLevel === M.SCAFFOLD.WORKED);
}

console.log("\n=== TEST 2: representation switch never opens with restated_explanation, and never appears at all ===");
{
  assert("restated_explanation is not in the rotation", M.REPRESENTATIONS.indexOf("restated_explanation") === -1);
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  var first = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("first wrong attempt is targeted feedback, not yet a switch", first.action === "TARGETED_FEEDBACK");
  var second = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("second wrong in a row triggers a representation switch", second.action === "SWITCH_REPRESENTATION");
  assert("the first representation offered is never restated_explanation", second.representation !== "restated_explanation");
}

console.log("\n=== TEST 2a: consecutiveWrong resets after a switch, the new representation gets a real attempt ===");
{
  // Traced precisely before writing this: call 1 feedback, call 2 switches (cw resets
  // to 0), call 3 feedback (first of the new streak), call 4 switches again (second
  // of the new streak). The switch does not require waiting for a call 5.
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  var c1 = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("call 1 is targeted feedback", c1.action === "TARGETED_FEEDBACK");
  var c2 = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("call 2 switches", c2.action === "SWITCH_REPRESENTATION");
  assert("consecutiveWrong reset to 0 immediately after the switch", skill.consecutiveWrong === 0);
  var c3 = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("call 3, first wrong of the new streak, is feedback, not an immediate re-switch", c3.action === "TARGETED_FEEDBACK");
  var c4 = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
  assert("call 4, second wrong of the new streak, switches again on its own two-in-a-row", c4.action === "SWITCH_REPRESENTATION");
  assert("the second switch offers a different representation than the first", c4.representation !== c2.representation);
}

console.log("\n=== TEST 3: exhausting four wrong-streaks never repeats a representation out of order ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  var seen = [];
  for (var cycle = 0; cycle < 4; cycle++) {
    M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
    var r = M.handleWrongAttempt(skill, "alg_A", "sign_error", "alg_A");
    seen.push(r.representation);
  }
  assert("four full switch cycles produce four DIFFERENT representations before any repeat",
    new Set(seen).size === 4);
  assert("none of the four is restated_explanation", seen.indexOf("restated_explanation") === -1);
}

console.log("\n=== TEST 4: mastery requires a real retrieval delay, not back-to-back items ===");
{
  var skill = M.createSkill("algebra");
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "alg_A", true, true, 1000);
  M.recordIndependentAttempt(skill, "alg_B", true, true, 1000 + 60000); // only 1 minute later
  var tooSoon = M.evaluateMastery(skill);
  assert("a second success only 1 minute later is NOT mastery yet", tooSoon.mastered === false);
  assert("the reason names the retrieval delay, not just 'different item'", /minutes later/.test(tooSoon.reason));

  M.recordIndependentAttempt(skill, "alg_C", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  var farEnough = M.evaluateMastery(skill);
  assert("a second success past the minimum delay on a distinct item IS mastery", farEnough.mastered === true);
  assert("state updates to MASTERED", skill.state === M.STATES.MASTERED);
}

console.log("\n=== TEST 4b: legitimate mastery goes stale the moment remediation opens, even after remediation later closes cleanly ===");
{
  var skill = M.createSkill("algebra");
  var bank = [{id:"alg_A"},{id:"alg_B"},{id:"alg_C"},{id:"alg_D"}];

  // 1. Earn real mastery.
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "alg_A", true, true, 1000);
  M.recordIndependentAttempt(skill, "alg_B", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  assert("mastery is genuinely earned first", M.evaluateMastery(skill).mastered === true);

  // 2. Later, real confusion. Remediation opens, runs, and closes cleanly.
  var confusionTime = 500000;
  M.handleIdk(skill, M.IDK_REASONS.DONT_KNOW_START, "alg_C", "some_prereq", confusionTime);
  M.recordRemediationCheck(skill, true, "prereq_1", confusionTime + 1000);
  var exit = M.exitRemediation(skill, bank);
  assert("remediation actually closed successfully", exit.allowed === true);

  // 3. The old evidence must NOT silently restore mastery.
  var afterRemediation = M.evaluateMastery(skill);
  assert("stale pre-confusion evidence no longer counts, even though remediation resolved cleanly",
    afterRemediation.mastered === false);
  assert("the reason reflects needing evidence since the last remediation, not just 'no evidence at all'",
    /since the last time remediation opened/.test(afterRemediation.reason));

  // 4. Fresh post-remediation evidence, properly spaced, DOES restore mastery.
  // handleIdk regressed scaffold away from COLD as part of opening remediation
  // (correctly, that's more support, not less), so it has to be explicitly
  // reset to COLD here to actually test a cold, unscaffolded attempt, same as
  // step 1 did. Missing this the first time made the engine look wrong when
  // it was actually just refusing to count non-cold attempts, correctly.
  var t1 = confusionTime + 10000;
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "alg_C", true, true, t1);
  var tooSoonAgain = M.evaluateMastery(skill);
  assert("one fresh success alone still isn't enough", tooSoonAgain.mastered === false);
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "alg_D", true, true, t1 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  var restored = M.evaluateMastery(skill);
  assert("two genuinely fresh, properly spaced, distinct post-remediation successes DO earn mastery again",
    restored.mastered === true);
}

console.log("\n=== TEST 4c: the input field is actually captured, not silently dropped ===");
{
  var skill = M.createSkill("algebra");
  M.recordAttempt(skill, "alg_A", false, "sign_error", 1000, "x = 2.4");
  assert("input is stored on the attempt", skill.attempts[0].input === "x = 2.4");
  M.recordIndependentAttempt(skill, "alg_B", true, true, 2000, "x = 6");
  assert("input threads through recordIndependentAttempt too", skill.attempts[1].input === "x = 6");
  var noInput = M.createSkill("algebra2");
  M.recordAttempt(noInput, "x", true, null, 1000);
  assert("omitted input stores null, not undefined", noInput.attempts[0].input === null);
}
console.log("\n=== TEST 4a: two successes at scaffold level 3 is still not mastery ===");
{
  var skill = M.createSkill("algebra");
  M.moveToGuided(skill);
  M.recordIndependentAttempt(skill, "alg_A", true, true, 1000);
  M.recordIndependentAttempt(skill, "alg_B", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  var r = M.evaluateMastery(skill);
  assert("scaffold-3 successes never satisfy mastery regardless of timing", r.mastered === false);
}

console.log("\n=== TEST 5: item selection excludes a rolling window, not just the immediately current item ===");
{
  var skill = M.createSkill("algebra");
  var twoItemBank = [{ id: "A" }, { id: "B" }];
  skill.recentlySeenItemIds = ["A", "B"]; // both already seen recently
  var result = M.selectFreshItem(twoItemBank, skill.recentlySeenItemIds);
  assert("a fully exhausted small bank correctly returns null rather than looping A/B forever", result === null);

  var skill2 = M.createSkill("algebra");
  M.startTeaching(skill2);
  M.handleIdk(skill2, M.IDK_REASONS.DONT_UNDERSTAND, "A");
  M.recordRemediationCheck(skill2, true);
  var r1 = M.exitRemediation(skill2, twoItemBank); // should get B
  assert("first exit returns the other item", r1.nextItem.id === "B");
  M.handleIdk(skill2, M.IDK_REASONS.DONT_UNDERSTAND, "B");
  M.recordRemediationCheck(skill2, true);
  var r2 = M.exitRemediation(skill2, twoItemBank); // A and B both now excluded (recently seen + originating)
  assert("second exit does not just bounce back to A once B has also been seen", r2.nextItem === null);
}

console.log("\n=== TEST 6: prerequisite regression is gated end to end ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.DONT_KNOW_START, "alg_A", "reading_negative_numbers");
  assert("state is DEVELOPING while remediation is open", skill.state === M.STATES.DEVELOPING);
  var blocked = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("cannot exit before the prerequisite check passes", blocked.allowed === false);
  var stillNoMastery = M.evaluateMastery(skill);
  assert("no mastery claim is possible mid-remediation", stillNoMastery.mastered === false);
  M.recordRemediationCheck(skill, true);
  var released = M.exitRemediation(skill, ALGEBRA_BANK);
  assert("only after a real recorded success does the gate open", released.allowed === true);
}

console.log("\n=== TEST 6a: active remediation overrides EXISTING qualifying mastery evidence, not just an empty skill ===");
{
  // Test 6 above uses a fresh skill with no evidence, so it can't tell whether
  // the block comes from remediation gating or just from having nothing to
  // claim yet. This is the harder, adversarial version: give the skill real,
  // valid, already-qualifying mastery evidence FIRST, confirm it would pass,
  // THEN open remediation and confirm it stops passing.
  var skill = M.createSkill("algebra");
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "alg_A", true, true, 1000);
  M.recordIndependentAttempt(skill, "alg_B", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);

  var beforeRemediation = M.evaluateMastery(skill);
  assert("the evidence genuinely qualifies on its own", beforeRemediation.mastered === true);

  M.handleIdk(skill, M.IDK_REASONS.DONT_KNOW_START, "alg_C", "reading_negative_numbers");
  var blocked = M.evaluateMastery(skill);
  assert("active remediation overrides pre-existing qualifying evidence", blocked.mastered === false);
  assert("the block explicitly names remediation, not a generic reason", /remediation/i.test(blocked.reason));
  assert("state does not remain MASTERED once remediation reopens", skill.state !== M.STATES.MASTERED);
}

console.log("\n=== TEST 7 (partial): Student Model, including remediation state, survives a JSON round-trip ===");
{
  var skill = M.createSkill("algebra");
  M.startTeaching(skill);
  M.handleIdk(skill, M.IDK_REASONS.SHOW_EXAMPLE, "alg_A", "req_skill");
  M.recordRemediationCheck(skill, true);
  var restored = JSON.parse(JSON.stringify(skill));
  assert("remediation object survives serialization", restored.remediation.originatingItemId === "alg_A");
  assert("prerequisiteCheckPassed survives serialization", restored.remediation.prerequisiteCheckPassed === true);
  console.log("  NOTE: confirms the object shape survives JSON round-trip. Actual");
  console.log("  localStorage wiring happens at integration, not claimed here.");
}

console.log("\n=== SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed > 0) process.exit(1);
