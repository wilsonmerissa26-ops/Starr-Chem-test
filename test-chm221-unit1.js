"use strict";
const assert=require("assert");
const fs=require("fs");
const Engine=require("./readiness-day-engine.js");
const Data=require("./course-units/unit1/unit1-data.js");
const LessonData=require("./course-units/unit1/unit1-lesson-data.js");
const Teacher=require("./course-units/unit1/unit1-teacher.js");
const App=require("./course-units/unit1/unit1-app.js");
let n=0;
function ok(v,m){assert(v,m);n++;}
function eq(a,b,m){assert.equal(a,b,m);n++;}

// Course scope follows the syllabus sequence and current textbook chapter.
eq(Data.META.testDate,"2026-09-03","Test 1 date is Sept 3");
eq(Data.META.testPoints,130,"Unit 1 Test is 130 points");
ok(Data.META.currentChapter.includes("Alkanes and Cycloalkanes"),"current Chapter 4 title is present");
ok(Data.META.cumulativeCoverage.some(x=>x.includes("2.1–2.6")),"Test 1 coverage keeps the assigned Chapter 2.1-2.6 slice");

// Vertical slice covers current Chapter 4 plus required earlier representations.
eq(Data.SKILLS.length,7,"seven Unit 1 skill areas ship in the course-support slice");
["representations","formal_charge","functional_groups","nomenclature","isomers","conformations","cycloalkanes"].forEach(id=>ok(Data.skill(id),`${id} skill exists`));
Data.SKILLS.forEach(s=>ok(s.items.length>=4,`${s.id} has a deep enough fresh-item bank to avoid A/B bouncing`));
eq(Data.TEST1_MIX.length,10,"mixed Test 1 practice has ten items");

// Every skill has a teaching route. Course-specific skills use visual Watch steps;
// formal charge reuses the already-built Day 2 lesson instead of duplicating it.
eq(LessonData.all().length,7,"all seven Unit 1 skills have lesson routing");
LessonData.all().forEach(l=>{
  if(l.externalHref){
    ok(l.externalHref.includes("day2"),`${l.id} reuses the verified Day 2 lesson`);
  }else{
    ok(l.watch.length>=3,`${l.id} has a multi-step Watch sequence`);
    ok(l.watch.every(step=>step.visual&&step.visual.kind),`${l.id} Watch steps have authored visual states`);
    ok(l.guided.length>=2,`${l.id} has Build Together plus Guided practice`);
  }
});

// Correct the old false mappings: Bond-line representations and functional-group
// recognition were not Day 1 lessons. Formal charge really is Day 2.
eq(Data.skill("representations").foundationDay,null,"bond-line does not falsely route to Day 1");
eq(Data.skill("functional_groups").foundationDay,null,"functional groups do not falsely route to Day 1");
eq(Data.skill("formal_charge").foundationDay,2,"formal charge reuses Day 2");

// The generic course teacher follows TEACH/WATCH -> BUILD TOGETHER -> GUIDED.
const teachSession=Teacher.createSession("nomenclature");
eq(teachSession.phase,Teacher.PHASES.TEACH,"lesson starts in TEACH");
Teacher.nextWatch(teachSession);
Teacher.nextWatch(teachSession);
Teacher.nextWatch(teachSession);
let watchOut=Teacher.nextWatch(teachSession);
eq(watchOut.phase,Teacher.PHASES.BUILD_TOGETHER,"Watch completion moves to Build Together");
let guided=Teacher.recordGuided(teachSession,"5");
ok(guided.correct&&!guided.complete,"first supported response is correct but lesson is not finished");
guided=Teacher.recordGuided(teachSession,"2-methylpentane");
ok(guided.correct&&guided.complete,"second guided success completes the supported teaching cycle");
eq(teachSession.phase,Teacher.PHASES.COMPLETE,"teaching cycle finishes before fresh independent proof");

const repairSession=Teacher.createSession("conformations");
for(let i=0;i<LessonData.lesson("conformations").watch.length;i++)Teacher.nextWatch(repairSession);
const miss=Teacher.recordGuided(repairSession,"gauche");
ok(!miss.correct&&!!miss.representation,"a guided miss triggers a representation switch instead of text repetition");

// Reuse the locked readiness evaluator for open semantic answers.
const r1=Data.item("representations","R1");
ok(App.checkAnswer(r1,"Each unlabeled end or vertex is a carbon, and the hydrogens are omitted because enough are implied to give carbon four bonds.").correct,"semantic bond-line answer passes locked evaluator");
ok(!App.checkAnswer(r1,"It means hydrogen.").correct,"wrong bond-line role is rejected");

// Exact production checks work for nomenclature and short factual answers.
ok(App.checkAnswer(Data.item("nomenclature","N1"),"2-methylpentane").correct,"correct IUPAC name accepted");
ok(!App.checkAnswer(Data.item("nomenclature","N1"),"3-methylpentane").correct,"wrong locant rejected");
ok(App.checkAnswer(Data.item("formal_charge","F1"),"two").correct,"oxygen lone-pair count accepted");
ok(App.checkAnswer(Data.item("cycloalkanes","Y1"),"equatorial").correct,"chair stability production accepted");

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

// Fresh selection uses the expanded bank and avoids recently seen items when possible.
const sf=App.newState();
const rep=Data.skill("representations");
App.record(sf,rep,Data.item("representations","R1"),{correct:false,code:"INCORRECT"});
const fresh=App.freshItem(sf,rep,"R1");
ok(fresh&&fresh.id!=="R1","fresh-item selection never immediately repeats the originating item");

// Only a real existing lesson mapping creates a readiness-day recommendation.
const s2=App.newState();
App.record(s2,Data.skill("representations"),Data.item("representations","R1"),{correct:false,code:"REPRESENTATION_INCOMPLETE"});
App.record(s2,Data.skill("formal_charge"),Data.item("formal_charge","F1"),{correct:false,code:"INCORRECT"});
const recs=App.foundationRecommendations(s2);
eq(recs.length,1,"only the real existing Day 2 lesson route is recommended");
eq(recs[0].day,2,"formal-charge gap routes to Day 2");
ok(!recs.some(r=>r.skill==="representations"),"bond-line gap stays in its real Unit 1 lesson instead of falsely routing to Day 1");

// UI contracts: hub points to live course support; module loads the visual teacher.
const hub=fs.readFileSync("course-hub/index.html","utf8");
const html=fs.readFileSync("course-units/unit1/index.html","utf8");
ok(hub.includes("../course-units/unit1/#chapter4"),"course hub opens Chapter 4 support");
ok(hub.includes("../course-units/unit1/#test1"),"course hub opens Test 1 practice");
ok(html.includes("../../readiness-day-engine.js"),"Unit 1 loads the existing readiness engine");
ok(html.includes("unit1-lesson-data.js"),"Unit 1 loads authored lesson content");
ok(html.includes("unit1-teacher.js"),"Unit 1 loads the teaching-cycle runtime");
ok(html.includes("Replay animation" )===false,"button text is runtime-authored rather than fake static markup");
ok(html.includes("Learn it. Watch it. Practice it. Then prove it."),"Unit 1 makes teaching-before-proof explicit");
ok(html.includes("@keyframes chairFlip"),"chair-flip teaching has a real animation definition");
ok(html.includes("@keyframes drawLine"),"bond-line teaching has a real drawing animation definition");
ok(html.includes("tests are closed book and closed notes"),"Unit 1 carries forward the syllabus test rule");
ok(html.includes("generative AI should not be used to complete assignments"),"Unit 1 preserves academic-integrity boundary");
ok(html.includes("Canvas and Mercer email"),"Unit 1 tells learner to verify live course updates");

console.log(`CHM 221 Unit 1: ${n} assertions passed`);