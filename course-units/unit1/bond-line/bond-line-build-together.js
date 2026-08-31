/*
 * U1-01 Bond-Line Build Together adapter.
 * Uses the shared BuildTogether engine for role-preserving segment actions,
 * while keeping lesson-specific prechecks/self-checks outside shared mastery.
 */
(function (root, factory) {
  var build = typeof module === "object" && module.exports
    ? require("../../../build-together.js")
    : root.BuildTogether;
  var api = factory(build);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BondLineBuildTogether = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Build) {
  "use strict";

  if (!Build) throw new Error("BuildTogether is required");

  var PENTANE_PLAN = Object.freeze({
    id: "build_together_bond_line_pentane_v1",
    skillId: "chem.representation.bond_line",
    molecule: "pentane",
    strictBondInstances: true,
    actions: Object.freeze([
      Object.freeze({ id: "pentane_bt_1", type: Build.ACTION.ADD_BOND, payload: Object.freeze({ between: Object.freeze(["C1","C2"]), order: 1 }), prompt: "Tap two points to create the first bond segment.", confirmation: "One bond connects carbon 1 to carbon 2. The line is the bond; the two positions at its ends are the carbons." }),
      Object.freeze({ id: "pentane_bt_2", type: Build.ACTION.ADD_BOND, payload: Object.freeze({ between: Object.freeze(["C2","C3"]), order: 1 }), prompt: "Extend the chain with the next bond segment.", confirmation: "Good. You added carbon 3 without breaking the chain." }),
      Object.freeze({ id: "pentane_bt_3", type: Build.ACTION.ADD_BOND, payload: Object.freeze({ between: Object.freeze(["C3","C4"]), order: 1 }), prompt: "Add the third bond segment.", confirmation: "Good. Four carbon positions are now connected in one chain." }),
      Object.freeze({ id: "pentane_bt_4", type: Build.ACTION.ADD_BOND, payload: Object.freeze({ between: Object.freeze(["C4","C5"]), order: 1 }), prompt: "Add the final bond segment so the chain has five carbon positions.", confirmation: "You preserved a continuous five-carbon chain with four C–C bond segments." })
    ])
  });

  if (!Build.validatePlan(PENTANE_PLAN).valid) throw new Error("Pentane Build Together plan is invalid");

  function createSession() {
    return {
      lessonId: "chm221.u1.01",
      skillId: "chem.representation.bond_line",
      supported: true,
      phase: "count_carbons",
      carbonCountAnswer: null,
      connectivityAnswer: null,
      formulaSupportTaps: [],
      buildSession: null,
      selfCheckCarbonIds: [],
      middleHydrogenAnswer: null,
      events: []
    };
  }

  function submitCarbonCount(session, value) {
    if (session.phase !== "count_carbons") return { accepted: false, correct: false, reason: "wrong_phase" };
    var numeric = Number(value);
    session.carbonCountAnswer = numeric;
    if (numeric !== 5) return { accepted: true, correct: false, tapFormulaSupport: true, feedback: "Let's count the C positions in the condensed formula instead of guessing." };
    session.phase = "connectivity";
    return { accepted: true, correct: true, nextPhase: session.phase, feedback: "Right. Pentane has five carbon atoms." };
  }

  function tapFormulaCarbon(session, carbonId) {
    if (session.phase !== "count_carbons") return { accepted: false, reason: "wrong_phase" };
    if (["C1","C2","C3","C4","C5"].indexOf(carbonId) === -1) return { accepted: false, reason: "not_formula_carbon" };
    if (session.formulaSupportTaps.indexOf(carbonId) !== -1) return { accepted: false, reason: "already_tapped", count: session.formulaSupportTaps.length };
    session.formulaSupportTaps.push(carbonId);
    return { accepted: true, reason: null, count: session.formulaSupportTaps.length, complete: session.formulaSupportTaps.length === 5 };
  }

  function submitConnectivity(session, value) {
    if (session.phase !== "connectivity") return { accepted: false, correct: false, reason: "wrong_phase" };
    session.connectivityAnswer = value;
    if (value !== "continuous_chain") return { accepted: true, correct: false, feedback: "Read the condensed formula left to right. Nothing in CH3CH2CH2CH2CH3 shows a side branch." };
    session.buildSession = Build.createBuildTogetherSession(PENTANE_PLAN);
    var started = Build.begin(session.buildSession, PENTANE_PLAN);
    session.phase = "draw_segments";
    session.events.push({ type: "BUILD_TOGETHER_STARTED", lessonId: session.lessonId, skillId: session.skillId, molecule: "pentane", supported: true });
    return { accepted: true, correct: true, nextPhase: session.phase, prompt: started.prompt, feedback: "Right. One continuous chain. Now build it from an empty workspace." };
  }

  function submitSegment(session, between) {
    if (session.phase !== "draw_segments" || !session.buildSession) return { accepted: false, correct: false, reason: "wrong_phase" };
    var result = Build.submitAction(session.buildSession, PENTANE_PLAN, { type: Build.ACTION.ADD_BOND, payload: { between: between, order: 1 } });
    if (!result.accepted) return result;
    if (!result.correct) return { accepted: true, correct: false, advanced: false, reason: result.reason, feedback: result.error ? result.error.message : "Keep this one segment connected to the carbon position the current step requires.", prompt: result.prompt };
    if (session.buildSession.completed) session.phase = "self_check";
    return { accepted: true, correct: true, advanced: true, completedSegments: session.buildSession.correctActionIds.length, nextPhase: session.phase, confirmation: result.confirmation, prompt: result.prompt };
  }

  function tapSelfCheckCarbon(session, targetId) {
    if (session.phase !== "self_check") return { accepted: false, reason: "wrong_phase", complete: false };
    if (/^BOND_/.test(targetId || "")) return { accepted: false, reason: "bond_segment", complete: false, feedback: "That is a bond between carbons, not another carbon. Look for an end or a corner." };
    if (["C1","C2","C3","C4","C5"].indexOf(targetId) === -1) return { accepted: false, reason: "not_a_carbon", complete: false };
    if (session.selfCheckCarbonIds.indexOf(targetId) !== -1) return { accepted: false, reason: "already_tapped", complete: false };
    session.selfCheckCarbonIds.push(targetId);
    var complete = session.selfCheckCarbonIds.length === 5;
    if (complete) session.phase = "hydrogen_check";
    return { accepted: true, reason: null, count: session.selfCheckCarbonIds.length, complete: complete, nextPhase: session.phase, feedback: complete ? "Exactly five carbon positions." : session.selfCheckCarbonIds.length + " of 5 carbons found." };
  }

  function submitMiddleHydrogen(session, value) {
    if (session.phase !== "hydrogen_check") return { accepted: false, correct: false, reason: "wrong_phase" };
    var numeric = Number(value);
    if ([0,1,2,3,4].indexOf(numeric) === -1) return { accepted: false, correct: false, reason: "unknown_choice" };
    session.middleHydrogenAnswer = numeric;
    if (numeric !== 2) return { accepted: true, correct: false, complete: false, feedback: numeric > 2 ? "Count the two visible C–C single bonds first. Carbon is reaching four total bonds, not adding four new hydrogens." : "Use visible bond order + implied C–H bonds = 4." };
    session.phase = "complete";
    session.events.push({
      type: "BUILD_TOGETHER_SUCCESS",
      lessonId: session.lessonId,
      skillId: session.skillId,
      molecule: "pentane",
      supported: true,
      evidenceKind: "guided"
    });
    return { accepted: true, correct: true, complete: true, nextPhase: session.phase, feedback: "You built a bond-line structure from a condensed formula and preserved the carbon connectivity." };
  }

  return Object.freeze({
    PENTANE_PLAN: PENTANE_PLAN,
    createSession: createSession,
    submitCarbonCount: submitCarbonCount,
    tapFormulaCarbon: tapFormulaCarbon,
    submitConnectivity: submitConnectivity,
    submitSegment: submitSegment,
    tapSelfCheckCarbon: tapSelfCheckCarbon,
    submitMiddleHydrogen: submitMiddleHydrogen
  });
});
