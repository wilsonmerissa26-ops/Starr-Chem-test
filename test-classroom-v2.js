const fs=require('fs');
const html=fs.readFileSync('classroom-v2.html','utf8');
const app=fs.readFileSync('classroom-v2-app.js','utf8');
const data=require('./classroom-v2-data.js');
const engine=require('./classroom-v2-engine.js');
let pass=0,fail=0;
function ok(name,cond){if(cond){console.log('PASS  '+name);pass++;}else{console.log('FAIL  '+name);fail++;}}

ok('entry loads extracted curriculum',html.includes('classroom-v2-data.js'));
ok('entry loads progression engine',html.includes('classroom-v2-engine.js'));
ok('entry loads molecule correctness logic',html.includes('molecule-stage.js'));
ok('entry loads browser orchestration',html.includes('classroom-v2-app.js'));
ok('preview uses isolated storage namespace',app.includes("astarryia-classroom-v2-preview"));
ok('production Day 1 storage key is absent',!app.includes('astarryia-day1-v1')&&!html.includes('astarryia-day1-v1'));
ok('home exposes targeted math lane',app.includes('Targeted Math Plan'));
ok('home exposes foundational math lane',app.includes('Foundational Math Academy'));
ok('home exposes chemistry lane',app.includes('Chemistry'));
ok('all six targeted skills exist',engine.TARGET_ORDER.length===6&&engine.TARGET_ORDER.every(k=>data.TARGETED[k]));
ok('targeted flow contains six teaching stages',app.includes("stage==='teach'")&&app.includes("stage==='watch'")&&app.includes("stage==='together'")&&app.includes("stage==='guided'")&&app.includes("stage==='alone'")&&app.includes('targetFresh'));
ok('watch is tap controlled',app.includes('targetWatchNext')&&app.includes('Show next step'));
ok('IDK is an explicit teaching route',app.includes('targetIdk')&&app.includes("E.idk(state,'targeted')"));
ok('fresh items reject immediately seen questions',app.includes('canUseFresh'));
ok('foundational math is a distinct data-driven path',data.FOUNDATION.lessons.length>=3&&app.includes('foundationWatchNext'));
ok('chemistry teach is multi-step',data.CHEM.teach.length>=5&&app.includes('chemTeachNext'));
ok('NH3 Watch is multi-step and tap controlled',data.CHEM.watchNH3.length>=5&&app.includes('chemWatchNext'));
ok('chemistry Build Together is stepwise',data.CHEM.buildNH3.length>=8&&app.includes('chemTogetherAction'));
ok('guided chemistry includes H2O and CH3OH',data.CHEM.guided.map(x=>x.name).join('|')==='H₂O|CH₃OH');
ok('fresh chemistry is CH3NH2',data.CHEM.fresh.name==='CH₃NH₂');
ok('Build Alone output has no teacher block or electron counter',/function chemAlone\(\)\{[\s\S]*?return `([^`]|`[^;])*?`/.test(app)&&!app.slice(app.indexOf('function chemAlone'),app.indexOf('function checkChemAlone')).includes('teacher(')&&!app.slice(app.indexOf('function chemAlone'),app.indexOf('function checkChemAlone')).includes('counter'));
ok('every lane has classroom exit route',html.includes('ClassroomV2.goHome()')&&app.includes('actions()'));
ok('subject switching is independent',(()=>{let s=engine.freshState();engine.openLane(s,'chem');let c=JSON.stringify(s.chem);engine.goHome(s);engine.openLane(s,'targeted');return JSON.stringify(s.chem)===c;})());
ok('one answer cannot complete targeted plan',(()=>{let s=engine.freshState();s.targeted.stage='guided';s.targeted.guidedCorrect=1;return engine.noPrematureCompletion(s);})());

console.log('\n'+pass+' passed, '+fail+' failed');
if(fail)process.exit(1);
