"use strict";

var fs=require("fs"),path=require("path");
var Router=require("./student-model-idk-router.js");
var retrievalPath="./course-units/unit1/bond-line/bond-line-retrieval.js";
var Retrieval=fs.existsSync(path.join(__dirname,retrievalPath))?require(retrievalPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function explainedSkill(itemId,timestamp){var s=Router.createSkill("chem.representation.bond_line");s.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(s,itemId||"BL-I1",true,true,timestamp||1000,"cold");return s;}

console.log("=== SLICE 15 SHARED MASTERY TRUTH RULE ===");
var relaxed=explainedSkill("BL-I1",1000);relaxed.scaffoldLevel=Router.SCAFFOLD.COLD;
Router.recordIndependentAttempt(relaxed,"BL-R1",true,false,1000+Router.MIN_RETRIEVAL_DELAY_MS+1000,"retrieval");
check("one explained cold success plus a delayed distinct cold retrieval can satisfy mastery",Router.evaluateMastery(relaxed).mastered===true&&relaxed.state===Router.STATES.MASTERED);

var noExplain=Router.createSkill("chem.representation.bond_line");noExplain.scaffoldLevel=Router.SCAFFOLD.COLD;
Router.recordIndependentAttempt(noExplain,"BL-I1",true,false,1000,"cold");Router.recordIndependentAttempt(noExplain,"BL-R1",true,false,1000+Router.MIN_RETRIEVAL_DELAY_MS+1000,"retrieval");
check("two cold successes without valid explanation evidence do not satisfy mastery",Router.evaluateMastery(noExplain).mastered===false);

var tooSoon=explainedSkill("BL-I1",1000);tooSoon.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(tooSoon,"BL-R1",true,false,1000+60000,"retrieval");
check("distinct retrieval before minimum delay still cannot satisfy mastery",Router.evaluateMastery(tooSoon).mastered===false);

var sameItem=explainedSkill("BL-I1",1000);sameItem.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(sameItem,"BL-I1",true,false,1000+Router.MIN_RETRIEVAL_DELAY_MS+1000,"retrieval");
check("repeating the same item after delay still cannot satisfy mastery",Router.evaluateMastery(sameItem).mastered===false);

console.log("\n=== SLICE 15 LATER RETRIEVAL CONTRACT ===");
check("Later Retrieval adapter exists",!!Retrieval);
if(Retrieval){
  var item=Retrieval.RETRIEVAL_ITEM;
  check("retrieval item is fresh and combines one branch with one explicit heteroatom",item&&item.id==="BL-R1"&&item.fresh===true&&item.hasBranch===true&&item.heteroatom==="O");
  check("fresh structure expects six total carbons and two implied H on selected carbon",item.carbonCount===6&&item.selectedHydrogenCount===2);
  check("retrieval asks exactly two chemistry questions",Array.isArray(item.questions)&&item.questions.length===2);

  var skill=explainedSkill("BL-I1",1000),s=Retrieval.createSession(skill,1100);
  check("retrieval is not immediately available after Transfer",s.phase==="not_due"&&Retrieval.readiness(s,1100).ready===false);
  check("session records a reviewDue timestamp from the shared minimum retrieval delay",skill.reviewDue===1000+Router.MIN_RETRIEVAL_DELAY_MS);
  var noActivity=Retrieval.readiness(s,1000+Router.MIN_RETRIEVAL_DELAY_MS+1000);
  check("elapsed time alone is insufficient without intervening meaningful activity",noActivity.ready===false&&noActivity.reason==="intervening_activity_required");
  Retrieval.registerInterveningActivity(s,"chm221.u1.02",2000);
  var early=Retrieval.begin(s,2000);
  check("intervening activity alone is insufficient before minimum interval",early.started===false&&early.reason==="retrieval_delay_not_met"&&s.phase==="not_due");
  var startAt=1000+Router.MIN_RETRIEVAL_DELAY_MS+1000;
  var begun=Retrieval.begin(s,startAt);
  check("retrieval opens cold only after both activity and interval gates",begun.started===true&&s.phase==="cold"&&skill.scaffoldLevel===Router.SCAFFOLD.COLD);
  var before=skill.independentSuccesses.length;
  var result=Retrieval.submit(s,{carbonCount:6,impliedHydrogenCount:2},startAt+1000);
  check("both clean retrieval answers record one new distinct cold success",result.correct===true&&result.countedAsIndependent===true&&skill.independentSuccesses.length===before+1&&skill.independentSuccesses[skill.independentSuccesses.length-1].itemId==="BL-R1");
  check("retrieval itself does not invent a second explanation",skill.independentSuccesses[skill.independentSuccesses.length-1].correctExplanation===false);
  check("shared mastery evaluator, not content layer, declares mastery after valid retrieval",result.mastery&&result.mastery.mastered===true&&skill.state===Router.STATES.MASTERED);
  check("successful retrieval emits BONDLINE_RETRIEVAL_RESULT",s.events.some(function(e){return e.type==="BONDLINE_RETRIEVAL_RESULT"&&e.correct===true&&e.itemId==="BL-R1";}));

  var wrongSkill=explainedSkill("BL-I1",5000),wrong=Retrieval.createSession(wrongSkill,5100);Retrieval.registerInterveningActivity(wrong,"different_lesson",6000);Retrieval.begin(wrong,5000+Router.MIN_RETRIEVAL_DELAY_MS+1000);
  var bad=Retrieval.submit(wrong,{carbonCount:5,impliedHydrogenCount:2},5000+Router.MIN_RETRIEVAL_DELAY_MS+2000);
  check("failed retrieval is recorded diagnostically but never repeated as cold",bad.correct===false&&bad.freshItemRequired===true&&wrong.phase==="remediation_required"&&wrongSkill.state!==Router.STATES.MASTERED);
  check("failed retrieval does not create an independent success",wrongSkill.independentSuccesses.length===1);

  var helpSkill=explainedSkill("BL-I1",9000),help=Retrieval.createSession(helpSkill,9100);Retrieval.registerInterveningActivity(help,"different_lesson",10000);Retrieval.begin(help,9000+Router.MIN_RETRIEVAL_DELAY_MS+1000);var oldCutoff=helpSkill.masteryEvidenceValidAfter;
  var helped=Retrieval.requestHelp(help,Router.IDK_REASONS.STARTED_STUCK,9000+Router.MIN_RETRIEVAL_DELAY_MS+2000);
  check("help contaminates retrieval and opens shared remediation",helped.accepted===true&&help.contaminated===true&&Router.isRemediationActive(helpSkill)&&helpSkill.masteryEvidenceValidAfter>oldCutoff&&help.phase==="remediation_required");
  var afterHelp=Retrieval.submit(help,{carbonCount:6,impliedHydrogenCount:2},9000+Router.MIN_RETRIEVAL_DELAY_MS+3000);
  check("correct work after help cannot count as cold retrieval evidence",afterHelp.correct===true&&afterHelp.countedAsIndependent===false&&helpSkill.independentSuccesses.length===1&&helpSkill.state!==Router.STATES.MASTERED);

  var stale=explainedSkill("BL-I1",12000);var staleSession=Retrieval.createSession(stale,12100);Router.handleIdk(stale,Router.IDK_REASONS.DONT_KNOW_START,"some_item","chem.representation.bond_line",13000);Router.recordRemediationCheck(stale,true,"repair",13100);Router.exitRemediation(stale,[{id:"fresh_after_repair"}]);stale.scaffoldLevel=Router.SCAFFOLD.COLD;Router.recordIndependentAttempt(stale,"BL-R1",true,false,13000+Router.MIN_RETRIEVAL_DELAY_MS+1000,"retrieval");
  check("retrieval after remediation cannot revive stale pre-remediation explanation evidence",Router.evaluateMastery(stale).mastered===false);
}

console.log("\n=== SLICE 15 SOURCE/UI CONTRACT ===");
var uiPath="course-units/unit1/bond-line/bond-line-retrieval-ui.js";
check("Later Retrieval learner UI exists",fs.existsSync(path.join(__dirname,uiPath)));
if(fs.existsSync(path.join(__dirname,uiPath))){
  var src=fs.readFileSync(path.join(__dirname,uiPath),"utf8");
  check("retrieval UI visibly contains a branch plus explicit O heteroatom",/branch/i.test(src)&&/>O</.test(src));
  check("retrieval UI asks only carbon count and selected-carbon implied H",/total carbon/i.test(src)&&/implied hydrogens/i.test(src));
  check("retrieval UI has no Hint, notebook, atom overlay, or carbon counter controls",!/data-retrieval-hint/.test(src)&&!/data-retrieval-notebook/.test(src)&&!/data-atom-overlay/.test(src)&&!/data-carbon-counter/.test(src));
  check("retrieval UI has no timer-driven advancement",src.indexOf("setTimeout(")===-1&&src.indexOf("setInterval(")===-1);
  check("retrieval UI displays Mastered only from returned shared mastery result",/result\.mastery\.mastered/.test(src));
}

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
