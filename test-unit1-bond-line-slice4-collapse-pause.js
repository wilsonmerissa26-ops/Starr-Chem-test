/* Real DOM/CSS RED/GREEN regression for Watch Step 4 visual semantics. */
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
  return Array.prototype.slice.call(root.querySelectorAll("button")).find(function (b) { return b.textContent.trim() === text; }) || null;
}
function activate(node) {
  if (!node) throw new Error("Cannot activate missing node");
  var win = node.ownerDocument.defaultView;
  node.dispatchEvent(new win.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function dispatchAnimationEnd(node, animationName) {
  if (!node) return;
  var win = node.ownerDocument.defaultView;
  var event = new win.Event("animationend", { bubbles: true, cancelable: false });
  Object.defineProperty(event, "animationName", { value: animationName });
  node.dispatchEvent(event);
}
function unlockStep4Prediction(doc) {
  dispatchAnimationEnd(doc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
}
function unlockStep4Repair(doc) {
  dispatchAnimationEnd(doc.querySelector('[data-step4-toggle-carbon="C2"]'), "step4ToggleCarbon");
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
function ms(value) {
  value = String(value || "0s").trim();
  if (/ms$/.test(value)) return parseFloat(value);
  if (/s$/.test(value)) return parseFloat(value) * 1000;
  return parseFloat(value) || 0;
}
function label(doc, id) { return doc.querySelector('[data-step4-label="' + id + '"]'); }
function lineSignature(doc) {
  return Array.prototype.slice.call(doc.querySelectorAll(".step4-bonds line")).map(function (line) {
    return [line.getAttribute("x1"), line.getAttribute("y1"), line.getAttribute("x2"), line.getAttribute("y2")].join(",");
  }).join("|");
}

console.log("=== FIRST TWO CARBON LABELS COLLAPSE IN ORDER BEFORE PREDICTION ===");
var domA = buildApp();
var docA = reachStep4(domA);
var c1 = label(docA, "C1"), c2 = label(docA, "C2"), c3 = label(docA, "C3"), c4 = label(docA, "C4");
check("all four Step 4 carbon labels are represented in the visual", !!c1 && !!c2 && !!c3 && !!c4);
if (c1 && c2 && c3 && c4) {
  var s1 = domA.window.getComputedStyle(c1), s2 = domA.window.getComputedStyle(c2);
  var s3 = domA.window.getComputedStyle(c3), s4 = domA.window.getComputedStyle(c4);
  check("C1 has a real collapse animation", /step4HideCarbon/i.test(s1.animationName || ""));
  check("C2 has a real collapse animation", /step4HideCarbon/i.test(s2.animationName || ""));
  check("C2 collapse starts after C1", ms(s2.animationDelay) > ms(s1.animationDelay));
  check("C3 does not collapse before the prediction", !/step4HideCarbon/i.test(s3.animationName || "") && parseFloat(s3.opacity || "1") > 0.9);
  check("C4 does not collapse before the prediction", !/step4HideCarbon/i.test(s4.animationName || "") && parseFloat(s4.opacity || "1") > 0.9);
}

console.log("\n=== PAUSE/RESUME FREEZES THE EXACT STEP 4 VISUAL ===");
var stageBefore = docA.querySelector("[data-step4-visual]");
docA.getElementById("pauseBtn").click();
var c1Paused = label(docA, "C1"), c2Paused = label(docA, "C2");
check("Pause keeps the exact Step 4 SVG mounted", !!stageBefore && stageBefore.isConnected && docA.querySelector("[data-step4-visual]") === stageBefore);
if (c1Paused && c2Paused) {
  check("Pause freezes C1 collapse animation in place", domA.window.getComputedStyle(c1Paused).animationPlayState === "paused");
  check("Pause freezes C2 collapse animation in place", domA.window.getComputedStyle(c2Paused).animationPlayState === "paused");
}
docA.getElementById("pauseBtn").click();
check("Resume still keeps the exact Step 4 SVG mounted", docA.querySelector("[data-step4-visual]") === stageBefore);
if (label(docA,"C1") && label(docA,"C2")) {
  check("Resume releases the collapse animations", domA.window.getComputedStyle(label(docA,"C1")).animationPlayState !== "paused" && domA.window.getComputedStyle(label(docA,"C2")).animationPlayState !== "paused");
}

domA.window.close();

console.log("\n=== WRONG PREDICTION TOGGLES THE SAME C2 LABEL THREE TIMES ===");
var domB = buildApp();
var docB = reachStep4(domB);
var bondsBefore = lineSignature(docB);
unlockStep4Prediction(docB);
byText(docB, "Yes").click();
var toggle = docB.querySelector('[data-step4-toggle-carbon="C2"][data-toggle-count="3"]');
check("same-position C2 repair overlay is rendered", !!toggle);
check("repair keeps the exact same three C-C bond coordinates", lineSignature(docB) === bondsBefore && docB.querySelectorAll(".step4-bonds line").length === 3);
if (toggle) {
  var toggleStyle = domB.window.getComputedStyle(toggle);
  check("C2 repair uses a real label-toggle animation", /step4ToggleCarbon/i.test(toggleStyle.animationName || ""));
  check("C2 repair animation runs exactly three iterations", parseFloat(toggleStyle.animationIterationCount || "0") === 3);
}

console.log("\n=== CORRECTED PREDICTION CONTINUES C3 THEN C4 WITHOUT RESTARTING C1/C2 ===");
unlockStep4Repair(docB);
byText(docB, "No, the corner now stands for the carbon").click();
var rc1 = label(docB,"C1"), rc2 = label(docB,"C2"), rc3 = label(docB,"C3"), rc4 = label(docB,"C4");
if (rc1 && rc2 && rc3 && rc4) {
  var rs1 = domB.window.getComputedStyle(rc1), rs2 = domB.window.getComputedStyle(rc2);
  var rs3 = domB.window.getComputedStyle(rc3), rs4 = domB.window.getComputedStyle(rc4);
  check("C1 stays collapsed without replaying its first-half animation", !/step4HideCarbon/i.test(rs1.animationName || "") && parseFloat(rs1.opacity || "1") === 0);
  check("C2 stays collapsed without replaying its first-half animation", !/step4HideCarbon/i.test(rs2.animationName || "") && parseFloat(rs2.opacity || "1") === 0);
  check("C3 gets the continuation collapse animation", /step4HideCarbon/i.test(rs3.animationName || ""));
  check("C4 gets the continuation collapse animation", /step4HideCarbon/i.test(rs4.animationName || ""));
  check("C4 continuation starts after C3", ms(rs4.animationDelay) > ms(rs3.animationDelay));
}

var html = read("course-units/unit1/bond-line/index.html");
check("reduced-motion CSS explicitly covers Step 4 collapse/toggle visuals",
  /prefers-reduced-motion:reduce[\s\S]*step4/i.test(html) && /step4[\s\S]*animation\s*:\s*none\s*!important/i.test(html));
check("Step 4 visual behavior uses no JavaScript timers",
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setTimeout(") === -1 &&
  read("course-units/unit1/bond-line/bond-line-app.js").indexOf("setInterval(") === -1);

domB.window.close();
console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + " ===");
if (failed) process.exit(1);
