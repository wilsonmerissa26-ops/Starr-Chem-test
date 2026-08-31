"use strict";

var fs=require("fs"),path=require("path");
var Router=require("./student-model-idk-router.js");
var explainPath="./course-units/unit1/bond-line/bond-line-explain-why.js";
var Explain=fs.existsSync(path.join(__dirname,explainPath))?require(explainPath):null;
var failed=0;
function check(label,condition){if(condition)console.log("PASS  "+label);else{console.log("FAIL  "+label);failed++;}}
function coldSkill(itemId,timestamp){var s=Router.createSkill("chem.representation.bond_line");s.scaffoldLevel=Router.SCAFFOLD.COLD;s.state=Router.STATES.INDEPENDENT_ATTEMPTED;Router.recordIndependentAttempt(s,itemId,true,false,timestamp||1000,"cold-answer");return s;}

console.log("=== SLICE 13 SHARED EXPLANATION EVIDENCE CONTRACT ===");
check("shared Student Model exposes independent-explanation attachment",typeof Router.recordIndependentExplanation==="function");
if(typeof Router.recordIndependentExplanation==="function"){
  var none=Router.createSkill("chem.representation.bond_line");none.scaffoldLevel=Router.SCAFFOLD.COLD;
  var noCold=Router.recordIndependentExplanation(none,"BL-I3",true,1200,"good words");
  check("explanation alone cannot invent a cold success",noCold&&noCold.accepted===false&&noCold.reason==="no_matching_cold_success"&&none.independentSuccesses.length===0);
  var target=coldSkill("BL-I3",1300);
  var attached=Router.recordIndependentExplanation(target,"BL-I3",true,1400,"correct explanation");
  check("correct explanation upgrades an existing cold success",attached&&attached.accepted===true&&attached.attached===true&&target.independentSuccesses[0].correctExplanation===true);
  check("explanation timestamp does not rewrite original cold-retrieval timestamp",target.independentSuccesses[0].timestamp===1300);
  check("explanation attempts are stored separately from answer attempts",Array.isArray(target.explanationAttempts)&&target.explanationAttempts.length===1&&target.explanationAttempts[0].itemId==="BL-I3"&&target.attempts.length===1);
}

console.log("\n=== SLICE 13 ROLE-PRESERVING EXPLAIN-WHY CONTRACT ===");
check("Explain Why adapter exists",!!Explain);
if(Explain){
  check("exact frozen E-W1/E-W2/E-W3 prompt set exists",Explain.PROMPTS.map(function(p){return p.id;}).join(",")==="E-W1,E-W2,E-W3");
  check("E-W1 freezes three-segment/four-carbon question",/three-segment unbranched bond-line chain contain four carbons instead of three/i.test(Explain.PROMPTS[0].prompt));
  check("E-W2 freezes internal CH2 hidden-H question",/selected internal carbon CH2/i.test(Explain.PROMPTS[1].prompt));
  check("E-W3 freezes explicit-O versus omitted-C question",/write O explicitly/i.test(Explain.PROMPTS[2].prompt)&&/omit C labels/i.test(Explain.PROMPTS[2].prompt));

  var w1good=Explain.grade("E-W1","The three line segments are bonds connecting carbon positions. The carbons are at both line ends and the two corners, so the chain has four carbons.");
  check("E-W1 accepts role-preserving learner language",w1good.correct===true);
  var w1reverse=Explain.grade("E-W1","The vertices are bonds, and the three line segments plus an end are the four carbons.");
  check("E-W1 rejects keyword-complete role reversal",w1reverse.correct===false&&w1reverse.code==="ROLE_REVERSAL");
  var w1missing=Explain.grade("E-W1","There are four because I counted four things.");
  check("E-W1 rejects vague answer without required relationships",w1missing.correct===false);

  var w2good=Explain.grade("E-W2","It has two visible C-C single bonds, so visible bond order is 2. Carbon needs four total, leaving two implied C-H bonds, so it is CH2.");
  check("E-W2 accepts visible-order to implied-H reasoning",w2good.correct===true);
  var w2reverse=Explain.grade("E-W2","The two hidden hydrogens give the carbon its two visible C-C bonds, and the visible bonds are implied to reach four.");
  check("E-W2 rejects visible/implied causal reversal",w2reverse.correct===false&&w2reverse.code==="ROLE_REVERSAL");

  var w3good=Explain.grade("E-W3","An unlabeled line end or corner defaults to carbon. Oxygen is a different atom, so its O symbol has to be written.");
  check("E-W3 accepts carbon-default plus explicit-oxygen relationship",w3good.correct===true);
  var w3reverse=Explain.grade("E-W3","Oxygen is the default atom at unlabeled vertices, while carbon has to be explicitly labeled C.");
  check("E-W3 rejects atom-role reversal",w3reverse.correct===false&&w3reverse.code==="ROLE_REVERSAL");
  var contradiction=Explain.grade("E-W3","Unlabeled ends are carbon, but oxygen is also the default at unlabeled corners, so O is optional.");
  check("one correct proposition plus a contradiction still fails",contradiction.correct===false);

  var skill=coldSkill("BL-I3",2000),session=Explain.createSession(skill);
  Explain.advanceTo(session,"E-W3");
  var wrong=Explain.submit(session,"Oxygen is the default atom at unlabeled vertices, while carbon has to be explicitly labeled C.",2100);
  check("wrong explanation marks the prompt non-fresh and does not attach evidence",wrong.correct===false&&wrong.freshPromptRequired===true&&skill.independentSuccesses[0].correctExplanation===false);
  var sameRetry=Explain.submit(session,"An unlabeled end or corner means carbon, while oxygen must be written as O.",2200);
  check("correcting the same failed explanation prompt cannot become explanation evidence",sameRetry.correct===true&&sameRetry.countedAsExplanationEvidence===false&&skill.independentSuccesses[0].correctExplanation===false);
  var fresh=Explain.nextFreshPrompt(session);
  check("failed explanation routes to a fresh equivalent prompt",fresh&&fresh.id==="E-W3-R1"&&fresh.fresh===true);
  var freshGood=Explain.submit(session,"If an end or vertex is unlabeled it represents carbon here. Oxygen is a heteroatom, so the O label must stay visible.",2300);
  check("fresh repaired explanation can attach to the existing BL-I3 cold success",freshGood.correct===true&&freshGood.countedAsExplanationEvidence===true&&skill.independentSuccesses[0].correctExplanation===true);

  var emptySkill=Router.createSkill("chem.representation.bond_line"),emptySession=Explain.createSession(emptySkill);Explain.advanceTo(emptySession,"E-W3");
  var orphan=Explain.submit(emptySession,"An unlabeled end or corner means carbon, while oxygen must be written as O.",2400);
  check("correct explanation without matching cold success stays non-evidence",orphan.correct===true&&orphan.countedAsExplanationEvidence===false&&emptySkill.independentSuccesses.length===0);

  var finish=Explain.createSession(coldSkill("BL-I1",3000));finish.completedPromptIds=["E-W1","E-W2","E-W3"];
  check("Explain Why completion routes to Transfer, never directly to Mastered",Explain.status(finish).nextPhase==="transfer"&&finish.skill.state!==Router.STATES.MASTERED);
}

console.log("\n=== SLICE 13 SOURCE/UI CONTRACT ===");
var uiPath="course-units/unit1/bond-line/bond-line-explain-why-ui.js";
check("Explain Why learner UI exists",fs.existsSync(path.join(__dirname,uiPath)));
if(fs.existsSync(path.join(__dirname,uiPath))){
  var src=fs.readFileSync(path.join(__dirname,uiPath),"utf8");
  check("Explain Why UI contains all three frozen prompt IDs",["E-W1","E-W2","E-W3"].every(function(id){return src.indexOf(id)!==-1;}));
  check("Explain Why UI has no keyword checklist or token-count grader",!/keyword checklist/i.test(src)&&!/requiredWords/.test(src)&&!/containsAll/.test(src));
  check("Explain Why UI has no timer-driven advancement",src.indexOf("setTimeout(")===-1&&src.indexOf("setInterval(")===-1);
  check("Explain Why UI ends at Transfer rather than Mastered",/Transfer/.test(src)&&!/Mastered/.test(src));
}

console.log("\n=== SUMMARY: "+(failed?"FAIL":"PASS")+" ===");if(failed)process.exit(1);
