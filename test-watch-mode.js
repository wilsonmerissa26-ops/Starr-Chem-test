/* ============================================================
   PIECE 3 — WATCH MODE BEHAVIORAL ACCEPTANCE TESTS
   Run: node test-watch-mode.js

   These tests enforce the frozen Watch Mode semantics:
   - student-controlled pacing only
   - Next advances exactly one step
   - Back reverts exactly one step
   - Replay repeats current step only
   - Pause blocks advancement and resumes in place
   - notebook facts emit while teaching happens
   - completion is explicit and reportable to the orchestrator
   ============================================================ */

var W = require("./watch-mode.js");

var passed = 0, failed = 0;
function assert(label, cond) {
  if (cond) { console.log("PASS  " + label); passed++; }
  else { console.log("FAIL  " + label); failed++; }
}

var NH3 = W.WATCH_SEQUENCES.NH3;
var H2O = W.WATCH_SEQUENCES.H2O;

console.log("=== TEST 1: frozen sequences validate ===");
{
  assert("NH3 sequence validates", W.validateSequence(NH3).valid === true);
  assert("H2O sequence validates", W.validateSequence(H2O).valid === true);
}

console.log("\n=== TEST 2: session starts at step 1 and does not auto-advance ===");
{
  var s = W.createWatchSession(NH3, {timestamp:1000});
  assert("starts READY", s.status === W.WATCH_STATUS.READY);
  assert("starts at index 0", s.currentIndex === 0);
  assert("not complete", s.completed === false);

  var v1 = W.currentView(s, NH3);
  var v2 = W.currentView(s, NH3);
  assert("reading the view twice does not change the step", v1.currentIndex === 0 && v2.currentIndex === 0);
}

console.log("\n=== TEST 3: begin emits the first teaching fact immediately ===");
{
  var s = W.createWatchSession(NH3, {timestamp:1000});
  var r = W.begin(s, NH3, 1100);
  assert("begin changes status to PLAYING", s.status === W.WATCH_STATUS.PLAYING);
  assert("still on step 1", s.currentIndex === 0);
  assert("nitrogen fact emitted during teaching, not after success",
    r.notebookFacts.some(function(f){ return f.id === "fact_n_valence_5"; }));
}

console.log("\n=== TEST 4: Next advances exactly one step ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  var a = W.next(s, NH3);
  assert("one Next advances from index 0 to 1", s.currentIndex === 1);
  assert("does not skip to index 2", s.currentIndex !== 2);
  assert("hydrogen fact emitted on step 2",
    a.notebookFacts.some(function(f){ return f.id === "fact_h_valence_1"; }));
  W.next(s, NH3);
  assert("second Next advances exactly one more step", s.currentIndex === 2);
}

console.log("\n=== TEST 5: Back reverts exactly one step ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  W.next(s, NH3); // 1
  W.next(s, NH3); // 2
  var before = s.currentIndex;
  W.back(s, NH3);
  assert("Back moves back exactly one", s.currentIndex === before - 1);
  W.back(s, NH3);
  assert("second Back moves back one again", s.currentIndex === 0);
  var atStart = W.back(s, NH3);
  assert("Back at the first step is refused explicitly", atStart.changed === false && atStart.reason === "at_start");
}

console.log("\n=== TEST 6: Replay repeats current step only ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  W.next(s, NH3);
  W.next(s, NH3);
  var before = s.currentIndex;
  var stepId = W.currentStep(s, NH3).id;
  var r = W.replay(s, NH3);
  assert("Replay does not change currentIndex", s.currentIndex === before);
  assert("Replay count is attached to current step", s.replayCountByStepId[stepId] === 1);
  assert("Replay reports current-step replay", r.reason === "replay_current_step");
}

console.log("\n=== TEST 7: Pause freezes advancement and resumes exactly where it paused ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  W.next(s, NH3);
  var pausedAt = s.currentIndex;
  var p = W.pause(s, NH3);
  assert("Pause sets paused=true", s.paused === true);
  assert("status becomes PAUSED", s.status === W.WATCH_STATUS.PAUSED);
  var blocked = W.next(s, NH3);
  assert("Next while paused is blocked", blocked.changed === false && blocked.reason === "paused");
  assert("paused step did not change", s.currentIndex === pausedAt);

  var resume = W.pause(s, NH3);
  assert("second Pause toggles to resume", resume.reason === "resumed");
  assert("resume leaves student on the same step", s.currentIndex === pausedAt);
  W.next(s, NH3);
  assert("Next works after resume", s.currentIndex === pausedAt + 1);
}

console.log("\n=== TEST 8: notebook facts do not duplicate on Back/Replay ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);           // fact_n_valence_5
  W.next(s, NH3);            // H facts
  var countBefore = s.notebookEntryIdsEmitted.length;
  W.back(s, NH3);
  W.replay(s, NH3);
  W.next(s, NH3);
  assert("revisiting a taught step does not duplicate notebook entries",
    s.notebookEntryIdsEmitted.length === countBefore);
}

console.log("\n=== TEST 9: NH3 electron counter progression matches the frozen sequence ===");
{
  var expected = [
    [5,0,5],
    [8,0,8],
    [8,0,8],
    [8,2,6],
    [8,4,4],
    [8,6,2],
    [8,6,2],
    [8,8,0],
    [8,8,0]
  ];
  var ok = NH3.steps.every(function(step, i){
    var c = step.visual.counter;
    return c.available === expected[i][0] &&
           c.placed === expected[i][1] &&
           c.remaining === expected[i][2];
  });
  assert("all NH3 counters match the specified teaching sequence", ok);
}

console.log("\n=== TEST 10: H2O reaches the correct final electron accounting ===");
{
  var finalStep = H2O.steps[H2O.steps.length - 1];
  assert("H2O ends with 8 available", finalStep.visual.counter.available === 8);
  assert("H2O ends with 8 placed", finalStep.visual.counter.placed === 8);
  assert("H2O ends with 0 remaining", finalStep.visual.counter.remaining === 0);
  assert("H2O final visual has two lone pairs",
    finalStep.visual.lonePairs.length === 2);
}

console.log("\n=== TEST 11: completion requires an explicit final Next ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  while (s.currentIndex < NH3.steps.length - 1) {
    W.next(s, NH3);
  }
  assert("arriving at final teaching step does not auto-complete", s.completed === false);
  var r = W.next(s, NH3, 9999);
  assert("explicit Next from final step marks complete", s.completed === true);
  assert("status becomes COMPLETE", s.status === W.WATCH_STATUS.COMPLETE);
  assert("completion payload is returned", r.completion && r.completion.skillId === NH3.skillId);
}

console.log("\n=== TEST 12: completed session cannot advance again ===");
{
  var s = W.createWatchSession(H2O);
  W.begin(s, H2O);
  while (s.currentIndex < H2O.steps.length - 1) W.next(s, H2O);
  W.next(s, H2O);
  var after = W.next(s, H2O);
  assert("Next after completion is refused", after.changed === false && after.reason === "already_complete");
}

console.log("\n=== TEST 13: Back from complete reopens the sequence one step earlier ===");
{
  var s = W.createWatchSession(H2O);
  W.begin(s, H2O);
  while (s.currentIndex < H2O.steps.length - 1) W.next(s, H2O);
  W.next(s, H2O);
  assert("precondition complete", s.completed === true);
  W.back(s, H2O);
  assert("Back clears completed flag", s.completed === false);
  assert("Back moves to previous step", s.currentIndex === H2O.steps.length - 2);
}

console.log("\n=== TEST 14: completion event is null before completion and populated after ===");
{
  var s = W.createWatchSession(NH3);
  assert("no completion event before completion", W.completionEvent(s, NH3) === null);
  W.begin(s, NH3);
  while (s.currentIndex < NH3.steps.length - 1) W.next(s, NH3);
  W.next(s, NH3, 12345);
  var e = W.completionEvent(s, NH3);
  assert("completion event exists afterward", !!e);
  assert("completion event type is WATCH_COMPLETED", e.type === "WATCH_COMPLETED");
  assert("completion event identifies the skill", e.skillId === "lewis_structures");
}

console.log("\n=== TEST 15: session shape survives JSON round-trip ===");
{
  var s = W.createWatchSession(NH3);
  W.begin(s, NH3);
  W.next(s, NH3);
  W.pause(s, NH3);
  var restored = JSON.parse(JSON.stringify(s));
  assert("currentIndex survives", restored.currentIndex === s.currentIndex);
  assert("pause state survives", restored.paused === true);
  assert("notebook emissions survive", restored.notebookEntryIdsEmitted.length === s.notebookEntryIdsEmitted.length);
}

console.log("\n=== SUMMARY: " + passed + " passed, " + failed + " failed ===");
if (failed > 0) process.exit(1);
