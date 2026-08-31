/*
 * Behavioral RED/GREEN contract for U1-01 Bond-Line Watch Step 3.
 *
 * Locked Slices 1-2 must remain green while this test starts RED until
 * Step 3 exists: hide carbon-bound H labels without changing the molecule,
 * infer the terminal carbon's three H atoms, and switch representation on error.
 * Later Watch slices may append steps without invalidating this locked contract.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var JSDOM = require("jsdom").JSDOM;
var Slice = require("./course-units/unit1/bond-line/bond-line-slice1.js");
var failed = 0;

function check(label, condition) {
  if (condition) console.log("PASS  " + label);
  else { console.log("FAIL  " + label); failed += 1; }
}
function read(rel) { return fs.readFileSync(path.join(__dirname, rel), "utf8"); }
function evalFile(win, rel) { win.eval(read(rel) + "\n//# sourceURL=" + rel); }
function byText(root, text) {
  return Array.prototype.slice.call(root.querySelectorAll("button")).find(function (button) {
    return button.textContent.trim() === text;
  }) || null;
}
function activate(node) {
  if (!node) throw new Error("Cannot activate a missing node");
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function buildApp() {
  var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
    runScripts: "outside-only",
    pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  var spoken = [];
  Object.defineProperty(dom.window, "speechSynthesis", {
    configurable: true,
    value: { cancel: function () {}, speak: function (u) { spoken.push(u.text); } }
  });
  dom.window.SpeechSynthesisUtterance = function (text) { this.text = text; this.rate = 1; };
  evalFile(dom.window, "watch-mode.js");
  evalFile(dom.window, "unit1-skill-registry.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-slice1.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-app.js");
  return { dom: dom, spoken: spoken };
}
function reachStep2(app) {
  var doc = app.dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function (id) {
    activate(doc.querySelector('[data-carbon-id="' + id + '"]'));
  });
  doc.getElementById("nextBtn").click();
  return doc;
}
function reachStep3(app) {
  var doc = reachStep2(app);
  var no = byText(doc, "No");
  if (no) no.click();
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== SLICE 3 PURE LESSON CONTRACT ===");
var sequence = Slice.WATCH_SEQUENCE;
var step1 = sequence.steps[0] || null;
var step2 = sequence.steps[1] || null;
var step3 = sequence.steps[2] || null;
check("Watch sequence preserves at least the locked first three steps", sequence.steps.length >= 3);
check("locked Step 1 identity remains unchanged", !!step1 && step1.id === "bl_watch_1" && step1.visual.representation === "fully_expanded");
check("locked Step 2 identity remains unchanged", !!step2 && step2.id === "bl_watch_2" && step2.visual.representation === "carbon_skeleton_emphasis");
check("Step 3 has stable identity", !!step3 && step3.id === "bl_watch_3");
check("Step 3 keeps the same butane molecule while changing notation",
  !!step3 && step3.visual && step3.visual.representation === "carbon_hydrogens_implied" && sequence.molecule === "butane");
check("Step 3 molecular model still contains four carbons and ten hydrogens",
  !!step3 && ["C1","C2","C3","C4"].every(function (id) { return step3.visual.atoms.indexOf(id) !== -1; }) &&
  step3.visual.atoms.filter(function (id) { return /^H/.test(id); }).length === 10);
check("Step 3 molecular model still contains the three carbon-carbon bonds",
  !!step3 && [["C1","C2"],["C2","C3"],["C3","C4"]].every(function (pair) {
    return step3.visual.bonds.some(function (bond) { return bond[0] === pair[0] && bond[1] === pair[1] && bond[2] === 1; });
  }));
check("Step 3 explicitly keeps carbon labels visible while carbon-bound H labels become hidden",
  !!step3 && step3.visual.visibility && step3.visual.visibility.carbonLabels === "visible" && step3.visual.visibility.carbonHydrogenLabels === "hidden");
check("Step 3 carries the frozen same-molecule banner",
  !!step3 && step3.visual.banner === "Same molecule. Fewer written labels.");
check("Step 3 narration explains implied H by counting carbon to four",
  !!step3 && step3.narration === "The hydrogens attached to carbon are no longer written, but they are still implied. If I want to know how many hydrogens belong on a carbon, I look at the bonds already drawn to that carbon and ask how many more bonds it needs to reach four.");
check("Step 3 prompt uses the frozen terminal-carbon question",
  !!step3 && step3.interaction && step3.interaction.prompt === "This carbon already has 1 bond. How many C—H bonds are implied here so carbon reaches 4?");
check("Step 3 direct answer is three implied hydrogens", !!step3 && step3.interaction && step3.interaction.answer === 3);
check("wrong answer switches to the frozen bond-slot repair prompt",
  !!step3 && step3.repair && step3.repair.prompt === "How many bond slots remain?" && step3.repair.answer === 3);
check("repair representation explicitly has four slots with one already occupied",
  !!step3 && step3.repair && step3.repair.representation === "four_bond_slots" && step3.repair.totalSlots === 4 && step3.repair.occupiedSlots === 1);

var initial = Slice.createSession();
check("session initializes Step 3 response as null", initial.watchStep3Response === null);
check("session initializes Step 3 repair inactive", initial.watchStep3RepairActive === false);
check("session initializes Step 3 incomplete", initial.watchStep3Complete === false);
check("pure runtime exposes Step 3 answer submission", typeof Slice.submitWatchStep3Hydrogen === "function");
check("pure runtime exposes Step 3 repair submission", typeof Slice.submitWatchStep3Repair === "function");

if (typeof Slice.submitWatchStep3Hydrogen === "function" && typeof Slice.submitWatchStep3Repair === "function") {
  var direct = Slice.createSession();
  direct.phase = "watch_step_3";
  var directResult = Slice.submitWatchStep3Hydrogen(direct, 3);
  check("direct correct answer completes Step 3", directResult.accepted === true && directResult.correct === true && direct.watchStep3Complete === true);
  check("direct correct answer creates no independent/mastery evidence", direct.evidence.length === 0);

  var wrong = Slice.createSession();
  wrong.phase = "watch_step_3";
  var wrongResult = Slice.submitWatchStep3Hydrogen(wrong, 2);
  check("wrong answer activates representation-switch repair without completing Step 3",
    wrongResult.accepted === true && wrongResult.correct === false && wrongResult.repairRequired === true &&
    wrong.watchStep3RepairActive === true && wrong.watchStep3Complete === false);
  check("wrong answer does not reveal the final number in its feedback", String(wrongResult.feedback || "").indexOf("3") === -1);
  check("wrong supported attempt creates no mastery evidence", wrong.evidence.length === 0);
  var repairWrong = Slice.submitWatchStep3Repair(wrong, 2);
  check("wrong slot repair stays in the representation switch", repairWrong.accepted === true && repairWrong.correct === false && wrong.watchStep3RepairActive === true && wrong.watchStep3Complete === false);
  var repairRight = Slice.submitWatchStep3Repair(wrong, 3);
  check("correct slot repair reconnects to three implied H and completes the Watch interaction",
    repairRight.accepted === true && repairRight.correct === true && wrong.watchStep3RepairActive === false && wrong.watchStep3Complete === true);
  check("supported repair completion still creates no mastery evidence", wrong.evidence.length === 0);
}

console.log("\n=== SLICE 3 REAL LEARNER PAGE ===");
var appA = buildApp();
var docA = reachStep3(appA);
check("Next from answered Step 2 opens Watch Step 3 instead of the Slice 2 completion screen",
  /Watch · I Do · Step 3/i.test(docA.getElementById("phaseLabel").textContent) && docA.body.textContent.indexOf("Step 2 is working") === -1);
check("Step 3 visibly says the molecule is the same with fewer written labels",
  docA.body.textContent.indexOf("Same molecule. Fewer written labels.") !== -1);
check("Step 3 keeps four visible carbon labels", docA.querySelectorAll("[data-step3-carbon]").length === 4);
check("Step 3 contains ten staged carbon-bound hydrogen labels for the one-at-a-time fade",
  docA.querySelectorAll("[data-step3-hydrogen]").length === 10 && docA.querySelectorAll("[data-step3-hydrogen][data-fade-order]").length === 10);
check("Step 3 asks the frozen implied-hydrogen question",
  docA.body.textContent.indexOf("This carbon already has 1 bond. How many C—H bonds are implied here so carbon reaches 4?") !== -1);
check("Next is gated before Step 3 interaction is complete", docA.getElementById("nextBtn").disabled === true);

var directThree = byText(docA, "3");
if (directThree) {
  directThree.focus();
  directThree.click();
  check("direct correct answer preserves the activated control and focus", directThree.isConnected === true && docA.activeElement === directThree);
  check("direct correct answer briefly exposes exactly three ghosted implied-H markers", docA.querySelectorAll(".implied-h-ghost").length === 3);
  check("direct correct answer enables learner-controlled Next", docA.getElementById("nextBtn").disabled === false);
}

console.log("\n=== WRONG ANSWER MUST SWITCH REPRESENTATION ===");
var appB = buildApp();
var docB = reachStep3(appB);
var wrongTwo = byText(docB, "2");
if (wrongTwo) {
  wrongTwo.focus();
  wrongTwo.click();
  check("wrong direct answer replaces the molecule-count prompt with four bond slots", !!docB.querySelector("[data-step3-repair-slots]"));
  check("repair screen marks exactly one slot as occupied", docB.querySelectorAll("[data-step3-slot=\"occupied\"]").length === 1);
  check("repair screen leaves exactly three slots open", docB.querySelectorAll("[data-step3-slot=\"open\"]").length === 3);
  check("repair screen asks the frozen remaining-slots question", docB.body.textContent.indexOf("How many bond slots remain?") !== -1);
  check("focus moves intentionally into the new repair representation", !!docB.activeElement && docB.activeElement.id === "step3RepairPrompt");
  check("Next remains gated during repair", docB.getElementById("nextBtn").disabled === true);
  var repairThree = byText(docB, "3");
  if (repairThree) {
    repairThree.click();
    check("correct repair completes Step 3", docB.getElementById("nextBtn").disabled === false);
    check("repair completion visibly reconnects three remaining slots to three implied hydrogens",
      docB.body.textContent.indexOf("three implied hydrogens") !== -1);
  }
}

console.log("\n=== WATCH CONTROLS ACROSS LOCKED FIRST THREE STEPS ===");
var appC = buildApp();
var docC = reachStep3(appC);
docC.getElementById("backBtn").click();
check("Back from Step 3 returns exactly to Step 2", /Watch · I Do · Step 2/i.test(docC.getElementById("phaseLabel").textContent));
docC.getElementById("nextBtn").click();
check("Step 2 still cannot advance unless its prediction remains recorded", /Watch · I Do · Step 3/i.test(docC.getElementById("phaseLabel").textContent));
var spokenBefore = appC.spoken.length;
docC.getElementById("replayBtn").click();
check("Replay on Step 3 speaks the Step 3 implied-H narration",
  appC.spoken.length === spokenBefore + 1 && /still implied/i.test(appC.spoken[appC.spoken.length - 1] || ""));
docC.getElementById("pauseBtn").click();
check("Pause on Step 3 freezes Back", docC.getElementById("backBtn").disabled === true);
check("Pause on Step 3 freezes Next", docC.getElementById("nextBtn").disabled === true);

check("Slice 3 introduces no timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

appA.dom.window.close();
appB.dom.window.close();
appC.dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
