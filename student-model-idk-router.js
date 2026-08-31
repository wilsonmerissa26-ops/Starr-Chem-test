/* ============================================================
   STUDENT MODEL + IDK ROUTER
   Build order piece 1 and 2, per DR_MERISSA_TEACHING_ENGINE_SPEC.md
   Sections 2 (Student Model) and 6 (IDK tree, six-way contract).
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
    atScaffoldCeiling: false,
    independentSuccesses: [],
    explanationAttempts: [],
    masteryEvidenceValidAfter: 0,
    remediation: null,
    recentlySeenItemIds: [],
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
    itemId: itemId,
    input: input == null ? null : input,
    correct: !!correct,
    errorCode: errorCode || null,
    scaffoldLevelAtAttempt: skill.scaffoldLevel,
    timestamp: timestamp || Date.now()
  });
  if (correct) skill.consecutiveWrong = 0;
  else skill.consecutiveWrong += 1;
  return skill;
}

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

// Explanation evidence upgrades a real current cold success. It never creates
// an Independent success, changes its retrieval timestamp, or revives evidence
// invalidated by later remediation.
function recordIndependentExplanation(skill, itemId, correct, timestamp, input) {
  if (!Array.isArray(skill.explanationAttempts)) skill.explanationAttempts = [];
  var at = timestamp || Date.now();
  var cutoff = skill.masteryEvidenceValidAfter || 0;
  var matches = skill.independentSuccesses.filter(function(s){
    return s.itemId === itemId &&
           s.scaffoldLevel === SCAFFOLD.COLD &&
           s.timestamp > cutoff;
  });
  var target = matches.length ? matches[matches.length - 1] : null;

  skill.explanationAttempts.push({
    itemId: itemId,
    input: input == null ? null : input,
    correct: !!correct,
    timestamp: at,
    matchedColdSuccess: !!target
  });
  skill.state = STATES.EXPLAIN_WHY;

  if (!target) return { accepted: false, attached: false, reason: "no_matching_cold_success" };
  if (!correct) return { accepted: true, attached: false, reason: "explanation_incorrect" };
  target.correctExplanation = true;
  return { accepted: true, attached: true, reason: null };
}

function isRemediationActive(skill) {
  return !!(skill.remediation && skill.remediation.active);
}

// MASTERED requires three distinct facts:
// 1) a current cold success with correct-shaped explanation evidence,
// 2) a second DIFFERENT current cold success,
// 3) that second success occurs at least MIN_RETRIEVAL_DELAY_MS later.
//
// The second retrieval success does NOT need a second explanation of its own.
// The contract requires explanation evidence once plus later retrieval, not an
// extra essay on every confirming item. Remediation still invalidates all
// earlier evidence by advancing masteryEvidenceValidAfter.
function evaluateMastery(skill) {
  if (isRemediationActive(skill)) {
    return { mastered: false, reason: "mastery evaluation blocked while remediation is active" };
  }

  var cutoff = skill.masteryEvidenceValidAfter || 0;
  var explainedColdSuccess = skill.independentSuccesses.find(function(s){
    return s.scaffoldLevel === SCAFFOLD.COLD &&
           s.correctExplanation &&
           s.timestamp > cutoff;
  });
  if (!explainedColdSuccess) {
    return { mastered: false, reason: "no cold success with valid explanation since the last time remediation opened" };
  }

  var distinctItemLater = skill.independentSuccesses.find(function(s){
    return s.scaffoldLevel === SCAFFOLD.COLD &&
           s.timestamp > cutoff &&
           s.itemId !== explainedColdSuccess.itemId &&
           s.timestamp >= explainedColdSuccess.timestamp + MIN_RETRIEVAL_DELAY_MS;
  });
  if (!distinctItemLater) {
    return { mastered: false, reason: "no second distinct cold success at least " + (MIN_RETRIEVAL_DELAY_MS/60000) + " minutes later yet" };
  }

  skill.state = STATES.MASTERED;
  return { mastered: true, reason: "cold success with valid explanation, confirmed on a second distinct cold item after a real retrieval delay" };
}

var SCAFFOLD_ASCENDING_SUPPORT = [SCAFFOLD.COLD, SCAFFOLD.NOTEBOOK, SCAFFOLD.PARTIAL, SCAFFOLD.EXPLICIT, SCAFFOLD.WORKED];
function regressOneLevel(skill) {
  var idx = SCAFFOLD_ASCENDING_SUPPORT.indexOf(skill.scaffoldLevel);
  if (idx >= SCAFFOLD_ASCENDING_SUPPORT.length - 1) {
    skill.state = STATES.DEVELOPING;
    skill.atScaffoldCeiling = true;
    return skill;
  }
  skill.scaffoldLevel = SCAFFOLD_ASCENDING_SUPPORT[idx + 1];
  skill.state = STATES.DEVELOPING;
  skill.atScaffoldCeiling = false;
  return skill;
}

/* ---------------- IDK Router (Section 6, six-way contract) ---------------- */

var IDK_REASONS = {
  DONT_UNDERSTAND: "dont_understand_concept",
  DONT_KNOW_START: "dont_know_how_to_start",
  FORGOT_PREREQUISITE: "forgot_prerequisite",
  STARTED_STUCK: "started_but_stuck",
  SHOW_EXAMPLE: "show_me_example",
  EXPLANATION_NOT_MAKING_SENSE: "explanation_not_making_sense"
};

var IDK_ACTIONS = {};
IDK_ACTIONS[IDK_REASONS.DONT_UNDERSTAND] = "CONCEPT_RETEACH";
IDK_ACTIONS[IDK_REASONS.DONT_KNOW_START] = "MODEL_FIRST_DECISION";
IDK_ACTIONS[IDK_REASONS.FORGOT_PREREQUISITE] = "PREREQUISITE_REGRESSION";
IDK_ACTIONS[IDK_REASONS.STARTED_STUCK] = "RESUME_FROM_STUCK_STEP";
IDK_ACTIONS[IDK_REASONS.SHOW_EXAMPLE] = "WATCH_MODE_EXAMPLE";
IDK_ACTIONS[IDK_REASONS.EXPLANATION_NOT_MAKING_SENSE] = "SWITCH_REPRESENTATION";

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

function handleIdk(skill, reason, currentItemId, requiredSkillId, timestamp) {
  if (!IDK_ACTIONS[reason]) throw new Error("Unknown IDK reason: " + reason);
  skill.idkSelections.push({ reason: reason, timestamp: timestamp || Date.now() });
  regressOneLevel(skill);
  trackRecentlySeen(skill, currentItemId);
  var confusionAt = timestamp || Date.now();
  skill.masteryEvidenceValidAfter = Math.max(skill.masteryEvidenceValidAfter || 0, confusionAt);

  var isNewReason = reason === IDK_REASONS.FORGOT_PREREQUISITE ||
                    reason === IDK_REASONS.STARTED_STUCK ||
                    reason === IDK_REASONS.EXPLANATION_NOT_MAKING_SENSE;
  var interventionType = skill.atScaffoldCeiling && !isNewReason
    ? "ESCALATE_TO_PREREQUISITE_REGRESSION"
    : IDK_ACTIONS[reason];
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

function recordRemediationCheck(skill, correct, checkItemId, timestamp) {
  if (!isRemediationActive(skill)) throw new Error("recordRemediationCheck called with no active remediation");
  skill.remediation.prerequisiteAttempts.push({
    itemId: checkItemId || null,
    correct: !!correct,
    timestamp: timestamp || Date.now()
  });

  if (correct) {
    skill.remediation.prerequisiteCheckPassed = true;
    skill.remediation.needsEscalation = false;
    return { passed: true, needsEscalation: false, representation: null };
  }

  trackRecentlySeen(skill, checkItemId);
  var rep = nextRepresentation(skill);
  skill.remediation.representationHistory.push(rep);
  skill.remediation.prerequisiteCheckPassed = false;
  var wrongCount = skill.remediation.prerequisiteAttempts.filter(function(a){ return !a.correct; }).length;
  skill.remediation.needsEscalation = wrongCount >= 2;
  return { passed: false, needsEscalation: skill.remediation.needsEscalation, representation: rep };
}

function nextRemediationCheckItem(skill, prerequisiteBank) {
  if (!isRemediationActive(skill)) return { item: null, reason: "no_active_remediation" };
  var fresh = selectFreshItem(prerequisiteBank, skill.recentlySeenItemIds);
  if (!fresh) return { item: null, reason: "bank_exhausted" };
  return { item: fresh, reason: null };
}

function exitRemediation(skill, itemBank) {
  if (!isRemediationActive(skill)) return { allowed: false, nextItem: null, reason: "no_active_remediation" };
  if (!skill.remediation.prerequisiteCheckPassed) return { allowed: false, nextItem: null, reason: "prerequisite_not_yet_passed" };
  var fresh = selectFreshItem(itemBank, skill.recentlySeenItemIds);
  if (!fresh) return { allowed: false, nextItem: null, reason: "bank_exhausted" };
  skill.remediation.returnItemId = fresh.id;
  skill.remediation.active = false;
  trackRecentlySeen(skill, fresh.id);
  return { allowed: true, nextItem: fresh, reason: null };
}

var REPRESENTATIONS = ["diagram", "worked_example", "concrete_analogy", "build_together"];
function nextRepresentation(skill) {
  skill.lastRepresentationIndex = (skill.lastRepresentationIndex + 1) % REPRESENTATIONS.length;
  return REPRESENTATIONS[skill.lastRepresentationIndex];
}

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

var StudentModelIdkRouter = {
  STATES: STATES,
  SCAFFOLD: SCAFFOLD,
  MIN_RETRIEVAL_DELAY_MS: MIN_RETRIEVAL_DELAY_MS,
  createSkill: createSkill,
  startTeaching: startTeaching,
  moveToWatch: moveToWatch,
  moveToBuildTogether: moveToBuildTogether,
  moveToGuided: moveToGuided,
  recordAttempt: recordAttempt,
  checkGuidedAdvance: checkGuidedAdvance,
  recordIndependentAttempt: recordIndependentAttempt,
  recordIndependentExplanation: recordIndependentExplanation,
  evaluateMastery: evaluateMastery,
  regressOneLevel: regressOneLevel,
  IDK_REASONS: IDK_REASONS,
  handleIdk: handleIdk,
  recordRemediationCheck: recordRemediationCheck,
  exitRemediation: exitRemediation,
  nextRemediationCheckItem: nextRemediationCheckItem,
  selectFreshItem: selectFreshItem,
  isRemediationActive: isRemediationActive,
  handleWrongAttempt: handleWrongAttempt,
  nextRepresentation: nextRepresentation,
  REPRESENTATIONS: REPRESENTATIONS
};
if (typeof module !== "undefined" && module.exports) module.exports = StudentModelIdkRouter;
if (typeof globalThis !== "undefined") globalThis.StudentModelIdkRouter = StudentModelIdkRouter;
