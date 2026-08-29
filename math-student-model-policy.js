'use strict';

/* ============================================================
   MATH-SPECIFIC STUDENT MODEL POLICY

   The generic Student Model keeps its existing fresh-item remediation exit.
   Day 1 math has a newer contract: repair the missing prerequisite, then
   return to the exact original math problem. This wrapper preserves the
   generic API and adds only that math-specific resolution policy.
   ============================================================ */

var base = require('./student-model-idk-router.js');

function resolveRemediationAtCurrentItem(skill, currentItemId) {
  if (!base.isRemediationActive(skill)) {
    return { allowed:false, returnItemId:null, reason:'no_active_remediation' };
  }
  if (!skill.remediation.prerequisiteCheckPassed) {
    return { allowed:false, returnItemId:null, reason:'prerequisite_not_yet_passed' };
  }
  var expected = skill.remediation.originatingItemId;
  if (!currentItemId || currentItemId !== expected) {
    return { allowed:false, returnItemId:null, reason:'originating_item_mismatch' };
  }
  skill.remediation.returnItemId = expected;
  skill.remediation.active = false;
  return { allowed:true, returnItemId:expected, reason:null };
}

module.exports = Object.assign({}, base, {
  resolveRemediationAtCurrentItem: resolveRemediationAtCurrentItem
});
