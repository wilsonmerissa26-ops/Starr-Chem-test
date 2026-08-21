'use strict';
var fs=require('fs'),M=require('./day1/math-first-move-check-v29.js'),S=require('./semantic-answer-equivalence.js'),html=fs.readFileSync('day1/index.html','utf8'),p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function n(q,prompt,v){return M.normalize(q,prompt,v,S)}
function fb(q,prompt,v,a,last){return M.feedback(q,prompt,v,a||1,last||'',S)}

ok('strict first-move contract covers all 31 Day 1 math questions',Object.keys(M.CONTRACTS).length===31);
ok('plain numeric expected answer passes',n('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','3')==='3');
ok('equivalent decimal numeric answer passes',n('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','3.0')==='3');
ok('numeric substring false positive 13 is blocked',n('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','13')===null);
ok('numeric answer with x is blocked when coefficient only requested',n('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','3x')===null);
ok('4x canonical algebra answer passes',n('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','4x')==='4x');
ok('4*x equivalent algebra answer passes',n('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','4*x')==='4x');
ok('x*4 equivalent algebra answer passes',n('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','x*4')==='4x');
ok('algebra substring false positive 14x is blocked',n('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','14x')===null);
ok('algebra junk suffix is blocked',n('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','4xx')===null);
ok('power canonical form passes',n('If log(x) = −4, x =','What power of 10 equals x?','10^-4')==='10^-4');
ok('power reciprocal equivalent passes',n('If log(x) = −4, x =','What power of 10 equals x?','1/10000')==='10^-4');
ok('power decimal equivalent passes',n('If log(x) = −4, x =','What power of 10 equals x?','0.0001')==='10^-4');
ok('wrong power is blocked',n('If log(x) = −4, x =','What power of 10 equals x?','10^-3')===null);
ok('factor pair reversed order passes',n('Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.','What two landmark numbers multiply to make 6?','3 × 2')==='2 and 3');
ok('factor pair with extra digit is blocked',n('Estimate log(6) using log(2)≈0.30 and log(3)≈0.48.','What two landmark numbers multiply to make 6?','12 and 3')===null);
ok('direction synonym passes',n('0.062 L to mL =','Should the numerical value get larger or smaller?','bigger')==='larger');
ok('conflicting direction is blocked',n('0.062 L to mL =','Should the numerical value get larger or smaller?','larger and smaller')===null);
ok('division wording passes',n('750 mL to L =','What operation does 750 × 1/1000 mean?','divide by 1000')==='divide');
ok('conflicting operations are blocked',n('750 mL to L =','What operation does 750 × 1/1000 mean?','multiply then divide')===null);
ok('minute unit word passes',n('8 g/5 min for 12 min = how many g?','Which unit cancels when the rate is multiplied by 12 min?','minutes')==='min');
ok('substring unit junk is blocked',n('8 g/5 min for 12 min = how many g?','Which unit cancels when the rate is multiplied by 12 min?','admin')===null);
ok('coefficient feedback reacts to number entered without revealing 3',/coefficient/.test(fb('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','13'))&&!/\b3\b/.test(fb('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','13')));
ok('algebra-form feedback reacts to x expression without revealing 4x',/coefficient is off/.test(fb('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','14x'))&&!/\b4x\b/.test(fb('7x + 2 = 3x + 26. Solve for x.','What is 7x − 3x?','14x')));
ok('repeated wrong first move is recognized',/same response again/i.test(fb('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','13',2,'13')));
ok('different second wrong move is not mislabeled repeated',!/same response again/i.test(fb('4x + 5 = x + 20. Solve for x.','After subtracting x from both sides, what coefficient is left on x?','12',2,'13')));
ok('v29 source intercepts wrong answers before legacy substring checker',/stopImmediatePropagation/.test(fs.readFileSync('day1/math-first-move-check-v29.js','utf8')));

console.log('\nMath first-move check v29: '+p+' passed, '+f+' failed');if(f)process.exit(1);