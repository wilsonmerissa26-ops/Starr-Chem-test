/* ============================================================
   PHASE 2A SIGNED SCIENTIFIC-NOTATION GENERALIZATION

   Keep the fixed 1,786-case benchmark stable. This separate property sweep
   closes its known blind spot: generated scientific cases there use positive
   coefficients. Here signs vary independently across conversion, multiply,
   and divide while value reconstruction, normalization, and determinism are
   checked on every case.
   ============================================================ */
'use strict';
var assert=require('assert');
var full=require('./day1-adaptive-math-model.js');

var count=0;
function near(a,b){return Math.abs(Number(a)-Number(b))<=1e-9*Math.max(1,Math.abs(Number(a)),Math.abs(Number(b)));}
function valueOf(ans){return Number(ans.coefficient)*Math.pow(10,Number(ans.exponent));}
function check(problem,expected){
  var a=full.planProblem(Object.assign({source:'signed-scientific-generalization'},problem));
  var b=full.planProblem(Object.assign({source:'signed-scientific-generalization'},problem));
  assert.ok(a.answer&&Number.isFinite(Number(a.answer.coefficient))&&Number.isInteger(Number(a.answer.exponent)));
  assert.ok(Math.abs(Number(a.answer.coefficient))>=1&&Math.abs(Number(a.answer.coefficient))<10,'coefficient must be normalized by absolute value');
  assert.ok(near(valueOf(a.answer),expected),'scientific answer must reconstruct exact source value');
  assert.strictEqual(Math.sign(Number(a.answer.coefficient)),Math.sign(expected),'normalized coefficient must preserve the result sign');
  assert.deepStrictEqual(a.answer,b.answer,'signed scientific planning must be deterministic');
  count++;
}

[1.2,3.75,6.04,9.9].forEach(function(absCoef){[-1,1].forEach(function(sign){[-8,-4,-1,2,6,9].forEach(function(exp){
  var value=sign*absCoef*Math.pow(10,exp);
  check({area:'scientific_notation',family:'convert_to_scientific',value:value},value);
});});});

var pairs=[[1.2,3.5],[2.5,8],[7.2,4.4],[9.9,1.1]];
pairs.forEach(function(cs){[-1,1].forEach(function(leftSign){[-1,1].forEach(function(rightSign){
  [-6,-2,0,5].forEach(function(le){[-4,1,7].forEach(function(re){
    var lc=leftSign*cs[0],rc=rightSign*cs[1];
    var left=lc*Math.pow(10,le),right=rc*Math.pow(10,re);
    check({area:'scientific_notation',family:'multiply_scientific',leftCoefficient:lc,leftExponent:le,rightCoefficient:rc,rightExponent:re},left*right);
    check({area:'scientific_notation',family:'divide_scientific',leftCoefficient:lc,leftExponent:le,rightCoefficient:rc,rightExponent:re},left/right);
  });});
});});});

assert.strictEqual(count,432,'signed scientific generated population must stay stable');
console.log('PHASE2_SIGNED_SCIENTIFIC_CASES',count);
console.log('PASS Phase 2A signed scientific notation generalization');
