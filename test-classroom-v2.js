const fs=require('fs');
const html=fs.readFileSync('classroom-v2.html','utf8');
let pass=0,fail=0;
function ok(name,cond){if(cond){console.log('PASS  '+name);pass++;}else{console.log('FAIL  '+name);fail++;}}

ok('preview uses isolated storage namespace',html.includes("const KEY='astarryia-classroom-v2-preview'"));
ok('production Day 1 storage key is not used by classroom V2',!html.includes("localStorage.getItem('astarryia-day1-v1')")&&!html.includes('localStorage.setItem("astarryia-day1-v1"')));
ok('home exposes Targeted Math Plan',html.includes('Targeted Math Plan'));
ok('home exposes Foundational Math Academy',html.includes('Foundational Math Academy'));
ok('home exposes Chemistry Foundation',html.includes('Chemistry Foundation'));
ok('universal teaching path is rendered',html.includes("'Teach','Watch','Do It With Me','Guided Practice','Try It Alone','Fresh Check'"));
ok('logs Watch contains visible forward power model',html.includes('10³ = 1,000'));
ok('logs Watch contains backward log model',html.includes('log(1,000) = 3'));
ok('logs practice includes multiple distinct items',html.includes("id:'l1'")&&html.includes("id:'l5'"));
ok('IDK changes representation instead of only grading wrong',html.includes("Let's change the representation"));
ok('Foundational Math includes compensation animation lesson',html.includes('Round 38 up to 40')&&html.includes('90 - 2 = 88'));
ok('Foundational Math explicitly compares strategies',html.includes('multiple ways')||html.includes('two different ways'));
ok('Chemistry Watch models NH3 step by step',html.includes('nextChemWatch')&&html.includes('First N-H bond')&&html.includes('The final 2 electrons become one lone pair on nitrogen'));
ok('Chemistry Build Together asks one action at a time',html.includes('I will only ask for one action at a time'));
ok('Chemistry Build Together has explicit skip route',html.includes('skipChemTogether()'));
ok('classroom menu is available from top bar',html.includes('onclick="goHome()"'));
ok('single fresh math success explicitly does not complete Day 1',html.includes('Day 1 itself is not complete'));

console.log('\n'+pass+' passed, '+fail+' failed');
if(fail)process.exit(1);
