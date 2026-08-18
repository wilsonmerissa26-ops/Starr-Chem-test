# Math Strategy Calibration Review

## Status

**REVIEW COMPLETE. Approved as new calibration evidence.**

The original August 17 compensation-review pairings for `33%`, `57%`, `69%`, and `88%` could not be recovered with their exact whole numbers. Per `MATH_STRATEGY_ENGINE_SPEC.md`, they were not reconstructed from memory or presented as original evidence.

Four **new** calibration cases were created, independently reviewed, and arithmetic-verified. Two were approved as the preferred route and two were approved with explicit near-tie alternatives.

## Gold Case 1: 33% of 60

**Review outcome: APPROVE AS GOLD.**

Exact answer: `19.8`

Preferred route: build from `30% + 3%`.

Verified arithmetic:

- `10% of 60 = 6`
- `30% of 60 = 18`
- `1% of 60 = 0.6`
- `3% of 60 = 1.8`
- `18 + 1.8 = 19.8`

Review finding:

- No free-anchor shortcut applies.
- `33%` is not near enough to `0%` or `100%` to create a lower-cost free-anchor compensation route.
- For this whole, `30% + 3%` is the reviewed lowest-cost route.

Accepted near-tie: none recorded.

## Gold Case 2: 57% of 80

**Review outcome: APPROVE AS GOLD.**

Exact answer: `45.6`

Preferred route: compensate from `60% - 3%`.

Verified arithmetic:

- `10% of 80 = 8`
- `60% of 80 = 48`
- `1% of 80 = 0.8`
- `3% of 80 = 2.4`
- `48 - 2.4 = 45.6`

Review finding:

- The natural alternative `50% + 5% + 2%` requires three terms instead of two.
- `60% - 3%` wins cleanly for this whole.

Accepted near-tie: none recorded.

## Gold Case 3: 69% of 200

**Review outcome: APPROVE WITH NEAR-TIE.**

Exact answer: `138`

Preferred default route: compensate from `70% - 1%`.

Verified arithmetic:

- `10% of 200 = 20`
- `70% of 200 = 140`
- `1% of 200 = 2`
- `140 - 2 = 138`

Accepted near-tie route: clean `1%` route followed by doubling `69`.

Verified near-tie arithmetic:

- `1% of 200 = 2`
- `69 × 2 = 138`

Review finding:

- `1% of 200 = 2` is unusually clean.
- Doubling `69` is easy mental arithmetic.
- The scorer must preserve both as reasonable routes rather than forcing compensation to appear uniquely superior.

## Gold Case 4: 88% of 50

**Review outcome: APPROVE WITH NEAR-TIE.**

Exact answer: `44`

Preferred route: compensate from `90% - 2%`.

Verified arithmetic:

- `10% of 50 = 5`
- `90% of 50 = 45`
- `1% of 50 = 0.5`
- `2% of 50 = 1`
- `45 - 1 = 44`

Accepted near-tie route: compensate from the free `100%` anchor as `100% - 10% - 2%`.

Verified near-tie arithmetic:

- `100% of 50 = 50` with no computation required
- `10% of 50 = 5`
- `2% of 50 = 1`
- `50 - 5 - 1 = 44`

Review finding:

- `90%` is not a free anchor. It requires computation before subtraction.
- `100%` is free by definition because it is simply the whole.
- A scorer should therefore assign lower anchor-acquisition cost to `0%` and `100%` than to computed anchors such as `10%`, `25%`, `50%`, `70%`, or `90%`.
- The two routes remain close enough to preserve as near-ties for calibration.

## Scoring implication surfaced by review

`0%` and `100%` are the only universal percent anchors that require no arithmetic to acquire:

- `0% of whole = 0`
- `100% of whole = whole`

Candidate scoring should distinguish **free anchors** from **computed anchors**. Distance from a free anchor may therefore justify compensation even when the percentage is not especially close to another traditional benchmark.

This is a scoring factor, not a rule that compensation from `0%` or `100%` always wins. The exact whole number, correction cost, operation count, decimal complexity, and student-fluency weighting still determine the final route ranking.

## Scope protection

These examples are calibration data for the Strategy Engine. Their inclusion here does not independently expand learner-facing Day 1 content. Learner-facing scope remains controlled by `Day1_Curriculum.md` and `day1/MATH_TEACHING_CONTRACT.md`.