/* ============================================================
   PHASE 2A ROUTE-EVIDENCE AUDIT INTEGRITY CONTRACT

   Whole-problem input belongs to the parent attempt. Smaller route skills may
   receive verified fluency evidence, but their attempt input must describe the
   observed smaller-skill action itself. If no child-step input was observed,
   store null rather than copying the final whole-problem answer into it.
   ============================================================ */
'use strict';
var assert=require('assert');
var runtime=require('./day1-adaptive-runtime.js');

function start(id){
  var state=runtime.createLearnerState({studentId:id});
  runtime.startProblem(state,{
    area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,
    source:'test',sourceId:id+'-pct'
  });
  return state;
}
function lastAttempt(state,id){
  var skill=state.skills[id];
  return skill&&skill.attempts[skill.attempts.length-1];
}

var noChildInput=start('route-audit-null');
var r1=runtime.recordCurrentAnswer(noChildInput,true,'12',{
  assisted:false,routeVerified:true,evidenceSkillIds:['divide_by_10','halving']
});
assert.deepStrictEqual(r1.routeFluencySkillIds.sort(),['divide_by_10','halving'].sort());
assert.strictEqual(lastAttempt(noChildInput,'percent_of_whole').input,'12','parent attempt must retain the whole-problem input');
assert.strictEqual(lastAttempt(noChildInput,'divide_by_10').input,null,'child skill must not inherit the whole-problem answer');
assert.strictEqual(lastAttempt(noChildInput,'halving').input,null,'child skill must not inherit the whole-problem answer');

var explicitChildInput=start('route-audit-explicit');
var r2=runtime.recordCurrentAnswer(explicitChildInput,true,'12',{
  assisted:false,
  routeVerified:true,
  evidenceSkillIds:['divide_by_10','halving'],
  evidenceInputsBySkill:{divide_by_10:'8',halving:'4'}
});
assert.deepStrictEqual(r2.routeFluencySkillIds.sort(),['divide_by_10','halving'].sort());
assert.strictEqual(lastAttempt(explicitChildInput,'percent_of_whole').input,'12','parent input must remain separate from child observations');
assert.strictEqual(lastAttempt(explicitChildInput,'divide_by_10').input,'8','explicit divide-by-10 observation should be stored on that child skill');
assert.strictEqual(lastAttempt(explicitChildInput,'halving').input,'4','explicit halving observation should be stored on that child skill');

console.log('PASS Phase 2A route-evidence audit trail keeps parent and child inputs semantically separate');
