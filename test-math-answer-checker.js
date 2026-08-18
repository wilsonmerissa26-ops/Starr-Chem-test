/* ============================================================
   CANONICAL MATH ANSWER CHECKER CONTRACT
   ============================================================ */
'use strict';
var assert=require('assert');
var adapt=require('./day1-problem-source-adapters.js');
var model=require('./day1-adaptive-math-model.js');
var check=require('./math-answer-checker.js');

var CASES=[
 ['fractions_percent','5/6 − 1/3 =','1/2','2/3'],
 ['fractions_percent','3/8 of 160 =','60','20'],
 ['fractions_percent','15% of 80 =','12%','15'],
 ['fractions_percent','24 is what percent of 300?','8%','10%'],
 ['fractions_percent','25% of 68 =','17','25'],
 ['fractions_percent','18 is what percent of 60?','30%','18%'],
 ['algebra','4x + 5 = x + 20. Solve for x.','5','4'],
 ['algebra','7x + 2 = 3x + 26. Solve for x.','6','7'],
 ['algebra','2/x = 6/15. Solve for x.','5','2'],
 ['algebra','5x − 7 = 18. Solve for x.','5','7'],
 ['exponents','2^(-4) =','1/16','-16'],
 ['exponents','a^4 × a^3 =','a^7','a^12'],
 ['exponents','a^7 / a^2 =','a^5','a^9'],
 ['exponents','(x^3)^2 =','x^6','x^5'],
 ['exponents','10^2 × 10^3 =','10^5','10^6'],
 ['scientific_notation','Write 0.00061 in scientific notation.','6.1×10^-4','6.1×10^4'],
 ['scientific_notation','Write 450000 in scientific notation.','4.5×10^5','4.5×10^-5'],
 ['scientific_notation','(4×10^6)(2×10^-3) =','8×10^3','8×10^9'],
 ['scientific_notation','(9×10^-5)/(3×10^-2) =','3×10^-3','3×10^-7'],
 ['scientific_notation','Write 0.0072 in scientific notation.','7.2×10^-3','7.2×10^3'],
 ['logs','log(10000) =','4','10000'],
 ['logs','If log(x) = −4, x =','0.0001','-4'],
 ['logs','Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.','0.78','0.30'],
 ['logs','Estimate −log(6×10^-6) to one decimal.','5.2','6'],
 ['unit_conversions','0.062 L to mL =','62 mL','0.062'],
 ['unit_conversions','750 mL to L =','0.75 L','750'],
 ['unit_conversions','2.4 g to mg =','2400 mg','2.4'],
 ['unit_conversions','3500 mcg to mg =','3.5 mg','3500'],
 ['unit_conversions','0.015 mol/s to mmol/min =','900 mmol/min','15'],
 ['unit_conversions','8 g/5 min for 12 min = how many g?','19.2 g','96'],
 ['unit_conversions','2 gal to qt =','8 qt','2']
];

CASES.forEach(function(row,i){
  var p=adapt.fromClassroomPrompt(row[0],row[1],{sourceId:'answer-'+i});
  var plan=model.planProblem(p);
  assert.strictEqual(check.check(p,row[2],plan),true,'should accept '+row[1]+' => '+row[2]);
  assert.strictEqual(check.check(p,row[3],plan),false,'should reject '+row[1]+' => '+row[3]);
});

// Scientific numeric equivalents are accepted even if notation is omitted.
var sp=adapt.fromClassroomPrompt('scientific_notation','(4×10^6)(2×10^-3) =');
assert.ok(check.check(sp,'8000',model.planProblem(sp)));

// Fraction equivalence is value based.
var fp=adapt.fromClassroomPrompt('fractions_percent','5/6 − 1/3 =');
assert.ok(check.check(fp,'3/6',model.planProblem(fp)));

console.log('PASS canonical math answer checker covers '+CASES.length+' current classroom problems');
