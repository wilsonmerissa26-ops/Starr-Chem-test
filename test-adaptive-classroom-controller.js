/* ============================================================
   ADAPTIVE CLASSROOM CONTROLLER CONTRACT
   ============================================================ */
'use strict';
var assert=require('assert');
var C=require('./day1/adaptive-classroom-controller.js');
var R=require('./day1-adaptive-runtime.js');

var specs=C.supportButtonSpecs();
assert.deepStrictEqual(specs.map(function(x){return x.mode;}),['hint','understand','first_step','walkthrough','mental']);
assert.strictEqual(new Set(specs.map(function(x){return x.id;})).size,5,'support controls need distinct DOM ids');
assert.notStrictEqual(specs.find(function(x){return x.mode==='first_step';}).id,specs.find(function(x){return x.mode==='walkthrough';}).id);

var p=C.inferProblem('15% of 80 =');
assert.strictEqual(p.area,'fractions_percent');
assert.strictEqual(p.family,'percent_of_whole');
assert.strictEqual(p.percent,15);assert.strictEqual(p.whole,80);
assert.ok(/^classroom:fractions_percent:/.test(p.sourceId));
assert.strictEqual(C.inferProblem('7x + 2 = 3x + 26. Solve for x.').area,'algebra');
assert.strictEqual(C.inferProblem('Write 0.00061 in scientific notation.').area,'scientific_notation');
assert.strictEqual(C.inferProblem('0.062 L to mL =').area,'unit_conversions');

assert.ok(C.matchExpected('8',8));
assert.ok(C.matchExpected('1/2',0.5));
assert.ok(C.matchExpected('6.1×10^-4',{coefficient:6.1,exponent:-4}));
assert.ok(C.matchExpected('a^7','a^7'));
assert.ok(!C.matchExpected('a^12','a^7'));

function fakeStore(){
  var data={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(data,k)?data[k]:null;},setItem:function(k,v){data[k]=String(v);},_data:data};
}
var store=fakeStore(),state=R.createLearnerState({studentId:'persist-me'});
R.startProblem(state,p);
assert.ok(C.saveStateToStore(store,state));
var restored=C.loadStateFromStore(store);
assert.strictEqual(restored.studentId,'persist-me');
assert.strictEqual(restored.current.problem.sourceId,p.sourceId);
assert.ok(restored.skills.percent_of_whole);

// Corrupt storage must fail safe to a new learner state, not crash the classroom.
store.setItem(C.STATE_KEY,'{bad json');
var safe=C.loadStateFromStore(store);
assert.ok(safe&&safe.skills&&safe.events);

console.log('PASS adaptive classroom controller contract');
