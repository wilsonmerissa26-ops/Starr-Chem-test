"use strict";
var fs=require('fs');var js=fs.readFileSync('day1/classroom-v5.js','utf8');var html=fs.readFileSync('day1/index.html','utf8');var chem=fs.readFileSync('chemistry-teacher-preview/chemistry-teaching-fixes-v2.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('v5 is live runtime',html.indexOf('classroom-v5.js')>=0);
['fractions_percent','algebra','exponents','scientific_notation','logs','unit_conversions'].forEach(function(x){ok('contains '+x,js.indexOf(x+':{')>=0)});
ok('toolbox restored',js.indexOf('Math Toolbox')>=0&&js.indexOf('Mental Math Lab')>=0);
ok('mental fluency strategies present',js.indexOf('complements to 10/100/1000')>=0&&js.indexOf('Double one factor and halve the other')>=0);
ok('unit conversion teaching is multi-step',js.indexOf('Dimensional analysis formula')>=0&&js.indexOf('Rate conversion one unit at a time')>=0&&js.indexOf('Pharmacy metric ladder')>=0);
ok('scientific notation has actual practice bank',js.indexOf("p:'Write 0.00061 in scientific notation.'")>=0&&js.indexOf("p:'(4×10^6)(2×10^-3) ='")>=0);
ok('exponents have actual practice bank',js.indexOf("p:'2^(-4) ='")>=0&&js.indexOf("p:'(x^3)^2 ='")>=0);
ok('wrong answer stays on same problem',js.indexOf('Same problem. Try again.')>=0);
ok('same-skill skip is explicit',js.indexOf("Skip → new '+esc(a.name)+' problem")>=0);
ok('previous problem control exists',js.indexOf('Previous problem')>=0);
ok('print save fallback exists',js.indexOf('Print / Save this page')>=0);
ok('chemistry IDK teaches electron budget',chem.indexOf('electrons left = total valence electrons')>=0);
ok('chemistry IDK teaches center logic',chem.indexOf('how to choose the center')>=0);
ok('chemistry narration normalization exists',chem.indexOf('normalizeSpeech')>=0);
console.log('\n'+p+' passed, '+f+' failed');if(f)process.exit(1);
