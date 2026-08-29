/*
 * Behavioral DOM regression for PR #76.
 *
 * The real defect: a wrong P1/P2 repair answer rebuilt panel.innerHTML,
 * destroying the focused answer button while the learner remained on the same
 * repair. This test loads the actual learner page and app in JSDOM, clicks the
 * real controls, and checks element identity plus document.activeElement.
 *
 * Usage:
 *   node test-unit1-bond-line-repair-focus.js
 *   BOND_LINE_APP_PATH=/tmp/old-app.js node test-unit1-bond-line-repair-focus.js
 *   EXPECT_REPAIR_FOCUS_BUG=1 BOND_LINE_APP_PATH=/tmp/old-app.js node test-unit1-bond-line-repair-focus.js
 *
 * EXPECT_REPAIR_FOCUS_BUG=1 is a historical-regression proof mode. It succeeds
 * only when the exact known focus failure set is reproduced and every unrelated
 * harness/behavior assertion still passes. A crash or different regression is
 * therefore not accepted as proof of the historical focus bug.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var JSDOM = require("jsdom").JSDOM;

var ROOT = __dirname;
var APP_PATH = process.env.BOND_LINE_APP_PATH || path.join(ROOT, "course-units/unit1/bond-line/bond-line-app.js");
var EXPECT_BUG = process.env.EXPECT_REPAIR_FOCUS_BUG === "1";
var failures = [];

var EXPECTED_HISTORICAL_FAILURES = [
  "P1_same_element",
  "P1_active_element",
  "P1_repeat_focus",
  "P2_same_element",
  "P2_active_element",
  "P2_repeat_focus"
];

function check(id, label, condition) {
  if (condition) console.log("PASS  " + label);
  else {
    console.log("FAIL  " + label + " [" + id + "]");
    failures.push(id);
  }
}

function read(rel) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function evaluate(window, source, label) {
  window.eval(source + "\n//# sourceURL=" + label.replace(/\\/g, "/"));
}

function buttonByText(document, text) {
  var buttons = Array.prototype.slice.call(document.querySelectorAll("button"));
  return buttons.find(function (button) {
    return button.textContent.trim() === text;
  }) || null;
}

function clickButton(document, text) {
  var button = buttonByText(document, text);
  if (!button) throw new Error("Button not found: " + text);
  button.click();
  return button;
}

function buildApp() {
  var html = read("course-units/unit1/bond-line/index.html");
  var dom = new JSDOM(html, {
    runScripts: "outside-only",
    pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  var window = dom.window;

  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: { cancel: function () {}, speak: function () {} }
  });
  window.SpeechSynthesisUtterance = function (text) {
    this.text = text;
    this.rate = 1;
  };

  evaluate(window, read("watch-mode.js"), "watch-mode.js");
  evaluate(window, read("unit1-skill-registry.js"), "unit1-skill-registry.js");
  evaluate(window, read("course-units/unit1/bond-line/bond-line-slice1.js"), "bond-line-slice1.js");
  evaluate(window, fs.readFileSync(APP_PATH, "utf8"), APP_PATH);

  return dom;
}

function assertWrongRepairPreservesFocus(document, repairLabel, wrongAnswer, expectedFeedbackText) {
  var before = buttonByText(document, wrongAnswer);
  if (!before) throw new Error(repairLabel + " wrong-answer button not found: " + wrongAnswer);

  before.focus();
  check(repairLabel + "_pre_focus", repairLabel + " wrong-answer button can receive focus before submission", document.activeElement === before);

  before.click();

  check(repairLabel + "_same_element", repairLabel + " wrong answer keeps the exact same button element mounted", before.isConnected === true);
  check(repairLabel + "_active_element", repairLabel + " wrong answer preserves document.activeElement on that same button", document.activeElement === before);

  var feedbackNodes = document.querySelectorAll(".repair-feedback");
  check(repairLabel + "_feedback_count", repairLabel + " wrong answer renders exactly one visible retry-feedback container", feedbackNodes.length === 1);
  check(repairLabel + "_feedback_text", repairLabel + " visible retry feedback contains the narrow repair cue",
    feedbackNodes.length === 1 && feedbackNodes[0].textContent.indexOf(expectedFeedbackText) !== -1);

  var secondWrong = buttonByText(document, wrongAnswer);
  if (!secondWrong) throw new Error(repairLabel + " second wrong-answer button not found: " + wrongAnswer);
  secondWrong.focus();
  secondWrong.click();
  check(repairLabel + "_repeat_feedback_count", repairLabel + " repeated wrong answer does not duplicate visible feedback containers",
    document.querySelectorAll(".repair-feedback").length === 1);
  check(repairLabel + "_repeat_focus", repairLabel + " repeated wrong answer still preserves focus",
    document.activeElement === secondWrong && secondWrong.isConnected === true);
}

function evaluateResult() {
  if (!EXPECT_BUG) {
    console.log("=== SUMMARY: " + (failures.length ? "FAIL" : "PASS") + " ===");
    return failures.length ? 1 : 0;
  }

  var missingExpected = EXPECTED_HISTORICAL_FAILURES.filter(function (id) {
    return failures.indexOf(id) === -1;
  });
  var unexpected = failures.filter(function (id) {
    return EXPECTED_HISTORICAL_FAILURES.indexOf(id) === -1;
  });

  if (missingExpected.length || unexpected.length) {
    if (missingExpected.length) console.log("HISTORICAL PROOF MISSING EXPECTED FAILURES: " + missingExpected.join(", "));
    if (unexpected.length) console.log("HISTORICAL PROOF HAS UNEXPECTED FAILURES: " + unexpected.join(", "));
    console.log("=== HISTORICAL FOCUS BUG PROOF: FAIL ===");
    return 1;
  }

  console.log("EXPECTED HISTORICAL FOCUS FAILURES: " + EXPECTED_HISTORICAL_FAILURES.join(", "));
  console.log("NO UNRELATED ASSERTIONS FAILED.");
  console.log("=== HISTORICAL FOCUS BUG PROOF: PASS ===");
  return 0;
}

console.log("=== BOND-LINE REPAIR FOCUS DOM REGRESSION ===");
console.log("App under test: " + APP_PATH);
console.log("Historical bug proof mode: " + (EXPECT_BUG ? "ON" : "OFF"));

var dom = buildApp();
var document = dom.window.document;

clickButton(document, "The drawing may be using a shortcut.");
check("orientation_to_p1", "orientation advances to the first prerequisite gate", document.body.textContent.indexOf("One tiny carbon check") !== -1);

clickButton(document, "3");
check("p1_gate_to_repair", "wrong P1 gate enters the tiny carbon repair", document.body.textContent.indexOf("Tiny carbon-bond repair") !== -1);

assertWrongRepairPreservesFocus(
  document,
  "P1",
  "2",
  "One of carbon's four bond slots is already used"
);

clickButton(document, "3");
check("p1_correct_advances", "correct P1 repair still advances to P2 gate", document.body.textContent.indexOf("What is the line doing?") !== -1);

clickButton(document, "A carbon atom");
check("p2_gate_to_repair", "wrong P2 gate enters the tiny bond-line repair", document.body.textContent.indexOf("Tiny bond-line repair") !== -1);

assertWrongRepairPreservesFocus(
  document,
  "P2",
  "3",
  "Keep the atoms separate from the connections"
);

clickButton(document, "2");
check("p2_correct_advances", "correct P2 repair still advances to Watch Step 1", document.body.textContent.indexOf("Start with everything visible") !== -1);

var liveRegion = document.getElementById("liveRegion");
check("live_region", "screen-reader live region remains available", !!liveRegion && liveRegion.getAttribute("aria-live") === "polite");
var appSource = fs.readFileSync(APP_PATH, "utf8");
check("no_timers", "repair-focus fix introduces no timer-driven advancement",
  appSource.indexOf("setTimeout(") === -1 && appSource.indexOf("setInterval(") === -1);

var exitCode = evaluateResult();
dom.window.close();
if (exitCode) process.exit(exitCode);
