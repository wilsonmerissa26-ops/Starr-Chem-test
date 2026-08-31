/* ============================================================
   DR. MERISSA TEACHING ENGINE — PIECE 3: WATCH MODE
   Pure logic. No DOM. No rendering.
   Implements Section 9 behavior from DR_MERISSA_TEACHING_ENGINE_SPEC.md:
   Next / Back / Replay / Pause, student-controlled pacing,
   exact one-step transitions, notebook emissions during teaching,
   and completion reporting back to the orchestrator.
   ============================================================ */

var WATCH_STATUS = {
  READY: "READY",
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  COMPLETE: "COMPLETE"
};

/* ------------------------------------------------------------
   Verified Day 1 sequences.
   Watch Mode deliberately starts with NH3 because the frozen
   teaching-engine spec defines the precise 9-step sequence.
   H2O is included as the second Watch-ready molecule required
   by the build scope.
   ------------------------------------------------------------ */

var WATCH_SEQUENCES = {
  NH3: {
    id: "watch_nh3_v1",
    skillId: "lewis_structures",
    title: "NH\u2083 — Why nitrogen has one lone pair",
    totalValenceElectrons: 8,
    steps: [
      {
        id: "nh3_1",
        narration: "Nitrogen appears first. Nitrogen contributes 5 valence electrons.",
        visual: { atoms: ["N"], bonds: [], lonePairs: [], counter: { available: 5, placed: 0, remaining: 5 } },
        notebookFacts: [
          { id: "fact_n_valence_5", text: "Nitrogen contributes 5 valence electrons." }
        ]
      },
      {
        id: "nh3_2",
        narration: "Three hydrogens appear. Each hydrogen contributes 1 electron, bringing the total to 8.",
        visual: { atoms: ["N","H","H","H"], bonds: [], lonePairs: [], counter: { available: 8, placed: 0, remaining: 8 } },
        notebookFacts: [
          { id: "fact_h_valence_1", text: "Hydrogen contributes 1 valence electron." },
          { id: "fact_nh3_total_8", text: "NH\u2083 has 8 total valence electrons." }
        ]
      },
      {
        id: "nh3_3",
        narration: "Eight electrons total, before anything else happens.",
        visual: { atoms: ["N","H","H","H"], bonds: [], lonePairs: [], counter: { available: 8, placed: 0, remaining: 8 } },
        notebookFacts: []
      },
      {
        id: "nh3_4",
        narration: "The first N\u2013H bond forms. One bond accounts for 2 electrons.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1]], lonePairs: [], counter: { available: 8, placed: 2, remaining: 6 } },
        notebookFacts: [
          { id: "fact_bond_2e", text: "One covalent bond represents 2 shared electrons." }
        ]
      },
      {
        id: "nh3_5",
        narration: "The second N\u2013H bond forms. Four electrons are now placed.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1],["N","H2",1]], lonePairs: [], counter: { available: 8, placed: 4, remaining: 4 } },
        notebookFacts: []
      },
      {
        id: "nh3_6",
        narration: "The third N\u2013H bond forms. Six electrons are placed, so 2 remain.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1],["N","H2",1],["N","H3",1]], lonePairs: [], counter: { available: 8, placed: 6, remaining: 2 } },
        notebookFacts: []
      },
      {
        id: "nh3_7",
        narration: "Two electrons are left. Hydrogen cannot take lone pairs, so the remaining pair belongs on nitrogen.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1],["N","H2",1],["N","H3",1]], lonePairs: [], counter: { available: 8, placed: 6, remaining: 2 } },
        notebookFacts: [
          { id: "fact_h_no_lone_pair", text: "Hydrogen forms one bond and does not carry a lone pair in these Day 1 structures." }
        ]
      },
      {
        id: "nh3_8",
        narration: "That last pair is placed on nitrogen as one lone pair. All 8 electrons are now accounted for.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1],["N","H2",1],["N","H3",1]], lonePairs: [["N",1]], counter: { available: 8, placed: 8, remaining: 0 } },
        notebookFacts: [
          { id: "fact_nh3_lone_pair", text: "In NH\u2083, nitrogen has three bonds and one lone pair." }
        ]
      },
      {
        id: "nh3_9",
        narration: "That's why nitrogen has a lone pair here. Not memorized, accounted for.",
        visual: { atoms: ["N","H","H","H"], bonds: [["N","H1",1],["N","H2",1],["N","H3",1]], lonePairs: [["N",1]], counter: { available: 8, placed: 8, remaining: 0 } },
        notebookFacts: []
      }
    ]
  },

  H2O: {
    id: "watch_h2o_v1",
    skillId: "lewis_structures",
    title: "H\u2082O — Why oxygen has two lone pairs",
    totalValenceElectrons: 8,
    steps: [
      {
        id: "h2o_1",
        narration: "Oxygen contributes 6 valence electrons.",
        visual: { atoms: ["O"], bonds: [], lonePairs: [], counter: { available: 6, placed: 0, remaining: 6 } },
        notebookFacts: [
          { id: "fact_o_valence_6", text: "Oxygen contributes 6 valence electrons." }
        ]
      },
      {
        id: "h2o_2",
        narration: "Two hydrogens contribute 1 electron each. H\u2082O therefore has 8 total valence electrons.",
        visual: { atoms: ["O","H","H"], bonds: [], lonePairs: [], counter: { available: 8, placed: 0, remaining: 8 } },
        notebookFacts: [
          { id: "fact_h2o_total_8", text: "H\u2082O has 8 total valence electrons." }
        ]
      },
      {
        id: "h2o_3",
        narration: "The first O\u2013H bond forms and accounts for 2 electrons.",
        visual: { atoms: ["O","H","H"], bonds: [["O","H1",1]], lonePairs: [], counter: { available: 8, placed: 2, remaining: 6 } },
        notebookFacts: []
      },
      {
        id: "h2o_4",
        narration: "The second O\u2013H bond forms. Four electrons are now placed, leaving 4.",
        visual: { atoms: ["O","H","H"], bonds: [["O","H1",1],["O","H2",1]], lonePairs: [], counter: { available: 8, placed: 4, remaining: 4 } },
        notebookFacts: []
      },
      {
        id: "h2o_5",
        narration: "Hydrogen is already full with one bond, so the four remaining electrons belong on oxygen.",
        visual: { atoms: ["O","H","H"], bonds: [["O","H1",1],["O","H2",1]], lonePairs: [], counter: { available: 8, placed: 4, remaining: 4 } },
        notebookFacts: []
      },
      {
        id: "h2o_6",
        narration: "Two lone pairs are placed on oxygen. Four bond electrons plus four lone-pair electrons equals all 8.",
        visual: { atoms: ["O","H","H"], bonds: [["O","H1",1],["O","H2",1]], lonePairs: [["O",1],["O",2]], counter: { available: 8, placed: 8, remaining: 0 } },
        notebookFacts: [
          { id: "fact_h2o_lone_pairs", text: "In H\u2082O, oxygen has two bonds and two lone pairs." }
        ]
      },
      {
        id: "h2o_7",
        narration: "The two lone pairs are not a fact to memorize separately. They are the four electrons left after the two O\u2013H bonds are counted.",
        visual: { atoms: ["O","H","H"], bonds: [["O","H1",1],["O","H2",1]], lonePairs: [["O",1],["O",2]], counter: { available: 8, placed: 8, remaining: 0 } },
        notebookFacts: []
      }
    ]
  }
};

function clone(x) {
  return JSON.parse(JSON.stringify(x));
}

function validateSequence(sequence) {
  if (!sequence || !Array.isArray(sequence.steps) || sequence.steps.length === 0) {
    return { valid: false, reason: "missing_steps" };
  }

  var ids = {};
  for (var i = 0; i < sequence.steps.length; i++) {
    var step = sequence.steps[i];
    if (!step.id || ids[step.id]) return { valid: false, reason: "duplicate_or_missing_step_id" };
    ids[step.id] = true;

    if (!step.visual) return { valid: false, reason: "missing_visual" };
    if (!step.visual.counter) {
      if (sequence.requiresCounter === false) continue;
      return { valid: false, reason: "missing_counter" };
    }
    var c = step.visual.counter;
    if (c.available < 0 || c.placed < 0 || c.remaining < 0) return { valid: false, reason: "negative_counter" };
    if (c.available - c.placed !== c.remaining) return { valid: false, reason: "counter_mismatch" };
  }
  return { valid: true, reason: null };
}

function createWatchSession(sequence, options) {
  var check = validateSequence(sequence);
  if (!check.valid) throw new Error("Invalid Watch sequence: " + check.reason);

  options = options || {};
  return {
    sequenceId: sequence.id,
    skillId: sequence.skillId,
    status: WATCH_STATUS.READY,
    currentIndex: 0,
    completed: false,
    paused: false,
    history: [],
    replayCountByStepId: {},
    notebookEntryIdsEmitted: [],
    eventLog: [],
    startedAt: options.timestamp || Date.now(),
    completedAt: null
  };
}

function currentStep(session, sequence) {
  return clone(sequence.steps[session.currentIndex]);
}

function currentView(session, sequence) {
  return {
    status: session.status,
    paused: session.paused,
    completed: session.completed,
    currentIndex: session.currentIndex,
    stepNumber: session.currentIndex + 1,
    totalSteps: sequence.steps.length,
    step: currentStep(session, sequence),
    canBack: session.currentIndex > 0,
    canNext: !session.completed && !session.paused,
    canReplay: true,
    canPause: !session.completed
  };
}

function emitNotebookFacts(session, step) {
  var emitted = [];
  (step.notebookFacts || []).forEach(function(fact) {
    if (session.notebookEntryIdsEmitted.indexOf(fact.id) === -1) {
      session.notebookEntryIdsEmitted.push(fact.id);
      emitted.push(clone(fact));
    }
  });
  return emitted;
}

function begin(session, sequence, timestamp) {
  if (session.completed) return { changed: false, reason: "already_complete", view: currentView(session, sequence), notebookFacts: [] };
  session.status = WATCH_STATUS.PLAYING;
  session.paused = false;
  var step = sequence.steps[session.currentIndex];
  var facts = emitNotebookFacts(session, step);
  session.eventLog.push({ type: "BEGIN", stepId: step.id, timestamp: timestamp || Date.now() });
  return { changed: true, reason: null, view: currentView(session, sequence), notebookFacts: facts };
}

/* Next advances exactly ONE step. No timer. No auto-advance. */
function next(session, sequence, timestamp) {
  if (session.completed) return { changed: false, reason: "already_complete", view: currentView(session, sequence), notebookFacts: [] };
  if (session.paused) return { changed: false, reason: "paused", view: currentView(session, sequence), notebookFacts: [] };

  if (session.status === WATCH_STATUS.READY) {
    return begin(session, sequence, timestamp);
  }

  if (session.currentIndex >= sequence.steps.length - 1) {
    session.completed = true;
    session.status = WATCH_STATUS.COMPLETE;
    session.completedAt = timestamp || Date.now();
    session.eventLog.push({ type: "COMPLETE", stepId: sequence.steps[session.currentIndex].id, timestamp: session.completedAt });
    return {
      changed: true,
      reason: "completed",
      view: currentView(session, sequence),
      notebookFacts: [],
      completion: { sequenceId: sequence.id, skillId: sequence.skillId, completedAt: session.completedAt }
    };
  }

  session.history.push(session.currentIndex);
  session.currentIndex += 1;
  session.status = WATCH_STATUS.PLAYING;
  var step = sequence.steps[session.currentIndex];
  var facts = emitNotebookFacts(session, step);
  session.eventLog.push({ type: "NEXT", stepId: step.id, timestamp: timestamp || Date.now() });

  return { changed: true, reason: null, view: currentView(session, sequence), notebookFacts: facts };
}

/* Back reverts exactly ONE step. It does not erase notebook history:
   once Dr. Merissa taught a fact, it remains taught and available. */
function back(session, sequence, timestamp) {
  if (session.currentIndex === 0) {
    return { changed: false, reason: "at_start", view: currentView(session, sequence) };
  }
  if (session.completed) {
    session.completed = false;
    session.completedAt = null;
  }
  session.currentIndex -= 1;
  session.status = session.paused ? WATCH_STATUS.PAUSED : WATCH_STATUS.PLAYING;
  session.eventLog.push({ type: "BACK", stepId: sequence.steps[session.currentIndex].id, timestamp: timestamp || Date.now() });
  return { changed: true, reason: null, view: currentView(session, sequence) };
}

/* Replay repeats ONLY the current step. It never changes currentIndex. */
function replay(session, sequence, timestamp) {
  var step = sequence.steps[session.currentIndex];
  session.replayCountByStepId[step.id] = (session.replayCountByStepId[step.id] || 0) + 1;
  session.eventLog.push({ type: "REPLAY", stepId: step.id, timestamp: timestamp || Date.now() });
  return {
    changed: false,
    reason: "replay_current_step",
    replayCount: session.replayCountByStepId[step.id],
    view: currentView(session, sequence),
    notebookFacts: []
  };
}

function pause(session, sequence, timestamp) {
  if (session.completed) return { changed: false, reason: "already_complete", view: currentView(session, sequence) };

  session.paused = !session.paused;
  session.status = session.paused ? WATCH_STATUS.PAUSED : WATCH_STATUS.PLAYING;
  session.eventLog.push({
    type: session.paused ? "PAUSE" : "RESUME",
    stepId: sequence.steps[session.currentIndex].id,
    timestamp: timestamp || Date.now()
  });

  return { changed: true, reason: session.paused ? "paused" : "resumed", view: currentView(session, sequence) };
}

/* Integration hook: Piece 3 does not mutate the Student Model directly.
   It reports an event for the orchestrator to consume. */
function completionEvent(session, sequence) {
  if (!session.completed) return null;
  return {
    type: "WATCH_COMPLETED",
    sequenceId: sequence.id,
    skillId: sequence.skillId,
    completedAt: session.completedAt
  };
}

var WatchMode = {
    WATCH_STATUS: WATCH_STATUS,
    WATCH_SEQUENCES: WATCH_SEQUENCES,
    validateSequence: validateSequence,
    createWatchSession: createWatchSession,
    currentStep: currentStep,
    currentView: currentView,
    begin: begin,
    next: next,
    back: back,
    replay: replay,
    pause: pause,
    emitNotebookFacts: emitNotebookFacts,
    completionEvent: completionEvent
  };
if (typeof module !== "undefined" && module.exports) module.exports = WatchMode;
if (typeof globalThis !== "undefined") globalThis.WatchMode = WatchMode;