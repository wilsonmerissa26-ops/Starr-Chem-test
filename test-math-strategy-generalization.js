'use strict';
var assert=require('assert');
var engine=require('./math-strategy-engine.js');

var percents=[1,5,10,12.5,15,17,20,25,27,33,37,38,50,57,58,62,63,69,72,75,83,84,88,90];
var wholes=[32,40,50,60,64,72,80,96,120,160,180,200,240,300,360];
var gold=new Set(['15|80','25|68','50|94','75|120','33|60','57|80','69|200','88|50','37|200','37|80','12.5|64']);
var count=0,chosenByPercent={},rows=[];

function plan(p,w){
  return engine.plan({area:'fractions_percentages',family:'percent_of_whole',percent:p,whole:w,source:'generalization'},{studentFluency:null});
}

percents.forEach(function(p){
  wholes.forEach(function(w){
    if(gold.has(p+'|'+w))return;
    var r=plan(p,w);count++;
    assert.ok(r.candidates.length>0);
    assert.ok(r.candidates.every(function(c){return c.valid===true;}));
    assert.ok(Math.abs(r.answer-p*w/100)<1e-9);
    var again=plan(p,w);
    assert.strictEqual(r.chosenStrategyId,again.chosenStrategyId);
    assert.deepStrictEqual(r.nearTies.map(function(c){return c.strategyId;}),again.nearTies.map(function(c){return c.strategyId;}));
    r.candidates.forEach(function(c){
      assert.ok(Math.abs(c.answer-r.answer)<1e-9,p+'% of '+w+': invalid '+c.strategyId);
      if(c.strategyId.indexOf('percent_100_minus_')===0)assert.strictEqual(c.costBreakdown.anchorAcquisition,0);
    });
    if(!chosenByPercent[p])chosenByPercent[p]=new Set();
    chosenByPercent[p].add(r.chosenStrategyId);
    rows.push([p,w,r.chosenStrategyId,r.candidates[0].cost,r.nearTies.map(function(c){return c.strategyId;}).join('|')]);
  });
});

assert.ok(count>=100);
wholes.forEach(function(w){
  assert.strictEqual(plan(5,w).chosenStrategyId,'percent_five');
  assert.strictEqual(plan(10,w).chosenStrategyId,'percent_ten');
  assert.strictEqual(plan(15,w).chosenStrategyId,'percent_10_plus_5');
  assert.strictEqual(plan(25,w).chosenStrategyId,'percent_quarter');
  assert.strictEqual(plan(50,w).chosenStrategyId,'percent_half');
  assert.strictEqual(plan(75,w).chosenStrategyId,'percent_half_plus_quarter');
});
assert.ok(chosenByPercent[37].size>1,'37% should use more than one route across different wholes');

[2,4,5,8,10].forEach(function(d){
  var nums=[];for(var n=1;n<d&&nums.length<4;n++)nums.push(n);
  nums.forEach(function(n){
    [40,64,80,120,160,200].forEach(function(w){
      var r=engine.plan({area:'fractions_percentages',family:'fraction_of_whole',numerator:n,denominator:d,whole:w,source:'generalization'},{studentFluency:null});
      assert.ok(r.candidates.every(function(c){return c.valid;}));
      assert.ok(Math.abs(r.answer-n*w/d)<1e-9);
    });
  });
});

[[24,300],[45,180],[35,140],[18,90],[17,100],[84,200],[33,300]].forEach(function(pair){
  var part=pair[0],w=pair[1];
  var r=engine.plan({area:'fractions_percentages',family:'what_percent_of',part:part,whole:w,source:'generalization'},{studentFluency:null});
  assert.ok(r.candidates.every(function(c){return c.valid;}));
  assert.ok(Math.abs(r.answer-part/w*100)<1e-9);
});

assert.throws(function(){engine.plan({family:'percent_of_whole',percent:-5,whole:80},{studentFluency:null});});
assert.throws(function(){engine.plan({family:'fraction_of_whole',numerator:3,denominator:0,whole:80},{studentFluency:null});});
assert.throws(function(){engine.plan({family:'what_percent_of',part:3,whole:0},{studentFluency:null});});

console.log('GENERALIZATION_CASES',count);
percents.forEach(function(p){console.log('PERCENT',p,'ROUTES',Array.from(chosenByPercent[p]).join(','));});
console.log('SAMPLE');
rows.slice(0,30).forEach(function(r){console.log(r.join('\t'));});
console.log('PASS generalization invariants');