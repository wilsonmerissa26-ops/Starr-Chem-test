"use strict";
var O = require("./day1-orchestrator.js");
var passed=0, failed=0;
function ok(name, cond){ if(cond){console.log("PASS  "+name);passed++;}else{console.log("FAIL  "+name);failed++;} }

var s=O.initialState();
ok("starts with highest-leverage math area", O.currentMathArea(s)==="logs");
ok("3/3 clears branch", O.routeMathProbe(s,3).action==="clear_area");
ok("2/3 targeted correction branch", O.routeMathProbe(s,2).verificationItems===2);
ok("0-1/3 mini lesson branch", O.routeMathProbe(s,1).independentItems===4);
O.markMathStatus(s,"Developing");
ok("developing queues next session", s.nextSessionQueue[0]==="logs");
ok("advances to algebra", O.currentMathArea(s)==="algebra");
O.addNotebookFact(s,"O has 6 valence electrons","TEACH");
O.addNotebookFact(s,"H has 1 valence electron","INDEPENDENT");
ok("notebook records TEACH only", s.notebook.length===1);
s.scaffoldLevel=0;
ok("notebook hidden at level 0", O.notebookVisible(s)===false);
O.scheduleReview(s,"algebra","repeated_idk");
ok("IDK creates same-session fresh review", O.nextAction(s).action==="fresh_same_session_review");
O.consumeReview(s);
O.setSubject(s,"chemistry");
s.chemistry.phase="watch";
ok("subject switch preserves math position", O.currentMathArea(s)==="algebra");
ok("chemistry resumes own phase", O.nextAction(s).action==="watch");
ok("unfinished skill is first next session", O.startNextSession(s).skillId==="logs");

var mem={v:null,setItem:function(k,v){this.v=v;},getItem:function(){return this.v;}};
O.save(s,mem); var restored=O.load(mem);
ok("local save restores subject", restored.subject==="chemistry");
ok("local save restores math position", restored.math.index===1);

console.log("\n"+passed+" passed, "+failed+" failed");
if(failed) process.exit(1);
