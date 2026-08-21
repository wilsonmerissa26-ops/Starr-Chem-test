'use strict';
var V=require('./day3/vocab-production-v34.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}
function term(id){return V.TERMS.find(function(t){return t.id===id;});}
function pass(id,d,u){return V.gradeTerm(term(id),d,u).pass;}

// Contradictions cannot pass merely because they contain rubric words.
ok('contributor rejects electrons-do-not-move contradiction',!pass('contributor','It is the same species and the electrons do not move.','No. The hydrogen moved to a different carbon so connectivity changed.'));
ok('hybrid rejects not-real contradiction',!pass('hybrid','It is not the real structure; the contributors together describe it.','No. The hybrid is not real.'));
ok('delocalized rejects not-spread contradiction',!pass('delocalized','Electrons are not spread across more than one atom or bond.','No. They are spread across more than one atom or bond.'));
ok('pi rejects negated pi definition',!pass('pi','A pi bond is not the second bond in a double bond and its electrons do not move in resonance.','The pi electrons cannot shift; the sigma bond stays fixed.'));
ok('arrow rejects negated source/destination definition',!pass('arrow','A curved arrow shows electrons moving, but the tail is not the source and the head is not the destination.','A plus sign is the source at the tail.'));

// A bag of remembered clues is not an explanation.
ok('contributor rejects keyword salad',!pass('contributor','same species electron placement','No hydrogen different carbon'));
ok('hybrid rejects keyword salad',!pass('hybrid','real structure contributors together','No hybrid real'));
ok('arrow rejects keyword salad',!pass('arrow','electron move tail source head destination','electron pair tail'));

// Correct natural language must remain accepted without exact phrasing.
ok('contributor accepts concise natural explanation',pass('contributor','Another valid drawing of the same molecule where only the electrons are rearranged; the atoms stay connected the same way.','No, because the hydrogen moved, which changes the connectivity.'));
ok('hybrid accepts concise natural explanation',pass('hybrid','The hybrid is the actual molecule described by all the resonance contributors together.','No. It does not flip between drawings; the hybrid is the real structure.'));
ok('delocalized accepts singular grammar',pass('delocalized','Electrons are spread over more than one atom or bond instead of staying in one place.','No, they are spread over more than one atom or bond.'));
ok('pi accepts natural definition and fixed sigma statement',pass('pi','A pi bond is the second bond in a double bond from side-by-side p orbital overlap, and its electrons can shift in resonance.','The pi part can shift; the sigma bond stays fixed.'));
ok('arrow accepts natural source-to-destination explanation',pass('arrow','A curved arrow tracks an electron pair moving from its source at the tail to the atom or bond at the arrowhead.','An electron pair such as a lone pair or pi bond must be at the tail.'));

// Correct negation is not treated as contradiction.
ok('contributor accepts atoms-do-not-move statement',pass('contributor','It is a valid drawing of the same species where electrons move but the atoms and connectivity stay the same.','No. The hydrogen moved, so the atom connectivity changed.'));
ok('hybrid accepts does-not-switch statement',pass('hybrid','The hybrid is the real structure represented by the contributors together.','No. The molecule does not switch between contributors; the hybrid is the actual structure.'));
ok('delocalized accepts not-confined statement',pass('delocalized','Delocalized electrons are shared across multiple atoms or bonds and are not confined to one place.','No. They are spread across more than one atom or bond.'));
ok('pi accepts sigma-does-not-move statement',pass('pi','The pi bond is the second bond of a double bond and its electron pair can shift during resonance.','The pi electrons shift; the sigma bond does not move.'));
ok('arrow accepts not-plus-sign contrast',pass('arrow','A curved arrow shows an electron pair moving: the tail is the source and the head shows the atom or bond where it goes.','The tail needs an electron source such as a lone pair or pi bond, not a plus sign.'));

// Migration: any learner who passed the old recognition-only vocabulary must be gated back through v34.
['vocab','teach','guided','practice','transfer','mastered','developing'].forEach(function(screen){
  ok('production vocabulary takes over old '+screen+' state',V.shouldTakeOver({gateResolved:true,screen:screen,vocabIndex:5,vocabProductionVersion:2,vocab:{}}));
});
ok('production vocabulary does not interrupt prerequisite gate',!V.shouldTakeOver({gateResolved:false,screen:'gate'}));
ok('production vocabulary does not interrupt home',!V.shouldTakeOver({gateResolved:false,screen:'home'}));

var independent={};V.TERMS.forEach(function(t){independent[t.id]='independent';});
ok('v34 completed state requires every term independent',V.doneMain({vocabProductionVersion:3,vocabIndex:5,vocab:independent}));
var supported=Object.assign({},independent,{arrow:'supported'});
ok('supported term prevents vocabulary completion',!V.doneMain({vocabProductionVersion:3,vocabIndex:5,vocab:supported}));
ok('old v2 completion is not trusted',!V.doneMain({vocabProductionVersion:2,vocabIndex:5,vocab:independent}));

var bad=V.gradeTerm(term('contributor'),'It is the same species and the electrons do not move.','No. The hydrogen moved so connectivity changed.');
var fb=V.feedbackFor(term('contributor'),bad);
ok('feedback exposes conflicting idea separately',fb.wrong.length>0);
ok('feedback still identifies missing concept pieces',Array.isArray(fb.missing));

console.log('\nDay 3 vocabulary red-team v34: '+p+' passed, '+f+' failed');if(f)process.exit(1);
