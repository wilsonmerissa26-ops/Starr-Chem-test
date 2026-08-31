"use strict";

const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { JSDOM, ResourceLoader, VirtualConsole } = require("jsdom");

const ROOT = __dirname;
const PAGE = "course-units/unit1/bond-line/index.html";
const BASE_URL = "https://example.test/course-units/unit1/bond-line/index.html";
let passed = 0;
let failed = 0;

function check(label, condition) {
  if (condition) { console.log("PASS  " + label); passed++; }
  else { console.log("FAIL  " + label); failed++; }
}
function byText(doc, text) {
  return Array.from(doc.querySelectorAll("button")).find(b => b.textContent.trim() === text) || null;
}
function activate(node) {
  if (!node) throw new Error("Expected interactive node is missing");
  const w = node.ownerDocument.defaultView;
  node.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true }));
}
function animationEnd(node, name) {
  if (!node) throw new Error("Expected animation node is missing: " + name);
  const w = node.ownerDocument.defaultView;
  const event = new w.Event("animationend", { bubbles: true });
  Object.defineProperty(event, "animationName", { value: name });
  node.dispatchEvent(event);
}
function waitFor(predicate, timeoutMs) {
  timeoutMs = timeoutMs || 3000;
  const started = Date.now();
  return new Promise((resolve, reject) => {
    (function poll() {
      try {
        if (predicate()) return resolve();
      } catch (_) {}
      if (Date.now() - started >= timeoutMs) return reject(new Error("Timed out waiting for production runtime"));
      setTimeout(poll, 10);
    })();
  });
}

class RepoResourceLoader extends ResourceLoader {
  constructor() {
    super();
    this.requested = [];
  }
  fetch(url) {
    const u = new URL(url);
    this.requested.push(u.pathname);
    if (u.origin !== "https://example.test") return null;
    const rel = decodeURIComponent(u.pathname).replace(/^\/+/, "");
    const file = path.join(ROOT, rel);
    if (!file.startsWith(ROOT) || !fs.existsSync(file)) {
      return Promise.reject(new Error("Missing local production resource: " + u.pathname));
    }
    return Promise.resolve(fs.readFileSync(file));
  }
}

function expectedStaticScripts(html) {
  return Array.from(html.matchAll(/<script\s+src="([^"]+)"/g)).map(m => m[1]);
}

function reachStep8(doc) {
  byText(doc, "The drawing may be using a shortcut.").click();
  byText(doc, "4").click();
  byText(doc, "A covalent bond").click();
  ["C1", "C2", "C3", "C4"].forEach(id => activate(doc.querySelector('[data-carbon-id="' + id + '"]')));
  doc.getElementById("nextBtn").click();

  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();

  byText(doc, "3").click();
  doc.getElementById("nextBtn").click();

  animationEnd(doc.querySelector('[data-step4-label="C2"]'), "step4HideCarbon");
  byText(doc, "No, the corner now stands for the carbon").click();
  animationEnd(doc.querySelector('[data-step4-label="C4"]'), "step4HideCarbon");
  doc.getElementById("nextBtn").click();

  ["C1", "C2", "C3", "C4"].forEach(id => activate(doc.querySelector('[data-step5-carbon="' + id + '"]')));
  doc.getElementById("nextBtn").click();

  byText(doc, "2").click();
  byText(doc, "3").click();
  doc.getElementById("nextBtn").click();

  byText(doc, "No").click();
  doc.getElementById("nextBtn").click();

  return doc;
}

(async function main() {
  console.log("=== FULL PRODUCTION SCRIPT ORDER: WATCH STEP 8 -> CONCEPT CHECK ===");
  const html = fs.readFileSync(path.join(ROOT, PAGE), "utf8");
  const staticScripts = expectedStaticScripts(html);
  const expected = [
    "../../../watch-mode.js",
    "../../../unit1-skill-registry.js",
    "../../../build-together.js",
    "bond-line-slice1.js",
    "bond-line-concept-check.js",
    "bond-line-build-together.js",
    "bond-line-guided.js",
    "bond-line-app.js",
    "bond-line-guided-ui.js",
    "bond-line-build-together-ui.js",
    "bond-line-concept-check-ui.js"
  ];
  check("real learner HTML has exactly the expected eleven static scripts in production order", JSON.stringify(staticScripts) === JSON.stringify(expected));

  const loader = new RepoResourceLoader();
  const virtualConsole = new VirtualConsole();
  const consoleErrors = [];
  virtualConsole.on("error", (...args) => consoleErrors.push(args.map(String).join(" ")));

  const dom = new JSDOM(html, {
    runScripts: "dangerously",
    resources: loader,
    pretendToBeVisual: true,
    url: BASE_URL,
    virtualConsole,
    beforeParse(win) {
      win.matchMedia = q => ({ matches: false, media: q, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; } });
      Object.defineProperty(win, "speechSynthesis", { configurable: true, value: { cancel() {}, speak() {} } });
      win.SpeechSynthesisUtterance = function (text) { this.text = text; };
      if (win.HTMLElement && win.HTMLElement.prototype) win.HTMLElement.prototype.scrollIntoView = function () {};
    }
  });

  const win = dom.window;
  const runtimeErrors = [];
  win.addEventListener("error", event => runtimeErrors.push(String(event.error || event.message || "window error")));

  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Timed out waiting for learner page load")), 4000);
    win.addEventListener("load", () => { clearTimeout(timer); resolve(); }, { once: true });
  });

  await waitFor(() => win.BondLineInterveningActivity && win.BondLineRetrievalHandoff && win.BondLineTransferHandoff && win.BondLineExplainWhyHandoff && win.BondLineIndependentHandoff, 4000);

  check("all downstream dynamic Slice 12-15 handoff globals are loaded before learner reaches Step 8", !!(win.StudentModelIdkRouter && win.BondLineIndependent && win.BondLineIndependentHandoff && win.BondLineExplainWhyHandoff && win.BondLineTransferHandoff && win.BondLineRetrievalHandoff && win.BondLineInterveningActivity));
  check("no dynamic loader reported a missing Bond-Line runtime", !consoleErrors.some(msg => /Unable to load Bond-Line/i.test(msg)));
  check("no uncaught runtime error occurred during full production bootstrap", runtimeErrors.length === 0);

  const doc = reachStep8(win.document);
  byText(doc, "1").click();

  check("precondition: real full-runtime page is on completed Watch Step 8 with Next enabled", /Watch\s*·\s*I Do\s*·\s*Step 8/i.test(doc.getElementById("phaseLabel").textContent) && doc.getElementById("nextBtn").disabled === false);

  doc.getElementById("nextBtn").click();

  check("one learner click after Step 8 opens supported Concept Check with all production listeners present", /concept check/i.test(doc.getElementById("phaseLabel").textContent));
  check("Concept Check renders all four statements after the full eleven-script bootstrap", doc.querySelectorAll("[data-concept-item]").length === 4);
  check("Watch completion handler did not overwrite Concept Check after interception", !/Watch\s*·\s*Step 8 complete/i.test(doc.getElementById("phaseLabel").textContent));
  check("Concept Check keeps Build Together locked until 4 of 4", doc.getElementById("nextBtn").disabled === true && /Start Build Together/i.test(doc.getElementById("nextBtn").textContent));

  dom.window.close();
  console.log("\n=== SUMMARY: " + (failed ? "FAIL" : "PASS") + ` (${passed} passed, ${failed} failed) ===`);
  if (failed) process.exit(1);
})().catch(err => {
  console.error(err && err.stack || err);
  process.exit(1);
});
