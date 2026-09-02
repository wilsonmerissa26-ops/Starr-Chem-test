'use strict';

var fs=require('fs');
var D=require('./course-units/unit2/chapter5/chapter5-data.js');
var passed=0,failed=0;
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function norm(v){return String(v==null?'':v).trim().toLowerCase().replace(/\s+/g,' ');}
function fields(item){return item&&Array.isArray(item.fields)?item.fields:[];}
function itemsIn(lesson,phase){
  if(phase==='watch')return (lesson.watch||[]).map(function(x){return x.check;}).filter(Boolean);
  if(phase==='intervening')return lesson.intervening?[lesson.intervening]:[];
  return Array.isArray(lesson[phase])?lesson[phase]:[];
}
function allTargetItems(lesson){return ['probe','watch','concept','build','guided','independent','transfer','retrieval'].reduce(function(out,p){return out.concat(itemsIn(lesson,p));},[]);}
function acceptedContains(item,value){return fields(item).some(function(f){return (f.accepted||[]).map(norm).indexOf(norm(value))!==-1;});}

console.log('=== UNIT 2 / CHAPTER 5 CURRICULUM CONTRACT ===');

ok(D.META.course==='CHM 221 Organic Chemistry','course identity is CHM 221');
ok(D.META.unit==='Unit 2 / Test 2','module is explicitly Unit 2 / Test 2');
ok(D.META.chapter==='Chapter 5: Stereoisomerism','current authored chapter is Chapter 5 Stereoisomerism');
ok(D.META.syllabusWeek==='2026-09-07','Chapter 5 is aligned to week of Sep 7');
ok(D.META.test2Week==='2026-09-28','Unit 2 points toward Test 2 week of Sep 28');
ok(D.META.status==='curriculum-authored-not-live','content is not falsely marked live before runtime validation');

var expected=['isomer-classification','chirality-stereocenters','cip-rs','stereoisomer-relationships','meso-symmetry','fischer-projections','ez-alkenes','optical-activity'];
ok(JSON.stringify(D.lessonIds())===JSON.stringify(expected),'exact eight-skill Chapter 5 graph is frozen in intended order');
ok(D.lessons().length===8,'all eight Chapter 5 lessons resolve');

console.log('\n=== EVERY SKILL USES THE FULL LEARNING LADDER ===');
D.lessons().forEach(function(l){
  ok(l.probe.length>=2,l.id+' has at least two quick-diagnostic probes');
  ok(l.watch.length>=2&&l.watch.every(function(x){return !!x.check;}),l.id+' has teaching views with supported checks');
  ok(l.concept.length>=2,l.id+' has supported concept checks');
  ok(l.build.length>=2,l.id+' has Build Together content');
  ok(l.guided.length>=2,l.id+' has Guided content');
  ok(l.independent.length>=4,l.id+' has at least four fresh cold-item candidates');
  ok(l.explanation&&l.explanation.prompt&&l.explanation.requiredGroups.length>=3,l.id+' has relationship-preserving Explain Why content');
  ok(l.transfer.length>=1,l.id+' has Transfer content');
  ok(!!l.intervening,l.id+' has meaningful intervening chemistry');
  ok(l.retrieval.length>=2,l.id+' has a fresh Later Retrieval bank');
});

console.log('\n=== FRESHNESS / EVIDENCE DISCIPLINE ===');
D.lessons().forEach(function(l){
  var phases=['probe','watch','concept','build','guided','independent','transfer','retrieval'];
  var seenIds={},seenPrompts={};
  var duplicateId=false,duplicatePrompt=false;
  phases.forEach(function(p){itemsIn(l,p).forEach(function(item){
    if(seenIds[item.id])duplicateId=true;seenIds[item.id]=p;
    var n=norm(item.prompt);if(seenPrompts[n])duplicatePrompt=true;seenPrompts[n]=p;
  });});
  ok(!duplicateId,l.id+' never reuses an item ID across diagnostic/support/evidence phases');
  ok(!duplicatePrompt,l.id+' never repeats an identical prompt across diagnostic/support/evidence phases');

  var supported=new Set(['probe','watch','concept','build','guided'].reduce(function(out,p){return out.concat(itemsIn(l,p).map(function(x){return norm(x.prompt);}));},[]));
  ok(l.independent.every(function(x){return !supported.has(norm(x.prompt));}),l.id+' independent bank never recycles a supported prompt');
  var independent=new Set(l.independent.map(function(x){return norm(x.prompt);}));
  ok(l.transfer.every(function(x){return !independent.has(norm(x.prompt));}),l.id+' Transfer does not duplicate an Independent prompt');
  var transfer=new Set(l.transfer.map(function(x){return norm(x.prompt);}));
  ok(l.retrieval.every(function(x){return !independent.has(norm(x.prompt))&&!transfer.has(norm(x.prompt));}),l.id+' Retrieval does not duplicate Independent or Transfer prompts');

  var tags={};l.independent.forEach(function(item){(item.tags||[]).forEach(function(tag){tags[tag]=true;});});
  ok((l.requiredTags||[]).every(function(tag){return tags[tag];}),l.id+' independent bank covers every required evidence tag');
});

console.log('\n=== REPAIR COVERAGE ===');
D.lessons().forEach(function(l){
  var errorCodes={};
  allTargetItems(l).forEach(function(item){fields(item).forEach(function(f){if(f.errorCode)errorCodes[f.errorCode]=true;});});
  Object.keys(errorCodes).forEach(function(code){
    ok(!!l.repairChecks[code],l.id+' has a simpler repair check for '+code);
    ok(!!l.reteach[code],l.id+' has targeted reteaching for '+code);
    if(l.repairChecks[code]){
      var original=allTargetItems(l).map(function(x){return norm(x.prompt);});
      ok(original.indexOf(norm(l.repairChecks[code].prompt))===-1,l.id+' repair '+code+' is not the identical original question');
    }
  });
});

console.log('\n=== CHEMISTRY MISCONCEPTION GUARDS ===');
var ic=D.lesson('isomer-classification');
ok(acceptedContains(ic.independent[0],'constitutional isomers'),'different connectivity is classified as constitutional isomerism');
ok(acceptedContains(ic.independent[1],'stereoisomers'),'cis/trans fixed arrangements with same connectivity are classified as stereoisomers');
ok(acceptedContains(ic.independent[2],'identical'),'legal rotation/superposition can reveal identical structures');

var ch=D.lesson('chirality-stereocenters');
ok(acceptedContains(ch.probe[0],'yes'),'tetrahedral carbon with four different groups is recognized as a stereocenter');
ok(acceptedContains(ch.probe[1],'no'),'repeated substituent blocks the common four-different-groups stereocenter rule');

var rs=D.lesson('cip-rs');
ok(acceptedContains(rs.probe[0],'Br'),'CIP correctly ranks Br above Cl');
ok(acceptedContains(rs.probe[1],'R'),'clockwise 1-2-3 with priority 4 away is R');
ok(acceptedContains(rs.independent[2],'R'),'priority 4 toward correctly inverts an apparent counterclockwise result');

var rel=D.lesson('stereoisomer-relationships');
ok(acceptedContains(rel.probe[0],'enantiomers'),'all centers inverted in stated unsymmetrical case gives enantiomers');
ok(acceptedContains(rel.probe[1],'diastereomers'),'some but not all centers inverted gives diastereomers');

var me=D.lesson('meso-symmetry');
ok(acceptedContains(me.probe[0],'yes'),'curriculum explicitly allows stereocenters in an achiral molecule');
ok(acceptedContains(me.probe[1],'achiral'),'meso is correctly classified as achiral');
ok(acceptedContains(me.independent[3],'no'),'opposite R/S labels alone do not prove meso');

var fi=D.lesson('fischer-projections');
ok(acceptedContains(fi.probe[0],'toward'),'Fischer horizontal bonds point toward viewer');
ok(acceptedContains(fi.probe[1],'yes'),'180-degree Fischer rotation preserves configuration');
ok(acceptedContains(fi.independent[2],'no'),'90-degree Fischer rotation is rejected as equivalent');

var ez=D.lesson('ez-alkenes');
ok(acceptedContains(ez.probe[0],'no'),'E/Z is rejected when an alkene carbon has two identical groups');
ok(acceptedContains(ez.probe[1],'E'),'opposite high-priority groups give E');
ok(acceptedContains(ez.independent[0],'Z'),'same-side high-priority groups give Z');

var oa=D.lesson('optical-activity');
ok(acceptedContains(oa.probe[0],'no'),'R/S is not equated with optical-rotation sign');
ok(acceptedContains(oa.probe[1],'racemic'),'50:50 enantiomers are identified as racemic');
ok(acceptedContains(oa.independent[1],'zero'),'racemic mixture has zero net optical rotation');

console.log('\n=== VISUAL / PRODUCTION CONTRACT ===');
ok(D.PRODUCTION_CHECKPOINTS.length===8,'eight required spatial production checkpoints exist');
var pcSkills={};D.PRODUCTION_CHECKPOINTS.forEach(function(x){pcSkills[x.skill]=true;});
['isomer-classification','chirality-stereocenters','cip-rs','stereoisomer-relationships','meso-symmetry','fischer-projections','ez-alkenes'].forEach(function(id){ok(!!pcSkills[id],id+' has a structured visual/production checkpoint');});
ok(D.PRODUCTION_CHECKPOINTS.every(function(x){return !/arbitrary handwriting/i.test(x.grading)||/not arbitrary handwriting/i.test(x.grading);})&&D.PRODUCTION_CHECKPOINTS.every(function(x){return /structured|hotspot|directional/i.test(x.grading);}), 'production checkpoints require structured grading rather than pretending to grade freehand drawings');

console.log('\n=== ARCHITECTURE FREEZE ===');
var dataSource=fs.readFileSync('./course-units/unit2/chapter5/chapter5-data.js','utf8');
var scope=fs.readFileSync('./course-units/unit2/UNIT2_SCOPE_AND_EVIDENCE.md','utf8');
ok(dataSource.indexOf('student-model-idk-router')===-1,'curriculum data does not fork or import the shared Student Model');
ok(dataSource.indexOf('mastered:true')===-1&&dataSource.indexOf("state:'MASTERED'")===-1,'curriculum data cannot declare mastery');
ok(/must not:\n- change the shared Student Model/i.test(scope),'scope explicitly freezes shared Student Model changes during learner testing');
ok(/Same-question repetition without new teaching is a release blocker/i.test(scope),'IDK same-question loop is explicitly prohibited');
ok(/may not be reused as independent items/i.test(scope),'freshness contract is documented');
ok(/must not pretend to automatically grade arbitrary handwriting/i.test(scope),'drawing-grading honesty boundary is documented');

console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');
if(failed)process.exit(1);
