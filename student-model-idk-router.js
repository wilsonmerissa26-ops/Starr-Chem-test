/* ============================================================
   STUDENT MODEL + IDK ROUTER
   Build order piece 1 and 2, per DR_MERISSA_TEACHING_ENGINE_SPEC.md
   Sections 2 (Student Model) and 6 (IDK tree, 3-branch v1).
   Pure logic. No DOM. No rendering. Testable in isolation,
   per the modular build strategy: separate pieces, integrate last.
   ============================================================ */

var STATES = {
  NOT_STARTED: "NOT_STARTED",
  TEACHING: "TEACHING",
  WATCH: "WATCH",
  BUILD_TOGETHER: "BUILD_TOGETHER",
  GUIDED: "GUIDED",
  INDEPENDENT_ATTEMPTED: "INDEPENDENT_ATTEMPTED",
  INDEPENDENT_SUCCESS: "INDEPENDENT_SUCCESS",
  EXPLAIN_WHY: "EXPLAIN_WHY",
  MASTERY_CHECK: "MASTERY_CHECK",
  MASTERED: "MASTERED",
  DEVELOPING: "DEVELOPING",
  REVIEW_DUE: "REVIEW_DUE"
};

var SCAFFOLD = { WORKED: 4, EXPLICIT: 3, PARTIAL: 2, NOTEBOOK: 1, COLD: 0 };

/* ---------------- Student Model (Section 2) ---------------- */

var MIN_RETRIEVAL_DELAY_MS = 3 * 60 * 1000; // Section 2: "a few minutes later," not back-to-back

function createSkill(id) {
  return {
    id: id,
    state: STATES.NOT_STARTED,
    scaffoldLevel: SCAFFOLD.WORKED,
    attempts: [],
    idkSelections: [],
    notebookEntries: [],
    consecutiveWrong: 0,
    lastRepresentationIndex: -1,
    atScaffoldCeiling: false,   // was only ever added dynamically before, now part of the real shape from creation
    independentSuccesses: [],  // { scaffoldLevel, correctExplanation, itemId, timestamp }. NOTE: no sessionId yet,
                                // the spec's "later in the same session" language needs one once session handling
                                // exists at integration. Tracked here as a pending requirement, not silently dropped.
    masteryEvidenceValidAfter: 0, // cold successes at or before this timestamp no longer count toward mastery,
                                   // bumped forward every time remediation opens, see handleIdk and handleWrongAttempt
    remediation: null,         // active remediation gate, see Section 6/15 fix below
    recentlySeenItemIds: [],   // rolling exclusion window, prevents A/B/A/B bouncing
    reviewDue: null
  };
}

function startTeaching(skill) {
  skill.state = STATES.TEACHING;
  skill.scaffoldLevel = SCAFFOLD.WORKED;
  return skill;
}

function moveToWatch(skill) { skill.state = STATES.WATCH; return skill; }
function moveToBuildTogether(skill) { skill.state = STATES.BUILD_TOGETHER; return skill; }
function moveToGuided(skill) { skill.state = STATES.GUIDED; skill.scaffoldLevel = SCAFFOLD.EXPLICIT; return skill; }

function recordAttempt(skill, itemId, correct, errorCode, timestamp, input) {
  skill.attempts.push({
    itemId: itemId, input: input == null ? null : input, correct: !!correct, errorCode: errorCode || null,
    scaffoldLevelAtAttempt: skill.scaffoldLevel, timestamp: timestamp || Date.now()
  });
  if (correct) {
    skill.consecutiveWrong = 0;
  } else {
    skill.consecutiveWrong += 1;
  }
  return skill;
}

// Section 4: two guided successes in a row -> INDEPENDENT
function checkGuidedAdvance(skill) {
  var last2 = skill.attempts.slice(-2);
  if (skill.state === STATES.GUIDED && last2.length === 2 &&
      last2.every(function(a){ return a.correct && a.scaffoldLevelAtAttempt <= SCAFFOLD.EXPLICIT; })) {
    skill.state = STATES.INDEPENDENT_ATTEMPTED;
    skill.scaffoldLevel = SCAFFOLD.PARTIAL;
    return true;
  }
  return false;
}

function recordIndependentAttempt(skill, itemId, correct, correctExplanation, timestamp, input) {
  recordAttempt(skill, itemId, correct, null, timestamp, input);
  if (correct) {
    skill.independentSuccesses.push({
      scaffoldLevel: skill.scaffoldLevel,
      correctExplanation: !!correctExplanation,
      itemId: itemId,
      timestamp: timestamp || Date.now()
    });
    skill.state = STATES.INDEPENDENT_SUCCESS;
  }
  return skill;
}

// Small shared invariant check. Not the full transition-guard system, that's
// explicitly a later pass once integration exists, this is just the one check
// both fixes below need, factored out so it can't drift out of sync between them.
function isRemediationActive(skill) {
  return !!(skill.remediation && skill.remediation.active);
}

// Section 2: MASTERED requires all three conditions, not one correct answer.
// The second success must be a DIFFERENT item AND at least MIN_RETRIEVAL_DELAY_MS
// later, per the spec's own "a few minutes later" language. Two back-to-back
// correct answers are not retrieval evidence, they're one long attempt.
// Also: mastery can never be claimed while remediation is actively open, even
// if older qualifying evidence exists, AND once remediation has opened at all,
// evidence from before that point stops qualifying, even after remediation
// closes successfully. Confusion serious enough to open remediation is itself
// a signal the earlier evidence may no longer describe her, and the model
// should not hand back an old verdict just because remediation later resolved
// cleanly. Nothing is deleted, independentSuccesses keeps full history, this
// only changes what counts as CURRENT evidence.
function evaluateMastery(skill) {
  if (isRemediationActive(skill)) {
    return { mastered: false, reason: "mastery evaluation blocked while remediation is active" };
  }

  var cutoff = skill.masteryEvidenceValidAfter || 0;
  var coldSuccess = skill.independentSuccesses.find(function(s){
    return s.scaffoldLevel === SCAFFOLD.COLD && s.correctExplanation && s.timestamp > cutoff;
  });
  if (!coldSuccess) return { mastered: false, reason: "no cold success with valid explanation since the last time remediation opened" };

  var distinctItemLater = skill.independentSuccesses.find(function(s){
    return s.scaffoldLevel === SCAFFOLD.COLD &&
           s.correctExplanation &&
           s.timestamp > cutoff &&
           s.itemId !== coldSuccess.itemId &&
           s.timestamp >= coldSuccess.timestamp + MIN_RETRIEVAL_DELAY_MS;
  });
  if (!distinctItemLater) return { mastered: false, reason: "no second distinct cold success at least " + (MIN_RETRIEVAL_DELAY_MS/60000) + " minutes later yet" };

  skill.state = STATES.MASTERED;
  return { mastered: true, reason: "cold success with explanation, confirmed on a second distinct item after a real retrieval delay" };
}

// Section 4/7: IDK, or two wrong attempts in a row, means MORE support, not less.
// The ladder is ascending by support: COLD(0) has the least, WORKED(4) the most.
// "Regress" moves toward more support. If a skill is already at the ceiling (4),
// there is no more same-skill scaffolding to add, that's the exact trigger for
// Section 15's prerequisite regression to a DIFFERENT, earlier skill node, not
// a same-skill bump. This function correctly signals that case rather than
// silently doing nothing.
var SCAFFOLD_ASCENDING_SUPPORT = [SCAFFOLD.COLD, SCAFFOLD.NOTEBOOK, SCAFFOLD.PARTIAL, SCAFFOLD.EXPLICIT, SCAFFOLD.WORKED];
function regressOneLevel(skill) {
  var idx = SCAFFOLD_ASCENDING_SUPPORT.indexOf(skill.scaffoldLevel);
  if (idx >= SCAFFOLD_ASCENDING_SUPPORT.length - 1) {
    // Already at maximum same-skill support. Cross-skill prerequisite
    // regression (Section 15) is a later build step, dependency graph
    // integration, not yet wired here. Flagged honestly, not silently ignored.
    skill.state = STATES.DEVELOPING;
    skill.atScaffoldCeiling = true;
    return skill;
  }
  skill.scaffoldLevel = SCAFFOLD_ASCENDING_SUPPORT[idx + 1];
  skill.state = STATES.DEVELOPING;
  skill.atScaffoldCeiling = false;
  return skill;
}

/* ---------------- IDK Router (Section 6, 3-branch v1) ---------------- */
// Per Section 17: ship 3 of 6 reasons now, table has room for the other 3 later.

var IDK_REASONS = {
  DONT_UNDERSTAND: "dont_understand_concept",   // -> concept reteach
  DONT_KNOW_START: "dont_know_how_to_start",    // -> first-decision modeling
  SHOW_EXAMPLE: "show_me_example"               // -> Watch mode worked example
};

var IDK_ACTIONS = {};
IDK_ACTIONS[IDK_REASONS.DONT_UNDERSTAND] = "CONCEPT_RETEACH";
IDK_ACTIONS[IDK_REASONS.DONT_KNOW_START] = "MODEL_FIRST_DECISION";
IDK_ACTIONS[IDK_REASONS.SHOW_EXAMPLE] = "WATCH_MODE_EXAMPLE";

// Section 6: IDK -> teach/remediate -> confirm the smaller prerequisite -> THEN
// select a fresh original-level item. Three separate events, not one synchronous
// call. Handing back a next item at the moment IDK is pressed can reproduce the
// exact "explanation, then next question" pattern this engine exists to prevent,
// regardless of what the bookkeeping around it looks like.
//
// Item selection excludes a rolling window of recently seen items, not just the
// immediately current one, so a small bank can't bounce A/B/A/B forever.
function selectFreshItem(itemBank, excludedIds) {
  var candidates = itemBank.filter(function(it){ return excludedIds.indexOf(it.id) === -1; });
  if (candidates.length === 0) return null;
  return candidates[0];
}
function trackRecentlySeen(skill, itemId) {
  if (!itemId) return;
  skill.recentlySeenItemIds.push(itemId);
  if (skill.recentlySeenItemIds.length > 4) skill.recentlySeenItemIds.shift();
}

// STEP 1: opens a remediation gate. Deliberately returns no next item.
function handleIdk(skill, reason, currentItemId, requiredSkillId, timestamp) {
  if (!IDK_ACTIONS[reason]) {
    throw new Error("Unknown IDK reason for v1 router: " + reason);
  }
  skill.idkSelections.push({ reason: reason, timestamp: timestamp || Date.now() });
  regressOneLevel(skill);
  trackRecentlySeen(skill, currentItemId); // she is leaving this item, it counts as recently seen NOW,
                                            // not only if and when something later happens to hand it back out
  var confusionAt = timestamp || Date.now();
  skill.masteryEvidenceValidAfter = Math.max(skill.masteryEvidenceValidAfter || 0, confusionAt);
  var interventionType = skill.atScaffoldCeiling ? "ESCALATE_TO_PREREQUISITE_REGRESSION" : IDK_ACTIONS[reason];
  skill.remediation = {
    active: true,
    reason: "idk_" + reason,
    originatingItemId: currentItemId,
    requiredSkillId: requiredSkillId || null,
    interventionType: interventionType,
    representationHistory: [],
    prerequisiteCheckPassed: false,
    prerequisiteAttempts: [],
    needsEscalation: false,
    returnItemId: null
  };
  return { action: interventionType, remediationActive: true };
}

// STEP 2: the smaller prerequisite check. This has to have a real failure path,
// not just a success path. A wrong answer here previously did nothing at all,
// the remediation object came out byte-identical to how it went in, no
// escalation, no representation change, nothing for the caller to act on.
function recordRemediationCheck(skill, correct, checkItemId, timestamp) {
  if (!isRemediationActive(skill)) {
    throw new Error("recordRemediationCheck called with no active remediation");
  }
  skill.remediation.prerequisiteAttempts.push({
    itemId: checkItemId || null, correct: !!correct, timestamp: timestamp || Date.now()
  });

  if (correct) {
    skill.remediation.prerequisiteCheckPassed = true;
    skill.remediation.needsEscalation = false;
    return { passed: true, needsEscalation: false, representation: null };
  }

  // Wrong on the prerequisite check itself. Remediation stays open, nothing
  // exits. Section 6's modality rule applies at this level too, don't just
  // ask the same smaller question again, switch how it's being taught.
  trackRecentlySeen(skill, checkItemId);
  var rep = nextRepresentation(skill);
  skill.remediation.representationHistory.push(rep);
  skill.remediation.prerequisiteCheckPassed = false; // stays false, set explicitly, not just left alone

  var wrongCount = skill.remediation.prerequisiteAttempts.filter(function(a){ return !a.correct; }).length;
  skill.remediation.needsEscalation = wrongCount >= 2;

  return { passed: false, needsEscalation: skill.remediation.needsEscalation, representation: rep };
}

// Companion to recordRemediationCheck's failure path: get a genuinely
// different item to retry the prerequisite check itself, not the parent
// skill. Same exclusion discipline as everywhere else, explicit null on
// exhaustion, never a silent recycle.
function nextRemediationCheckItem(skill, prerequisiteBank) {
  if (!isRemediationActive(skill)) return { item: null, reason: "no_active_remediation" };
  var fresh = selectFreshItem(prerequisiteBank, skill.recentlySeenItemIds);
  if (!fresh) return { item: null, reason: "bank_exhausted" };
  return { item: fresh, reason: null };
}

// STEP 3: only callable, and only successful, once the gate is actually open.
// Three distinct outcomes now, not two: still gated, genuinely exited, or
// exhausted. Exhaustion does NOT close the gate on nothing and does NOT
// recycle a stale item to fake variety, the caller has to actually decide
// what happens next, exactly as it should.
function exitRemediation(skill, itemBank) {
  if (!isRemediationActive(skill)) {
    return { allowed: false, nextItem: null, reason: "no_active_remediation" };
  }
  if (!skill.remediation.prerequisiteCheckPassed) {
    return { allowed: false, nextItem: null, reason: "prerequisite_not_yet_passed" };
  }
  var fresh = selectFreshItem(itemBank, skill.recentlySeenItemIds);
  if (!fresh) {
    return { allowed: false, nextItem: null, reason: "bank_exhausted" };
  }
  skill.remediation.returnItemId = fresh.id;
  skill.remediation.active = false;
  trackRecentlySeen(skill, fresh.id);
  return { allowed: true, nextItem: fresh, reason: null };
}

// Section 6 modality rule, generalized to Section 4's "two wrong in a row" trigger.
// "restated_explanation" is deliberately absent, not just deprioritized: the spec
// says never repeat the same explanation reworded, and leaving it anywhere in a
// rotating list means it eventually gets selected again on a later cycle no
// matter where it starts.
var REPRESENTATIONS = ["diagram", "worked_example", "concrete_analogy", "build_together"];
function nextRepresentation(skill) {
  skill.lastRepresentationIndex = (skill.lastRepresentationIndex + 1) % REPRESENTATIONS.length;
  return REPRESENTATIONS[skill.lastRepresentationIndex];
}

// Same gated remediation cycle as IDK, triggered by two wrong attempts in a row.
// consecutiveWrong resets the moment a switch fires, so the new representation
// gets a real attempt before anything escalates again, instead of switching on
// every subsequent wrong answer regardless of whether the new approach worked.
function handleWrongAttempt(skill, itemId, errorCode, currentItemId, timestamp, input) {
  recordAttempt(skill, itemId, false, errorCode, timestamp, input);
  if (skill.consecutiveWrong >= 2) {
    regressOneLevel(skill);
    var rep = nextRepresentation(skill);
    skill.consecutiveWrong = 0;
    trackRecentlySeen(skill, currentItemId);
    var confusionAt2 = timestamp || Date.now();
    skill.masteryEvidenceValidAfter = Math.max(skill.masteryEvidenceValidAfter || 0, confusionAt2);
    var priorHistory = (skill.remediation && skill.remediation.representationHistory) || [];
    var priorAttempts = (skill.remediation && skill.remediation.prerequisiteAttempts) || [];
    skill.remediation = {
      active: true,
      reason: "two_wrong_in_a_row",
      originatingItemId: currentItemId,
      requiredSkillId: null,
      interventionType: "SWITCH_REPRESENTATION",
      representationHistory: priorHistory.concat([rep]),
      prerequisiteCheckPassed: false,
      prerequisiteAttempts: priorAttempts,
      needsEscalation: false,
      returnItemId: null
    };
    return { action: "SWITCH_REPRESENTATION", representation: rep, remediationActive: true };
  }
  return { action: "TARGETED_FEEDBACK", errorCode: errorCode };
}

/* Exported for the test harness */
if (typeof module !== "undefined") {
  module.exports = {
    STATES: STATES, SCAFFOLD: SCAFFOLD, MIN_RETRIEVAL_DELAY_MS: MIN_RETRIEVAL_DELAY_MS,
    createSkill: createSkill, startTeaching: startTeaching,
    moveToWatch: moveToWatch, moveToBuildTogether: moveToBuildTogether, moveToGuided: moveToGuided,
    recordAttempt: recordAttempt, checkGuidedAdvance: checkGuidedAdvance,
    recordIndependentAttempt: recordIndependentAttempt, evaluateMastery: evaluateMastery,
    regressOneLevel: regressOneLevel,
    IDK_REASONS: IDK_REASONS, handleIdk: handleIdk, recordRemediationCheck: recordRemediationCheck,
    exitRemediation: exitRemediation, nextRemediationCheckItem: nextRemediationCheckItem,
    selectFreshItem: selectFreshItem, isRemediationActive: isRemediationActive,
    handleWrongAttempt: handleWrongAttempt, nextRepresentation: nextRepresentation,
    REPRESENTATIONS: REPRESENTATIONS
  };
}
