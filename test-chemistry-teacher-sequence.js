var seq=require('./curriculum/astarryia/chemistry-lewis-teacher-sequence.js');
var T=require('./teacher-runtime.js');
let p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('chemistry sequence validates in universal runtime',T.validateSequence(seq));
var types=seq.steps.map(function(s){return s.type;});
ok('chemistry has narration',types.indexOf(T.ACTIONS.SAY)>=0);
ok('chemistry has meaningful animations',types.indexOf(T.ACTIONS.ANIMATE)>=0);
ok('chemistry has learner manipulation',types.indexOf(T.ACTIONS.LET_STUDENT_MANIPULATE)>=0);
ok('electron total is explicitly taught',seq.steps.some(function(s){return s.content==='5 + 3 = 8 valence electrons';}));
ok('live electron accounting is specified',seq.steps.some(function(s){return s.content==='8 available → 6 in bonds → 2 remaining';}));
ok('central atom rationale is narrated',seq.steps.some(function(s){return /Hydrogen can make only one bond/.test(s.text||'');}));
ok('lone pair is animated and not merely text',seq.steps.some(function(s){return s.animation==='place_lone_pair';}));
ok('build with me requires placing center',seq.steps.some(function(s){return s.expected&&s.expected.action==='place_center'&&s.expected.element==='N';}));
ok('build with me requires bonds',seq.steps.some(function(s){return s.expected&&s.expected.action==='bond';}));
ok('build with me requires lone pair action',seq.steps.some(function(s){return s.expected&&s.expected.action==='lone_pair';}));
ok('sequence explicitly continues into fresh practice',seq.steps.some(function(s){return /fresh molecules/.test(s.text||'');}));
ok('chemistry mastery policy requires multiple independent forms and transfer',seq.masteryPolicy.minIndependentCorrect>=3&&seq.masteryPolicy.minForms>=2&&seq.masteryPolicy.requireTransfer===true);
console.log('\nChemistry teacher sequence: '+p+' passed, '+f+' failed');if(f)process.exit(1);
