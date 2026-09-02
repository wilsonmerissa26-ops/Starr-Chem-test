'use strict';

var fs=require('fs'),vm=require('vm');
var passed=0,failed=0;
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function read(p){return fs.readFileSync(p,'utf8');}
function run(ctx,p){vm.runInContext(read(p),ctx,{filename:p});}
function answers(item){var out={};(item.fields||[]).forEach(function(f){out[f.id]=f.accepted[0];});return out;}

console.log('=== CHAPTER 5 -> LOCKED ADAPTIVE ENGINE BRIDGE ===');

var ctx={console:console};ctx.globalThis=ctx;vm.createContext(ctx);
run(ctx,'student-model-idk-router.js');
run(ctx,'course-units/unit2/chapter5/chapter5-data.js');
run(ctx,'course-units/unit2/chapter5/chapter5-support.js');
run(ctx,'course-units/unit2/chapter5/chapter5-engine-bridge.js');

ok(!!ctx.Chapter5AdaptiveData,'Chapter 5 curriculum loads');
ok(!!ctx.Chapter5AdaptiveSupport,'Chapter 5 support routing loads');
ok(!!ctx.StudentModelIdkRouter,'shared Student Model loads');
ok(ctx.Chapter5EngineBridge.prepare()===true,'bridge injects Chapter 5 curriculum before engine load');
ok(ctx.Test1AdaptiveData===ctx.Chapter5AdaptiveData,'engine data dependency is the Chapter 5 curriculum on this isolated page');
ok(ctx.Test1AdaptiveSupport===ctx.Chapter5AdaptiveSupport,'engine support dependency is Chapter 5 support on this isolated page');

// This is the exact production engine file already live for Test 1. No copy exists in Unit 2.
run(ctx,'course-units/unit1/test1/test1-engine.js');
var E=ctx.Chapter5EngineBridge.adopt(),D=ctx.Chapter5AdaptiveData;
ok(E===ctx.Test1AdaptiveEngine,'Chapter 5 adopts the exact Test 1 adaptive engine object');
ok(ctx.Chapter5AdaptiveEngine===ctx.Test1AdaptiveEngine,'there is one runtime object, not a forked mastery engine');

console.log('\n=== ALL CHAPTER 5 LESSONS SATISFY ENGINE SESSION CONTRACT ===');
D.lessonIds().forEach(function(id){
  var s=E.createSession(id,1000),l=D.lesson(id);
  ok(s.lessonId===id,id+' session starts with its own curriculum ID');
  ok(s.skill.skillId===l.skillId,id+' session uses its Chapter 5 shared Student Model skill ID');
  ok(s.phase==='probe',id+' starts at Quick Diagnostic');
  ok(E.currentItem(s)&&E.currentItem(s).id===l.probe[0].id,id+' exposes its first diagnostic item through the locked engine');
});

console.log('\n=== IDK / WRONG ANSWER REPAIRS THROUGH SAME ENGINE ===');
var repair=E.createSession('cip-rs',1000),bad={};D.lesson('cip-rs').probe[0].fields.forEach(function(f){bad[f.id]='definitely wrong';});
var miss=E.submitProbe(repair,bad,1100);
ok(miss.accepted&&miss.correct===false&&miss.diagnosisRequired,'wrong Chapter 5 probe opens diagnosis instead of looping');
var help=E.requestSupportedHelp(repair,'explanation_not_making_sense',1200);
ok(help.accepted&&/switch representation|cards|atomic number/i.test(help.teaching),'explanation failure changes representation');
ok(repair.repair&&repair.repair.active,'targeted repair is active');
var repairItem=repair.repair.check,repairResult=E.submitSupportedRepair(repair,answers(repairItem),1300);
ok(repairResult.correct===true,'simpler repair check can pass');
ok(repair.phase==='watch','failed diagnostic routes into teaching after repair rather than pretending the probe was mastered');

console.log('\n=== COLD HELP CONTAMINATES AND RETURNS A FRESH ITEM ===');
var cold=E.createSession('chirality-stereocenters',2000);E.setPhase(cold,'independent');
var original=E.currentItem(cold).id;
var idk=E.requestColdHelp(cold,'dont_know_how_to_start',2100);
ok(idk.accepted&&idk.currentItemContaminated&&idk.remediationActive,'cold I-dont-know contaminates the current item and opens shared remediation');
ok(cold.repair&&cold.repair.cold,'cold repair is explicitly marked as cold-evidence remediation');
var coldRepair=E.submitColdRepair(cold,answers(cold.repair.check),2200);
ok(coldRepair.accepted&&coldRepair.correct,'prerequisite repair check opens the remediation gate');
ok(cold.phase==='independent','repair returns to Independent rather than awarding evidence');
ok(E.currentItem(cold).id!==original,'post-help Independent item is genuinely fresh');

console.log('\n=== COMPLETE LEARNING LOOP ON CHAPTER 5 DATA ===');
var s=E.createSession('isomer-classification',10000),l=D.lesson('isomer-classification');
var p1=E.submitProbe(s,answers(E.currentItem(s)),11000),p2=E.submitProbe(s,answers(E.currentItem(s)),12000);
ok(p1.correct&&p2.correct&&s.phase==='independent','2/2 clean diagnostic uses existing tested-out route to cold confirmation');

var cold1=E.currentItem(s),r1=E.submitIndependent(s,answers(cold1),100000);
ok(r1.correct&&r1.countedAsIndependent,'first fresh cold item records independent evidence');
var cold2=E.currentItem(s),r2=E.submitIndependent(s,answers(cold2),200000);
ok(cold2.id!==cold1.id,'second cold item is distinct');
ok(r2.correct&&r2.sufficientEvidence&&s.phase==='explain','required cold count and coverage lead to Explain Why');

var explanation='First compare the molecular formula and then compare connectivity because different connectivity makes constitutional isomers. If connectivity stays the same, compare the three-dimensional spatial arrangement and check whether the structures are superimposable.';
var ex=E.submitExplanation(s,explanation,201000);
ok(ex.accepted&&ex.correct&&s.phase==='transfer','relationship-preserving explanation attaches to cold evidence and opens Transfer');

var tr=E.submitSupported(s,answers(E.currentItem(s)),202000);
ok(tr.accepted&&tr.correct&&s.phase==='activity','Transfer success routes to meaningful different chemistry activity without mastery');

var act=E.submitActivity(s,answers(E.currentItem(s)),203000);
ok(act.accepted&&act.correct&&s.phase==='retrieval-wait','different chemistry activity completes spacing gate but does not auto-launch retrieval');
ok(s.mastered===false,'nothing before delayed retrieval claims mastery');

var tooSoon=E.retrievalReadiness(s,203001);
ok(tooSoon.ready===false&&tooSoon.reason==='minimum_interval_not_elapsed','elapsed-time gate still comes from shared engine');
var due=200000+E.Router.MIN_RETRIEVAL_DELAY_MS+1;
var ready=E.retrievalReadiness(s,due);
ok(ready.ready===true,'retrieval becomes ready only after the shared minimum interval and activity');
var start=E.startRetrieval(s,due);
ok(start.accepted&&s.phase==='retrieval','learner-controlled start opens Later Retrieval');

var retItem=E.currentItem(s),ret=E.submitRetrieval(s,answers(retItem),due+1);
ok(ret.correct&&ret.countedAsIndependent,'fresh delayed retrieval records cold evidence');
ok(ret.mastery&&ret.mastery.mastered===true&&s.phase==='complete','only shared Student Model declares Chapter 5 mastery after valid delayed retrieval');

console.log('\n=== NO UNIT 2 ENGINE COPY ===');
ok(!fs.existsSync('course-units/unit2/chapter5/chapter5-engine.js'),'Unit 2 contains no copied Chapter 5 mastery engine');
var bridgeSource=read('course-units/unit2/chapter5/chapter5-engine-bridge.js');
ok(bridgeSource.indexOf('Test1AdaptiveEngine')!==-1,'bridge explicitly adopts the existing production engine');
ok(!/evaluateMastery|recordIndependentAttempt|MIN_RETRIEVAL_DELAY_MS/.test(bridgeSource),'bridge does not reimplement mastery, evidence, or retrieval rules');

console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');
if(failed)process.exit(1);
