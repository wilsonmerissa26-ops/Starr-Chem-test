/* ============================================================
   FULL DAY 1 ADAPTIVE MATH MODEL CONTRACT

   This test is intentionally broader than the Phase 1 strategy tests.
   It protects the integration architecture before live wiring:

   - one Student Model owns learner state
   - all support controls consume one chosen strategy
   - prerequisite descent is explicit and returns to the parent skill
   - anti-loop protection prevents endless remediation recursion
   - every Day 1 math area has a deterministic planner entry point
   - live rendering is not required here
   ============================================================ */
'use strict';

var assert = require('assert');
var model = require('./student-model-idk-router.js');
var full = require('./day1-adaptive-math-model.js');

function skill(id){ return model.createSkill(id); }

// 1. Full model exposes every required Day 1 area.
var requiredAreas = [
  'fractions_percent',
  'algebra',
  'exponents',
  'scientific_notation',
  'logs',
  'unit_conversions'
];
requiredAreas.forEach(function(area){
  assert.strictEqual(typeof full.planProblem, 'function');
  assert.ok(full.SUPPORTED_AREAS.indexOf(area) >= 0, 'missing area '+area);
});

// 2. Support modes reveal different depths of ONE chosen plan.
var pctPlan = full.planProblem({
  area:'fractions_percent', family:'percent_of_whole', percent:15, whole:80,
  source:'test', sourceId:'support-15-80'
});
assert.strictEqual(pctPlan.chosenStrategyId, 'percent_10_plus_5');
var hint = full.supportFor('hint', pctPlan);
var understand = full.supportFor('understand', pctPlan);
var first = full.supportFor('first_step', pctPlan);
var walk = full.supportFor('walkthrough', pctPlan);
assert.strictEqual(hint.strategyId, pctPlan.chosenStrategyId);
assert.strictEqual(understand.strategyId, pctPlan.chosenStrategyId);
assert.strictEqual(first.strategyId, pctPlan.chosenStrategyId);
assert.strictEqual(walk.strategyId, pctPlan.chosenStrategyId);
assert.strictEqual(first.steps.length, 1, 'first step must stop after one step');
assert.ok(walk.steps.length >= first.steps.length, 'walkthrough must expose at least as much as first step');
assert.ok(!understand.answerRevealed, 'understand must not solve the problem');

// 3. Prerequisite graph contains the small skills the strategy engine emits.
['halving','quartering','eighths','divide_by_10','divide_by_100','multiply_by_small_whole',
 'add_friendly_chunks','subtract_friendly_chunks','fraction_denominator_first',
 'fraction_simplification','part_whole_relationship','place_value_decimal_shift']
.forEach(function(id){ assert.ok(full.PREREQUISITES[id], 'missing prerequisite node '+id); });

// 4. Descent creates a return stack and never loses the original problem.
var parent = skill('percent_of_whole');
parent.scaffoldLevel = model.SCAFFOLD.WORKED;
parent.atScaffoldCeiling = true;
var session = full.createSession({
  area:'fractions_percent',
  problem:{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'parent'}
});
var descent = full.descendToPrerequisite(session, parent, 'halving');
assert.strictEqual(descent.action, 'teach_prerequisite');
assert.strictEqual(session.activeSkillId, 'halving');
assert.strictEqual(session.returnStack.length, 1);
assert.strictEqual(session.returnStack[0].problem.sourceId, 'parent');

// 5. Passing the prerequisite returns to the original problem rather than advancing away.
var returned = full.completePrerequisite(session, 'halving', true);
assert.strictEqual(returned.action, 'return_to_parent_problem');
assert.strictEqual(session.activeSkillId, 'percent_of_whole');
assert.strictEqual(returned.problem.sourceId, 'parent');

// 6. Anti-loop: the same prerequisite cannot recursively push itself forever.
var loopSession = full.createSession({
  area:'fractions_percent',
  problem:{area:'fractions_percent',family:'percent_of_whole',percent:15,whole:80,source:'test',sourceId:'loop-parent'}
});
full.descendToPrerequisite(loopSession, skill('percent_of_whole'), 'halving');
var blocked = full.descendToPrerequisite(loopSession, skill('halving'), 'halving');
assert.strictEqual(blocked.action, 'prerequisite_loop_blocked');

// 7. Student fluency can influence cost only through the model-facing seam.
var neutral = full.planProblem({area:'fractions_percent',family:'percent_of_whole',percent:37,whole:200,source:'test',sourceId:'neutral'});
var weighted = full.planProblem({area:'fractions_percent',family:'percent_of_whole',percent:37,whole:200,source:'test',sourceId:'weighted'}, {
  studentFluency:{divide_by_100:1, multiply_by_small_whole:1}
});
assert.ok(neutral && weighted);
assert.ok(weighted.candidates.every(function(c){return c.costBreakdown && Object.prototype.hasOwnProperty.call(c.costBreakdown,'studentFluencyAdjustment');}));

// 8. Other Day 1 areas produce structured deterministic plans.
var examples = [
  {area:'algebra',family:'two_sided_linear',a:7,b:2,c:3,d:26,answer:6,source:'test',sourceId:'alg'},
  {area:'exponents',family:'same_base_product',base:'a',leftExponent:4,rightExponent:3,source:'test',sourceId:'exp'},
  {area:'scientific_notation',family:'convert_to_scientific',value:0.00061,source:'test',sourceId:'sci'},
  {area:'logs',family:'exact_log10',value:1000,source:'test',sourceId:'log'},
  {area:'unit_conversions',family:'single_conversion',value:3.3,from:'L',to:'mL',factor:1000,source:'test',sourceId:'unit'}
];
examples.forEach(function(problem){
  var plan = full.planProblem(problem);
  assert.ok(plan.chosenStrategyId, 'no chosen strategy for '+problem.area);
  assert.ok(Array.isArray(plan.chosenPlan.steps), 'no steps for '+problem.area);
  assert.ok(plan.chosenPlan.steps.length > 0, 'empty steps for '+problem.area);
  var again = full.planProblem(problem);
  assert.strictEqual(again.chosenStrategyId, plan.chosenStrategyId, 'non-deterministic strategy for '+problem.area);
});

console.log('PASS full Day 1 adaptive math model contract');
