'use strict';
var fs=require('fs');
var F=require('./day2/formal-charge.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

ok('methane carbon formal charge is 0',F.formalCharge('C',0,4)===0);
ok('hydronium oxygen formal charge is +1',F.formalCharge('O',2,3)===1);
ok('hydroxide oxygen formal charge is -1',F.formalCharge('O',6,1)===-1);
ok('ammonium nitrogen formal charge is +1',F.formalCharge('N',0,4)===1);
ok('carbonyl oxygen formal charge is 0',F.formalCharge('O',4,2)===0);
ok('three-bond one-lone-pair carbon is -1',F.formalCharge('C',2,3)===-1);
ok('neutral amine nitrogen is 0',F.formalCharge('N',2,3)===0);
ok('three-bond-order oxygen with one lone pair is +1',F.formalCharge('O',2,3)===1);
ok('triple plus single carbon is 0',F.formalCharge('C',0,4)===0);

['+1','1','positive 1','plus 1'].forEach(function(v){ok('charge parser accepts '+v,F.parseCharge(v)===1);});
['-1','−1','negative 1','minus 1'].forEach(function(v){ok('charge parser accepts '+v,F.parseCharge(v)===-1);});
ok('charge parser accepts zero',F.parseCharge('0')===0);
ok('whole-structure sum preserves signs',F.sumCharges([0,1,0,0])===1&&F.sumCharges([-1,0,0])===-1);

ok('diagnosis finds V first',F.diagnose(F.ITEMS[0],{V:'4',N:'0',B:'4',FC:'+1'})==='V');
ok('diagnosis finds N after correct V',F.diagnose(F.ITEMS[2],{V:'4',N:'1',B:'3',FC:'-1'})==='N');
ok('diagnosis finds B after correct V and N',F.diagnose(F.ITEMS[1],{V:'6',N:'4',B:'1',FC:'0'})==='B');
ok('diagnosis isolates arithmetic after correct components',F.diagnose(F.ITEMS[0],{V:'5',N:'0',B:'4',FC:'0'})==='FC');
ok('correct four-part work has no diagnosis',F.diagnose(F.ITEMS[0],{V:'5',N:'0',B:'4',FC:'+1'})===null);

ok('helped independent item cannot count clean',F.masteryCreditAllowed(1,false)===false);
ok('wrong then correct item cannot count clean',F.masteryCreditAllowed(0,true)===false);
ok('cold first-attempt correct can count clean',F.masteryCreditAllowed(0,false)===true);
var evidence=[
 {correct:true,clean:true,tags:['charged']},
 {correct:true,clean:true,tags:['multiple']},
 {correct:true,clean:true,tags:['neutral']}
];
ok('three clean with charged and multiple coverage is sufficient',F.sufficientEvidence(evidence).met===true);
ok('three clean without multiple-bond coverage is insufficient',F.sufficientEvidence([{correct:true,clean:true,tags:['charged']},{correct:true,clean:true,tags:['neutral']},{correct:true,clean:true,tags:['charged']}]).met===false);
ok('supported correct does not inflate evidence',F.sufficientEvidence(evidence.concat([{correct:true,clean:false,tags:['multiple','charged']}])).cleanCount===3);

ok('ownership check comes before shortcut and has three bookkeeping parts',F.OWNERSHIP_CHECK.length===3&&F.OWNERSHIP_CHECK.map(function(x){return x.id;}).join(',')==='lone,bonds,total');
ok('ownership check accepts 4 lone-pair plus 2 bond-owned electrons totaling 6',F.ownershipDiagnosis({lone:'4',bonds:'2',total:'6'})===null);
ok('ownership check diagnoses lone-pair ownership first',F.ownershipDiagnosis({lone:'2',bonds:'2',total:'6'})==='lone');
ok('ownership check diagnoses bond ownership before total',F.ownershipDiagnosis({lone:'4',bonds:'4',total:'8'})==='bonds');

ok('guided OH minus is six sequential steps including H and sum',F.GUIDED_STEPS.length===6&&F.GUIDED_STEPS[4].code==='H'&&F.GUIDED_STEPS[5].code==='sum');
['6','6','1','-1','0','-1'].forEach(function(v,i){ok('guided step '+(i+1)+' accepts its keyed response',F.guidedStepCorrect(i,v)===true);});
ok('guided sum rejects wrong overall ion total',F.guidedStepCorrect(5,'0')===false);

var walk=F.walkthroughSteps(F.ITEMS[4]);
ok('walkthrough decomposes independent work into V N B then FC',walk.length===4&&walk.map(function(x){return x.code;}).join(',')==='V,N,B,FC');
ok('walkthrough checks V without revealing later components',F.walkthroughStepCorrect(F.ITEMS[4],0,'6')===true&&F.walkthroughStepCorrect(F.ITEMS[4],0,'5')===false);
ok('walkthrough checks nonbonding electrons on the same item',F.walkthroughStepCorrect(F.ITEMS[4],1,'2')===true);
ok('walkthrough checks bond order on the same item',F.walkthroughStepCorrect(F.ITEMS[4],2,'3')===true);
ok('walkthrough checks signed FC last',F.walkthroughStepCorrect(F.ITEMS[4],3,'+1')===true);

var streak=F.updateErrorStreak(null,'N');
ok('first same-component miss does not switch representation',streak.code==='N'&&streak.count===1&&streak.switchRepresentation===false);
streak=F.updateErrorStreak(streak,'N');
ok('second same-component miss triggers representation switch',streak.code==='N'&&streak.count===2&&streak.switchRepresentation===true);
streak=F.updateErrorStreak(streak,'B');
ok('different component starts a fresh error streak',streak.code==='B'&&streak.count===1&&streak.switchRepresentation===false);

ok('independent bank has six unique fresh items',F.ITEMS.length===6&&new Set(F.ITEMS.map(function(x){return x.id;})).size===6);
ok('every independent key recomputes from V N B',F.ITEMS.every(function(x){return F.formalCharge(x.element,x.N,x.B)===x.FC;}));
ok('independent bank covers positive negative and neutral charge',F.ITEMS.some(function(x){return x.FC>0;})&&F.ITEMS.some(function(x){return x.FC<0;})&&F.ITEMS.some(function(x){return x.FC===0;}));
ok('independent bank covers multiple bonds',F.ITEMS.some(function(x){return x.tags.indexOf('multiple')>=0;}));
ok('teaching and guided contexts are not reused in independent bank',F.ITEMS.every(function(x){var s=x.context.toLowerCase();return s.indexOf('methane')<0&&s.indexOf('hydronium')<0&&s.indexOf('oh⁻')<0&&s.indexOf('hydroxide')<0;}));

ok('transfer 1 has correct carbon nitrogen and total charges',F.TRANSFERS[0].fields.carbon===0&&F.TRANSFERS[0].fields.nitrogen===1&&F.TRANSFERS[0].fields.total===1);
ok('transfer 2 is fresh negative nitrogen transfer',F.TRANSFERS[1].fields.nitrogen===-1&&F.TRANSFERS[1].fields.total===-1);
ok('T1 explanation accepts full V N B reasoning',F.explanationLooksRight('Nitrogen has 5 valence electrons, no lone pairs, and 4 bonds, so its formal charge is +1.',F.TRANSFERS[0])===true);
ok('T1 explanation rejects missing nonbonding-accounting step',F.explanationLooksRight('Nitrogen has 5 valence electrons and 4 bonds, so its formal charge is +1.',F.TRANSFERS[0])===false);
ok('T1 explanation rejects bare memorized answer',F.explanationLooksRight('Nitrogen is +1.',F.TRANSFERS[0])===false);
ok('T2 explanation accepts correct V N B reasoning',F.explanationLooksRight('N starts with 5 valence electrons, has 4 nonbonding electrons and 2 bonds, so 5 - 4 - 2 = -1.',F.TRANSFERS[1])===true);
ok('T2 explanation rejects numbers without component meaning',F.explanationLooksRight('5 minus 4 minus 2 equals -1.',F.TRANSFERS[1])===false);

var js=fs.readFileSync('day2/formal-charge.js','utf8');
var html=fs.readFileSync('day2/index.html','utf8');
var curriculum=fs.readFileSync('Day2_Curriculum.md','utf8');
ok('Day 2 page loads only its formal-charge engine',html.indexOf('formal-charge.js')>=0&&html.indexOf('classroom-v5.js')<0);
ok('Day 2 does not modify or depend on Day 1 classroom code',js.indexOf('classroom-v5')<0&&js.indexOf('Day1Orchestrator')<0);
ok('home does not reveal FC shortcut before ownership interaction',/First: electron ownership/.test(js)&&!/function home\(\)[\s\S]*?<div class="formula">FC = V/.test(js.split('function gate()')[0]));
ok('lesson step 1 routes to ownership before formula lesson',js.indexOf("state.lesson===0&&!state.ownershipComplete")>=0&&js.indexOf("state.screen='ownership'")>=0);
ok('guided practice is one step at a time rather than four boxes at once',js.indexOf('checkGuidedStep')>=0&&js.indexOf('Guided practice •')>=0);
ok('walk me through it runs an interactive step checker',js.indexOf('renderWalkthrough')>=0&&js.indexOf('checkWalkStep')>=0&&js.indexOf('Walkthrough • step')>=0);
ok('second same-component error changes representation',js.indexOf('switchRepresentation')>=0&&js.indexOf('changing the representation instead of repeating the same explanation')>=0);
ok('app stops independent bank instead of wrapping forever',js.indexOf('state.itemIndex>=ITEMS.length')>=0&&js.indexOf('state.itemIndex%ITEMS.length')<0);
ok('help contamination is visible in app policy',js.indexOf('This item remains supported practice')>=0||js.indexOf('supported practice')>=0);
ok('curriculum explicitly keeps resonance out of Day 2 scope',/does not teach resonance construction/i.test(curriculum));
ok('curriculum teaches formal charge as bookkeeping',/bookkeeping/i.test(curriculum)&&/FC = V − N − B/.test(curriculum));
ok('curriculum requires total-charge sum check',/sum of all formal charges must equal the overall charge/i.test(curriculum));

console.log('\nDay 2 formal charge: '+p+' passed, '+f+' failed');if(f)process.exit(1);
