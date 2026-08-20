'use strict';
var assert=require('assert'),fs=require('fs'),eq=require('./semantic-answer-equivalence.js');

function acceptsOperation(values,want){values.forEach(function(v){assert.strictEqual(eq.operation(v),want,v+' should mean '+want);});}
acceptsOperation(['divide','division','divide by 4','divide both sides by 4','divided by 4','÷4','/ 4'],'divide');
acceptsOperation(['multiply','multiplication','multiply by 4','times 4','×4','*4'],'multiply');
assert.strictEqual(eq.operation('multiply then divide'),null,'conflicting operations must not be normalized');

['larger','bigger','greater','goes up'].forEach(function(v){assert.strictEqual(eq.direction(v),'larger');});
['smaller','less','goes down'].forEach(function(v){assert.strictEqual(eq.direction(v),'smaller');});
assert.strictEqual(eq.direction('larger then smaller'),null,'conflicting directions must remain unresolved');

['yes','y','they match','same bases'].forEach(function(v){assert.strictEqual(eq.affirmative(v),true,v+' should be affirmative');});
['no','different bases','they do not match'].forEach(function(v){assert.strictEqual(eq.affirmative(v),false,v+' should be negative');});
['maybe','yellow','yesterday'].forEach(function(v){assert.strictEqual(eq.affirmative(v),null,v+' must not pass the old /yes|y/ bug');});

assert.strictEqual(eq.normalizeShortAnswer('division','What operation does 750 × 1/1000 mean?'),'divide');
assert.strictEqual(eq.normalizeShortAnswer('÷ 1000','What operation does 750 × 1/1000 mean?'),'divide');
assert.strictEqual(eq.normalizeShortAnswer('/1000','What operation does 750 × 1/1000 mean?'),'divide');
assert.strictEqual(eq.normalizeShortAnswer('3 and 2','What two landmark numbers multiply to make 6?'),'2 and 3');
assert.strictEqual(eq.normalizeShortAnswer('3 × 2','What two landmark numbers multiply to make 6?'),'2 and 3');
assert.strictEqual(eq.normalizeShortAnswer('4*x','What is 7x − 3x?'),'4x');
assert.strictEqual(eq.normalizeShortAnswer('x*4','What is 7x − 3x?'),'4x');
assert.strictEqual(eq.normalizeShortAnswer('1/10000','What power of 10 equals x?'),'10^-4');
assert.strictEqual(eq.normalizeShortAnswer('3.0','What is 7 − 4?'),'3');
assert.strictEqual(eq.normalizeGuidedAnswer('yellow','Do the bases match?'),'__invalid__');
assert.strictEqual(eq.normalizeGuidedAnswer('they match','Do the bases match?'),'yes');
assert.strictEqual(eq.normalizeGuidedAnswer('division','What operation changes mL to L: multiply or divide by 1000?'),'divide');

var unitCases=[
 ['0.062 L to mL =','62 mL','62'],
 ['0.062 L to mL =','62 milliliters','62'],
 ['750 mL to L =','0.75 L','0.75'],
 ['2.4 g to mg =','2400 mg','2400'],
 ['3500 mcg to mg =','3.5 milligrams','3.5'],
 ['0.015 mol/s to mmol/min =','900 mmol/min','900'],
 ['0.015 mol/s to mmol/min =','900 millimoles per minute','900'],
 ['8 g/5 min for 12 min = how many g?','19.2 g','19.2'],
 ['2 gal to qt =','8 quarts','8']
];
unitCases.forEach(function(r){assert.strictEqual(eq.normalizeUnitAnswer(r[0],r[1]),r[2],r[1]+' should normalize for '+r[0]);});
assert.strictEqual(eq.normalizeUnitAnswer('0.062 L to mL =','62 kg'),'62 kg','wrong units must stay wrong');
assert.strictEqual(eq.normalizeUnitAnswer('15% of 80 =','12%'),'12%','non-unit problems must not be rewritten');

assert.strictEqual(eq.normalizeChemistryNumber('08','How many total valence electrons does CH₄ have?'),'8');
assert.strictEqual(eq.normalizeChemistryNumber('8.0 electrons','How many total valence electrons does CH₄ have?'),'8');
assert.strictEqual(eq.normalizeChemistryNumber('+2 bonds','How many C–H single bonds are needed?'),'2');
assert.strictEqual(eq.normalizeChemistryNumber('2 lone pairs','Those remaining electrons become how many lone pairs?'),'2');
assert.strictEqual(eq.normalizeChemistryNumber('8 bonds','How many total valence electrons does CH₄ have?'),'8 bonds','wrong chemistry unit must stay wrong');

assert.strictEqual(eq.normalizeChemistryMicro('oxygen','In H₂O, which atom must connect to both of the other atoms?'),'oxygen');
assert.strictEqual(eq.normalizeChemistryMicro('O','In H₂O, which atom must connect to both of the other atoms?'),'o');
['carbon','hydrogen','no oxygen'].forEach(function(v){assert.strictEqual(eq.normalizeChemistryMicro(v,'In H₂O, which atom must connect to both of the other atoms?'),'zzz',v+' must not pass because it merely contains the letter o');});
assert.strictEqual(eq.normalizeChemistryMicro('3.0 lone pairs','If 6 electrons are left, how many lone pairs is that?'),'3');
assert.strictEqual(eq.normalizeChemistryMicro('count the valence electrons','What is the first thing you count before drawing bonds?'),'valence electrons');
assert.strictEqual(eq.normalizeChemistryMicro('not electrons','What is the first thing you count before drawing bonds?'),'zzz','negated substring must not be accepted');

var day1=fs.readFileSync('day1/index.html','utf8'),chem=fs.readFileSync('chemistry-teacher-preview/index.html','utf8');
assert.ok(day1.indexOf('../semantic-answer-equivalence.js?v=20260820b')>=0,'Day 1 must load semantic equivalence guard');
assert.ok(day1.indexOf('../semantic-answer-equivalence.js')<day1.indexOf('math-check-input-guard-v19.js'),'semantic guard must load before the live Check guard');
assert.ok(chem.indexOf('../semantic-answer-equivalence.js?v=20260820b')>=0,'chemistry practice must load semantic equivalence guard');

console.log('PASS semantic checker audit: operation language, unit-bearing math, guided answers, chemistry numeric forms, and atom-name false positives are covered');
