"use strict";
const assert=require('assert');
const P=require('./course-units/unit1/test1/test1-production.js');
let passed=0;
function ok(name,cond){assert.ok(cond,name);console.log('PASS  '+name);passed++;}
function eq(name,a,b){assert.strictEqual(a,b,name);console.log('PASS  '+name);passed++;}

eq('six exam-relevant production checkpoints',P.TASKS.length,6);
assert.deepStrictEqual(P.TASKS.map(x=>x.id),[
  'c5-isomer-construction',
  'bondline-redraw-before-name',
  'newman-anti-gauche-production',
  'newman-energy-production',
  'cis14-chair-production',
  'trans14-chair-production'
],'exact production checkpoint set stays explicit');console.log('PASS  exact six production checkpoint ids');passed++;
let iso=P.taskFor('Guided: C5H12 has how many constitutional isomers?','Guided Practice');
ok('C5H12 guided item requires drawing all distinct skeletons',iso&&/all three distinct C5H12 carbon skeletons/i.test(iso.instruction));
ok('isomer construction checks duplicate-by-rotation risk',iso.checklist.some(x=>/duplicate.*rotation/i.test(x)));
ok('drawing gate rejects empty sketch',!P.satisfied(iso,0));
ok('drawing gate rejects trivial one-stroke mark',!P.satisfied(iso,1));
ok('drawing gate accepts substantial required practice threshold',P.satisfied(iso,iso.minSegments));
let name=P.taskFor('Guided: CH3-CH2-CH(CH3)-CH2-CH3. Parent length and methyl locant?','Guided Practice');
ok('nomenclature production requires bond-line redraw before naming',name&&/bond-line skeleton first/i.test(name.instruction));
let nw=P.taskFor('Guided: rank anti and gauche from lower to higher energy.','Guided Practice');
ok('Newman production requires both anti and gauche drawings',nw&&/both staggered butane Newman projections/i.test(nw.instruction));
ok('Newman checklist locks 180 vs 60 degree methyl separation',nw.checklist.some(x=>/180.*60/.test(x)));
let energy=P.taskFor('Guided: rank butane anti, gauche, CH3-H eclipsed, CH3-CH3 fully eclipsed from low to high.','Guided Practice');
ok('energy production requires sketching the profile',energy&&/energy profile/i.test(energy.instruction));
ok('energy checklist makes fully eclipsed methyl-methyl highest',energy.checklist.some(x=>/highest/.test(x)));
let cis=P.taskFor('Guided: cis-1,4-dimethylcyclohexane must have one methyl axial and one equatorial in a given chair. After a flip, how many are axial?','Guided Practice');
ok('chair production requires both conformers',cis&&/both chair conformers/i.test(cis.instruction));
ok('chair production preserves up/down through flip',cis.checklist.some(x=>/up\/down.*preserved/i.test(x)));
let trans=P.taskFor('Guided: trans-1,4-dimethylcyclohexane can have a diequatorial chair. Is diequatorial or diaxial lower in energy?','Guided Practice');
ok('trans-1,4 production explicitly draws diequatorial and diaxial',trans&&/diequatorial and diaxial/i.test(trans.instruction));
ok('production tasks do not attach to Cold Independent',P.taskFor(iso.prompt,'Cold Independent')===null);
ok('production tasks do not attach to Later Retrieval',P.taskFor(nw.prompt,'Later Retrieval · Cold')===null);
console.log('\n'+passed+' production-practice assertions passed');
