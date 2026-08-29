/*
 * Behavioral RED/GREEN contract for U1-01 Bond-Line Watch Step 2.
 * Locked Slice 1 must remain green while this test starts RED until Step 2 exists.
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

console.log("=== SLICE 2 PURE LESSON CONTRACT ===");
var sequence = Slice.WATCH_SEQUENCE;
var step1 = sequence.steps[0];
var step2 = sequence.steps[1] || null;
check("Watch sequence contains exactly two steps", sequence.steps.length === 2);
check("locked Step 1 identity and representation remain unchanged",
  !!step1 && step1.id === "bl_watch_1" && step1.visual.representation === "fully_expanded");
check("Step 2 has stable identity", !!step2 && step2.id === "bl_watch_2");
check("Step 2 uses carbon-skeleton emphasis", !!step2 && step2.visual && step2.visual.representation === "carbon_skeleton_emphasis");
check("Step 2 keeps all four carbons",
  !!step2 && ["C1","C2","C3","C4"].every(function (id) { return step2.visual.atoms.indexOf(id) !== -1; }));
check("Step 2 keeps all ten hydrogens rather than deleting them",
  !!step2 && step2.visual.atoms.filter(function (id) { return /^H/.test(id); }).length === 10);
check("Step 2 keeps the three C-C single bonds",
  !!step2 && [["C1","C2"],["C2","C3"],["C3","C4"]].every(function (pair) {
    return step2.visual.bonds.some(function (bond) { return bond[0] === pair[0] && bond[1] === pair[1] && bond[2] === 1; });
  }));
check("Step 2 explicitly de-emphasizes H while emphasizing the carbon skeleton",
  !!step2 && step2.visual.emphasis && step2.visual.emphasis.carbonHydrogens === "light" && step2.visual.emphasis.carbonSkeleton === "strong");
check("Step 2 narration introduces carbon skeleton",
  !!step2 && /connected chain of carbon atoms is the carbon skeleton/i.test(step2.narration || ""));
check("plain-language vocabulary definition is frozen",
  !!step2 && step2.vocabulary && step2.vocabulary.term === "carbon skeleton" &&
  step2.vocabulary.definition === "the connected pattern of carbon atoms in the molecule");
check("prediction prompt matches frozen curriculum",
  !!step2 && step2.prediction && step2.prediction.prompt === "If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?");
check("prediction choices are Yes / No / I am not sure yet",
  !!step2 && step2.prediction && step2.prediction.choices.map(function (c) { return c.label; }).join("|") === "Yes|No|I am not sure yet");
check("prediction answer is No", !!step2 && step2.prediction && step2.prediction.answer === "no");
check("correct feedback matches frozen curriculum",
  !!step2 && step2.prediction && step2.prediction.correctFeedback === "Right. The notation changes. The molecule does not.");
check("incorrect/unsure feedback matches frozen curriculum",
  !!step2 && step2.prediction && step2.prediction.repairFeedback === "Watch what changes next. We are going to hide the labels without breaking a single bond.");

var initial = Slice.createSession();
check("session initializes Step 2 prediction as null", initial.watchStep2Prediction === null);
check("session initializes Step 2 as incomplete", initial.watchStep2Complete === false);
check("pure runtime exposes Step 2 prediction submission", typeof Slice.submitWatchStep2Prediction === "function");
if (typeof Slice.submitWatchStep2Prediction === "function") {
  var unsureSession = Slice.createSession();
  unsureSession.phase = "watch_step_2";
  var unsure = Slice.submitWatchStep2Prediction(unsureSession, "unsure");
  check("unsure is accepted as teaching interaction but not correct",
    unsure.accepted === true && unsure.correct === false && unsureSession.watchStep2Complete === true);
  check("unsure creates no mastery evidence", unsureSession.evidence.length === 0);

  var correctSession = Slice.createSession();
  correctSession.phase = "watch_step_2";
  var correct = Slice.submitWatchStep2Prediction(correctSession, "no");
  check("No is the correct Step 2 prediction", correct.accepted === true && correct.correct === true);
  check("correct prediction creates no mastery evidence", correctSession.evidence.length === 0);
}

console.log("\n=== SLICE 2 REAL LEARNER PAGE ===");
function read(rel) { return fs.readFileSync(path.join(__dirname, rel), "utf8"); }
function evalFile(win, rel) { win.eval(read(rel) + "\n//# sourceURL=" + rel); }
function buttonByText(doc, text) {
  return Array.prototype.slice.call(doc.querySelectorAll("button")).find(function (button) {
    return button.textContent.trim() === text;
  }) || null;
}
function clickText(doc, text) {
  var button = buttonByText(doc, text);
  if (!button) throw new Error("Button not found: " + text);
  button.click();
  return button;
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
  clickText(doc, "The drawing may be using a shortcut.");
  clickText(doc, "4");
  clickText(doc, "A covalent bond");
  ["C1","C2","C3","C4"].forEach(function (id) {
    var node = doc.querySelector('[data-carbon-id="' + id + '"]');
    if (!node) throw new Error("Carbon target not found: " + id);
    activate(node);
  });
  check("Step 1 enables Next only after four carbon selections", doc.getElementById("nextBtn").disabled === false);
  doc.getElementById("nextBtn").click();
  return doc;
}

var appA = buildApp();
var docA = reachStep2(appA);
check("Next from Step 1 opens Watch Step 2 rather than a completion screen",
  /Watch · I Do · Step 2/i.test(docA.getElementById("phaseLabel").textContent) &&
  docA.body.textContent.indexOf("carbon skeleton") !== -1 &&
  docA.body.textContent.indexOf("Step 1 is working") === -1);
check("Step 2 asks the frozen prediction visibly",
  docA.body.textContent.indexOf("If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?") !== -1);
check("Step 2 renders all three choices", !!buttonByText(docA,"Yes") && !!buttonByText(docA,"No") && !!buttonByText(docA,"I am not sure yet"));
check("Step 2 keeps four visible carbon labels", docA.querySelectorAll("[data-step2-carbon]").length === 4);
check("Step 2 keeps ten visible but light hydrogen labels",
  docA.querySelectorAll("[data-step2-hydrogen]").length === 10 && docA.querySelectorAll("[data-step2-hydrogen].hydrogen-light").length === 10);
check("Next is gated before prediction", docA.getElementById("nextBtn").disabled === true);

var unsureButton = buttonByText(docA, "I am not sure yet");
if (unsureButton) {
  unsureButton.focus();
  unsureButton.click();
  check("unsure prediction preserves the activated control and focus",
    unsureButton.isConnected === true && docA.activeElement === unsureButton);
  check("unsure prediction shows frozen feedback visibly",
    docA.body.textContent.indexOf("Watch what changes next. We are going to hide the labels without breaking a single bond.") !== -1);
  check("answered prediction enables learner-controlled Next", docA.getElementById("nextBtn").disabled === false);
}

var spokenBefore = appA.spoken.length;
docA.getElementById("replayBtn").click();
check("Replay on Step 2 speaks the Step 2 carbon-skeleton narration",
  appA.spoken.length === spokenBefore + 1 && /carbon skeleton/i.test(appA.spoken[appA.spoken.length - 1] || ""));

docA.getElementById("backBtn").click();
check("Back from Step 2 returns exactly one step to Watch Step 1",
  /Watch · I Do · Step 1/i.test(docA.getElementById("phaseLabel").textContent) &&
  docA.body.textContent.indexOf("Start with everything visible") !== -1);

var appB = buildApp();
var docB = reachStep2(appB);
var noButton = buttonByText(docB, "No");
if (noButton) {
  noButton.focus();
  noButton.click();
  check("correct prediction preserves the activated control and focus",
    noButton.isConnected === true && docB.activeElement === noButton);
  check("correct prediction shows exact frozen feedback",
    docB.body.textContent.indexOf("Right. The notation changes. The molecule does not.") !== -1);
}

check("Slice 2 introduces no timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

appA.dom.window.close();
appB.dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
