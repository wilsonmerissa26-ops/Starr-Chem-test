'use strict';

/* ============================================================
   HUMAN-DOABLE NEGATIVE LOG ESTIMATE PLANNER

   This planner never asks the learner to "estimate log(a)" and then inserts
   Math.log10(a) behind the scenes. It must have a small explicit landmark path
   that is visible in the teaching steps. The classroom 6×10^-6 item carries
   log(2)≈0.30 and log(3)≈0.48 from the preceding taught landmark problem.
   ============================================================ */

var cost=require('./math-strategy-cost.js');

function near(a,b){return Math.abs(Number(a)-Number(b))<=1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function roundTo(v,places){var scale=Math.pow(10,places);return Math.round((Number(v)+Number.EPSILON)*scale)/scale;}
function step(id,prompt,expected,skills,hint){return{id:id,prompt:prompt,expected:expected,prerequisiteSkillIds:skills||[],hint:hint||''};}

function routeData(problem){
  var front=Number(problem.front),exponent=Number(problem.exponent);
  if(!Number.isFinite(front)||front<=0||!Number.isFinite(exponent))throw new Error('invalid negative-log estimate');
  var landmarks=problem.landmarks||{},factors=Array.isArray(problem.factors)?problem.factors.map(Number):[];
  var estimateLog,buildPrompt,buildExpected,buildSkills=['log_landmarks','estimation'];

  if(factors.length){
    var product=factors.reduce(function(a,b){return a*b;},1);
    if(!near(product,front))throw new Error('negative-log landmark factors must multiply to the front coefficient');
    var values=factors.map(function(f){
      var v=Number(landmarks[String(f)]);
      if(!Number.isFinite(v))throw new Error('missing finite negative-log landmark for '+f);
      return v;
    });
    estimateLog=values.reduce(function(a,b){return a+b;},0);
    buildPrompt='Build log('+front+'): '+front+' = '+factors.join(' × ')+', so log('+front+') ≈ '+values.join(' + ')+' = '+estimateLog+'.';
    buildExpected=estimateLog;
    buildSkills=['log_product_rule','log_landmarks','basic_addition','estimation'];
  }else{
    estimateLog=Number(landmarks[String(front)]);
    if(!Number.isFinite(estimateLog))throw new Error('negative-log estimate requires an explicit human-usable landmark route');
    buildPrompt='Use the supplied landmark log('+front+') ≈ '+estimateLog+'.';
    buildExpected=estimateLog;
  }

  var raw=exponent-estimateLog;
  var places=problem.roundTo==null?null:Number(problem.roundTo);
  if(places!==null&&(!Number.isInteger(places)||places<0||places>6))throw new Error('roundTo must be an integer from 0 to 6');
  var answer=places===null?raw:roundTo(raw,places);
  return{front:front,exponent:exponent,estimateLog:estimateLog,raw:raw,roundTo:places,answer:answer,buildPrompt:buildPrompt,buildExpected:buildExpected,buildSkills:buildSkills};
}

function plan(problem,options){
  var r=routeData(problem),steps=[
    step('structure','Rewrite −log('+r.front+'×10^−'+r.exponent+') as '+r.exponent+' − log('+r.front+').',null,['log_inverse_relationship','signed_arithmetic'],'The power-of-ten exponent gives the main size; the front number is the correction.'),
    step('landmark_build',r.buildPrompt,r.buildExpected,r.buildSkills,'Use only the landmark values supplied by the lesson.'),
    step('subtract','Compute '+r.exponent+' − '+r.estimateLog+' = '+r.raw+'.',r.raw,['basic_subtraction','estimation'],'Subtract the landmark correction from the power-of-ten exponent.')
  ];
  if(r.roundTo!==null){
    steps.push(step('round','Round '+r.raw+' to '+r.roundTo+' decimal place'+(r.roundTo===1?'':'s')+'.',r.answer,['estimation'],'Round only after the estimate is built.'));
  }
  var candidate={
    strategyId:'log_landmark_estimate',
    answer:r.answer,
    valid:true,
    concept:'For −log(a×10^−n), use n − log(a). Build log(a) only from explicit known landmarks; do not invent calculator precision.',
    mentalRoute:'rewrite → build log(a) from landmarks → subtract → round',
    hint:'Start with the power-of-ten exponent, then build the front-number correction from the landmarks you were given.',
    steps:steps,
    features:{operationCount:steps.length,mentalLoad:1,benchmarkBonus:0.7}
  };
  var scored=cost.scoreCandidate(candidate,options||{}),chosen=Object.assign({},candidate,{cost:scored.total,costBreakdown:scored.breakdown});
  return{
    problem:JSON.parse(JSON.stringify(problem)),
    answer:r.answer,
    candidates:[chosen],
    chosenStrategyId:chosen.strategyId,
    chosenPlan:{concept:chosen.concept,mentalRoute:chosen.mentalRoute,hint:chosen.hint,firstStep:steps[0],steps:steps},
    nearTies:[]
  };
}

module.exports={plan:plan,routeData:routeData};
