"use strict";

var fs=require("fs"),path=require("path");
var Router=require("./student-model-idk-router.js");
var transferPath="./course-units/unit1/bond-line/bond-line-transfer.js";
var Transfer=fs.existsSync(path.join(__dirname,transferPath))?require(transferPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function skillWithEvidence(){
  var s=Router.createSkill("chem.representation.bond_line");s.scaffoldLevel=Router.SCAFFOLD.COLD;s.state=Router.STATES.EXPLAIN_WHY;
  Router.recordIndependentAttempt(s,"BL-I1",true,true,1000,"cold");
  Router.recordIndependentAttempt(s,"BL-I2",true,true,1100,"cold");
  s.state=Router.STATES.EXPLAIN_WHY;return s;
}

console.log("=== SLICE 14 TRANSFER CONTRACT ===");
check("Transfer adapter exists",!!Transfer);
if(Transfer){
  check("frozen primary transfer task is BL-T1",Transfer.TASKS&&Transfer.TASKS.T1.id==="BL-T1"&&/classmate says this bond-line structure has only four atoms because she sees four corners/i.test(Transfer.TASKS.T1.prompt));
  check("fresh recovery transfer task is BL-T2",Transfer.TASKS.T2.id==="BL-T2"&&/one double bond and two single bonds/i.test(Transfer.TASKS.T2.prompt));

  var skill=skillWithEvidence(),beforeSuccess=skill.independentSuccesses.length,s=Transfer.createSession(skill);
  check("Transfer starts on T1 without declaring mastery",s.phase==="t1"&&skill.state!==Router.STATES.MASTERED);
  var good=Transfer.submitT1(s,{carbonCount:6,explanation:"She counted the four corners but missed both line ends. Those two line ends also represent carbon, so there are six carbons total."},2000);
  check("T1 accepts six carbons plus line-end reasoning",good.correct===true&&good.complete===true&&s.phase==="complete");
  check("passing Transfer does not create another independent success",skill.independentSuccesses.length===beforeSuccess);
  check("passing Transfer emits a transfer result and routes to later retrieval",s.events.some(function(e){return e.type==="BONDLINE_TRANSFER_RESULT"&&e.correct===true&&e.taskId==="BL-T1";})&&Transfer.status(s).nextPhase==="later_retrieval");
  check("passing Transfer still does not declare Mastered",skill.state!==Router.STATES.MASTERED);

  var trap=Transfer.createSession(skillWithEvidence());
  var centerWrong=Transfer.submitT1(trap,{carbonCount:6,explanation:"There are six because the four corners plus two bond centers are carbons."},2100);
  check("T1 rejects bond-center-as-carbon reasoning even with correct count",centerWrong.correct===false&&centerWrong.code==="BOND_CENTER_AS_CARBON"&&trap.phase==="t1_repair");
  var missedEnds=Transfer.createSession(skillWithEvidence());
  var vague=Transfer.submitT1(missedEnds,{carbonCount:6,explanation:"She just missed two atoms, so it is six."},2200);
  check("T1 requires the missing positions to be identified as line ends",vague.correct===false&&vague.code==="MISSING_LINE_END_RELATION"&&missedEnds.phase==="t1_repair");

  check("T1 repair is interactive and starts with zero repaired ends",Transfer.repairStatus(trap).endsFound===0&&Transfer.repairStatus(trap).complete===false);
  var bondTap=Transfer.tapT1Repair(trap,"BOND_CENTER_2");
  check("repair rejects a bond center as a carbon position",bondTap.accepted===false&&bondTap.reason==="bond_center"&&Transfer.repairStatus(trap).endsFound===0);
  var left=Transfer.tapT1Repair(trap,"END_LEFT");
  check("one endpoint alone does not finish the repair",left.accepted===true&&left.complete===false&&Transfer.repairStatus(trap).endsFound===1);
  var right=Transfer.tapT1Repair(trap,"END_RIGHT");
  check("both missed line ends finish repair and route to fresh T2",right.accepted===true&&right.complete===true&&trap.phase==="t2");
  check("T1 is never repeated after a wrong answer",trap.currentTaskId==="BL-T2"&&trap.seenTaskIds.filter(function(id){return id==="BL-T1";}).length===1);

  var t2bad=Transfer.submitT2(trap,{hydrogenCount:1,explanation:"It has one hydrogen because I see three neighboring atoms."},2300);
  check("T2 rejects neighbor-count reasoning and does not repeat itself",t2bad.correct===false&&trap.phase==="remediation_required"&&trap.currentTaskId===null);

  var recovery=Transfer.createSession(skillWithEvidence());Transfer.submitT1(recovery,{carbonCount:4,explanation:"Only the corners count."},2400);Transfer.tapT1Repair(recovery,"END_LEFT");Transfer.tapT1Repair(recovery,"END_RIGHT");
  var t2good=Transfer.submitT2(recovery,{hydrogenCount:0,explanation:"The double bond contributes bond order 2 and the two single bonds contribute 1 each. That totals 4, so no hydrogen can be attached."},2500);
  check("fresh T2 accepts bond-order 2+1+1=4 and zero H",t2good.correct===true&&t2good.complete===true&&recovery.phase==="complete");
  check("recovery success is transfer evidence only, not independent/mastery evidence",recovery.skill.independentSuccesses.length===2&&recovery.skill.state!==Router.STATES.MASTERED&&recovery.events.some(function(e){return e.type==="BONDLINE_TRANSFER_RESULT"&&e.taskId==="BL-T2"&&e.correct===true;}));

  var helpedSkill=skillWithEvidence(),cutoffBefore=helpedSkill.masteryEvidenceValidAfter,helped=Transfer.createSession(helpedSkill);
  var h=Transfer.requestHelp(helped,Router.IDK_REASONS.DONT_KNOW_START,3000);
  check("help on T1 contaminates T1 and opens the shared remediation gate",h.accepted===true&&helped.t1Contaminated===true&&Router.isRemediationActive(helpedSkill)&&helpedSkill.masteryEvidenceValidAfter>cutoffBefore&&helped.phase==="t1_repair");
  Transfer.tapT1Repair(helped,"END_LEFT");var helpedRepair=Transfer.tapT1Repair(helped,"END_RIGHT");
  check("interactive repair satisfies the shared gate before fresh T2",helpedRepair.complete===true&&helped.phase==="t2"&&!Router.isRemediationActive(helpedSkill));
  check("fresh T2 follows help instead of repeating T1",helped.currentTaskId==="BL-T2");
}

console.log("\n=== SLICE 14 SOURCE/UI CONTRACT ===");
var uiPath="course-units/unit1/bond-line/bond-line-transfer-ui.js";
check("Transfer learner UI exists",fs.existsSync(path.join(__dirname,uiPath)));
if(fs.existsSync(path.join(__dirname,uiPath))){
  var src=fs.readFileSync(path.join(__dirname,uiPath),"utf8");
  check("Transfer UI shows a T1 visual with both ends and several vertices",/END_LEFT/.test(src)&&/END_RIGHT/.test(src)&&/four corners/i.test(src));
  check("wrong/helped T1 uses interactive endpoint repair before T2",/data-transfer-repair/.test(src)&&/tapT1Repair/.test(src)&&/BL-T2/.test(src));
  check("Transfer UI exposes six-way help rather than silently giving a hint",/IDK_REASONS/.test(src)&&/I need help/.test(src)&&!/data-transfer-hint/.test(src));
  check("Transfer UI has no timer-driven advancement",src.indexOf("setTimeout(")===-1&&src.indexOf("setInterval(")===-1);
  check("Transfer completion says Later Retrieval and never Mastered",/Later Retrieval/.test(src)&&!/Mastered/.test(src));
}

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
