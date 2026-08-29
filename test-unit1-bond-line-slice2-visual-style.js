/* Real DOM/CSS regression for the Watch Step 2 visual relationship. */
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
  return Array.prototype.slice.call(doc.querySelectorAll("button")).find(function (b) { return b.textContent.trim() === text; });
}
function activate(node) {
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}

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

var doc = dom.window.document;
byText(doc, "The drawing may be using a shortcut.").click();
byText(doc, "4").click();
byText(doc, "A covalent bond").click();
["C1","C2","C3","C4"].forEach(function (id) { activate(doc.querySelector('[data-carbon-id="' + id + '"]')); });
doc.getElementById("nextBtn").click();

var h = doc.querySelector("[data-step2-hydrogen]");
var hBond = doc.querySelector(".hydrogen-bonds-light line");
var skeletonBond = doc.querySelector(".skeleton-bonds line");
check("Step 2 hydrogen label exists", !!h);
check("Step 2 C-H bond exists", !!hBond);
check("Step 2 emphasized C-C bond exists", !!skeletonBond);

if (h && hBond && skeletonBond) {
  var hOpacity = parseFloat(dom.window.getComputedStyle(h).opacity || "1");
  var hBondOpacity = parseFloat(dom.window.getComputedStyle(hBond).opacity || "1");
  var skeletonStyle = dom.window.getComputedStyle(skeletonBond);
  var skeletonOpacity = parseFloat(skeletonStyle.opacity || "1");
  check("hydrogen labels are genuinely visually lighter", hOpacity > 0 && hOpacity < skeletonOpacity);
  check("C-H bonds are genuinely visually lighter", hBondOpacity > 0 && hBondOpacity < skeletonOpacity);
  check("C-C skeleton bonds are visibly stroked", !!skeletonStyle.stroke && skeletonStyle.stroke !== "none");
  check("C-C skeleton bonds remain more prominent than C-H bonds", skeletonOpacity > hBondOpacity);
}

dom.window.close();
console.log("=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
