const assert=require('assert'),fs=require('fs');
const D=require('./day1-session.js'),SM=require('./student-model-idk-router.js');
const html=fs.readFileSync('astarryia-day1-foundation-reset.html','utf8');
const index=fs.readFileSync('index.html','utf8');
const courseHub=fs.readFileSync('course-hub/course-hub.js','utf8');
let passed=0;function test(n,f){f();passed++;console.log('PASS ',n)}
test('GitHub Pages root launches course hub and Day 1 remains reachable',()=>{assert(index.includes('course-hub/'));assert(courseHub.includes('../day1/'));assert(!index.includes('astarryia-day1-foundation-reset.html'))});
test('Math Gym first wrong does not reveal answer',()=>assert(!html.includes('Correct answer:')));
test('Math Gym wrong routes through classification and Student Model',()=>{assert(html.includes('function submitGymAnswer'));assert(html.includes('handleWrongAttempt'))});
test('Math Gym IDK uses existing router',()=>assert(html.includes("routeGymIdk")));
test('blank and unsafe values retain classifications',()=>{assert.equal(D.classifyAnswer('',{a:['3'],numberOnly:true}).errorCode,'BLANK');assert.equal(D.classifyAnswer('x',{a:['3'],numberOnly:true}).errorCode,'NONNUMERIC')});
test('equivalent number is accepted',()=>assert(D.classifyAnswer('2/4',{a:['0.5']}).correct));
test('solve target is separate from equation text',()=>{assert(!/q:"[^"]*\.\s*x\s*="/.test(html));assert(html.includes('answerTarget'))});
test('negative exponents use superscript renderer',()=>assert(html.includes('function mathMarkup')));
test('problem selection avoids immediate repeat',()=>{const bank=[{id:'a'},{id:'b'}];assert.equal(D.selectUnseenItem(bank,['s:a'],'s').id,'b');assert.equal(D.selectUnseenItem(bank,['s:a','s:b'],'s').id,'a')});
test('completion requires all math and chemistry evidence',()=>{const s={requireCompletionGate:true,mathAreas:['a'],mathStatus:{a:'Cleared'},chemResults:{h2o:true,methanol:true,why:true,mastery:true,masteryWhy:false}};assert(!D.completeDay(s));s.chemResults.masteryWhy=true;assert(D.completeDay(s));assert(!D.completeDay(s))});
test('viewing a skill cannot complete it',()=>assert(!D.canCompleteDay({mathAreas:['a'],mathStatus:{},chemResults:{}})));
test('supported Student Model evidence does not equal mastery',()=>{const s=SM.createSkill('x');SM.recordAttempt(s,'i',true,null,1,'3');assert(!SM.evaluateMastery(s,2).mastered)});
test('Math Gym preserves return position and history',()=>{assert(html.includes('gymReturn'));assert(html.includes('gymHistory'));assert(html.includes('returnFromGym'))});
test('restart uses complete fresh state and explicit confirmation',()=>{assert(html.includes('confirm("Clear all Day 1 progress and restart?"'));assert(html.includes('createInitialApp()'))});
test('chemistry remains naturally reachable after math',()=>{assert(html.includes('startChem()'));assert(html.includes('Continue to chemistry'))});
test('formal charge remains a gated summary message, not an action',()=>assert(!/onclick="[^"]*formal/i.test(html)));
test('deterministic full Day 1 journey reaches completion once and restores',()=>{
  const s={requireCompletionGate:true,mathAreas:['logs','algebra','exponents','sci','fractions','units'],mathStatus:{},chemResults:{},studentModel:{},misconceptionLog:{},gymHistory:[]};
  const skill=SM.createSkill('logs');SM.handleWrongAttempt(skill,'logs:p0','CONCEPT','logs:p0',1,'9');SM.handleWrongAttempt(skill,'logs:p1','CONCEPT','logs:p1',2,'9');
  assert.equal(skill.remediation.interventionType,'SWITCH_REPRESENTATION');SM.recordRemediationCheck(skill,true,'logs:guided',3);SM.exitRemediation(skill,[{id:'logs:fresh'}]);
  s.mathAreas.forEach(id=>s.mathStatus[id]=id==='logs'?'Cleared':'Developing');
  Object.assign(s.chemResults,{h2o:true,methanol:true,why:true,mastery:true,masteryWhy:true});
  assert(D.completeDay(s));assert(!D.completeDay(s));
  const restored=D.safeSession(JSON.parse(JSON.stringify(s)),{mathAreas:s.mathAreas,mathStatus:{},chemResults:{},misconceptionLog:{},studentModel:{}});
  assert(restored.completed);assert.equal(restored.mathStatus.logs,'Cleared');assert(restored.chemResults.masteryWhy);
  const gym=D.selectUnseenItem([{id:'a'},{id:'b'}],restored.gymHistory,'logs');assert(gym);
});
test('failure journey cannot complete without required math or chemistry',()=>{
  const s={requireCompletionGate:true,mathAreas:['logs'],mathStatus:{},chemResults:{h2o:true,methanol:true,why:true,mastery:true,masteryWhy:false}};
  assert(!D.completeDay(s));s.mathStatus.logs='Developing';assert(!D.completeDay(s));assert(!s.completed);
});
console.log(`=== SUMMARY: ${passed} passed, 0 failed ===`);