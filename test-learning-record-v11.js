var fs=require('fs');var s=fs.readFileSync('day1/learning-record-v11.js','utf8'),h=fs.readFileSync('day1/index.html','utf8');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
ok('learning record is loaded',h.indexOf('learning-record-v11.js')>=0);
ok('records confusions',s.indexOf('rememberConfusion')>=0&&s.indexOf('confusions')>=0);
ok('records repaired problems',s.indexOf('markRepaired')>=0&&s.indexOf('repaired')>=0);
ok('stores strategies',s.indexOf('strategies')>=0&&s.indexOf('strategyFor')>=0);
ok('notebook has still-working section',s.indexOf('Things I am still working on')>=0);
ok('notebook has repaired section',s.indexOf('Problems I repaired')>=0);
ok('summary reports learning evidence',s.indexOf('Learning evidence')>=0);
ok('IDK click records exact current question',s.indexOf("e.target.id==='idk'")>=0&&s.indexOf('currentQuestion()')>=0);
ok('correct retry repairs same question',s.indexOf("e.target.id==='check'")>=0&&s.indexOf("#view #feedback .good")>=0);
console.log('\nLearning record v11: '+p+' passed, '+f+' failed');if(f)process.exit(1);