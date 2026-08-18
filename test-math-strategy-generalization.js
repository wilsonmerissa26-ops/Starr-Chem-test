'use strict';
var assert=require('assert');
var engine=require('./math-strategy-engine.js');

var percents=[1,5,10,12.5,15,17,20,25,27,33,37,38,50,57,58,62,63,69,72,75,83,84,88,90];
var wholes=[32,40,50,60,64,72,80,96,120,160,180,200,240,300,360];
var gold=new Set(['15|80','25|68','50|94','75|120','33|60','57|80','69|200','88|50','37|200','37|80','12.5|64']);
var count=0,chosenByPercent={},rows=[],formalLowest=[];
function plan(p,w){return engine.plan({area:'fractions_percentages',family:'percent_of_whole',percent:p,whole:w,source:'generalization'},{studentFluency:null});}
percents.forEach(function(p){wholes.forEach(function(w){
  if(gold.has(p+'|'+w))return;
  var r=plan(p,w);count++;
  assert.ok(r.candidates.length>0);assert.ok(r.candidates.every(function(c){return c.valid===true;}));
  assert.ok(Math.abs(r.answer-p*w/100)<1e-9);
  var again=plan(p,w);assert.strictEqual(r.chosenStrategyId,again.chosenStrategyId);
  assert.deepStrictEqual(r.nearTies.map(function(c){return c.strategyId;}),again.nearTies.map(function(c){return c.strategyId;}));
  r.candidates.forEach(function(c){assert.ok(Math.abs(c.answer-r.answer)<1e-9,p+'% of '+w+': invalid '+c.strategyId);if(c.strategyId.indexOf('percent_100_minus_')===0)assert.strictEqual(c.costBreakdown.anchorAcquisition,0);});
  if(!chosenByPercent[p])chosenByPercent[p]=new Set();chosenByPercent[p].add(r.chosenStrategyId);
  rows.push([p,w,r.chosenStrategyId,r.candidates[0].cost,r.nearTies.map(function(c){return c.strategyId;}).join('|')]);
  if(r.rawLowestCostStrategyId==='percent_formal_decimal'){
    var formal=r.candidates.filter(function(c){return c.strategyId==='percent_formal_decimal';})[0];
    var mental=r.candidates.filter(function(c){return c.strategyId!=='percent_formal_decimal';})[0];
    if(mental){formalLowest.push({percent:p,whole:w,gap:Math.round((mental.cost-formal.cost)*1000)/1000,formalCost:formal.cost,mentalCost:mental.cost,bestMental:mental.strategyId,chosen:r.chosenStrategyId,selectionPolicy:r.selectionPolicy});}
  }
});});
assert.ok(count>=100);
wholes.forEach(function(w){assert.strictEqual(plan(5,w).chosenStrategyId,'percent_five');assert.strictEqual(plan(10,w).chosenStrategyId,'percent_ten');assert.strictEqual(plan(15,w).chosenStrategyId,'percent_10_plus_5');assert.strictEqual(plan(25,w).chosenStrategyId,'percent_quarter');assert.strictEqual(plan(50,w).chosenStrategyId,'percent_half');assert.strictEqual(plan(75,w).chosenStrategyId,'percent_half_plus_quarter');});
assert.ok(chosenByPercent[37].size>1,'37% should use more than one route across different wholes');
[2,4,5,8,10].forEach(function(d){var nums=[];for(var n=1;n<d&&nums.length<4;n++)nums.push(n);nums.forEach(function(n){[40,64,80,120,160,200].forEach(function(w){var r=engine.plan({area:'fractions_percentages',family:'fraction_of_whole',numerator:n,denominator:d,whole:w,source:'generalization'},{studentFluency:null});assert.ok(r.candidates.every(function(c){return c.valid;}));assert.ok(Math.abs(r.answer-n*w/d)<1e-9);});});});
[[24,300],[45,180],[35,140],[18,90],[17,100],[84,200],[33,300]].forEach(function(pair){var part=pair[0],w=pair[1];var r=engine.plan({area:'fractions_percentages',family:'what_percent_of',part:part,whole:w,source:'generalization'},{studentFluency:null});assert.ok(r.candidates.every(function(c){return c.valid;}));assert.ok(Math.abs(r.answer-part/w*100)<1e-9);});
assert.throws(function(){engine.plan({family:'percent_of_whole',percent:-5,whole:80},{studentFluency:null});});
assert.throws(function(){engine.plan({family:'fraction_of_whole',numerator:3,denominator:0,whole:80},{studentFluency:null});});
assert.throws(function(){engine.plan({family:'what_percent_of',part:3,whole:0},{studentFluency:null});});

var thresholds=[1.2,1.3,1.4,1.5,1.6,1.7,1.8];
var thresholdCounts={};thresholds.forEach(function(t){thresholdCounts[t]=formalLowest.filter(function(r){return r.gap<=t;}).length;});
var oldBoundary=formalLowest.filter(function(r){return r.gap>=1.2&&r.gap<=1.8;});
var actualInstructionalNearTies=formalLowest.filter(function(r){return r.selectionPolicy==='mental_default_in_formal_mental_near_tie_band';});
assert.strictEqual(formalLowest.length,56,'distribution review expects 56 formal-lowest cases in the fixed 351-case suite');
assert.strictEqual(oldBoundary.length,22,'distribution review expects 22 formal-lowest cases in the previously inspected 1.2-to-1.8 boundary region');
assert.strictEqual(thresholdCounts[1.5],15);
assert.strictEqual(thresholdCounts[1.6],15);
assert.strictEqual(thresholdCounts[1.7],27,'1.7 should expose the observed twelve-case cluster jump');
assert.strictEqual(thresholdCounts[1.8],27,'1.8 should include the full reviewed middle cluster without adding a hidden new cluster');
assert.strictEqual(actualInstructionalNearTies.length,27,'current 1.8 instructional near-tie band should override exactly the 27 formal-lowest cases inside the band');
actualInstructionalNearTies.forEach(function(r){assert.ok(r.gap<=engine.FORMAL_MENTAL_NEAR_TIE_MAX);assert.notStrictEqual(r.chosen,'percent_formal_decimal');});
formalLowest.filter(function(r){return r.gap>engine.FORMAL_MENTAL_NEAR_TIE_MAX;}).forEach(function(r){assert.strictEqual(r.chosen,'percent_formal_decimal');});

console.log('GENERALIZATION_CASES',count);
percents.forEach(function(p){console.log('PERCENT',p,'ROUTES',Array.from(chosenByPercent[p]).join(','));});
console.log('POLICY_FORMAL_LOWEST_CASES',formalLowest.length);
console.log('POLICY_REVIEWED_BOUNDARY_REGION_1_2_TO_1_8',oldBoundary.length);
console.log('POLICY_THRESHOLD_COUNTS',JSON.stringify(thresholdCounts));
console.log('POLICY_ACTUAL_INSTRUCTIONAL_NEAR_TIES',actualInstructionalNearTies.length);
console.log('PASS generalization and formal-mental instructional near-tie invariants');
