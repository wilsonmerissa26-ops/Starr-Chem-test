/*
 * RED-first regression for PR #79 P1: Step 3 -> Step 4 must preserve
 * the exact carbon positions and C-C bond endpoints while only the
 * carbon labels begin to abbreviate.
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
function reachCompletedStep3(dom) {
  var doc = dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1", "C2", "C3", "C4"].forEach(function (id) {
    activate(doc.querySelector('[data-carbon-id="' + id + '"]'));
  });
  doc.getElementById("nextBtn").click();
  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();
  byText(doc, "3").click();
  return doc;
}
function number(node, attr) { return Number(node.getAttribute(attr)); }
function step3Carbons(doc) {
  return ["C1", "C2", "C3", "C4"].map(function (id) {
    var circle = doc.querySelector('[data-step3-carbon="' + id + '"] circle');
    return { id: id, x: number(circle, "cx"), y: number(circle, "cy") };
  });
}
function step4Carbons(doc) {
  return ["C1", "C2", "C3", "C4"].map(function (id) {
    var label = doc.querySelector('[data-step4-label="' + id + '"]');
    return { id: id, x: number(label, "x") + 13, y: number(label, "y") - 11 };
  });
}
function bonds(doc, selector) {
  return Array.prototype.slice.call(doc.querySelectorAll(selector)).map(function (line) {
    return [number(line, "x1"), number(line, "y1"), number(line, "x2"), number(line, "y2")];
  });
}

console.log("=== STEP 3 -> STEP 4 SAME-POSITION CONTINUITY ===");
var dom = buildApp();
var doc = reachCompletedStep3(dom);
check("precondition: Step 3 is visible before transition", !!doc.querySelector(".step3-stage"));
var beforeCarbons = step3Carbons(doc);
var beforeBonds = bonds(doc, ".step3-cc-bonds line");
check("precondition: Step 3 exposes four carbon centers", beforeCarbons.length === 4);
check("precondition: Step 3 exposes three C-C bonds", beforeBonds.length === 3);

doc.getElementById("nextBtn").click();
check("Next from completed Step 3 opens Step 4", !!doc.querySelector("[data-step4-visual]"));
var afterCarbons = step4Carbons(doc);
var afterBonds = bonds(doc, ".step4-bonds line");
check("Step 4 keeps all four carbon positions exactly where Step 3 left them",
  JSON.stringify(afterCarbons) === JSON.stringify(beforeCarbons));
check("Step 4 keeps all three C-C bond endpoints exactly where Step 3 left them",
  JSON.stringify(afterBonds) === JSON.stringify(beforeBonds));
check("the transition still begins the frozen C1 then C2 label-collapse sequence",
  !!doc.querySelector('[data-step4-label="C1"].step4-collapse-now') &&
  !!doc.querySelector('[data-step4-label="C2"].step4-collapse-now'));
check("geometry fix contract does not permit JavaScript timer-driven advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

dom.window.close();
console.log("=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
