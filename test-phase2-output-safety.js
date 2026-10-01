/* ============================================================
   PHASE 2A COMPUTED-OUTPUT SAFETY CONTRACT

   Finite inputs are not enough: arithmetic can overflow or underflow after
   validation. The canonical planner must fail explicitly rather than emit
   Infinity, NaN, zero from power-of-ten underflow, or symbolic 1/Infinity.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

function mustReject(problem,label){
  assert.throws(function(){full.planProblem(Object.assign({source:'output-safety'},problem));},/finite|overflow|underflow|unsafe|representable/i,label);
}

mustReject({area:'logs',family:'inverse_log10',exponent:1000},'10^1000 must not become Infinity');
mustReject({area:'logs',family:'inverse_log10',exponent:-1000},'10^-1000 must not silently underflow to zero');
mustReject({area:'exponents',family:'negative_exponent',base:10,exponent:-400},'negative exponent must not produce 1/Infinity');
mustReject({area:'unit_conversions',family:'single_conversion',value:1e308,from:'u1',to:'u2',factor:1000},'single conversion overflow must fail');
mustReject({area:'unit_conversions',family:'stacked_rate',value:1e308,from:'u1/s',to:'u2/min',factors:[1000,60]},'stacked conversion overflow must fail');
mustReject({area:'unit_conversions',family:'rate_times_duration',amount:1e308,perMinutes:1,durationMinutes:1000,unit:'g'},'rate-times-duration overflow must fail');

console.log('PASS Phase 2A canonical planner rejects non-representable computed outputs');
