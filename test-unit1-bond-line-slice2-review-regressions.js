/* Behavioral regressions for Codex review findings on U1-01 Watch Step 2. */
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
function byText(doc, text) {
  return Array.prototype.slice.call(doc.querySelectorAll("button")).find(function (b) {
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
    runScripts: "outside-only",
    pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  Object.defineProperty(dom.window, "speechSynthesis", {
    configurable: true,
    value: { cancel: function () {}, speak: function () {} }
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

var dom = buildApp();
var doc = reachStep2(dom);

console.log("=== PAUSE MUST FREEZE THE EXACT WATCH STEP ===");
check("precondition: learner is on Watch Step 2", /Step 2/i.test(doc.getElementById("phaseLabel").textContent));
doc.getElementById("pauseBtn").click();
check("Pause changes control to Resume", doc.getElementById("pauseBtn").textContent.trim() === "Resume");
check("Back is disabled while paused", doc.getElementById("backBtn").disabled === true);
doc.getElementById("backBtn").click();
check("Back cannot move away from Step 2 while paused", /Step 2/i.test(doc.getElementById("phaseLabel").textContent));
check("paused visual still contains the Step 2 carbon-skeleton stage", !!doc.querySelector(".skeleton-stage"));

console.log("\n=== PREDICTION CONTROLS MUST CARRY THE QUESTION ACCESSIBLY ===");
var group = doc.querySelector(".prediction-grid");
var labelledBy = group ? group.getAttribute("aria-labelledby") : null;
var prompt = labelledBy ? doc.getElementById(labelledBy) : null;
check("prediction choices expose a labelled group", !!group && group.getAttribute("role") === "group" && !!labelledBy);
check("prediction group label points to the visible question", !!prompt && prompt.textContent.trim() === "If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?");
check("Yes/No/unsure controls are descendants of that labelled group",
  !!group && !!byText(group, "Yes") && !!byText(group, "No") && !!byText(group, "I am not sure yet"));

console.log("\n=== DE-EMPHASIZED HYDROGENS MUST REMAIN PERCEIVABLE ===");
var h = doc.querySelector("[data-step2-hydrogen]");
var hBond = doc.querySelector(".hydrogen-bonds-light line");
var skeletonBond = doc.querySelector(".skeleton-bonds line");
check("hydrogen label, C-H bond, and C-C skeleton bond all exist", !!h && !!hBond && !!skeletonBond);
if (h && hBond && skeletonBond) {
  var hOpacity = parseFloat(dom.window.getComputedStyle(h).opacity || "1");
  var hBondOpacity = parseFloat(dom.window.getComputedStyle(hBond).opacity || "1");
  var skeletonOpacity = parseFloat(dom.window.getComputedStyle(skeletonBond).opacity || "1");
  var base = [49, 40, 56];
  var white = [255, 255, 255];
  var hContrast = contrast(compositeOnWhite(base, hOpacity), white);
  var hBondContrast = contrast(compositeOnWhite(base, hBondOpacity), white);
  check("hydrogen label contrast is at least 3:1 on the white stage", hContrast >= 3);
  check("C-H bond contrast is at least 3:1 on the white stage", hBondContrast >= 3);
  check("hydrogens remain visually de-emphasized relative to the carbon skeleton",
    hOpacity < skeletonOpacity && hBondOpacity < skeletonOpacity);
}

dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
