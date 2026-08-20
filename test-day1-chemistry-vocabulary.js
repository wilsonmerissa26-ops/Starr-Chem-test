'use strict';
var fs=require('fs');
var V=require('./day1/chemistry-vocabulary-v24.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

ok('vocabulary check contains six Day 1 terms',V.TERMS.length===6);
ok('term ids are unique',new Set(V.TERMS.map(function(t){return t.id})).size===V.TERMS.length);
ok('every term has one keyed multiple-choice answer',V.TERMS.every(function(t){return !!(t.term&&t.definition&&Array.isArray(t.choices)&&t.choices.length===3&&t.answer>=0&&t.answer<t.choices.length&&t.choices[t.answer]===t.definition);}));
ok('correct answer positions are varied',new Set(V.TERMS.map(function(t){return t.answer})).size===3);
var names=V.TERMS.map(function(t){return t.term.toLowerCase()}).join(' ');
ok('Day 1 vocabulary includes valence electrons',names.indexOf('valence electron')>=0);
ok('Day 1 vocabulary includes lone pair and Lewis structure',names.indexOf('lone pair')>=0&&names.indexOf('lewis structure')>=0);
ok('Day 1 vocabulary includes bond octet and central atom',names.indexOf('bond')>=0&&names.indexOf('octet')>=0&&names.indexOf('central atom')>=0);
ok('Day 2 formal charge is not introduced',names.indexOf('formal charge')<0);

ok('wrong recognition is term review',V.classify(false,false)==='term_review');
ok('correct recognition without explanation is concept review',V.classify(true,false)==='concept_review');
ok('correct recognition plus explanation is word and idea ready',V.classify(true,true)==='word_and_idea');
var s=V.summarize([{correct:true,canExplain:true},{correct:true,canExplain:false},{correct:false,canExplain:false}]);
ok('summary keeps three vocabulary signals separate',s.word_and_idea===1&&s.concept_review===1&&s.term_review===1&&s.total===3);

var source=fs.readFileSync('day1/chemistry-vocabulary-v24.js','utf8');
ok('vocabulary layer explicitly says it does not change mastery',source.indexOf('does not change chemistry mastery')>=0);
ok('vocabulary layer never calls Day1Orchestrator',source.indexOf('Day1Orchestrator')<0);
ok('vocabulary layer never writes mastery evidence',source.indexOf('addEvidence')<0&&source.indexOf('recordEvidence')<0);
var html=fs.readFileSync('day1/index.html','utf8');
ok('Day 1 page loads vocabulary after classroom core',html.indexOf('chemistry-vocabulary-v24.js')>html.indexOf('classroom-v5.js'));

console.log('\nDay 1 chemistry vocabulary: '+p+' passed, '+f+' failed');if(f)process.exit(1);