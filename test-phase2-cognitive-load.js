/* ============================================================
   PHASE 2A COGNITIVE-LOAD CONTRACT

   A canonical route must not ask the learner to perform a step that changes
   nothing merely because the generic algorithm contains that step.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

function stepIds(plan){return plan.chosenPlan.steps.map(function(st){return st.id;});}

// 1/3 + 1/4 = 7/12 is already reduced. The route should stop after combining
// the numerators rather than say "Reduce 7/12 to 7/12."
var alreadyReduced=full.planProblem({
  area:'fractions_percent',family:'fraction_add_subtract',
  leftNumerator:1,leftDenominator:3,operation:'add',rightNumerator:1,rightDenominator:4,
  source:'cognitive-load'
});
assert.strictEqual(alreadyReduced.answer,7/12);
assert.ok(stepIds(alreadyReduced).indexOf('reduce')<0,
  'already-reduced fraction must not contain a no-op reduction step');
assert.ok(alreadyReduced.chosenPlan.steps.every(function(st){return st.prerequisiteSkillIds.indexOf('fraction_simplification')<0;}),
  'already-reduced result must not pretend fraction simplification was required');
assert.ok(!/→ reduce$/i.test(alreadyReduced.chosenPlan.mentalRoute||''),
  'mental route should not imply mandatory reduction when none is needed');

// A genuinely reducible result must keep the simplification step.
var needsReduction=full.planProblem({
  area:'fractions_percent',family:'fraction_add_subtract',
  leftNumerator:5,leftDenominator:6,operation:'subtract',rightNumerator:1,rightDenominator:3,
  source:'cognitive-load'
});
assert.strictEqual(needsReduction.answer,1/2);
assert.ok(stepIds(needsReduction).indexOf('reduce')>=0,
  'reducible result must retain an actual reduction step');
assert.ok(needsReduction.chosenPlan.steps.some(function(st){return st.prerequisiteSkillIds.indexOf('fraction_simplification')>=0;}));

console.log('PASS Phase 2A routes remove no-op work but retain genuinely necessary steps');
