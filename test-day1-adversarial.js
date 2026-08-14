const assert=require('assert'),fs=require('fs');
const D=require('./day1-session.js'),M=require('./molecule-stage.js'),SM=require('./student-model-idk-router.js');
const html=fs.readFileSync('astarryia-day1-foundation-reset.html','utf8');
let passed=0;
function test(name,fn){fn();passed++;console.log('PASS ',name)}

test('fraction and decimal equivalents are accepted safely',()=>{
  assert(D.classifyAnswer('2/4',{a:['1/2']}).correct);
  assert(D.classifyAnswer('0.5',{a:['1/2']}).correct);
  assert.equal(D.classifyAnswer('2/x',{a:['1/2']}).errorCode,'CONCEPT');
});
test('format-only assignments remain distinct',()=>assert.equal(D.classifyAnswer('x = 3',{a:['3'],numberOnly:true}).errorCode,'FORMAT_ONLY'));
test('meaningless and keyword-salad explanations are rejected',()=>{
  ['ok','yes','idk','unrelated words'].forEach(x=>assert(!D.meaningfulExplanation(x,[['14'],['bond']])));
  assert(!D.meaningfulExplanation('fourteen bananas twelve cats two lone pair nitrogen',[['14','fourteen'],['12','twelve'],['2','two'],['lone pair'],['nitrogen']]));
  assert(D.meaningfulExplanation('There are 14 total electrons; six bonds use 12, so 2 remain as one lone pair on nitrogen.',[['14'],['12'],['2'],['lone pair'],['nitrogen']]));
});
test('repeated IDK keeps prerequisite gate active until checked',()=>{
  const s=SM.createSkill('algebra');
  SM.handleIdk(s,SM.IDK_REASONS.DONT_UNDERSTAND,'p1','balance',1);
  SM.handleIdk(s,SM.IDK_REASONS.SHOW_EXAMPLE,'p2','balance',2);
  assert.equal(SM.exitRemediation(s,[{id:'fresh'}]).reason,'prerequisite_not_yet_passed');
  assert.equal(s.idkSelections.length,2);
  SM.recordRemediationCheck(s,true,'balance-check',3);
  assert(SM.exitRemediation(s,[{id:'fresh'}]).allowed);
});
test('duplicate, fabricated, and hydrogen lone-pair states fail',()=>{
  let s={atoms:[{id:'o',el:'O'},{id:'h',el:'H'}],bonds:[{id:'b',a:'o',b:'ghost'}],lonePairs:[]};
  assert.equal(M.verifyStructure(s,M.TARGETS.H2O).reason,'invalid_state');
  s={atoms:[{id:'o',el:'O'},{id:'h',el:'H'}],bonds:[{id:'b1',a:'o',b:'h'},{id:'b2',a:'h',b:'o'}],lonePairs:[]};
  assert.equal(M.verifyStructure(s,M.TARGETS.H2O).reason,'invalid_state');
  s={atoms:[{id:'o',el:'O'},{id:'h1',el:'H'},{id:'h2',el:'H'}],bonds:[{id:'b1',a:'o',b:'h1'},{id:'b2',a:'o',b:'h2'}],lonePairs:[{id:'lp',atomId:'h1'}]};
  assert.equal(M.detectMisconception(s,M.TARGETS.H2O).code,'H_OVERLOADED');
});
test('canonical stage has one pointer event path and no transition timer',()=>{
  assert.equal((html.match(/svg\.addEventListener\("pointerup"/g)||[]).length,1);
  assert(!/setTimeout\s*\(\s*(?:nextChem|render|completeDay1|ackMath|watchNext)/.test(html));
  assert.equal((html.match(/setTimeout/g)||[]).length,1); // focus only
});
test('canonical right and wrong feedback require learner controls',()=>{
  ['Okay — try again','Got it — continue','Okay — let me correct it','Continue to Day 1 results'].forEach(x=>assert(html.includes(x)));
  assert(html.includes('if(b.id!=="molContinue")b.disabled=true'));
});
test('Build Alone and mastery omit scaffold DOM',()=>{
  assert(html.includes('const scaffolded=mode==="guided"||mode==="together"'));
  assert(html.includes("${scaffolded?'<div class=\"counter\""));
  assert(html.includes("${scaffolded?'<button id=\"hintBtn\""));
  assert.deepEqual(D.scaffoldingFor('alone'),[]);assert.deepEqual(D.scaffoldingFor('mastery'),[]);
});
test('resume advances generated ids beyond persisted ids',()=>{
  assert(html.includes("match(/^a(\\d+)$/)"));
  const next=['a0','a7','external'].reduce((n,id)=>{const m=id.match(/^a(\d+)$/);return m?Math.max(n,+m[1]+1):n},0);
  assert.equal(next,8);
});
test('canonical Undo and confirmed Reset snapshot work',()=>{
  assert(html.includes('state=history.pop();persistStage();renderStage()'));
  assert(html.includes('push();state={atoms:[],bonds:[],lonePairs:[]}'));
  assert(html.includes('confirm("Clear the whole structure?")'));
});
test('fresh modes and persisted learner progress remain separated',()=>{
  const old=D.freshStage('H2O','guided');old.atoms.push('o');assert.deepEqual(D.freshStage('CH3OH','alone').atoms,[]);
  const restored=D.safeSession({studentModel:{a:{state:'GUIDED'}},mathStatus:{a:'Cleared'},stage:{stale:true}},{studentModel:{},mathStatus:{},misconceptionLog:{}});
  assert.equal(restored.studentModel.a.state,'GUIDED');assert.equal(restored.stage,null);
});
test('terminal completion is idempotent in canonical flow',()=>{
  const s={};assert(D.completeDay(s));assert(!D.completeDay(s));assert.equal(s.position,'summary');
  assert(html.includes('Day1Session.completeDay(app)'));assert(html.includes('DAY 1 COMPLETE'));
});
console.log(`=== SUMMARY: ${passed} passed, 0 failed ===`);
