/*
 * RED/GREEN compatibility gate for the first Unit 1 vertical slice.
 *
 * This test protects both the six-way router extension and the evidence
 * registry invariants that keep prerequisite probes from being mistaken for
 * stronger evidence than they actually are.
 */
"use strict";

var M = require("./student-model-idk-router.js");
var R = require("./unit1-skill-registry.js");

var passed = 0;
var failed = 0;
function check(label, condition) {
  if (condition) {
    passed += 1;
    console.log("PASS  " + label);
  } else {
    failed += 1;
    console.log("FAIL  " + label);
  }
}

function safeIdk(reason, requiredSkillId) {
  var skill = M.createSkill("chem.representation.bond_line");
  M.startTeaching(skill);
  M.moveToGuided(skill); // leave room to add support; do not trigger legacy ceiling behavior
  try {
    var result = M.handleIdk(skill, reason, "BL-I1", requiredSkillId || null, 1000);
    return { threw: false, result: result, skill: skill };
  } catch (error) {
    return { threw: true, error: error, skill: skill };
  }
}

function recordFor(skillId, itemId, evidenceKind) {
  return {
    lessonId: "chm221.u1.01",
    skillId: skillId,
    itemId: itemId,
    evidenceKind: evidenceKind,
    scaffoldLevel: 0,
    supported: false,
    correct: true,
    timestamp: 1000
  };
}

console.log("=== REGISTRY INVARIANTS ===");
{
  var lesson = R.getLesson("chm221.u1.01");
  check("Bond-Line lesson ID is distinct from its primary skill ID",
    !!lesson && lesson.lessonId !== lesson.primarySkillId);
  check("Bond-Line primary skill is registered",
    !!R.getSkill("chem.representation.bond_line"));
  check("carbon-valence gate skill is explicitly probe-only for this slice",
    R.getSkill("chem.bonding.carbon_valence_four").mayAwardMasteryByItself === false);
  check("covalent-bond gate skill is explicitly probe-only for this slice",
    R.getSkill("chem.bonding.covalent_bond_meaning").mayAwardMasteryByItself === false);

  var gateRecord = recordFor(
    "chem.bonding.carbon_valence_four",
    "BL-P1",
    R.EVIDENCE_KINDS.PROBE
  );
  check("a clean prerequisite probe is valid gate evidence",
    R.validateEvidenceRecord(gateRecord).valid === true);
  check("a clean prerequisite probe still cannot award mastery",
    R.canEvidenceAwardMastery(gateRecord) === false);

  var invalidCarbonGuided = recordFor(
    "chem.bonding.carbon_valence_four",
    "BL-P1-guided",
    R.EVIDENCE_KINDS.GUIDED
  );
  var invalidBondIndependent = recordFor(
    "chem.bonding.covalent_bond_meaning",
    "BL-P2-independent",
    R.EVIDENCE_KINDS.INDEPENDENT
  );
  check("carbon-valence gate rejects guided evidence for a probe-only skill",
    R.validateEvidenceRecord(invalidCarbonGuided).valid === false &&
    R.validateEvidenceRecord(invalidCarbonGuided).reason === "evidence_kind_not_allowed_for_skill");
  check("covalent-bond gate rejects independent evidence for a probe-only skill",
    R.validateEvidenceRecord(invalidBondIndependent).valid === false &&
    R.validateEvidenceRecord(invalidBondIndependent).reason === "evidence_kind_not_allowed_for_skill");

  var primarySingleCold = recordFor(
    "chem.representation.bond_line",
    "BL-I1",
    R.EVIDENCE_KINDS.INDEPENDENT
  );
  check("one clean cold Bond-Line record cannot award mastery by itself",
    R.canEvidenceAwardMastery(primarySingleCold) === false);
}

console.log("\n=== SIX-WAY UNIT 1 IDK CONTRACT ===");
{
  var required = [
    ["DONT_UNDERSTAND", "dont_understand_concept", "CONCEPT_RETEACH"],
    ["DONT_KNOW_START", "dont_know_how_to_start", "MODEL_FIRST_DECISION"],
    ["FORGOT_PREREQUISITE", "forgot_prerequisite", "PREREQUISITE_REGRESSION"],
    ["STARTED_STUCK", "started_but_stuck", "RESUME_FROM_STUCK_STEP"],
    ["SHOW_EXAMPLE", "show_me_example", "WATCH_MODE_EXAMPLE"],
    ["EXPLANATION_NOT_MAKING_SENSE", "explanation_not_making_sense", "SWITCH_REPRESENTATION"]
  ];

  required.forEach(function (entry) {
    var key = entry[0], value = entry[1], expectedAction = entry[2];
    check("router exposes " + key + " with stable value",
      M.IDK_REASONS[key] === value);

    var routed = safeIdk(value, key === "FORGOT_PREREQUISITE" ? "chem.bonding.carbon_valence_four" : null);
    check(key + " is accepted by handleIdk", routed.threw === false);
    if (!routed.threw) {
      check(key + " maps to the required action", routed.result.action === expectedAction);
      check(key + " opens remediation", routed.skill.remediation && routed.skill.remediation.active === true);
      check(key + " never returns a next item immediately", !("nextItem" in routed.result));
    }
  });
}

console.log("\n=== FRESH RETURN + MASTERY INVARIANTS ===");
{
  var skill = M.createSkill("chem.representation.bond_line");
  skill.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill, "BL-I1", true, true, 1000);
  check("one clean cold success with explanation is not mastery",
    M.evaluateMastery(skill).mastered === false);

  M.recordIndependentAttempt(skill, "BL-I2", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS - 1);
  check("a distinct item before the retrieval delay is still not mastery",
    M.evaluateMastery(skill).mastered === false);

  M.recordIndependentAttempt(skill, "BL-I3", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 1);
  check("a distinct later cold item can satisfy the existing mastery rule",
    M.evaluateMastery(skill).mastered === true);
}

{
  var skill2 = M.createSkill("chem.representation.bond_line");
  M.startTeaching(skill2);
  M.moveToGuided(skill2);
  var idk = M.handleIdk(skill2, M.IDK_REASONS.DONT_UNDERSTAND, "BL-I1", null, 2000);
  check("legacy IDK still opens remediation without a returned item",
    idk.remediationActive === true && !("nextItem" in idk));
  M.recordRemediationCheck(skill2, true, "BL-P1", 2100);
  var returned = M.exitRemediation(skill2, [{ id: "BL-I1" }, { id: "BL-I2" }, { id: "BL-I3" }]);
  check("after confirmed repair, return is allowed",
    returned.allowed === true);
  check("after confirmed repair, returned item is fresh",
    returned.nextItem && returned.nextItem.id !== "BL-I1");
}

{
  var skill3 = M.createSkill("chem.representation.bond_line");
  skill3.scaffoldLevel = M.SCAFFOLD.COLD;
  M.recordIndependentAttempt(skill3, "BL-I4", true, false, 1000);
  M.recordIndependentAttempt(skill3, "BL-I5", true, true, 1000 + M.MIN_RETRIEVAL_DELAY_MS + 10);
  check("objective success with a missing explanation does not become mastery by keyword/answer success alone",
    M.evaluateMastery(skill3).mastered === false);
}

console.log("\n=== REPRESENTATION-SWITCH GUARD ===");
{
  check("restated_explanation is absent from the shared representation rotation",
    M.REPRESENTATIONS.indexOf("restated_explanation") === -1);
  var routed = safeIdk("explanation_not_making_sense");
  if (!routed.threw) {
    check("modality-mismatch IDK requests a real representation switch",
      routed.result.action === "SWITCH_REPRESENTATION");
  }
}

console.log("\n=== SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed) process.exit(1);
