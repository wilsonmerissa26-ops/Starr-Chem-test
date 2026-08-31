"use strict";
const assert=require("assert");
const fs=require("fs");
const path=require("path");
const {JSDOM}=require("jsdom");

let passed=0;
function ok(v,m){assert(v,m);passed++;}
function eq(a,b,m){assert.equal(a,b,m);passed++;}

const htmlPath=path.join(__dirname,"course-units/unit1/index.html");
const html=fs.readFileSync(htmlPath,"utf8");
const staticScripts=[...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]);
eq(staticScripts.join("|"),[
  "../../readiness-day-engine.js",
  "../../student-model-idk-router.js",
  "unit1-data.js",
  "unit1-support.js",
  "unit1-app.js"
].join("|"),"Unit 1 loads shared IDK router, targeted support module, then app in production order");

const dom=new JSDOM(html,{url:"https://example.test/course-units/unit1/",runScripts:"outside-only",pretendToBeVisual:true});
const {window}=dom;
window.HTMLElement.prototype.scrollIntoView=function(){};
for(const src of staticScripts){
  const file=path.resolve(path.dirname(htmlPath),src);
  window.eval(fs.readFileSync(file,"utf8"));
}
const doc=window.document;

// Open the exact skill from the real pilot screenshot.
let formalButton=doc.querySelector('[data-skill="formal_charge"]');
ok(formalButton,"formal-charge practice button exists");
formalButton.click();
ok(doc.querySelector('.question').textContent.includes('neutral oxygen'),"formal-charge F1 question is active");

// IDK must diagnose before teaching instead of dumping the broad skill paragraph.
doc.querySelector('[data-idk]').click();
let menu=doc.querySelector('[data-feedback]');
eq(menu.querySelectorAll('[data-idk-reason]').length,6,"IDK presents all six shared reasons");
ok(menu.textContent.includes("I won’t guess what you don’t understand"),"IDK explicitly avoids guessing the learner's broken step");
ok(!menu.textContent.includes('positively charged carbon'),"IDK no longer dumps unrelated carbocation teaching before diagnosis");
ok(doc.querySelector('[data-evidence]').textContent.includes('Repairs started: 1'),"repair counter updates immediately on screen");

// Choose "I don't know how to start" and verify the teaching is item-specific.
menu.querySelector('[data-idk-reason="dont_know_how_to_start"]').click();
let repair=doc.querySelector('[data-feedback]');
ok(repair.textContent.includes('Use only three facts'),"selected IDK reason produces item-specific first-step teaching");
ok(repair.textContent.includes('Quick repair check'),"targeted teaching is followed by a supported check");
ok(!repair.textContent.includes('positively charged carbon'),"oxygen repair stays on the oxygen idea instead of mixing charge patterns");
ok(!repair.querySelector('[data-fresh]'),"fresh independent item is locked until the targeted repair check passes");

// The supported check must not create independent evidence, but must be visibly recorded.
const repairInput=repair.querySelector('[data-repair-answer]');
repairInput.value='2';
repair.querySelector('[data-repair-check]').click();
ok(repair.querySelector('[data-fresh]'),"passing the repair check unlocks a fresh independent item");
ok(doc.querySelector('[data-evidence]').textContent.includes('Independent evidence: 0'),"supported repair check adds no independent evidence");
ok(doc.querySelector('[data-evidence]').textContent.includes('Supported correct: 1'),"supported repair check is visibly recorded as supported correct");

// Fresh-item handoff must move to the alternate item with support reset.
repair.querySelector('[data-fresh]').click();
ok(doc.querySelector('.question').textContent.includes('three bonds and no lone pair'),"repair exits to the fresh F2 item rather than repeating F1");
let persisted=JSON.parse(window.localStorage.getItem('astarryia.chm221.unit1.v1'));
eq(persisted.supportUsed,false,"support contamination resets before the fresh independent item");
eq(persisted.skills.formal_charge.independentCorrect,0,"repair path cannot manufacture independent evidence");

// Two wrong answers must diagnose instead of claiming to teach with the generic paragraph.
formalButton=doc.querySelector('[data-skill="formal_charge"]');
formalButton.click();
let answer=doc.querySelector('[data-answer]');
answer.value='4';
doc.querySelector('[data-check]').click();
answer.value='4';
doc.querySelector('[data-check]').click();
const twoWrong=doc.querySelector('[data-feedback]');
eq(twoWrong.querySelectorAll('[data-idk-reason]').length,6,"two misses switch to six-way diagnosis before reteaching");
ok(twoWrong.textContent.includes('find the broken step first'),"two-miss path says it is diagnosing the broken step");
ok(!twoWrong.textContent.includes('positively charged carbon'),"two-miss path no longer dumps the broad skill paragraph");

// Item-specific hint should address the actual misconception seen in the pilot.
formalButton=doc.querySelector('[data-skill="formal_charge"]');
formalButton.click();
doc.querySelector('[data-hint]').click();
const hint=doc.querySelector('[data-feedback]');
ok(hint.textContent.includes('four nonbonding electrons'),"F1 hint targets electron-vs-lone-pair confusion");
ok(hint.textContent.includes('two lone pairs'),"F1 hint gives the needed conceptual distinction");

console.log(`Unit 1 IDK teaching repair: ${passed} assertions passed`);
