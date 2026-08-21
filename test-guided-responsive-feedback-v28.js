'use strict';
var fs=require('fs');var R=require('./day1/guided-responsive-feedback-v28.js');var html=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function fb(q,prompt,value,attempt,last){return R.feedbackForStep(q,prompt,value,attempt||1,last||'');}

ok('v28 loads after semantic normalizer',html.indexOf('guided-responsive-feedback-v28.js')>html.indexOf('semantic-answer-equivalence.js'));
ok('wrong base-match answer is acknowledged specifically',/You answered no/.test(fb('a^4 × a^3 =','Do the bases match?','no')));
ok('non yes-no response is identified as wrong response type',/yes-or-no comparison/.test(fb('a^4 × a^3 =','Do the bases match?','yellow')));
ok('wrong denominator responds to the denominator entered',/denominator is 3/.test(fb('5/6 − 1/3 =','What is 1/3 written in sixths?','1/3')));
ok('sixths-but-not-equivalent feedback does not reveal 2/6',/not equivalent/.test(fb('5/6 − 1/3 =','What is 1/3 written in sixths?','1/6'))&&!/2\/6/.test(fb('5/6 − 1/3 =','What is 1/3 written in sixths?','1/6')));
ok('unreduced fraction is recognized without revealing simplified answer',/still be reduced/.test(fb('5/6 − 1/3 =','Reduce 3/6. What is the simplified fraction?','3/6'))&&!/1\/2/.test(fb('5/6 − 1/3 =','Reduce 3/6. What is the simplified fraction?','3/6')));
ok('arithmetic miss names operation without revealing result',/division/.test(fb('3/8 of 160 =','What is 160 ÷ 8?','18'))&&!/\b20\b/.test(fb('3/8 of 160 =','What is 160 ÷ 8?','18')));
ok('measurement unit on pure math step is called out',/attached a measurement unit/.test(fb('3/8 of 160 =','What is 160 ÷ 8?','20 g')));
ok('wrong scientific coefficient outside range gets range feedback',/at least 1 in magnitude and less than 10/.test(fb('Write 0.00061 in scientific notation.','Move the decimal until the coefficient is between 1 and 10. What coefficient do you get?','0.61')));
ok('scientific coefficient feedback does not reveal correct coefficient',!/6\.1/.test(fb('Write 0.00061 in scientific notation.','Move the decimal until the coefficient is between 1 and 10. What coefficient do you get?','0.61')));
ok('ordinary number on scientific-notation step is identified as format mismatch',/ordinary number/.test(fb('Write 450000 in scientific notation.','Write the final scientific notation.','450000')));
ok('wrong factor pair responds to actual two numbers',/I found 1 and 5/.test(fb('Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.','What two landmark numbers multiply to make 6?','1 and 5')));
ok('wrong sign answer reacts to chosen sign without declaring opposite sign',/You chose positive/.test(fb('Write 0.00061 in scientific notation.','Should the exponent be positive or negative?','positive'))&&!/should be negative|answer is negative/i.test(fb('Write 0.00061 in scientific notation.','Should the exponent be positive or negative?','positive')));
ok('wrong percent part is treated as part-selection error',/not the part/.test(fb('24 is what percent of 300?','What is the part in this problem?','300')));
ok('wrong percent whole is treated as whole-selection error',/not the whole/.test(fb('24 is what percent of 300?','What is the whole?','24')));
ok('repeated wrong answer is recognized',/same response again/i.test(fb('3/8 of 160 =','What is 160 ÷ 8?','18',2,'18')));
ok('different second wrong answer is not mislabeled repeated',!/same response again/i.test(fb('3/8 of 160 =','What is 160 ÷ 8?','19',2,'18')));
ok('wrong arithmetic feedback never uses legacy answer-bearing phrase',!/The denominator 8 tells you to split 160 into 8 equal groups/.test(fb('3/8 of 160 =','What is 160 ÷ 8?','18')));

var mock={Day1GuidedTutorV13:{planFor:function(){return{steps:[{a:function(v){return String(v)==='yes';}}]};}},SemanticAnswerEquivalence:{normalizeGuidedAnswer:function(v){return String(v).toLowerCase();}}};
ok('existing checker still decides correctness',R.correctByExistingPlan(mock,'anything',0,'Do the bases match?','YES')===true&&R.correctByExistingPlan(mock,'anything',0,'Do the bases match?','no')===false);

console.log('\nGuided responsive feedback v28: '+p+' passed, '+f+' failed');if(f)process.exit(1);