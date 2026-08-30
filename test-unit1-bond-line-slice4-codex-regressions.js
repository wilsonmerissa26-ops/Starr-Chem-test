/*
 * PR #79 Codex regressions for Watch Step 4.
 * Real DOM/CSS behavior:
 * 1) collapse animations cannot overlap,
 * 2) prediction choices stay gated until C2 finishes (reduced motion may enable immediately),
 * 3) Replay while the same-position repair is active restarts that repair visual,
 * 4) Next stays gated until the final C4 collapse finishes, including repair and completed Replay.
 */
"use strict";

var fs = require("fs");
var path = require("path");
var JSDOM = require("jsdom").JSDOM;
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
function ms(value) {
  value = String(value || "0s").trim();
  if (/ms$/.test(value)) return parseFloat(value);
  if (/s$/.test(value)) return parseFloat(value) * 1000;
  return parseFloat(value) || 0;
}
function buildApp(reducedMotion) {
  var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
    runScripts: "outside-only", pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  dom.window.matchMedia = function (query) {
    return {
      matches: !!reducedMotion && /prefers-reduced-motion\s*:\s*reduce/.test(query),
      media: query,
      onchange: null,
      addListener: function () {}, removeListener: function () {},
      addEventListener: function () {}, removeEventListener: function () {}, dispatchEvent: function () { return true; }
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
function reachStep4(dom) {
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
  return doc;
}
function dispatchAnimationEnd(node, animationName) {
  if (!node) return;
  var win = node.ownerDocument.defaultView;
  var event = new win.Event("animationend", { bubbles: true, cancelable: false });
  Object.defineProperty(event, "animationName", { value: animationName || "step4HideCarbon" });
  node.dispatchEvent(event);
}
function unlockInitialPrediction(doc) {
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
}
function finishFinalCollapse(doc) {
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C4"]'), "step4HideCarbon");
}

console.log("=== COLLAPSE ANIMATIONS MUST NOT OVERLAP ===");
var orderDom = buildApp(false);
var orderDoc = reachStep4(orderDom);
var c1 = orderDoc.querySelector('[data-step4-label="C1"]');
var c2 = orderDoc.querySelector('[data-step4-label="C2"]');
check("precondition: C1/C2 collapse nodes exist", !!c1 && !!c2);
if (c1 && c2) {
  var s1 = orderDom.window.getComputedStyle(c1);
  var s2 = orderDom.window.getComputedStyle(c2);
  var c1End = ms(s1.animationDelay) + ms(s1.animationDuration);
  check("C2 starts only after C1 finishes", ms(s2.animationDelay) >= c1End);
}

console.log("\n=== PREDICTION WAITS FOR C2 ANIMATION END ===");
var choices = Array.prototype.slice.call(orderDoc.querySelectorAll(".step4-prediction-grid button"));
check("Step 4 renders all prediction choices", choices.length === 3);
check("prediction choices begin disabled while C1/C2 are collapsing",
  choices.length === 3 && choices.every(function (button) { return button.disabled === true; }));
var phaseBeforeEarlyClick = orderDoc.getElementById("phaseLabel").textContent;
if (choices[1]) choices[1].click();
check("disabled prediction cannot complete Step 4 early",
  orderDoc.getElementById("phaseLabel").textContent === phaseBeforeEarlyClick && orderDoc.getElementById("nextBtn").disabled === true);
unlockInitialPrediction(orderDoc);
check("C2 animation end enables all prediction choices",
  choices.length === 3 && choices.every(function (button) { return button.disabled === false; }));
orderDom.window.close();

console.log("\n=== REDUCED MOTION ENABLES PREDICTION IMMEDIATELY ===");
var reducedDom = buildApp(true);
var reducedDoc = reachStep4(reducedDom);
var reducedChoices = Array.prototype.slice.call(reducedDoc.querySelectorAll(".step4-prediction-grid button"));
check("reduced-motion path does not wait for an animation that will not run",
  reducedChoices.length === 3 && reducedChoices.every(function (button) { return button.disabled === false; }));
byText(reducedDoc, "No, the corner now stands for the carbon").click();
check("reduced-motion completion enables Next immediately",
  reducedDoc.getElementById("nextBtn").disabled === false);
reducedDom.window.close();

console.log("\n=== REPAIR REPLAY RESTARTS THE SAME C2 TOGGLE ===");
var repairDom = buildApp(false);
var repairDoc = reachStep4(repairDom);
unlockInitialPrediction(repairDoc);
var yes = byText(repairDoc, "Yes");
check("precondition: Yes becomes available after C2 finishes", !!yes && yes.disabled === false);
if (yes) yes.click();
var toggleBefore = repairDoc.querySelector('[data-step4-toggle-carbon="C2"]');
check("precondition: same-position repair toggle exists", !!toggleBefore);
repairDoc.getElementById("replayBtn").click();
var toggleAfter = repairDoc.querySelector('[data-step4-toggle-carbon="C2"]');
check("Replay while repair is active remounts the C2 toggle visual",
  !!toggleBefore && !!toggleAfter && toggleAfter !== toggleBefore && !toggleBefore.isConnected);
check("Replay stays on Step 4 repair",
  /Step 4 · same-position repair/i.test(repairDoc.getElementById("phaseLabel").textContent));
if (toggleAfter) {
  var toggleStyle = repairDom.window.getComputedStyle(toggleAfter);
  check("replayed repair still carries the three-iteration toggle animation",
    /step4ToggleCarbon/i.test(toggleStyle.animationName || "") && parseFloat(toggleStyle.animationIterationCount || "0") === 3);
}
repairDom.window.close();

console.log("\n=== NEXT WAITS FOR FINAL C4 COLLAPSE AFTER DIRECT CORRECT ===");
var directDom = buildApp(false);
var directDoc = reachStep4(directDom);
unlockInitialPrediction(directDoc);
byText(directDoc, "No, the corner now stands for the carbon").click();
check("direct correct answer starts the C3/C4 continuation but keeps Next disabled",
  !!directDoc.querySelector('[data-step4-label="C4"]') && directDoc.getElementById("nextBtn").disabled === true);
finishFinalCollapse(directDoc);
check("C4 animation end releases Next after direct correct",
  directDoc.getElementById("nextBtn").disabled === false);

console.log("\n=== COMPLETED STEP 4 REPLAY REGATES NEXT UNTIL C4 ===");
var completedStageBeforeReplay = directDoc.querySelector("[data-step4-visual]");
directDoc.getElementById("replayBtn").click();
var completedStageAfterReplay = directDoc.querySelector("[data-step4-visual]");
check("completed Step 4 Replay remounts the four-label collapse visual",
  !!completedStageBeforeReplay && !!completedStageAfterReplay && completedStageAfterReplay !== completedStageBeforeReplay);
check("completed Step 4 Replay disables Next while the replayed sequence is running",
  directDoc.getElementById("nextBtn").disabled === true);
finishFinalCollapse(directDoc);
check("completed Replay releases Next only when replayed C4 finishes",
  directDoc.getElementById("nextBtn").disabled === false);
directDom.window.close();

console.log("\n=== REPAIR CORRECTION ALSO WAITS FOR FINAL C4 COLLAPSE ===");
var correctedDom = buildApp(false);
var correctedDoc = reachStep4(correctedDom);
unlockInitialPrediction(correctedDoc);
byText(correctedDoc, "Yes").click();
dispatchAnimationEnd(correctedDoc.querySelector('[data-step4-toggle-carbon="C2"]'), "step4ToggleCarbon");
var correctedChoice = byText(correctedDoc, "No, the corner now stands for the carbon");
check("repair correction becomes available after the three-toggle repair", !!correctedChoice && correctedChoice.disabled === false);
if (correctedChoice) correctedChoice.click();
check("corrected answer keeps Next disabled while C3/C4 finish collapsing",
  correctedDoc.getElementById("nextBtn").disabled === true);
finishFinalCollapse(correctedDoc);
check("corrected path releases Next when C4 finishes",
  correctedDoc.getElementById("nextBtn").disabled === false);
correctedDom.window.close();

check("Codex fixes add no JavaScript timer-driven advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
