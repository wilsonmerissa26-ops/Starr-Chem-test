'use strict';
var fs=require('fs'),passed=0,failed=0;
var C2=require('./course-units/unit2/chapter2-resonance/chapter2-evidence-data.js');
var C2S=require('./course-units/unit2/chapter2-resonance/chapter2-support.js');
var C3=require('./course-units/unit2/chapter3/chapter3-evidence-data.js');
var C3S=require('./course-units/unit2/chapter3/chapter3-support.js');
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function norm(s){return String(s||'').trim().toLowerCase().replace(/\s+/g,' ');}
function items(l){var out=[];['probe','concept','build','guided','independent','transfer','retrieval'].forEach(function(k){(l[k]||[]).forEach(function(x){out.push({phase:k,item:x});});});(l.watch||[]).forEach(function(w){if(w.check)out.push({phase:'watch',item:w.check});});return out;}
function errorCodes(l){var set={};items(l).forEach(function(x){(x.item.fields||[]).forEach(function(f){if(f.errorCode)set[f.errorCode]=true;});});return Object.keys(set);}
function phaseIds(l,phases){var out=[];items(l).forEach(function(x){if(phases.indexOf(x.phase)!==-1&&x.item&&x.item.id)out.push(x.item.id);});return out;}
function phasePrompts(l,phases){var out=[];items(l).forEach(function(x){if(phases.indexOf(x.phase)!==-1&&x.item&&x.item.prompt)out.push(norm(x.item.prompt));});return out;}
function contract(name,D,S){
 console.log('\n=== '+name+' FULL CURRICULUM CONTRACT ===');
 D.lessonIds().forEach(function(id){
   var l=D.lesson(id),prefix=name+' '+id;
   ok(!!l,prefix+' resolves');
   ok(l.probe.length>=2,prefix+' has at least two diagnostic probes');
   ok(l.watch.length>=2&&l.watch.every(function(w){return !!w.check;}),prefix+' has Watch teaching with supported checks');
   ok(l.concept.length>0,prefix+' has supported concept checks');
   ok(l.build.length>0,prefix+' has Build Together');
   ok(l.guided.length>0,prefix+' has Guided practice');
   ok(l.independent.length>=4,prefix+' has at least four cold candidates');
   ok(l.explanation&&l.explanation.prompt&&Array.isArray(l.explanation.requiredGroups)&&l.explanation.requiredGroups.length>0,prefix+' has Explain Why evidence');
   ok(l.transfer.length>0,prefix+' has Transfer');
   ok(!!l.intervening,prefix+' has meaningful intervening chemistry');
   ok(l.retrieval.length>=2,prefix+' has Later Retrieval bank');

   var all=items(l),ids=all.map(function(x){return x.item.id;}),unique=new Set(ids);
   ok(ids.length===unique.size,prefix+' never reuses an item ID across learning/evidence phases');
   var supportedIds=new Set(phaseIds(l,['probe','watch','concept','build','guided']));
   ok(l.independent.every(function(x){return !supportedIds.has(x.id);}),prefix+' independent bank never recycles supported item IDs');
   var supportedPrompts=new Set(phasePrompts(l,['probe','watch','concept','build','guided']));
   ok(l.independent.every(function(x){return !supportedPrompts.has(norm(x.prompt));}),prefix+' independent bank never repeats a supported prompt verbatim');
   var indIds=new Set(l.independent.map(function(x){return x.id;}));
   var indPrompts=new Set(l.independent.map(function(x){return norm(x.prompt);}));
   ok(l.transfer.every(function(x){return !indIds.has(x.id)&&!indPrompts.has(norm(x.prompt));}),prefix+' Transfer is fresh from Independent');
   var used=new Set(l.independent.concat(l.transfer).map(function(x){return x.id;}));
   var usedP=new Set(l.independent.concat(l.transfer).map(function(x){return norm(x.prompt);}));
   ok(l.retrieval.every(function(x){return !used.has(x.id)&&!usedP.has(norm(x.prompt));}),prefix+' Retrieval is fresh from Independent and Transfer');

   var covered={};l.independent.forEach(function(x){(x.tags||[]).forEach(function(t){covered[t]=true;});});
   (l.requiredTags||[]).forEach(function(tag){ok(!!covered[tag],prefix+' cold bank covers required tag '+tag);});

   errorCodes(l).forEach(function(code){
     ok(!!l.repairChecks[code],prefix+' has simpler repair check for '+code);
     ok(!!l.reteach[code],prefix+' has targeted reteach for '+code);
     if(l.repairChecks[code]){
       var originals=all.filter(function(x){return (x.item.fields||[]).some(function(f){return f.errorCode===code;});}).map(function(x){return norm(x.item.prompt);});
       ok(originals.indexOf(norm(l.repairChecks[code].prompt))===-1,prefix+' repair '+code+' is not identical original prompt');
     }
     ok(!!S.label(code),prefix+' support label exists for '+code);
     S.REASONS.forEach(function(reason){var r=S.route(l,code,reason.id);ok(r&&r.errorCode===code&&String(r.text||'').length>18,prefix+' '+code+' routes '+reason.id+' to meaningful teaching');});
     var alt=S.route(l,code,'explanation_not_making_sense');
     ok(alt&&/switch representation/i.test(alt.text||''),prefix+' '+code+' changes representation when explanation fails');
   });
 });
}
contract('Chapter 2',C2,C2S);contract('Chapter 3',C3,C3S);
console.log('\n=== FROZEN ENGINE / EXISTING FOUNDATION BOUNDARY ===');
['course-units/unit2/chapter2-resonance/chapter2-data.js','course-units/unit2/chapter2-resonance/chapter2-evidence-data.js','course-units/unit2/chapter2-resonance/chapter2-support.js','course-units/unit2/chapter2-resonance/chapter2-engine-bridge.js','course-units/unit2/chapter3/chapter3-data.js','course-units/unit2/chapter3/chapter3-evidence-data.js','course-units/unit2/chapter3/chapter3-support.js','course-units/unit2/chapter3/chapter3-engine-bridge.js'].forEach(function(p){var s=fs.readFileSync(p,'utf8');ok(!/function\s+evaluateMastery|MIN_RETRIEVAL_DELAY_MS\s*=|recordIndependentAttempt\s*=/.test(s),p+' does not reimplement mastery/retrieval policy');});
ok(C2S.route(C2.lesson('arrow-reasoning'),'ARROW_SOURCE','forgot_prerequisite').foundationHref==='../../../day3/','Chapter 2 keeps Day 3 as resonance prerequisite repair');
ok(C3S.route(C3.lesson('pka-acidity'),'PKA_ACID','forgot_prerequisite').foundationHref==='../../../day4/','Chapter 3 keeps Day 4 as pKa prerequisite repair');
ok(C3S.route(C3.lesson('stability-induction'),'STABILITY_INDUCTION','forgot_prerequisite').foundationHref==='../../../day5/','Chapter 3 keeps Day 5 as stability prerequisite repair');
ok(C3S.route(C3.lesson('equilibrium-pka'),'EQ_DIRECTION','forgot_prerequisite').foundationHref==='../../../day6/','Chapter 3 keeps Day 6 as equilibrium prerequisite repair');
console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');if(failed)process.exit(1);
