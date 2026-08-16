var fs=require('fs');var s=fs.readFileSync('day1/classroom-v4.js','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('all six math areas present',['logs','algebra','exponents','scientific_notation','fractions_percent','unit_conversions'].every(function(x){return s.indexOf(x+':{name:')>=0;}));
ok('previous problem control exists',s.indexOf('Previous problem')>=0&&s.indexOf('historyIndex--')>=0);
ok('wrong answer keeps same problem',s.indexOf('Try this same problem again')>=0);
ok('skip explicitly stays in same skill',s.indexOf('fresh '+"'+esc(a.name)+'"+' problem')>=0||s.indexOf('Skip this problem')>=0);
ok('fractions teach common denominators',s.indexOf('common denominator')>=0);
ok('fraction of number teaching exists',s.indexOf('Divide by the denominator, then multiply by the numerator')>=0);
ok('math menu available during work',s.indexOf('All math skills')>=0);
ok('chemistry menu remains available',s.indexOf('Chemistry menu')>=0);
console.log('\n'+p+' passed, '+f+' failed');if(f)process.exit(1);