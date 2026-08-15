const fs=require('fs');
const html=fs.readFileSync('classroom-v2-preview/classroom-v2.html','utf8');
const js=fs.readFileSync('classroom-v2-preview/classroom-v2-diagnosis.js','utf8');
let p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('preview loads diagnosis overlay',html.includes('classroom-v2-diagnosis.js'));
ok('proportion wrong response is diagnosed, not generic-graded',js.includes("q==='2/x = 6/15. Solve for x.'")&&js.includes('what does 2/x mean'));
ok('cross multiply is explained from multiplying both sides',js.includes('multiply BOTH sides by 15x')&&js.includes('Cross multiply'));
ok('log failure asks learner to identify broken link',js.includes('Which part is where you lose the thread?')&&js.includes('Why log(10⁻⁶) = -6'));
ok('log combination explanation expands shortcut',js.includes('-[log(6) + log(10⁻⁶)]')&&js.includes('used as a shortcut'));
ok('repair uses micro-check before returning',js.includes('microCheck')&&js.includes('That missing step is working now'));
ok('reasoning evidence persists separately',js.includes('astarryia-reasoning-evidence-v1'));
ok('IDK is intercepted instead of blindly invoking old reset path',js.includes('window.ClassroomV2.targetIdk=interceptIdk'));
ok('IDK on log keeps exact problem and opens log probe',js.includes("q.indexOf('Estimate -log(6 × 10⁻⁶)')===0")&&js.includes('showLogProbe(raw)'));
ok('IDK on proportion keeps exact problem and opens proportion probe',js.includes("q==='2/x = 6/15. Solve for x.'")&&js.includes('showPropProbe(raw)'));
ok('generic IDK asks for current reasoning evidence instead of replaying practice',js.includes('Do not restart the lesson')&&js.includes('showGenericProbe(raw)'));
ok('unknown diagnosis requests work trace rather than inventing cause',js.includes('I do not have enough evidence to diagnose you yet')&&js.includes('captureWorkTrace'));
ok('repair explicitly promises no replay of old questions',js.includes('instead of replaying old questions'));
console.log('\nClassroom diagnosis UI: '+p+' passed, '+f+' failed');if(f)process.exit(1);
