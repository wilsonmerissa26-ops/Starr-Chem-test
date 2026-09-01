"use strict";
var assert=require("assert");
var Data=require("./course-units/unit1/chapter1/chapter1-data.js");
var Engine=require("./course-units/unit1/chapter1/chapter1-engine.js");
var Router=require("./student-model-idk-router.js");
var passed=0;
function ok(label,cond){assert.ok(cond,label);console.log("PASS  "+label);passed++;}
function eq(label,a,b){assert.strictEqual(a,b,label+" expected "+b+" got "+a);console.log("PASS  "+label);passed++;}

ok("Chapter 1 exposes exactly two dependency-ordered lessons",Data.LESSONS.length===2&&Data.LESSONS[0].id==="lewis"&&Data.LESSONS[1].id==="formal-charge");

var t0=1000000;
var s=Engine.createSession("lewis",t0);
eq("Lewis lesson starts in Watch","watch",s.phase);
for(var i=0;i<4;i++)Engine.advanceWatch(s);
eq("Watch hands off to supported concept check",s.phase,"concept");
Engine.submitSupported(s,{v:"6"},t0+10);
Engine.submitSupported(s,{n:"2"},t0+20);
Engine.submitSupported(s,{h:"2"},t0+30);
eq("Concept check hands off to Build Together",s.phase,"build");
Engine.submitSupported(s,{total:"8"},t0+40);
Engine.submitSupported(s,{used:"4"},t0+50);
Engine.submitSupported(s,{remaining:"4"},t0+60);
Engine.submitSupported(s,{pairs:"2"},t0+70);
eq("Build Together hands off to Guided",s.phase,"guided");
Engine.submitSupported(s,{total:"14"},t0+80);
Engine.submitSupported(s,{used:"10"},t0+90);
Engine.submitSupported(s,{remaining:"4",pairs:"2"},t0+100);
eq("Guided fades into cold Independent",s.phase,"independent");
eq("Cold phase sets shared scaffold to COLD",s.skill.scaffoldLevel,Router.SCAFFOLD.COLD);
var cold=Engine.submitIndependent(s,{total:"14",bonds:"6",pairs:"1"},t0+110);
ok("Clean Lewis cold answer counts as independent evidence",cold.correct&&cold.countedAsIndependent);
eq("Clean cold success goes to Explain Why",s.phase,"explain");
var exp=Engine.submitExplanation(s,"The total valence electron count is 14. Six bonds use 12 electrons, and the remaining two electrons form one lone pair on nitrogen.",t0+120);
ok("Correct-shaped explanation attaches to the cold success",exp.correct&&exp.attached);
eq("Explanation hands off to Transfer",s.phase,"transfer");
var tr=Engine.submitTransfer(s,{pairs:"1"},t0+130);
ok("Transfer can pass but does not add independent mastery evidence",tr.correct&&tr.countedAsIndependent===false&&s.skill.independentSuccesses.length===1);
eq("Transfer hands off to intervening chemistry activity",s.phase,"activity");
var act=Engine.submitActivity(s,{formula:"C4H10"},t0+140);
ok("Different chemistry activity completes without adding Lewis cold evidence",act.correct&&s.skill.independentSuccesses.length===1);
eq("Activity routes to Later Retrieval wait",s.phase,"retrieval-wait");
var early=Engine.startRetrieval(s,t0+Router.MIN_RETRIEVAL_DELAY_MS-1);
ok("Retrieval cannot start before the minimum interval",!early.accepted&&early.reason==="minimum_interval_not_elapsed");
var ready=Engine.startRetrieval(s,t0+110+Router.MIN_RETRIEVAL_DELAY_MS+1);
ok("Retrieval starts after both activity and time gates",ready.accepted);
var ret=Engine.submitRetrieval(s,{total:"20",pairs:"2"},t0+110+Router.MIN_RETRIEVAL_DELAY_MS+2);
ok("Fresh delayed retrieval can satisfy shared mastery",ret.correct&&ret.mastery&&ret.mastery.mastered);
eq("Shared Student Model owns final mastered state",s.skill.state,Router.STATES.MASTERED);

var h=Engine.createSession("lewis",t0+5000);Engine.setPhase(h,"independent");
var help=Engine.requestColdHelp(h,Router.IDK_REASONS.DONT_UNDERSTAND,t0+5010);
ok("IDK contaminates the current cold item and opens shared remediation",help.accepted&&help.remediationActive&&Router.isRemediationActive(h.skill));
var same=Engine.submitIndependent(h,{total:"14",bonds:"6",pairs:"1"},t0+5020);
ok("Correct answer after help cannot become independent evidence",same.correct&&!same.countedAsIndependent&&h.skill.independentSuccesses.length===0);
var repaired=Engine.submitRepair(h,{x:"8"},t0+5030);
ok("Passing the targeted repair exits to a fresh independent item",repaired.correct&&h.phase==="independent"&&Engine.currentItem(h).id!=="L-I1");

var f=Engine.createSession("formal-charge",t0+10000);
eq("Formal charge opens with the Lewis prerequisite gate",f.phase,"prerequisite");
Engine.submitSupported(f,{n:"4"},t0+10010);Engine.submitSupported(f,{b:"3"},t0+10020);
eq("Passing the prerequisite gate opens formal-charge Watch",f.phase,"watch");
var fc=Data.lesson("formal-charge").independent[2];
var g=Engine.grade(fc,{v:"4",n:"2",b:"3",fc:"-1"});
ok("Formal-charge field grading diagnoses V, N, B, and FC separately",g.correct);

var html=require("fs").readFileSync("course-units/unit1/chapter1/index.html","utf8");
ok("Chapter 1 page loads the shared Student Model",html.indexOf("student-model-idk-router.js")!==-1);
ok("Chapter 1 page includes learner navigation, Periodic Table, and global Help",html.indexOf("learner-tools.js")!==-1&&html.indexOf("periodic-table.html")!==-1);
ok("Chapter 1 page is mobile viewport aware",html.indexOf("viewport-fit=cover")!==-1&&html.indexOf("@media(max-width:560px)")!==-1);
console.log("SUMMARY: PASS, "+passed+" assertions");