'use strict';
const assert=require('assert'),fs=require('fs');
const D=require('./course-units/unit2/test2/test2-data-complete.js');
const S=require('./course-units/unit2/test2/test2-support.js');
let passed=0;function ok(v,m){assert(v,m);passed++;console.log('PASS  '+m);}
function allItems(l){let out=[];out.push(...l.probe);l.watch.forEach(x=>out.push(x.check));out.push(...l.concept,...l.build,...l.guided,...l.independent,...l.transfer,l.intervening,...l.retrieval);Object.keys(l.repairChecks).forEach(k=>out.push(l.repairChecks[k]));return out.filter(Boolean);}
function supportedItems(l){let out=[];out.push(...l.probe);l.watch.forEach(x=>out.push(x.check));out.push(...l.concept,...l.build,...l.guided);Object.keys(l.repairChecks).forEach(k=>out.push(l.repairChecks[k]));return out.filter(Boolean);}
function repairDomainItems(l){let out=[];out.push(...l.probe);l.watch.forEach(x=>out.push(x.check));out.push(...l.concept,...l.build,...l.guided,...l.independent,...l.transfer,...l.retrieval);return out.filter(Boolean);}
function codes(l){let set=new Set();repairDomainItems(l).forEach(i=>(i.fields||[]).forEach(f=>set.add(f.errorCode)));return [...set];}
function norm(v){return String(v==null?'':v).trim().toLowerCase().replace(/\s+/g,' ');}
function exactFactExposure(activity,retrieval){
  if(!activity||!retrieval)return false;
  return (activity.fields||[]).some(af=>(retrieval.fields||[]).some(rf=>{
    if(!af.errorCode||af.errorCode!==rf.errorCode)return false;
    const aa=new Set((af.accepted||[]).map(norm));
    return (rf.accepted||[]).some(x=>aa.has(norm(x)));
  }));
}
console.log('=== TEST 2 SCOPE ===');
ok(D.META.unit==='Unit 2','Test 2 belongs to Unit 2');
ok(D.META.title==='Cumulative Test 2 Tutor','Test 2 identity is cumulative tutor');
ok(D.META.status==='fresh-syllabus-based-not-professor-issued','bank is explicitly provisional fresh syllabus-based evidence');
ok(/professor-issued Test 2 practice supersedes/i.test(D.META.sourceRule),'current professor-issued Test 2 practice is declared higher priority when provided');
ok(JSON.stringify(D.ORDER)===JSON.stringify(['stereo-relationships','configuration-mixed','optical-mixtures','resonance-mixed','proton-pka','equilibrium-base','stability-mixed','reagent-lewis']),'eight mixed skill families are frozen in intended order');
ok(D.lessons().length===8,'all eight Test 2 families resolve');
console.log('\n=== FULL LEARNING LADDER AND FRESHNESS ===');
D.lessons().forEach(l=>{
 ok(l.probe.length>=2,l.id+' has at least two diagnostic probes');
 ok(l.watch.length>=2&&l.watch.every(x=>x.check),l.id+' has Watch teaching with checks');
 ok(l.concept.length>=1,l.id+' has supported concept checks');
 ok(l.build.length>=1,l.id+' has Build Together');
 ok(l.guided.length>=1,l.id+' has Guided practice');
 ok(l.independent.length>=4,l.id+' has at least four fresh cold candidates');
 ok(l.explanation&&l.explanation.prompt&&l.explanation.requiredGroups.length>=2,l.id+' has Explain Why reasoning contract');
 ok(l.transfer.length>=1,l.id+' has Transfer');
 ok(!!l.intervening,l.id+' has meaningful intervening chemistry');
 ok(l.retrieval.length>=2,l.id+' has Later Retrieval bank');
 const ids=allItems(l).map(x=>x.id);ok(new Set(ids).size===ids.length,l.id+' never reuses an item ID across phases');
 const sp=new Set(supportedItems(l).map(x=>x.prompt));ok(l.independent.every(x=>!sp.has(x.prompt)),l.id+' independent prompts are not recycled supported prompts');
 const ip=new Set(l.independent.map(x=>x.prompt));ok(l.transfer.every(x=>!ip.has(x.prompt)),l.id+' Transfer is fresh from Independent');
 const it=new Set([...l.independent,...l.transfer].map(x=>x.prompt));ok(l.retrieval.every(x=>!it.has(x.prompt)),l.id+' Retrieval is fresh from Independent and Transfer');
 const tags=new Set();l.independent.forEach(x=>(x.tags||[]).forEach(t=>tags.add(t)));l.requiredTags.forEach(t=>ok(tags.has(t),l.id+' cold bank covers required tag '+t));
 codes(l).forEach(code=>{ok(!!l.repairChecks[code],l.id+' has a smaller repair check for '+code);ok(!!l.reteach[code],l.id+' has targeted reteaching for '+code);S.REASONS.forEach(r=>{const x=S.route(l,code,r.id);ok(x&&x.text&&x.text.length>20,l.id+' '+code+' routes '+r.id+' to meaningful support');});const alt=S.route(l,code,'explanation_not_making_sense');ok(/switch representation/i.test(alt.text),l.id+' '+code+' changes representation when explanation fails');});
});
console.log('\n=== CROSS-LESSON RETRIEVAL STAYS COLD ===');
const exposures=[];
D.lessons().forEach(target=>target.retrieval.forEach(r=>D.lessons().forEach(other=>{
 if(other.id!==target.id&&exactFactExposure(other.intervening,r))exposures.push(other.intervening.id+' -> '+r.id);
})));
ok(exposures.length===0,'no lesson intervening activity pre-exposes another lesson Later Retrieval fact'+(exposures.length?' ('+exposures.join(', ')+')':''));
console.log('\n=== EQUIVALENT-CONTRIBUTOR REPAIR IS DISTINCT ===');
const resonance=D.lesson('resonance-mixed');
ok(!!resonance.repairChecks.RANK_EQUIVALENT,'resonance mixed owns a repair for equal contributor weight');
ok(/symmetry-equivalent/.test(resonance.repairChecks.RANK_EQUIVALENT.prompt),'equivalent-contributor repair uses a fresh simpler symmetry check');
ok(/contribute equally/.test(resonance.reteach.RANK_EQUIVALENT),'equivalent-contributor reteach explicitly teaches equal weight');
ok(resonance.repairChecks.RANK_EQUIVALENT.id!=='T2RM-W2'&&resonance.repairChecks.RANK_EQUIVALENT.id!=='T2RM-R2','equivalent-contributor repair is not a reused Watch or Retrieval item');
ok(resonance.retrieval[1].fields[0].errorCode==='HYBRID_PARTIAL_BOND','resonance Later Retrieval no longer repeats equal-contributor fact exposed elsewhere');
console.log('\n=== COURSE-SPECIFIC REPAIR ROUTES ===');
ok(/chapter5/.test(S.courseHref('STEREO_RELATION')),'stereoisomer miss routes to Chapter 5');
ok(/chapter5/.test(S.courseHref('SPECIFIC_ROTATION_SETUP')),'optical-mixture miss routes to Chapter 5');
ok(/chapter2-resonance/.test(S.courseHref('RANK_VALIDITY')),'resonance miss routes to Chapter 2');
ok(/chapter3/.test(S.courseHref('PKA_ACID')),'pKa miss routes to Chapter 3');
ok(/chapter3/.test(S.courseHref('EQ_DIRECTION')),'equilibrium miss routes to Chapter 3');
ok(/chapter3/.test(S.courseHref('COMBINED_WEIGHT')),'stability miss routes to Chapter 3');
ok(/chapter3/.test(S.courseHref('LEWIS_ACCEPTOR')),'Lewis acid-base miss routes to Chapter 3');
console.log('\n=== INTERVENING CHEMISTRY STAYS OUTSIDE LOCAL REPAIR DOMAIN ===');
D.lessons().forEach(l=>{const domain=new Set(codes(l)),activityCodes=[];(l.intervening.fields||[]).forEach(f=>activityCodes.push(f.errorCode));activityCodes.forEach(code=>ok(!domain.has(code)||!!l.repairChecks[code],l.id+' different-chemistry activity does not silently expand the lesson repair contract'));});
console.log('\n=== FROZEN ENGINE BOUNDARY ===');
['course-units/unit2/test2/test2-data.js','course-units/unit2/test2/test2-data-complete.js','course-units/unit2/test2/test2-support.js','course-units/unit2/test2/test2-engine-bridge.js'].forEach(p=>{const s=fs.readFileSync(p,'utf8');ok(!/evaluateMastery|MIN_RETRIEVAL_DELAY_MS\s*=|recordIndependentAttempt\s*=/.test(s),p+' does not reimplement mastery or retrieval policy');});
ok(!fs.existsSync('course-units/unit2/test2/test2-engine.js'),'Test 2 contains no copied mastery engine');
console.log('\n=== SUMMARY: '+passed+' passed, 0 failed ===');