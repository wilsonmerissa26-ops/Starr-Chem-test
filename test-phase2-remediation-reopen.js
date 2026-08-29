/* ============================================================
   PHASE 2A ACTIVE REMEDIATION REOPEN CONTRACT

   A controller must not be able to open the same prerequisite repair twice.
   The second request must fail before handleIdk can reset remediation state,
   regress scaffolding again, push another return frame, or emit an event.
   ============================================================ */
'use strict';
var assert=require('assert');
var sm=require('./student-model-idk-router.js');
var runtime=require('./day1-adaptive-runtime.js');

var state=runtime.createLearnerState({studentId:'duplicate-repair-test'});
runtime.startProblem(state,{
  area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,
  source:'test',sourceId:'duplicate-repair-pct'
});

var first=runtime.openPrerequisiteRepair(state,'halving',sm.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(first.action,'teach_prerequisite');

var owner=state.skills.percent_of_whole;
var before={
  remediation:JSON.stringify(owner.remediation),
  scaffoldLevel:owner.scaffoldLevel,
  returnStack:JSON.stringify(state.current.session.returnStack),
  activePath:JSON.stringify(state.current.session.activePath),
  events:JSON.stringify(state.events)
};

var second=runtime.openPrerequisiteRepair(state,'halving',sm.IDK_REASONS.DONT_UNDERSTAND);
assert.strictEqual(second.action,'remediation_already_active','active repair must not reopen');
assert.strictEqual(JSON.stringify(owner.remediation),before.remediation,'duplicate open must not reset remediation metadata');
assert.strictEqual(owner.scaffoldLevel,before.scaffoldLevel,'duplicate open must not regress scaffold again');
assert.strictEqual(JSON.stringify(state.current.session.returnStack),before.returnStack,'duplicate open must not push another return frame');
assert.strictEqual(JSON.stringify(state.current.session.activePath),before.activePath,'duplicate open must not alter active prerequisite path');
assert.strictEqual(JSON.stringify(state.events),before.events,'duplicate open must not emit a fake remediation event');

console.log('PASS Phase 2A active remediation cannot be reopened or mutate state');
