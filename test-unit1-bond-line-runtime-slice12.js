"use strict";

var fs=require("fs"),path=require("path");
var Router=require("./student-model-idk-router.js");
var adapterPath="./course-units/unit1/bond-line/bond-line-independent.js";
var Independent=fs.existsSync(path.join(__dirname,adapterPath))?require(adapterPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function read(rel){return fs.readFileSync(path.join(__dirname,rel),"utf8");}

console.log("=== SLICE 12 PURE COLD-EVIDENCE CONTRACT ===");
check("Independent adapter exists",!!Independent);
if(Independent){
  var bank=Independent.INDEPENDENT_BANK;
  check("cold bank contains exactly the six frozen BL-I items",Array.isArray(bank)&&bank.length===6&&bank.map(function(i){return i.id;}).join(",")==="BL-I1,BL-I2,BL-I3,BL-I4,BL-I5,BL-I6");
  check("every bank item is fresh cold independent content",bank.every(function(i){return i.evidenceKind==="independent"&&i.scaffoldLevel===Router.SCAFFOLD.COLD&&i.fresh===true;}));
  check("production formula is the frozen BL-I5 formula",bank[4].formula==="CH3CH2CH(CH3)CH2CH3");

  var trap=Independent.createSession(900);
  Independent.submitI1Count(trap,6,1000);
  var keywordTrap=Independent.submitI1Explanation(trap,"The vertices are the bonds and the line segments are the carbons. I counted ends, vertices, carbon, bond and line.",1100);
  check("keyword-complete role reversal is rejected",keywordTrap.correct===false&&keywordTrap.code==="ROLE_REVERSAL"&&trap.skill.independentSuccesses.length===0);
  var samePromptRetry=Independent.submitI1Explanation(trap,"I counted both line ends and every corner as carbon positions. The line segments are the bonds connecting them.",1200);
  check("fixing the same failed explanation prompt cannot become cold evidence",samePromptRetry.correct===true&&samePromptRetry.countedAsIndependent===false&&trap.skill.independentSuccesses.length===0);

  var s=Independent.createSession(2000);
  check("session enters Independent at scaffold zero",s.skill.state===Router.STATES.INDEPENDENT_ATTEMPTED&&s.skill.scaffoldLevel===Router.SCAFFOLD.COLD&&s.currentItemId==="BL-I1");
  var count=Independent.submitI1Count(s,6,2100);
  check("BL-I1 requires six carbons before explanation",count.correct===true&&s.itemState.awaitingExplanation===true&&s.skill.independentSuccesses.length===0);
  var explain=Independent.submitI1Explanation(s,"I counted both line ends and every corner as carbon positions. The line segments are the bonds connecting them.",2200);
  check("fresh role-preserving BL-I1 explanation records one cold independent success",explain.correct===true&&s.skill.independentSuccesses.length===1&&s.skill.independentSuccesses[0].itemId==="BL-I1"&&s.skill.independentSuccesses[0].scaffoldLevel===Router.SCAFFOLD.COLD&&s.skill.independentSuccesses[0].correctExplanation===true);
  check("one cold success never displays mastery",Router.evaluateMastery(s.skill).mastered===false&&s.skill.state!==Router.STATES.MASTERED);

  var i2trap=Independent.createSession(2300);Independent.advanceTo(i2trap,"BL-I2");Independent.submitI2Hydrogen(i2trap,1,2400);
  var i2bad=Independent.submitI2Explanation(i2trap,"The hidden hydrogen makes the three visible bonds, so those bonds become implied until carbon reaches four.",2500);
  check("BL-I2 causal reversal does not count as explanation evidence",i2bad.correct===false&&i2trap.skill.independentSuccesses.length===0);

  Independent.advance(s);
  var i2a=Independent.submitI2Hydrogen(s,1,2600);
  check("BL-I2 answer one waits for reasoning",i2a.correct===true&&s.itemState.awaitingExplanation===true);
  var i2good=Independent.submitI2Explanation(s,"There are three visible C-C single bonds, so the carbon already has bond order 3 and needs one C-H bond to reach four.",2700);
  check("fresh correct BL-I2 reasoning records a second distinct cold success",i2good.correct===true&&s.skill.independentSuccesses.length===2&&s.skill.independentSuccesses[1].itemId==="BL-I2");
  check("back-to-back cold successes still fail the retrieval-delay mastery gate",Router.evaluateMastery(s.skill).mastered===false);

  var help=Independent.createSession(3000);Independent.advanceTo(help,"BL-I3");
  var h=Independent.requestHelp(help,Router.IDK_REASONS.DONT_KNOW_START,3100);
  check("requesting help contaminates the current cold item",h.accepted===true&&help.itemState.contaminated===true&&help.skill.scaffoldLevel>Router.SCAFFOLD.COLD&&Router.isRemediationActive(help.skill));
  var helpedCorrect=Independent.submitI3(help,{carbonCount:3,nonCarbonAtom:"O"},3200);
  check("a helped item can be correct but cannot become independent evidence",helpedCorrect.correct===true&&helpedCorrect.countedAsIndependent===false&&help.skill.independentSuccesses.length===0);

  var wrong=Independent.createSession(4000);Independent.advanceTo(wrong,"BL-I4");
  var w1=Independent.submitI4Hydrogen(wrong,2,4100);
  check("wrong cold answer is recorded as actual cold evidence",w1.correct===false&&wrong.skill.attempts.length===1&&wrong.skill.attempts[0].scaffoldLevelAtAttempt===Router.SCAFFOLD.COLD&&wrong.skill.independentSuccesses.length===0);
  var w2=Independent.submitI4Hydrogen(wrong,3,4200);
  check("two wrong cold attempts trigger shared remediation instead of endless retry",w2.correct===false&&w2.remediationActive===true&&Router.isRemediationActive(wrong.skill));

  var prod=Independent.createSession(5000);Independent.advanceTo(prod,"BL-I5");
  var p=Independent.submitI5Skeleton(prod,{nodes:["C1","C2","C3","C4","C5","B1"],edges:[["C1","C2"],["C2","C3"],["C3","C4"],["C4","C5"],["C3","B1"]]},5100);
  check("BL-I5 validates six carbons, five-carbon main chain, branch on carbon 3",p.correct===true&&p.countedAsIndependent===true&&prod.skill.independentSuccesses.length===1);
  var wrongBranch=Independent.createSession(5200);Independent.advanceTo(wrongBranch,"BL-I5");
  var pb=Independent.submitI5Skeleton(wrongBranch,{nodes:["C1","C2","C3","C4","C5","B1"],edges:[["C1","C2"],["C2","C3"],["C3","C4"],["C4","C5"],["C2","B1"]]},5300);
  check("BL-I5 rejects correct carbon count with wrong branch position",pb.correct===false&&pb.code==="WRONG_BRANCH_HOST");

  var back=Independent.createSession(6000);Independent.advanceTo(back,"BL-I6");
  var b1=Independent.submitI6Condensed(back,"CH3C(CH3)2CH3",6100);
  check("BL-I6 accepts a correct condensed formula for the fresh five-carbon branched structure",b1.correct===true&&b1.countedAsIndependent===true);

  var finish=Independent.createSession(7000);
  ["BL-I1","BL-I2","BL-I3","BL-I4","BL-I5","BL-I6"].forEach(function(id){finish.completedItemIds.push(id);});
  check("bank completion routes to Explain Why, never directly to Mastered",Independent.bankStatus(finish).nextPhase==="explain_why"&&finish.skill.state!==Router.STATES.MASTERED);
}

console.log("\n=== SLICE 12 SOURCE/UI CONTRACT ===");
var uiPath="course-units/unit1/bond-line/bond-line-independent-ui.js";
check("Independent learner UI exists",fs.existsSync(path.join(__dirname,uiPath)));
if(fs.existsSync(path.join(__dirname,uiPath))){
  var src=read(uiPath);
  check("cold UI has no timer-driven advancement",src.indexOf("setTimeout(")===-1&&src.indexOf("setInterval(")===-1);
  check("cold UI exposes all six frozen item IDs",["BL-I1","BL-I2","BL-I3","BL-I4","BL-I5","BL-I6"].every(function(id){return src.indexOf(id)!==-1;}));
  check("cold UI offers help only as a contamination route",/requestHelp/.test(src)&&/This item will no longer count as cold evidence/.test(src));
  check("cold UI does not expose notebook, atom overlay, counter, or hint controls",!/data-independent-hint/.test(src)&&!/data-independent-notebook/.test(src)&&!/data-carbon-counter/.test(src)&&!/data-atom-overlay/.test(src));
  check("cold UI ends at Explain Why rather than Mastered",/Explain Why/.test(src)&&!/Mastered/.test(src));
}

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
