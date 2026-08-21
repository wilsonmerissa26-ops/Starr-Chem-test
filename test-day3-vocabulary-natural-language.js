'use strict';
var V=require('./day3/vocab-production-v34-language-fix.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

ok('contributor accepts plain No plus correct reason',pass('contributor','It is another drawing of the same molecule where electrons move but the atom connections stay the same.','No. The hydrogen moved to another carbon, so the connectivity changed.'));
ok('hybrid accepts plain No plus hybrid explanation',pass('hybrid','The resonance hybrid is the actual structure represented by all the contributors together.','No. The hybrid is the real structure; it does not flip between separate molecules.'));
ok('delocalized accepts plain No plus spread explanation',pass('delocalized','Delocalized electrons are electrons spread across more than one atom or bond instead of being fixed in one place.','No. They are distributed across multiple atoms and bonds instead of being locked in one bond.'));
ok('plain No alone still fails contributor application',!pass('contributor','It is another drawing of the same molecule where electrons move but the atom connections stay the same.','No.'));
ok('plain No alone still fails hybrid application',!pass('hybrid','The resonance hybrid is the actual structure represented by all the contributors together.','No.'));
ok('plain No alone still fails delocalized application',!pass('delocalized','Delocalized electrons are electrons spread across more than one atom or bond instead of being fixed in one place.','No.'));
ok('atoms do not move is accepted when used correctly',pass('contributor','It is another valid drawing of the same species where electrons move but atoms do not move and connectivity stays the same.','No. Hydrogen moved to another atom, so connectivity changed.'));
ok('sigma does not move is accepted when used correctly',pass('pi','A pi bond is the second bond in a double bond and its electrons can shift during resonance.','The pi electrons shift while the sigma bond does not move.'));
ok('not a plus sign contrast is accepted',pass('arrow','A curved arrow follows an electron pair. The tail is the source and the arrowhead shows the atom or bond where the pair goes.','The tail needs a lone pair or pi bond as an electron source, not a plus sign.'));
console.log('\nDay 3 vocabulary natural language v34: '+p+' passed, '+f+' failed');if(f)process.exit(1);
