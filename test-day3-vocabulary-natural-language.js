'use strict';
var V=require('./day3/vocab-natural-language-v33.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

ok('contributor accepts plain No plus correct reason',pass('contributor','It is another drawing of the same molecule where electrons move but the atom connections stay the same.','No. The hydrogen moved to another carbon, so the connectivity changed.'));
ok('hybrid accepts plain No plus hybrid explanation',pass('hybrid','The resonance hybrid is the actual structure represented by all the contributors together.','No. The hybrid is the real structure; it does not flip between separate molecules.'));
ok('delocalized accepts plain No plus spread explanation',pass('delocalized','Delocalized electrons are electrons spread across more than one atom or bond instead of being fixed in one place.','No. They are distributed across multiple atoms and bonds instead of being locked in one bond.'));
ok('plain No alone still fails contributor application',!pass('contributor','It is another drawing of the same molecule where electrons move but the atom connections stay the same.','No.'));
ok('plain No alone still fails hybrid application',!pass('hybrid','The resonance hybrid is the actual structure represented by all the contributors together.','No.'));
ok('plain No alone still fails delocalized application',!pass('delocalized','Delocalized electrons are electrons spread across more than one atom or bond instead of being fixed in one place.','No.'));
console.log('\nDay 3 vocabulary natural language: '+p+' passed, '+f+' failed');if(f)process.exit(1);
