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

(function reviewedFormalMentalNearTieBand(){
  assert.strictEqual(engine.FORMAL_MENTAL_NEAR_TIE_MAX,1.8);

  var closeAnchor=planPercent(69,32);
  assert.strictEqual(closeAnchor.rawLowestCostStrategyId,'percent_formal_decimal');
  assert.strictEqual(closeAnchor.selectionPolicyGap,1.05);
  assert.strictEqual(closeAnchor.chosenStrategyId,'percent_70_minus_1');
  assert.strictEqual(closeAnchor.selectionPolicy,'mental_default_in_formal_mental_near_tie_band');
  assert.ok(nearTieIds(closeAnchor).indexOf('percent_formal_decimal')>=0);

  var bandCases=[
    [33,64,1.35,'percent_1_then_scale'],
    [84,64,1.50,'percent_1_then_scale'],
    [69,72,1.65,'percent_70_minus_1'],
    [27,64,1.70,'percent_1_then_scale']
  ];
  bandCases.forEach(function(row){
    var r=planPercent(row[0],row[1]);
    assert.strictEqual(r.rawLowestCostStrategyId,'percent_formal_decimal',row[0]+'% of '+row[1]+' must keep formal as raw cheapest');
    assert.strictEqual(r.selectionPolicyGap,row[2]);
    assert.strictEqual(r.chosenStrategyId,row[3],row[0]+'% of '+row[1]+' must default to the reviewed mental route inside the band');
    assert.strictEqual(r.selectionPolicy,'mental_default_in_formal_mental_near_tie_band');
    assert.ok(nearTieIds(r).indexOf('percent_formal_decimal')>=0,'formal must remain visible as alternate');
  });

  var wideA=planPercent(17,32),wideB=planPercent(88,64);
  assert.strictEqual(wideA.selectionPolicyGap,2.05);
  assert.strictEqual(wideA.chosenStrategyId,'percent_formal_decimal');
  assert.strictEqual(wideA.selectionPolicy,'formal_wins_outside_formal_mental_near_tie_band');
  assert.strictEqual(wideB.selectionPolicyGap,2.60);
  assert.strictEqual(wideB.chosenStrategyId,'percent_formal_decimal');
  assert.strictEqual(wideB.selectionPolicy,'formal_wins_outside_formal_mental_near_tie_band');
})();

(function exactBandBoundaryIsDeterministic(){
  var problem={family:'percent_of_whole'};
  var atBoundary=engine.chooseWithInstructionPolicy(problem,[
    {strategyId:'percent_formal_decimal',cost:5},
    {strategyId:'mental_test_route',cost:6.8}
  ]);
  assert.strictEqual(atBoundary.policyGap,1.8);
  assert.strictEqual(atBoundary.chosen.strategyId,'mental_test_route','exactly 1.8 must remain inside the instructional near-tie band');

  var aboveBoundary=engine.chooseWithInstructionPolicy(problem,[
    {strategyId:'percent_formal_decimal',cost:5},
    {strategyId:'mental_test_route',cost:6.801}
  ]);
  assert.strictEqual(aboveBoundary.policyGap,1.801);
  assert.strictEqual(aboveBoundary.chosen.strategyId,'percent_formal_decimal','a gap above 1.8 must let formal win');
})();

(function correctnessAndDeterminism(){
  var r=planPercent(57,80);assert.ok(r.candidates.length>1);r.candidates.forEach(function(c){assert.strictEqual(c.valid,true);});
  var problem={area:'fractions_percentages',family:'percent_of_whole',percent:15,whole:80,source:'calibration'};
  assert.strictEqual(engine.plan(problem,{studentFluency:null}).chosenStrategyId,engine.plan(problem,{studentFluency:{}}).chosenStrategyId);
  var a=planPercent(88,50),b=planPercent(88,50);assert.strictEqual(a.chosenStrategyId,b.chosenStrategyId);assert.deepStrictEqual(nearTieIds(a),nearTieIds(b));
})();

console.log('PASS math strategy engine calibration, weight-wiring, carry-sensitivity, and formal-mental near-tie policy contract');
