var fs=require('fs');var s=fs.readFileSync('day1/math-problem-coach-v8.js','utf8');var h=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('coach is loaded by live Day 1 page',h.indexOf('math-problem-coach-v8.js')>=0);
['percent','conversion','scientific','exponent','log','algebra','fraction'].forEach(function(x){ok('coach supports '+x,s.indexOf(x+':{title:')>=0)});
ok('coach stays on exact current problem',s.indexOf('work THIS problem, not restart the whole lesson')>=0);
ok('coach includes easier example path',s.indexOf('Give me an easier example first')>=0);
ok('coach includes tiny step check',s.indexOf('Tiny step check')>=0&&s.indexOf('Check this step')>=0);
ok('irregular percentage strategies are present',s.indexOf('58% can be 60% − 2%')>=0&&s.indexOf('27% can be 25% + 2%')>=0);
ok('conversion coach teaches direction and cancellation',s.indexOf('Cancel the matching units')>=0&&s.indexOf('smaller unit makes the number larger')>=0);
ok('scientific notation coach handles subtracting negative',s.indexOf('−5 − (−2) becomes −5 + 2')>=0);
ok('algebra coach requires same move on both sides',s.indexOf('BOTH sides')>=0);
var aStart=s.indexOf('function accepted('),aEnd=s.indexOf('function install()',aStart);
ok('semantic answer matcher is present',aStart>=0&&aEnd>aStart);
var accepted=new Function(s.slice(aStart,aEnd)+';return accepted;')();
ok('algebra tiny check accepts equivalent divide language',['divide','Division','÷4','/4','divide by 4','divide both sides by 4'].every(function(v){return accepted(v,'divide')}));
ok('algebra tiny check rejects wrong inverse operations',['multiply','multiplication','subtract','add'].every(function(v){return !accepted(v,'divide')}));
console.log('\nMath problem coach v8: '+p+' passed, '+f+' failed');if(f)process.exit(1);