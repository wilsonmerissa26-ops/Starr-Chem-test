'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE RUNTIME ENTRY

   Keep the generic Student Model file unchanged. Install only the explicit
   math-specific same-original-problem remediation resolver, then load the
   pure runtime implementation. The runtime core still operates on the same
   cached Student Model object and therefore the same learner-state truth.

   Controllers must consume this canonical entry rather than importing the
   internal runtime core directly. Entry-boundary guards run here before any
   lower-level Student Model mutation can occur.
   ============================================================ */

var studentModel = require('./student-model-idk-router.js');
var mathPolicy = require('./math-student-model-policy.js');
var core = require('./day1-adaptive-runtime-core.js');

studentModel.resolveRemediationAtCurrentItem = mathPolicy.resolveRemediationAtCurrentItem;

function openPrerequisiteRepair(state, prerequisiteSkillId, reason){
  var cur=state&&state.current;
  if(cur){
    var owner=state.skills&&state.skills[cur.parentSkillId];
    if(cur.activePrerequisiteSkillId || (owner&&owner.remediation&&owner.remediation.active)){
      return{
        action:'remediation_already_active',
        from:cur.session&&cur.session.activeSkillId||cur.parentSkillId,
        skillId:prerequisiteSkillId,
        activePrerequisiteSkillId:cur.activePrerequisiteSkillId ||
          (owner&&owner.remediation&&owner.remediation.requiredSkillId) || null
      };
    }
  }
  return core.openPrerequisiteRepair(state,prerequisiteSkillId,reason);
}

module.exports=Object.assign({},core,{openPrerequisiteRepair:openPrerequisiteRepair});
