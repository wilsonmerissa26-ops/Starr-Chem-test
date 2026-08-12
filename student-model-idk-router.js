/* ============================================================
   DR. MERISSA TEACHING ENGINE
   STUDENT MODEL + IDK ROUTER — corrected build
   Pure logic. No DOM. No rendering.
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
var MIN_RETRIEVAL_DELAY_MS = 3 * 60 * 1000;

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
    independentSuccesses: [],
    reviewDue: null,
    remediation: null,
    recentItemIds: []
  };
}

function startTeaching(skill) {
  skill.state = STATES.TEACHING;
  skill.scaffoldLevel = SCAFFOLD.WORKED;
  return skill;
}
function moveToWatch(skill) { skill.state = STATES.WATCH; return skill; }
function moveToBuildTogether(skill) { skill.state = STATES.BUILD_TOGETHER; return skill; }
function moveToGuided(skill) {
  skill.state = STATES.GUIDED;
  skill.scaffoldLevel = SCAFFOLD.EXPLICIT;
  return skill;
}

function rememberItem(skill, itemId) {
  if (!itemId) return;
  skill.recentItemIds.push(itemId);
  if (skill.recentItemIds.length > 8) skill.recentItemIds.shift();
}

function recordAttempt(skill, itemId, correct, errorCode, timestamp, input) {
  skill.attempts.push({
    itemId: itemId,
    input: input == null ? null : input,
    correct: !!correct,
    errorCode: errorCode || null,
    scaffoldLevelAtAttempt: skill.scaffoldLevel,
    timestamp: timestamp || Date.now()
  });
  rememberItem(skill, itemId);
  skill.consecutiveWrong = correct ? 0 : skill.consecutiveWrong + 1;
  return skill;
}

function checkGuidedAdvance(skill) {
  var last2 = skill.attempts.slice(-2);
  if (skill.state === STATES.GUIDED &&
      last2.length === 2 &&
      last2.every(function(a) {
        return a.correct && a.scaffoldLevelAtAttempt === SCAFFOLD.EXPLICIT;
      })) {
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
  } else {
    skill.state = STATES.INDEPENDENT_ATTEMPTED;
  }
  return skill;
}

function evaluateMastery(skill) {
  var cold = skill.independentSuccesses
    .filter(function(s) {
      return s.scaffoldLevel === SCAFFOLD.COLD && s.correctExplanation;
    })
    .sort(function(a,b){ return a.timestamp - b.timestamp; });

  if (cold.length === 0) {
    return { mastered:false, reason:"no cold success with valid explanation" };
  }

  for (var i=0; i<cold.length; i++) {
    for (var j=i+1; j<cold.length; j++) {
      if (cold[j].itemId !== cold[i].itemId &&
          cold[j].timestamp - cold[i].timestamp >= MIN_RETRIEVAL_DELAY_MS) {
        skill.state = STATES.MASTERED;
        return {
          mastered:true,
          reason:"two distinct cold successes with valid explanation and retrieval delay"
        };
      }
    }
  }
  return { mastered:false, reason:"no second distinct cold success after minimum retrieval delay" };
}

/* A regression means MORE support, so scaffold number increases:
   COLD 0 -> NOTEBOOK 1 -> PARTIAL 2 -> EXPLICIT 3 -> WORKED 4.
   If already at WORKED, it remains WORKED. */
function regressOneLevel(skill) {
  skill.scaffoldLevel = Math.min(SCAFFOLD.WORKED, skill.scaffoldLevel + 1);
  skill.state = STATES.DEVELOPING;
  return skill;
}

var IDK_REASONS = {
  DONT_UNDERSTAND: "dont_understand_concept",
  DONT_KNOW_START: "dont_know_how_to_start",
  SHOW_EXAMPLE: "show_me_example"
};

var IDK_ACTIONS = {};
IDK_ACTIONS[IDK_REASONS.DONT_UNDERSTAND] = "CONCEPT_RETEACH";
IDK_ACTIONS[IDK_REASONS.DONT_KNOW_START] = "MODEL_FIRST_DECISION";
IDK_ACTIONS[IDK_REASONS.SHOW_EXAMPLE] = "WATCH_MODE_EXAMPLE";

function selectFreshItem(itemBank, excludedIds) {
  excludedIds = excludedIds || [];
  for (var i=0; i<itemBank.length; i++) {
    if (excludedIds.indexOf(itemBank[i].id) === -1) return itemBank[i];
  }
  return null;
}

/* IDK starts remediation but does NOT return a replacement parent-skill item immediately. */
function handleIdk(skill, reason, itemBank, currentItemId, timestamp) {
  if (!IDK_ACTIONS[reason]) throw new Error("Unknown IDK reason for v1 router: " + reason);

  skill.idkSelections.push({ reason:reason, timestamp:timestamp || Date.now() });
  rememberItem(skill, currentItemId);
  regressOneLevel(skill);

  skill.remediation = {
    active: true,
    reason: reason,
    originatingItemId: currentItemId,
    interventionType: IDK_ACTIONS[reason],
    representationHistory: [],
    prerequisiteCheckPassed: false,
    returnItemId: null
  };

  return {
    action: IDK_ACTIONS[reason],
    nextItem: null,
    requiresRemediationCheck: true,
    scaffoldLevel: skill.scaffoldLevel
  };
}

function passRemediationCheck(skill, itemBank, timestamp) {
  if (!skill.remediation || !skill.remediation.active) {
    throw new Error("No active remediation to pass.");
  }

  skill.remediation.prerequisiteCheckPassed = true;

  var excluded = [skill.remediation.originatingItemId].concat(skill.recentItemIds);
  var nextItem = selectFreshItem(itemBank, excluded);
  if (!nextItem) nextItem = selectFreshItem(itemBank, [skill.remediation.originatingItemId]);
  if (!nextItem) return { canReturn:false, nextItem:null, reason:"item bank exhausted" };

  skill.remediation.returnItemId = nextItem.id;
  skill.remediation.active = false;
  return { canReturn:true, nextItem:nextItem, timestamp:timestamp || Date.now() };
}

function canReturnFromRemediation(skill) {
  return !!(skill.remediation && skill.remediation.prerequisiteCheckPassed && skill.remediation.returnItemId);
}

var REPRESENTATIONS = ["diagram", "worked_example", "concrete_analogy", "build_together"];

function nextRepresentation(skill) {
  skill.lastRepresentationIndex = (skill.lastRepresentationIndex + 1) % REPRESENTATIONS.length;
  return REPRESENTATIONS[skill.lastRepresentationIndex];
}

function handleWrongAttempt(skill, itemId, errorCode, itemBank, timestamp, input) {
  recordAttempt(skill, itemId, false, errorCode, timestamp, input);

  if (skill.consecutiveWrong >= 2) {
    regressOneLevel(skill);
    var rep = nextRepresentation(skill);

    if (!skill.remediation) {
      skill.remediation = {
        active:true,
        reason:"two_consecutive_wrong",
        originatingItemId:itemId,
        interventionType:"SWITCH_REPRESENTATION",
        representationHistory:[],
        prerequisiteCheckPassed:false,
        returnItemId:null
      };
    } else {
      skill.remediation.active = true;
      skill.remediation.originatingItemId = itemId;
      skill.remediation.interventionType = "SWITCH_REPRESENTATION";
      skill.remediation.prerequisiteCheckPassed = false;
      skill.remediation.returnItemId = null;
    }

    skill.remediation.representationHistory.push(rep);
    skill.consecutiveWrong = 0;

    return {
      action:"SWITCH_REPRESENTATION",
      representation:rep,
      nextItem:null,
      requiresRemediationCheck:true
    };
  }

  return { action:"TARGETED_FEEDBACK", errorCode:errorCode };
}

if (typeof module !== "undefined") {
  module.exports = {
    STATES:STATES,
    SCAFFOLD:SCAFFOLD,
    MIN_RETRIEVAL_DELAY_MS:MIN_RETRIEVAL_DELAY_MS,
    createSkill:createSkill,
    startTeaching:startTeaching,
    moveToWatch:moveToWatch,
    moveToBuildTogether:moveToBuildTogether,
    moveToGuided:moveToGuided,
    recordAttempt:recordAttempt,
    checkGuidedAdvance:checkGuidedAdvance,
    recordIndependentAttempt:recordIndependentAttempt,
    evaluateMastery:evaluateMastery,
    regressOneLevel:regressOneLevel,
    IDK_REASONS:IDK_REASONS,
    handleIdk:handleIdk,
    passRemediationCheck:passRemediationCheck,
    canReturnFromRemediation:canReturnFromRemediation,
    selectFreshItem:selectFreshItem,
    handleWrongAttempt:handleWrongAttempt,
    nextRepresentation:nextRepresentation,
    REPRESENTATIONS:REPRESENTATIONS
  };
}
