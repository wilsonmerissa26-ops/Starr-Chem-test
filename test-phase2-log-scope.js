/* ============================================================
   PHASE 2A LOG SCOPE CONTRACT

   "Exact" Day 1 log families are power-of-ten landmark skills. They must not
   become a back door for calculator-only Math.log10 / fractional-power work.
   Estimation families carry their own explicit landmark evidence separately.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

function plan(p){return full.planProblem(Object.assign({source:'log-scope-test'},p));}

// Integer powers of ten remain exact and human-doable from exponent meaning.
[-8,-4,-1,0,1,3,7].forEach(function(exp){
  var exact=plan({area:'logs',family:'exact_log10',value:Math.pow(10,exp)});
  assert.strictEqual(exact.answer,exp,'log10(10^n) must return n exactly');
  var inverse=plan({area:'logs',family:'inverse_log10',exponent:exp});
  assert.strictEqual(inverse.answer,Math.pow(10,exp),'inverse exact log must stay on integer powers of ten');
});

// Arbitrary positive values do not belong in the exact-log family. If a future
// source wants log(3), it must supply a legitimate estimation/landmark route.
assert.throws(function(){
  plan({area:'logs',family:'exact_log10',value:3});
},/power of ten|exact log/i,'exact_log10 must reject arbitrary calculator-only values');

// Fractional exponents such as 10^0.5 require a different capability than the
// Day 1 integer power-of-ten inverse relationship and must not be smuggled in.
assert.throws(function(){
  plan({area:'logs',family:'inverse_log10',exponent:0.5});
},/integer|exact log/i,'inverse_log10 must reject fractional exponents in Day 1 exact-landmark mode');

// The explicit estimation route remains the proper way to handle non-landmark
// front values without calculator precision.
var estimate=plan({
  area:'logs',family:'log_product_estimate',value:6,
  factors:[2,3],landmarks:{'2':0.30,'3':0.48}
});
assert.strictEqual(estimate.answer,0.78);

console.log('PASS Phase 2A exact-log scope stays on human-doable power-of-ten landmarks');
