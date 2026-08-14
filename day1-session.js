/* Day 1 integration rules shared by the learner page and behavioral tests. */
(function (root) {
  "use strict";

  function normalized(value) {
    return String(value == null ? "" : value).trim().toLowerCase()
      .replace(/\u2212/g, "-").replace(/\u00d7/g, "x").replace(/\s+/g, "");
  }

  function numericValue(value) {
    var text = String(value == null ? "" : value).trim();
    if (!text) return null;
    if (/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text)) return Number(text);
    var fraction = text.match(/^([+-]?\d+)\s*\/\s*([+-]?\d+)$/);
    if (fraction && Number(fraction[2]) !== 0) return Number(fraction[1]) / Number(fraction[2]);
    return null;
  }

  function classifyAnswer(input, item) {
    var raw = String(input == null ? "" : input).trim();
    if (!raw) return { correct:false, errorCode:"BLANK", message:"This box is blank. Enter an answer, or choose I don’t know yet so I can teach it another way." };
    var expected = item.answers || item.a || [];
    var exact = expected.some(function (answer) { return normalized(answer) === normalized(raw); });
    if (exact) return { correct:true, errorCode:null };

    // Accept an equivalent fraction or terminating decimal only when both
    // values parse as unambiguous numbers.
    var inputNumber = numericValue(raw);
    var equivalentNumber = expected.some(function (answer) {
      var answerNumber = numericValue(answer);
      return inputNumber !== null && answerNumber !== null && Math.abs(inputNumber-answerNumber) < 1e-10;
    });
    if (equivalentNumber) return { correct:true, errorCode:null };

    if (item.numberOnly) {
      var assignment = raw.match(/^\s*[a-z]\s*=\s*(.+)\s*$/i);
      if (assignment) {
        var assigned = numericValue(assignment[1]);
        var target = numericValue(expected[0]);
        if (assigned !== null && target !== null && Math.abs(assigned-target) < 1e-10) {
          return { correct:false, mathematicalValueCorrect:true, errorCode:"FORMAT_ONLY",
            message:"Your mathematical answer is " + expected[0] + ", which is correct. This box needs only the number. Enter " + expected[0] + " instead of “" + raw + "”." };
        }
      }
      if (numericValue(raw) === null) return { correct:false, errorCode:"NONNUMERIC",
        message:"You entered “" + raw + "”. This box asks for only a numerical value. Write your useful algebra on paper, then enter just the resulting number here." };
      var targetNumber = numericValue(expected[0]);
      if (targetNumber !== null && Math.abs(numericValue(raw)-targetNumber) < 1e-10) return { correct:true, errorCode:null };
    }
    return { correct:false, errorCode:"CONCEPT", message:item.correction || "That value does not satisfy the question yet. Recheck the rule and the first step, then try again." };
  }

  function meaningfulExplanation(text, requirements) {
    var t = normalized(text);
    if (!t || /^(ok|okay|yes|no|idk|dunno|asdf|test)$/.test(t)) return false;
    var hasEvidenceRelationship = /(electron|bond|remain|left|account|total|use|form|because|therefore|so)/.test(t);
    return hasEvidenceRelationship && requirements.every(function (group) {
      return group.some(function (term) { return t.indexOf(normalized(term)) !== -1; });
    });
  }

  function branchMath(phase, correct, total) {
    if (phase === "probe") {
      if (correct === 3) return "cleared";
      if (correct === 2) return "targeted";
      return "mini";
    }
    if (phase === "verification") return correct === total ? "cleared" : "mini";
    if (phase === "independent") return correct >= 3 ? "cleared" : "developing";
    throw new Error("Unknown math phase");
  }

  function applyMathCap(session, now) {
    var elapsed = now - session.mathStartedAt;
    if (elapsed < 60 * 60 * 1000) return false;
    session.mathAreas.forEach(function (area) { if (!session.mathStatus[area]) session.mathStatus[area] = "Developing"; });
    session.position = "break";
    session.mathCapReached = true;
    return true;
  }

  function mathTimePolicy(session, now) {
    var elapsed = Math.max(0, now - session.mathStartedAt);
    if (elapsed >= 60 * 60 * 1000) return "hard_cap";
    if (elapsed >= 50 * 60 * 1000) return "probe_only";
    return "adaptive";
  }

  function shouldEscalateMath(session, now) {
    return mathTimePolicy(session, now) === "adaptive";
  }

  function safeSession(saved, defaults) {
    var source = saved && typeof saved === "object" ? saved : {};
    var result = Object.assign({}, defaults, source);
    result.mathStatus = Object.assign({}, defaults.mathStatus || {}, source.mathStatus || {});
    result.chemResults = Object.assign({}, defaults.chemResults || {}, source.chemResults || {});
    result.misconceptionLog = Object.assign({}, defaults.misconceptionLog || {}, source.misconceptionLog || {});
    result.studentModel = source.studentModel && typeof source.studentModel === "object" ? source.studentModel : {};
    result.mathAreas = Array.isArray(source.mathAreas) ? source.mathAreas.slice() : (defaults.mathAreas || []).slice();
    result.gymHistory = Array.isArray(source.gymHistory) ? source.gymHistory.slice(-60) : [];
    result.gymAttempts = Array.isArray(source.gymAttempts) ? source.gymAttempts.slice(-200) : [];
    result.gymCurrent = null;
    result.mathEvidence = Object.assign({}, defaults.mathEvidence || {}, source.mathEvidence || {});
    result.instructionStep = Number.isInteger(source.instructionStep) ? Math.max(0, Math.min(3, source.instructionStep)) : 0;
    result.transientInstruction = null;
    var allowedSteps = ["intro","menu","math","break","chem","mastery","summary","gym"];
    if (allowedSteps.indexOf(result.step) === -1) result.step = defaults.step || "intro";
    var allowedMathPhases = ["refresh","probe","targeted","verification","mini","guided","independent","donearea"];
    if (allowedMathPhases.indexOf(result.mathPhase) === -1) result.mathPhase = defaults.mathPhase || "refresh";
    var maxIndex = Math.max(0, result.mathAreas.length - 1);
    result.mathIndex = Number.isInteger(result.mathIndex) ? Math.max(0, Math.min(maxIndex, result.mathIndex)) : 0;
    result.stage = null; // transient UI state never crosses an item boundary or reload
    return result;
  }

  function independentAllowed(skill, evidence) {
    if (skill && skill.remediation && skill.remediation.active) return false;
    return !!(evidence && evidence.guidedPassed && evidence.supportedPassed);
  }

  function safeMathPhase(requested, skill, evidence) {
    if (requested === "independent" && !independentAllowed(skill, evidence)) return "mini";
    return requested;
  }

  function freshStage(molecule, mode) {
    return { molecule:molecule, mode:mode, atoms:[], bonds:[], lonePairs:[], selected:null, tool:null,
      hintsUsed:0, feedback:null };
  }

  function scaffoldingFor(mode) {
    if (mode === "alone" || mode === "mastery") return [];
    if (mode === "guided") return ["hints", "notebook"];
    if (mode === "together") return ["prompt", "counter"];
    return ["narration", "counter", "notebook"];
  }

  function completeDay(session) {
    if (session.completed) return false;
    if (session.requireCompletionGate && !canCompleteDay(session)) return false;
    session.completed = true;
    session.position = "summary";
    session.completionCount = 1;
    return true;
  }

  function canCompleteDay(session) {
    var areas = session.mathAreas || [];
    var statuses = session.mathStatus || {};
    var mathReady = areas.length > 0 && areas.every(function (id) {
      return statuses[id] === "Cleared" || statuses[id] === "Developing";
    });
    var chemistry = session.chemResults || {};
    return mathReady && ["h2o","methanol","why","mastery","masteryWhy"].every(function (key) {
      return chemistry[key] === true;
    });
  }

  function selectUnseenItem(items, history, skillId) {
    history = Array.isArray(history) ? history : [];
    var prefix = skillId + ":";
    var seen = history.filter(function (id) { return id.indexOf(prefix) === 0; });
    var candidates = items.filter(function (item) { return seen.indexOf(prefix + item.id) === -1; });
    if (!candidates.length) {
      var last = seen.length ? seen[seen.length-1] : null;
      candidates = items.filter(function (item) { return prefix + item.id !== last; });
    }
    return candidates[0] || items[0] || null;
  }

  function idkIntervention(reason, teaching) {
    var table = {
      concept: { action:"RETEACH_CONCEPT", text:teaching.concept },
      start: { action:"MODEL_FIRST_DECISION", text:teaching.start },
      example: { action:"WATCH_MODE_EXAMPLE", text:teaching.example }
    };
    if (!table[reason]) throw new Error("Unknown IDK reason");
    return table[reason];
  }

  function recordMisconception(session, key, errorCode) {
    if (!errorCode || errorCode === "FORMAT_ONLY" || errorCode === "BLANK" || errorCode === "NONNUMERIC") return 0;
    session.misconceptionLog[key] = (session.misconceptionLog[key] || 0) + 1;
    return session.misconceptionLog[key];
  }

  var api = { normalized:normalized, numericValue:numericValue, classifyAnswer:classifyAnswer,
    meaningfulExplanation:meaningfulExplanation, branchMath:branchMath, applyMathCap:applyMathCap,
    mathTimePolicy:mathTimePolicy, shouldEscalateMath:shouldEscalateMath, safeSession:safeSession,
    idkIntervention:idkIntervention, recordMisconception:recordMisconception,
    freshStage:freshStage, scaffoldingFor:scaffoldingFor, canCompleteDay:canCompleteDay,
    independentAllowed:independentAllowed, safeMathPhase:safeMathPhase,
    selectUnseenItem:selectUnseenItem, completeDay:completeDay };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.Day1Session = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
