/* PR #79 RED/GREEN regression: Step 4 gates must re-arm if reduced motion is turned back off. */
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
  if (!node) throw new Error("Cannot activate missing node");
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function buildApp(initialReducedMotion) {
  var dom = new JSDOM(read("course-units/unit1/bond-line/index.html"), {
    runScripts: "outside-only", pretendToBeVisual: true,
    url: "https://example.test/course-units/unit1/bond-line/"
  });
  var listeners = [];
  var mql = {
    matches: !!initialReducedMotion,
    media: "(prefers-reduced-motion: reduce)",
    onchange: null,
    addListener: function (fn) { if (listeners.indexOf(fn) === -1) listeners.push(fn); },
    removeListener: function (fn) { listeners = listeners.filter(function (item) { return item !== fn; }); },
    addEventListener: function (type, fn) { if (type === "change" && listeners.indexOf(fn) === -1) listeners.push(fn); },
    removeEventListener: function (type, fn) { if (type === "change") listeners = listeners.filter(function (item) { return item !== fn; }); },
    dispatchEvent: function (event) {
      listeners.slice().forEach(function (fn) { fn.call(mql, event); });
      if (typeof mql.onchange === "function") mql.onchange.call(mql, event);
      return true;
    }
  };
  dom.window.matchMedia = function (query) {
    if (/prefers-reduced-motion\s*:\s*reduce/.test(query)) return mql;
    return { matches:false, media:query, addListener:function(){}, removeListener:function(){}, addEventListener:function(){}, removeEventListener:function(){}, dispatchEvent:function(){return true;} };
  };
  dom.setReducedMotion = function (value) {
    mql.matches = !!value;
    var event = new dom.window.Event("change");
    Object.defineProperty(event, "matches", { value: mql.matches });
    Object.defineProperty(event, "media", { value: mql.media });
    mql.dispatchEvent(event);
  };
  Object.defineProperty(dom.window, "speechSynthesis", {
    configurable: true, value: { cancel:function(){}, speak:function(){} }
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
function dispatchAnimationEnd(node, name) {
  if (!node) return;
  var win = node.ownerDocument.defaultView;
  var event = new win.Event("animationend", { bubbles:true });
  Object.defineProperty(event, "animationName", { value:name });
  node.dispatchEvent(event);
}
function allDisabled(nodes) { return nodes.length > 0 && nodes.every(function (node) { return node.disabled === true; }); }
function allEnabled(nodes) { return nodes.length > 0 && nodes.every(function (node) { return node.disabled === false; }); }

console.log("=== REDUCED MOTION ON AT ENTRY, THEN OFF: C2 GATE RE-ARMS ===");
var entryDom = buildApp(true);
var entryDoc = reachStep4(entryDom);
var entryChoices = Array.prototype.slice.call(entryDoc.querySelectorAll(".step4-prediction-grid button"));
check("precondition: reduced-motion entry leaves prediction choices enabled", allEnabled(entryChoices));
entryDom.setReducedMotion(false);
check("turning reduced motion off re-disables prediction while C2 visual runs", allDisabled(entryChoices));
dispatchAnimationEnd(entryDoc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
check("C2 completion re-releases prediction after re-arm", allEnabled(entryChoices));
entryDom.window.close();

console.log("\n=== NORMAL → REDUCED → NORMAL: C2 GATE RE-ARMS ===");
var flipDom = buildApp(false);
var flipDoc = reachStep4(flipDom);
var flipChoices = Array.prototype.slice.call(flipDoc.querySelectorAll(".step4-prediction-grid button"));
check("precondition: normal-motion C2 starts gated", allDisabled(flipChoices));
flipDom.setReducedMotion(true);
check("turning reduced motion on releases C2 gate", allEnabled(flipChoices));
flipDom.setReducedMotion(false);
check("turning reduced motion back off re-arms C2 gate", allDisabled(flipChoices));
dispatchAnimationEnd(flipDoc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
check("re-armed C2 gate releases on completion", allEnabled(flipChoices));
flipDom.window.close();

console.log("\n=== REPAIR TOGGLE RE-ARMS WHEN REDUCED MOTION IS TURNED OFF ===");
var repairDom = buildApp(false);
var repairDoc = reachStep4(repairDom);
dispatchAnimationEnd(repairDoc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
byText(repairDoc, "Yes").click();
var correction = byText(repairDoc, "No, the corner now stands for the carbon");
check("precondition: correction is gated during repair toggle", !!correction && correction.disabled === true);
repairDom.setReducedMotion(true);
check("reduced motion releases correction", !!correction && correction.disabled === false);
repairDom.setReducedMotion(false);
check("turning reduced motion off re-arms repair correction gate", !!correction && correction.disabled === true);
dispatchAnimationEnd(repairDoc.querySelector('[data-step4-toggle-carbon="C2"]'), "step4ToggleCarbon");
check("re-armed repair toggle releases correction on completion", !!correction && correction.disabled === false);
repairDom.window.close();

console.log("\n=== FINAL C4 NEXT GATE RE-ARMS WHEN REDUCED MOTION IS TURNED OFF ===");
var finalDom = buildApp(true);
var finalDoc = reachStep4(finalDom);
byText(finalDoc, "No, the corner now stands for the carbon").click();
var c4 = finalDoc.querySelector('[data-step4-label="C4"]');
check("precondition: reduced-motion final state makes Next ready", finalDoc.getElementById("nextBtn").disabled === false);
check("precondition: reduced-motion final gate is marked complete", !!c4 && c4.getAttribute("data-animation-gate-complete") === "true");
finalDom.setReducedMotion(false);
check("turning reduced motion off marks final gate pending again", !!c4 && c4.getAttribute("data-animation-gate-complete") === "false");
check("turning reduced motion off disables Next until restarted C4 finishes", finalDoc.getElementById("nextBtn").disabled === true);
dispatchAnimationEnd(c4, "step4HideCarbon");
check("restarted C4 completion restores Next", finalDoc.getElementById("nextBtn").disabled === false);
finalDom.window.close();

check("motion re-arm behavior uses no JavaScript timers",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
