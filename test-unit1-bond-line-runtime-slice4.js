/*
 * Behavioral RED/GREEN contract for U1-01 Bond-Line Watch Step 4.
 * Locked Slices 1-3 must remain green while this test starts RED until
 * Step 4 exists: carbon labels collapse into line ends/vertices, then the
 * learner predicts whether the carbon disappeared.
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
function reachStep3(app) {
  var doc = app.dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function (id) { activate(doc.querySelector('[data-carbon-id="' + id + '"]')); });
  doc.getElementById("nextBtn").click();
  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();
  byText(doc, "3").click();
  return doc;
}
function reachStep4(app) {
  var doc = reachStep3(app);
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== SLICE 4 PURE LESSON CONTRACT ===");
var sequence = Slice.WATCH_SEQUENCE;
var step4 = sequence.steps[3] || null;
check("Watch sequence exposes a fourth step", sequence.steps.length >= 4);
check("locked prior Watch identities remain in order",
  sequence.steps[0] && sequence.steps[0].id === "bl_watch_1" &&
  sequence.steps[1] && sequence.steps[1].id === "bl_watch_2" &&
  sequence.steps[2] && sequence.steps[2].id === "bl_watch_3");
check("Step 4 has stable identity", !!step4 && step4.id === "bl_watch_4");
check("Step 4 keeps butane while changing only the notation",
  !!step4 && sequence.molecule === "butane" && step4.visual && step4.visual.representation === "carbon_labels_collapsing");
check("Step 4 molecular model still retains four carbons and ten hydrogens",
  !!step4 && ["C1","C2","C3","C4"].every(function (id) { return step4.visual.atoms.indexOf(id) !== -1; }) &&
  step4.visual.atoms.filter(function (id) { return /^H/.test(id); }).length === 10);
check("Step 4 preserves the three C-C single bonds",
  !!step4 && [["C1","C2"],["C2","C3"],["C3","C4"]].every(function (pair) {
    return step4.visual.bonds.some(function (bond) { return bond[0] === pair[0] && bond[1] === pair[1] && bond[2] === 1; });
  }));
check("carbon labels collapse in the frozen C1→C2→C3→C4 order",
  !!step4 && step4.visual.collapseOrder && step4.visual.collapseOrder.join("|") === "C1|C2|C3|C4");
check("prediction pauses after exactly two carbon labels collapse",
  !!step4 && step4.visual.predictionAfterCollapsed === 2);
check("Step 4 narration teaches line ends and vertices",
  !!step4 && /line end/i.test(step4.narration || "") && /vertex/i.test(step4.narration || ""));
check("vertex definition preserves the frozen role meaning",
  !!step4 && step4.vocabulary && step4.vocabulary.vertex === "This corner where two lines meet is called a vertex. In a bond-line structure, an unlabeled vertex represents carbon.");
check("Step 4 prediction matches frozen curriculum",
  !!step4 && step4.prediction && step4.prediction.prompt === "The letter C disappeared from this corner. Did the carbon atom disappear?");
check("Step 4 prediction choices match frozen curriculum",
  !!step4 && step4.prediction && step4.prediction.choices.map(function (c) { return c.label; }).join("|") === "Yes|No, the corner now stands for the carbon|I am not sure yet");
check("Step 4 prediction correct answer is the role-preserving No choice",
  !!step4 && step4.prediction && step4.prediction.answer === "no_corner_carbon");
check("missed prediction switches to the exact same-position repair",
  !!step4 && step4.repair && step4.repair.toggleCarbonId === "C2" && step4.repair.toggleCount === 3 &&
  step4.repair.narration === "Same position, same bonds, same carbon. Only the label is being abbreviated.");

var initial = Slice.createSession();
check("session initializes Step 4 prediction as null", initial.watchStep4Prediction === null);
check("session initializes Step 4 repair inactive", initial.watchStep4RepairActive === false);
check("session initializes Step 4 incomplete", initial.watchStep4Complete === false);
check("pure runtime exposes Step 4 prediction submission", typeof Slice.submitWatchStep4Prediction === "function");

if (typeof Slice.submitWatchStep4Prediction === "function") {
  var direct = Slice.createSession();
  direct.phase = "watch_step_4";
  var right = Slice.submitWatchStep4Prediction(direct, "no_corner_carbon");
  check("direct correct prediction completes supported Step 4", right.accepted === true && right.correct === true && direct.watchStep4Complete === true);
  check("direct correct prediction creates no independent/mastery evidence", direct.evidence.length === 0);

  var wrong = Slice.createSession();
  wrong.phase = "watch_step_4";
  var miss = Slice.submitWatchStep4Prediction(wrong, "yes");
  check("wrong prediction enters label-toggle repair without completing Step 4",
    miss.accepted === true && miss.correct === false && wrong.watchStep4RepairActive === true && wrong.watchStep4Complete === false);
  check("wrong supported prediction creates no mastery evidence", wrong.evidence.length === 0);
  var repaired = Slice.submitWatchStep4Prediction(wrong, "no_corner_carbon");
  check("corrected prediction exits repair and completes Step 4",
    repaired.accepted === true && repaired.correct === true && wrong.watchStep4RepairActive === false && wrong.watchStep4Complete === true);
  check("repair path still creates no mastery evidence", wrong.evidence.length === 0);
}

console.log("\n=== SLICE 4 REAL LEARNER PAGE ===");
var appA = buildApp();
var docA = reachStep4(appA);
check("Next from completed Step 3 opens Watch Step 4",
  /Watch · I Do · Step 4/i.test(docA.getElementById("phaseLabel").textContent) && docA.body.textContent.indexOf("Step 3 is working") === -1);
check("Step 4 renders four carbon positions", docA.querySelectorAll("[data-step4-carbon]").length === 4);
check("Step 4 begins with C1 and C2 as the first two collapsing labels",
  docA.querySelector('[data-step4-carbon="C1"][data-collapse-phase="first"]') &&
  docA.querySelector('[data-step4-carbon="C2"][data-collapse-phase="second"]'));
check("C3 and C4 remain visibly labeled before the prediction is resolved",
  docA.querySelector('[data-step4-carbon="C3"][data-collapsed="false"]') &&
  docA.querySelector('[data-step4-carbon="C4"][data-collapsed="false"]'));
check("Step 4 visibly asks the frozen carbon-disappearance prediction",
  docA.body.textContent.indexOf("The letter C disappeared from this corner. Did the carbon atom disappear?") !== -1);
var predictionGroup = docA.querySelector('[role="group"][aria-labelledby="step4PredictionPrompt"]');
check("prediction choices are programmatically associated with the visible question",
  !!predictionGroup && !!predictionGroup.querySelector("button"));
check("Next is gated before the Step 4 prediction is resolved", docA.getElementById("nextBtn").disabled === true);

var correctChoice = byText(docA, "No, the corner now stands for the carbon");
if (correctChoice) {
  correctChoice.click();
  check("correct prediction collapses all four carbon labels into bond-line positions",
    docA.querySelectorAll('[data-step4-carbon][data-collapsed="true"]').length === 4);
  check("correct prediction enables learner-controlled Next", docA.getElementById("nextBtn").disabled === false);
}

console.log("\n=== WRONG ANSWER MUST TOGGLE THE SAME VERTEX ===");
var appB = buildApp();
var docB = reachStep4(appB);
var yes = byText(docB, "Yes");
if (yes) {
  yes.click();
  check("wrong prediction switches to the same-position label-toggle repair",
    !!docB.querySelector('[data-step4-toggle-carbon="C2"][data-toggle-count="3"]'));
  check("repair keeps the exact frozen explanation visible",
    docB.body.textContent.indexOf("Same position, same bonds, same carbon. Only the label is being abbreviated.") !== -1);
  check("repair keeps the same prediction question available for correction",
    docB.body.textContent.indexOf("The letter C disappeared from this corner. Did the carbon atom disappear?") !== -1);
  check("Next remains gated during the repair", docB.getElementById("nextBtn").disabled === true);
  var corrected = byText(docB, "No, the corner now stands for the carbon");
  if (corrected) {
    corrected.click();
    check("corrected prediction completes Step 4", docB.getElementById("nextBtn").disabled === false);
  }
}

console.log("\n=== WATCH CONTROLS ACROSS FOUR STEPS ===");
var appC = buildApp();
var docC = reachStep4(appC);
docC.getElementById("backBtn").click();
check("Back from Step 4 returns exactly to Step 3", /Watch · I Do · Step 3/i.test(docC.getElementById("phaseLabel").textContent));
docC.getElementById("nextBtn").click();
check("completed Step 3 can return to Step 4 without losing its state", /Watch · I Do · Step 4/i.test(docC.getElementById("phaseLabel").textContent));
var svgBeforePause = docC.querySelector("[data-step4-visual]");
docC.getElementById("pauseBtn").click();
check("Pause on Step 4 disables Back", docC.getElementById("backBtn").disabled === true);
check("Pause on Step 4 disables Replay", docC.getElementById("replayBtn").disabled === true);
check("Pause on Step 4 disables Next", docC.getElementById("nextBtn").disabled === true);
docC.getElementById("pauseBtn").click();
check("Resume keeps the exact Step 4 visual node mounted", svgBeforePause && svgBeforePause.isConnected && docC.querySelector("[data-step4-visual]") === svgBeforePause);

check("Slice 4 adds no timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

appA.dom.window.close();
appB.dom.window.close();
appC.dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
