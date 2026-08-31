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
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function dispatchAnimationEnd(node, animationName) {
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
  byText(doc, "No, the corner now stands for the carbon").click();
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C4"]'), "step4HideCarbon");
  doc.getElementById("nextBtn").click();
  return doc;
}

var dom = buildApp();
var doc = reachStep5(dom);
console.log("=== STEP 5 CODEX VISUAL REGRESSIONS ===");
var bondLines = doc.querySelectorAll(".step5-visible-bonds line");
check("Step 5 renders three structural bond lines", bondLines.length === 3);
if (bondLines.length) {
  var bondStyle = dom.window.getComputedStyle(bondLines[0]);
  check("Step 5 structural bonds have a visible computed stroke", bondStyle.stroke && bondStyle.stroke !== "none" && bondStyle.stroke !== "transparent");
  check("Step 5 structural bonds have nonzero computed stroke width", parseFloat(bondStyle.strokeWidth || "0") > 0);
}

var carbon = doc.querySelector('[data-step5-carbon="C2"]');
var hit = carbon && carbon.querySelector(".step5-hit-area");
check("carbon target hit radius is mobile-sized in SVG units", !!hit && Number(hit.getAttribute("r")) >= 50);
var bondHit = doc.querySelector('[data-step5-bond="BOND_2"] line');
check("bond misconception hit stroke is mobile-sized in SVG units", !!bondHit && Number(bondHit.getAttribute("stroke-width") || (bondHit.style && bondHit.style.strokeWidth) || 0) >= 90);

if (carbon) activate(carbon);
check("selected carbon target receives a visible selected class", !!carbon && carbon.classList.contains("selected"));
if (hit) {
  var selectedStyle = dom.window.getComputedStyle(hit);
  check("selected carbon target has a visible fill or stroke", (selectedStyle.fill && selectedStyle.fill !== "transparent" && selectedStyle.fill !== "none") || (selectedStyle.stroke && selectedStyle.stroke !== "transparent" && selectedStyle.stroke !== "none"));
}
var selectedMarker = doc.querySelector('[data-step5-marker="C2"]');
if (selectedMarker) {
  var markerStyle = dom.window.getComputedStyle(selectedMarker);
  check("selected numbered marker has a distinct selected fill", selectedMarker.classList.contains("selected") && markerStyle.fill && markerStyle.fill !== "#174f59" && markerStyle.fill !== "rgb(23, 79, 89)");
}

["C1","C3","C4"].forEach(function (id) {
  var node = doc.querySelector('[data-step5-carbon="' + id + '"]');
  if (node) activate(node);
});
var compare = byText(doc, "Show expanded view");
if (compare) compare.click();
var hLines = doc.querySelectorAll(".step5-expanded-h-bonds line");
check("expanded comparison renders carbon-hydrogen bonds", hLines.length === 10);
if (hLines.length) {
  var hStyle = dom.window.getComputedStyle(hLines[0]);
  check("expanded comparison C-H bonds have visible computed stroke", hStyle.stroke && hStyle.stroke !== "none" && hStyle.stroke !== "transparent");
}

dom.window.close();
console.log("=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
