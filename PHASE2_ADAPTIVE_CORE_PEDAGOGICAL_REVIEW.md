# Phase 2A Adaptive Math Core — Pedagogical Review

## Status

**PEDAGOGICAL REVIEW IN PROGRESS. PR #27 REMAINS DRAFT AND NON-LIVE.**

This document records teaching-quality judgments that cannot be established by mathematical correctness, source coverage, or structural CI alone.

## Reviewed and corrected

### 1. Deeper remediation must teach the actual smaller missing idea

Four graph edges were rejected during human review because they were mathematically adjacent but instructionally mismatched:

- `reciprocal_meaning → fraction_denominator_first`
- `proportion_structure → fraction_denominator_first`
- `dimensional_cancellation → fraction_denominator_first`
- `magnitude_prediction → estimation`

Corrections:

- `reciprocal_meaning.dependsOn = []`
- `proportion_structure.dependsOn = []`
- `dimensional_cancellation.dependsOn = []`
- `magnitude_prediction.dependsOn = ['unit_relationship']`

Rationale:

A prerequisite edge is a diagnosis claim. It should exist only when failure on the parent skill reasonably indicates that the child lesson is the next smaller idea to teach. A mathematically related topic is not enough.

The graph-invariant test now locks these four teaching judgments in addition to existence/acyclicity checks.

### 2. Representation switching must really change the teaching representation

The migrated prerequisite builder labeled one representation `concrete_analogy` but filled it with the ordinary `why` explanation by default. That meant a Student Model representation switch could change the label without actually changing how the idea was explained.

All 46 current prerequisite nodes now receive an explicit concrete analogy.

The prerequisite-content contract now requires each node's concrete analogy to be present and different from:

- the ordinary `why` explanation;
- the diagram representation;
- the worked example;
- the build-together representation.

This does not claim every analogy is perfect. It does close the specific false-modality problem where the same explanation was presented under a different label.

## Strategy-adaptivity conclusion

The accepted Phase 1 fractions/percentages engine genuinely generates and ranks competing strategies.

Most additional Phase 2A families currently produce one canonical deterministic candidate per family. Their adaptivity therefore comes from prerequisite diagnosis, support level, representation switching, evidence, and remediation rather than broad multi-strategy competition.

This is **not a Phase 2A specification violation**. The Phase 2A spec assigns the additional families to deterministic planning and does not require multiple candidate routes for every family.

However, this limitation must remain explicit. Future adaptive development should add competing learner-appropriate strategies where there is a meaningful pedagogical choice rather than calling a fixed algorithm fully strategy-adaptive.

Likely future priority areas include:

- two-sided algebra when multiple legal isolation paths have materially different cognitive load;
- proportions when dimensional clearing versus relationship reasoning are both appropriate;
- unit conversions when dimensional analysis and a trusted one-step unit relationship are both valid at the learner's current level;
- exponent simplification where expanded-factor reasoning can serve as a conceptual route and exponent laws as a compressed route.

Do not add alternatives merely to increase candidate count. Multiple routes are justified only when they teach meaningfully different valid approaches.

## Remaining human gate

Before PR #27 leaves draft, review still needs to judge:

1. whether the remaining prerequisite edges are defensible teaching diagnoses, not merely valid dependencies;
2. whether the 46 lesson explanations, diagrams, analogies, worked examples, and build-together prompts are concise and understandable on a phone;
3. which non-live Phase 2A capabilities should be learner-facing in the first Day 1 integration versus held for remediation/internal use;
4. what exact Phase 2B learner actions count as observed smaller-skill evidence;
5. which non-Phase-1 families genuinely need alternate strategy generation before the system can later be described as fully strategy-adaptive.

## Gate discipline

Passing CI does not resolve the remaining judgments above.

PR #27 stays draft. No `day1/index.html` integration is authorized by this review document.
