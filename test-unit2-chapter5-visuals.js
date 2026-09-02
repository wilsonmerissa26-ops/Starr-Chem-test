'use strict';

var D=require('./course-units/unit2/chapter5/chapter5-data.js');
var V=require('./course-units/unit2/chapter5/chapter5-visual-data.js');
var passed=0,failed=0;
function ok(cond,label){if(cond){console.log('PASS  '+label);passed++;}else{console.log('FAIL  '+label);failed++;}}
function itemVisuals(l){var out=[];['probe','concept','build','guided','independent','transfer','retrieval'].forEach(function(p){(l[p]||[]).forEach(function(x){if(x.visual)out.push(x.visual);});});(l.watch||[]).forEach(function(x){if(x.visual&&V.get(x.visual))out.push(x.visual);if(x.check&&x.check.visual)out.push(x.check.visual);});return out;}

console.log('=== UNIT 2 / CHAPTER 5 VISUAL CONTRACT ===');

var ids=V.ids();
ok(ids.length===new Set(ids).size,'visual IDs are unique');
ok(ids.length>=14,'visual bank has enough distinct authored spatial cases');

console.log('\n=== EVERY DATA VISUAL TOKEN RESOLVES ===');
D.lessons().forEach(function(l){
  itemVisuals(l).forEach(function(id){ok(!!V.get(id),l.id+' visual token '+id+' resolves');});
});

console.log('\n=== STRUCTURED SPATIAL MEANING ===');
var center=V.get('stereocenter-wedge-a');
ok(center.expected.stereocenter===true&&center.groups.length===4,'wedge-dash stereocenter visual has four distinct substituent paths');
ok(new Set(center.groups.map(function(g){return g.pathKey;})).size===4,'stereocenter visual does not duplicate a substituent path');

var cip=V.get('cip-ranking-a');
ok(JSON.stringify(cip.expected.order)===JSON.stringify(['Br','OH','CH3','H']),'CIP ranking visual freezes Br > O > C > H');

ok(V.get('rs-visual-a-clockwise-4-away').expected.configuration==='R','clockwise with priority 4 away is R');
ok(V.get('rs-visual-b-counterclockwise-4-toward').expected.configuration==='R'&&V.get('rs-visual-b-counterclockwise-4-toward').expected.invert===true,'counterclockwise appearance with priority 4 toward is inverted to R');
ok(V.get('rs-transfer-clockwise-4-toward').expected.configuration==='S'&&V.get('rs-transfer-clockwise-4-toward').expected.invert===true,'clockwise appearance with priority 4 toward is inverted to S');
ok(V.get('rs-retrieval-counterclockwise-4-away').expected.configuration==='S','counterclockwise with priority 4 away is S');

var rel=V.get('relationship-pair-a');
ok(rel.expected.relationship==='diastereomers'&&rel.expected.changedCenters.length===1,'relationship visual changes only one center and is diastereomeric');

var meso=V.get('meso-symmetry-plane-a');
ok(meso.expected.stereocenters===2&&meso.expected.achiral===true&&meso.expected.meso===true,'meso visual explicitly separates stereocenters from whole-molecule chirality');
ok(meso.symmetry&&/internal/i.test(meso.symmetry.type),'meso visual requires a real internal symmetry relationship');

var fi=V.get('fischer-orientation-a');
ok(fi.directions.left==='toward'&&fi.directions.right==='toward','Fischer horizontal groups point toward viewer');
ok(fi.directions.top==='away'&&fi.directions.bottom==='away','Fischer vertical groups point away from viewer');

var ez1=V.get('ez-guided-opposite'),ez2=V.get('ez-transfer-opposite-b');
ok(ez1.expected.eligible&&ez1.expected.highPrioritySides==='opposite'&&ez1.expected.configuration==='E','guided E/Z visual correctly represents opposite high-priority groups as E');
ok(ez2.expected.eligible&&ez2.expected.configuration==='E','transfer E/Z visual is a fresh eligible E case');
ok(JSON.stringify(ez1.leftCarbon)!==JSON.stringify(ez2.leftCarbon)||JSON.stringify(ez1.rightCarbon)!==JSON.stringify(ez2.rightCarbon),'E/Z transfer structure is not a duplicate of guided structure');

console.log('\n=== PRODUCTION COVERAGE ===');
var visualSkills={};ids.forEach(function(id){visualSkills[V.get(id).skill]=true;});
D.PRODUCTION_CHECKPOINTS.forEach(function(cp){ok(!!visualSkills[cp.skill],cp.id+' has authored visual data for '+cp.skill);});

console.log('\n=== VISUALS DO NOT CLAIM FREEHAND GRADING ===');
ok(ids.every(function(id){var x=V.get(id);return !x.gradesHandwriting&&!x.ocrRequired;}),'visual definitions do not claim OCR or arbitrary handwriting grading');
ok(D.PRODUCTION_CHECKPOINTS.every(function(cp){return /structured|hotspot|directional/i.test(cp.grading);}), 'every production checkpoint uses a structured grading mode');

console.log('\n=== SUMMARY: '+passed+' passed, '+failed+' failed ===');
if(failed)process.exit(1);
