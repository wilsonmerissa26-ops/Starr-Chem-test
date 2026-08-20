'use strict';
var fs=require('fs');var js=fs.readFileSync('day1/guided-problem-tutor-v13.js','utf8');var fix=require('./day1/guided-unit-conversion-prompt-v26.js');var html=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('v13 loaded after prior teaching layers',html.indexOf('guided-problem-tutor-v13.js')>html.indexOf('voice-quality-v12.js'));
ok('g-to-mg prompt repair loads after v13',html.indexOf('guided-unit-conversion-prompt-v26.js')>html.indexOf('guided-problem-tutor-v13.js'));
ok('help keeps same problem',js.indexOf('I am not changing the problem')>=0&&js.indexOf('Same problem tutoring')>=0);
ok('walkthrough requires learner answers',js.indexOf('Check this step')>=0&&js.indexOf('Try this same step again')>=0);
ok('does not reveal on first help click',js.indexOf('Walk me through it')>=0&&js.indexOf('Give me the first step only')>=0);
ok('mental route is optional',js.indexOf('Show mental-math route')>=0);
ok('percent what-percent path is decomposed',js.indexOf('What is the part in this problem?')>=0&&js.indexOf('What is the whole?')>=0&&js.indexOf('What is 10% of ')>=0);
ok('scientific notation walkthrough exists',js.indexOf('Do two jobs separately')>=0&&js.indexOf('What is 6 + (-3)?')>=0);
ok('conversion walkthrough exists',js.indexOf('Let the units decide the direction')>=0&&js.indexOf('What factor converts liters to milliliters?')>=0);
ok('g-to-mg ambiguous relationship wording is repaired',fix.repairedPrompt('2.4 g to mg =','What is the relationship between 1 g and mg?')==='How many milligrams are in 1 gram?');
ok('g-to-mg repair does not alter other questions',fix.repairedPrompt('3500 mcg to mg =','How many mcg equal 1 mg?')==='How many mcg equal 1 mg?');
ok('g-to-mg intro now matches the numeric checker',fix.repairedIntro('2.4 g to mg =','First identify which unit is smaller.')==='Start with the exact gram-to-milligram conversion factor.');
ok('original g-to-mg checker still requires the 1000 relationship',js.indexOf("'2.4 g to mg ='")>=0&&js.indexOf("return /1000/.test(norm(v))")>=0);
ok('exponent walkthrough exists',js.indexOf('Negative exponent = reciprocal')>=0&&js.indexOf('Power of a power')>=0);
console.log('\nGuided problem tutor v13: '+p+' passed, '+f+' failed');if(f)process.exit(1);