/*
 * U1-01 Bond-Line Watch Step 6 RED-first contract.
 * Frozen source: recover implied hydrogens from visible bond order on
 * internal carbon 3, then terminal carbon 4. Supported Watch only.
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
function dispatchAnimationEnd(node, animationName) {
  if (!node) return;
  var win = node.ownerDocument.defaultView;
  var event = new win.Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: animationName });
  node.dispatchEvent(event);
}
function buildApp() {
  var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
    runScripts: "outside-only", pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  dom.window.matchMedia = function (query) {
    return { matches: false, media: query, onchange: null,
      addListener: function () {}, removeListener: function () {},
      addEventListener: function () {}, removeEventListener: function () {},
      dispatchEvent: function () { return true; } };
  };
  Object.defineProperty(dom.window, "speechSynthesis", {
    configurable: true, value: { cancel: function () {}, speak: function () {} }
  });
  dom.window.SpeechSynthesisUtterance = function (text) { this.text = text; };
  evalFile(dom.window, "watch-mode.js");
  evalFile(dom.window, "unit1-skill-registry.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-slice1.js");
  evalFile(dom.window, "course-units/unit1/bond-line/bond-line-app.js");
  return dom;
}
function reachStep6(dom) {
  var doc = dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function (id) { activate(doc.querySelector('[data-carbon-id="' + id + '"]')); });
  doc.getElementById("nextBtn").click();
  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();
  byText(doc, "3").click();
  doc.getElementById("nextBtn").click();
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
  byText(doc, "No, the corner now stands for the carbon").click();
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C4"]'), "step4HideCarbon");
  doc.getElementById("nextBtn").click();
  ["C1","C2","C3","C4"].forEach(function (id) { activate(doc.querySelector('[data-step5-carbon="' + id + '"]')); });
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== SLICE 6 PURE LESSON CONTRACT ===");
check("Watch sequence exposes a sixth step", Slice.WATCH_SEQUENCE.steps.length >= 6);
var step6 = Slice.WATCH_SEQUENCE.steps[5] || null;
check("Step 6 has stable identity", !!step6 && step6.id === "bl_watch_6");
check("Step 6 keeps the butane bond-line structure visible",
  !!step6 && step6.visual && step6.visual.representation === "bond_line_implied_hydrogens" && Slice.WATCH_SEQUENCE.molecule === "butane");
check("Step 6 narration teaches total bond order rather than four new hydrogens",
  !!step6 && /two single bonds already drawn/i.test(step6.narration || "") && /four total/i.test(step6.narration || "") && /CH2/i.test(step6.narration || ""));
check("Step 6 first learner prompt is frozen carbon 3 question",
  !!step6 && step6.interactions && step6.interactions.carbon3 &&
  step6.interactions.carbon3.prompt === "Carbon 3 also has two visible single bonds. How many hydrogens are implied?" &&
  step6.interactions.carbon3.answer === 2);
check("Step 6 second learner prompt is frozen carbon 4 question",
  !!step6 && step6.interactions && step6.interactions.carbon4 &&
  step6.interactions.carbon4.prompt === "This end carbon has one visible single bond. How many hydrogens are implied?" &&
  step6.interactions.carbon4.answer === 3);
check("too-many feedback is frozen",
  !!step6 && step6.wrongHighFeedback === "Count the bond order already visible first. Carbon is not getting four new hydrogens. It is reaching four total bonds.");
check("too-few repair exposes the running-count relationship",
  !!step6 && step6.wrongLowFormula === "visible bond order + implied C—H bonds = 4");

var s = Slice.createSession();
check("session initializes Step 6 at carbon 3", s.watchStep6Target === "C3");
check("session initializes Step 6 answers empty", s.watchStep6Carbon3Answer === null && s.watchStep6Carbon4Answer === null);
check("session initializes Step 6 incomplete", s.watchStep6Complete === false);
check("pure runtime exposes Step 6 submission", typeof Slice.submitWatchStep6Hydrogens === "function");
if (typeof Slice.submitWatchStep6Hydrogens === "function") {
  s.phase = "watch_step_6";
  var beforeEvidence = s.evidence.length;
  var high = Slice.submitWatchStep6Hydrogens(s, 4);
  check("too many hydrogens stays on carbon 3 with explicit total-bond repair",
    high && high.accepted === true && high.correct === false && high.feedback === "Count the bond order already visible first. Carbon is not getting four new hydrogens. It is reaching four total bonds." && s.watchStep6Target === "C3");
  var low = Slice.submitWatchStep6Hydrogens(s, 1);
  check("too few hydrogens stays on carbon 3 and exposes running-count formula",
    low && low.accepted === true && low.correct === false && low.formula === "visible bond order + implied C—H bonds = 4" && s.watchStep6Target === "C3");
  var c3 = Slice.submitWatchStep6Hydrogens(s, 2);
  check("correct carbon 3 answer advances only to carbon 4",
    c3 && c3.correct === true && s.watchStep6Target === "C4" && s.watchStep6Complete === false);
  var c4 = Slice.submitWatchStep6Hydrogens(s, 3);
  check("correct carbon 4 answer completes supported Step 6",
    c4 && c4.correct === true && s.watchStep6Complete === true);
  check("Step 6 Watch attempts create no independent/mastery evidence", s.evidence.length === beforeEvidence);
}

console.log("\n=== SLICE 6 REAL LEARNER PAGE ===");
var dom = buildApp();
var doc = reachStep6(dom);
check("Next from completed Step 5 opens Watch Step 6", /Step 6/i.test(doc.getElementById("phaseLabel").textContent));
check("Step 6 keeps a finished bond-line butane visual", !!doc.querySelector("[data-step6-visual]"));
check("Step 6 highlights carbon 3 first", !!doc.querySelector('[data-step6-carbon="C3"].active'));
check("Step 6 visibly asks the frozen carbon 3 hydrogen question",
  doc.getElementById("lessonPanel").textContent.indexOf("Carbon 3 also has two visible single bonds. How many hydrogens are implied?") !== -1);
check("Next is gated before both Step 6 interactions are complete", doc.getElementById("nextBtn").disabled === true);
var four = byText(doc, "4");
if (four) four.click();
check("too-high answer visibly teaches total bonds instead of four new hydrogens",
  doc.getElementById("lessonPanel").textContent.indexOf("Carbon is not getting four new hydrogens. It is reaching four total bonds.") !== -1);
var one = byText(doc, "1");
if (one) one.click();
check("too-low answer visibly shows the running-count relationship",
  doc.getElementById("lessonPanel").textContent.indexOf("visible bond order + implied C—H bonds = 4") !== -1);
var two = byText(doc, "2");
if (two) two.click();
check("correct carbon 3 answer intentionally moves focus/content to carbon 4",
  !!doc.querySelector('[data-step6-carbon="C4"].active') &&
  doc.getElementById("lessonPanel").textContent.indexOf("This end carbon has one visible single bond. How many hydrogens are implied?") !== -1);
var three = byText(doc, "3");
if (three) three.click();
check("correct carbon 4 answer enables learner-controlled Next", doc.getElementById("nextBtn").disabled === false);
check("Slice 6 introduces no JavaScript timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);
dom.window.close();

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
