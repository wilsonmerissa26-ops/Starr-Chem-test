'use strict';
var fs=require('fs');var js=fs.readFileSync('day1/guided-problem-tutor-v13.js','utf8');var html=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('legacy v13 tutor is retained but not loaded by canonical live Day 1',html.indexOf('guided-problem-tutor-v13.js')<0&&js.length>0);
ok('help keeps same problem',js.indexOf('I am not changing the problem')>=0&&js.indexOf('Same problem tutoring')>=0);
ok('walkthrough requires learner answers',js.indexOf('Check this step')>=0&&js.indexOf('Try this same step again')>=0);
ok('does not reveal on first help click',js.indexOf('Walk me through it')>=0&&js.indexOf('Give me the first step only')>=0);
ok('mental route is optional',js.indexOf('Show mental-math route')>=0);
ok('percent what-percent path is decomposed',js.indexOf('What is the part in this problem?')>=0&&js.indexOf('What is the whole?')>=0&&js.indexOf('What is 10% of ')>=0);
ok('scientific notation walkthrough exists',js.indexOf('Do two jobs separately')>=0&&js.indexOf('What is 6 + (-3)?')>=0);
ok('conversion walkthrough exists',js.indexOf('Let the units decide the direction')>=0&&js.indexOf('What factor converts liters to milliliters?')>=0);
ok('exponent walkthrough exists',js.indexOf('Negative exponent = reciprocal')>=0&&js.indexOf('Power of a power')>=0);
console.log('\nGuided problem tutor v13: '+p+' passed, '+f+' failed');if(f)process.exit(1);