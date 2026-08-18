'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   The migrated model policy remains intact in its base module. This entry adds
   only reviewed specialized planners whose learner-facing route must differ
   from the original migrated implementation. Negative-log estimation is the
   first such case: it requires explicit human-usable landmarks and never
   substitutes Math.log10 precision for an estimation step.
   ============================================================ */

var base=require('./day1-adaptive-math-model-policy.js');
var negativeLog=require('./log-negative-estimate-planner.js');

function planProblem(problem,options){
  var validated=base.validateProblem(problem);
  if(validated.area==='logs'&&validated.family==='estimate_negative_log'){
    return negativeLog.plan(validated,options||{});
  }
  return base.planProblem(validated,options);
}

module.exports=Object.assign({},base,{planProblem:planProblem});
