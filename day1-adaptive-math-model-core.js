'use strict';

/* ============================================================
   FULL DAY 1 ADAPTIVE MATH MODEL
   Pure logic. No DOM. One canonical model/controller layer between
   problem sources and learner-facing renderers.
   ============================================================ */

var strategy = require('./math-strategy-engine.js');
var cost = require('./math-strategy-cost.js');

var SUPPORTED_AREAS = ['fractions_percent','algebra','exponents','scientific_notation','logs','unit_conversions'];

var PREREQUISITES = {
  halving:{id:'halving',area:'fractions_percent',dependsOn:['divide_by_2']},
  quartering:{id:'quartering',area:'fractions_percent',dependsOn:['halving']},
  eighths:{id:'eighths',area:'fractions_percent',dependsOn:['halving','quartering']},
  divide_by_2:{id:'divide_by_2',area:'fractions_percent',dependsOn:[]},
  divide_by_10:{id:'divide_by_10',area:'fractions_percent',dependsOn:['place_value']},
  divide_by_100:{id:'divide_by_100',area:'fractions_percent',dependsOn:['place_value']},
  place_value:{id:'place_value',area:'fractions_percent',dependsOn:[]},
  multiply_by_small_whole:{id:'multiply_by_small_whole',area:'fractions_percent',dependsOn:['basic_multiplication']},
  basic_multiplication:{id:'basic_multiplication',area:'fractions_percent',dependsOn:[]},
  add_friendly_chunks:{id:'add_friendly_chunks',area:'fractions_percent',dependsOn:['basic_addition']},
  subtract_friendly_chunks:{id:'subtract_friendly_chunks',area:'fractions_percent',dependsOn:['basic_subtraction']},
  basic_addition:{id:'basic_addition',area:'fractions_percent',dependsOn:[]},
  basic_subtraction:{id:'basic_subtraction',area:'fractions_percent',dependsOn:[]},
  fraction_denominator_first:{id:'fraction_denominator_first',area:'fractions_percent',dependsOn:['division_meaning']},
  fraction_simplification:{id:'fraction_simplification',area:'fractions_percent',dependsOn:['factor_pairs']},
  common_denominator:{id:'common_denominator',area:'fractions_percent',dependsOn:['factor_pairs','basic_multiplication']},
  fraction_combine_numerators:{id:'fraction_combine_numerators',area:'fractions_percent',dependsOn:['basic_addition','basic_subtraction']},
  factor_pairs:{id:'factor_pairs',area:'fractions_percent',dependsOn:['basic_multiplication']},
  division_meaning:{id:'division_meaning',area:'fractions_percent',dependsOn:[]},
  part_whole_relationship:{id:'part_whole_relationship',area:'fractions_percent',dependsOn:['division_meaning']},
  place_value_decimal_shift:{id:'place_value_decimal_shift',area:'fractions_percent',dependsOn:['place_value']},

  equation_balance:{id:'equation_balance',area:'algebra',dependsOn:[]},
  inverse_add_subtract:{id:'inverse_add_subtract',area:'algebra',dependsOn:['equation_balance']},
  inverse_multiply_divide:{id:'inverse_multiply_divide',area:'algebra',dependsOn:['equation_balance','division_meaning']},
  combine_like_terms:{id:'combine_like_terms',area:'algebra',dependsOn:['basic_addition','basic_subtraction']},
  signed_arithmetic:{id:'signed_arithmetic',area:'algebra',dependsOn:['basic_addition','basic_subtraction']},
  proportion_structure:{id:'proportion_structure',area:'algebra',dependsOn:['fraction_denominator_first']},
  substitution_check:{id:'substitution_check',area:'algebra',dependsOn:['basic_multiplication','basic_addition']},
  formula_inverse_operations:{id:'formula_inverse_operations',area:'algebra',dependsOn:['equation_balance','inverse_add_subtract','inverse_multiply_divide']},

  exponent_meaning:{id:'exponent_meaning',area:'exponents',dependsOn:['basic_multiplication']},
  same_base_rule:{id:'same_base_rule',area:'exponents',dependsOn:['exponent_meaning']},
  reciprocal_meaning:{id:'reciprocal_meaning',area:'exponents',dependsOn:['fraction_denominator_first']},

  scientific_coefficient_range:{id:'scientific_coefficient_range',area:'scientific_notation',dependsOn:['place_value']},
  exponent_sign_magnitude:{id:'exponent_sign_magnitude',area:'scientific_notation',dependsOn:['exponent_meaning','place_value']},
  normalize_scientific:{id:'normalize_scientific',area:'scientific_notation',dependsOn:['scientific_coefficient_range','place_value_decimal_shift']},

  power_of_ten_landmarks:{id:'power_of_ten_landmarks',area:'logs',dependsOn:['exponent_meaning']},
  log_inverse_relationship:{id:'log_inverse_relationship',area:'logs',dependsOn:['power_of_ten_landmarks']},
  log_landmarks:{id:'log_landmarks',area:'logs',dependsOn:['power_of_ten_landmarks']},
  log_product_rule:{id:'log_product_rule',area:'logs',dependsOn:['log_landmarks','basic_addition']},
  estimation:{id:'estimation',area:'logs',dependsOn:['place_value']},

  unit_relationship:{id:'unit_relationship',area:'unit_conversions',dependsOn:[]},
  dimensional_cancellation:{id:'dimensional_cancellation',area:'unit_conversions',dependsOn:['fraction_denominator_first']},
  magnitude_prediction:{id:'magnitude_prediction',area:'unit_conversions',dependsOn:['estimation']},
  multiply_by_conversion_factor:{id:'multiply_by_conversion_factor',area:'unit_conversions',dependsOn:['basic_multiplication']},
  rate_meaning:{id:'rate_meaning',area:'unit_conversions',dependsOn:['division_meaning']},
  cancel_rate_time:{id:'cancel_rate_time',area:'unit_conversions',dependsOn:['rate_meaning','dimensional_cancellation']}
};

function clone(x){ return JSON.parse(JSON.stringify(x)); }
function near(a,b){ return Math.abs(Number(a)-Number(b)) <= 1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b))); }
function gcd(a,b){a=Math.abs(Math.trunc(a));b=Math.abs(Math.trunc(b));while(b){var t=b;b=a%b;a=t;}return a||1;}
function lcm(a,b){return Math.abs(a*b)/gcd(a,b);}
function reduce(n,d){var g=gcd(n,d);return{n:n/g,d:d/g};}
function step(id,prompt,expected,skills,hint){return{id:id,prompt:prompt,expected:expected,prerequisiteSkillIds:skills||[],hint:hint||''};}
function candidate(id,answer,steps,copy,features){return{strategyId:id,answer:answer,valid:true,steps:steps||[],concept:(copy&&copy.concept)||'',mentalRoute:(copy&&copy.mentalRoute)||'',hint:(copy&&copy.hint)||'',features:features||{}};}
function scoreOne(c,options){var s=cost.scoreCandidate(c,options||{});return Object.assign({},c,{cost:s.total,costBreakdown:s.breakdown});}
function finalize(problem,candidates,options){
  if(!candidates||!candidates.length)throw new Error('no strategy candidates for '+problem.area+'/'+problem.family);
  var valid=candidates.filter(function(c){return c.valid!==false;}).map(function(c){return scoreOne(c,options);});
  if(!valid.length)throw new Error('no valid strategy candidates for '+problem.area+'/'+problem.family);
  valid.sort(function(a,b){if(a.cost!==b.cost)return a.cost-b.cost;return a.strategyId.localeCompare(b.strategyId);});
  var chosen=valid[0];
  return{problem:clone(problem),answer:chosen.answer,candidates:valid,chosenStrategyId:chosen.strategyId,chosenPlan:{concept:chosen.concept||'',mentalRoute:chosen.mentalRoute||'',hint:chosen.hint||'',firstStep:(chosen.steps||[])[0]||null,steps:chosen.steps||[]},nearTies:valid.slice(1).filter(function(c){return c.cost-chosen.cost<=0.5;})};
}

function fractionArithmeticPlan(p,options){
  var ln=Number(p.leftNumerator),ld=Number(p.leftDenominator),rn=Number(p.rightNumerator),rd=Number(p.rightDenominator);
  if(![ln,ld,rn,rd].every(Number.isFinite)||ld<=0||rd<=0)throw new Error('invalid fraction arithmetic');
  var common=lcm(ld,rd), lm=common/ld, rm=common/rd, left=ln*lm, right=rn*rm;
  var combined=p.operation==='add'?left+right:left-right;
  var r$ÑPÐ€L@