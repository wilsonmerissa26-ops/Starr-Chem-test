# Math Strategy Generalization Review

## Status

**SOURCE REVIEW COMPLETE FOR THE FOUR AWKWARD-WHOLE CASES. LIVE INTEGRATION REMAINS A SEPARATE GATE.**

The standalone Phase 1 engine passes mathematical-validity and determinism checks across 351 non-gold percent cases plus fraction-of-whole and what-percent-of cases.

The first review found a real scorer defect: formal decimal multiplication treated `0.17×32`, `0.27×64`, `0.69×32`, and `0.88×64` as equally difficult even though their aligned tenths/hundredths partial-product additions require 0, 1, 2, and 0 carries respectively.

The scorer now counts those carry operations using the same existing generic operation-count increment. The source review also identified that several declared weights were present in `WEIGHTS` but were not multiplied into their dimensions. That wiring has been corrected with all four values still at `1.0`, so the correction changes no current scores but prevents future weight edits from silently doing nothing.

## Carry-sensitive rescore

### Case A: 17% of 32

Exact answer: `5.44`

1. `percent_formal_decimal` — `7.900` — formal carry count `0`
2. `percent_1_then_scale` — `9.950`
3. `percent_20_minus_3` — `10.950`

Formal advantage over next route: `2.050`.

Reviewed interpretation: this is a wide enough margin for formal multiplication to remain the deterministic default.

### Case B: 27% of 64

Exact answer: `17.28`

1. `percent_formal_decimal` — `8.250` — formal carry count `1`
2. `percent_1_then_scale` — `9.950`
3. `percent_30_minus_3` — `11.200`

Formal advantage over next route: `1.700`.

This remains on the formal-default side of the initial reviewed close-gap boundary described below.

### Case C: 69% of 32

Exact answer: `22.08`

1. `percent_formal_decimal` — `8.600` — formal carry count `2`
2. `percent_70_minus_1` — `9.650`
3. `percent_1_then_scale` — `11.050`

Raw formal advantage over compensation: `1.050`.

Reviewed interpretation: this is close enough that the Day 1 instructional default should be the mental compensation route `70% - 1%`, while the lower raw-cost formal route remains surfaced as the alternate. The raw arithmetic cost is not rewritten to force that outcome.

### Case D: 88% of 64

Exact answer: `56.32`

1. `percent_formal_decimal` — `7.900` — formal carry count `0`
2. `percent_1_then_scale` — `10.500`
3. `percent_100_minus_10_minus_2` — `10.835`
4. `percent_90_minus_2` — `11.550`

Formal advantage remains `2.600`.

Reviewed interpretation: this is a wide margin; formal multiplication remains the deterministic default.

## Gap-size selection policy

The review rejected both extremes:

- do not force decomposition for every awkward-whole problem;
- do not let a narrowly cheaper formal route automatically suppress a valuable mental-math repetition.

The engine therefore keeps **raw arithmetic cost** and **instructional default selection** as separate, auditable concepts.

For `percent_of_whole` only, when `percent_formal_decimal` is the raw lowest-cost route:

- if the best mental route is more than `1.5` cost units above formal, formal remains the default;
- if the best mental route is within `1.5` cost units, the best mental route becomes the deterministic Day 1 default and formal is returned as the close alternate.

The initial `1.5` boundary is a calibration choice, not a mathematical constant. It was selected to separate the reviewed close case (`1.050`) from the next-smallest reviewed formal advantage (`1.700`). It must be revalidated as the reviewed calibration set grows rather than treated as universal truth.

This policy does **not** modify candidate arithmetic costs and does not replace the generic `0.5` near-tie threshold used for ordinary same-layer alternatives.

## Weight-wiring review finding

`anchorAcquisition`, `divisionDifficulty`, `multiplicationDifficulty`, and `routeOverhead` were all declared in `WEIGHTS` at `1.0`, but the scorer previously consumed their feature values raw. Because the current weight was `1.0`, totals were numerically correct, but a future weight change would have been a silent no-op.

The scorer now explicitly multiplies all declared dimensions by their corresponding weights. Tests temporarily change those four weights and prove that each dimension responds, then restore them.

## Carry-weight assumption

A carry currently adds one generic operation-count increment (`0.35`). This does **not** mean a carry is priced as an entire division or multiplication; those operations have separate difficulty terms. It does mean the model assumes one carry has the same incremental cost as one generic operation-count unit.

That is an explicit calibration assumption, not something forced by arithmetic. It should be reconsidered if a larger human-reviewed set shows that carries are systematically over- or under-priced.

## What is now resolved

- carry-blind formal multiplication scoring: resolved;
- zero-carry equality check for `17% of 32` and `88% of 64`: explicitly tested;
- declared 1.0 weights silently bypassing their weight multipliers: resolved;
- four-case formal-vs-mental review: resolved into a gap-size policy without rewriting raw scores.

## What remains outside this review

This review does not authorize the broader six-area model, full prerequisite router, Student Model personalization, or live browser cutover. Those remain quarantined in the separate Phase 2+ draft.
