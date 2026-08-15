var E = require('./reasoning-diagnosis-engine.js');
var R = require('./reasoning-diagnosis-rules-day1.js');
var passed=0, failed=0;
function ok(name, cond){ if(cond){console.log('PASS  '+name);passed++;}else{console.log('FAIL  '+name);failed++;} }

// Algebra regression: raw answer is evidence, not permission to fake certainty.
var s = E.createDiagnosisSession({skillId:'prop', itemId:'p1', rawResponse:'6/15/2'});
var d = E.diagnose(s, R.proportion2x, {});
ok('ambiguous proportion response triggers probe', d.status===E.STATUS.NEEDS_PROBE);
ok('probe asks meaning of 2/x', d.probe && d.probe.id==='meaning_of_2_over_x');
var p = E.recordProbe(s, '2 ÷ x', R.proportion2x.resolveProbe);
ok('probe isolates cross-product reasoning gap', p.reasoningStep==='cross_products_preserve_proportion');
var repair = E.selectRepair(s, R.repairs, ['fraction_meaning']);
ok('repair explains why cross multiplication works', /multiplying both sides/.test(repair.explanation));
ok('repair does not force mastered prerequisite reteach', repair.prerequisitesToReteach.length===0);
var rep1=E.nextRepairRepresentation(s,repair), rep2=E.nextRepairRepresentation(s,repair);
ok('failed repair can switch representation', rep1!==rep2);
var micro=E.recordMicroCheck(s,true);
ok('successful micro-check returns to unresolved skill', micro.status===E.STATUS.RETURN_TO_SKILL);
var transfer=E.recordTransfer(s,'p2',true);
ok('transfer uses fresh item', transfer.itemId==='p2' && transfer.correct===true);
var threw=false; try{E.recordTransfer(s,'p1',true);}catch(e){threw=true;}
ok('originating item cannot masquerade as transfer',threw);

// First wrong intermediate step outranks generic final-answer guessing.
var s2=E.createDiagnosisSession({itemId:'a1',rawResponse:'7',workTrace:[{step:1,correct:true},{step:2,correct:false,errorCode:'SIGN_CONST',reasoningStep:'move_constant_sign'}]});
var d2=E.diagnose(s2,{signatures:[{id:'other',responses:['7'],reasoningStep:'generic',unambiguous:true}]},{});
ok('first wrong intermediate step wins',d2.reasoningStep==='move_constant_sign' && d2.source==='work_trace');

// Unknown bare answer: ask, never invent.
var s3=E.createDiagnosisSession({itemId:'u1',rawResponse:'purple'});
var d3=E.diagnose(s3,{signatures:[]},{});
ok('unknown bare answer requests work trace',d3.status===E.STATUS.NEEDS_WORK_TRACE);

// Log regression: isolate the exact broken link.
var s4=E.createDiagnosisSession({skillId:'logs',itemId:'l1',rawResponse:'-36'});
var d4=E.diagnose(s4,R.logScientific,{});
ok('log wrong answer asks where reasoning broke',d4.status===E.STATUS.NEEDS_PROBE && d4.probe.id==='log_breakdown_location');
var p4=E.recordProbe(s4,'Why log(10^-6) = -6',R.logScientific.resolveProbe);
ok('log probe isolates power-of-ten gap',p4.reasoningStep==='log_power_of_ten');
var r4=E.selectRepair(s4,R.repairs,[]);
ok('log repair teaches meaning, not just shortcut',/asks: 10 raised to what power/.test(r4.explanation));

// Student-model-compatible diagnostic record contains durable evidence.
E.nextRepairRepresentation(s4,r4); E.recordMicroCheck(s4,true); E.recordTransfer(s4,'l2',true);
var rec=E.buildStudentModelRecord(s4);
ok('diagnostic record retains confirmed reasoning step',rec.confirmedReasoningStep==='log_power_of_ten');
ok('diagnostic record retains representation and transfer',rec.representationHistory.length===1 && rec.transferResult.itemId==='l2');

console.log('\nReasoning diagnosis: '+passed+' passed, '+failed+' failed');
if(failed) process.exit(1);
