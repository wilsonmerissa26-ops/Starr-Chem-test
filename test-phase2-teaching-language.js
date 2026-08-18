/* ============================================================
   PHASE 2A LEARNER-FACING TEACHING LANGUAGE CONTRACT

   Correct arithmetic is not enough. The selected route must describe the
   human operation the learner can actually perform and must state mathematical
   definitions accurately across the supported numeric domain.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

function prompts(plan){return plan.chosenPlan.steps.map(function(st){return st.prompt;});}
function allText(plan){return [plan.chosenPlan.concept,plan.chosenPlan.mentalRoute,plan.chosenPlan.hint].concat(prompts(plan)).join(' ');}

// Negative coefficient: do not tell a learner to "subtract -4x". Name the
// equivalent human operation directly: add 4x to both sides.
var alg=full.planProblem({area:'algebra',family:'two_sided_linear',a:5,b:3,c:-4,d:21,source:'teaching-language'});
var algPrompts=prompts(alg);
assert.ok(algPrompts.some(function(t){return /add 4x to both sides/i.test(t);}),
  'negative x-term should be described as adding its positive opposite');
assert.ok(!allText(alg).match(/subtract\s+-4x/i),
  'learner-facing algebra must not say "subtract -4x"');

// Standalone negative exponent: there is no visible fraction bar yet. Teach the
// reciprocal transformation explicitly before evaluating the positive power.
var neg=full.planProblem({area:'exponents',family:'negative_exponent',base:2,exponent:-4,source:'teaching-language'});
assert.ok(prompts(neg)[0].match(/rewrite.*reciprocal/i),
  'negative exponent should begin by explicitly rewriting as a reciprocal');
assert.ok(prompts(neg)[0].indexOf('2^-4')>=0&&prompts(neg)[0].indexOf('1/2^4')>=0,
  'reciprocal rewrite should show the actual current problem');
assert.ok(!allText(neg).match(/move the factor across the fraction bar/i),
  'standalone negative exponent must not refer to a fraction bar that does not exist yet');

// Scientific notation permits negative coefficients. The mathematical rule is
// 1 <= |coefficient| < 10, not coefficient between positive 1 and 10.
var sci=full.planProblem({area:'scientific_notation',family:'convert_to_scientific',value:-450000,source:'teaching-language'});
assert.strictEqual(sci.answer.coefficient,-4.5);
assert.strictEqual(sci.answer.exponent,5);
assert.ok(allText(sci).match(/absolute value/i),
  'scientific-notation teaching must state the coefficient rule using absolute value');
assert.ok(!allText(sci).match(/coefficient (?:must )?(?:stay )?between 1 and 10/i),
  'negative scientific notation must not be taught with a positive-only coefficient statement');

console.log('PASS Phase 2A learner-facing algebra, exponent, and scientific-notation language contract');
