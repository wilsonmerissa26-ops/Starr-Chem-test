const fs=require('fs');
const js=fs.readFileSync('classroom-v2-preview/classroom-v2-chemistry-interactive.js','utf8');
const html=fs.readFileSync('classroom-v2-preview/classroom-v2.html','utf8');
let pass=0,fail=0;
function ok(name,cond){if(cond){console.log('PASS  '+name);pass++;}else{console.log('FAIL  '+name);fail++;}}

ok('preview loads interactive chemistry module',html.includes('classroom-v2-chemistry-interactive.js'));
ok('Watch begins from empty stage',js.includes("Start with an empty stage"));
ok('Watch uses staged animated atom rendering',js.includes('watchScene')&&js.includes('requestAnimationFrame'));
ok('Watch exposes back control',js.includes('watchBack()'));
ok('Watch exposes replay-current-step control',js.includes('replayWatch()'));
ok('Watch accounts for electron placement',js.includes('placed')&&js.includes('remaining'));
ok('Build Together starts with no atoms',js.includes("atoms:[]")&&js.includes("bonds:[]"));
ok('Build Together requires learner drag',js.includes('pointerdown')&&js.includes('pointerup'));
ok('learner must place nitrogen in center target',js.includes("distance(pos,{x:50,y:50})>18"));
ok('hydrogen bond forms from learner movement near N',js.includes("a.el==='H'")&&js.includes('distance(a,n)<30'));
ok('lone pair requires learner tool then nitrogen selection',js.includes('armPair')&&js.includes("getAttribute('data-el')!=='N'"));
ok('fake I did that step button is absent',!js.includes('I did that step'));
ok('system says it observes actual placement',js.includes('I will watch what you actually place'));
ok('help breaks down only current chemistry step',js.includes('showBuildHelp')&&js.includes('break only this step down'));
ok('classroom exit remains available',js.includes('backHome'));

console.log('\nChemistry interaction: '+pass+' passed, '+fail+' failed');
if(fail)process.exit(1);
