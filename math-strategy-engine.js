(function(root,factory){
  var api;
  if(typeof module==='object'&&module.exports)api=factory(require('./math-strategy-adapters.js'),require('./math-strategy-library.js'),require('./math-strategy-cost.js'));
  else api=factory(root.MathStrategyAdapters,root.MathStrategyLibrary,root.MathStrategyCost);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.MathStrategyEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(adapters,library,cost){
'use strict';
if(!adapters||!library||!cost)throw new Error('Math Strategy Engine dependencies missing');
var NEAR_TIE=0.5;
// Human review of the carry-corrected awkward-whole cases and the full
// 351-case gap distribution found a middle cluster from roughly 1.35 to 1.70.
// Do not split that cluster with a knife-edge threshold. When formal decimal
// multiplication is raw-cheapest but its advantage is at most 1.8 cost units,
// Day 1 treats the routes as an instructional near-tie: default to the best
// mental route and keep formal visible as the alternate. Gaps above 1.8 let
// formal win outright. This band is calibration-derived, not mathematical law.
var FORMAL_MENTAL_NEAR_TIE_MAX=1.8;
function expectedAnswer(p){
  if(p.family==='percent_of_whole')return p.percent*p.whole/100;
  if(p.family==='fraction_of_whole')return p.numerator*p.whole/p.denominator;
  if(p.family==='what_percent_of')return p.part/p.whole*100;
  throw new Error('unsupported family');
}
function close(a,b){return Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));}
function makePlan(c){return{concept:c.concept||'',mentalRoute:c.mentalRoute||'',hint:c.hint||'',firstStep:(c.steps||[])[0]||null,steps:c.steps||[]};}
function uniqueCandidates(items){
  var seen={};
  return items.filter(function(c){if(!c||seen[c.strategyId])return false;seen[c.strategyId]=true;return true;});
}
function chooseWithInstructionPolicy(problem,candidates){
  var rawCheapest=candidates[0],chosen=rawCheapest,policy='raw_lowest_cost',policyGap=0,forcedAlternate=null;
  if(problem.family==='percent_of_whole'&&rawCheapest.strategyId==='percent_formal_decimal'){
    var bestMental=candidates.filter(function(c){return c.strategyId!=='percent_formal_decimal';})[0];
    if(bestMental){
      policyGap=Math.round((bestMental.cost-rawCheapest.cost)*1000)/1000;
      if(policyGap<=FORMAL_MENTAL_NEAR_TIE_MAX){
        chosen=bestMental;
        forcedAlternate=rawCheapest;
        policy='mental_default_in_formal_mental_near_tie_band';
      }else{
        policy='formal_wins_outside_formal_mental_near_tie_band';
      }
    }
  }
  var near=candidates.filter(function(c){return c.strategyId!==chosen.strategyId&&Math.abs(c.cost-chosen.cost)<=NEAR_TIE;});
  if(forcedAlternate)near.unshift(forcedAlternate);
  return{chosen:chosen,near:uniqueCandidates(near),policy:policy,policyGap:policyGap,rawCheapest:rawCheapest};
}
function plan(problem,options){
  var p=adapters.normalize(problem),expected=expectedAnswer(p);
  var candidates=library.generate(p).filter(function(c){return c.valid===true&&close(c.answer,expected);}).map(function(c){var s=cost.scoreCandidate(c,options||{});return Object.assign({},c,{cost:s.total,costBreakdown:s.breakdown});});
  if(!candidates.length)throw new Error('no mathematically valid strategy candidates');
  candidates.sort(function(a,b){if(a.cost!==b.cost)return a.cost-b.cost;return a.strategyId.localeCompare(b.strategyId);});
  var decision=chooseWithInstructionPolicy(p,candidates),chosen=decision.chosen;
  return{
    problem:p,
    answer:expected,
    candidates:candidates,
    chosenStrategyId:chosen.strategyId,
    chosenPlan:makePlan(chosen),
    nearTies:decision.near,
    selectionPolicy:decision.policy,
    selectionPolicyGap:decision.policyGap,
    rawLowestCostStrategyId:decision.rawCheapest.strategyId
  };
}
return{plan:plan,expectedAnswer:expectedAnswer,NEAR_TIE:NEAR_TIE,FORMAL_MENTAL_NEAR_TIE_MAX:FORMAL_MENTAL_NEAR_TIE_MAX,chooseWithInstructionPolicy:chooseWithInstructionPolicy};
});
