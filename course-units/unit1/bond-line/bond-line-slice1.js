/*
 * U1-01 Bond-Line incremental runtime.
 * orientation -> P1/P2 prerequisite gates -> narrow repairs -> Watch Steps 1-2
 *
 * Pure lesson logic. No DOM. No timers. No mastery shortcuts.
 */
(function (root, factory) {
  var registry = typeof module === "object" && module.exports
    ? require("../../../unit1-skill-registry.js")
    : root.Unit1SkillRegistry;
  var watchMode = typeof module === "object" && module.exports
    ? require("../../../watch-mode.js")
    : root.WatchMode;
  var api = factory(registry, watchMode);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BondLineSlice1 = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Registry, WatchMode) {
  "use strict";

  if (!Registry) throw new Error("Unit1SkillRegistry is required");
  if (!WatchMode) throw new Error("WatchMode is required");

  var LESSON_ID = "chm221.u1.01";
  var SKILL_ID = "chem.representation.bond_line";

  var ORIENTATION = Object.freeze({
    title: "Bond-line structures: learning to see the atoms that are not written",
    narration: "Organic molecules can get crowded fast if we write every carbon and every hydrogen. Chemists use a shortcut called a bond-line structure. The shortcut hides some labels, but it does not remove the atoms. By the end of this lesson, you will be able to look at a few lines and know exactly where the carbons and hydrogens are.",
    prompt: "Before we start: when a chemistry drawing leaves out a label, do you think the atom is gone, or do you think the drawing may be using a shortcut?",
    choices: Object.freeze([
      Object.freeze({ id: "gone", label: "The atom is gone." }),
      Object.freeze({ id: "shortcut", label: "The drawing may be using a shortcut." }),
      Object.freeze({ id: "unsure", label: "I am not sure yet." })
    ])
  });

  var GATES = Object.freeze({
    P1: Object.freeze({
      id: "P1",
      skillId: "chem.bonding.carbon_valence_four",
      prompt: "In the neutral organic structures we are using here, how many total bonds does carbon commonly make?",
      choices: Object.freeze([2, 3, 4, 6, "I do not know yet"]),
      answer: 4
    }),
    P2: Object.freeze({
      id: "P2",
      skillId: "chem.bonding.covalent_bond_meaning",
      prompt: "What does the line between these two atoms represent?",
      choices: Object.freeze(["A covalent bond", "A carbon atom", "A hydrogen atom", "Empty space", "I do not know yet"]),
      answer: "a covalent bond"
    })
  });

  var REPAIRS = Object.freeze({
    P1: Object.freeze({
      id: "repair_p1",
      title: "Tiny carbon-bond repair",
      narration: "For the neutral carbon atoms we will use in this lesson, carbon is trying to reach a total bond order of four. A single bond counts as 1, a double bond counts as 2, and a triple bond counts as 3. We will use that total to figure out how many hydrogens must be hiding on carbon.",
      prompt: "This carbon already has one C—C single bond. How many C—H bonds must it have to reach four total bonds?",
      answer: 3,
      wrongPrompt: "One of carbon's four bond slots is already used by the C—C bond. How many bond slots remain?"
    }),
    P2: Object.freeze({
      id: "repair_p2",
      title: "Tiny bond-line repair",
      narration: "The line is the connection between atoms. The line itself is not a carbon. That distinction is going to matter in about two minutes.",
      prompt: "If three carbon atoms are connected in a row, how many C—C bond lines connect them?",
      answer: 2
    })
  });

  var BUTANE_ATOMS = Object.freeze([
    "C1", "C2", "C3", "C4",
    "H1a", "H1b", "H1c", "H2a", "H2b", "H3a", "H3b", "H4a", "H4b", "H4c"
  ]);

  var BUTANE_BONDS = Object.freeze([
    Object.freeze(["C1", "C2", 1]), Object.freeze(["C2", "C3", 1]), Object.freeze(["C3", "C4", 1]),
    Object.freeze(["C1", "H1a", 1]), Object.freeze(["C1", "H1b", 1]), Object.freeze(["C1", "H1c", 1]),
    Object.freeze(["C2", "H2a", 1]), Object.freeze(["C2", "H2b", 1]),
    Object.freeze(["C3", "H3a", 1]), Object.freeze(["C3", "H3b", 1]),
    Object.freeze(["C4", "H4a", 1]), Object.freeze(["C4", "H4b", 1]), Object.freeze(["C4", "H4c", 1])
  ]);

  var STEP_2_PREDICTION = Object.freeze({
    prompt: "If we stop writing the H labels that are attached to carbon, will the molecule suddenly have fewer hydrogen atoms?",
    choices: Object.freeze([
      Object.freeze({ id: "yes", label: "Yes" }),
      Object.freeze({ id: "no", label: "No" }),
      Object.freeze({ id: "unsure", label: "I am not sure yet" })
    ]),
    answer: "no",
    correctFeedback: "Right. The notation changes. The molecule does not.",
    repairFeedback: "Watch what changes next. We are going to hide the labels without breaking a single bond."
  });

  var WATCH_SEQUENCE = Object.freeze({
    id: "watch_bond_line_butane_step1_v1",
    skillId: SKILL_ID,
    title: "Watch — butane from expanded structure toward bond-line notation",
    molecule: "butane",
    requiresCounter: false,
    carbonTargets: Object.freeze(["C1", "C2", "C3", "C4"]),
    steps: Object.freeze([
      Object.freeze({
        id: "bl_watch_1",
        narration: "Right now nothing is hidden. We can see four carbon atoms connected in a chain, and we can see every hydrogen attached to them.",
        visual: Object.freeze({
          representation: "fully_expanded",
          atoms: BUTANE_ATOMS,
          bonds: BUTANE_BONDS,
          lonePairs: Object.freeze([])
        }),
        notebookFacts: Object.freeze([])
      }),
      Object.freeze({
        id: "bl_watch_2",
        narration: "This connected chain of carbon atoms is the carbon skeleton. The hydrogens are still part of the molecule, but the carbon-to-carbon pattern is the part chemists usually sketch first.",
        vocabulary: Object.freeze({
          term: "carbon skeleton",
          definition: "the connected pattern of carbon atoms in the molecule"
        }),
        prediction: STEP_2_PREDICTION,
        visual: Object.freeze({
          representation: "carbon_skeleton_emphasis",
          atoms: BUTANE_ATOMS,
          bonds: BUTANE_BONDS,
          lonePairs: Object.freeze([]),
          emphasis: Object.freeze({
            carbonSkeleton: "strong",
            carbonHydrogens: "light"
          })
        }),
        notebookFacts: Object.freeze([])
      })
    ])
  });

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase();
  }

  function createSession() {
    return {
      lessonId: LESSON_ID,
      skillId: SKILL_ID,
      phase: "orientation",
      orientationChoice: null,
      evidence: [],
      repairLog: [],
      gateResults: { P1: null, P2: null },
      watchCarbonIds: [],
      watchStep1Complete: false,
      watchStep2Prediction: null,
      watchStep2Complete: false
    };
  }

  function answerOrientation(session, choiceId) {
    if (session.phase !== "orientation") return { accepted: false, reason: "wrong_phase", nextPhase: session.phase };
    var known = ORIENTATION.choices.some(function (choice) { return choice.id === choiceId; });
    if (!known) return { accepted: false, reason: "unknown_choice", nextPhase: session.phase };
    session.orientationChoice = choiceId;
    session.phase = "gate_p1";
    return {
      accepted: true,
      nextPhase: session.phase,
      feedback: choiceId === "shortcut"
        ? "Exactly. That is the idea we are going to make precise."
        : "Good place to start. In bond-line notation, some atoms are still part of the molecule even when their letter is not written. We are going to make every hidden atom visible first, then learn the shortcut."
    };
  }

  function gateCorrect(gateId, value) {
    if (gateId === "P1") return Number(value) === GATES.P1.answer;
    if (gateId === "P2") return normalize(value) === GATES.P2.answer;
    return false;
  }

  function recordProbe(session, gate, correct, timestamp) {
    var record = {
      lessonId: LESSON_ID,
      skillId: gate.skillId,
      itemId: "BL-" + gate.id,
      evidenceKind: Registry.EVIDENCE_KINDS.PROBE,
      scaffoldLevel: 0,
      supported: false,
      correct: !!correct,
      timestamp: typeof timestamp === "number" ? timestamp : Date.now()
    };
    var validation = Registry.validateEvidenceRecord(record);
    if (!validation.valid) throw new Error("Invalid prerequisite evidence: " + validation.reason);
    session.evidence.push(record);
    return record;
  }

  function submitGate(session, gateId, value, timestamp) {
    var gate = GATES[gateId];
    if (!gate) return { accepted: false, correct: false, reason: "unknown_gate" };
    var requiredPhase = gateId === "P1" ? "gate_p1" : "gate_p2";
    if (session.phase !== requiredPhase) return { accepted: false, correct: false, reason: "wrong_phase" };

    var correct = gateCorrect(gateId, value);
    session.gateResults[gateId] = correct;
    recordProbe(session, gate, correct, timestamp);

    if (correct) session.phase = gateId === "P1" ? "gate_p2" : "watch_step_1";
    else session.phase = gateId === "P1" ? "repair_p1" : "repair_p2";
    return { accepted: true, correct: correct, nextPhase: session.phase };
  }

  function submitRepair(session, gateId, value) {
    var repair = REPAIRS[gateId];
    if (!repair) return { accepted: false, correct: false, reason: "unknown_repair" };
    var requiredPhase = gateId === "P1" ? "repair_p1" : "repair_p2";
    if (session.phase !== requiredPhase) return { accepted: false, correct: false, reason: "wrong_phase" };

    var correct = Number(value) === repair.answer;
    session.repairLog.push({ gateId: gateId, correct: correct, response: value });
    if (correct) session.phase = gateId === "P1" ? "gate_p2" : "watch_step_1";
    return {
      accepted: true,
      correct: correct,
      nextPhase: session.phase,
      feedback: correct
        ? (gateId === "P1" ? "Yes. One visible bond leaves three bond slots for hydrogen." : "Yes. Three carbon atoms in a row need two connections between them.")
        : (gateId === "P1" ? repair.wrongPrompt : "Keep the atoms separate from the connections. Count the lines connecting carbon 1 to 2 and carbon 2 to 3.")
    };
  }

  function tapWatchCarbon(session, carbonId) {
    if (session.phase !== "watch_step_1") return { accepted: false, reason: "wrong_phase", stepComplete: false };
    if (WATCH_SEQUENCE.carbonTargets.indexOf(carbonId) === -1) {
      return { accepted: false, reason: "not_a_carbon_target", stepComplete: false };
    }
    if (session.watchCarbonIds.indexOf(carbonId) !== -1) {
      return { accepted: false, reason: "already_tapped", stepComplete: session.watchStep1Complete };
    }
    session.watchCarbonIds.push(carbonId);
    session.watchStep1Complete = session.watchCarbonIds.length === WATCH_SEQUENCE.carbonTargets.length;
    return {
      accepted: true,
      reason: null,
      count: session.watchCarbonIds.length,
      remaining: WATCH_SEQUENCE.carbonTargets.length - session.watchCarbonIds.length,
      stepComplete: session.watchStep1Complete
    };
  }

  function syncWatchPhase(session, stepIndex) {
    if (stepIndex === 0) session.phase = "watch_step_1";
    else if (stepIndex === 1) session.phase = "watch_step_2";
    else return { accepted: false, reason: "unknown_watch_step", phase: session.phase };
    return { accepted: true, reason: null, phase: session.phase };
  }

  function submitWatchStep2Prediction(session, choiceId) {
    if (session.phase !== "watch_step_2") {
      return { accepted: false, correct: false, reason: "wrong_phase", nextPhase: session.phase };
    }
    if (session.watchStep2Complete) {
      return {
        accepted: false,
        correct: session.watchStep2Prediction === STEP_2_PREDICTION.answer,
        reason: "already_answered",
        nextPhase: session.phase
      };
    }
    var known = STEP_2_PREDICTION.choices.some(function (choice) { return choice.id === choiceId; });
    if (!known) return { accepted: false, correct: false, reason: "unknown_choice", nextPhase: session.phase };

    session.watchStep2Prediction = choiceId;
    session.watchStep2Complete = true;
    var correct = choiceId === STEP_2_PREDICTION.answer;
    return {
      accepted: true,
      correct: correct,
      reason: null,
      nextPhase: session.phase,
      feedback: correct ? STEP_2_PREDICTION.correctFeedback : STEP_2_PREDICTION.repairFeedback
    };
  }

  function canEnterWatch(session) {
    return session.phase === "watch_step_1" || session.phase === "watch_step_2";
  }

  if (!WatchMode.validateSequence(WATCH_SEQUENCE).valid) {
    throw new Error("Bond-Line Watch sequence failed shared Watch validation");
  }

  return Object.freeze({
    LESSON_ID: LESSON_ID,
    SKILL_ID: SKILL_ID,
    ORIENTATION: ORIENTATION,
    GATES: GATES,
    REPAIRS: REPAIRS,
    WATCH_SEQUENCE: WATCH_SEQUENCE,
    createSession: createSession,
    answerOrientation: answerOrientation,
    submitGate: submitGate,
    submitRepair: submitRepair,
    tapWatchCarbon: tapWatchCarbon,
    syncWatchPhase: syncWatchPhase,
    submitWatchStep2Prediction: submitWatchStep2Prediction,
    canEnterWatch: canEnterWatch
  });
});
