'use strict';
var fs=require('fs');var R=require('./day1/guided-responsive-feedback-v27.js');var html=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

ok('responsive layer loads after v13 and before legacy unit guard',html.indexOf('guided-responsive-feedback-v27.js')>html.indexOf('guided-problem-tutor-v13.js')&&html.indexOf('guided-responsive-feedback-v27.js')<html.indexOf('guided-unit-conversion-prompt-v26.js'));
ok('wrong mass unit is not accepted for liter result',R.canonicalFor(R.META['750 mL to L ='][2],'0.75 g')===null);
ok('correct liter unit can be normalized safely',R.canonicalFor(R.META['750 mL to L ='][2],'0.75 L')==='0.75');
ok('wrong nanogram unit is not accepted for g-to-mg relationship',R.canonicalFor(R.META['2.4 g to mg ='][0],'1000 ng')===null);
ok('correct milligram relationship with unit is accepted',R.canonicalFor(R.META['2.4 g to mg ='][0],'1000 mg')==='1000');
ok('wrong kilogram unit is not accepted for final milligram amount',R.canonicalFor(R.META['2.4 g to mg ='][1],'2400 kg')===null);
ok('correct milligram final amount is accepted',R.canonicalFor(R.META['2.4 g to mg ='][1],'2400 mg')==='2400');
ok('wrong-unit feedback names the learner unit instead of giving the answer',/g, which is a mass unit/.test(R.feedbackFor('750 mL to L =',2,'0.75 g',1,''))&&!/0\.75 L/.test(R.feedbackFor('750 mL to L =',2,'0.75 g',1,'')));
ok('wrong direction feedback reacts to the chosen direction',/You chose larger/.test(R.feedbackFor('0.062 L to mL =',0,'larger',1,'')));
ok('unit entered for comparison is identified as a unit answer',/unit name/.test(R.feedbackFor('0.062 L to mL =',0,'g',1,'')));
ok('wrong factor feedback does not reveal the 1000 factor',!/1000/.test(R.feedbackFor('0.062 L to mL =',1,'10',1,'')));
ok('wrong g-to-mg count does not reveal the anchor automatically',!/1 g = 1000 mg/.test(R.feedbackFor('2.4 g to mg =',0,'10',1,'')));
ok('second repeated wrong answer gets different response',/same response again/i.test(R.feedbackFor('2.4 g to mg =',0,'10',2,'10')));
ok('different second wrong answer is not mislabeled repeated',!/same response again/i.test(R.feedbackFor('2.4 g to mg =',0,'100',2,'10')));
ok('too-large result on shrinking conversion gets magnitude feedback',/should shrink/.test(R.feedbackFor('750 mL to L =',2,'750000',1,'')));
ok('wrong operation feedback reacts to multiply choice',/You chose multiply/.test(R.feedbackFor('750 mL to L =',1,'multiply',1,'')));
ok('responsive source intercepts wrong step before old canned hint',/stopImmediatePropagation/.test(fs.readFileSync('day1/guided-responsive-feedback-v27.js','utf8')));
ok('wrong response path does not reference stored step hint',!R.feedbackFor('3500 mcg to mg =',0,'12',1,'').includes('1 mg = 1000 mcg'));

console.log('\nGuided responsive feedback v27: '+p+' passed, '+f+' failed');if(f)process.exit(1);