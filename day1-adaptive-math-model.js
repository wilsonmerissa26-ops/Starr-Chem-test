'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   The migrated model policy remains intact in its base module. This entry adds
   reviewed specialized planners and learner-facing copy corrections without
   changing answers, costs, prerequisite metadata, or route selection.
   ============================================================ */

var base=require('./day1-adaptive-math-model-policy.js');
var negativeLog=require('./log-negative-estimate-planner.js');
var teachingCopy=require('./teaching-plan-copy-policy.js');

function planProblem(problem,options){
  var validated=base.validateProblem(problem),planned;
  if(validated.area==='logs'&&validated.family==='estimate_negative_log'){
    planned=negativeLog.plan(validated,options||{});
  }else{
    planned=base.planProblem(validated,options);
  }
  return teachingCopy.apply(validated,planned);
}

module.exports=Object.assign({},base,{planProblem:planProblem});
