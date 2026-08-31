/*
 * U1-01 supported concept check between Watch and Build Together.
 * This is instructional support, never cold independent or mastery evidence.
 */
(function (root, factory) {
  var registry = typeof module === "object" && module.exports
    ? require("../../../unit1-skill-registry.js")
    : root.Unit1SkillRegistry;
  var api = factory(registry);
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.BondLineConceptCheck = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (Registry) {
  "use strict";

  if (!Registry) throw new Error("Unit1SkillRegistry is required");

  var ITEMS = Object.freeze([
    Object.freeze({
      id: "BL-CC-1",
      statement: "Every bond line represents a carbon atom.",
      answer: false,
      revisitPhase: "watch_step_5",
      correction: "A bond line is the connection between carbons. Look for line ends and vertices to locate the carbons."
    }),
    Object.freeze({
      id: "BL-CC-2",
      statement: "An unlabeled line end usually represents carbon.",
      answer: true,
      revisitPhase: "watch_step_5",
      correction: "A line end counts as a carbon position unless another atom is explicitly labeled there."
    }),
    Object.freeze({
      id: "BL-CC-3",
      statement: "An unlabeled vertex usually represents carbon.",
      answer: true,
      revisitPhase: "watch_step_5",
      correction: "An unlabeled corner, or vertex, represents carbon in bond-line notation."
    }),
    Object.freeze({
      id: "BL-CC-4",
      statement: "Hydrogens attached to carbon may be implied rather than written.",
      answer: true,
      revisitPhase: "watch_step_6",
      correction: "Carbon-bound hydrogens can be omitted from the drawing and recovered from the visible bond order."
    })
  ]);

  var CONCEPT_CHECK = Object.freeze({
    id: "bl_supported_concept_check_v1",
    lessonId: "chm221.u1.01",
    skillId: "chem.representation.bond_line",
    supported: true,
    evidenceKind: Registry.EVIDENCE_KINDS.GUIDED,
    items: ITEMS
  });

  function createState() {
    return {
      conceptCheckResponses: [null, null, null, null],
      conceptCheckCorrect: [false, false, false, false],
      conceptCheckComplete: false,
      revisitRequested: null,
      attempts: []
    };
  }

  function submitConceptCheck(state, itemIndex, value) {
    if (!state || !Array.isArray(state.conceptCheckResponses)) return { accepted: false, reason: "state_required" };
    var index = Number(itemIndex);
    if (!Number.isInteger(index) || index < 0 || index >= ITEMS.length) return { accepted: false, reason: "unknown_item" };
    if (value !== true && value !== false) return { accepted: false, reason: "boolean_answer_required" };

    var item = ITEMS[index];
    var correct = value === item.answer;
    state.conceptCheckResponses[index] = value;
    state.conceptCheckCorrect[index] = correct;
    state.attempts.push({ itemId: item.id, response: value, correct: correct, supported: true });

    if (!correct) {
      state.conceptCheckComplete = false;
      state.revisitRequested = item.revisitPhase;
      return {
        accepted: true,
        correct: false,
        complete: false,
        itemId: item.id,
        revisitPhase: item.revisitPhase,
        feedback: item.correction
      };
    }

    state.revisitRequested = null;
    state.conceptCheckComplete = state.conceptCheckCorrect.every(function (result) { return result === true; });
    return {
      accepted: true,
      correct: true,
      complete: state.conceptCheckComplete,
      itemId: item.id,
      revisitPhase: null,
      feedback: state.conceptCheckComplete ? "All four ideas are secure enough to move into Build Together." : "Right. Keep going."
    };
  }

  return Object.freeze({
    CONCEPT_CHECK: CONCEPT_CHECK,
    createState: createState,
    submitConceptCheck: submitConceptCheck
  });
});
