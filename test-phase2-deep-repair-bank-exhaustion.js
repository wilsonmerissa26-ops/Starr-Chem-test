/* ============================================================
   PHASE 2A DEEP-REPAIR PARENT BANK EXHAUSTION CONTRACT

   A deeper prerequisite may be repaired after the parent prerequisite's
   three fresh checks have all been consumed. Returning from the child must
   never claim a normal parent retry with nextCheckItem:null. Exhaustion is
   explicit and the remediation gate remains open for a higher-level decision.
   ============================================================ */
'use strict';
var assert=require('assert');
var sm=require('./student-model-idk-router.js');
var runtime=require('./day1-adaptive-runtime.js');

var state=runtime.createLearnerState({studentId:'deep-bank-test'});
runtime.startProblem(state,{
  area:'fractions_percent',family:'percent_of_whole',percent:25,whole:68,
  source:'test',sourceId:'pct-25-68-deep-bank'
});

var opened=runtime.openPrerequisiteRepair(state,'quartering',sm.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(opened.action,'teach_prerequisite');
assert.strictEqual(opened.checkItem.id,'quarter-1');

var q1=runtime.submitPrerequisiteCheck(state,opened.checkItem.id,'wrong');
assert.strictEqual(q1.correct,false);
assert.strictEqual(q1.action,'retry_prerequisite');
assert.strictEqual(q1.nextCheckItem.id,'quarter-2');

var q2=runtime.submitPrerequisiteCheck(state,q1.nextCheckItem.id,'wrong');
assert.strictEqual(q2.correct,false);
assert.strictEqual(q2.action,'teach_deeper_prerequisite');
assert.strictEqual(q2.skillId,'halving');
assert.strictEqual(q2.nextCheckItem.id,'half-1');

var h1=runtime.submitPrerequisiteCheck(state,q2.nextCheckItem.id,q2.nextCheckItem.answer);
assert.strictEqual(h1.correct,true);
assert.strictEqual(h1.action,'return_to_parent_prerequisite');
assert.strictEqual(h1.skillId,'quartering');
assert.ok(h1.nextCheckItem,'first child repair must still find the third fresh parent check');
assert.strictEqual(h1.nextCheckItem.id,'quarter-3');

var q3=runtime.submitPrerequisiteCheck(state,h1.nextCheckItem.id,'wrong');
assert.strictEqual(q3.correct,false);
assert.strictEqual(q3.action,'teach_deeper_prerequisite');
assert.strictEqual(q3.skillId,'halving');
assert.ok(q3.nextCheckItem,'second halving descent must use a fresh child check');

var h2=runtime.submitPrerequisiteCheck(state,q3.nextCheckItem.id,q3.nextCheckItem.answer);
assert.strictEqual(h2.correct,true);
assert.strictEqual(h2.action,'prerequisite_bank_exhausted','returning to an exhausted parent bank must be explicit');
assert.strictEqual(h2.skillId,'quartering');
assert.strictEqual(h2.nextCheckItem,null);
assert.strictEqual(state.current.activePrerequisiteSkillId,'quartering','parent remediation must remain the active unresolved skill');
assert.strictEqual(state.skills.percent_of_whole.remediation.active,true,'owner remediation gate must stay open on bank exhaustion');
assert.strictEqual(state.current.problem.sourceId,'pct-25-68-deep-bank','original problem must remain preserved during exhaustion');

console.log('PASS Phase 2A deep repair returns explicit parent-bank exhaustion without stranding state');
