# Math Strategy Generalization Review

## Status

**HUMAN REVIEW REQUIRED BEFORE LIVE INTEGRATION.**

The standalone Phase 1 engine passes mathematical-validity and determinism checks across 351 non-gold percent cases plus fraction-of-whole and what-percent-of cases.

The unseen run surfaced one real judgment question that should not be hidden by adjusting weights without review: for some awkward whole numbers, the current scorer prefers the formal decimal route because all available mental decompositions create multiple decimal intermediates.

This file records representative cases for direct review.

## Case A: 17% of 32

Exact answer: `5.44`

Current ranking:

1. `percent_formal_decimal` — cost `7.900`
   - route: convert `17%` to `0.17`, then calculate `0.17 × 32`
2. `percent_1_then_scale` — cost `9.950`
   - route: `1% of 32 = 0.32`, then scale to `17%`
3. `percent_20_minus_3` — cost `10.950`
   - route: `20% - 3%`

Review question: Is formal decimal multiplication genuinely preferable here, or should no-calculator instruction still favor decomposition even though the decomposition creates awkward decimals?

Friendly-whole contrast: `17% of 200 = 34`

Current ranking:

1. `percent_1_then_scale` — `3.100`
2. `percent_20_minus_3` — `3.700`
3. formal decimal — `7.611`

The same percent changes route because `1% of 200 = 2` is clean.

## Case B: 27% of 64

Exact answer: `17.28`

Current ranking:

1. `percent_formal_decimal` — `7.900`
2. `percent_1_then_scale` — `9.950`
3. `percent_30_minus_3` — `11.200`

Friendly-whole contrast: `27% of 200 = 54`

1. `percent_1_then_scale` — `3.100`
2. `percent_30_minus_3` — `3.950`
3. formal decimal — `7.611`

Review question: Should a difficult whole make formal decimal multiplication the preferred teaching route, or should decomposition remain preferred as a no-calculator reasoning method?

## Case C: 69% of 32

Exact answer: `22.08`

Current ranking:

1. `percent_formal_decimal` — `7.900`
2. `percent_70_minus_1` — `9.650`
3. `percent_1_then_scale` — `11.050`

Friendly-whole contrast: reviewed gold case `69% of 200 = 138`

1. `percent_70_minus_1` — `4.000`
2. `percent_1_then_scale` — `4.200`, accepted near-tie
3. formal decimal — `7.611`

Review question: Does the awkward whole justify switching the preferred route from compensation to formal multiplication?

## Case D: 88% of 64

Exact answer: `56.32`

Current ranking:

1. `percent_formal_decimal` — `7.900`
2. `percent_1_then_scale` — `10.500`
3. `percent_100_minus_10_minus_2` — `10.835`
4. `percent_90_minus_2` — `11.550`

Friendly-whole contrast: reviewed gold case `88% of 50 = 44`

1. `percent_90_minus_2` — `5.500`
2. `percent_100_minus_10_minus_2` — `5.685`, accepted near-tie
3. formal decimal — `6.600`
4. `percent_1_then_scale` — `7.050`

Review question: For `88% of 64`, is `0.88 × 64` actually easier to teach and execute without a calculator than starting from 100% and subtracting 10% and 2%?

## What is already proven

These cases are not correctness failures. Every ranked route independently evaluates to the same exact answer before scoring.

The open issue is instructional cost calibration only.

## Review choices

For each representative awkward-whole case, mark one:

- **FORMAL ROUTE APPROVED**: when all mental decompositions are worse, formal decimal multiplication may legitimately win.
- **DECOMPOSITION PREFERRED**: no-calculator teaching should prefer the best decomposition even when its numeric intermediates are awkward.
- **NEAR-TIE**: preserve both and let later student-fluency evidence break the tie.
- **NEW STRATEGY MISSING**: neither current candidate is good enough; identify the missing route rather than merely changing weights.

Do not tune the scorer until this judgment is made. The purpose of the unseen suite is to expose exactly this kind of decision before live integration.