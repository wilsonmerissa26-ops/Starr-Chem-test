'use strict';

/* ============================================================
   CANONICAL DAY 1 ADAPTIVE MATH MODEL ENTRY

   The migrated model policy remains intact in its base module. This entry adds
   reviewed scope guards, specialized planners, route-efficiency corrections,
   and learner-facing copy corrections without silently expanding Day 1 into
   calculator-only or no-op work.
   ============================================================ */

var base=require('./day1-adaptive-math-model-policy.js');
var negativeLog=require('./log-negative-estimate-planner.js');
var routeEfficiency=require('./route-efficiency-policy.js');
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

function assertRepresentableAnswer(problem,answer,label){
  label=label||'planner answer';
  if(typeof answer==='number'){
    if(!Number.isFinite(answer))throw new Error(label+' is not a finite representable number');
    if(problem.area==='logs'&&problem.family==='inverse_log10'&&answer===0){
      throw new Error(label+' underflowed to zero and is not representable for inverse_log10');
    }
    return;
  }
  if(typeof answer==='string'){
    if(/(?:^|[^A-Za-z])(Infinity|NaN)(?:$|[^A-Za-z])/i.test(answer)){
      throw new Error(label+' contains an unsafe non-representable value');
    }
    return;
  }
  if(answer&&typeof answer==='object'&&!Array.isArray(answer)){
    if(Object.prototype.hasOwnProperty.call(answer,'coefficient')||Object.prototype.hasOwnProperty.call(answer,'exponent')){
      if(!Number.isFinite(Number(answer.coefficient))||!Number.isFinite(Number(answer.exponent))||!Number.isInteger(Number(answer.exponent))){
        throw new Error(label+' contains a non-finite or non-integer scientific-notation component');
      }
    }
    return;
  }
  throw new Error(label+' has an unsupported non-representable shape');
}

function assertRepresentablePlan(problem,planned){
  if(!planned||typeof planned!=='object')throw new Error('planner returned no representable plan');
  assertRepresentableAnswer(problem,planned.answer,'planner answer');
  (planned.candidates||[]).forEach(function(candidate){
    assertRepresentableAnswer(problem,candidate.answer,'candidate '+candidate.strategyId+' answer');
    if(!Number.isFinite(Number(candidate.cost))){
      throw new Error('candidate '+candidate.strategyId+' cost is not finite');
    }
  });
  return planned;
}

function planProblem(problem,options){
  var validated=validateProblem(problem),planned;
  if(validated.area==='logs'&&validated.family==='estimate_negative_log'){
    planned=negativeLog.plan(validated,options||{});
  }else{
    planned=base.planProblem(validated,options);
  }
  planned=routeEfficiency.apply(validated,planned,options||{});
  planned=assertRepresentablePlan(validated,planned);
  return teachingCopy.apply(validated,planned);
}

module.exports=Object.assign({},base,{
  validateProblem:validateProblem,
  planProblem:planProblem,
  assertRepresentableAnswer:assertRepresentableAnswer,
  assertRepresentablePlan:assertRepresentablePlan
});
