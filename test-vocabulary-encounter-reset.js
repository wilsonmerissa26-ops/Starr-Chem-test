'use strict';
var fs=require('fs');
var D1=require('./day1/chemistry-vocabulary-production-v33.js');
var D1R=require('./day1/vocab-encounter-reset-v34.js');
var D3=require('./day3/vocab-escalation-v35.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

var t=D1.TERMS.find(function(x){return x.id==='valence_electron';});
var bad=D1.gradeTerm(t,'It is an electron.','Electrons do things.');
var s=D1.fresh();
D1.applyAttempt(s,t,bad,'cold');
D1.applyAttempt(s,t,bad,'support');
D1.applyAttempt(s,t,bad,'support');
ok('Day 1 reaches teaching threshold after three failed written submissions',D1.failedExplanationStreak(s,t)===3&&D1.shouldAutoTeach(s,t));
D1R.markTeachingBoundary(s,t.id);
ok('Day 1 teaching boundary resets the failed-attempt streak',D1.failedExplanationStreak(s,t)===0);
ok('Day 1 teaching boundary does not grant learner mastery',s.records.valence_electron.status!=='independent'&&s.records.valence_electron.attempts.slice(-1)[0].system===true);
s.teachingShown=false;
ok('Day 1 later retrieval does not inherit pre-teaching failures',!D1.shouldAutoTeach(s,t));
var idk1=D1.fresh(),before1=D1R.attempts(idk1,t.id).length;D1.applyAttempt(idk1,t,bad,'cold');
ok('Day 1 base handler simulation creates one failed attempt before IDK cleanup',D1R.attempts(idk1,t.id).length===before1+1);
D1R.stripIdkAttempt(idk1,t.id,before1);
ok('Day 1 IDK cleanup removes the synthetic failed explanation',D1R.attempts(idk1,t.id).length===before1);
var d1html=fs.readFileSync('day1/index.html','utf8');
ok('Day 1 loads encounter reset after production engine and before visual support',d1html.indexOf('vocab-encounter-reset-v34.js')>d1html.indexOf('chemistry-vocabulary-production-v33.js')&&d1html.indexOf('vocab-encounter-reset-v34.js')<d1html.indexOf('vocabulary-visual-learning-v1.js'));

var d3={records:{contributor:{status:'not_started',attempts:[{kind:'cold',pass:false},{kind:'support',pass:false},{kind:'support',pass:false}]}}};
ok('Day 3 reaches teaching threshold after three failed written submissions',D3.failedExplanationStreak(d3,'contributor')===3&&D3.shouldAutoTeach(d3,'contributor'));
D3.markTeaching(d3,'contributor');
ok('Day 3 teaching creates a fresh attempt boundary',D3.failedExplanationStreak(d3,'contributor')===0);
D3.clearEscalation(d3);
ok('Day 3 later retrieval does not inherit pre-teaching failures',!D3.shouldAutoTeach(d3,'contributor'));
var idk3={records:{contributor:{status:'not_started',attempts:[]}}},before3=D3.attempts(idk3,'contributor').length;idk3.records.contributor.attempts.push({kind:'cold',pass:false});D3.stripIdkAttempt(idk3,'contributor',before3);
ok('Day 3 IDK cleanup removes the synthetic failed explanation',D3.attempts(idk3,'contributor').length===before3);
var post={records:{contributor:{status:'supported',attempts:[]}},queue:[],index:0,phase:'postteach',termId:'contributor',returnReview:false,escalationTaughtTerm:'contributor',escalationOriginReview:false};
ok('Day 3 recognizes IDK after teaching as a stop condition',D3.shouldEndOnIdk(post,'contributor'));
var saved=null,reloaded=false,fakeWin={localStorage:{setItem:function(k,v){saved=v;}},location:{reload:function(){reloaded=true;}}};D3.endTaughtEncounter(fakeWin,post,'contributor');
ok('Day 3 post-teaching IDK becomes Needs review and moves on',post.records.contributor.status==='needs_review'&&post.queue.indexOf('contributor')>=0&&post.index===1&&post.phase==='cold'&&reloaded&&!!saved);

console.log('\nVocabulary encounter reset red-team: '+p+' passed, '+f+' failed');if(f)process.exit(1);
