'use strict';

var D=require('./course-units/unit2/chapter5/chapter5-data.js');
var S=require('./course-units/unit2/chapter5/chapter5-support.js');
var passed=0,failed=0;
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function collectCodes(l){var codes={};function take(item){(item&&item.fields||[]).forEach(function(f){if(f.errorCode)codes[f.errorCode]=true;});}['probe','concept','build','guided','independent','transfer','retrieval'].forEach(function(p){(l[p]||[]).forEach(take);});(l.watch||[]).forEach(function(w){take(w.check);});return Object.keys(codes);}

console.log('=== UNIT 2 / CHAPTER 5 SUPPORT ROUTING ===');
ok(S.REASONS.length===6,'same six learner support reasons are available as the current adaptive tutor');
var reasonIds=S.REASONS.map(function(x){return x.id;});
['dont_understand_concept','dont_know_how_to_start','forgot_prerequisite','started_but_stuck','show_me_example','explanation_not_making_sense'].forEach(function(id){ok(reasonIds.indexOf(id)!==-1,'support reason '+id+' exists');});

console.log('\n=== EVERY CHAPTER 5 ERROR HAS TARGETED ROUTING ===');
var allCodes={};D.lessons().forEach(function(l){collectCodes(l).forEach(function(code){allCodes[code]=true;ok(!!S.LABELS[code],l.id+' error '+code+' has learner-facing label');S.REASONS.forEach(function(reason){var r=S.route(l,code,reason.id,'');ok(r&&r.text&&r.text.length>18,l.id+' '+code+' routes '+reason.id+' to meaningful teaching text');ok(r.errorCode===code&&r.reason===reason.id,l.id+' '+code+' preserves diagnosis identity for '+reason.id);});var plain=S.route(l,code,'dont_understand_concept','').text;var alt=S.route(l,code,'explanation_not_making_sense','').text;ok(plain!==alt,l.id+' '+code+' switches representation when explanation is not making sense');});});

console.log('\n=== IDK DOES NOT BECOME SAME-QUESTION LOOP ===');
D.lessons().forEach(function(l){collectCodes(l).forEach(function(code){var alt=S.route(l,code,'explanation_not_making_sense','').text;ok(/switch representation|two-row|neighbor list|model|boxes|hand|cards|tree|hide|table|green|layers|mirror|cross|mark|tokens|two boxes|rank|circle|separate cards|100 molecules|number line/i.test(alt),l.id+' '+code+' alternate help contains an explicit representation change');});});

console.log('\n=== PREREQUISITE LINKS STAY NARROW ===');
var oldSkillCodes=['CONNECTIVITY_FIRST','STEREO_DEFINITION','SAME_MOLECULE','FOUR_DIFFERENT'];
oldSkillCodes.forEach(function(code){var l=D.lessons().find(function(x){return collectCodes(x).indexOf(code)!==-1;});var r=S.route(l,code,'forgot_prerequisite','');ok(r.foundationHref==='../../unit1/bond-line/',code+' may route to the existing Bond-Line prerequisite');});
Object.keys(allCodes).filter(function(code){return oldSkillCodes.indexOf(code)===-1;}).forEach(function(code){var l=D.lessons().find(function(x){return collectCodes(x).indexOf(code)!==-1;});var r=S.route(l,code,'forgot_prerequisite','');ok(r.foundationHref===null,code+' stays inside Chapter 5 instead of sending learner backward unnecessarily');});

console.log('\n=== SUPPORT CANNOT DECLARE MASTERY ===');
var src=require('fs').readFileSync('./course-units/unit2/chapter5/chapter5-support.js','utf8');
ok(!/MASTERED|mastered\s*[:=]\s*true/i.test(src),'support layer contains no mastery declaration');
ok(!/recordIndependentAttempt|evaluateMastery|moveToIndependent/i.test(src),'support layer does not write cold evidence or control Student Model state');

console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');
if(failed)process.exit(1);
