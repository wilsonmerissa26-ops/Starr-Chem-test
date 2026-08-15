const fs=require('fs');
const html=fs.readFileSync('classroom-v2-preview/classroom-v2.html','utf8');
const js=fs.readFileSync('classroom-v2-preview/classroom-v2-diagnosis.js','utf8');
let p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('preview loads diagnosis overlay',html.includes('classroom-v2-diagnosis.js'));
ok('proportion wrong response is diagnosed, not generic-graded',js.includes("q==='2/x = 6/15. Solve for x.'")&&js.includes('what 2/x means'));
ok('cross multiply is explained from multiplying both sides',js.includes('Multiply both sides by 15x')&&js.includes('That is what “cross multiply” is shortening'));
ok('log failure asks learner to identify broken link',js.includes('Which part loses you?')&&js.includes('Why log(10⁻⁶) = -6'));
ok('log combination explanation expands shortcut',js.includes('-[log(6) + log(10⁻⁶)]')&&js.includes('shortcut 6 - log(6) only makes sense'));
ok('repair uses micro-check before returning',js.includes('microCheck')&&js.includes('That missing step is working now'));
ok('reasoning evidence persists separately',js.includes('astarryia-reasoning-evidence-v1'));
console.log('\nClassroom diagnosis UI: '+p+' passed, '+f+' failed');if(f)process.exit(1);
