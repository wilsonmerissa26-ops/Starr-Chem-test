var P=require('./chemistry-mastery-progression.js');var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

var s=P.create();
ok('starts with NH3 teacher demo',P.current(s).molecule==='NH3'&&P.current(s).phase==='learning');
ok('teacher demo can advance',P.next(s).advanced&&P.current(s).molecule==='H2O');
P.record(s,{subskill:'full_build',correct:true});
ok('H2O guided work is supported',s.mastery.attempts[0].independent===false);
ok('H2O guided work does not count toward mastery',s.mastery.attempts[0].countsTowardMastery===false);
ok('correct guided H2O advances',P.next(s).advanced&&P.current(s).molecule==='CH4');
P.record(s,{subskill:'full_build',correct:true});
ok('independent CH4 advances',P.next(s).advanced&&P.current(s).molecule==='H2S');
P.record(s,{subskill:'error_analysis',correct:true});
ok('independent H2S advances',P.next(s).advanced&&P.current(s).molecule==='PH3');
ok('not mastered before unseen transfer',!P.status(s).mastery.mastered);
P.record(s,{subskill:'full_build',correct:true});var end=P.next(s);
ok('three independent forms including transfer can complete mastery',end.finished&&end.mastery.mastered);
ok('retrieval scheduled after mastery',!!end.retrieval&&end.retrieval.status==='scheduled');

var r=P.create();P.next(r);P.record(r,{correct:true});P.next(r);
P.record(r,{subskill:'full_build',correct:false,errorType:'central_atom',supported:true,supportLevel:'reteach'});
ok('wrong CH4 creates targeted repair',P.status(r).repair.errorType==='central_atom');
P.record(r,{subskill:'full_build',correct:true,supported:true,supportLevel:'requested-help'});
ok('supported corrected CH4 does not count independent',r.mastery.attempts[r.mastery.attempts.length-1].countsTowardMastery===false);
P.next(r);P.record(r,{subskill:'error_analysis',correct:true});P.next(r);P.record(r,{subskill:'full_build',correct:true});var needMore=P.next(r);
ok('passing transfer after supported CH4 does not fake mastery',!needMore.finished&&!needMore.mastery.mastered);
ok('insufficient evidence adds fresh SiH4 repair',needMore.advanced&&needMore.repairRequired&&P.current(r).molecule==='SiH4');
P.record(r,{subskill:'full_build',correct:true});var repaired=P.next(r);
ok('fresh independent SiH4 can satisfy missing evidence',repaired.finished&&repaired.mastery.mastered);
ok('repair path schedules retrieval after real mastery',!!repaired.retrieval&&repaired.retrieval.status==='scheduled');

console.log('\nChemistry progression: '+p+' passed, '+f+' failed');if(f)process.exit(1);
