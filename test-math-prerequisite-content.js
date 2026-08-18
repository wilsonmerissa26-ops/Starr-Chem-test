/* ============================================================
   PREREQUISITE TEACHING CONTENT CONTRACT

   A dependency graph is not remediation by itself. Every prerequisite node
   that the full model can descend into must have real teach/check content.
   ============================================================ */
'use strict';
var assert=require('assert');
var model=require('./day1-adaptive-math-model.js');
var content=require('./math-prerequisite-content.js');

var ids=Object.keys(model.PREREQUISITES);
assert.ok(ids.length>20,'expected a real prerequisite graph');
ids.forEach(function(id){
  var lesson=content.getLesson(id);
  assert.ok(lesson,'missing prerequisite content for '+id);
  assert.strictEqual(lesson.skillId,id,id+' wrong skill id');
  assert.ok(lesson.title && lesson.concept,id+' missing title/concept');
  assert.ok(lesson.why && lesson.why.length>10,id+' missing why explanation');
  assert.ok(Array.isArray(lesson.representations) && lesson.representations.length>=2,id+' needs at least two representations');
  assert.ok(lesson.workedExample && lesson.workedExample.prompt,id+' missing worked example');
  assert.strictEqual(typeof lesson.workedExample.check,'function',id+' worked example missing check');
  assert.ok(lesson.workedExample.check(lesson.workedExample.answer),id+' worked example does not validate own answer');
  var bank=content.getCheckBank(id);
  assert.ok(Array.isArray(bank) && bank.length>=3,id+' needs at least three prerequisite checks');
  var seen={};
  bank.forEach(function(q){
    assert.ok(q.id && q.prompt,id+' check missing id/prompt');
    assert.ok(!seen[q.id],id+' duplicate check id '+q.id);seen[q.id]=1;
    assert.strictEqual(typeof q.check,'function',id+' check missing validator');
    assert.ok(q.check(q.answer),id+' check '+q.id+' rejects its own answer');
  });
});

// Representation selection is deterministic and rotates to a genuinely
// different form when Student Model asks for a switch.
var a=content.getRepresentation('halving','diagram');
var b=content.getRepresentation('halving','worked_example');
assert.ok(a && b && a!==b,'halving representations should differ');

// Leaf checks and higher prerequisites are both covered.
['place_value','basic_multiplication','common_denominator','equation_balance','same_base_rule','log_product_rule','dimensional_cancellation']
.forEach(function(id){assert.ok(content.getCheckBank(id).length>=3,id+' missing representative bank');});

console.log('PASS prerequisite teaching content covers '+ids.length+' graph nodes');
