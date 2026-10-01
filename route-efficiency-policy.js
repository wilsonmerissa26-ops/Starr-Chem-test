'use strict';

/* ============================================================
   PHASE 2A ROUTE EFFICIENCY POLICY

   Remove algorithmic steps that provably do no work. When a route is shortened,
   its operation-count feature and cost are recomputed so the audit record still
   matches the learner-facing route. This policy does not invent new strategies.
   ============================================================ */

var cost=require('./math-strategy-cost.js');

function clone(v){return JSON.parse(JSON.stringify(v));}
function gcd(a,b){a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b){var t=a%b;a=b;b=t;}return a||1;}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}

function fractionNeedsReduction(problem){
  var ld=Number(problem.leftDenominator),rd=Number(problem.rightDenominator);
  var ln=Number(problem.leftNumerator),rn=Number(problem.rightNumerator);
  var common=lcm(ld,rd),left=ln*(common/ld),right=rn*(common/rd);
  var combined=problem.operation==='add'?left+right:left-right;
  return gcd(combined,common)>1;
}

function updateMentalRoute(text,needsReduction){
  text=String(text||'');
  if(needsReduction)return text;
  if(/→\s*reduce\s*$/i.test(text))return text.replace(/→\s*reduce\s*$/i,'→ reduce if needed');
  return text;
}

function apply(problem,plan,options){
  if(!problem||problem.family!=='fraction_add_subtract'||!plan)return plan;
  var needsReduction=fractionNeedsReduction(problem);
  if(needsReduction)return plan;

  var out=clone(plan);
  (out.candidates||[]).forEach(function(candidate){
    candidate.steps=(candidate.steps||[]).filter(function(st){return st.id!=='reduce';});
    candidate.mentalRoute=updateMentalRoute(candidate.mentalRoute,false);
    candidate.features=candidate.features||{};
    candidate.features.operationCount=candidate.steps.length;
    var scored=cost.scoreCandidate(candidate,options||{});
    candidate.cost=scored.total;
    candidate.costBreakdown=scored.breakdown;
  });

  if(out.chosenPlan){
    out.chosenPlan.steps=(out.chosenPlan.steps||[]).filter(function(st){return st.id!=='reduce';});
    out.chosenPlan.firstStep=out.chosenPlan.steps[0]||null;
    out.chosenPlan.mentalRoute=updateMentalRoute(out.chosenPlan.mentalRoute,false);
  }

  (out.nearTies||[]).forEach(function(candidate){
    candidate.steps=(candidate.steps||[]).filter(function(st){return st.id!=='reduce';});
    candidate.mentalRoute=updateMentalRoute(candidate.mentalRoute,false);
    if(candidate.features){
      candidate.features.operationCount=candidate.steps.length;
      var scored=cost.scoreCandidate(candidate,options||{});
      candidate.cost=scored.total;
      candidate.costBreakdown=scored.breakdown;
    }
  });
  return out;
}

module.exports={apply:apply,fractionNeedsReduction:fractionNeedsReduction};
