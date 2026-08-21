'use strict';
var fs=require('fs');
var V=require('./day3/vocab-production-v32.js');
require('./day3/vocab-natural-language-v33.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

ok('contributor rejects electrons-do-not-move contradiction',!pass('contributor','It is the same species and the electrons do not move.','No. The hydrogen moved to a different carbon so connectivity changed.'));
ok('hybrid rejects not-real contradiction',!pass('hybrid','It is not the real structure; the contributors are together.','No. The hybrid is not real.'));
ok('delocalized rejects not-spread contradiction',!pass('delocalized','Electrons are not spread across more than one atom or bond.','No. They are spread across more than one atom or bond.'));
ok('pi rejects negated pi definition',!pass('pi','A pi bond is not the second bond in a double bond and its electrons do not move in resonance.','The pi electrons cannot shift; the sigma bond stays fixed.'));
ok('arrow rejects negated source/destination definition',!pass('arrow','Electrons do not move. The tail is not the source and the head is not where electrons go.','A plus sign, not an electron pair, goes at the tail.'));
ok('contributor rejects keyword salad',!pass('contributor','same species electron placement','No hydrogen different carbon'));
ok('hybrid rejects keyword salad',!pass('hybrid','real structure contributors together','No hybrid real'));
ok('arrow rejects keyword salad',!pass('arrow','electron move tail source head destination','electron pair tail'));
ok('contributor accepts concise natural explanation',pass('contributor','Another valid drawing of the same molecule where only the electrons are rearranged; the atoms stay connected the same way.','No, because the hydrogen moved, which changes the connectivity.'));
ok('hybrid accepts concise natural explanation',pass('hybrid','The hybrid is the actual molecule described by all the resonance contributors together.','No. It does not flip between drawings; the hybrid is the real structure.'));
ok('delocalized accepts singular grammar',pass('delocalized','Electrons are spread over more than one atom or bond instead of staying in one place.','No, they are spread over more than one atom or bond.'));
var src=fs.readFileSync('day3/vocab-production-v32.js','utf8');
ok('old teach state cannot bypass production vocabulary',!/m\.screen!==['\"]vocab['\"]/.test(src));
ok('old guided state is explicitly covered by migration gate',/teach.*guided|guided.*teach/i.test(src));
ok('old practice state is explicitly covered by migration gate',/practice/i.test(src)&&/migration|gate|resume/i.test(src));
console.log('\nDay 3 vocabulary red-team v34: '+p+' passed, '+f+' failed');if(f)process.exit(1);
