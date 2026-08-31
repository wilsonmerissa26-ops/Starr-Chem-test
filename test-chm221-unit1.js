"use strict";
const assert=require("assert");
const fs=require("fs");
const Engine=require("./readiness-day-engine.js");
const Data=require("./course-units/unit1/unit1-data.js");
const App=require("./course-units/unit1/unit1-app.js");
const Support=require("./course-units/unit1/unit1-support.js");
let n=0;
function ok(v,m){assert(v,m);n++;}
function eq(a,b,m){assert.equal(a,b,m);n++;}

// Course scope follows the syllabus sequence and current textbook chapter.
eq(Data.META.testDate,"2026-09-03","Test 1 date is Sept 3");
eq(Data.META.testPoints,130,"Unit 1 Test is 130 points");
ok(Data.META.currentChapter.includes("Alkanes and Cycloalkanes"),"current Chapter 4 title is present");
ok(Data.META.cumulativeCoverage.some(x=>x.includes("2.1–2.6")),"Test 1 coverage keeps the assigned Chapter 2.1-2.6 slice");

// Vertical slice is broad enough to cover current Chapter 4 plus required earlier representations.
eq(Data.SKILLS.length,7,"seven Unit 1 skill areas ship in the first course-support slice");
["representations","formal_charge","functional_groups","nomenclature","isomers","conformations","cycloalkanes"].forEach(id=>ok(Data.skill(id),`${id} skill exists`));
Data.SKILLS.forEach(s=>eq(s.items.length,2,`${s.id} has a fresh alternate item`));
eq(Data.TEST1_MIX.length,10,"mixed Test 1 practice has ten items");

// Reuse the locked readiness evaluator for open semantic answers.
const r1=Data.item("representations","R1");
ok(App.checkAnswer(r1,"Each unlabeled end or vertex is a carbon, and the hydrogens are omitted because enough are implied to give carbon four bonds.").correct,"semantic bond-line answer passes locked evaluator");
ok(!App.checkAnswer(r1,"It means hydrogen.").correct,"wrong bond-line role is rejected");

// Exact production checks work for nomenclature and short factual answers.
ok(App.checkAnswer(Data.item("nomenclature","N1"),"2-methylpentane").correct,"correct IUPAC name accepted");
ok(!App.checkAnswer(Data.item("nomenclature","N1"),"3-methylpentane").correct,"wrong locant rejected");
ok(App.checkAnswer(Data.item("formal_charge","F1"),"two").correct,"oxygen lone-pair count accepted");
ok(App.checkAnswer(Data.item("cycloalkanes","Y1"),"equatorial").correct,"chair stability production accepted");

// IDK teaching uses the shared six-way contract and item-specific repair content.
eq(Support.REASONS.length,6,"Unit 1 exposes all six shared IDK reasons");
const f1Support=Support.planFor("F1");
ok(f1Support,"formal-charge F1 has a targeted repair plan");
ok(Support.textFor(f1Support,"dont_know_how_to_start").includes("Use only three facts"),"F1 start repair isolates the first decision");
ok(!Support.textFor(f1Support,"dont_know_how_to_start").includes("positively charged carbon"),"F1 repair does not dump unrelated carbocation teaching");
ok(f1Support.check&&f1Support.check.accepted.includes("2"),"F1 repair includes a targeted supported check before fresh evidence");

// Help contamination never becomes independent evidence.
const s=App.newState();
const skill=Data.skill("formal_charge"),item=skill.items[0];
s.supportUsed=true;
let out=App.record(s,skill,item,{correct:true});
eq(out.clean,false,"supported correct is contaminated");
eq(App.skillState(s,"formal_charge").independentCorrect,0,"supported correct adds no independent evidence");
eq(App.skillState(s,"formal_charge").supportedCorrect,1,"supported correct is recorded separately");

// A fresh independent success can produce current readiness evidence.
s.supportUsed=false;
out=App.record(s,skill,skill.items[1],{correct:true});
eq(out.clean,true,"fresh unsupported correct is clean");
eq(App.skillState(s,"formal_charge").independentCorrect,1,"clean fresh item adds independent evidence");
eq(App.readiness(s).ready,1,"readiness counts the independently demonstrated skill");

// Errors route only to mapped foundation days, while course-specific skills stay in the unit.
const s2=App.newState();
App.record(s2,Data.skill("representations"),Data.item("representations","R1"),{correct:false,code:"REPRESENTATION_INCOMPLETE"});
App.record(s2,Data.skill("nomenclature"),Data.item("nomenclature","N1"),{correct:false,code:"INCORRECT"});
const recs=App.foundationRecommendations(s2);
eq(recs.length,1,"only a real mapped foundation gap produces a readiness-day recommendation");
eq(recs[0].day,1,"representation gap routes to Day 1");
ok(!recs.some(r=>r.skill==="nomenclature"),"course-specific nomenclature does not invent a foundation-day route");

// UI contracts: hub points to live course support; module points back and loads the shared engine.
const hub=fs.readFileSync("course-hub/index.html","utf8");
const html=fs.readFileSync("course-units/unit1/index.html","utf8");
ok(hub.includes("../course-units/unit1/#chapter4"),"course hub opens Chapter 4 support");
ok(hub.includes("../course-units/unit1/#test1"),"course hub opens Test 1 practice");
ok(html.includes("../../readiness-day-engine.js"),"Unit 1 loads the existing readiness engine");
ok(html.includes("Support helps you learn"),"Unit 1 explains support versus independent evidence");
ok(html.includes("tests are closed book and closed notes"),"Unit 1 carries forward the syllabus test rule");
ok(html.includes("generative AI should not be used to complete assignments"),"Unit 1 preserves academic-integrity boundary");
ok(html.includes("Canvas and Mercer email"),"Unit 1 tells learner to verify live course updates");

console.log(`CHM 221 Unit 1: ${n} assertions passed`);
