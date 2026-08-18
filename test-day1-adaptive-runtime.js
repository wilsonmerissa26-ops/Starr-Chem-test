/* ============================================================
   DAY 1 ADAPTIVE LEARNER RUNTIME CONTRACT

   Integration layer contract before browser wiring. Student Model remains
   learner-state truth; adaptive model owns math planning; prerequisite content
   owns teaching/checks. Math remediation returns to the exact original problem.
   ============================================================ */
'use strict';
var assert=require('assert');
var sm=require('./student-model-idk-router.js');
var runtime=require('./day1-adaptive-runtime.js');

assert.strictEqual(typeof sm.resolveRemediationAtCurrentItem,'function','Student Model needs explicit same-item math remediation resolver');

var state=runtime.createLearnerState({studentId:'test-student'});
var problem={area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'classroom',sourceId:'pct-15-80'};
var started=runtime.startProblem(state,problem);
assert.strictEqual(started.plan.chosenStrategyId,'percent_10_plus_5');
assert.strictEqual(state.current.problem.sourceId,'pct-15-80');
assert.ok(state.skills.percent_of_whole,'parent skill should live in Student Model state');

// Support uses one plan and is recorded as support, not mastery evidence.
var h=runtime.requestSupport(state,'hint');
var u=runtime.requestSupport(state,'understand');
var f=runtime.requestSupport(state,'first_step');
var w=runtime.requestSupport(state,'walkthrough');
[h,u,f,w].forEach(function(x){assert.strictEqual(x.strategyId,started.plan.chosenStrategyId);});
assert.strictEqual(f.steps.length,1);
assert.ok(state.current.supportUsed,'support should be remembered on the item');

// Explicit prerequisite repair descends, teaches, checks, and returns SAME problem.
var opened=runtime.openPrerequisiteRepair(state,'halving',sm.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(opened.action,'teach_prerequisite');
assert.strictEqual(state.current.session.activeSkillId,'halving');
assert.ok(opened.lesson && opened.lesson.skillId==='halving');
var check=opened.checkItem;
assert.ok(check && check.check(check.answer));
var fixed=runtime.submitPrerequisiteCheck(state,check.id,check.answer);
assert.strictEqual(fixed.correct,true);
assert.strictEqual(fixed.action,'return_to_parent_problem');
assert.strictEqual(fixed.problem.sourceId,'pct-15-80','must return to exact original math problem');
assert.strictEqual(state.current.problem.sourceId,'pct-15-80');
assert.strictEqual(state.skills.percent_of_whole.remediation.active,false,'Student Model gate must close too');

// A wrong prerequisite attempt stays in remediation and gets fresh check content.
var problem2={area:'fractions_percent',family:'percent_of_whole',percent:25,whole:68,source:'classroom',sourceId:'pct-25-68'};
runtime.startProblem(state,problem2);
var repair2=runtime.openPrerequisiteRepair(state,'quartering',sm.IDK_REASONS.DONT_UNDERSTAND);
var wrong=runtime.submitPrerequisiteCheck(state,repair2.checkItem.id,'definitely wrong');
assert.strictEqual(wrong.correct,false);
assert.ok(state.skills.percent_of_whole.remediation.active);
assert.ok(wrong.nextCheckItem===null || wrong.nextCheckItem.id!==repair2.checkItem.id,'retry must not silently repeat identical prerequisite item');

// Two prerequisite failures can descend farther without looping forever.
if(wrong.nextCheckItem){
  var wrong2=runtime.submitPrerequisiteCheck(state,wrong.nextCheckItem.id,'wrong again');
  assert.strictEqual(wrong2.correct,false);
  assert.ok(['teach_deeper_prerequisite','switch_representation','prerequisite_bank_exhausted'].indexOf(wrong2.action)>=0);
}

// Learner-state JSON survives and still plans afterward.
var restored=runtime.restoreLearnerState(JSON.parse(JSON.stringify(state)));
assert.strictEqual(restored.studentId,'test-student');
assert.ok(restored.skills.percent_of_whole);
var p3=runtime.startProblem(restored,{area:'unit_conversions',family:'single_conversion',value:2.4,from:'g',to:'mg',factor:1000,source:'test',sourceId:'unit-1'});
assert.ok(p3.plan.chosenStrategyId);

// Fluency map is derived from Student Model evidence, never invented by the renderer.
var halfSkill=runtime.ensureSkill(restored,'halving');
sm.recordAttempt(halfSkill,'half-evidence',true,null,Date.now(),7);
var fm=runtime.studentFluency(restored);
assert.ok(Object.prototype.hasOwnProperty.call(fm,'halving'));
assert.ok(fm.halving>0,'correct evidence should produce positive bounded fluency');
assert.ok(fm.halving<=1 && fm.halving>=-1);

console.log('PASS Day 1 adaptive learner runtime contract');
