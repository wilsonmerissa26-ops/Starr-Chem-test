"use strict";
var assert=require('assert');
var eq=require('./day1/algebra-answer-equivalence-v20.js');
var accepted={
 '5':'5','x=5':'5','X = 5':'5','x equals 5':'5','x is 5':'5','5=x':'5','5 = X':'5','x = -3.5':'-3.5'
};
Object.keys(accepted).forEach(function(v){assert.strictEqual(eq.normalize(v),accepted[v],v);});
['y=5','5=y','x+5','five'].forEach(function(v){assert.strictEqual(eq.normalize(v),v,v+' must not be rewritten');});
console.log('PASS algebra answer equivalence v20 accepts conservative x-value forms and preserves non-equivalent text');
