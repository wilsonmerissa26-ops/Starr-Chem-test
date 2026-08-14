const assert = require('assert');
const D = require('./day1-session.js');
let passed=0;
function test(name, fn){ fn(); passed++; console.log('PASS ',name); }

test('correct numeric answer accepts decimal equivalent',()=>assert.equal(D.classifyAnswer(' 3.0 ',{a:['3'],numberOnly:true}).correct,true));
test('x = 3 is a format error, not a misconception',()=>assert.equal(D.classifyAnswer('x = 3',{a:['3'],numberOnly:true}).errorCode,'FORMAT_ONLY'));
test('bare x is nonnumeric',()=>assert.equal(D.classifyAnswer('x',{a:['3'],numberOnly:true}).errorCode,'NONNUMERIC'));
test('blank is classified separately',()=>assert.equal(D.classifyAnswer(' ',{a:['3'],numberOnly:true}).errorCode,'BLANK'));
test('wrong number is conceptual',()=>assert.equal(D.classifyAnswer('4',{a:['3'],numberOnly:true}).errorCode,'CONCEPT'));
test('meaningless explanation is rejected',()=>assert.equal(D.meaningfulExplanation('ok',[["eight"],["lone pair"]]),false));
test('meaningful paraphrase is accepted',()=>assert.equal(D.meaningfulExplanation('Eight electrons total; four remain as two lone pairs.',[["8","eight"],["4","four"],["lone pair"]]),true));
test('3/3 probe clears',()=>assert.equal(D.branchMath('probe',3,3),'cleared'));
test('2/3 probe targets correction',()=>assert.equal(D.branchMath('probe',2,3),'targeted'));
test('0-1/3 probe teaches',()=>assert.equal(D.branchMath('probe',1,3),'mini'));
test('2/2 verification clears',()=>assert.equal(D.branchMath('verification',2,2),'cleared'));
test('failed verification teaches',()=>assert.equal(D.branchMath('verification',1,2),'mini'));
test('3/4 independent clears and 2/4 develops',()=>{assert.equal(D.branchMath('independent',3,4),'cleared');assert.equal(D.branchMath('independent',2,4),'developing')});
test('60 minute cap marks all unresolved developing',()=>{let s={mathStartedAt:0,mathAreas:['a','b'],mathStatus:{a:'Cleared'},position:'math'};assert(D.applyMathCap(s,3600000));assert.equal(s.mathStatus.b,'Developing');assert.equal(s.position,'break')});
test('each molecule and mode begins empty without leaking state',()=>{let a=D.freshStage('H2O','guided');a.atoms.push('O');let b=D.freshStage('CH3OH','alone');assert.deepEqual(b.atoms,[]);assert.equal(b.hintsUsed,0)});
test('cold modes contain no scaffold features',()=>{assert.deepEqual(D.scaffoldingFor('alone'),[]);assert.deepEqual(D.scaffoldingFor('mastery'),[])});
test('completion is terminal and idempotent',()=>{let s={};assert(D.completeDay(s));assert.equal(D.completeDay(s),false);assert.equal(s.position,'summary');assert.equal(s.completionCount,1)});
console.log(`=== SUMMARY: ${passed} passed, 0 failed ===`);
