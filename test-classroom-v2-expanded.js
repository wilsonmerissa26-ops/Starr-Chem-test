var E=require('./classroom-v2-engine.js');
var D=require('./classroom-v2-data.js');
var passed=0,failed=0;
function assert(label,cond){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}

// Home/lane independence
var s=E.freshState();
assert('fresh starts at classroom home',s.screen==='home');
E.openLane(s,'chem');
assert('chemistry can start first',s.screen==='chem'&&s.targeted.stage==='teach');
var chemSnapshot=JSON.stringify(s.chem);
E.goHome(s);E.openLane(s,'targeted');
assert('switching to math preserves chemistry',JSON.stringify(s.chem)===chemSnapshot);
assert('math can start after chemistry',s.screen==='targeted');

// Storage safety / sanitization
var restored=E.safeState({screen:'banana',targeted:{skill:'fake',stage:'wrong'}});
assert('bad saved screen resets home',restored.screen==='home');
assert('bad saved skill resets logs',restored.targeted.skill==='logs');
assert('bad saved stage resets teach',restored.targeted.stage==='teach');

// All six locked targeted math areas
assert('six locked targeted areas exist',E.TARGET_ORDER.length===6);
E.TARGET_ORDER.forEach(function(id){
  var skill=D.TARGETED[id];
  assert(id+' has teacher explanation',!!skill&&skill.teach.length>40);
  assert(id+' has meaningful multi-step watch',skill.watch.length>=3);
  assert(id+' has do-it-with-me item',!!skill.together&&skill.together.q.length>5);
  assert(id+' has at least 3 guided questions',skill.guided.length>=3);
  assert(id+' has at least 4 independent questions',skill.alone.length>=4);
  assert(id+' has fresh check questions',skill.fresh.length>=2);
  var ids=[].concat(skill.guided,skill.alone,skill.fresh).map(function(x){return x.id;});
  assert(id+' question ids are unique',new Set(ids).size===ids.length);
});
assert('logs include no-calculator references',/log\(2\).*0\.30/.test(D.TARGETED.logs.reference));
assert('algebra watch models same operation both sides',D.TARGETED.algebra.watch.some(function(x){return /both sides/i.test(x.say)}));
assert('scientific notation watch visibly changes exponent each move',D.TARGETED.sci.watch.length>=4);
assert('fractions watch changes to common denominator',D.TARGETED.fractions.watch.some(function(x){return /8\/12/.test(x.visual)}));
assert('units watch includes cancellation',D.TARGETED.units.watch.some(function(x){return /cancel/i.test(x.say)}));

// No single item completion
s=E.freshState();s.screen='targeted';s.targeted.stage='guided';s.targeted.guidedIndex=1;s.targeted.guidedCorrect=1;
assert('one answer cannot complete full targeted plan',E.noPrematureCompletion(s));

// Fresh item protection
s=E.freshState();E.recordSeen(s,'targeted','log-g1');
assert('seen item not eligible as fresh',!E.canUseFresh(s,'targeted','log-g1'));
assert('unseen item eligible as fresh',E.canUseFresh(s,'targeted','log-f1'));

// IDK is teaching route, not punishment
s=E.freshState();s.targeted.stage='alone';E.idk(s,'targeted');
assert('targeted IDK routes back to supported teaching',s.targeted.stage==='together');
s.chem.stage='fresh';E.idk(s,'chem');
assert('chem IDK routes back to guided',s.chem.stage==='guided');

// Skip cannot dead-end
s=E.freshState();s.screen='chem';s.chem.stage='guided';E.skipActivity(s,'chem','H2O');
assert('chem skip exits to home',s.screen==='home');
assert('chem skip records unresolved work',s.chem.unresolved.indexOf('H2O')!==-1);
s=E.freshState();s.screen='targeted';s.targeted.stage='guided';E.skipActivity(s,'targeted');
assert('math skip exits home',s.screen==='home');
assert('math skip marks current skill developing',s.targeted.status.logs==='Developing');
assert('math skip moves to next skill rather than loop',s.targeted.skill==='algebra');

// Foundation Academy is a real distinct curriculum
assert('foundation academy has multiple lessons',D.FOUNDATION.lessons.length>=3);
assert('foundation includes compensation',D.FOUNDATION.lessons.some(function(x){return x.id==='compensation'}));
assert('foundation includes decomposition',D.FOUNDATION.lessons.some(function(x){return x.id==='decompose'}));
assert('foundation includes estimation',D.FOUNDATION.lessons.some(function(x){return x.id==='estimate'}));
D.FOUNDATION.lessons.forEach(function(l){assert(l.id+' has watch sequence',l.watch.length>=4);assert(l.id+' has practice variety',l.practice.length>=2);});

// Chemistry teaching and animation data
assert('chemistry teach covers valence electrons',D.CHEM.teach.some(function(x){return /Valence/i.test(x.title)}));
assert('chemistry teach covers bonds as two electrons',D.CHEM.teach.some(function(x){return /bond uses two/i.test(x.title)}));
assert('NH3 watch has at least five visual states',D.CHEM.watchNH3.length>=5);
assert('NH3 watch begins empty of bonds',D.CHEM.watchNH3[0].bonds===0);
assert('NH3 watch ends with 3 bonds',D.CHEM.watchNH3[D.CHEM.watchNH3.length-1].bonds===3);
assert('NH3 watch ends with lone pair',D.CHEM.watchNH3[D.CHEM.watchNH3.length-1].pairs===1);
assert('NH3 electron accounting ends at 8 used',D.CHEM.watchNH3[D.CHEM.watchNH3.length-1].used===8);
assert('build together is explicitly stepwise',D.CHEM.buildNH3.length>=8);
assert('guided chemistry includes H2O and CH3OH',D.CHEM.guided.map(function(x){return x.name}).join('|')==='H₂O|CH₃OH');
assert('fresh chemistry mastery is CH3NH2',D.CHEM.fresh.name==='CH₃NH₂');

console.log('\n'+passed+' passed, '+failed+' failed');
if(failed)process.exit(1);
