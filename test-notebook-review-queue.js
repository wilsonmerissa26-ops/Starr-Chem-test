var M=require('./student-model-idk-router.js');
var N=require('./notebook-review-queue.js');
var p=0,f=0;function ok(n,c){if(c){console.log('PASS  '+n);p++;}else{console.log('FAIL  '+n);f++;}}

var skill=M.createSkill('lewis_structure');
var book=N.createNotebook();
M.startTeaching(skill);
var e1=N.writeNotebookFact(book,skill,{id:'n5',text:'Nitrogen brings 5 valence electrons.',sourceState:'TEACHING',sourceItemId:'nh3-teach',timestamp:100});
ok('TEACH fact writes immediately',book.entries.length===1&&e1.id==='n5');
ok('skill links notebook fact immediately',skill.notebookEntries[0]==='n5');
N.writeNotebookFact(book,skill,{id:'n5',text:'duplicate',sourceState:'TEACHING'});
ok('duplicate fact id does not duplicate notebook',book.entries.length===1&&skill.notebookEntries.length===1);
M.moveToWatch(skill);
N.writeNotebookFact(book,skill,{id:'h1',text:'Hydrogen brings 1 valence electron.',sourceState:'WATCH',sourceItemId:'nh3-teach'});
ok('WATCH fact writes immediately',book.entries.length===2);
skill.scaffoldLevel=M.SCAFFOLD.NOTEBOOK;
ok('notebook visible at scaffold 1',N.notebookAvailable(skill)&&N.visibleNotebookEntries(book,skill).length===2);
skill.scaffoldLevel=M.SCAFFOLD.COLD;
ok('notebook absent at cold scaffold 0',!N.notebookAvailable(skill)&&N.visibleNotebookEntries(book,skill).length===0);
var rejected=false;try{N.writeNotebookFact(book,skill,{id:'bad',text:'late fact',sourceState:'MASTERED'})}catch(e){rejected=true}
ok('post-teaching state cannot write a new notebook fact',rejected);

var q=N.createReviewQueue();
var s2=M.createSkill('algebra_linear');s2.state=M.STATES.GUIDED;s2.scaffoldLevel=M.SCAFFOLD.EXPLICIT;
var skip=N.recordSkip(q,s2,{itemType:'two_sided_linear',itemId:'alg_A',lastIdkReason:'dont_know_how_to_start',attemptsBeforeSkip:2,timestamp:200});
ok('skip marks skill developing',s2.state===M.STATES.DEVELOPING);
ok('skip enters same-session review queue',q.sameSession.length===1&&skip.sourceItemId==='alg_A');
var bank={algebra_linear:[{id:'alg_A',itemType:'two_sided_linear'},{id:'alg_B',itemType:'two_sided_linear'},{id:'alg_C',itemType:'one_sided_linear'}]};
var returned=N.popSameSession(q,bank,{algebra_linear:[]});
ok('same-session return uses fresh item, never skipped original',returned.item&&returned.item.id==='alg_B');

var s3=M.createSkill('electron_count');
var r1=N.recordIdkForReview(q,s3,{itemType:'valence_total',itemId:'ec_A',reason:'dont_understand_concept'});
var r2=N.recordIdkForReview(q,s3,{itemType:'valence_total',itemId:'ec_B',reason:'dont_understand_concept'});
ok('first IDK does not queue same-session return',!r1.queued);
ok('second IDK on same item type queues review',r2.queued&&q.sameSession.length===1);
var fresh=N.selectFreshReviewItem(r2.entry,[{id:'ec_B',itemType:'valence_total'},{id:'ec_C',itemType:'valence_total'}],['ec_A']);
ok('IDK review excludes source and recently seen items',fresh&&fresh.id==='ec_C');

var s4=M.createSkill('logs');s4.state=M.STATES.GUIDED;
var close=N.closeSessionSkill(q,s4,{itemType:'log_rewrite',itemId:'log_A'});
ok('session-end unfinished skill becomes developing',close.queued&&s4.state===M.STATES.DEVELOPING);
ok('unfinished skill enters next-session queue',q.nextSession.length===1);
var first=N.nextSessionFirst(q,{logs:[{id:'log_A',itemType:'log_rewrite'},{id:'log_B',itemType:'log_rewrite'}]},{logs:[]});
ok('next session surfaces developing skill before new content with fresh item',first&&first.item&&first.item.id==='log_B');
var s5=M.createSkill('already_good');s5.state=M.STATES.INDEPENDENT_SUCCESS;
ok('independent success is not requeued next session',!N.closeSessionSkill(q,s5).queued);

console.log('\nNotebook + Review Queue: '+p+' passed, '+f+' failed');if(f)process.exit(1);
