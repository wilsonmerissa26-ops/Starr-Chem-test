/* ============================================================
   BEHAVIORAL ACCEPTANCE TESTS — corrected
   Run: node test-student-model.js
   ============================================================ */
var M = require("./student-model-idk-router.js");

var passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { console.log("PASS  " + label); passed++; }
  else { console.log("FAIL  " + label); failed++; }
}

var BANK = [
  { id:"alg_A", text:"7x+2=3x+26" },
  { id:"alg_B", text:"5x+3=2x+27" },
  { id:"alg_C", text:"6x+5=4x+13" },
  { id:"alg_D", text:"8x+1=3x+21" }
];

console.log("=== IDK starts remediation and does not jump to a new parent item ===");
{
  var s = M.createSkill("algebra");
  s.scaffoldLevel = M.SCAFFOLD.PARTIAL;
  var r = M.handleIdk(s, M.IDK_REASONS.DONT_UNDERSTAND, BANK, "alg_A", 1000);
  assert("routes to concept reteach", r.action === "CONCEPT_RETEACH");
  assert("does NOT return a parent item immediately", r.nextItem === null);
  assert("remediation gate is active", s.remediation.active === true);
  assert("regression from PARTIAL 2 moves to EXPLICIT 3", s.scaffoldLevel === M.SCAFFOLD.EXPLICIT);
  assert("cannot return before remediation passes", M.canReturnFromRemediation(s) === false);
}

console.log("\n=== Remediation must pass before a fresh parent item is returned ===");
{
  var s = M.createSkill("algebra");
  M.handleIdk(s, M.IDK_REASONS.DONT_KNOW_START, BANK, "alg_A", 1000);
  var rr = M.passRemediationCheck(s, BANK, 2000);
  assert("return is now allowed", rr.canReturn === true);
  assert("fresh item exists", !!rr.nextItem);
  assert("fresh item is not original", rr.nextItem.id !== "alg_A");
  assert("gate records the fresh return item", M.canReturnFromRemediation(s) === true);
}

console.log("\n=== Unknown IDK reason throws ===");
{
  var s = M.createSkill("algebra"), threw = false;
  try { M.handleIdk(s, "not_shipped", BANK, "alg_A"); } catch(e) { threw = true; }
  assert("unknown reason rejected", threw);
}

console.log("\n=== Two wrongs switch representation; counter resets ===");
{
  var s = M.createSkill("algebra");
  s.scaffoldLevel = M.SCAFFOLD.PARTIAL;
  var one = M.handleWrongAttempt(s, "alg_A", "sign_error", BANK);
  var two = M.handleWrongAttempt(s, "alg_A", "sign_error", BANK);
  assert("first wrong = targeted feedback", one.action === "TARGETED_FEEDBACK");
  assert("second wrong = representation switch", two.action === "SWITCH_REPRESENTATION");
  assert("first switch is not a restated explanation", two.representation === "diagram");
  assert("switch does not immediately return another parent item", two.nextItem === null);
  assert("wrong counter resets after intervention", s.consecutiveWrong === 0);
  var three = M.handleWrongAttempt(s, "alg_B", "sign_error", BANK);
  assert("next single wrong gets targeted feedback again", three.action === "TARGETED_FEEDBACK");
}

console.log("\n=== Later switch uses a materially different representation ===");
{
  var s = M.createSkill("algebra");
  M.handleWrongAttempt(s, "alg_A", "x", BANK);
  var sw1 = M.handleWrongAttempt(s, "alg_A", "x", BANK);
  M.handleWrongAttempt(s, "alg_B", "x", BANK);
  var sw2 = M.handleWrongAttempt(s, "alg_B", "x", BANK);
  assert("representation changes", sw2.representation !== sw1.representation);
}

console.log("\n=== Level-3 successes are not mastery ===");
{
  var s = M.createSkill("algebra");
  s.scaffoldLevel = M.SCAFFOLD.EXPLICIT;
  M.recordIndependentAttempt(s, "alg_A", true, true, 1000);
  s.scaffoldLevel = M.SCAFFOLD.EXPLICIT;
  M.recordIndependentAttempt(s, "alg_B", true, true, 2000);
  var r = M.evaluateMastery(s);
  assert("not mastered", r.mastered === false);
  assert("state not MASTERED", s.state !== M.STATES.MASTERED);
}

console.log("\n=== Cold mastery requires a real retrieval delay ===");
{
  var s = M.createSkill("algebra");
  s.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(s, "alg_A", true, true, 1000);
  s.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(s, "alg_B", true, true, 2000);
  var early = M.evaluateMastery(s);
  assert("one-second-apart cold successes are NOT mastery", early.mastered === false);

  s.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(s, "alg_C", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  var later = M.evaluateMastery(s);
  assert("distinct cold success after delay earns mastery", later.mastered === true);
}

console.log("\n=== Same item twice cannot fake mastery ===");
{
  var s = M.createSkill("algebra");
  s.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(s, "alg_A", true, true, 1000);
  s.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(s, "alg_A", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1000);
  assert("same-item repeat rejected for mastery", M.evaluateMastery(s).mastered === false);
}

console.log("\n=== JSON round-trip preserves model state ===");
{
  var s = M.createSkill("algebra");
  M.handleIdk(s, M.IDK_REASONS.SHOW_EXAMPLE, BANK, "alg_A", 1000);
  var copy = JSON.parse(JSON.stringify(s));
  assert("state survives", copy.state === s.state);
  assert("IDK log survives", copy.idkSelections.length === 1);
  assert("remediation gate survives", copy.remediation.active === true);
}

console.log("\n=== SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed) process.exit(1);
