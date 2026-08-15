var A=require('./student-model-diagnosis-adapter.js');
var pass=0,fail=0;function ok(n,c){if(c){console.log('PASS  '+n);pass++;}else{console.log('FAIL  '+n);fail++;}}
var legacy={id:'algebra',attempts:[]};
A.ensureDiagnosisFields(legacy);
ok('legacy skill gains diagnosis fields',Array.isArray(legacy.diagnosticRecords)&&legacy.reasoningProfile);
A.recordDiagnosticEvidence(legacy,{itemId:'p1',rawResponse:'6/15/2',confirmedReasoningStep:'cross_products_preserve_proportion',errorCode:'PROP_CROSS_PRODUCT_GAP',representationHistory:['diagonal_product_animation'],repairCheckResult:true,transferResult:{itemId:'p2',correct:true},timestamp:100});
ok('record retained',legacy.diagnosticRecords.length===1&&legacy.diagnosticRecords[0].rawResponse==='6/15/2');
ok('reasoning profile updated',legacy.reasoningProfile.cross_products_preserve_proportion.observations===1);
ok('successful transfer becomes current evidence',A.hasCurrentEvidence(legacy,'cross_products_preserve_proportion')===true);
ok('mastered reasoning step is not unnecessarily retaught',A.choosePrerequisitesToReteach(legacy,['cross_products_preserve_proportion','fraction_orientation']).join(',')==='fraction_orientation');
console.log('\nStudent model diagnosis adapter: '+pass+' passed, '+fail+' failed');if(fail)process.exit(1);
