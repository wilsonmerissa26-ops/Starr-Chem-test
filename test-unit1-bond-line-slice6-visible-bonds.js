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

var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
  runScripts: "outside-only",
  pretendToBeVisual: true,
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

console.log("=== STEP 6 VISIBLE-BOND REGRESSION ===");
var lines = doc.querySelectorAll(".step6-visible-bonds line");
check("Step 6 renders exactly three C-C bond segments", lines.length === 3);
if (lines.length) {
  var computed = dom.window.getComputedStyle(lines[0]);
  check("Step 6 bond segments have a visible stroke", computed.stroke && computed.stroke !== "none" && computed.stroke !== "transparent");
  check("Step 6 bond segments have nonzero stroke width", parseFloat(computed.strokeWidth || "0") > 0);
}

dom.window.close();
console.log("=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
