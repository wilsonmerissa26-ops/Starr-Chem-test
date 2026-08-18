/* ============================================================
   MATH GYM -> FULL ADAPTIVE MODEL STRUCTURED INPUT CONTRACT

   Math Gym owns structured numeric values before prompt formatting.
   It must hand those values directly to the adaptive model. This test
   deliberately forbids prompt re-parsing as an integration dependency.
   ============================================================ */
'use strict';
var assert=require('assert');
var gym=require('./math-gym-engine.js');
var adapters=require('./day1-problem-source-adapters.js');
var full=require('./day1-adaptive-math-model.js');

function checkItem(label,item){
  assert.ok(item && typeof item==='object',label+' missing item');
  assert.ok(item.strategyInput && typeof item.strategyInput==='object',label+' missing strategyInput');
  assert.ok(item.strategyInput.area,label+' strategyInput missing canonical area');
  assert.ok(item.strategyInput.family,label+' strategyInput missing family');
  var normalized=adapters.fromMathGymItem(item);
  assert.strictEqual(normalized.source,'math_gym');
  assert.strictEqual(normalized.sourceId,item.id);
  var plan=full.planProblem(normalized);
  assert.ok(plan.chosenStrategyId,label+' did not plan');
  assert.ok(plan.chosenPlan.steps.length,label+' plan has no steps');
  plan.chosenPlan.steps.forEach(function(st){
    assert.ok(Array.isArray(st.prerequisiteSkillIds),label+' step missing prerequisite metadata');
  });
  return plan;
}

// Exercise each generator directly several times so product/quotient/mixed and
// log/inverse branches all have a chance to appear. The contract is structural;
// exact random values are not gold fixtures.
var generators=[
  ['fraction',gym.generateFraction,8],
  ['what percent',gym.generatePercent,8],
  ['fraction of whole',gym.generateFractionOfWhole,8],
  ['linear',gym.generateLinearEquation,8],
  ['formula',gym.generateFormulaRearrangement,8],
  ['proportion',gym.generateProportion,8],
  ['negative exponent',gym.generateNegativeExponent,8],
  ['exponent rule',gym.generateExponentRule,24],
  ['scientific',gym.generateScientificNotation,24],
  ['exact/inverse log',gym.generateExactLog,16],
  ['log estimate',gym.generateLogEstimate,8],
  ['unit conversion',gym.generateUnitConversion,16],
  ['stacked rate',gym.generateStackedRate,8]
];
var checked=0;
generators.forEach(function(row){
  for(var i=0;i<row[2];i++){checkItem(row[0]+' '+i,row[1]());checked++;}
});

// Generic area generator must also always emit a planable structured item.
['fractions_percentages','algebra','exponents','scientific_notation','logs_estimation','unit_conversions']
.forEach(function(area){
  for(var i=0;i<20;i++){checkItem('generic '+area+' '+i,gym.generate(area));checked++;}
});

// The adapter must reject a prompt-only item. No silent regex fallback for Math Gym.
assert.throws(function(){adapters.fromMathGymItem({id:'prompt-only',area:'fractions_percentages',prompt:'15% of 80 ='});},/strategyInput/);

console.log('PASS Math Gym structured strategy-input contract across '+checked+' generated items');
