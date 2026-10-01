'use strict';

/* ============================================================
   CANONICAL DAY 1 PROBLEM SOURCE ADAPTER ENTRY

   Preserve the migrated source adapters as a base module and add only source
   information that the learner-facing problem genuinely provides. In
   particular, the negative-log classroom item inherits the log(2)/log(3)
   landmarks taught immediately before it instead of forcing a calculator-only
   Math.log10(6) step.
   ============================================================ */

var base=require('./day1-problem-source-adapters-core.js');

function copyEstimateFields(problem,input){
  if(!problem||problem.family!=='estimate_negative_log')return problem;
  input=input||{};
  if(Array.isArray(input.factors))problem.factors=input.factors.slice();
  if(input.landmarks&&typeof input.landmarks==='object')problem.landmarks=Object.assign({},input.landmarks);
  if(input.roundTo!=null)problem.roundTo=Number(input.roundTo);
  return problem;
}

function fromClassroomPrompt(area,prompt,metadata){
  var p=base.fromClassroomPrompt(area,prompt,metadata);
  if(p.family==='estimate_negative_log'){
    // The current classroom sequence has just taught log(2)≈0.30 and
    // log(3)≈0.48 in the preceding log(6) item. Carry those taught landmarks
    // into this estimate instead of silently using calculator precision.
    p.factors=[2,3];
    p.landmarks={'2':0.30,'3':0.48};
    p.roundTo=1;
  }
  return p;
}

function fromStructured(input,metadata){
  return copyEstimateFields(base.fromStructured(input,metadata),input);
}

function fromMathGymItem(item){
  if(!item||!item.strategyInput)throw new Error('Math Gym item must expose structured strategyInput');
  return fromStructured(item.strategyInput,{source:'math_gym',sourceId:item.id||null});
}

module.exports=Object.assign({},base,{
  fromClassroomPrompt:fromClassroomPrompt,
  fromStructured:fromStructured,
  fromMathGymItem:fromMathGymItem
});
