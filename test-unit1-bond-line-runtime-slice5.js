/*
 * U1-01 Bond-Line Watch Step 5 RED-first contract.
 * Frozen source: finished four-carbon zig-zag, numbered carbon positions,
 * tap every carbon, role-preserving misconception feedback, then compare
 * expanded <-> bond-line views with carbon numbering preserved.
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
    return {
      matches: false, media: query, onchange: null,
      addListener: function () {}, removeListener: function () {},
      addEventListener: function () {}, removeEventListener: function () {},
      dispatchEvent: function () { return true; }
    };
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
function reachStep5(dom) {
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
  var correct4 = byText(doc, "No, the corner now stands for the carbon");
  if (correct4) correct4.click();
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C4"]'), "step4HideCarbon");
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== SLICE 5 PURE LESSON CONTRACT ===");
check("Watch sequence exposes a fifth step", Slice.WATCH_SEQUENCE.steps.length >= 5);
var step5 = Slice.WATCH_SEQUENCE.steps[4];
check("Step 5 has stable identity", !!step5 && step5.id === "bl_watch_5");
check("Step 5 uses the finished bond-line representation", !!step5 && step5.visual && step5.visual.representation === "finished_bond_line");
check("Step 5 retains four carbon positions", !!step5 && step5.visual && Array.isArray(step5.visual.carbonPositions) && step5.visual.carbonPositions.length === 4);
check("Step 5 retains exactly three visible bond segments", !!step5 && step5.visual && step5.visual.visibleBondSegments === 3);
check("Step 5 carries the frozen tap prompt", !!step5 && step5.interaction && step5.interaction.prompt === "Tap every carbon in the bond-line structure.");
check("Step 5 carries exact bond-middle misconception feedback", !!step5 && step5.interaction && step5.interaction.bondSegmentFeedback === "That is a bond between carbons, not another carbon. Look for an end or a corner.");
check("Step 5 carries exact endpoint misconception feedback", !!step5 && step5.interaction && step5.interaction.endpointFeedback === "A line end counts too. Endpoints are carbon unless another atom is explicitly labeled there.");
check("Step 5 carries exact all-four feedback", !!step5 && step5.interaction && step5.interaction.completeFeedback === "Exactly four, just like the fully written structure we started with.");

var s = Slice.createSession();
check("session initializes Step 5 taps empty", Array.isArray(s.watchStep5CarbonIds) && s.watchStep5CarbonIds.length === 0);
check("session initializes Step 5 incomplete", s.watchStep5Complete === false);
check("session initializes Step 5 in bond-line view", s.watchStep5View === "bond_line");
check("pure runtime exposes Step 5 carbon tap", typeof Slice.tapWatchStep5Carbon === "function");
check("pure runtime exposes Step 5 comparison toggle", typeof Slice.toggleWatchStep5View === "function");

if (typeof Slice.tapWatchStep5Carbon === "function") {
  s.phase = "watch_step_5";
  var beforeEvidence = s.evidence.length;
  var mid = Slice.tapWatchStep5Carbon(s, "BOND_2");
  check("bond-segment tap is rejected as a carbon", mid && mid.accepted === false && mid.reason === "bond_segment");
  check("bond-segment tap returns frozen role feedback", mid && mid.feedback === "That is a bond between carbons, not another carbon. Look for an end or a corner.");
  ["C2","C3","C1"].forEach(function (id) { Slice.tapWatchStep5Carbon(s, id); });
  var third = Slice.tapWatchStep5Carbon(s, "C1");
  check("duplicate carbon cannot create fake progress", third && third.accepted === false && third.reason === "already_tapped");
  var endpointHint = Slice.tapWatchStep5Carbon(s, "C2");
  check("repeated already-found tap never creates mastery evidence", s.evidence.length === beforeEvidence && endpointHint && endpointHint.accepted === false);
  var final = Slice.tapWatchStep5Carbon(s, "C4");
  check("fourth unique carbon completes Step 5", final && final.accepted === true && final.stepComplete === true && s.watchStep5Complete === true);
  check("supported Step 5 creates no independent/mastery evidence", s.evidence.length === beforeEvidence);
  if (typeof Slice.toggleWatchStep5View === "function") {
    var toggled = Slice.toggleWatchStep5View(s);
    check("completed Step 5 can compare expanded view", toggled && toggled.accepted === true && s.watchStep5View === "expanded");
    Slice.toggleWatchStep5View(s);
    check("comparison toggles back to bond-line without losing completion", s.watchStep5View === "bond_line" && s.watchStep5Complete === true);
  }
}

console.log("\n=== SLICE 5 REAL LEARNER PAGE ===");
var dom = buildApp();
var doc = reachStep5(dom);
check("Next from completed Step 4 opens Watch Step 5", /Step 5/i.test(doc.getElementById("phaseLabel").textContent));
check("Step 5 renders the frozen tap prompt", /Tap every carbon in the bond-line structure\./i.test(doc.getElementById("lessonPanel").textContent));
var carbonTargets = doc.querySelectorAll("[data-step5-carbon]");
var markers = doc.querySelectorAll("[data-step5-marker]");
check("Step 5 renders exactly four tappable carbon positions", carbonTargets.length === 4);
check("Step 5 renders temporary numbered markers 1 through 4", markers.length === 4 && Array.prototype.map.call(markers, function (n) { return n.textContent.trim(); }).join("") === "1234");
check("Next begins gated until all four carbons are found", doc.getElementById("nextBtn").disabled === true);
var bondMid = doc.querySelector("[data-step5-bond='BOND_2']");
if (bondMid) activate(bondMid);
check("bond-middle tap shows the frozen not-a-carbon feedback", /That is a bond between carbons, not another carbon\. Look for an end or a corner\./i.test(doc.getElementById("lessonPanel").textContent));
["C2","C3","C1","C4"].forEach(function (id) {
  var node = doc.querySelector('[data-step5-carbon="' + id + '"]');
  if (node) activate(node);
});
check("finding all four shows the frozen completion feedback", /Exactly four, just like the fully written structure we started with\./i.test(doc.getElementById("lessonPanel").textContent));
check("finding all four enables learner-controlled Next", doc.getElementById("nextBtn").disabled === false);
var compareButton = byText(doc, "Show expanded view");
check("completed Step 5 exposes expanded/bond-line comparison", !!compareButton);
if (compareButton) compareButton.click();
check("expanded comparison preserves four numbered carbon mappings", doc.querySelectorAll("[data-step5-marker]").length === 4 && /expanded/i.test(doc.getElementById("phaseLabel").textContent + " " + doc.getElementById("lessonPanel").textContent));
check("Slice 5 introduces no JavaScript timer-driven instructional advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);
dom.window.close();

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
