const assert=require('assert'),fs=require('fs');
const D=require('./day1-session.js'),SM=require('./student-model-idk-router.js');
const html=fs.readFileSync('astarryia-day1-foundation-reset.html','utf8');
const sessionSource=fs.readFileSync('day1-session.js','utf8');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS ',name)}

test('Day 1 Menu is always discoverable and offers both subjects',()=>{
  assert(html.includes('onclick="openDayMenu()">Day 1 Menu'));
  assert(html.includes('<h2>Math Reset</h2>'));assert(html.includes('<h2>Chemistry Foundation</h2>'));
});
test('chemistry is accessible without clearing math',()=>{assert(html.includes('function resumeChemistry()'));assert(html.includes('app.step="chem";render()'))});
test('subject switching is explicitly not completion evidence',()=>assert(html.includes('Switching subjects does not mark anything complete.')));
test('teaching renders distinct Learn Watch and Practice Together states',()=>{
  ['What this idea means','Why we use it','Follow one example','Practice Together','Check this step'].forEach(x=>assert(html.includes(x)));
});
test('supported practice requires a learner response',()=>{assert(html.includes('id="supportedAns"'));assert(html.includes('checkSupported()'))});
test('guided is gated by supported evidence',()=>assert(html.includes("if(!areaEvidence(currentArea().id).supportedPassed)")));
test('independent is denied without supported and guided evidence',()=>{
  assert(!D.independentAllowed(null,{supportedPassed:true,guidedPassed:false}));
  assert(D.independentAllowed(null,{supportedPassed:true,guidedPassed:true}));
});
test('render gate cannot skip unseen concept or Watch steps',()=>{
  assert(html.includes('if(!e.conceptSeen)app.instructionStep=0'));
  assert(html.includes('else if(!e.watchSeen)app.instructionStep=Math.min(app.instructionStep,1)'));
});
test('active remediation denies independent even with prior evidence',()=>{
  const skill=SM.createSkill('logs');SM.handleIdk(skill,SM.IDK_REASONS.DONT_UNDERSTAND,'log:item','powers_of_ten',1);
  assert(!D.independentAllowed(skill,{supportedPassed:true,guidedPassed:true}));
  assert.equal(D.safeMathPhase('independent',skill,{supportedPassed:true,guidedPassed:true}),'mini');
});
test('reload preserves remediation and downgrades unsafe independent phase',()=>{
  const skill=SM.createSkill('logs');SM.handleIdk(skill,SM.IDK_REASONS.DONT_KNOW_START,'i','powers_of_ten',1);
  const restored=D.safeSession({mathPhase:'independent',studentModel:{logs:skill},mathEvidence:{logs:{supportedPassed:true,guidedPassed:true}}},{mathEvidence:{},studentModel:{},mathStatus:{},chemResults:{},misconceptionLog:{}});
  assert(SM.isRemediationActive(restored.studentModel.logs));assert.equal(D.safeMathPhase(restored.mathPhase,restored.studentModel.logs,restored.mathEvidence.logs),'mini');
});
test('failed prerequisite cannot exit remediation',()=>{
  const skill=SM.createSkill('logs');SM.handleIdk(skill,SM.IDK_REASONS.DONT_UNDERSTAND,'higher','powers_of_ten',1);
  SM.recordRemediationCheck(skill,false,'power-check',2);assert.equal(SM.exitRemediation(skill,[{id:'fresh'}]).reason,'prerequisite_not_yet_passed');
});
test('passed prerequisite permits a fresh higher-level item',()=>{
  const skill=SM.createSkill('logs');SM.handleIdk(skill,SM.IDK_REASONS.DONT_UNDERSTAND,'higher','powers_of_ten',1);
  SM.recordRemediationCheck(skill,true,'power-check',2);assert(SM.exitRemediation(skill,[{id:'fresh'}]).allowed);
});
test('IDK makes Dr Merissa choose teaching automatically',()=>{assert(html.includes("routeIdk('concept');"));assert(!html.includes('What would help?<div'))});
test('repeated errors can switch representation',()=>{
  const skill=SM.createSkill('algebra');SM.handleWrongAttempt(skill,'a','CONCEPT','a',1,'0');const r=SM.handleWrongAttempt(skill,'b','CONCEPT','b',2,'0');assert.equal(r.action,'SWITCH_REPRESENTATION');
});
test('fresh questions render without prior teaching or answers',()=>{
  assert(sessionSource.includes('transientInstruction = null'));
  const independentBlock=html.slice(html.indexOf('if(app.mathPhase==="probe"'),html.indexOf('if(app.mathPhase==="mini")'));
  assert(!independentBlock.includes('area.refresh'));assert(!independentBlock.includes('area.mini'));assert(!independentBlock.includes('mathAnswers'));
});
test('log estimation supplies no-calculator reference values',()=>{
  assert(html.includes('Reference for this no-calculator item:'));
  ['log(2) ≈ 0.30','log(3) ≈ 0.48','log(5) ≈ 0.70'].forEach(x=>assert(html.includes(x)));
});
test('log instruction begins with inverse powers before estimation',()=>{assert(html.includes('If 10³ = 1000, then log(1000) = 3'))});
test('math and chemistry state remain separate across menu navigation',()=>{
  const saved={step:'menu',mathPhase:'mini',instructionStep:2,mathEvidence:{logs:{conceptSeen:true,watchSeen:true,supportedPassed:false,guidedPassed:false}},chemistryPhase:'method',chemResults:{h2o:false},studentModel:{},mathStatus:{},misconceptionLog:{}};
  const restored=D.safeSession(saved,{mathEvidence:{},chemResults:{},studentModel:{},mathStatus:{},misconceptionLog:{}});
  assert.equal(restored.instructionStep,2);assert.equal(restored.chemistryPhase,'method');assert(!restored.mathEvidence.logs.supportedPassed);
});
test('switching subjects cannot complete Day 1',()=>{
  const s={requireCompletionGate:true,mathAreas:['logs'],mathStatus:{},chemResults:{h2o:true,methanol:true,why:true,mastery:true,masteryWhy:true}};assert(!D.completeDay(s));
});
test('transient stale hint answer and teaching state are not restored',()=>{
  const restored=D.safeSession({stage:{answer:'5'},gymCurrent:{answer:'5'},transientInstruction:{workedAnswer:'5'}},{mathEvidence:{},studentModel:{},mathStatus:{},chemResults:{},misconceptionLog:{}});
  assert.equal(restored.stage,null);assert.equal(restored.gymCurrent,null);assert.equal(restored.transientInstruction,null);
});
test('fabricated navigation state fails safely',()=>{
  const restored=D.safeSession({step:'formal-charge',mathPhase:'independent_bypass',mathIndex:999},{step:'intro',mathPhase:'refresh',mathAreas:['logs'],mathEvidence:{},studentModel:{},mathStatus:{},chemResults:{},misconceptionLog:{}});
  assert.equal(restored.step,'intro');assert.equal(restored.mathPhase,'refresh');assert.equal(restored.mathIndex,0);
});
test('full gold loop can earn independent access only after gates',()=>{
  const skill=SM.createSkill('logs'),e={supportedPassed:false,guidedPassed:false};SM.handleIdk(skill,SM.IDK_REASONS.DONT_UNDERSTAND,'higher','powers_of_ten',1);
  assert(!D.independentAllowed(skill,e));SM.recordRemediationCheck(skill,true,'power-check',2);SM.exitRemediation(skill,[{id:'fresh'}]);e.supportedPassed=true;assert(!D.independentAllowed(skill,e));e.guidedPassed=true;assert(D.independentAllowed(skill,e));
});
console.log(`=== SUMMARY: ${passed} passed, 0 failed ===`);
