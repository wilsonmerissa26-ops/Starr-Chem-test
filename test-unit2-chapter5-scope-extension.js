'use strict';

var fs=require('fs'),vm=require('vm');
var passed=0,failed=0;
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function run(ctx,p){vm.runInContext(fs.readFileSync(p,'utf8'),ctx,{filename:p});}

console.log('=== CHAPTER 5 CURRENT 5E SCOPE EXTENSION ===');
var ctx={console:console};ctx.globalThis=ctx;vm.createContext(ctx);
run(ctx,'student-model-idk-router.js');
run(ctx,'course-units/unit2/chapter5/chapter5-data.js');
run(ctx,'course-units/unit2/chapter5/chapter5-scope-data.js');
run(ctx,'course-units/unit2/chapter5/chapter5-support.js');
run(ctx,'course-units/unit2/chapter5/chapter5-scope-support.js');
run(ctx,'course-units/unit2/chapter5/chapter5-visual-data.js');
run(ctx,'course-units/unit2/chapter5/chapter5-scope-visual-data.js');

var D=ctx.Chapter5AdaptiveData,S=ctx.Chapter5AdaptiveSupport,V=ctx.Chapter5VisualData;
var ids=D.lessonIds();
ok(ids.length===10,'scope layer exposes ten Chapter 5 adaptive skills');
ok(ids.indexOf('enantiomer-mixtures-quantitative')!==-1,'specific rotation / enantiomeric excess is a first-class skill');
ok(ids.indexOf('other-chirality')!==-1,'chirality without a tetrahedral stereocenter is a first-class skill');
ok(D.META.status==='current-5e-scope-authored-not-live','expanded scope remains explicitly authored-not-live');
ok(/specific rotation/i.test(D.META.scopeNote)&&/other chirality/i.test(D.META.scopeNote),'scope note names the current-edition additions');

console.log('\n=== NEW LESSONS SATISFY THE FULL LEARNING LADDER ===');
['enantiomer-mixtures-quantitative','other-chirality'].forEach(function(id){
 var l=D.lesson(id);
 ok(!!l,id+' resolves');
 ok(l.probe.length>=2,id+' has two diagnostic probes');
 ok(l.watch.length>=2,id+' has Watch teaching with checks');
 ok(l.concept.length>=2,id+' has supported concept checks');
 ok(l.build.length>=2,id+' has Build Together steps');
 ok(l.guided.length>=2,id+' has Guided practice');
 ok(l.independent.length>=4,id+' has at least four cold candidates');
 ok(l.explanation&&l.explanation.requiredGroups.length>=3,id+' has Explain Why evidence');
 ok(l.transfer.length>=1,id+' has Transfer');
 ok(!!l.intervening,id+' has meaningful intervening chemistry');
 ok(l.retrieval.length>=2,id+' has fresh Later Retrieval');
 var supported=[].concat(l.probe,l.concept,l.build,l.guided,l.transfer), cold=l.independent.concat(l.retrieval);
 var supportedIds=supported.map(function(x){return x.id;});
 ok(cold.every(function(x){return supportedIds.indexOf(x.id)===-1;}),id+' never reuses a supported item ID as cold evidence');
});

console.log('\n=== QUANTITATIVE STEREOCHEMISTRY CONTRACT ===');
var mix=D.lesson('enantiomer-mixtures-quantitative');
ok(mix.requiredTags.indexOf('specific-rotation')!==-1,'specific rotation is required cold coverage');
ok(mix.requiredTags.indexOf('ee')!==-1,'enantiomeric excess is required cold coverage');
ok(mix.probe.some(function(x){return /observed rotation/i.test(x.prompt)&&/path length/i.test(x.prompt)&&/concentration/i.test(x.prompt);}), 'diagnostic distinguishes observed rotation, path length, and concentration');
ok(mix.independent.some(function(x){return /90%/.test(x.prompt)&&/10%/.test(x.prompt);}), 'cold bank includes composition-to-ee calculation');
ok(mix.independent.some(function(x){return /36% ee/i.test(x.prompt);}), 'cold bank includes ee-to-composition calculation');
ok(mix.reteach.SPECIFIC_ROTATION_SETUP.indexOf('path length')!==-1,'specific-rotation repair teaches the equation setup');
ok(mix.reteach.EE_COMPOSITION.indexOf('(100+ee)/2')!==-1,'ee-composition repair teaches the sum-and-difference rule');

console.log('\n=== OTHER CHIRALITY CONTRACT ===');
var other=D.lesson('other-chirality');
ok(other.requiredTags.indexOf('axial-chirality')!==-1,'axial chirality is required cold coverage');
ok(other.requiredTags.indexOf('dynamic-chirality')!==-1,'configuration-versus-conformation is required cold coverage');
ok(other.probe.some(function(x){return /tetrahedral carbon stereocenter/i.test(x.prompt);}), 'diagnostic explicitly rejects center-counting as the definition of chirality');
ok(other.guided.some(function(x){return /allene/i.test(x.prompt);}), 'guided bank includes an allene axial-chirality case');
ok(other.guided.some(function(x){return /interconvert/i.test(x.prompt);}), 'guided bank distinguishes stable stereochemistry from rapidly interconverting conformers');

console.log('\n=== SIX-WAY SUPPORT FOR EVERY NEW ERROR CODE ===');
var newCodes=['SPECIFIC_ROTATION_SETUP','EE_DIFFERENCE','EE_COMPOSITION','CHIRALITY_WITHOUT_CENTER','AXIAL_ALLENE','DYNAMIC_CONFORMER'];
newCodes.forEach(function(code){
 ok(!!S.label(code),code+' has learner-facing label');
 S.REASONS.forEach(function(r){
  var lesson=code.indexOf('EE_')===0||code==='SPECIFIC_ROTATION_SETUP'?mix:other;
  var route=S.route(lesson,code,r.id,'');
  ok(route&&route.text&&route.text.length>30,code+' routes '+r.id+' to meaningful teaching');
 });
 var lesson=code.indexOf('EE_')===0||code==='SPECIFIC_ROTATION_SETUP'?mix:other;
 ok(/Switch representation:/i.test(S.route(lesson,code,'explanation_not_making_sense','').text),code+' explanation failure changes representation');
});

console.log('\n=== STRUCTURED VISUAL COVERAGE ===');
['polarimetry-equation-a','ee-balance-a','ee-composition-a','allene-axis-a','chirality-whole-object-a','dynamic-mirror-a'].forEach(function(id){ok(!!V.get(id),id+' visual resolves');});
ok(V.get('polarimetry-equation-a').kind==='polarimetry-equation','specific rotation uses structured equation visual');
ok(V.get('ee-balance-a').kind==='ee-balance','ee uses structured balance visual');
ok(V.get('allene-axis-a').kind==='allene-axis','allene uses structured axis visual');
ok(V.get('dynamic-mirror-a').kind==='dynamic-conformer','dynamic chirality uses structured interconversion visual');
ok(D.PRODUCTION_CHECKPOINTS.length===12,'expanded Chapter 5 has twelve structured production checkpoints');
['C5-D9','C5-D10','C5-D11','C5-D12'].forEach(function(id){var p=D.PRODUCTION_CHECKPOINTS.find(function(x){return x.id===id;});ok(!!p,id+' exists');ok(p&&/structured/i.test(p.grading),id+' uses structured grading rather than arbitrary handwriting claims');});

console.log('\n=== LOCKED ENGINE ACCEPTS ALL TEN SKILLS ===');
run(ctx,'course-units/unit2/chapter5/chapter5-engine-bridge.js');
ok(ctx.Chapter5EngineBridge.prepare()===true,'scope data/support inject before the locked engine');
run(ctx,'course-units/unit1/test1/test1-engine.js');
var E=ctx.Chapter5EngineBridge.adopt();
ids.forEach(function(id){var s=E.createSession(id,1000);ok(s.lessonId===id&&s.skill.id===D.lesson(id).skillId,id+' creates a valid session on the shared Student Model');});
var helpSession=E.createSession('enantiomer-mixtures-quantitative',2000);E.setPhase(helpSession,'independent');
var help=E.requestColdHelp(helpSession,'explanation_not_making_sense',2100);
ok(help.accepted&&help.currentItemContaminated,'new quantitative cold IDK contaminates the current item');
ok(/Switch representation:/i.test(help.teaching),'new quantitative cold IDK teaches with a changed representation');

console.log('\n=== NO NEW MASTERY ENGINE ===');
ok(!fs.existsSync('course-units/unit2/chapter5/chapter5-engine.js'),'expanded scope still contains no copied Chapter 5 engine');
['chapter5-scope-data.js','chapter5-scope-support.js','chapter5-scope-visual-data.js'].forEach(function(name){var src=fs.readFileSync('course-units/unit2/chapter5/'+name,'utf8');ok(!/evaluateMastery|recordIndependentAttempt|MIN_RETRIEVAL_DELAY_MS/.test(src),name+' does not reimplement mastery or retrieval rules');});

console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');
if(failed)process.exit(1);
