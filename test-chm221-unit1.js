"use strict";
const assert=require("assert");
const fs=require("fs");
const Engine=require("./readiness-day-engine.js");
const Data=require("./course-units/unit1/unit1-data.js");
const App=require("./course-units/unit1/unit1-app.js");
let n=0;
function ok(v,m){assert(v,m);n++;}
function eq(a,b,m){assert.equal(a,b,m);n++;}

// Current course scope stays anchored to Fall 2026 while the uploaded F25 exam
// supplies the strongest historical format calibration.
eq(Data.META.testDate,"2026-09-03","Test 1 date is Sept 3");
eq(Data.META.testPoints,130,"current practice scale remains 130 points");
ok(Data.META.currentChapter.includes("Alkanes and Cycloalkanes"),"current Chapter 4 title is present");
ok(Data.META.cumulativeCoverage.some(x=>x.includes("2.1–2.6")),"current scope keeps the assigned Chapter 2.1-2.6 slice");
eq(Data.F25_EXAM.points,100,"uploaded Fall 2025 exam was 100 points");
eq(Data.F25_EXAM.minutes,50,"uploaded Fall 2025 exam allowed 50 minutes");
eq(Data.F25_EXAM.numberedQuestions,11,"uploaded Fall 2025 exam had eleven numbered questions");
ok(Data.F25_EXAM.observations.some(x=>x.includes("homework")),"F25 calibration records homework/problem-set sourcing");
ok(Data.CALIBRATION.strongestHistorical.includes("Fall 2025"),"uploaded F25 exam is strongest historical calibration");
ok(Data.CALIBRATION.currentPracticeDesign.includes("130-point"),"historical proportions are normalized to current practice scale");
ok(Data.CALIBRATION.nextSource.includes("Fall 2026 Practice Test 1"),"official current practice test will supersede historical weighting");

// Skill map now includes the task families actually visible on the F25 exam.
const expectedSkills=["representations","intermolecular_forces","formal_charge","hybridization","ir","functional_groups","relationships","boiling_points","nomenclature","isomers","three_d","conformations","cycloalkanes"];
eq(Data.SKILLS.length,expectedSkills.length,"thirteen Unit 1 skill areas ship in the calibrated slice");
expectedSkills.forEach(id=>ok(Data.skill(id),`${id} skill exists`));

// Historical 11-question proportions are preserved while multipart questions
// are separated into scored subparts for useful error analysis.
eq(Data.TEST1_BLUEPRINT.length,17,"full practice form has seventeen scored subparts across eleven question families");
eq(Data.TEST1_BLUEPRINT.reduce((sum,x)=>sum+x.points,0),130,"blueprint totals 130 practice points");
const byQuestion={};
Data.TEST1_BLUEPRINT.forEach(x=>{const q=String(x.section).replace(/[a-z]$/i,'');byQuestion[q]=(byQuestion[q]||0)+x.points;});
eq(Object.keys(byQuestion).length,11,"blueprint preserves eleven numbered question families");
const expectedWeights={"1":7,"2":8,"3":12,"4":10,"5":5,"6":26,"7":5,"8":21,"9":10,"10":5,"11":21};
Object.keys(expectedWeights).forEach(q=>eq(byQuestion[q],expectedWeights[q],`Q${q} normalized weight matches F25 proportion`));

// Every repeated task family has enough variants for one completely different
// immediate retake. Once unique inventory is exhausted, the app must stop rather
// than recycling old items and calling them fresh.
const slotsByTask={};
Data.TEST1_BLUEPRINT.forEach(slot=>{const key=`${slot.skill}:${slot.taskType}`;slotsByTask[key]=(slotsByTask[key]||0)+1;});
Object.keys(slotsByTask).forEach(key=>{
  const [skill,taskType]=key.split(':');
  const count=Data.skill(skill).items.filter(x=>x.taskType===taskType).length;
  ok(count>=slotsByTask[key]*2,`${key} has enough variants for a fully fresh immediate retake`);
});

// Representative F25-style tasks are answer-checkable without copying the old exam.
ok(App.checkAnswer(Data.item("intermolecular_forces","M1"),"London dispersion, dipole-dipole, and hydrogen bonding.").correct,"alcohol IMF production passes");
ok(App.checkAnswer(Data.item("intermolecular_forces","M2"),"London dispersion and dipole-dipole, but no hydrogen bonding.").correct,"correct denial of ether self hydrogen-bonding passes");
ok(!App.checkAnswer(Data.item("intermolecular_forces","M2"),"London dispersion, dipole-dipole, and hydrogen bonding.").correct,"incorrect affirmative hydrogen-bond claim is rejected");
ok(App.checkAnswer(Data.item("ir","IR1"),"1=B,2=A,3=C").correct,"three-way IR matching passes");
ok(App.checkAnswer(Data.item("relationships","L2"),"constitutional isomers").correct,"relationship classification passes");
ok(App.checkAnswer(Data.item("boiling_points","B1"),"A<B<C<D").correct,"boiling-point ranking passes");
ok(App.checkAnswer(Data.item("conformations","C1"),"A<B<C<D").correct,"Newman stability ranking passes");
ok(App.checkAnswer(Data.item("conformations","C5"),"The gauche conformation has steric crowding, while anti keeps the large groups farther apart at 180 degrees.").correct,"conformational energy explanation passes semantic rubric");

// Paper-production prompts must not display the verification answer/key.
const rawPaper=Data.item("representations","R1");
const visiblePaper=App.paperPrompt(rawPaper);
ok(visiblePaper.includes("draw a bond-line structure"),"paper prompt keeps the actual production task");
ok(!/then type/i.test(visiblePaper),"paper prompt strips the leading verification instruction");
ok(!visiblePaper.includes("5 carbons; OH explicit"),"paper prompt does not reveal its accepted answer");

// PR71 P1 repair: once a hint is revealed, the same-item retry cannot become clean evidence.
const s=App.newState();
const fc=Data.skill("formal_charge"),f1=Data.item("formal_charge","F1");
App.record(s,fc,f1,{correct:false,code:"INCORRECT"});
App.markSupported(s,App.skillState(s,"formal_charge"));
let out=App.record(s,fc,f1,{correct:true});
eq(out.clean,false,"hinted retry is contaminated");
eq(App.skillState(s,"formal_charge").independentCorrect,0,"hinted retry adds no independent evidence");
eq(App.skillState(s,"formal_charge").supportedCorrect,1,"hinted retry is recorded as supported learning");

// A different fresh item in the same task family can restore independent evidence.
s.supportUsed=false;s.guessed=false;
out=App.record(s,fc,Data.item("formal_charge","F2"),{correct:true});
eq(out.clean,true,"fresh unsupported item is clean");
eq(App.skillState(s,"formal_charge").independentCorrect,1,"fresh unsupported item adds independent evidence");

// A correct guess is not secure mastery evidence.
const g=App.newState();g.guessed=true;
out=App.record(g,fc,f1,{correct:true});
eq(out.clean,false,"guessed correct is not clean evidence");
eq(App.skillState(g,"formal_charge").independentCorrect,0,"guessed correct adds no independent evidence");

// Form A and Form B are entirely different. After both unique inventories are
// consumed, Form C is refused instead of silently recycling Form A.
const forms=App.newState();
const p1=App.buildTestPlan(forms);
eq(p1.form,"A","first form is A");
eq(p1.queue.length,17,"Form A has seventeen scored subparts");
eq(p1.queue.reduce((sum,x)=>sum+x.points,0),130,"Form A totals 130 points");
App.commitTestStart(forms,p1);
const p2=App.buildTestPlan(forms);
eq(p2.form,"B","next form is B");
ok(!p2.exhausted,"Form B is available as a fully fresh retake");
const keys1=new Set(p1.queue.map(x=>`${x.skill}:${x.item}`));
const keys2=new Set(p2.queue.map(x=>`${x.skill}:${x.item}`));
ok([...keys2].every(k=>!keys1.has(k)),"Form B reuses none of Form A's items");
eq(p2.queue.map(x=>`${x.section}:${x.skill}:${x.taskType}:${x.points}`).join("|"),p1.queue.map(x=>`${x.section}:${x.skill}:${x.taskType}:${x.points}`).join("|"),"Form B preserves section, task family, and point blueprint");
App.commitTestStart(forms,p2);
const p3=App.buildTestPlan(forms);
ok(p3.exhausted,"Form C is blocked when no never-seen full form remains");
eq(p3.queue.length,0,"exhausted form contains no recycled questions");

// PR72 review repair: paper work is pending review, never auto-scored or used as
// mastery evidence. Auto-scored answers remain buffered until full-form finalization.
const t=App.newState();
const testPlan=App.buildTestPlan(t);App.commitTestStart(t,testPlan);
const paperQ=testPlan.queue.find(x=>x.paper),paperSkill=Data.skill(paperQ.skill),paperItem=Data.item(paperQ.skill,paperQ.item);
App.scoreTestResponse(t,paperSkill,paperQ,paperItem,{correct:true});
eq(t.mix.pointsEarned,0,"paper task cannot earn automatic points");
eq(t.mix.paperPointsPending,paperQ.points,"paper task points are held for review");
eq(t.mix.paperTasks,1,"paper task is counted as pending review");
eq(App.skillState(t,paperSkill.id).independentCorrect,0,"unverified paper task creates no independent evidence");

const autoQuestions=testPlan.queue.filter(x=>!x.paper);
const correctQ=autoQuestions[0],correctSkill=Data.skill(correctQ.skill),correctItem=Data.item(correctQ.skill,correctQ.item);
t.guessed=true;
App.scoreTestResponse(t,correctSkill,correctQ,correctItem,{correct:true});
eq(t.mix.pointsEarned,correctQ.points,"guessed correct still earns raw auto-scored practice points");
eq(t.mix.secureCorrect,0,"guessed correct does not count as secure");
eq(t.mix.guessed,1,"guess is tracked");
eq(App.skillState(t,correctSkill.id).independentCorrect,0,"test evidence is not applied mid-form");
eq(t.errors.length,0,"correct test response causes no mid-form error-log change");

const wrongQ=autoQuestions[1],wrongSkill=Data.skill(wrongQ.skill),wrongItem=Data.item(wrongQ.skill,wrongQ.item);
t.guessed=false;
App.scoreTestResponse(t,wrongSkill,wrongQ,wrongItem,{correct:false,code:"INCORRECT"});
eq(t.errors.length,0,"wrong test response remains buffered before finalization");
eq(App.skillState(t,wrongSkill.id).status,"CHECK","wrong test response does not change visible readiness mid-form");

const finished=App.finalizeTest(t);
ok(finished.completed,"test finalizes");
eq(t.testHistory.length,1,"completed form is saved to test history");
eq(t.testHistory[0].form,"A","saved history keeps form identity");
eq(t.errors.length,1,"buffered wrong auto-scored answer enters error log only after finalization");
eq(App.skillState(t,wrongSkill.id).status,"REVIEW","wrong-answer readiness updates only after finalization");
eq(App.skillState(t,correctSkill.id).independentCorrect,0,"guessed correct remains non-independent after finalization");
eq(App.skillState(t,paperSkill.id).independentCorrect,0,"paper task still has no automatic mastery after finalization");
eq(finished.score.paperPointsPending,paperQ.points,"history preserves paper points pending review");
ok(finished.evidenceApplied,"test evidence is marked applied exactly once");
const errorCountAfterFirstFinalize=t.errors.length;
App.finalizeTest(t);
eq(t.errors.length,errorCountAfterFirstFinalize,"finalizing twice does not duplicate buffered errors");

// Errors route only to real foundation mappings, not invented ones.
const s2=App.newState();
App.record(s2,Data.skill("representations"),Data.item("representations","R1"),{correct:false,code:"REPRESENTATION_INCOMPLETE"});
App.record(s2,Data.skill("ir"),Data.item("ir","IR1"),{correct:false,code:"INCORRECT"});
const recs=App.foundationRecommendations(s2);
eq(recs.length,1,"only a mapped foundation gap produces a readiness-day recommendation");
eq(recs[0].day,1,"representation gap routes to Day 1");
ok(!recs.some(r=>r.skill==="ir"),"course-specific IR weakness stays in Unit 1");

// UI/source contracts: actual F25 calibration is visible and active test mode stays silent.
const hub=fs.readFileSync("course-hub/index.html","utf8");
const html=fs.readFileSync("course-units/unit1/index.html","utf8");
const appSource=fs.readFileSync("course-units/unit1/unit1-app.js","utf8");
ok(hub.includes("../course-units/unit1/#chapter4"),"course hub opens Chapter 4 support");
ok(hub.includes("../course-units/unit1/#test1"),"course hub opens Test 1 practice");
ok(html.includes("Fall 2025 Test 1"),"Unit 1 names the strongest historical calibration source");
ok(html.includes("100 points, 50 minutes, 11 numbered questions"),"Unit 1 surfaces actual F25 exam constraints");
ok(html.includes("bond-line drawing, intermolecular forces, formal charges, hybridization, three-way IR matching"),"Unit 1 surfaces actual task families");
ok(html.includes("old questions are not copied"),"historical questions are not copied into the site");
ok(html.includes("130-point practice scale"),"UI distinguishes current practice scale from historical 100-point exam");
ok(html.includes("have paper beside you")||html.includes("have paper"),"UI tells learner to prepare for written structure work");
ok(html.includes("data-test-history"),"UI has completed test history");
ok(html.includes("Canvas and Mercer email"),"learner is told to verify live course updates");
ok(appSource.includes("no correctness, hints, teaching, error-log changes, or readiness updates are shown until the entire form is finished"),"test mode explicitly withholds all correctness side channels");
ok(appSource.includes("Keep test evidence buffered"),"test lock path documents buffered evidence behavior");
ok(appSource.includes("Unverified drawings never create automatic mastery evidence"),"paper tasks cannot fake mastery");
ok(appSource.includes("Fresh-form bank exhausted"),"app refuses to recycle old forms as fresh");
ok(appSource.includes("Codex P1 repair from PR #71"),"hint-contamination regression guard remains in source");
ok(appSource.includes("Paper required:"),"test renderer flags paper-required production tasks");

console.log(`CHM 221 Unit 1: ${n} assertions passed`);
