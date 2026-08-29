/*
 * Initial Unit 1 lesson/skill registry.
 *
 * This is intentionally small. It covers the first vertical slice only and
 * prevents UI code from inventing lesson/skill IDs ad hoc. Additional lessons
 * must extend this registry under the evidence-equivalence rule documented in
 * UNIT1_TEACHING_ENGINE_COMPATIBILITY_CONTRACT.md.
 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.Unit1SkillRegistry = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var EVIDENCE_KINDS = Object.freeze({
    PROBE: "probe",
    GUIDED: "guided",
    INDEPENDENT: "independent",
    EXPLAIN_WHY: "explain_why",
    RETRIEVAL: "retrieval"
  });

  var LESSONS = Object.freeze({
    BOND_LINE: Object.freeze({
      lessonId: "chm221.u1.01",
      title: "Bond-Line Structures",
      primarySkillId: "chem.representation.bond_line",
      prerequisiteSkillIds: Object.freeze([
        "chem.bonding.carbon_valence_four",
        "chem.bonding.covalent_bond_meaning"
      ])
    })
  });

  var SKILLS = Object.freeze({
    "chem.representation.bond_line": Object.freeze({
      skillId: "chem.representation.bond_line",
      competencyDefinition: "Recover and produce bond-line notation while preserving carbon positions, connectivity, bond order, implied carbon hydrogens, and explicit heteroatoms.",
      evidenceStandardId: "bond-line-independent-v1",
      evidenceDimensions: Object.freeze([
        "carbon_positions",
        "implied_hydrogens",
        "heteroatom_labels",
        "translation_production"
      ]),
      mastery: Object.freeze({
        minimumScaffoldLevel: 0,
        requiresCorrectExplanation: true,
        requiresDistinctLaterColdItem: true
      }),
      producers: Object.freeze([
        Object.freeze({
          lessonId: "chm221.u1.01",
          role: "primary",
          evidenceStandardId: "bond-line-independent-v1",
          equivalenceNote: "Initial producer. No cross-lesson equivalence is claimed in this slice."
        })
      ])
    }),

    "chem.bonding.carbon_valence_four": Object.freeze({
      skillId: "chem.bonding.carbon_valence_four",
      competencyDefinition: "In the neutral organic structures used in U1-01, determine that carbon commonly reaches total bond order four and use visible bond order to infer remaining C-H bonds.",
      evidenceStandardId: "carbon-valence-four-gate-v1",
      allowedEvidenceKinds: Object.freeze([EVIDENCE_KINDS.PROBE]),
      maySatisfyPrerequisiteGate: true,
      mayAwardMasteryByItself: false,
      producers: Object.freeze([
        Object.freeze({
          lessonId: "chm221.u1.01",
          role: "prerequisite_probe",
          evidenceStandardId: "carbon-valence-four-gate-v1",
          equivalenceNote: "U1-01 P1 is a narrow prerequisite probe. It is not declared equivalent to Day 1 Lewis-structure production or mastery."
        })
      ])
    }),

    "chem.bonding.covalent_bond_meaning": Object.freeze({
      skillId: "chem.bonding.covalent_bond_meaning",
      competencyDefinition: "Recognize that a line drawn between two labeled atoms represents a covalent bond/connection between those atoms.",
      evidenceStandardId: "covalent-bond-meaning-gate-v1",
      allowedEvidenceKinds: Object.freeze([EVIDENCE_KINDS.PROBE]),
      maySatisfyPrerequisiteGate: true,
      mayAwardMasteryByItself: false,
      producers: Object.freeze([
        Object.freeze({
          lessonId: "chm221.u1.01",
          role: "prerequisite_probe",
          evidenceStandardId: "covalent-bond-meaning-gate-v1",
          equivalenceNote: "U1-01 P2 is a narrow prerequisite probe. No cross-runtime evidence equivalence is claimed yet."
        })
      ])
    })
  });

  function getLesson(lessonId) {
    var keys = Object.keys(LESSONS);
    for (var i = 0; i < keys.length; i++) {
      if (LESSONS[keys[i]].lessonId === lessonId) return LESSONS[keys[i]];
    }
    return null;
  }

  function getSkill(skillId) {
    return SKILLS[skillId] || null;
  }

  function validateEvidenceRecord(record) {
    if (!record || typeof record !== "object") return { valid: false, reason: "record_required" };
    if (!getLesson(record.lessonId)) return { valid: false, reason: "unknown_lesson_id" };
    var skill = getSkill(record.skillId);
    if (!skill) return { valid: false, reason: "unknown_skill_id" };
    if (!record.itemId) return { valid: false, reason: "item_id_required" };
    if (Object.keys(EVIDENCE_KINDS).map(function (key) { return EVIDENCE_KINDS[key]; }).indexOf(record.evidenceKind) === -1) {
      return { valid: false, reason: "unknown_evidence_kind" };
    }
    if (typeof record.scaffoldLevel !== "number" || record.scaffoldLevel < 0 || record.scaffoldLevel > 4) {
      return { valid: false, reason: "invalid_scaffold_level" };
    }
    if (typeof record.supported !== "boolean") return { valid: false, reason: "supported_flag_required" };
    if (typeof record.correct !== "boolean") return { valid: false, reason: "correct_flag_required" };
    if (typeof record.timestamp !== "number") return { valid: false, reason: "timestamp_required" };
    return { valid: true, reason: null };
  }

  function canEvidenceAwardMastery(record) {
    var validation = validateEvidenceRecord(record);
    if (!validation.valid) return false;
    var skill = getSkill(record.skillId);
    if (skill.mayAwardMasteryByItself === false) return false;
    return record.evidenceKind === EVIDENCE_KINDS.INDEPENDENT &&
      record.scaffoldLevel === 0 &&
      record.supported === false &&
      record.correct === true;
  }

  return Object.freeze({
    EVIDENCE_KINDS: EVIDENCE_KINDS,
    LESSONS: LESSONS,
    SKILLS: SKILLS,
    getLesson: getLesson,
    getSkill: getSkill,
    validateEvidenceRecord: validateEvidenceRecord,
    canEvidenceAwardMastery: canEvidenceAwardMastery
  });
});
