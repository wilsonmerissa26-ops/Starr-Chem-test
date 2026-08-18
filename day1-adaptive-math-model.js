'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   The migrated model policy remains intact in its base module. This entry adds
   reviewed scope guards, specialized planners, and learner-facing copy
   corrections without silently expanding Day 1 into calculator-only work.
   ============================================================ */

var base=require('./day1-adaptive-math-model-policy.js');
var negativeLog=require('./log-negative-estimate-planner.js');
var teachingCopy=require('./teaching-plan-copy-policy.js');

function closeToInteger(v){
  var n=Number(v),nearest=Math.round(n);
  return Number.isFinite(n)&&Math.abs(n-nearest)<=1e-10;
}

function validateProblem(problem){
  var validated=base.validateProblem(problem);
  if(validated.area==='logs'&&validated.family==='exact_log10'){
    var exponent=Math.log10(Number(validated.value));
    if(!closeToInteger(exponent)){
      throw new Error('exact log value must be an integer power of ten; use an explicit estimation route for other values');
    }
  }
  if(validated.area==='logs'&&validated.family==='inverse_log10'){
    if(!Number.isInteger(Number(validated.exponent))){
      throw new Error('Day 1 inverse exact log requires an integer exponent');
    }
  }
  return validated;
}

function planProblem(problem,options){
  var validated=validateProblem(problem),planned;
  if(validated.area==='logs'&&validated.family==='estimate_negative_log'){
    planned=negativeLog.plan(validated,options||{});
  }else{
    planned=base.planProblem(validated,options);
  }
  return teachingCopy.apply(validated,planned);
}

module.exports=Object.assign({},base,{validateProblem:validateProblem,planProblem:planProblem});
