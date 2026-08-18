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
// Human review of the carry-corrected awkward-whole set separated one close
// formal-vs-mental case (gap 1.05) from the next-smallest reviewed gap (1.70).
// This policy threshold is deliberately separate from arithmetic cost: when
// formal decimal multiplication is only narrowly cheaper, Day 1 defaults to
// the best mental route while surfacing formal as an alternate. Wide gaps let
// the formal route win outright. Revalidate this boundary as calibration grows.
var FORMAL_MENTAL_CLOSE_MARGIN=1.5;
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
      if(policyGap<=FORMAL_MENTAL_CLOSE_MARGIN){
        chosen=bestMental;
        forcedAlternate=rawCheapest;
        policy='mental_default_when_formal_advantage_is_close';
      }else{
        policy='formal_wins_with_wide_cost_advantage';
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
return{plan:plan,expectedAnswer:expectedAnswer,NEAR_TIE:NEAR_TIE,FORMAL_MENTAL_CLOSE_MARGIN:FORMAL_MENTAL_CLOSE_MARGIN,chooseWithInstructionPolicy:chooseWithInstructionPolicy};
});
