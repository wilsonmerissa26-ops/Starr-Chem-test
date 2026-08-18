# Live Toolbox and Coach Review

This live-readiness repair addresses two independently observed learner issues from phone review.

## Chemistry Toolbox

The live Toolbox was math-only. Chemistry now receives a closed subject-specific Toolbox in the parent Day 1 view without changing the chemistry iframe architecture.

Current Lewis-structure reference is intentionally narrow:
- H = 1 valence electron
- C = 4
- N = 5
- O = 6
- Si = 4
- P = 5
- S = 6

The build-order reminder is limited to counting valence electrons, choosing the center atom, two electrons per single bond, and placing remaining electrons as lone pairs.

pKa content is intentionally not added to the current Lewis-structure lesson. It belongs when live acid/base work is introduced.

## Algebra Tiny-Step Answer Matching

The live coach previously expected the literal substring `divide`. This rejected correct learner language such as `Division` and `÷4`.

The scoped matcher now accepts:
- divide
- Division
- ÷4
- /4
- divide by 4
- divide both sides by 4

It explicitly rejects wrong operations such as multiply, subtraction, or addition.

No problem answers, math routes, mastery logic, or Phase 2 code are changed by this repair.
