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
 */
"use strict";

var fs = require("fs");
var path = require("path");
var JSDOM = require("jsdom").JSDOM;

var ROOT = __dirname;
var APP_PATH = process.env.BOND_LINE_APP_PATH || path.join(ROOT, "course-units/unit1/bond-line/bond-line-app.js");
var failed = 0;

function check(label, condition) {
  if (condition) console.log("PASS  " + label);
  else {
    console.log("FAIL  " + label);
    failed += 1;
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
  check(repairLabel + " wrong-answer button can receive focus before submission", document.activeElement === before);

  before.click();

  check(repairLabel + " wrong answer keeps the exact same button element mounted", before.isConnected === true);
  check(repairLabel + " wrong answer preserves document.activeElement on that same button", document.activeElement === before);

  var feedbackNodes = document.querySelectorAll(".repair-feedback");
  check(repairLabel + " wrong answer renders exactly one visible retry-feedback container", feedbackNodes.length === 1);
  check(repairLabel + " visible retry feedback contains the narrow repair cue",
    feedbackNodes.length === 1 && feedbackNodes[0].textContent.indexOf(expectedFeedbackText) !== -1);

  // A second wrong attempt must reuse the same visible feedback container.
  var secondWrong = buttonByText(document, wrongAnswer);
  secondWrong.focus();
  secondWrong.click();
  check(repairLabel + " repeated wrong answer does not duplicate visible feedback containers",
    document.querySelectorAll(".repair-feedback").length === 1);
  check(repairLabel + " repeated wrong answer still preserves focus",
    document.activeElement === secondWrong && secondWrong.isConnected === true);
}

console.log("=== BOND-LINE REPAIR FOCUS DOM REGRESSION ===");
console.log("App under test: " + APP_PATH);

var dom = buildApp();
var document = dom.window.document;

// Orientation -> P1 gate.
clickButton(document, "The drawing may be using a shortcut.");
check("orientation advances to the first prerequisite gate", document.body.textContent.indexOf("One tiny carbon check") !== -1);

// Fail P1 gate to enter the P1 repair.
clickButton(document, "3");
check("wrong P1 gate enters the tiny carbon repair", document.body.textContent.indexOf("Tiny carbon-bond repair") !== -1);

assertWrongRepairPreservesFocus(
  document,
  "P1",
  "2",
  "One of carbon's four bond slots is already used"
);

// Correct P1 repair must still advance normally after the in-place wrong-answer path.
clickButton(document, "3");
check("correct P1 repair still advances to P2 gate", document.body.textContent.indexOf("What is the line doing?") !== -1);

// Fail P2 gate to enter the P2 repair.
clickButton(document, "A carbon atom");
check("wrong P2 gate enters the tiny bond-line repair", document.body.textContent.indexOf("Tiny bond-line repair") !== -1);

assertWrongRepairPreservesFocus(
  document,
  "P2",
  "3",
  "Keep the atoms separate from the connections"
);

// Correct P2 repair must still advance into Watch.
clickButton(document, "2");
check("correct P2 repair still advances to Watch Step 1", document.body.textContent.indexOf("Start with everything visible") !== -1);

// Assistive announcement path remains present and no timer-driven teaching was introduced.
var liveRegion = document.getElementById("liveRegion");
check("screen-reader live region remains available", !!liveRegion && liveRegion.getAttribute("aria-live") === "polite");
var appSource = fs.readFileSync(APP_PATH, "utf8");
check("repair-focus fix introduces no timer-driven advancement",
  appSource.indexOf("setTimeout(") === -1 && appSource.indexOf("setInterval(") === -1);

console.log("=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
dom.window.close();
if (failed) process.exit(1);
