"use strict";
var assert=require("assert"),fs=require("fs"),JSDOM=require("jsdom").JSDOM;
var dom=new JSDOM("<!doctype html><body></body>",{runScripts:"outside-only",url:"https://example.test/course-units/unit1/chapter1/"}),w=dom.window;
[
  "student-model-idk-router.js",
  "course-units/unit1/chapter1/chapter1-data.js",
  "course-units/unit1/chapter1/chapter1-engine.js",
  "course-units/unit1/chapter1/chapter1-support.js",
  "course-units/unit1/chapter1/chapter1-policy.js",
  "course-units/unit1/chapter1/chapter1-support-hook.js"
].forEach(function(path){w.eval(fs.readFileSync(path,"utf8"));});
var E=w.Chapter1TeachingEngine,R=w.StudentModelIdkRouter,P=w.Chapter1TeachingPolicy,passed=0;
function ok(label,cond){assert.ok(cond,label);console.log("PASS  "+label);passed++;}
function eq(label,a,b){assert.strictEqual(a,b,label);console.log("PASS  "+label);passed++;}

var t=2000000,s=E.createSession("lewis",t);E.setPhase(s,"independent");
var a=E.submitIndependent(s,{total:"14",bonds:"6",pairs:"1"},t+1);
ok("Lewis first clean cold success is evidence but not enough to explain yet",a.correct&&a.countedAsIndependent&&!a.sufficientEvidence&&s.phase==="independent");
eq("Lewis advances to a different cold item","L-I2",E.currentItem(s).id);
var b=E.submitIndependent(s,{total:"20",bonds:"8",pairs:"2"},t+2);
ok("Lewis requires multiple clean cold constructions before Explain Why",b.correct&&b.sufficientEvidence&&s.phase==="explain");
var failed=E.submitExplanation(s,"Because that is the answer.",t+3);
ok("Wrong Explain Why cannot be retried on the same cold item",failed.accepted&&!failed.correct&&failed.freshItemRequired&&s.phase==="independent"&&s.repair&&s.repair.active);
var repair=E.submitRepair(s,{v:"6"},t+4);
ok("Explanation repair must pass before a fresh cold item",repair.accepted&&repair.correct&&s.phase==="independent");
ok("Fresh cold item after failed explanation is different from the failed item",E.currentItem(s).id!=="L-I2");

var f=E.createSession("formal-charge",t+100);E.setPhase(f,"independent");
var f1=E.submitIndependent(f,{v:"5",n:"0",b:"4",fc:"+1"},t+101);
ok("Formal charge clean charged case alone is insufficient",f1.correct&&!f1.sufficientEvidence);
var f2=E.submitIndependent(f,{v:"6",n:"4",b:"2",fc:"0"},t+102);
ok("Formal charge charged + multiple coverage still requires three clean cold items",f2.correct&&!f2.sufficientEvidence);
var f3=E.submitIndependent(f,{v:"4",n:"2",b:"3",fc:"-1"},t+103);
ok("Formal charge reaches Explain Why only after 3 clean with charged and multiple coverage",f3.correct&&f3.sufficientEvidence&&f.phase==="explain");
var pol=P.status(w.Chapter1TeachingData.lesson("formal-charge"),f.cleanIndependentItemIds);
ok("Formal policy records charged and multiple-bond coverage",pol.ready&&pol.charged&&pol.multiple&&pol.cleanCount===3);

var g=E.createSession("formal-charge",t+200);E.setPhase(g,"independent");
E.submitIndependent(g,{v:"5",n:"0",b:"4",fc:"+1"},t+201);
var miss=E.submitIndependent(g,{v:"6",n:"4",b:"1",fc:"0"},t+202);
ok("Wrong multiple-bond cold item becomes repair, not evidence",!miss.correct&&miss.freshItemRequired&&g.repair&&g.repair.active);
var rp=E.submitRepair(g,{x:"3"},t+203);
ok("Repair after a wrong cold item routes to a fresh item",rp.correct&&E.currentItem(g).id!=="F-I2");
E.submitIndependent(g,{v:"4",n:"2",b:"3",fc:"-1"},t+204);
E.submitIndependent(g,{v:"5",n:"2",b:"3",fc:"0"},t+205);
eq("If the original multiple-bond item was contaminated, a fresh alternate multiple-bond item is supplied","F-I5",E.currentItem(g).id);
var alt=E.submitIndependent(g,{v:"6",n:"2",b:"3",fc:"+1"},t+206);
ok("Fresh alternate restores formal-charge coverage without recycling the contaminated item",alt.correct&&alt.sufficientEvidence&&g.phase==="explain");

var h=E.createSession("formal-charge",t+300);E.setPhase(h,"independent");
var help=E.requestColdHelp(h,R.IDK_REASONS.DONT_KNOW_START,t+301);
ok("Formal-charge IDK uses reason-specific start teaching",help.accepted&&help.targetedErrorCode==="VALENCE_COUNT"&&/four small boxes/i.test(help.teaching));
ok("IDK keeps shared remediation active and current item contaminated",R.isRemediationActive(h.skill)&&h.currentColdContaminated);
console.log("SUMMARY: PASS, "+passed+" assertions");