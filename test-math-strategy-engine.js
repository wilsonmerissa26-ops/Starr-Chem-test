/* ============================================================
   MATH STRATEGY ENGINE — PHASE 1 CALIBRATION TESTS
   Tests-first contract for MATH_STRATEGY_ENGINE_SPEC.md.
   ============================================================ */
'use strict';
var assert=require('assert');
var adapters=require('./math-strategy-adapters.js');
var engine=require('./math-strategy-engine.js');
var cost=require('./math-strategy-cost.js');

function planPercent(percent,whole){return engine.plan({area:'fractions_percentages',family:'percent_of_whole',percent:percent,whole:whole,source:'calibration'},{studentFluency:null});}
function candidate(result,id){return result.candidates.filter(function(c){return c.strategyId===id;})[0];}
function nearTieIds(result){return(result.nearTies||[]).map(function(c){return c.strategyId||c;});}

(function adaptersWork(){
  var p=adapters.fromClassroomPrompt('15% of 80 =',{sourceId:'calibration-15-80'});
  assert.strictEqual(p.family,'percent_of_whole');assert.strictEqual(p.percent,15);assert.strictEqual(p.whole,80);
  var f=adapters.fromClassroomPrompt('3/8 of 160',{sourceId:'calibration-3-8-160'});
  assert.strictEqual(f.family,'fraction_of_whole');assert.strictEqual(f.numerator,3);assert.strictEqual(f.denominator,8);assert.strictEqual(f.whole,160);
  var g=adapters.fromMathGymItem({id:'percent-structured',area:'fractions_percentages',prompt:'ignored display copy',strategyInput:{family:'what_percent_of',part:24,whole:300}});
  assert.strictEqual(g.family,'what_percent_of');assert.strictEqual(g.part,24);assert.strictEqual(g.whole,300);
})();

(function reviewedGoldRoutes(){
  assert.strictEqual(planPercent(15,80).chosenStrategyId,'percent_10_plus_5');
  assert.strictEqual(planPercent(25,68).chosenStrategyId,'percent_quarter');
  assert.strictEqual(planPercent(50,94).chosenStrategyId,'percent_half');
  assert.strictEqual(planPercent(75,120).chosenStrategyId,'percent_half_plus_quarter');
  assert.strictEqual(planPercent(33,60).chosenStrategyId,'percent_30_plus_3');
  assert.strictEqual(planPercent(57,80).chosenStrategyId,'percent_60_minus_3');
  var a=planPercent(69,200);assert.strictEqual(a.chosenStrategyId,'percent_70_minus_1');assert.ok(nearTieIds(a).indexOf('percent_1_then_scale')>=0);
  var b=planPercent(88,50);assert.strictEqual(b.chosenStrategyId,'percent_90_minus_2');assert.ok(nearTieIds(b).indexOf('percent_100_minus_10_minus_2')>=0);
  assert.strictEqual(candidate(b,'percent_100_minus_10_minus_2').costBreakdown.anchorAcquisition,0);
  assert.ok(candidate(b,'percent_90_minus_2').costBreakdown.anchorAcquisition>0);
})();

(function samePercentDifferentWhole(){
  assert.notStrictEqual(planPercent(37,200).chosenStrategyId,planPercent(37,80).chosenStrategyId);
})();

(function eighthReasoning(){
  var r=engine.plan({area:'fractions_percentages',family:'fraction_of_whole',numerator:3,denominator:8,whole:160,source:'calibration'},{studentFluency:null});
  assert.strictEqual(r.chosenStrategyId,'fraction_eighths');
  assert.ok(r.chosenPlan.steps.some(function(step){return(step.prerequisiteSkillIds||[]).indexOf('eighths')>=0;}));
  assert.strictEqual(planPercent(12.5,64).chosenStrategyId,'percent_eighth');
})();

(function allDeclaredWeightsActuallyAffectTheirDimensions(){
  var keys=['anchorAcquisition','divisionDifficulty','multiplicationDifficulty','routeOverhead'];
  var original={};keys.forEach(function(k){original[k]=cost.WEIGHTS[k];});
  try{
    cost.WEIGHTS.anchorAcquisition=2;
    cost.WEIGHTS.divisionDifficulty=3;
    cost.WEIGHTS.multiplicationDifficulty=4;
    cost.WEIGHTS.routeOverhead=5;
    var scored=cost.scoreCandidate({features:{anchorAcquisition:2,divisionDifficulty:3,multiplicationDifficulty:4,routeOverhead:5},steps:[]},{studentFluency:null});
    assert.strictEqual(scored.breakdown.anchorAcquisition,4,'anchorAcquisition weight must be live');
    assert.strictEqual(scored.breakdown.divisionDifficulty,9,'divisionDifficulty weight must be live');
    assert.strictEqual(scored.breakdown.multiplicationDifficulty,16,'multiplicationDifficulty weight must be live');
    assert.strictEqual(scored.breakdown.routeOverhead,25,'routeOverhead weight must be live');
  } finally {
    keys.forEach(function(k){cost.WEIGHTS[k]=original[k];});
  }
})();

(function formalMultiplicationCarryFeatureMatchesReviewedArithmetic(){
  assert.strictEqual(cost.percentFormalCarryCount(17,32),0,'0.17×32 partial-product addition has 0 carries');
  assert.strictEqual(cost.percentFormalCarryCount(27,64),1,'0.27×64 partial-product addition has 1 carry');
  assert.strictEqual(cost.percentFormalCarryCount(69,32),2,'0.69×32 partial-product addition has 2 carries');
  assert.strictEqual(cost.percentFormalCarryCount(88,64),0,'0.88×64 partial-product addition has 0 carries');

  var f17=candidate(planPercent(17,32),'percent_formal_decimal');
  var f27=candidate(planPercent(27,64),'percent_formal_decimal');
  var f69=candidate(planPercent(69,32),'percent_formal_decimal');
  var f88=candidate(planPercent(88,64),'percent_formal_decimal');
  assert.strictEqual(f17.costBreakdown.carryOperations,0);
  assert.strictEqual(f27.costBreakdown.carryOperations,cost.WEIGHTS.operationCount);
  assert.strictEqual(f69.costBreakdown.carryOperations,2*cost.WEIGHTS.operationCount);
  assert.strictEqual(f88.costBreakdown.carryOperations,0);
  assert.strictEqual(f88.cost,f17.cost,'the two reviewed zero-carry formal routes must retain equal formal cost');
  assert.ok(f69.cost>f27.cost && f27.cost>f17.cost,'formal route cost must reflect 2 carries > 1 carry > 0 carries');
})();

(function reviewedGapSizeInstructionPolicy(){
  var a=planPercent(17,32),b=planPercent(27,64),c=planPercent(69,32),d=planPercent(88,64);
  assert.strictEqual(engine.FORMAL_MENTAL_CLOSE_MARGIN,1.5);
  assert.strictEqual(a.chosenStrategyId,'percent_formal_decimal');
  assert.strictEqual(b.chosenStrategyId,'percent_formal_decimal');
  assert.strictEqual(c.rawLowestCostStrategyId,'percent_formal_decimal');
  assert.strictEqual(c.chosenStrategyId,'percent_70_minus_1','close formal advantage should default to the reviewed mental route');
  assert.ok(nearTieIds(c).indexOf('percent_formal_decimal')>=0,'formal route should remain surfaced as the close alternate');
  assert.strictEqual(c.selectionPolicy,'mental_default_when_formal_advantage_is_close');
  assert.strictEqual(c.selectionPolicyGap,1.05);
  assert.strictEqual(d.chosenStrategyId,'percent_formal_decimal');
  assert.strictEqual(a.selectionPolicy,'formal_wins_with_wide_cost_advantage');
  assert.strictEqual(b.selectionPolicy,'formal_wins_with_wide_cost_advantage');
  assert.strictEqual(d.selectionPolicy,'formal_wins_with_wide_cost_advantage');
})();

(function correctnessAndDeterminism(){
  var r=planPercent(57,80);assert.ok(r.candidates.length>1);r.candidates.forEach(function(c){assert.strictEqual(c.valid,true);});
  var problem={area:'fractions_percentages',family:'percent_of_whole',percent:15,whole:80,source:'calibration'};
  assert.strictEqual(engine.plan(problem,{studentFluency:null}).chosenStrategyId,engine.plan(problem,{studentFluency:{}}).chosenStrategyId);
  var a=planPercent(88,50),b=planPercent(88,50);assert.strictEqual(a.chosenStrategyId,b.chosenStrategyId);assert.deepStrictEqual(nearTieIds(a),nearTieIds(b));
})();

console.log('PASS math strategy engine calibration, weight-wiring, carry-sensitivity, and selection-policy contract');
