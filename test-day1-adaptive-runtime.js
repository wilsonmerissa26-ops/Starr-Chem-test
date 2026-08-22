/* ============================================================
   DAY 1 ADAPTIVE LEARNER RUNTIME CONTRACT

   Integration layer contract before browser wiring. Generic Student Model
   behavior remains intact; the math runtime composes a same-original-problem
   policy without replacing the generic fresh-item remediation exit.
   ============================================================ */
'use strict';
var assert=require('assert');
var sm=require('./student-model-idk-router.js');

// Before the math runtime composes its policy, the generic Student Model keeps
// the original fresh-item exit and has no math-specific resolver on its API.
assert.strictEqual(typeof sm.resolveRemediationAtCurrentItem,'undefined','generic Student Model file must not own math-specific exit policy');
var genericSkill=sm.createSkill('generic-test');
sm.handleIdk(genericSkill,sm.IDK_REASONS.DONT_UNDERSTAND,'generic-old','small-skill',1000);
sm.recordRemediationCheck(genericSkill,true,'generic-check',1100);
var genericExit=sm.exitRemediation(genericSkill,[{id:'generic-old'},{id:'generic-fresh'}]);
assert.strictEqual(genericExit.allowed,true);
assert.strictEqual(genericExit.nextItem.id,'generic-fresh','generic Student Model must retain fresh-item remediation behavior');

var runtime=require('./day1-adaptive-runtime.js');
assert.strictEqual(typeof sm.resolveRemediationAtCurrentItem,'function','math runtime composition must install explicit same-item resolver on the shared Student Model object');

var state=runtime.createLearnerState({studentId:'test-student'});
var problem={area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'classroom',sourceId:'pct-15-80'};
var started=runtime.startProblem(state,problem);
assert.strictEqual(started.plan.chosenStrategyId,'percent_10_plus_5');
assert.strictEqual(state.current.problem.sourceId,'pct-15-80');
assert.ok(state.skills.percent_of_whole,'parent skill should live in Student Model state');

// Support uses one plan, records assistance, and keeps Help me understand
// separate from the optional mental route.
var h=runtime.requestSupport(state,'hint');
var u=runtime.requestSupport(state,'understand');
var f=runtime.requestSupport(state,'first_step');
var w=runtime.requestSupport(state,'walkthrough');
var m=runtime.requestSupport(state,'mental');
[h,u,f,w,m].forEach(function(x){assert.strictEqual(x.strategyId,started.plan.chosenStrategyId);});
assert.strictEqual(f.steps.length,1);
assert.strictEqual(u.steps.length,0);
assert.strictEqual(u.hint,'','understand must not reuse mental-route text');
assert.ok(m.hint,'mental route should remain separately available');
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

// Fluency map is derived from Student Model evidence, never invented by a renderer.
var halfSkill=runtime.ensureSkill(restored,'halving');
sm.recordAttempt(halfSkill,'half-evidence',true,null,Date.now(),7);
var fm=runtime.studentFluency(restored);
assert.ok(Object.prototype.hasOwnProperty.call(fm,'halving'));
assert.ok(fm.halving>0,'correct targeted evidence should produce positive bounded fluency');
assert.ok(fm.halving<=1 && fm.halving>=-1);

// A final answer alone is parent-skill evidence. It does NOT prove the learner
// used the engine's chosen route or performed every prerequisite named in that
// route, so smaller route skills must not be inferred automatically.
var unaided=runtime.createLearnerState({studentId:'unaided'});
runtime.startProblem(unaided,{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'unaided-pct'});
var unaidedResult=runtime.recordCurrentAnswer(unaided,true,'12',{assisted:false});
assert.deepStrictEqual(unaidedResult.routeFluencySkillIds,[],'final-answer correctness alone must not infer prerequisite fluency');
assert.ok(unaided.skills.percent_of_whole.attempts.length>0,'the correct final answer must still remain parent-skill evidence');
assert.strictEqual(unaided.skills.halving,undefined,'unobserved route skill must not be created from inference');

// When route execution is explicitly verified, only the exact verified subset
// of skills may receive positive route-level evidence. Unknown/unverified ids
// must be ignored rather than silently entering the Student Model.
var verified=runtime.createLearnerState({studentId:'verified-route'});
runtime.startProblem(verified,{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'verified-pct'});
var potential=runtime.routeSkillIds(verified.current.plan);
assert.ok(potential.indexOf('divide_by_10')>=0&&potential.indexOf('halving')>=0&&potential.indexOf('add_friendly_chunks')>=0,'selected 15% route should expose its potential smaller skills');
var verifiedResult=runtime.recordCurrentAnswer(verified,true,'12',{
  assisted:false,
  routeVerified:true,
  evidenceSkillIds:['divide_by_10','halving','not_in_this_route']
});
assert.deepStrictEqual(verifiedResult.routeFluencySkillIds.sort(),['divide_by_10','halving'].sort(),'only explicitly verified skills that belong to the selected route may be credited');
assert.ok(verified.skills.divide_by_10&&verified.skills.halving,'verified route skills should receive evidence');
assert.strictEqual(verified.skills.add_friendly_chunks,undefined,'route skill not explicitly verified must not be inferred');
assert.strictEqual(verified.skills.not_in_this_route,undefined,'arbitrary evidence ids must not enter the Student Model');

// A routeVerified flag without exact observed skill ids is intentionally not
// enough. The integration layer must say what it actually observed.
var vague=runtime.createLearnerState({studentId:'vague-route'});
runtime.startProblem(vague,{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'vague-pct'});
var vagueResult=runtime.recordCurrentAnswer(vague,true,'12',{assisted:false,routeVerified:true});
assert.deepStrictEqual(vagueResult.routeFluencySkillIds,[],'routeVerified without explicit observed skill ids must not award blanket route fluency');

// Support blocks route fluency even if a later controller claims route steps
// were observed; supported performance is not unaided fluency evidence.
var assisted=runtime.createLearnerState({studentId:'assisted'});
runtime.startProblem(assisted,{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'assisted-pct'});
runtime.requestSupport(assisted,'hint');
var assistedResult=runtime.recordCurrentAnswer(assisted,true,'12',{
  assisted:false,
  routeVerified:true,
  evidenceSkillIds:['divide_by_10','halving']
});
assert.deepStrictEqual(assistedResult.routeFluencySkillIds,[],'supported work must not be credited as unaided route fluency');

console.log('PASS Day 1 adaptive learner runtime, policy-boundary, and evidence contract');
