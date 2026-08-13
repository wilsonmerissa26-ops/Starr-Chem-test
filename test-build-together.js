/* ============================================================
   PIECE 4 — BUILD TOGETHER MODE BEHAVIORAL ACCEPTANCE TESTS
   Run: node test-build-together.js
   ============================================================ */

var B = require("./build-together.js");

var passed=0, failed=0;
function assert(label,cond){
  if(cond){ console.log("PASS  "+label); passed++; }
  else { console.log("FAIL  "+label); failed++; }
}

var NH3=B.BUILD_PLANS.NH3;
var H2O=B.BUILD_PLANS.H2O;

console.log("=== TEST 1: plans validate ===");
{
  assert("NH3 plan validates",B.validatePlan(NH3).valid===true);
  assert("H2O plan validates",B.validatePlan(H2O).valid===true);
}

console.log("\n=== TEST 2: session starts ready and exposes one action only ===");
{
  var s=B.createBuildTogetherSession(NH3,{timestamp:1000});
  assert("starts READY",s.status===B.BUILD_STATUS.READY);
  assert("starts on action 0",s.currentIndex===0);
  var p=B.currentPrompt(s,NH3);
  assert("prompt is step 1",p.stepNumber===1);
  assert("only current action id is exposed",p.actionId==="nh3_bt_1");
}

console.log("\n=== TEST 3: begin activates without advancing ===");
{
  var s=B.createBuildTogetherSession(NH3);
  var r=B.begin(s,NH3,1100);
  assert("status becomes ACTIVE",s.status===B.BUILD_STATUS.ACTIVE);
  assert("begin does not advance",s.currentIndex===0);
  assert("begin returns current prompt",r.prompt.actionId==="nh3_bt_1");
}

console.log("\n=== TEST 4: wrong action does not advance ===");
{
  var s=B.createBuildTogetherSession(NH3);
  B.begin(s,NH3);
  var r=B.submitAction(s,NH3,{type:B.ACTION.PLACE_ATOM,payload:{element:"O"}},1200);
  assert("wrong atom accepted as an attempt",r.accepted===true);
  assert("wrong atom marked incorrect",r.correct===false);
  assert("wrong atom does not advance",s.currentIndex===0);
  assert("specific wrong atom code returned",r.error.code==="WRONG_ATOM");
}

console.log("\n=== TEST 5: correct action advances exactly one step ===");
{
  var s=B.createBuildTogetherSession(NH3);
  var r=B.submitAction(s,NH3,{type:B.ACTION.PLACE_ATOM,payload:{element:"N"}},1300);
  assert("correct first action",r.correct===true);
  assert("advances exactly one step",s.currentIndex===1);
  assert("returns confirmation before next prompt",!!r.confirmation);
  assert("next prompt is step 2",r.prompt.stepNumber===2);
}

console.log("\n=== TEST 6: wrong action type is diagnosed separately ===");
{
  var s=B.createBuildTogetherSession(NH3);
  var r=B.submitAction(s,NH3,{type:B.ACTION.ADD_BOND,payload:{between:["N","H1"],order:1}});
  assert("wrong action type code",r.error.code==="WRONG_ACTION_TYPE");
  assert("still on first step",s.currentIndex===0);
}

console.log("\n=== TEST 7: bond endpoints may be tapped in either order ===");
{
  var s=B.createBuildTogetherSession(NH3);
  var correctActions=[
    {type:B.ACTION.PLACE_ATOM,payload:{element:"N"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}}
  ];
  correctActions.forEach(function(a){B.submitAction(s,NH3,a);});
  var r=B.submitAction(s,NH3,{type:B.ACTION.ADD_BOND,payload:{between:["H1","N"],order:1}});
  assert("reversed endpoint order is still correct",r.correct===true);
  assert("moves to next bond step",s.currentIndex===5);
}

console.log("\n=== TEST 8: wrong bond does not advance ===");
{
  var s=B.createBuildTogetherSession(NH3);
  [
    {type:B.ACTION.PLACE_ATOM,payload:{element:"N"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}}
  ].forEach(function(a){B.submitAction(s,NH3,a);});
  var r=B.submitAction(s,NH3,{type:B.ACTION.ADD_BOND,payload:{between:["H1","H2"],order:1}});
  assert("wrong bond code",r.error.code==="WRONG_BOND");
  assert("wrong bond stays on same step",s.currentIndex===4);
}

console.log("\n=== TEST 9: two wrong attempts on same step emit intervention signal ===");
{
  var s=B.createBuildTogetherSession(H2O);
  B.submitAction(s,H2O,{type:B.ACTION.PLACE_ATOM,payload:{element:"N"}});
  assert("one wrong has no escalation yet",B.interventionSignal(s)===null);
  B.submitAction(s,H2O,{type:B.ACTION.PLACE_ATOM,payload:{element:"C"}});
  var sig=B.interventionSignal(s);
  assert("two wrong attempts create signal",!!sig);
  assert("signal asks orchestrator to switch representation",sig.requestedAction==="SWITCH_REPRESENTATION");
  assert("does not auto-advance during escalation",s.currentIndex===0);
}

console.log("\n=== TEST 10: a correct move resets wrong-attempt count ===");
{
  var s=B.createBuildTogetherSession(H2O);
  B.submitAction(s,H2O,{type:B.ACTION.PLACE_ATOM,payload:{element:"N"}});
  assert("wrong count is 1",s.wrongAttemptsOnCurrentAction===1);
  B.submitAction(s,H2O,{type:B.ACTION.PLACE_ATOM,payload:{element:"O"}});
  assert("correct move resets wrong count",s.wrongAttemptsOnCurrentAction===0);
  assert("advanced to step 2",s.currentIndex===1);
}

console.log("\n=== TEST 11: NH3 completes only after every required action ===");
{
  var s=B.createBuildTogetherSession(NH3);
  var actions=[
    {type:B.ACTION.PLACE_ATOM,payload:{element:"N"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.ADD_BOND,payload:{between:["N","H1"],order:1}},
    {type:B.ACTION.ADD_BOND,payload:{between:["N","H2"],order:1}},
    {type:B.ACTION.ADD_BOND,payload:{between:["N","H3"],order:1}}
  ];
  actions.forEach(function(a){B.submitAction(s,NH3,a);});
  assert("not complete before lone pair",s.completed===false);
  var final=B.submitAction(s,NH3,{type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"N",count:1}},5000);
  assert("complete after lone pair",s.completed===true);
  assert("status COMPLETE",s.status===B.BUILD_STATUS.COMPLETE);
  assert("final response contains completion event",final.completion&&final.completion.type==="BUILD_TOGETHER_COMPLETED");
}

console.log("\n=== TEST 12: H2O requires two separate lone-pair placements ===");
{
  var s=B.createBuildTogetherSession(H2O);
  [
    {type:B.ACTION.PLACE_ATOM,payload:{element:"O"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H1"],order:1}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H2"],order:1}},
    {type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}}
  ].forEach(function(a){B.submitAction(s,H2O,a);});
  assert("one lone pair is not completion",s.completed===false);
  var final=B.submitAction(s,H2O,{type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}});
  assert("second lone pair completes H2O",final.completed===true);
}

console.log("\n=== TEST 13: cannot submit after completion ===");
{
  var s=B.createBuildTogetherSession(H2O);
  [
    {type:B.ACTION.PLACE_ATOM,payload:{element:"O"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H1"],order:1}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H2"],order:1}},
    {type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}},
    {type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}}
  ].forEach(function(a){B.submitAction(s,H2O,a);});
  var r=B.submitAction(s,H2O,{type:B.ACTION.PLACE_ATOM,payload:{element:"C"}});
  assert("post-completion action refused",r.accepted===false&&r.reason==="already_complete");
}

console.log("\n=== TEST 14: completion event is null before and populated after ===");
{
  var s=B.createBuildTogetherSession(H2O);
  assert("null before completion",B.completionEvent(s)===null);
  [
    {type:B.ACTION.PLACE_ATOM,payload:{element:"O"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.PLACE_ATOM,payload:{element:"H"}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H1"],order:1}},
    {type:B.ACTION.ADD_BOND,payload:{between:["O","H2"],order:1}},
    {type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}},
    {type:B.ACTION.ADD_LONE_PAIR,payload:{atom:"O",count:1}}
  ].forEach(function(a){B.submitAction(s,H2O,a);});
  var e=B.completionEvent(s);
  assert("event exists after completion",!!e);
  assert("event identifies lewis skill",e.skillId==="lewis_structures");
}

console.log("\n=== TEST 15: session survives JSON round-trip ===");
{
  var s=B.createBuildTogetherSession(NH3);
  B.submitAction(s,NH3,{type:B.ACTION.PLACE_ATOM,payload:{element:"N"}});
  B.submitAction(s,NH3,{type:B.ACTION.PLACE_ATOM,payload:{element:"O"}});
  var restored=JSON.parse(JSON.stringify(s));
  assert("currentIndex survives",restored.currentIndex===s.currentIndex);
  assert("attempt history survives",restored.attempts.length===s.attempts.length);
  assert("wrong-step count survives",restored.wrongAttemptsOnCurrentAction===s.wrongAttemptsOnCurrentAction);
}

console.log("\n=== TEST 16: symmetric atoms are interchangeable, bond order among equivalent hydrogens never matters ===");
{
  var s = B.createBuildTogetherSession(B.BUILD_PLANS.NH3);
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"N"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  var outOfOrder = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H2"], order:1}});
  assert("bonding a chemically equivalent hydrogen out of the plan's written order is accepted",
    outOfOrder.correct === true);
  var second = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H1"], order:1}});
  assert("the other remaining hydrogen is still accepted next", second.correct === true);
  var third = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H3"], order:1}});
  assert("the last hydrogen completes all three bonds", third.correct === true);
  var reuse = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_LONE_PAIR", payload:{atom:"N", count:1}});
  assert("sequence still completes normally with the lone pair after out-of-order bonding", reuse.completed === true);
}

console.log("\n=== TEST 17: the same hydrogen instance cannot be bonded twice, that IS a real error ===");
{
  var s = B.createBuildTogetherSession(B.BUILD_PLANS.NH3);
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"N"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H1"], order:1}});
  var reused = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H1"], order:1}});
  assert("bonding the identical hydrogen instance a second time is correctly rejected", reused.correct === false);
}

console.log("\n=== TEST 18: a fabricated instance label is rejected even though it reads as the right element ===");
{
  var s = B.createBuildTogetherSession(B.BUILD_PLANS.NH3);
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"N"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  B.submitAction(s, B.BUILD_PLANS.NH3, {type:"PLACE_ATOM", payload:{element:"H"}});
  var fake = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H99"], order:1}});
  assert("H99 reads as hydrogen by element but was never actually placed, correctly rejected", fake.correct === false);
  var stillOpen = B.submitAction(s, B.BUILD_PLANS.NH3, {type:"ADD_BOND", payload:{between:["N","H1"], order:1}});
  assert("a real hydrogen instance still works normally right after the fake one was rejected", stillOpen.correct === true);
}

console.log("\n=== FINAL SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed > 0) process.exit(1);
