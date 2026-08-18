/* ============================================================
   MATH GYM -> SHARED STUDENT MODEL EVIDENCE CONTRACT
   ============================================================ */
'use strict';
var assert=require('assert');
var gym=require('./math-gym-engine.js');
var ui=require('./day1/math-gym-ui.js');
var runtime=require('./day1-adaptive-runtime.js');
var adapters=require('./day1-problem-source-adapters.js');
var checker=require('./math-answer-checker.js');

var deps={runtime:runtime,adapters:adapters,checker:checker};

var item={
  id:'gym-15-80',area:'fractions_percentages',type:'percent_of_whole_test',prompt:'15% of 80 =',answer:12,
  strategyInput:{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80},
  check:function(v){return Number(v)===12;}
};
var state=runtime.createLearnerState({studentId:'gym-evidence'});
var result=ui.applyAdaptiveSubmission(deps,state,item,'practice','12','');
assert.strictEqual(result.correct,true);
assert.strictEqual(result.plan.chosenStrategyId,'percent_10_plus_5');
assert.ok(result.runtimeResult.routeFluencySkillIds.indexOf('divide_by_10')>=0);
assert.ok(result.runtimeResult.routeFluencySkillIds.indexOf('halving')>=0);
assert.ok(runtime.studentFluency(state).halving>0,'unaided first-try correct Math Gym should create positive route fluency');

// A canonical mental hint marks support. The answer can still be correct, but
// the same attempt must not be credited as unaided route fluency.
var state2=runtime.createLearnerState({studentId:'gym-assisted'});
var hint=ui.applyAdaptiveHint(deps,state2,item);
assert.ok(hint && hint.hint,'adaptive Math Gym hint should come from selected strategy');
var assisted=ui.applyAdaptiveSubmission(deps,state2,item,'practice','12','');
assert.strictEqual(assisted.correct,true);
assert.deepStrictEqual(assisted.runtimeResult.routeFluencySkillIds,[],'assisted answer must not earn unaided route fluency');
assert.strictEqual(runtime.studentFluency(state2).halving,undefined);

// A wrong first try permanently disqualifies that item attempt from fluency,
// even if the learner fixes it correctly afterward without asking for a hint.
var stateWrongFirst=runtime.createLearnerState({studentId:'gym-wrong-first'});
var firstWrong=ui.applyAdaptiveSubmission(deps,stateWrongFirst,item,'speed','15','');
assert.strictEqual(firstWrong.correct,false);
assert.strictEqual(stateWrongFirst.current.mathGymHadWrong,true);
var fixedSecond=ui.applyAdaptiveSubmission(deps,stateWrongFirst,item,'speed','12','');
assert.strictEqual(fixedSecond.correct,true);
assert.strictEqual(fixedSecond.runtimeResult.hadWrongBeforeCorrect,true);
assert.deepStrictEqual(fixedSecond.runtimeResult.routeFluencySkillIds,[],'correct-after-wrong must not count as fluent first-try evidence');
assert.strictEqual(runtime.studentFluency(stateWrongFirst).halving,undefined);

// Wrong answer remains wrong in canonical checker even if a legacy item.check
// implementation would be altered later.
var wrong=ui.applyAdaptiveSubmission(deps,runtime.createLearnerState(),item,'practice','15','');
assert.strictEqual(wrong.correct,false);

// A new generated item starts with a clean first-try flag.
var generated=gym.generateFractionOfWhole(function(){return 0.2;});
var s3=runtime.createLearnerState();
var planned=ui.ensureAdaptiveItem(deps,s3,generated);
assert.ok(planned.plan.chosenStrategyId);
assert.strictEqual(planned.problem.source,'math_gym');
assert.strictEqual(s3.current.mathGymHadWrong,false);

console.log('PASS Math Gym feeds canonical runtime with first-try-only route-fluency evidence');
