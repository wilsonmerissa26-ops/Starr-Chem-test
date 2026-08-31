/*
 * U1-01 Bond-Line Watch Step 7 RED-first contract.
 * Frozen source: heteroatoms remain explicit in bond-line notation.
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
function reachStep7(dom) {
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
  byText(doc, "2").click();
  byText(doc, "3").click();
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== SLICE 7 PURE LESSON CONTRACT ===");
check("Watch sequence exposes a seventh step", Slice.WATCH_SEQUENCE.steps.length >= 7);
var step7 = Slice.WATCH_SEQUENCE.steps[6] || null;
check("Step 7 has stable identity", !!step7 && step7.id === "bl_watch_7");
check("Step 7 uses an explicit heteroatom example",
  !!step7 && step7.visual && step7.visual.representation === "heteroatom_explicit" && step7.visual.example === "1-propanol");
check("Step 7 keeps oxygen and its attached hydrogen written",
  !!step7 && step7.visual && step7.visual.explicitAtoms && step7.visual.explicitAtoms.join("|") === "O|H");
check("Step 7 narration teaches carbon shorthand and heteroatoms",
  !!step7 && /Carbon gets special shorthand/i.test(step7.narration || "") && /heteroatom/i.test(step7.narration || ""));
check("plain-language heteroatom definition is frozen",
  !!step7 && step7.definition === "Heteroatom just means an atom in the organic structure that is not carbon or hydrogen.");
check("Step 7 prediction prompt is frozen",
  !!step7 && step7.prediction && step7.prediction.prompt === "If this oxygen label disappeared completely, would the bond-line drawing still tell us an oxygen is there?");
check("Step 7 prediction answer is No", !!step7 && step7.prediction && step7.prediction.answer === "no");
check("Step 7 correct feedback is frozen",
  !!step7 && step7.prediction && step7.prediction.feedback === "Right. Unlabeled ends and corners default to carbon. An oxygen must be labeled O.");
check("Step 7 avoids the false all-hydrogens-hidden rule",
  !!step7 && step7.misconceptionGuard === "Hydrogens attached to carbon are usually omitted in bond-line notation. Hydrogens attached to heteroatoms are often shown because they can change the functional group and chemical behavior.");

var s = Slice.createSession();
check("session initializes Step 7 prediction empty", s.watchStep7Prediction === null);
check("session initializes Step 7 incomplete", s.watchStep7Complete === false);
check("pure runtime exposes Step 7 prediction submission", typeof Slice.submitWatchStep7Prediction === "function");
if (typeof Slice.submitWatchStep7Prediction === "function") {
  s.phase = "watch_step_7";
  var beforeEvidence = s.evidence.length;
  var wrong = Slice.submitWatchStep7Prediction(s, "yes");
  check("wrong Watch prediction is accepted as supported teaching, not mastery",
    wrong && wrong.accepted === true && wrong.correct === false && s.watchStep7Complete === true);
  check("wrong Watch prediction receives explicit oxygen-label correction without false praise",
    wrong && wrong.feedback === "Unlabeled ends and corners default to carbon. An oxygen must be labeled O.");
  check("Step 7 wrong prediction creates no independent/mastery evidence", s.evidence.length === beforeEvidence);

  var clean = Slice.createSession();
  clean.phase = "watch_step_7";
  var right = Slice.submitWatchStep7Prediction(clean, "no");
  check("correct Watch prediction receives the frozen correct feedback",
    right && right.accepted === true && right.correct === true && right.feedback === "Right. Unlabeled ends and corners default to carbon. An oxygen must be labeled O." && clean.watchStep7Complete === true);
  check("Step 7 correct prediction creates no independent/mastery evidence", clean.evidence.length === 0);
}

console.log("\n=== SLICE 7 REAL LEARNER PAGE ===");
var dom = buildApp();
var doc = reachStep7(dom);
check("Next from completed Step 6 opens Watch Step 7", /Step 7/i.test(doc.getElementById("phaseLabel").textContent));
check("Step 7 renders the heteroatom example", !!doc.querySelector("[data-step7-visual]"));
check("oxygen remains explicitly labeled O", !!doc.querySelector('[data-step7-atom="O"]') && doc.querySelector('[data-step7-atom="O"]').textContent.trim() === "O");
check("heteroatom hydrogen remains explicitly labeled H", !!doc.querySelector('[data-step7-atom="H"]') && doc.querySelector('[data-step7-atom="H"]').textContent.trim() === "H");
check("Step 7 shows plain-language heteroatom definition",
  doc.getElementById("lessonPanel").textContent.indexOf("Heteroatom just means an atom in the organic structure that is not carbon or hydrogen.") !== -1);
check("Step 7 asks the frozen oxygen-label prediction",
  doc.getElementById("lessonPanel").textContent.indexOf("If this oxygen label disappeared completely, would the bond-line drawing still tell us an oxygen is there?") !== -1);
check("Step 7 displays the misconception guard",
  doc.getElementById("lessonPanel").textContent.indexOf("Hydrogens attached to carbon are usually omitted in bond-line notation. Hydrogens attached to heteroatoms are often shown because they can change the functional group and chemical behavior.") !== -1);
check("Next begins gated until prediction is answered", doc.getElementById("nextBtn").disabled === true);
var no = byText(doc, "No");
if (no) no.click();
check("answering prediction shows frozen oxygen feedback",
  doc.getElementById("lessonPanel").textContent.indexOf("Right. Unlabeled ends and corners default to carbon. An oxygen must be labeled O.") !== -1);
check("supported prediction enables learner-controlled Next", doc.getElementById("nextBtn").disabled === false);
check("Slice 7 introduces no JavaScript timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);
dom.window.close();

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
