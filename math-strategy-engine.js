'use strict';
var adapters=require('./math-strategy-adapters.js');
var library=require('./math-strategy-library.js');
var cost=require('./math-strategy-cost.js');
var NEAR_TIE=0.5;

function expectedAnswer(p){
  if(p.family==='percent_of_whole')return p.percent*p.whole/100;
  if(p.family==='fraction_of_whole')return p.numerator*p.whole/p.denominator;
  if(p.family==='what_percent_of')return p.part/p.whole*100;
  throw new Error('unsupported family');
}

function close(a,b){return Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));}

function makePlan(c){
  return{
    concept:c.concept||'',
    mentalRoute:c.mentalRoute||'',
    hint:c.hint||'',
    firstStep:(c.steps||[])[0]||null,
    steps:c.steps||[]
  };
}

function plan(problem,options){
  var p=adapters.normalize(problem), expected=expectedAnswer(p);
  var candidates=library.generate(p)
    .filter(function(c){return c.valid===true&&close(c.answer,expected);})
    .map(function(c){
      var s=cost.scoreCandidate(c,options||{});
      return Object.assign({},c,{cost:s.total,costBreakdown:s.breakdown});
    });

  if(!candidates.length)throw new Error('no mathematically valid strategy candidates');

  candidates.sort(function(a,b){
    if(a.cost!==b.cost)return a.cost-b.cost;
    return a.strategyId.localeCompare(b.strategyId);
  });

  var chosen=candidates[0];
  var near=candidates.slice(1).filter(function(c){return c.cost-chosen.cost<=NEAR_TIE;});

  return{
    problem:p,
    answer:expected,
    candidates:candidates,
    chosenStrategyId:chosen.strategyId,
    chosenPlan:makePlan(chosen),
    nearTies:near
  };
}

module.exports={plan:plan,expectedAnswer:expectedAnswer,NEAR_TIE:NEAR_TIE};