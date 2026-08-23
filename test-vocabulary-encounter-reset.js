'use strict';
var fs=require('fs');
var D1=require('./day1/chemistry-vocabulary-production-v33.js');
var D3=require('./day3/vocab-escalation-v35.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

var t=D1.TERMS.find(function(x){return x.id==='valence_electron';});
var bad=D1.gradeTerm(t,'It is an electron.','Electrons do things.');
var s=D1.fresh();
D1.applyAttempt(s,t,bad,'cold');
D1.applyAttempt(s,t,bad,'support');
D1.applyAttempt(s,t,bad,'support');
ok('Day 1 reaches teaching threshold after three failed written submissions',D1.failedExplanationStreak(s,t)===3&&D1.shouldAutoTeach(s,t));
D1.beginTeach(s,t,false);
ok('Day 1 teaching creates a fresh attempt boundary',D1.failedExplanationStreak(s,t)===0);
s.teachingShown=false;
ok('Day 1 later retrieval does not inherit pre-teaching failures',!D1.shouldAutoTeach(s,t));

var d1src=fs.readFileSync('day1/chemistry-vocabulary-production-v33.js','utf8');
var d1idk=(d1src.match(/chemProdIdk'[\s\S]*?chemProdSupportCheck'/)||[''])[0];
ok('Day 1 IDK routes to teaching without recording a failed explanation',d1idk.indexOf('applyAttempt')<0&&d1idk.indexOf('beginTeach')>=0);

var d3={records:{contributor:{attempts:[{kind:'cold',pass:false},{kind:'support',pass:false},{kind:'support',pass:false}]}}};
ok('Day 3 reaches teaching threshold after three failed written submissions',D3.failedExplanationStreak(d3,'contributor')===3&&D3.shouldAutoTeach(d3,'contributor'));
D3.markTeaching(d3,'contributor');
ok('Day 3 teaching creates a fresh attempt boundary',D3.failedExplanationStreak(d3,'contributor')===0);
D3.clearEscalation(d3);
ok('Day 3 later retrieval does not inherit pre-teaching failures',!D3.shouldAutoTeach(d3,'contributor'));

var d3src=fs.readFileSync('day3/vocab-production-v34.js','utf8');
var d3idk=(d3src.match(/getElementById\('vidk'\)[\s\S]*?getElementById\('vscheck'\)/)||[''])[0];
ok('Day 3 IDK routes to teaching without recording a failed explanation',d3idk.indexOf('record(s,t,g')<0&&d3idk.indexOf("s.phase='teach'")>=0);

console.log('\nVocabulary encounter reset red-team: '+p+' passed, '+f+' failed');if(f)process.exit(1);
