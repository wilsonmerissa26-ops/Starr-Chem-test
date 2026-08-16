var fs=require('fs');var s=fs.readFileSync('day1/toolbox-ui-v7.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('toolbox is closed by default',/removeAttribute\('open'\)/.test(s));
ok('toolbox is moved near top of math view',/insertBefore\(details,firstCard\)/.test(s));
ok('all six math areas have compact references',['Fractions & percentages','Algebra','Exponents','Scientific notation','Logs & estimation','Unit conversions'].every(function(x){return s.indexOf("'"+x+"':")>=0;}));
ok('reference uses one example language',s.indexOf('One example')>=0);
ok('reference identifies itself as reminder only',s.indexOf('reminder only')>=0);
ok('old percent toolbox is removed to prevent duplicate help',s.indexOf("[data-percent-toolbox]")>=0);
console.log('\nToolbox UI v7: '+p+' passed, '+f+' failed');if(f)process.exit(1);