# Test 1 Adaptive Tutor — Scope and Evidence

Status: design/build artifact for the Test 1 adaptive teaching system.

## Authorities

1. Fall 2026 CHM 221 syllabus is the course-scope authority. Unit tests are cumulative. The schedule places Chapter 1, Chapter 2.1–2.6, and Chapter 4 before Test 1.
2. The user-provided Fall 2025 Test 1 is historical evidence for Dr. Meadows' problem style and skill integration. It is not treated as a guarantee of the 2026 question distribution.
3. `DR_MERISSA_TEACHING_ENGINE_SPEC.md` is the behavior authority for diagnosis, teaching, support, prerequisite regression, scaffold fading, independent evidence, explanation, transfer, and later retrieval.
4. `student-model-idk-router.js` remains the only mastery authority.

## Historical problem-type evidence used to avoid underbuilding

The prior Test 1 includes evidence for the following problem types:

- condensed/expanded structure to bond-line drawing
- intermolecular forces and physical-property reasoning
- formal charge
- carbon hybridization
- IR spectrum matching
- Newman projection stability ranking
- cyclopropane ring strain explanation
- same molecule vs constitutional isomer vs stereoisomer vs none
- boiling-point ranking
- substituted cyclohexane chair drawing and stability
- constitutional-isomer construction under a functional-group constraint
- cis/trans substituted cyclohexane stability
- Newman projections mapped to a conformational energy curve

These become training targets because they are plausible Dr. Meadows assessment forms, not because the historical test will be copied.

## Test 1 adaptive skill graph

Foundation/representation nodes:

- `t1.bond_line_reading`
- `t1.lewis_formal_charge`
- `t1.hybridization`
- `t1.functional_groups`
- `t1.ir_recognition`
- `t1.imf_boiling`

Chapter 4 nodes:

- `t1.alkane_formula_isomers`
- `t1.iupac_alkanes`
- `t1.molecular_relationships`
- `t1.newman_conformations`
- `t1.newman_energy`
- `t1.ring_strain`
- `t1.cyclohexane_chairs`

Cross-topic construction/transfer pulls from these nodes rather than becoming a separate memorized unit.

## Dependency rules

- IUPAC naming depends on bond-line reading and parent-chain recognition.
- Newman work depends on bond-line reading and tetrahedral carbon geometry.
- Newman energy depends on Newman reading plus torsional/steric reasoning.
- Cyclohexane chairs depend on ring reading and axial/equatorial orientation.
- Molecular relationship classification depends on connectivity recognition before stereochemical comparison.
- IR matching depends on functional-group recognition.
- Boiling-point ranking depends on intermolecular-force identification plus size/shape reasoning.
- Formal charge can regress to valence/lone-pair bookkeeping.
- Hybridization can regress to bond-order/electron-domain recognition.

When a prerequisite fails, the tutor temporarily teaches and verifies the prerequisite, then returns to the original target.

## Behavior contract

Every teachable skill follows the shared progression:

Watch/Teach → Supported Concept Check → Build Together → Guided → Cold Independent → Explain Why → Transfer → Meaningful Intervening Chemistry Activity → Later Retrieval → shared Student Model mastery decision.

During any supported teaching stage, a wrong response must do more than remain on-screen. It must expose the first detectable broken step, offer the six-way learner diagnosis when needed, teach that exact deficit, require a targeted repair check, and then use a fresh item.

Supported work never becomes cold evidence. Help contaminates cold evidence. Wrong explanations require repair and fresh cold evidence. Retrieval requires both the shared minimum delay and meaningful intervening chemistry activity.

## Accuracy guardrail

Do not encode a chemistry shortcut as an absolute rule when it is only a trend. Examples:

- boiling point: compare intermolecular-force class first, then molecular size/polarizability and shape/branching when force classes are comparable
- hybridization: count electron domains around the atom; a multiple bond is one electron domain for geometry even though its bond order is greater than one
- cyclohexane: a ring flip swaps axial/equatorial but preserves up/down configuration
- cis/trans: configuration is not changed by merely drawing a different chair conformation
- Newman stability: distinguish torsional strain from steric interactions; anti is not a universal label for every staggered drawing unless the relevant largest groups are 180° apart

## Release gate

This route is not production-ready merely because data exist. Before merge it must have:

- chemistry-answer regression tests
- dependency-routing tests
- six-way IDK tests
- false-mastery attacks
- legitimate-mastery path
- actual HTML production-order JSDOM test
- iPad learner test after deployment
