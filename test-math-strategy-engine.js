/* ============================================================
   MATH STRATEGY ENGINE — PHASE 1 CALIBRATION TESTS
   Tests-first contract for MATH_STRATEGY_ENGINE_SPEC.md.

   These tests intentionally land before the implementation.
   First expected state: FAIL because the engine modules do not exist yet.
   ============================================================ */

'use strict';

var assert = require('assert');
var adapters = require('./math-strategy-adapters.js');
var engine = require('./math-strategy-engine.js');

function planPercent(percent, whole) {
  return engine.plan({
    area: 'fractions_percentages',
    family: 'percent_of_whole',
    percent: percent,
    whole: whole,
    source: 'calibration'
  }, { studentFluency: null });
}

function candidate(result, id) {
  return result.candidates.filter(function(c){ return c.strategyId === id; })[0];
}

function nearTieIds(result) {
  return (result.nearTies || []).map(function(c){ return c.strategyId || c; });
}

/* ---------------- Input adapters ---------------- */

(function classroomPercentParser(){
  var p = adapters.fromClassroomPrompt('15% of 80 =', { sourceId: 'calibration-15-80' });
  assert.strictEqual(p.family, 'percent_of_whole');
  assert.strictEqual(p.percent, 15);
  assert.strictEqual(p.whole, 80);
})();

(function classroomFractionParser(){
  var p = adapters.fromClassroomPrompt('3/8 of 160', { sourceId: 'calibration-3-8-160' });
  assert.strictEqual(p.family, 'fraction_of_whole');
  assert.strictEqual(p.numerator, 3);
  assert.strictEqual(p.denominator, 8);
  assert.strictEqual(p.whole, 160);
})();

(function mathGymUsesStructuredInput(){
  var p = adapters.fromMathGymItem({
    id: 'percent-structured',
    area: 'fractions_percentages',
    type: 'percent',
    prompt: 'ignored display copy',
    strategyInput: {
      family: 'what_percent_of',
      part: 24,
      whole: 300
    }
  });
  assert.strictEqual(p.family, 'what_percent_of');
  assert.strictEqual(p.part, 24);
  assert.strictEqual(p.whole, 300);
})();

/* ---------------- Reviewed route calibration ---------------- */

(function fifteenOfEighty(){
  var r = planPercent(15, 80);
  assert.strictEqual(r.chosenStrategyId, 'percent_10_plus_5');
})();

(function twentyFiveOfSixtyEight(){
  var r = planPercent(25, 68);
  assert.strictEqual(r.chosenStrategyId, 'percent_quarter');
})();

(function fiftyOfNinetyFour(){
  var r = planPercent(50, 94);
  assert.strictEqual(r.chosenStrategyId, 'percent_half');
})();

(function seventyFiveOfOneTwenty(){
  var r = planPercent(75, 120);
  assert.strictEqual(r.chosenStrategyId, 'percent_half_plus_quarter');
})();

(function thirtyThreeOfSixty(){
  var r = planPercent(33, 60);
  assert.strictEqual(r.chosenStrategyId, 'percent_30_plus_3');
})();

(function fiftySevenOfEighty(){
  var r = planPercent(57, 80);
  assert.strictEqual(r.chosenStrategyId, 'percent_60_minus_3');
})();

(function sixtyNineOfTwoHundredPreservesNearTie(){
  var r = planPercent(69, 200);
  assert.strictEqual(r.chosenStrategyId, 'percent_70_minus_1');
  assert.ok(nearTieIds(r).indexOf('percent_1_then_scale') >= 0,
    '69% of 200 must preserve clean 1% then double-69 route as a near-tie');
})();

(function eightyEightOfFiftyPreservesFreeAnchorNearTie(){
  var r = planPercent(88, 50);
  assert.strictEqual(r.chosenStrategyId, 'percent_90_minus_2');
  assert.ok(nearTieIds(r).indexOf('percent_100_minus_10_minus_2') >= 0,
    '88% of 50 must preserve 100%-10%-2% as a near-tie');

  var from100 = candidate(r, 'percent_100_minus_10_minus_2');
  var from90 = candidate(r, 'percent_90_minus_2');
  assert.ok(from100 && from90, 'both reviewed 88% candidates must exist');
  assert.strictEqual(from100.costBreakdown.anchorAcquisition, 0,
    '100% must have zero anchor-acquisition cost');
  assert.ok(from90.costBreakdown.anchorAcquisition > 0,
    '90% must be treated as a computed anchor');
})();

/* ---------------- Whole-number-sensitive ranking ---------------- */

(function samePercentDifferentWholeMayChooseDifferentRoute(){
  var a = planPercent(37, 200);
  var b = planPercent(37, 80);
  assert.notStrictEqual(a.chosenStrategyId, b.chosenStrategyId,
    '37% of 200 and 37% of 80 must not be forced through one percent-only route');
})();

/* ---------------- Eighth reasoning ---------------- */

(function fractionEighthsStayFractionBased(){
  var r = engine.plan({
    area: 'fractions_percentages',
    family: 'fraction_of_whole',
    numerator: 3,
    denominator: 8,
    whole: 160,
    source: 'calibration'
  }, { studentFluency: null });
  assert.strictEqual(r.chosenStrategyId, 'fraction_eighths');
  assert.ok(r.chosenPlan.steps.some(function(step){
    return (step.prerequisiteSkillIds || []).indexOf('eighths') >= 0;
  }), '3/8 of 160 must expose eighth reasoning as a prerequisite');
})();

(function internalTwelvePointFiveCanUseEighthsWithoutChangingScope(){
  var r = planPercent(12.5, 64);
  assert.strictEqual(r.chosenStrategyId, 'percent_eighth');
  assert.strictEqual(r.problem.source, 'calibration');
})();

/* ---------------- Correctness and determinism ---------------- */

(function everyRankedCandidateMustVerify(){
  var r = planPercent(57, 80);
  assert.ok(r.candidates.length > 1, 'engine should consider multiple valid candidates');
  r.candidates.forEach(function(c){
    assert.strictEqual(c.valid, true, c.strategyId + ' entered ranking without mathematical verification');
  });
})();

(function neutralStudentFluencyDoesNotChangeRanking(){
  var problem = {
    area: 'fractions_percentages',
    family: 'percent_of_whole',
    percent: 15,
    whole: 80,
    source: 'calibration'
  };
  var a = engine.plan(problem, { studentFluency: null });
  var b = engine.plan(problem, { studentFluency: {} });
  assert.strictEqual(a.chosenStrategyId, b.chosenStrategyId);
})();

(function identicalInputIsDeterministic(){
  var a = planPercent(88, 50);
  var b = planPercent(88, 50);
  assert.strictEqual(a.chosenStrategyId, b.chosenStrategyId);
  assert.deepStrictEqual(nearTieIds(a), nearTieIds(b));
})();

console.log('PASS  math strategy engine calibration contract');