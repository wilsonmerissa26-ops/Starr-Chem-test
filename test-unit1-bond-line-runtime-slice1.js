/*
 * Runtime Slice 1 contract for U1-01 Bond-Line.
 *
 * Scope is deliberately narrow:
 *   orientation -> prerequisite gates/repairs -> Watch Step 1
 *
 * This test is written before the runtime implementation. It must prove the
 * frozen lesson behavior without touching production Unit 1 yet.
 */
"use strict";

var fs = require("fs");
var W = require("./watch-mode.js");
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

console.log("=== SHARED WATCH MODE COMPATIBILITY ===");
{
  var counterless = {
    id: "watch_bond_line_butane_step1_v1",
    skillId: "chem.representation.bond_line",
    requiresCounter: false,
    steps: [{
      id: "bl_watch_1",
      narration: "Four carbon atoms are visible.",
      visual: { atoms: ["C1", "C2", "C3", "C4"], bonds: [], lonePairs: [] },
      notebookFacts: []
    }]
  };
  check("Watch Mode accepts an explicitly counterless non-electron sequence",
    W.validateSequence(counterless).valid === true);

  var accidentalMissingCounter = {
    id: "bad_missing_counter",
    skillId: "lewis_structures",
    steps: [{ id: "bad_1", narration: "bad", visual: { atoms: ["N"] }, notebookFacts: [] }]
  };
  var accidentalResult = W.validateSequence(accidentalMissingCounter);
  check("Watch Mode still rejects an accidental missing counter by default",
    accidentalResult.valid === false && accidentalResult.reason === "missing_counter");
}

var Slice = null;
try {
  Slice = require("./course-units/unit1/bond-line/bond-line-slice1.js");
} catch (error) {
  console.log("EXPECTED RED IMPLEMENTATION GAP: " + error.message);
}
check("Bond-Line Slice 1 runtime module exists", !!Slice);

if (Slice) {
  console.log("\n=== IDENTITY + ORIENTATION ===");
  check("runtime uses registered U1-01 lesson ID", Slice.LESSON_ID === "chm221.u1.01");
  check("runtime uses registered Bond-Line skill ID", Slice.SKILL_ID === "chem.representation.bond_line");
  check("registered lesson points to same primary skill",
    R.getLesson(Slice.LESSON_ID).primarySkillId === Slice.SKILL_ID);

  var s = Slice.createSession();
  check("new session starts at orientation", s.phase === "orientation");
  check("orientation is not mastery evidence", s.evidence.length === 0);
  var o = Slice.answerOrientation(s, "shortcut");
  check("orientation answer advances to first prerequisite gate", o.nextPhase === "gate_p1" && s.phase === "gate_p1");
  check("orientation still records no mastery evidence", s.evidence.length === 0);

  console.log("\n=== P1 CARBON-VALENCE GATE + NARROW REPAIR ===");
  var p1wrong = Slice.submitGate(s, "P1", 3, 1000);
  check("wrong P1 opens only the carbon-valence repair", p1wrong.correct === false && s.phase === "repair_p1");
  check("P1 evidence is attached to the carbon-valence prerequisite skill",
    s.evidence[0].skillId === "chem.bonding.carbon_valence_four");
  check("P1 evidence is probe evidence, not independent evidence",
    s.evidence[0].evidenceKind === R.EVIDENCE_KINDS.PROBE);
  check("wrong P1 cannot award mastery", R.canEvidenceAwardMastery(s.evidence[0]) === false);

  var p1repairWrong = Slice.submitRepair(s, "P1", 2);
  check("wrong P1 repair stays on the same micro-prerequisite", p1repairWrong.correct === false && s.phase === "repair_p1");
  var p1repair = Slice.submitRepair(s, "P1", 3);
  check("correct P1 repair moves forward without a second full gate quiz", p1repair.correct === true && s.phase === "gate_p2");

  console.log("\n=== P2 BOND-MEANING GATE + NARROW REPAIR ===");
  var p2wrong = Slice.submitGate(s, "P2", "carbon atom", 2000);
  check("wrong P2 opens only the bond-meaning repair", p2wrong.correct === false && s.phase === "repair_p2");
  check("P2 evidence is attached to the covalent-bond prerequisite skill",
    s.evidence[s.evidence.length - 1].skillId === "chem.bonding.covalent_bond_meaning");
  check("P2 evidence is probe evidence",
    s.evidence[s.evidence.length - 1].evidenceKind === R.EVIDENCE_KINDS.PROBE);
  var p2repair = Slice.submitRepair(s, "P2", 2);
  check("correct P2 repair enters Watch instead of re-testing the whole gate", p2repair.correct === true && s.phase === "watch_step_1");

  console.log("\n=== CLEAN-GATE PATH ===");
  var clean = Slice.createSession();
  Slice.answerOrientation(clean, "shortcut");
  check("P1 accepts carbon commonly making four total bonds", Slice.submitGate(clean, "P1", 4, 3000).correct === true);
  check("clean P1 advances directly to P2", clean.phase === "gate_p2");
  check("P2 accepts covalent bond", Slice.submitGate(clean, "P2", "a covalent bond", 4000).correct === true);
  check("2/2 clean gates enter Watch immediately", clean.phase === "watch_step_1");
  check("two clean prerequisite probes still cannot award mastery",
    clean.evidence.every(function (record) { return R.canEvidenceAwardMastery(record) === false; }));

  console.log("\n=== WATCH STEP 1: FULLY EXPANDED BUTANE ===");
  check("Watch Step 1 uses fully expanded butane", Slice.WATCH_SEQUENCE.molecule === "butane");
  check("Watch Step 1 exposes exactly four labeled carbon targets",
    Slice.WATCH_SEQUENCE.carbonTargets.length === 4 &&
    Slice.WATCH_SEQUENCE.carbonTargets.join(",") === "C1,C2,C3,C4");
  check("Bond-Line Watch explicitly opts out of the electron counter",
    Slice.WATCH_SEQUENCE.requiresCounter === false && !Slice.WATCH_SEQUENCE.steps[0].visual.counter);
  check("shared Watch Mode validates the Bond-Line sequence",
    W.validateSequence(Slice.WATCH_SEQUENCE).valid === true);

  var watchSession = W.createWatchSession(Slice.WATCH_SEQUENCE, { timestamp: 5000 });
  var begun = W.begin(watchSession, Slice.WATCH_SEQUENCE, 5000);
  check("Watch begins under learner control", begun.view.currentIndex === 0 && begun.view.canReplay === true);

  var w = Slice.createSession();
  Slice.answerOrientation(w, "shortcut");
  Slice.submitGate(w, "P1", 4, 6000);
  Slice.submitGate(w, "P2", "a covalent bond", 7000);
  check("Watch low-risk interaction starts with zero carbon taps", w.watchCarbonIds.length === 0);
  check("first carbon tap is accepted", Slice.tapWatchCarbon(w, "C1").accepted === true && w.watchCarbonIds.length === 1);
  check("duplicate carbon tap does not create fake progress", Slice.tapWatchCarbon(w, "C1").accepted === false && w.watchCarbonIds.length === 1);
  Slice.tapWatchCarbon(w, "C2");
  Slice.tapWatchCarbon(w, "C3");
  var fourth = Slice.tapWatchCarbon(w, "C4");
  check("fourth unique carbon completes Watch Step 1 interaction", fourth.stepComplete === true && w.watchStep1Complete === true);
  check("Watch completion is not independent/mastery evidence",
    w.evidence.every(function (record) { return record.evidenceKind === R.EVIDENCE_KINDS.PROBE; }));
}

console.log("\n=== LEARNER PAGE CONTRACT ===");
var pagePath = "course-units/unit1/bond-line/index.html";
var appPath = "course-units/unit1/bond-line/bond-line-app.js";
var page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, "utf8") : "";
var app = fs.existsSync(appPath) ? fs.readFileSync(appPath, "utf8") : "";
check("Bond-Line learner page exists", !!page);
check("Bond-Line learner DOM adapter exists", !!app);
if (page) {
  check("page names Bond-Line structures", /Bond-line structures/i.test(page));
  check("page loads shared Watch Mode", page.indexOf("../../../watch-mode.js") !== -1);
  check("page loads shared skill registry", page.indexOf("../../../unit1-skill-registry.js") !== -1);
  check("page loads Slice 1 logic before the DOM adapter",
    page.indexOf("bond-line-slice1.js") !== -1 && page.indexOf("bond-line-app.js") > page.indexOf("bond-line-slice1.js"));
  ["Next", "Back", "Replay", "Pause"].forEach(function (label) {
    check("page exposes learner-controlled " + label + " control", page.indexOf(">" + label + "<") !== -1);
  });
}
if (app) {
  check("DOM adapter contains no timer-driven instructional advancement",
    app.indexOf("setTimeout(") === -1 && app.indexOf("setInterval(") === -1);
}

console.log("\n=== SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed) process.exit(1);
