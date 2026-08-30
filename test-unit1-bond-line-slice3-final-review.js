/*
 * Final PR #78 review regressions for Watch Step 3.
 *
 * These are real DOM behaviors from Codex's current-head review:
 * 1) Replay after completing Step 3 must restart the original visual without
 *    pre-rendering the three completion ghost hydrogens.
 * 2) The four-slot repair answers must be programmatically associated with
 *    the repair prompt for screen-reader users.
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
function reachStep3(dom) {
  var doc = dom.window.document;
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1","C2","C3","C4"].forEach(function (id) {
    activate(doc.querySelector('[data-carbon-id="' + id + '"]'));
  });
  doc.getElementById("nextBtn").click();
  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();
  return doc;
}

console.log("=== COMPLETED STEP 3 REPLAY STARTS FROM THE ORIGINAL VISUAL ===");
var replayDom = buildApp();
var replayDoc = reachStep3(replayDom);
var answerThree = byText(replayDoc, "3");
check("precondition: direct correct Step 3 answer exists", !!answerThree);
answerThree.click();
check("completed Step 3 displays exactly three implied-H completion ghosts before Replay",
  replayDoc.querySelectorAll(".implied-h-ghost").length === 3);
var completedStage = replayDoc.querySelector(".step3-stage");
replayDoc.getElementById("replayBtn").click();
var replayStage = replayDoc.querySelector(".step3-stage");
check("Replay after completion remounts a fresh Step 3 visual", !!replayStage && replayStage !== completedStage && !completedStage.isConnected);
check("Replay after completion suppresses completion ghosts at restart",
  replayDoc.querySelectorAll(".implied-h-ghost").length === 0);
check("Replay after completion restores all ten staged H labels for the fade",
  replayDoc.querySelectorAll("[data-step3-hydrogen]").length === 10);
check("Replay after completion stays on Watch Step 3",
  /Watch · I Do · Step 3/i.test(replayDoc.getElementById("phaseLabel").textContent));

console.log("\n=== STEP 3 REPAIR ANSWERS ARE LABELLED BY THE REPAIR PROMPT ===");
var repairDom = buildApp();
var repairDoc = reachStep3(repairDom);
byText(repairDoc, "2").click();
var repairPrompt = repairDoc.getElementById("step3RepairPrompt");
var repairButtons = Array.prototype.slice.call(repairDoc.querySelectorAll(".step3-repair-choice"));
var repairGroup = repairButtons.length ? repairButtons[0].parentElement : null;
check("precondition: repair prompt and four repair answers are rendered",
  !!repairPrompt && repairButtons.length === 4 && !!repairGroup);
check("repair answer grid is exposed as a labelled group",
  repairGroup && repairGroup.getAttribute("role") === "group");
check("repair answer grid is programmatically associated with the repair prompt",
  repairGroup && repairGroup.getAttribute("aria-labelledby") === "step3RepairPrompt");
check("the referenced repair prompt exists and contains the question",
  !!repairPrompt && /How many bond slots remain\?/.test(repairPrompt.textContent));

replayDom.window.close();
repairDom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
