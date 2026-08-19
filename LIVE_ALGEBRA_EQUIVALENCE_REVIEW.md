# Live Algebra Answer Equivalence Repair

## Scope

This repair is intentionally surgical. It does not rewrite `day1/classroom-v5.js` or change math routes, chemistry, speech, navigation, saved progress, mastery logic, styling, or the existing v19 phone Check guard.

## Confirmed gap

The live algebra final-answer callbacks convert the input directly to a number. A mathematically correct learner response such as `x = 5` therefore becomes `NaN` and is rejected even though the requested value of x is correct.

The Phase 2A canonical answer checker had the same gap: its algebra families used strict numeric parsing and accepted `5` but rejected `x = 5`.

## Live repair

`day1/algebra-answer-equivalence-v20.js` runs before `math-check-input-guard-v19.js`. On algebra final-answer questions only, it normalizes conservative equivalent forms to the existing numeric value before the existing checker runs.

Accepted examples include:
- `5`
- `x=5`
- `X = 5`
- `x equals 5`
- `x is 5`
- `5=x`

Wrong-variable or non-equivalent forms remain untouched and therefore remain rejected, e.g. `y=5`, `5=y`, `x+5`, and `five`.

## Phase 2A repair

The isolated Phase 2A `math-answer-checker.js` now applies the same conservative algebra-number parsing to `two_sided_linear`, `one_sided_linear`, and `proportion` families. Formula rearrangement remains under its existing symbolic-equivalence rules.

## Evidence required before merge

- Day 1 v5 regression suite passes with the new live shim loaded before v19.
- Phase 2A strict answer-checker suite passes on its existing draft PR.
- Existing wrong-answer and strict-input regressions remain green.
