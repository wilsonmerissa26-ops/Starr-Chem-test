'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE RUNTIME ENTRY

   Keep the generic Student Model file unchanged. Install only the explicit
   math-specific same-original-problem remediation resolver, then load the
   pure runtime implementation. The runtime core still operates on the same
   cached Student Model object and therefore the same learner-state truth.
   ============================================================ */

var studentModel = require('./student-model-idk-router.js');
var mathPolicy = require('./math-student-model-policy.js');

studentModel.resolveRemediationAtCurrentItem = mathPolicy.resolveRemediationAtCurrentItem;

module.exports = require('./day1-adaptive-runtime-core.js');
