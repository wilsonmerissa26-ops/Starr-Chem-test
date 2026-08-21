# Day 1 Freeze Status

## Status

Day 1 is **code-frozen** as of main commit `d615a1c01cb7ad5d99722046822764069344e587`.

The current Day 1 learner experience should not be refactored, consolidated, renamed, or redesigned as routine cleanup. Reopen Day 1 only for:

1. a reproducible learner-facing defect on an actual device;
2. a chemistry or math correctness defect;
3. a regression caught by the existing release suite; or
4. an explicitly approved curriculum change.

## What is already verified in code

The full Dr Merissa Engine Tests suite passed on the final PRs that produced the frozen main state, including:

- Day 1 learner acceptance and adversarial tests;
- math and chemistry mastery/evidence tests;
- Math Gym grading and tiered-help tests;
- chemistry vocabulary tests;
- toolbox, notebook, review, and summary regressions;
- mobile interaction stability tests;
- exact-problem teacher tests;
- strict first-move adversarial tests across all 31 current first-move prompts;
- strict Tiny-step coach adversarial tests across all eight coach families;
- responsive Guided unit-conversion feedback tests;
- responsive Guided math feedback tests;
- Phase 1 strategy calibration/generalization tests; and
- the final Day 1 academic and voice release audit.

## Learner-feedback fixes included in the freeze

The frozen Day 1 now prevents the main false-positive/help defects found during the final audit:

- algebra equivalent answers are accepted without accepting unrelated forms;
- substring grading such as `13` satisfying expected `3` is blocked;
- substring grading such as `14x` satisfying expected `4x` is blocked;
- `10^-4`, `1/10000`, and `0.0001` are treated as equivalent where that is the requested value;
- Guided wrong feedback responds to the learner's actual entry instead of falling through to one canned line;
- Tiny-step checks no longer auto-display a fully worked easier example after a wrong answer;
- the worked easier example remains available only when the learner explicitly asks for it;
- repeated wrong responses can be recognized without marking them correct; and
- supported/corrected work remains separate from independent mastery evidence.

## Actual-device evidence already completed

The live algebra practice path was previously verified on an actual phone: `x=5` was accepted correctly.

Do not ask for that same algebra-equivalence test again unless a new device regression is reported.

## Remaining device spot-check after v29/v30

The final strict first-move and Tiny-step feedback overlays were code-verified and release-tested, but they still need one short actual-device spot-check before they can be labeled device-certified.

Representative check:

- Tiny step: `If 4x = 24, what operation isolates x?`
  - `multiply` must be rejected with response-aware feedback and must not auto-show the worked easier example;
  - repeating `multiply` should be recognized as the same response;
  - `divide both sides` should be accepted.
- First-move coefficient check:
  - `13` must be rejected when the requested coefficient is `3`;
  - `3.0` must be accepted.

This pending spot-check is **not** permission to reopen or redesign Day 1. If the spot-check passes, only update this status to device-certified. If it fails, repair only the reproducible failing path and rerun the full release suite.

## Rule for subsequent days

Use the locked Day 1 teaching architecture as the reusable framework:

- LESSON = understand it
- TOOLBOX = remember it
- PRACTICE = prove it
- MATH GYM = become fast at it
- NOTEBOOK = personal learning record
- REVIEW = retain it
- SUMMARY = know where I stand

New days should reuse the framework and evidence rules rather than modifying frozen Day 1 to make later content easier to build.
