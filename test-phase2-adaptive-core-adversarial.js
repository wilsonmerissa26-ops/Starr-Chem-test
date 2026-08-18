/* ============================================================
   PHASE 2A ADAPTIVE CORE — UNFAMILIAR / ADVERSARIAL CONTRACT

   These are not the current classroom fixtures. They attack the planner,
   validation, support, graph, and accepted Phase 1 boundary with unfamiliar
   values and invalid structures before any browser integration is allowed.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');
var sm=require('./student-model-idk-router.js');

function close(a,b,tol){return Math.abs(Number(a)-Number(b))<=(tol||1e-9)*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function plan(p){return full.planProblem(Object.assign({source:'adversarial'},p));}
function expectNumeric(p,expected){
  var a=plan(p),b=plan(p);
  assert.ok(close(a.answer,expected),JSON.stringify(p)+' expected '+expected+' got '+a.answer);
  assert.strictEqual(a.chosenStrategyId,b.chosenStrategyId,'planning must be deterministic');
  assert.ok(a.chosenPlan.steps.length>0,'plan must have steps');
  a.chosenPlan.steps.forEach(function(st){assert.ok(Array.isArray(st.prerequisiteSkillIds),'every step needs prerequisite metadata');});
  return a;
}

// Accepted Phase 1 policy must survive Phase 2 composition unchanged.
var phase1=plan({area:'fractions_percent',family:'percent_of_whole',percent:69,whole:32,sourceId:'phase1-boundary'});
assert.strictEqual(phase1.rawLowestCostStrategyId,'percent_formal_decimal');
assert.strictEqual(phase1.chosenStrategyId,'percent_70_minus_1');
assert.strictEqual(phase1.selectionPolicy,'mental_default_in_formal_mental_near_tie_band');
assert.strictEqual(phase1.selectionPolicyGap,1.05);

// Unfamiliar correct cases across all six areas.
expectNumeric({area:'fractions_percent',family:'fraction_add_subtract',leftNumerator:7,leftDenominator:12,operation:'add',rightNumerator:5,rightDenominator:18},31/36);
expectNumeric({area:'algebra',family:'two_sided_linear',a:2,b:11,c:5,d:-4},5);
expectNumeric({area:'algebra',family:'one_sided_linear',a:6,b:-9,d:27},6);
expectNumeric({area:'algebra',family:'proportion',leftNumerator:3,rightNumerator:9,rightDenominator:12},4);
var formula=plan({area:'algebra',family:'formula_rearrangement',formulaId:'P_2l2w_w',target:'w',answer:'malicious-wrong-answer'});
assert.strictEqual(formula.answer,'(P-2l)/2','canonical validator must derive known formula answer instead of trusting caller-supplied answer');

var expQ=plan({area:'exponents',family:'same_base_quotient',base:'b',leftExponent:3,rightExponent:5});
assert.strictEqual(expQ.answer,'b^-2');
var expN=plan({area:'exponents',family:'negative_exponent',base:3,exponent:-3});
assert.strictEqual(expN.answer,'1/27');

var sciC=plan({area:'scientific_notation',family:'convert_to_scientific',value:987000});
assert.ok(close(sciC.answer.coefficient,9.87));assert.strictEqual(sciC.answer.exponent,5);
var sciM=plan({area:'scientific_notation',family:'multiply_scientific',leftCoefficient:7.5,leftExponent:-4,rightCoefficient:4,rightExponent:7});
assert.ok(close(sciM.answer.coefficient,3));assert.strictEqual(sciM.answer.exponent,4);
var sciD=plan({area:'scientific_notation',family:'divide_scientific',leftCoefficient:6,leftExponent:-2,rightCoefficient:1.5,rightExponent:3});
assert.ok(close(sciD.answer.coefficient,4));assert.strictEqual(sciD.answer.exponent,-5);

expectNumeric({area:'logs',family:'exact_log10',value:0.001},-3);
expectNumeric({area:'logs',family:'inverse_log10',exponent:-6},1e-6);
expectNumeric({area:'logs',family:'log_product_estimate',value:15,factors:[3,5],landmarks:{'3':0.4771,'5':0.6990}},1.1761);
expectNumeric({area:'logs',family:'estimate_negative_log',front:2,exponent:4},4-Math.log10(2));

expectNumeric({area:'unit_conversions',family:'single_conversion',value:0.0045,from:'L',to:'mL',factor:1000},4.5);
expectNumeric({area:'unit_conversions',family:'stacked_rate',value:0.02,from:'mol/s',to:'mmol/min',factors:[1000,60]},1200);
expectNumeric({area:'unit_conversions',family:'rate_times_duration',amount:12,perMinutes:8,durationMinutes:20,unit:'g'},30);

// Support roles stay separated even on unfamiliar values.
var supportPlan=plan({area:'algebra',family:'two_sided_linear',a:9,b:-7,c:4,d:18});
var understand=full.supportFor('understand',supportPlan),mental=full.supportFor('mental',supportPlan),first=full.supportFor('first_step',supportPlan);
assert.ok(understand.concept);assert.strictEqual(understand.hint,'');assert.strictEqual(understand.steps.length,0);
assert.strictEqual(first.steps.length,1);assert.ok(mental.hint);

// Invalid structures must fail before planner arithmetic can create Infinity,
// NaN, or an infinite normalization loop.
[
  {area:'fractions_percent',family:'fraction_add_subtract',leftNumerator:1,leftDenominator:0,operation:'add',rightNumerator:1,rightDenominator:2},
  {area:'algebra',family:'one_sided_linear',a:0,b:2,d:10},
  {area:'algebra',family:'two_sided_linear',a:4,b:2,c:4,d:9},
  {area:'algebra',family:'proportion',leftNumerator:3,rightNumerator:0,rightDenominator:12},
  {area:'exponents',family:'negative_exponent',base:0,exponent:-2},
  {area:'exponents',family:'negative_exponent',base:2,exponent:3},
  {area:'scientific_notation',family:'divide_scientific',leftCoefficient:6,leftExponent:2,rightCoefficient:0,rightExponent:1},
  {area:'scientific_notation',family:'multiply_scientific',leftCoefficient:NaN,leftExponent:2,rightCoefficient:3,rightExponent:1},
  {area:'logs',family:'log_product_estimate',value:6,factors:[2,4],landmarks:{'2':0.30,'4':0.60}},
  {area:'unit_conversions',family:'single_conversion',value:2,from:'g',to:'mg',factor:0},
  {area:'unit_conversions',family:'rate_times_duration',amount:8,perMinutes:0,durationMinutes:12,unit:'g'},
  {area:'algebra',family:'not_a_real_family'}
].forEach(function(p){assert.throws(function(){plan(p);},undefined,'expected invalid problem to throw: '+JSON.stringify(p));});

// Deep prerequisite return stack must unwind one level at a time back to the
// exact original parent problem.
var session=full.createSession({area:'fractions_percent',problem:{area:'fractions_percent',family:'percent_of_whole',percent:25,whole:68,source:'test',sourceId:'deep-parent'}});
var parentSkill=sm.createSkill('percent_of_whole');
assert.strictEqual(full.descendToPrerequisite(session,parentSkill,'quartering').action,'teach_prerequisite');
assert.strictEqual(full.descendToPrerequisite(session,sm.createSkill('quartering'),'halving').action,'teach_prerequisite');
var backOne=full.completePrerequisite(session,'halving',true);
assert.strictEqual(backOne.action,'return_to_parent_problem');assert.strictEqual(session.activeSkillId,'quartering');
var backParent=full.completePrerequisite(session,'quartering',true);
assert.strictEqual(backParent.action,'return_to_parent_problem');assert.strictEqual(session.activeSkillId,'percent_of_whole');assert.strictEqual(backParent.problem.sourceId,'deep-parent');

// Once already inside a prerequisite node, arbitrary cross-graph jumps are not
// legal merely because the destination node exists. Blocking must be side-effect
// free so a bad router request cannot corrupt the remediation return path.
var guarded=full.createSession({area:'fractions_percent',problem:{area:'fractions_percent',family:'percent_of_whole',percent:25,whole:68,source:'test',sourceId:'guard-parent'}});
full.descendToPrerequisite(guarded,sm.createSkill('percent_of_whole'),'quartering');
var beforeGuard={activeSkillId:guarded.activeSkillId,returnStack:JSON.stringify(guarded.returnStack),activePath:JSON.stringify(guarded.activePath),history:JSON.stringify(guarded.prerequisiteHistory)};
var unrelated=full.descendToPrerequisite(guarded,sm.createSkill('quartering'),'log_product_rule');
assert.strictEqual(unrelated.action,'unrelated_prerequisite_blocked','deeper descent must follow the explicit dependency graph');
assert.strictEqual(unrelated.from,'quartering');
assert.deepStrictEqual(unrelated.allowedDependencies,['halving']);
assert.strictEqual(guarded.activeSkillId,beforeGuard.activeSkillId,'blocked jump must not change active skill');
assert.strictEqual(JSON.stringify(guarded.returnStack),beforeGuard.returnStack,'blocked jump must not push return stack');
assert.strictEqual(JSON.stringify(guarded.activePath),beforeGuard.activePath,'blocked jump must not alter active path');
assert.strictEqual(JSON.stringify(guarded.prerequisiteHistory),beforeGuard.history,'blocked jump must not fake remediation history');

console.log('PASS Phase 2A unfamiliar/adversarial planner, validation, support, and graph contract');
