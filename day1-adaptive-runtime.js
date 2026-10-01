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

function submitPrerequisiteCheck(state,itemId,input){
  var result=core.submitPrerequisiteCheck(state,itemId,input);
  if(result && result.action==='return_to_parent_prerequisite' && !result.nextCheckItem){
    return Object.assign({},result,{
      action:'prerequisite_bank_exhausted',
      nextCheckItem:null
    });
  }
  return result;
}

function recordCurrentAnswer(state,correct,input,opts){
  opts=opts||{};
  var result=core.recordCurrentAnswer(state,correct,input,opts);
  var ids=result&&Array.isArray(result.routeFluencySkillIds)?result.routeFluencySkillIds:[];
  var inputs=opts.evidenceInputsBySkill&&typeof opts.evidenceInputsBySkill==='object'?
    opts.evidenceInputsBySkill:{};

  ids.forEach(function(id){
    var skill=state&&state.skills&&state.skills[id];
    if(!skill||!skill.attempts||!skill.attempts.length)return;
    var attempt=skill.attempts[skill.attempts.length-1];
    var expectedMarker='::verified-route::'+id;
    if(String(attempt.itemId||'').indexOf(expectedMarker)<0)return;
    attempt.input=Object.prototype.hasOwnProperty.call(inputs,id)?inputs[id]:null;
  });
  return result;
}

module.exports=Object.assign({},core,{
  openPrerequisiteRepair:openPrerequisiteRepair,
  submitPrerequisiteCheck:submitPrerequisiteCheck,
  recordCurrentAnswer:recordCurrentAnswer
});
