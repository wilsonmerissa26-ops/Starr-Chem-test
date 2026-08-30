/* Regression: Watch Step 3 must fade carbon-bound H marks sequentially; Pause freezes that exact visual; Replay restarts it only when playing. */
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
function delayMs(node) {
  var raw = node && node.style ? node.style.animationDelay : "";
  if (!raw) return NaN;
  if (/ms$/.test(raw)) return parseFloat(raw);
  if (/s$/.test(raw)) return parseFloat(raw) * 1000;
  return NaN;
}

var dom = buildApp();
var doc = reachStep3(dom);
console.log("=== STEP 3 SEQUENTIAL H FADE ===");
var labels = Array.prototype.slice.call(doc.querySelectorAll("[data-step3-hydrogen]"));
var bonds = Array.prototype.slice.call(doc.querySelectorAll(".step3-hydrogen-bond-hidden[data-fade-order]"));
check("Step 3 stages ten H labels and ten matching C-H bonds", labels.length === 10 && bonds.length === 10);
var labelDelays = labels.map(delayMs);
var bondDelays = bonds.map(delayMs);
check("all staged H labels have explicit animation delays", labelDelays.every(Number.isFinite));
check("H-label fade delays increase strictly one at a time", labelDelays.every(function (value, index) {
  return index === 0 || value > labelDelays[index - 1];
}));
check("each C-H bond fades on the same schedule as its H label", bondDelays.length === labelDelays.length && bondDelays.every(function (value, index) {
  return Number.isFinite(value) && value === labelDelays[index];
}));
check("the final H fade is delayed from the first rather than all marks disappearing together",
  labelDelays.length === 10 && labelDelays[9] > labelDelays[0]);

console.log("\n=== PAUSE FREEZES THE EXACT STEP 3 VISUAL ===");
var stageBefore = doc.querySelector(".step3-stage");
check("precondition: Step 3 stage is mounted", !!stageBefore);
doc.getElementById("pauseBtn").click();
var stagePaused = doc.querySelector(".step3-stage");
check("Pause keeps the exact same Step 3 SVG node mounted", stagePaused === stageBefore && stageBefore.isConnected);
check("Pause applies the visual animation-freeze state", !!stagePaused && stagePaused.classList.contains("is-paused"));
check("Pause changes control to Resume", doc.getElementById("pauseBtn").textContent.trim() === "Resume");
check("Pause disables Back", doc.getElementById("backBtn").disabled === true);
check("Pause disables Next", doc.getElementById("nextBtn").disabled === true);
check("Pause disables Replay so the frozen frame cannot be restarted underneath Pause", doc.getElementById("replayBtn").disabled === true);
doc.getElementById("replayBtn").click();
check("Replay activation while paused cannot replace the frozen Step 3 SVG", doc.querySelector(".step3-stage") === stagePaused && stagePaused.isConnected);
doc.getElementById("pauseBtn").click();
var stageResumed = doc.querySelector(".step3-stage");
check("Resume keeps the same Step 3 SVG node instead of restarting it", stageResumed === stageBefore && stageBefore.isConnected);
check("Resume releases the animation-freeze state", !!stageResumed && !stageResumed.classList.contains("is-paused"));
check("Resume re-enables Replay", doc.getElementById("replayBtn").disabled === false);

console.log("\n=== REPLAY RESTARTS THE CURRENT STEP 3 VISUAL ONLY ===");
var replayStageBefore = doc.querySelector(".step3-stage");
doc.getElementById("replayBtn").click();
var replayStageAfter = doc.querySelector(".step3-stage");
check("Replay restarts the Step 3 visual sequence with a fresh SVG node", !!replayStageAfter && replayStageAfter !== replayStageBefore && !replayStageBefore.isConnected);
check("Replay stays on Watch Step 3", /Watch · I Do · Step 3/i.test(doc.getElementById("phaseLabel").textContent));
var replayDelays = Array.prototype.slice.call(doc.querySelectorAll("[data-step3-hydrogen]")).map(delayMs);
check("Replay preserves the same ten-step fade schedule", replayDelays.length === 10 && replayDelays.every(function (value, index) {
  return value === labelDelays[index];
}));

check("Step 3 sequential fade uses no JavaScript timer-driven advancement",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

dom.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
