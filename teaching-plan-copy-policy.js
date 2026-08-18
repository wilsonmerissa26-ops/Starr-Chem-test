'use strict';

/* ============================================================
   PHASE 2A LEARNER-FACING TEACHING COPY POLICY

   This module changes wording only. It must not change answers, costs,
   strategy IDs, prerequisite metadata, or route selection.
   ============================================================ */

function clone(v){return JSON.parse(JSON.stringify(v));}

function oppositeMove(coefficient){
  coefficient=Number(coefficient);
  if(coefficient<0)return 'Add '+Math.abs(coefficient)+'x to both sides.';
  if(coefficient>0)return 'Subtract '+coefficient+'x from both sides.';
  return 'The x-term is already zero; no variable-term move is needed.';
}

function isScientificOperation(problem){
  return problem.area==='scientific_notation'&&
    (problem.family==='multiply_scientific'||problem.family==='divide_scientific');
}

function fixSteps(problem,strategyId,steps){
  (steps||[]).forEach(function(st){
    if(problem.area==='algebra'&&problem.family==='two_sided_linear'&&st.id==='variables'){
      var moved=strategyId==='algebra_keep_positive_right'?problem.a:problem.c;
      st.prompt=oppositeMove(moved);
      st.hint='Use the opposite operation on both sides so the remaining x coefficient stays positive.';
    }

    if(problem.area==='exponents'&&problem.family==='negative_exponent'&&st.id==='reciprocal'){
      var magnitude=Math.abs(Number(problem.exponent));
      st.prompt='Rewrite as a reciprocal: '+problem.base+'^-'+magnitude+' = 1/'+problem.base+'^'+magnitude+'.';
      st.hint='A negative exponent means take the reciprocal, then use the positive exponent.';
    }

    if(problem.area==='scientific_notation'&&problem.family==='convert_to_scientific'&&st.id==='coefficient'){
      st.prompt="Move the decimal until the coefficient's absolute value is at least 1 and less than 10.";
      st.hint='Use 1 ≤ |coefficient| < 10. The coefficient may be negative.';
    }

    if(isScientificOperation(problem)&&st.id==='normalize'){
      st.prompt="Normalize if needed: preserve the sign and make the coefficient's absolute value at least 1 and less than 10.";
      st.hint="Use 1 ≤ |coefficient| < 10. Keep the coefficient's sign while shifting the decimal and compensating in the exponent.";
    }
  });
}

function fixCopy(problem,strategyId,copy){
  if(!copy)return;
  if(problem.area==='exponents'&&problem.family==='negative_exponent'){
    copy.concept='A negative exponent means reciprocal: rewrite the factor with a positive exponent in the denominator, then evaluate.';
    copy.mentalRoute='negative exponent → rewrite reciprocal → evaluate positive power';
    copy.hint='Rewrite the current power as 1 divided by the same base with a positive exponent.';
  }
  if(problem.area==='scientific_notation'&&problem.family==='convert_to_scientific'){
    copy.mentalRoute='make 1 ≤ |coefficient| < 10 → count shifts → choose exponent sign';
    copy.hint="First make the coefficient's absolute value at least 1 and less than 10.";
  }
  if(isScientificOperation(problem)){
    copy.concept=(problem.family==='multiply_scientific'?'Multiply coefficients and add exponents. ':'Divide coefficients and subtract exponents. ')+
      "Then normalize so the coefficient's absolute value is at least 1 and less than 10 while preserving its sign.";
    copy.mentalRoute=(problem.family==='multiply_scientific'?'multiply fronts → add powers':'divide fronts → subtract powers')+' → normalize by absolute value';
    copy.hint="Handle coefficients and powers of ten separately, then use 1 ≤ |coefficient| < 10 without changing the coefficient's sign.";
  }
}

function apply(problem,plan){
  var out=clone(plan);
  (out.candidates||[]).forEach(function(candidate){
    fixSteps(problem,candidate.strategyId,candidate.steps);
    fixCopy(problem,candidate.strategyId,candidate);
  });
  if(out.chosenPlan){
    fixSteps(problem,out.chosenStrategyId,out.chosenPlan.steps);
    fixCopy(problem,out.chosenStrategyId,out.chosenPlan);
    out.chosenPlan.firstStep=(out.chosenPlan.steps||[])[0]||null;
  }
  (out.nearTies||[]).forEach(function(candidate){
    fixSteps(problem,candidate.strategyId,candidate.steps);
    fixCopy(problem,candidate.strategyId,candidate);
  });
  return out;
}

module.exports={apply:apply,oppositeMove:oppositeMove,isScientificOperation:isScientificOperation};
