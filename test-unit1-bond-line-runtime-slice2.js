/*
 * U1-01 Bond-Line runtime Slice 2 contract.
 *
 * This is intentionally behavioral. It extends the already-frozen Slice 1
 * contract by exactly one Watch step:
 *   fully expanded butane -> carbon-skeleton emphasis -> learner prediction.
 *
 * It must start RED against the locked Slice 1 head.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var JSDOM = require("jsdom").JSDOM;
var Slice = require("./course-units/unit1/bond-line/bond-line-slice1.js");

var failed = 0;
function check(label, condition) {
  if (condition) console.log("PASS  " + label);
  else {
    console.log("FAIL  " + label);
    failed += 1;
  }
}

console.log("=== SLICE 2 PURE LESSON CONTRACT ===");
var sequence = Slice.WATCH_SEQUENCE;
var step2 = sequence.steps[1] || null;
check("Watch sequence now contains exactly Step 1 and Step 2", sequence.steps.length === 2);
check("Step 1 remains the locked fully expanded butane step",
  sequence.steps[0] && sequence.steps[0].id === "bl_watch_1" && sequence.steps[0].visual.representation === "fully_expanded");
check("Step 2 has a stable identity", !!step2 && step2.id === "bl_watch_2");
check("Step 2 keeps the same butane molecule and emphasizes the carbon skeleton",
  !!step2 && step2.visual && step2.visual.representation === "carbon_skeleton_emphasis");
check("Step 2 retains all four carbon atoms",
  !!step2 && step2.visual && ["C1","C2","C3","C4"].every(function (id) { return step2.visual.atoms.indexOf(id) !== -1; }));
check("Step 2 retains all three carbon-carbon bonds",
  !!step2 && step2.visual && [["C1","C2"],["C2","C3"],["C3","C4"]].every(function (pair) {
    return step2.visual.bonds.some(function (bond) { return bond[0] === pair[0] && bond[1] === pair[1] && bond[2] === 1; });
  }));
check("Step 2 still contains all ten hydrogens rather than deleting them",
  !!step2 && step2.visual && step2.visual.atoms.filter(function (id) { return /^H/.test(id); }).length === 10);
check("Step 2 explicitly marks carbon-bound hydrogens as visually de-emphasized",
  !!step2 && step2.visual && step2.visual.emphasis && step2.visual.emphasis.carbonHydrogens === "light" && step2.visual.emphasis.carbonSkeleton === "strong");
check("Step 2 narration introduces carbon skeleton meaning before the prediction",
  !!step2 && /carbon skeleton/i.test(step2.narration || "") && /connected chain of carbon atoms/i.test(step2.narration || ""));
check("Step 2 carries the frozen plain-language vocabulary definition",
  !!step2 && step2.vocabulary && step2.vocabulary.term === "carbon skeleton" &&
  step2.vocabulary.definition === "the connected pattern of carbon atoms in the molecule");
check("Step 2 prediction uses the frozen question",
  !!step2 && step2.prediction && step2.prediction.prompt === "If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?");
check("Step 2 prediction choices are Yes / No / I am not sure yet",
  !!step2 && step2.prediction && step2.prediction.choices.map(function (c) { return c.label; }).join("|") === "Yes|No|I am not sure yet");
check("Step 2 prediction correct answer is No",
  !!step2 && step2.prediction && step2.prediction.answer === "no");
check("correct prediction feedback preserves the notation-versus-molecule distinction",
  !!step2 && step2.prediction && step2.prediction.correctFeedback === "Right. The notation changes. The molecule does not.");
check("incorrect/unsure prediction feedback points forward without pretending the molecule changed",
  !!step2 && step2.prediction && step2.prediction.repairFeedback === "Watch what changes next. We are going to hide the labels without breaking a single bond.");

var pureSession = Slice.createSession();
check("Slice 2 session begins with no Step 2 prediction recorded",
  Object.prototype.hasOwnProperty.call(pureSession, "watchStep2Prediction") && pureSession.watchStep2Prediction === null);
check("Slice 2 session begins with Step 2 incomplete",
  Object.prototype.hasOwnProperty.call(pureSession, "watchStep2Complete") && pureSession.watchStep2Complete === false);
check("Slice exposes a Step 2 prediction submitter", typeof Slice.submitWatchStep2Prediction === "function");

if (typeof Slice.submitWatchStep2Prediction === "function") {
  var predictionSession = Slice.createSession();
  predictionSession.phase = "watch_step_2";
  var unsure = Slice.submitWatchStep2Prediction(predictionSession, "unsure");
  check("unsure prediction is accepted as a teaching interaction, not scored correct",
    unsure.accepted === true && unsure.correct === false && predictionSession.watchStep2Complete === true);
  check("unsure prediction stores the learner choice", predictionSession.watchStep2Prediction === "unsure");
  check("Step 2 prediction creates no independent/mastery evidence", predictionSession.evidence.length === 0);

  var correctSession = Slice.createSession();
  correctSession.phase = "watch_step_2";
  var correct = Slice.submitWatchStep2Prediction(correctSession, "no");
  check("No is accepted as the correct prediction", correct.accepted === true && correct.correct === true);
  check("correct Step 2 prediction still creates no mastery evidence", correctSession.evidence.length === 0);
}

console.log("\n=== SLICE 2 REAL LEARNER-PAGE CONTRACT ===");

function read(rel) {
  return fs.readFileSync(path.join(__dirname, rel), "utf8");
}

function evalFile(window, rel) {
  window.eval(read(rel) + "\n//# sourceURL=" + rel);
}

function buttonByText(document, text) {
  return Array.prototype.slice.call(document.querySelectorAll("button")).find(function (button) {
    return button.textContent.trim() === text;
  }) || null;
}

function clickText(document, text) {
  var button = buttonByText(document, text);
  if (!button) throw new Error("Button not found: " + text);
  button.click();
  return button;
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
    value: {
      cancel: function () {},
      speak: function (utterance) { spoken.push(utterance.text); }
    }
  });
  dom.window.SpeechSynthesisUtterance = function (text) { this.text = text; this.rate = 1; };
  evalFile(dom.window, "watch-mode.js");
  evalFile(dom.window, "unit1-skill-registry.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-slice1.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-app.js");
  return { dom: dom, spoken: spoken };
}

function reachStep2(app) {
  var document = app.dom.window.document;
  clickText(document, "The drawing may be using a shortcut.");
  clickText(document, "4");
  clickText(document, "A covalent bond");
  ["C1","C2","C3","C4"].forEach(function (id) {
    var node = document.querySelector('[data-carbon-id="' + id + '"]');
    if (!node) throw new Error("Carbon target not found: " + id);
    node.click();
  });
  var next = document.getElementById("nextBtn");
  check("Step 1 enables Next only after all four carbons are found", next.disabled === false);
  next.click();
  return document;
}

var appA = buildApp();
var docA = reachStep2(appA);
check("Next from completed Step 1 opens Watch Step 2, not a slice-complete screen",
  /Watch · I Do · Step 2/i.test(docA.getElementById("phaseLabel").textContent) &&
  docA.body.textContent.indexOf("carbon skeleton") !== -1 &&
  docA.body.textContent.indexOf("Step 1 is working") === -1);
check("Step 2 visibly asks the frozen prediction question",
  docA.body.textContent.indexOf("If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?") !== -1);
check("Step 2 shows all three prediction choices",
  !!buttonByText(docA, "Yes") && !!buttonByText(docA, "No") && !!buttonByText(docA, "I am not sure yet"));
check("Step 2 visual keeps four carbon labels visible",
  docA.querySelectorAll("[data-step2-carbon]").length === 4);
check("Step 2 visual keeps ten hydrogen labels visible but de-emphasized",
  docA.querySelectorAll("[data-step2-hydrogen]").length === 10 &&
  docA.querySelectorAll("[data-step2-hydrogen].hydrogen-light").length === 10);
check("Next is gated until the Step 2 prediction is answered",
  docA.getElementById("nextBtn").disabled === true);

var unsureButton = buttonByText(docA, "I am not sure yet");
if (unsureButton) {
  unsureButton.focus();
  unsureButton.click();
  check("unsure prediction keeps the activated control mounted and focused",
    unsureButton.isConnected === true && docA.activeElement === unsureButton);
  check("unsure prediction shows the frozen forward-looking feedback visibly",
    docA.body.textContent.indexOf("Watch what changes next. We are going to hide the labels without breaking a single bond.") !== -1);
  check("prediction completion enables learner-controlled Next",
    docA.getElementById("nextBtn").disabled === false);
}

var replayBefore = appA.spoken.length;
docA.getElementById("replayBtn").click();
check("Replay on Step 2 narrates the Step 2 carbon-skeleton explanation",
  appA.spoken.length === replayBefore + 1 && /carbon skeleton/i.test(appA.spoken[appA.spoken.length - 1] || ""));

// Back must move exactly one Watch step, not restart the prerequisite flow.
docA.getElementById("backBtn").click();
check("Back from Step 2 returns exactly to Watch Step 1",
  /Watch · I Do · Step 1/i.test(docA.getElementById("phaseLabel").textContent) &&
  docA.body.textContent.indexOf("Start with everything visible") !== -1);

// Separate clean app proves the correct branch and exact feedback.
var appB = buildApp();
var docB = reachStep2(appB);
var noButton = buttonByText(docB, "No");
if (noButton) {
  noButton.focus();
  noButton.click();
  check("correct prediction keeps the activated control mounted and focused",
    noButton.isConnected === true && docB.activeElement === noButton);
  check("correct prediction shows exact frozen feedback",
    docB.body.textContent.indexOf("Right. The notation changes. The molecule does not.") !== -1);
}

var appSource = read("course-units/unit1/bond-line/bond-line-app.js");
check("Slice 2 introduces no timer-driven instructional advancement",
  appSource.indexOf("setTimeout(") === -1 && appSource.indexOf("setInterval(") === -1);

appA.dom.window.close();
appB.dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
