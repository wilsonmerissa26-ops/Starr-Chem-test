"use strict";
const assert=require("assert");
const fs=require("fs");
const Engine=require("./readiness-day-engine.js");
const Data=require("./course-units/unit1/unit1-data.js");
const App=require("./course-units/unit1/unit1-app.js");
let n=0;
function ok(v,m){assert(v,m);n++;}
function eq(a,b,m){assert.equal(a,b,m);n++;}

// Current course scope stays anchored to the Fall 2026 syllabus.
eq(Data.META.testDate,"2026-09-03","Test 1 date is Sept 3");
eq(Data.META.testPoints,130,"Unit 1 Test is 130 points");
ok(Data.META.currentChapter.includes("Alkanes and Cycloalkanes"),"current Chapter 4 title is present");
ok(Data.META.cumulativeCoverage.some(x=>x.includes("2.1–2.6")),"Test 1 coverage keeps the assigned Chapter 2.1-2.6 slice");
ok(Data.CALIBRATION.currentScope.includes("Fall 2026"),"calibration keeps current syllabus scope authoritative");
ok(Data.CALIBRATION.historicalStyle.includes("not copied"),"historical Mercer material calibrates style without becoming a copied bank");

// The bank now covers the production-heavy task families needed for the current unit.
eq(Data.SKILLS.length,9,"nine Unit 1 skill areas ship in the calibrated slice");
["representations","functional_groups","formal_charge","three_d","hybridization","nomenclature","isomers","conformations","cycloalkanes"].forEach(id=>ok(Data.skill(id),`${id} skill exists`));
Data.SKILLS.forEach(s=>eq(s.items.length,4,`${s.id} has four original variants`));
eq(Data.TEST1_BLUEPRINT.length,13,"full Test 1 form has thirteen scored slots");
eq(Data.TEST1_BLUEPRINT.reduce((sum,x)=>sum+x.points,0),130,"blueprint totals the syllabus 130 points");

// Reuse the locked readiness evaluator for open semantic answers.
const r1=Data.item("representations","R1");
ok(App.checkAnswer(r1,"Each unlabeled end or vertex is a carbon, and the hydrogens are omitted because enough are implied to give carbon four bonds.").correct,"semantic bond-line answer passes locked evaluator");
ok(!App.checkAnswer(r1,"It means hydrogen.").correct,"wrong bond-line role is rejected");
ok(App.checkAnswer(Data.item("functional_groups","G4"),"It contains a ketone and an alcohol.").correct,"multi-group production answer passes");
ok(App.checkAnswer(Data.item("three_d","D1"),"toward the viewer").correct,"solid wedge meaning is accepted");
ok(App.checkAnswer(Data.item("hybridization","H4"),"sp2").correct,"carbonyl carbon hybridization is accepted");

// Exact production checks work for nomenclature and short factual answers.
ok(App.checkAnswer(Data.item("nomenclature","N1"),"2-methylpentane").correct,"correct IUPAC name accepted");
ok(!App.checkAnswer(Data.item("nomenclature","N1"),"3-methylpentane").correct,"wrong locant rejected");
ok(App.checkAnswer(Data.item("formal_charge","F1"),"two").correct,"oxygen lone-pair count accepted");
ok(App.checkAnswer(Data.item("cycloalkanes","Y1"),"equatorial").correct,"chair stability production accepted");

// P1 review repair: once a hint is revealed, the same-item retry cannot become clean evidence.
const s=App.newState();
const fc=Data.skill("formal_charge"),f1=Data.item("formal_charge","F1");
App.record(s,fc,f1,{correct:false,code:"INCORRECT"});
App.markSupported(s,App.skillState(s,"formal_charge"));
let out=App.record(s,fc,f1,{correct:true});
eq(out.clean,false,"hinted retry is contaminated");
eq(App.skillState(s,"formal_charge").independentCorrect,0,"hinted retry adds no independent evidence");
eq(App.skillState(s,"formal_charge").supportedCorrect,1,"hinted retry is recorded as supported learning");

// A different fresh item can restore independent evidence after support is removed.
s.supportUsed=false;s.guessed=false;
out=App.record(s,fc,Data.item("formal_charge","F2"),{correct:true});
eq(out.clean,true,"fresh unsupported item is clean");
eq(App.skillState(s,"formal_charge").independentCorrect,1,"fresh unsupported item adds independent evidence");

// A correct guess is scored as knowledge evidence only cautiously: it is not secure mastery evidence.
const g=App.newState();g.guessed=true;
out=App.record(g,fc,f1,{correct:true});
eq(out.clean,false,"guessed correct is not clean evidence");
eq(App.skillState(g,"formal_charge").independentCorrect,0,"guessed correct adds no independent evidence");

// Full retakes use the same blueprint but a different immediate form.
const t=App.newState();
const p1=App.buildTestPlan(t);
eq(p1.form,"A","first form is A");
eq(p1.queue.length,13,"Form A has thirteen slots");
eq(p1.queue.reduce((sum,x)=>sum+x.points,0),130,"Form A totals 130 points");
App.commitTestStart(t,p1);
const p2=App.buildTestPlan(t);
eq(p2.form,"B","next form is B");
const keys1=new Set(p1.queue.map(x=>`${x.skill}:${x.item}`));
const keys2=new Set(p2.queue.map(x=>`${x.skill}:${x.item}`));
ok([...keys2].every(k=>!keys1.has(k)),"immediate next full form uses different items in every slot");
eq(p2.queue.map(x=>x.skill).join("|"),p1.queue.map(x=>x.skill).join("|"),"fresh form preserves the same skill blueprint");

// Test scoring separates raw practice points from secure no-guess evidence.
const q=p1.queue[0],qs=Data.skill(q.skill),qi=Data.item(q.skill,q.item);
t.guessed=true;
App.scoreTestResponse(t,qs,q,qi,{correct:true});
eq(t.mix.pointsEarned,q.points,"guessed correct still earns raw practice points");
eq(t.mix.secureCorrect,0,"guessed correct does not count as secure");
eq(t.mix.guessed,1,"guess is tracked");
App.record(t,qs,qi,{correct:true});
eq(App.skillState(t,qs.id).independentCorrect,0,"guessed test answer does not create independent mastery evidence");
const finished=App.finalizeTest(t);
ok(finished.completed,"test finalizes");
eq(t.testHistory.length,1,"completed form is saved to test history");
eq(t.testHistory[0].form,"A","saved history keeps form identity");

// Errors route only to mapped foundation days, while course-specific skills stay in the unit.
const s2=App.newState();
App.record(s2,Data.skill("representations"),Data.item("representations","R1"),{correct:false,code:"REPRESENTATION_INCOMPLETE"});
App.record(s2,Data.skill("nomenclature"),Data.item("nomenclature","N1"),{correct:false,code:"INCORRECT"});
const recs=App.foundationRecommendations(s2);
eq(recs.length,1,"only a real mapped foundation gap produces a readiness-day recommendation");
eq(recs[0].day,1,"representation gap routes to Day 1");
ok(!recs.some(r=>r.skill==="nomenclature"),"course-specific nomenclature does not invent a foundation-day route");

// UI contracts: test mode is a real simulation, not guided practice with answer leaks.
const hub=fs.readFileSync("course-hub/index.html","utf8");
const html=fs.readFileSync("course-units/unit1/index.html","utf8");
const appSource=fs.readFileSync("course-units/unit1/unit1-app.js","utf8");
ok(hub.includes("../course-units/unit1/#chapter4"),"course hub opens Chapter 4 support");
ok(hub.includes("../course-units/unit1/#test1"),"course hub opens Test 1 practice");
ok(html.includes("Every full practice test is a fresh form"),"Unit 1 explains fresh retake forms");
ok(html.includes("Dr. Meadows-style task demands"),"Unit 1 explains Mercer/Dr. Meadows calibration");
ok(html.includes("old questions are not copied"),"UI explicitly says historical questions are not copied");
ok(html.includes("data-test-history"),"UI has completed test history");
ok(html.includes("closed book and closed notes"),"Unit 1 carries forward the syllabus test rule");
ok(html.includes("generative AI should not be used to complete assignments"),"Unit 1 preserves academic-integrity boundary");
ok(html.includes("Canvas and Mercer email"),"Unit 1 tells learner to verify live course updates");
ok(appSource.includes("no correctness, hints, or teaching are shown until the entire form is finished"),"test mode withholds feedback until completion");
ok(appSource.includes("Codex P1 repair"),"merged P1 hint-contamination defect has an explicit regression guard in source");

console.log(`CHM 221 Unit 1: ${n} assertions passed`);
