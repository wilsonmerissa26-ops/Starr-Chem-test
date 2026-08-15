/* ============================================================
   DR. MERISSA REASONING-STEP DIAGNOSIS ENGINE
   Universal diagnostic layer for math, chemistry, and future
   curriculum. Pure logic: no DOM and no curriculum invention.
   ============================================================ */

var STATUS = {
  CONFIRMED: "CONFIRMED",
  NEEDS_PROBE: "NEEDS_PROBE",
  NEEDS_WORK_TRACE: "NEEDS_WORK_TRACE",
  REPAIR: "REPAIR",
  MICRO_CHECK: "MICRO_CHECK",
  RETURN_TO_SKILL: "RETURN_TO_SKILL",
  TRANSFER: "TRANSFER"
};

function normalize(v) {
  return String(v == null ? "" : v).replace(/\s+/g, "").toLowerCase();
}

function createDiagnosisSession(opts) {
  opts = opts || {};
  return {
    skillId: opts.skillId || null,
    itemId: opts.itemId || null,
    rawResponse: opts.rawResponse == null ? null : opts.rawResponse,
    workTrace: Array.isArray(opts.workTrace) ? opts.workTrace.slice() : [],
    candidateHypotheses: [],
    confirmedReasoningStep: null,
    errorCode: null,
    probe: null,
    probeResponse: null,
    representationHistory: [],
    repairCheckResult: null,
    transferResult: null,
    status: null,
    timestamp: opts.timestamp || Date.now()
  };
}

function firstWrongStep(workTrace) {
  if (!Array.isArray(workTrace)) return null;
  for (var i = 0; i < workTrace.length; i++) {
    if (workTrace[i] && workTrace[i].correct === false) return workTrace[i];
  }
  return null;
}

function matchSignatures(rawResponse, signatures) {
  var r = normalize(rawResponse);
  return (signatures || []).filter(function(sig) {
    if (typeof sig.matches === "function") return !!sig.matches(rawResponse);
    return (sig.responses || []).some(function(x) { return normalize(x) === r; });
  });
}

function chooseProbe(candidates) {
  for (var i = 0; i < candidates.length; i++) {
    if (candidates[i].probe) return candidates[i].probe;
  }
  return {
    id: "show_first_step",
    type: "work_trace",
    prompt: "Show me what you did first."
  };
}

function diagnose(session, domainRule, studentEvidence) {
  domainRule = domainRule || {};
  studentEvidence = studentEvidence || {};

  var wrongStep = firstWrongStep(session.workTrace);
  if (wrongStep) {
    session.confirmedReasoningStep = wrongStep.reasoningStep || wrongStep.errorCode || "first_wrong_step";
    session.errorCode = wrongStep.errorCode || null;
    session.status = STATUS.CONFIRMED;
    return { status: session.status, reasoningStep: session.confirmedReasoningStep, source: "work_trace" };
  }

  var matches = matchSignatures(session.rawResponse, domainRule.signatures);
  session.candidateHypotheses = matches.map(function(m) {
    return { id: m.id, reasoningStep: m.reasoningStep, errorCode: m.errorCode || m.id, confidence: m.confidence || "signature", probe: m.probe || null };
  });

  if (matches.length === 1 && matches[0].unambiguous === true) {
    session.confirmedReasoningStep = matches[0].reasoningStep;
    session.errorCode = matches[0].errorCode || matches[0].id;
    session.status = STATUS.CONFIRMED;
    return { status: session.status, reasoningStep: session.confirmedReasoningStep, source: "signature" };
  }

  if (matches.length >= 1) {
    session.probe = chooseProbe(matches);
    session.status = STATUS.NEEDS_PROBE;
    return { status: session.status, candidates: session.candidateHypotheses, probe: session.probe };
  }

  session.probe = domainRule.fallbackProbe || chooseProbe([]);
  session.status = session.probe.type === "work_trace" ? STATUS.NEEDS_WORK_TRACE : STATUS.NEEDS_PROBE;
  return { status: session.status, candidates: [], probe: session.probe };
}

function recordProbe(session, response, resolver) {
  session.probeResponse = response;
  var result = resolver ? resolver(response, session) : null;
  if (!result || !result.reasoningStep) {
    session.status = STATUS.NEEDS_WORK_TRACE;
    session.probe = { id: "show_first_step", type: "work_trace", prompt: "Show me what you did first." };
    return { status: session.status, probe: session.probe };
  }
  session.confirmedReasoningStep = result.reasoningStep;
  session.errorCode = result.errorCode || result.reasoningStep;
  session.status = STATUS.CONFIRMED;
  return { status: session.status, reasoningStep: session.confirmedReasoningStep };
}

function selectRepair(session, repairs, masteredPrerequisites) {
  masteredPrerequisites = masteredPrerequisites || [];
  var repair = (repairs || {})[session.confirmedReasoningStep];
  if (!repair) return null;
  var copy = Object.assign({}, repair);
  copy.prerequisitesToReteach = (repair.prerequisites || []).filter(function(id) {
    return masteredPrerequisites.indexOf(id) === -1;
  });
  session.status = STATUS.REPAIR;
  return copy;
}

function nextRepairRepresentation(session, repair) {
  var reps = (repair && repair.representations) || ["diagram", "worked_example", "concrete_analogy", "build_together"];
  for (var i = 0; i < reps.length; i++) {
    if (session.representationHistory.indexOf(reps[i]) === -1) {
      session.representationHistory.push(reps[i]);
      return reps[i];
    }
  }
  var fallback = "teacher_probe";
  session.representationHistory.push(fallback);
  return fallback;
}

function recordMicroCheck(session, correct) {
  session.repairCheckResult = !!correct;
  session.status = correct ? STATUS.RETURN_TO_SKILL : STATUS.REPAIR;
  return { status: session.status, passed: !!correct };
}

function recordTransfer(session, itemId, correct) {
  if (itemId === session.itemId) throw new Error("Transfer must use a different item from the originating item");
  session.transferResult = { itemId: itemId, correct: !!correct, timestamp: Date.now() };
  session.status = STATUS.TRANSFER;
  return session.transferResult;
}

function buildStudentModelRecord(session) {
  return {
    itemId: session.itemId,
    rawResponse: session.rawResponse,
    candidateHypotheses: session.candidateHypotheses.slice(),
    confirmedReasoningStep: session.confirmedReasoningStep,
    errorCode: session.errorCode,
    diagnosticProbe: session.probe,
    diagnosticProbeResponse: session.probeResponse,
    representationHistory: session.representationHistory.slice(),
    repairCheckResult: session.repairCheckResult,
    transferResult: session.transferResult,
    timestamp: session.timestamp
  };
}

module.exports = {
  STATUS: STATUS,
  createDiagnosisSession: createDiagnosisSession,
  firstWrongStep: firstWrongStep,
  diagnose: diagnose,
  recordProbe: recordProbe,
  selectRepair: selectRepair,
  nextRepairRepresentation: nextRepairRepresentation,
  recordMicroCheck: recordMicroCheck,
  recordTransfer: recordTransfer,
  buildStudentModelRecord: buildStudentModelRecord
};
