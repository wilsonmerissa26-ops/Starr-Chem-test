/* ============================================================
   DAY 1 PROBLEM SOURCE ADAPTER COVERAGE

   The full adaptive model must understand every current learner-facing
   classroom problem without display-layer strategy logic.
   ============================================================ */
'use strict';
var assert=require('assert');
var adapters=require('./day1-problem-source-adapters.js');
var full=require('./day1-adaptive-math-model.js');

var CASES=[
  ['fractions_percent','5/6 − 1/3 =','fraction_add_subtract'],
  ['fractions_percent','3/8 of 160 =','fraction_of_whole'],
  ['fractions_percent','15% of 80 =','percent_of_whole'],
  ['fractions_percent','24 is what percent of 300?','what_percent_of'],
  ['fractions_percent','25% of 68 =','percent_of_whole'],
  ['fractions_percent','18 is what percent of 60?','what_percent_of'],

  ['algebra','4x + 5 = x + 20. Solve for x.','two_sided_linear'],
  ['algebra','7x + 2 = 3x + 26. Solve for x.','two_sided_linear'],
  ['algebra','2/x = 6/15. Solve for x.','proportion'],
  ['algebra','5x − 7 = 18. Solve for x.','one_sided_linear'],

  ['exponents','2^(-4) =','negative_exponent'],
  ['exponents','a^4 × a^3 =','same_base_product'],
  ['exponents','a^7 / a^2 =','same_base_quotient'],
  ['exponents','(x^3)^2 =','power_of_power'],
  ['exponents','10^2 × 10^3 =','same_base_product'],

  ['scientific_notation','Write 0.00061 in scientific notation.','convert_to_scientific'],
  ['scientific_notation','Write 450000 in scientific notation.','convert_to_scientific'],
  ['scientific_notation','(4×10^6)(2×10^-3) =','multiply_scientific'],
  ['scientific_notation','(9×10^-5)/(3×10^-2) =','divide_scientific'],
  ['scientific_notation','Write 0.0072 in scientific notation.','convert_to_scientific'],

  ['logs','log(10000) =','exact_log10'],
  ['logs','If log(x) = −4, x =','inverse_log10'],
  ['logs','Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.','log_product_estimate'],
  ['logs','Estimate −log(6×10^-6) to one decimal.','estimate_negative_log'],

  ['unit_conversions','0.062 L to mL =','single_conversion'],
  ['unit_conversions','750 mL to L =','single_conversion'],
  ['unit_conversions','2.4 g to mg =','single_conversion'],
  ['unit_conversions','3500 mcg to mg =','single_conversion'],
  ['unit_conversions','0.015 mol/s to mmol/min =','stacked_rate'],
  ['unit_conversions','8 g/5 min for 12 min = how many g?','rate_times_duration'],
  ['unit_conversions','2 gal to qt =','single_conversion']
];

CASES.forEach(function(row,i){
  var p=adapters.fromClassroomPrompt(row[0],row[1],{sourceId:'classroom-'+i});
  assert.strictEqual(p.area,row[0],row[1]+' area');
  assert.strictEqual(p.family,row[2],row[1]+' family');
  var plan=full.planProblem(p);
  assert.ok(plan.chosenStrategyId,row[1]+' missing strategy');
  assert.ok(plan.chosenPlan.steps.length,row[1]+' missing steps');
  plan.chosenPlan.steps.forEach(function(st){
    assert.ok(Array.isArray(st.prerequisiteSkillIds),row[1]+' step missing prerequisite metadata');
  });
});

// Explicit answer sanity checks for newly added families.
assert.strictEqual(full.planProblem(adapters.fromClassroomPrompt('fractions_percent','5/6 − 1/3 =')).answer,0.5);
assert.strictEqual(full.planProblem(adapters.fromClassroomPrompt('logs','Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.')).answer,0.78);
assert.ok(Math.abs(full.planProblem(adapters.fromClassroomPrompt('unit_conversions','8 g/5 min for 12 min = how many g?')).answer-19.2)<1e-9);

// The later negative-log estimate must carry a human-doable landmark path. It
// may not silently substitute JavaScript's exact Math.log10(6) into a lesson
// that tells the learner to "estimate using known landmarks."
var negLog=adapters.fromClassroomPrompt('logs','Estimate −log(6×10^-6) to one decimal.');
assert.deepStrictEqual(negLog.factors,[2,3],'6 should be decomposed into the taught landmark factors 2 and 3');
assert.deepStrictEqual(negLog.landmarks,{'2':0.30,'3':0.48},'negative-log item must carry the same landmark values the learner was taught');
assert.strictEqual(negLog.roundTo,1,'classroom prompt explicitly requests one decimal place');
var negPlan=full.planProblem(negLog);
assert.strictEqual(negPlan.answer,5.2,'6 - (0.30 + 0.48) = 5.22, which rounds to 5.2');
var negExpected=negPlan.chosenPlan.steps.map(function(st){return st.expected;});
assert.ok(negExpected.indexOf(0.78)>=0,'plan must explicitly build log(6)≈0.78 from the supplied landmarks');
assert.ok(negExpected.indexOf(Math.log10(6))<0,'learner-facing steps must not smuggle exact calculator precision into an estimation route');

console.log('PASS Day 1 problem source adapters cover '+CASES.length+' current classroom problems with human-doable log estimates');
