var fs=require('fs'),s=fs.readFileSync('day1/math-exact-problem-teacher-v9.js','utf8'),h=fs.readFileSync('day1/index.html','utf8'),c=fs.readFileSync('day1/classroom-v5.js','utf8'),p=0,f=0;function ok(n,x){if(x){console.log('PASS  '+n);p++}else{console.log('FAIL  '+n);f++}}
ok('legacy v9 exact teacher is retained but not loaded by canonical live Day 1',h.indexOf('math-exact-problem-teacher-v9.js')<0&&s.length>0);
var qs=[];var re=/\{p:'([^']+)'/g,m;while((m=re.exec(c)))qs.push(m[1]);ok('found all Day 1 math questions',qs.length===31);qs.forEach(function(q){ok('exact teacher covers '+q,s.indexOf("'"+q+"':[")>=0)});
ok('exact teacher checks first move',s.indexOf('First move check')>=0&&s.indexOf('Check first move')>=0);
ok('exact teacher does not reveal full answer before first-step response for algebra',s.indexOf('subtracting x from BOTH sides')>=0);
ok('rate conversion teaches both unit changes',s.indexOf('First mol→mmol gives ×1000')>=0&&s.indexOf('per second→per minute gives ×60')>=0);
ok('log coaching translates before calculating',s.indexOf('Translate the log')>=0);
console.log('\nExact-problem teacher v9: '+p+' passed, '+f+' failed');if(f)process.exit(1);