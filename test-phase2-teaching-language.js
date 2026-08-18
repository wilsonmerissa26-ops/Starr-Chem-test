/* ============================================================
   PHASE 2A LEARNER-FACING TEACHING LANGUAGE CONTRACT

   Correct arithmetic is not enough. The selected route and prerequisite
   lessons must describe the human operation the learner can actually perform
   and must state mathematical definitions accurately across the supported
   numeric domain.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');
var prereq=require('./math-prerequisite-content.js');

function prompts(plan){return plan.chosenPlan.steps.map(function(st){return st.prompt;});}
function allText(plan){return [plan.chosenPlan.concept,plan.chosenPlan.mentalRoute,plan.chosenPlan.hint].concat(prompts(plan)).join(' ');}
function lessonText(id){
  var l=prereq.getLesson(id);
  assert.ok(l,'missing prerequisite lesson '+id);
  return [l.title,l.concept,l.why].concat((l.representations||[]).map(function(r){return r.text;})).join(' ');
}

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

// The prerequisite content must teach the same signed-domain definition as the
// planner. A remediation switch may not reintroduce the obsolete [1,10) rule.
var coefficientLesson=lessonText('scientific_coefficient_range');
var normalizeLesson=lessonText('normalize_scientific');
assert.ok(/absolute value/i.test(coefficientLesson),
  'scientific coefficient prerequisite must define the valid range by absolute value');
assert.ok(/absolute value/i.test(normalizeLesson),
  'scientific normalization prerequisite must define the valid range by absolute value');
assert.ok(!/coefficient in \[1,10\)/i.test(normalizeLesson),
  'normalization prerequisite must not silently revert to a positive-only coefficient interval');
var signedCheck=prereq.getCheckBank('scientific_coefficient_range').find(function(q){return /-4\.5/.test(q.prompt);});
assert.ok(signedCheck,'scientific coefficient prerequisite needs at least one negative-coefficient check');
assert.strictEqual(signedCheck.check('-4.5'),true,'negative coefficient check must validate the correct signed coefficient');

console.log('PASS Phase 2A learner-facing algebra, exponent, and scientific-notation language/content contract');
