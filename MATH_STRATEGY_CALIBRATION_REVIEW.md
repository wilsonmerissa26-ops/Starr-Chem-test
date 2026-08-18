# Math Strategy Calibration Review

## Status

**REVIEW REQUIRED. These are new candidate calibration cases, not recovered historical cases.**

The original August 17 compensation-review pairings for `33%`, `57%`, `69%`, and `88%` could not be recovered with their exact whole numbers. Per `MATH_STRATEGY_ENGINE_SPEC.md`, they are not being reconstructed from memory or presented as original evidence.

This file proposes four **new** calibration cases for human review. They may become gold cases only after review confirms that the preferred route is instructionally sensible for the exact numbers.

## Candidate 1: 33% of 60

Exact answer: `19.8`

Proposed preferred route: build from `30% + 3%`.

Verified arithmetic:

- `10% of 60 = 6`
- `30% of 60 = 18`
- `1% of 60 = 0.6`
- `3% of 60 = 1.8`
- `18 + 1.8 = 19.8`

Why this is a useful calibration case:

- 33% is close to 30%, but not identical to one-third.
- The whole makes 10% very clean while 1% introduces only one decimal place.
- A scorer should be able to compare a 30% + 3% route against a raw 1%-chunk route and formal decimal multiplication without hard-coding the prompt.

Near-tie candidate for review: none assumed. If a reviewer judges another route comparably easy, record it explicitly.

## Candidate 2: 57% of 80

Exact answer: `45.6`

Proposed preferred route: compensate from `60% - 3%`.

Verified arithmetic:

- `10% of 80 = 8`
- `60% of 80 = 48`
- `1% of 80 = 0.8`
- `3% of 80 = 2.4`
- `48 - 2.4 = 45.6`

Why this is a useful calibration case:

- 57% is close to 60%.
- The route combines a clean 10% anchor with a small correction.
- A raw `1% × 57` route is mathematically valid but should normally carry more mental-load cost.

Near-tie candidate for review: none assumed.

## Candidate 3: 69% of 200

Exact answer: `138`

Proposed preferred route: compensate from `70% - 1%`.

Verified arithmetic:

- `10% of 200 = 20`
- `70% of 200 = 140`
- `1% of 200 = 2`
- `140 - 2 = 138`

Why this is a useful calibration case:

- Both the anchor and correction are whole numbers.
- It should strongly reward a nearby-anchor compensation route.
- It provides a clean contrast with problems where 1% is decimal or awkward.

Near-tie candidate for review: a direct clean 1%-based calculation may be mathematically easy here because `1% = 2`, but repeating or multiplying that unit by 69 should still be scored separately from the two-step compensation route. Whether it qualifies as a near-tie is for human review.

## Candidate 4: 88% of 50

Exact answer: `44`

Proposed preferred route: compensate from `90% - 2%`.

Verified arithmetic:

- `10% of 50 = 5`
- `90% of 50 = 45`
- `1% of 50 = 0.5`
- `2% of 50 = 1`
- `45 - 1 = 44`

Why this is a useful calibration case:

- The 1% value is decimal, but the 2% correction resolves to a whole number.
- It tests whether the scorer looks at the whole route rather than penalizing any decimal intermediate equally.
- It is a useful example of why arithmetic difficulty must be graded, not binary.

Near-tie candidate for review: none assumed.

## Review gate

For each case, the reviewer should mark one of:

- **APPROVE AS GOLD**: preferred route is sensible for the exact numbers.
- **APPROVE WITH NEAR-TIE**: preferred route is sensible, but another route should be preserved as near-equivalent.
- **REVISE**: keep the percentage but change the whole or route, with verified arithmetic.
- **REJECT**: remove this case from calibration.

These cases do not become gold calibration data until that review happens.

## Scope protection

These examples are calibration data for the Strategy Engine. Their inclusion here does not independently expand learner-facing Day 1 content. Learner-facing scope remains controlled by `Day1_Curriculum.md` and `day1/MATH_TEACHING_CONTRACT.md`.