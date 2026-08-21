'use strict';
var fs=require('fs');
var R=require('./day3/resonance.js');
var p=0,f=0;
function ok(name,cond){if(cond){console.log('PASS  '+name);p++;}else{console.log('FAIL  '+name);f++;}}
function answerMap(item){
  var out={};
  item.fields.forEach(function(x){out[x.key]=x.type==='charge'?R.chargeText(x.answer):x.answer;});
  return out;
}

ok('Day 2 storage key is exact frozen key',R.DAY2_KEY==='dr-merissa-day2-formal-charge-v1');
ok('Day 3 uses separate storage key',R.DAY3_KEY==='dr-merissa-day3-resonance-v1');
ok('missing Day 2 state blocks opening',R.day2GatePlan(null).mode==='missing');
ok('unfinished Day 2 state blocks opening',R.day2GatePlan({status:'Guided'}).mode==='incomplete');
ok('Independent Day 2 gets cold retrieval',R.day2GatePlan({status:'Independent'}).mode==='cold');
ok('Developing Day 2 gets targeted repair',R.day2GatePlan({status:'Developing',errors:['N']}).mode==='repair'&&R.day2GatePlan({status:'Developing',errors:['N']}).repair==='N');
ok('latest Day 2 error drives repair',R.lastDay2Error({errors:['V','B','FC']})==='FC');
ok('transfer-only Day 2 failure becomes whole transfer repair',R.lastDay2Error({errors:[],transferRecords:[{id:'T1',error:'nitrogen'}]})==='transfer');
ok('Day 2 sum failure remains sum-specific',R.lastDay2Error({errors:[],transferRecords:[{id:'T1',error:'sum'}]})==='sum');

ok('three bounded formal-charge gate items exist',R.GATES.length===3);
ok('cold oxygen gate is +1',R.GATES[0].V-R.GATES[0].N-R.GATES[0].B===1&&R.GATES[0].FC===1);
ok('fresh nitrogen gate is +1',R.GATES[1].V-R.GATES[1].N-R.GATES[1].B===1&&R.GATES[1].FC===1);
ok('second fresh carbon gate is -1',R.GATES[2].V-R.GATES[2].N-R.GATES[2].B===-1&&R.GATES[2].FC===-1);
ok('gate diagnosis finds V first',R.gateDiagnosis(R.GATES[0],{V:'5',N:'2',B:'3',FC:'+1'})==='V');
ok('gate diagnosis finds N after V',R.gateDiagnosis(R.GATES[0],{V:'6',N:'4',B:'3',FC:'+1'})==='N');
ok('gate diagnosis finds B after V N',R.gateDiagnosis(R.GATES[0],{V:'6',N:'2',B:'2',FC:'+1'})==='B');
ok('gate diagnosis isolates FC arithmetic',R.gateDiagnosis(R.GATES[0],{V:'6',N:'2',B:'3',FC:'0'})==='FC');
ok('clean gate has no diagnosis',R.gateDiagnosis(R.GATES[0],{V:'6',N:'2',B:'3',FC:'+1'})===null);

['+1','1','positive 1','plus 1'].forEach(function(v){ok('charge parser accepts '+v,R.parseCharge(v)===1);});
['-1','−1','negative 1','minus 1'].forEach(function(v){ok('charge parser accepts '+v,R.parseCharge(v)===-1);});
ok('charge parser accepts zero',R.parseCharge('0')===0);

ok('vocabulary has five separate diagnostic terms',R.VOCAB.length===5);
ok('vocabulary includes contributor hybrid delocalized pi and arrow',R.VOCAB.map(function(x){return x.id;}).join(',')==='contributor,hybrid,delocalized,pi,arrow');

ok('teaching has fixed skeleton arrow allyl acetate ranking sequence',R.TEACH.map(function(x){return x.id;}).join(',')==='fixed,arrows,allyl,acetate,ranking');
ok('fixed-skeleton teaching check chooses same-connectivity pair',R.TEACH_CHECKS.fixed.answer==='pair_a');
ok('arrow teaching check starts at pi electrons not plus sign',R.TEACH_CHECKS.arrows.answer==='pi_pair');
ok('allyl teaching moves pi pair to C2-C3',R.TEACH_CHECKS.allyl.answer==='c2c3');
ok('acetate teaching protects carbon octet',R.TEACH_CHECKS.acetate.answer==='avoid_over_octet');
ok('carbonyl ranking teaching keeps incomplete-octet form valid but smaller',R.TEACH_CHECKS.ranking.answer==='valid_smaller');

ok('guided bank contains allyl anion and nitrite',R.GUIDED.length===2&&R.GUIDED[0].id==='G1'&&R.GUIDED[1].id==='G2');
ok('guided allyl source is C3 lone pair',R.GUIDED[0].steps[0].answer==='c3_lone_pair');
ok('guided allyl charge lands on C1',R.GUIDED[0].steps[4].answer==='c1');
ok('guided allyl total stays -1',R.GUIDED[0].steps[5].answer==='-1');
ok('guided nitrite N formal charge is 0',R.GUIDED[1].steps[4].answer==='0');
ok('guided nitrite single O charge is -1',R.GUIDED[1].steps[5].answer==='-1');
ok('guided nitrite total is -1',R.GUIDED[1].steps[6].answer==='-1');
ok('guided nitrite contributors are equivalent',R.GUIDED[1].steps[7].answer==='yes');

ok('independent bank has six unique items',R.ITEMS.length===6&&new Set(R.ITEMS.map(function(x){return x.id;})).size===6);
R.ITEMS.forEach(function(item){ok(item.id+' keyed answer passes full diagnosis',R.diagnoseItem(item,answerMap(item))===null);});
ok('I1 rejects moved hydrogen as connectivity change',R.ITEMS[0].fields[0].answer==='not_resonance'&&R.ITEMS[0].fields[0].code==='CONNECTIVITY_CHANGED');
ok('I2 moves charge specifically to C2',R.ITEMS[1].fields.find(function(x){return x.key==='chargeAtom';}).answer==='c2');
ok('I2 total remains -1',R.ITEMS[1].fields.find(function(x){return x.key==='total';}).answer===-1);
ok('I3 formate carbon is neutral',R.ITEMS[2].fields.find(function(x){return x.key==='carbonFC';}).answer===0);
ok('I3 old double oxygen becomes -1',R.ITEMS[2].fields.find(function(x){return x.key==='oldDoubleOFC';}).answer===-1);
ok('I3 is heteroatom and equivalent evidence',R.ITEMS[2].tags.indexOf('heteroatom')>=0&&R.ITEMS[2].tags.indexOf('equivalent')>=0);
ok('I4 neutral carbonyl is larger',R.ITEMS[3].fields.find(function(x){return x.key==='major';}).answer==='neutral');
ok('I4 keeps charge-separated carbon octet as incomplete not over-octet',R.ITEMS[3].fields.find(function(x){return x.key==='separatedOctet';}).answer==='incomplete');
ok('I5 rejects nonadjacent proposed move',R.ITEMS[4].fields[0].answer==='invalid'&&R.ITEMS[4].fields[0].code==='NOT_ADJACENT');
ok('I6 nitro N formal charge is +1',R.ITEMS[5].fields.find(function(x){return x.key==='nFC';}).answer===1);
ok('I6 nitro total is zero',R.ITEMS[5].fields.find(function(x){return x.key==='total';}).answer===0);
ok('I6 nitro contributors are equivalent',R.ITEMS[5].fields.find(function(x){return x.key==='equivalent';}).answer==='yes');

var wrongI2=answerMap(R.ITEMS[1]);wrongI2.source='minus_sign';
ok('I2 arrow tail empty diagnosed before later fields',R.diagnoseItem(R.ITEMS[1],wrongI2)==='ARROW_TAIL_EMPTY');
wrongI2=answerMap(R.ITEMS[1]);wrongI2.newBond='c2_c3';
ok('I2 nonadjacent/wrong destination diagnosed',R.diagnoseItem(R.ITEMS[1],wrongI2)==='NOT_ADJACENT');
wrongI2=answerMap(R.ITEMS[1]);wrongI2.oldPi='none';
ok('I2 missed second arrow diagnosed as octet issue',R.diagnoseItem(R.ITEMS[1],wrongI2)==='OCTET_EXCEEDED');
wrongI2=answerMap(R.ITEMS[1]);wrongI2.chargeAtom='c4';
ok('I2 wrong formal-charge placement diagnosed',R.diagnoseItem(R.ITEMS[1],wrongI2)==='FC_MISMATCH');

ok('helped item cannot count clean',R.masteryCreditAllowed(1,false)===false);
ok('wrong then correct cannot count clean',R.masteryCreditAllowed(0,true)===false);
ok('cold first attempt can count clean',R.masteryCreditAllowed(0,false)===true);

var clean123=R.ITEMS.slice(0,3).map(function(x){return{id:x.id,correct:true,clean:true,tags:x.tags.slice()};});
var ev=R.sufficientEvidence(clean123,true);
ok('I1 I2 I3 clean satisfy bounded evidence',ev.met===true);
ok('evidence reports validity coverage',ev.validity===true);
ok('evidence reports generate coverage',ev.generate===true);
ok('evidence reports equivalent as rank/equivalent coverage',ev.rankOrEquivalent===true);
ok('evidence reports heteroatom coverage',ev.heteroatom===true);
ok('unresolved prerequisite blocks otherwise sufficient evidence',R.sufficientEvidence(clean123,false).met===false);
ok('supported correct does not inflate clean count',R.sufficientEvidence(clean123.concat([{id:'I6',correct:true,clean:false,tags:R.ITEMS[5].tags}]),true).cleanCount===3);
ok('three clean without validity fail evidence',R.sufficientEvidence([clean123[1],clean123[2],{id:'I6',correct:true,clean:true,tags:R.ITEMS[5].tags}],true).met===false);

var streak=R.updateErrorStreak(null,'FC_MISMATCH');
ok('first repeated error does not switch representation',streak.count===1&&!streak.switchRepresentation);
streak=R.updateErrorStreak(streak,'FC_MISMATCH');
ok('second same error switches representation',streak.count===2&&streak.switchRepresentation);
streak=R.updateErrorStreak(streak,'NOT_ADJACENT');
ok('different error resets streak',streak.count===1&&streak.code==='NOT_ADJACENT');
ok('incomplete-octet ranking representation says valid not automatically invalid',/valid/i.test(R.representationText('INCOMPLETE_OCTET_RANK'))&&/full octet/i.test(R.representationText('INCOMPLETE_OCTET_RANK')));

ok('two genuinely different cold transfers exist',R.TRANSFERS.length===2&&R.TRANSFERS[0].id==='T1'&&R.TRANSFERS[1].id==='T2');
var t1=R.TRANSFERS[0],a1={
  source:'o2_lone_pair',newBond:'n_o2',oldPi:'n_o1',oldDest:'o1_atom',
  nFC:'+1',newDoubleOFC:'0',oldDoubleOFC:'-1',otherSingleOFC:'-1',total:'-1',equivalent:'yes'
};
ok('nitrate T1 accepts O2 source route',R.diagnoseTransfer(t1,a1,'The atom skeleton stayed the same while electron pairs moved, and the overall charge stayed -1.')===null);
var a1b=Object.assign({},a1,{source:'o3_lone_pair',newBond:'n_o3'});
ok('nitrate T1 also accepts equivalent O3 source route',R.diagnoseTransfer(t1,a1b,'The same atoms and connections remain while pi and lone-pair electrons move, so charge remains -1.')===null);
var a1bad=Object.assign({},a1,{source:'o2_lone_pair',newBond:'n_o3'});
ok('nitrate T1 rejects new bond that does not match chosen source',R.diagnoseTransfer(t1,a1bad,'The atom skeleton stayed the same while electrons moved and charge stayed -1.')==='NOT_ADJACENT');
a1bad=Object.assign({},a1,{nFC:'0'});
ok('nitrate T1 isolates N formal-charge mismatch',R.diagnoseTransfer(t1,a1bad,'The atom skeleton stayed the same while electrons moved and charge stayed -1.')==='FC_MISMATCH');
a1bad=Object.assign({},a1,{total:'0'});
ok('nitrate T1 isolates total-charge mismatch',R.diagnoseTransfer(t1,a1bad,'The atom skeleton stayed the same while electrons moved and charge stayed -1.')==='CHARGE_SUM');
ok('nitrate explanation rejects bare answer',R.explanationLooksRight('It is resonance.',t1.explanation)===false);

var t2=R.TRANSFERS[1],a2={
  source:'n_lone_pair',newBond:'c_n',oldPi:'c_o',oldDest:'o_atom',
  oFC:'-1',nFC:'+1',total:'0',major:'neutral_amide'
};
ok('amide T2 correct build and ranking passes',R.diagnoseTransfer(t2,a2,'The neutral amide is the larger contributor because both have octets, but the neutral contributor avoids charge separation and has fewer separated charges.')===null);
var a2bad=Object.assign({},a2,{source:'o_lone_pair'});
ok('amide T2 rejects wrong electron source',R.diagnoseTransfer(t2,a2bad,'The neutral amide is the larger contributor because it avoids charge separation.')==='ARROW_TAIL_EMPTY');
a2bad=Object.assign({},a2,{oFC:'0'});
ok('amide T2 isolates oxygen formal charge',R.diagnoseTransfer(t2,a2bad,'The neutral amide is the larger contributor because it avoids charge separation.')==='FC_MISMATCH');
ok('amide explanation requires ranking reason not label only',R.explanationLooksRight('Neutral amide is better.',t2.explanation)===false);

var js=fs.readFileSync('day3/resonance.js','utf8');
var html=fs.readFileSync('day3/index.html','utf8');
ok('Day 3 page loads its own resonance engine',html.indexOf('resonance.js')>=0);
ok('Day 3 page does not load Day 1 classroom',html.indexOf('classroom-v5.js')<0);
ok('Day 3 page does not load Day 2 engine',html.indexOf('formal-charge.js')<0);
ok('Day 3 runtime does not import or mutate frozen classroom code',js.indexOf('classroom-v5')<0&&js.indexOf('Day1Orchestrator')<0);
ok('Day 3 runtime reads Day 2 localStorage record',js.indexOf("localStorage.getItem(DAY2_KEY)")>=0);
ok('Day 3 runtime writes only separate Day 3 state key',js.indexOf("localStorage.setItem(DAY3_KEY")>=0);
ok('unfinished Day 2 record is blocked in browser flow',js.indexOf("mode==='incomplete'")>=0);
ok('wrong prerequisite retrieval requires a fresh gate',js.indexOf('gateNeedsFresh')>=0&&js.indexOf('state.gateIndex++')>=0);
ok('prerequisite gate is bounded and can stop',js.indexOf("state.screen='prerequisiteStop'")>=0);
ok('vocabulary reveal is separate from mastery evidence',js.indexOf('vocabReveal')>=0&&js.indexOf('Word gaps are recorded separately')>=0);
ok('guided explicitly never counts clean',js.indexOf('Guided is supported')>=0&&js.indexOf('never counts as clean independent mastery evidence')>=0);
ok('independent help has Hint First step Walkthrough',js.indexOf('Give me a hint')>=0&&js.indexOf('Give me the first step')>=0&&js.indexOf('Walk me through it')>=0);
ok('walkthrough is interactive stepwise',js.indexOf('renderWalkthrough')>=0&&js.indexOf('checkWalk')>=0&&js.indexOf('state.walkStep++')>=0);
ok('independent bank stops instead of modulo wrapping',js.indexOf('state.itemIndex>=ITEMS.length')>=0&&js.indexOf('%ITEMS.length')<0);
ok('wrong item stays on same structure for repair',js.indexOf('Stay on this same structure and repair the first mismatch')>=0);
ok('wrong transfer T1 routes to fresh amide transfer',js.indexOf('Use fresh amide transfer')>=0);
ok('T2 help ends Developing rather than granting mastery',js.indexOf("The fresh amide transfer required support")>=0&&js.indexOf("state.status='Developing'")>=0);
ok('successful cold transfer sets Independent',js.indexOf("state.status='Independent';state.screen='mastered'")>=0);
ok('runtime does not teach pKa or acid ranking',!/pka/i.test(js)&&!/acidity ranking/i.test(js));
ok('runtime never calls molecule-stage legacy renderer',js.indexOf('molecule-stage')<0);

console.log('\nDay 3 resonance runtime: '+p+' passed, '+f+' failed');
if(f)process.exit(1);
