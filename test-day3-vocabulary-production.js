'use strict';
var V=require('./day3/vocab-production-v32.js');
var fs=require('fs');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

ok('five vocabulary terms',V.TERMS.length===5);
if(fs.existsSync('day3/resonance.js')){var R=require('./day3/resonance.js');ok('term IDs match frozen resonance runtime',V.TERMS.map(function(x){return x.id;}).join('|')===R.VOCAB.map(function(x){return x.id;}).join('|'));ok('term names match frozen resonance runtime',V.TERMS.map(function(x){return x.term;}).join('|')===R.VOCAB.map(function(x){return x.term;}).join('|'));}

ok('contributor accepts independent explanation',pass('contributor','It is another way to draw the same molecule where the electron placement changes but the atoms stay connected the same.','No. The hydrogen moved to a different carbon, so the connectivity changed and they are not resonance contributors.'));
ok('contributor clue fragment does not pass',!pass('contributor','It is a drawing.','They look different.'));
ok('contributor same molecule alone does not pass',!pass('contributor','It is the same molecule.','No.'));

ok('hybrid accepts real-structure explanation',pass('hybrid','The resonance hybrid is the actual structure, a blend represented by all the contributors together.','No, the molecule does not flip between separate drawings. The hybrid is the real structure.'));
ok('hybrid real structure alone does not pass',!pass('hybrid','It is the real structure.','Yes, it switches between forms.'));

ok('delocalized accepts spread-electron explanation',pass('delocalized','These are electrons spread across several atoms or bonds instead of being fixed in one place.','No, they are not locked in one bond; the electrons are distributed over multiple atoms and bonds.'));
ok('delocalized electrons keyword alone does not pass',!pass('delocalized','Electrons.','Yes.'));

ok('pi accepts chemistry definition',pass('pi','A pi bond is the second bond in a double bond, made by side-by-side overlap of p orbitals, and its electrons can shift in resonance.','The pi electrons can shift; the sigma bond stays fixed.'));
ok('pi double bond clue alone does not pass',!pass('pi','It is a double bond.','The sigma bond moves.'));

ok('curved arrow accepts source-to-destination explanation',pass('arrow','A curved arrow shows an electron pair moving. The tail is the source where electrons start and the arrowhead shows the destination where they go.','At the tail I need an actual electron source such as a lone pair or pi bond.'));
ok('curved arrow electron keyword alone does not pass',!pass('arrow','Electrons move.','A plus sign.'));

var g=V.gradeTerm(term('contributor'),'Same molecule.','No.');
var fb=V.feedbackFor(term('contributor'),g);
ok('feedback preserves hit/missing distinction',fb.got.length>=1&&fb.missing.length>=1);

var s=V.fresh();
V.TERMS.forEach(function(t){s.records[t.id]={status:'independent'};});
ok('allIndependent requires all five',V.allIndependent(s.records));
s.records.arrow.status='supported';
ok('supported term does not count independent',!V.allIndependent(s.records));
ok('main done requires production version and all terms',V.doneMain({vocabProductionVersion:2,vocabIndex:5}));
ok('old vocabulary state is not treated as done',!V.doneMain({vocabIndex:5}));

var html=fs.readFileSync('day3/index.html','utf8');
ok('Day 3 loads production vocabulary layer',html.indexOf('vocab-production-v32.js')>=0);
ok('production vocabulary loads after resonance runtime',html.indexOf('vocab-production-v32.js')>html.indexOf('resonance.js'));

var curr=fs.readFileSync('Day3_Vocabulary_Production_Addendum.md','utf8');
ok('curriculum requires no-clue written explanation',/no-clue written explanation/i.test(curr));
ok('curriculum says recognition games are practice only',/recognition games.*practice/i.test(curr));
ok('curriculum requires word bank only after a miss',/word bank.*after.*miss/i.test(curr));
ok('curriculum requires later no-clue retrieval after support',/later.*no-clue retrieval/i.test(curr));

console.log('\nDay 3 vocabulary production: '+p+' passed, '+f+' failed');if(f)process.exit(1);
