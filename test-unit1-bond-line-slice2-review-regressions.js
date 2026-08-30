/* Behavioral regressions for Codex review findings on U1-01 Watch Step 2. */
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
  return Array.prototype.slice.call(root.querySelectorAll("button")).find(function (b) {
    return b.textContent.trim() === text;
  }) || null;
}
function activate(node) {
  if (!node) throw new Error("Cannot activate missing node");
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function buildApp() {
  var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
    runScripts: "outside-only", pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
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
function reachStep2(dom) {
  var doc = dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function (id) {
    activate(doc.querySelector('[data-carbon-id="' + id + '"]'));
  });
  doc.getElementById("nextBtn").click();
  return doc;
}
function lin(c) {
  c = c / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}
function luminance(rgb) {
  return 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
}
function contrast(a, b) {
  var la = luminance(a), lb = luminance(b);
  var hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}
function compositeOnWhite(rgb, opacity) {
  return rgb.map(function (channel) { return Math.round(opacity * channel + (1 - opacity) * 255); });
}

console.log("=== PAUSE MUST FREEZE THE EXACT WATCH STEP ===");
var pauseDom = buildApp();
var pauseDoc = reachStep2(pauseDom);
check("precondition: learner is on Watch Step 2", /Step 2/i.test(pauseDoc.getElementById("phaseLabel").textContent));
pauseDoc.getElementById("pauseBtn").click();
check("Pause changes control to Resume", pauseDoc.getElementById("pauseBtn").textContent.trim() === "Resume");
check("Back is disabled while paused", pauseDoc.getElementById("backBtn").disabled === true);
pauseDoc.getElementById("backBtn").click();
check("Back cannot move away from Step 2 while paused", /Step 2/i.test(pauseDoc.getElementById("phaseLabel").textContent));
check("paused visual remains the Step 2 carbon-skeleton stage", !!pauseDoc.querySelector(".skeleton-stage"));
pauseDom.window.close();

console.log("\n=== PREDICTION CONTROLS MUST CARRY THE QUESTION ACCESSIBLY ===");
var labelDom = buildApp();
var labelDoc = reachStep2(labelDom);
var group = labelDoc.querySelector(".prediction-grid");
var labelledBy = group ? group.getAttribute("aria-labelledby") : null;
var prompt = labelledBy ? labelDoc.getElementById(labelledBy) : null;
check("prediction choices expose a labelled group", !!group && group.getAttribute("role") === "group" && !!labelledBy);
check("prediction group label points to the visible question", !!prompt && prompt.textContent.trim() === "If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?");
check("Yes/No/unsure controls are descendants of that labelled group",
  !!group && !!byText(group, "Yes") && !!byText(group, "No") && !!byText(group, "I am not sure yet"));
labelDom.window.close();

console.log("\n=== DE-EMPHASIZED HYDROGENS MUST REMAIN PERCEIVABLE ===");
var contrastDom = buildApp();
var contrastDoc = reachStep2(contrastDom);
var h = contrastDoc.querySelector("[data-step2-hydrogen]");
var hBond = contrastDoc.querySelector(".hydrogen-bonds-light line");
var skeletonBond = contrastDoc.querySelector(".skeleton-bonds line");
check("hydrogen label, C-H bond, and C-C skeleton bond all exist", !!h && !!hBond && !!skeletonBond);
if (h && hBond && skeletonBond) {
  var hOpacity = parseFloat(contrastDom.window.getComputedStyle(h).opacity || "1");
  var hBondOpacity = parseFloat(contrastDom.window.getComputedStyle(hBond).opacity || "1");
  var skeletonOpacity = parseFloat(contrastDom.window.getComputedStyle(skeletonBond).opacity || "1");
  var base = [49, 40, 56], white = [255, 255, 255];
  var hContrast = contrast(compositeOnWhite(base, hOpacity), white);
  var hBondContrast = contrast(compositeOnWhite(base, hBondOpacity), white);
  check("hydrogen label contrast is at least 3:1 on the white stage", hContrast >= 3);
  check("C-H bond contrast is at least 3:1 on the white stage", hBondContrast >= 3);
  check("hydrogens remain visually de-emphasized relative to the carbon skeleton",
    hOpacity < skeletonOpacity && hBondOpacity < skeletonOpacity);
}
contrastDom.window.close();

console.log("\n=== STEP 2 COMPLETION-NAVIGATION REGRESSION SURVIVES LATER SLICES ===");
var completionDom = buildApp();
var completionDoc = reachStep2(completionDom);
byText(completionDoc, "No").click();
check("precondition: Step 2 prediction enables Next", completionDoc.getElementById("nextBtn").disabled === false);
completionDoc.getElementById("nextBtn").click();
check("extended sequence moves from Step 2 into Step 3", /Watch · I Do · Step 3/i.test(completionDoc.getElementById("phaseLabel").textContent));
byText(completionDoc, "3").click();
check("precondition: Step 3 interaction enables Next", completionDoc.getElementById("nextBtn").disabled === false);
completionDoc.getElementById("nextBtn").click();
if (Slice.WATCH_SEQUENCE.steps.length === 3) {
  check("three-step sequence reaches its final completion screen", /Step 3 complete/i.test(completionDoc.getElementById("phaseLabel").textContent));
  completionDoc.getElementById("backBtn").click();
  check("Back from completion returns exactly one Watch step to Step 2",
    /Watch · I Do · Step 2/i.test(completionDoc.getElementById("phaseLabel").textContent) &&
    completionDoc.body.textContent.indexOf("See the carbon skeleton") !== -1);
} else {
  check("when later Watch slices exist, Step 3 advances forward instead of falsely completing",
    /Watch · I Do · Step 4/i.test(completionDoc.getElementById("phaseLabel").textContent));
  completionDoc.getElementById("backBtn").click();
  check("Back from the appended step still returns exactly one Watch step to Step 3",
    /Watch · I Do · Step 3/i.test(completionDoc.getElementById("phaseLabel").textContent));
}
completionDom.window.close();

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
