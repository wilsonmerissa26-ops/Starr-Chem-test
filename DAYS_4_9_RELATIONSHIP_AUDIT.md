# Days 4–9 relationship-integrity audit

This scope-locked audit classifies every guided, independent, fallback, and
transfer item in `readiness-day-curricula.js`. All 56 current items depend on at
least one association between a chemical entity/value and a role, property,
direction, or conclusion, so all are classified **relations**. There are no
keyword-only exceptions in the current bank.

| Day | Audited items | Classification |
| --- | --- | --- |
| 4 | D4-G-DONOR; D4-I-CONJUGATE; D4-F-CONJUGATE; D4-I-PKA; D4-F-PKA; D4-I-ACID-STRENGTH; D4-F-ACID; D4-I-BASE-STRENGTH; D4-F-BASE; D4-T-PYRIDINIUM; D4-T-PYRIDINIUM-FALLBACK | relations |
| 5 | D5-G-PROCESS; D5-I-ATOM; D5-F-ATOM; D5-I-RESONANCE; D5-F-RESONANCE; D5-I-INDUCTION; D5-F-INDUCTION; D5-T-PHENOL; D5-T-PHENOL-FALLBACK | relations |
| 6 | D6-G-PAIRS; D6-I-PAIRS; D6-F-PAIRS; D6-I-DIRECTION; D6-F-DIRECTION; D6-I-EXPLAIN; D6-F-EXPLAIN; D6-T-AMMONIUM; D6-T-AMMONIUM-FALLBACK | relations |
| 7 | D7-G-ROLES; D7-I-ROLES; D7-F-ROLES; D7-I-SOURCE; D7-F-SOURCE; D7-I-ARROWS; D7-F-ARROWS; D7-T-CYANIDE; D7-T-CYANIDE-FALLBACK | relations |
| 8 | D8-G-DIAGRAM; D8-I-THERMO; D8-F-THERMO; D8-I-BARRIER; D8-F-BARRIER; D8-I-CONTRAST; D8-F-CONTRAST; D8-T-TWO-PATHS; D8-T-TWO-PATHS-FALLBACK | relations |
| 9 | D9-G-INTEGRATE; D9-I-STRUCTURE-ACID; D9-F-STRUCTURE; D9-I-EQUILIBRIUM-FLOW; D9-F-FLOW; D9-I-ENERGY; D9-F-ENERGY; D9-T-INTEGRATED; D9-T-INTEGRATED-FALLBACK | relations |

The executable audit metadata records the item-specific associations derived
from each answer key. The enforced guard is the critical association that
distinguishes the correct conclusion from a keyword-preserving reversal. The
regression suite requires both the classification and an active rubric guard,
and exercises the confirmed failures, known-good role items, negations, and all
required adversarial categories through `Session.submit()`.

## RED/GREEN record

Before this repair, the exact four responses in the `attacks` fixture of
`test-readiness-days-4-9-relationship-integrity.js` were accepted through
`Session.submit()`. After adding the item-authored guards, those same responses
return `ROLE_RELATION_REVERSED`; each item's canonical chemistry answer remains
accepted. `D6-I-PAIRS` and `D7-I-ROLES` were already guarded and remain the
known-good controls rather than RED cases.
