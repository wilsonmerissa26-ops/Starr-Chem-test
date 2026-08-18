# Math Strategy Generalization Review

## Status

**HUMAN REVIEW REQUIRED BEFORE LIVE INTEGRATION.**

The standalone Phase 1 engine passes mathematical-validity and determinism checks across 351 non-gold percent cases plus fraction-of-whole and what-percent-of cases.

The first review found a real scorer defect: formal decimal multiplication treated `0.17×32`, `0.27×64`, `0.69×32`, and `0.88×64` as equally difficult even though their aligned tenths/hundredths partial-product additions require 0, 1, 2, and 0 carries respectively.

The scorer now counts those carry operations using the same existing per-operation weight. No route preference was hard-coded and no pedagogical threshold was changed.

## Carry-sensitive rescore

### Case A: 17% of 32

Exact answer: `5.44`

1. `percent_formal_decimal` — `7.900` — formal carry count `0`
2. `percent_1_then_scale` — `9.950`
3. `percent_20_minus_3` — `10.950`

Formal advantage over next route: `2.050`.

### Case B: 27% of 64

Exact answer: `17.28`

1. `percent_formal_decimal` — `8.250` — formal carry count `1`
2. `percent_1_then_scale` — `9.950`
3. `percent_30_minus_3` — `11.200`

Formal advantage over next route shrinks from `2.050` to `1.700`.

### Case C: 69% of 32

Exact answer: `22.08`

1. `percent_formal_decimal` — `8.600` — formal carry count `2`
2. `percent_70_minus_1` — `9.650`
3. `percent_1_then_scale` — `11.050`

Formal advantage over compensation shrinks from `1.750` to `1.050`.

### Case D: 88% of 64

Exact answer: `56.32`

1. `percent_formal_decimal` — `7.900` — formal carry count `0`
2. `percent_1_then_scale` — `10.500`
3. `percent_100_minus_10_minus_2` — `10.835`
4. `percent_90_minus_2` — `11.550`

Formal advantage remains `2.600`.

## What this resolves

The four formal routes no longer receive one identical arithmetic cost despite different carry requirements. The carry feature is derived from the exact numbers, not from these four prompt strings.

## What remains unresolved

This correction does **not** decide the pedagogical question. Human review is still required to decide how ugly a decomposition must become before a formal decimal route should legitimately win in no-calculator teaching.

The especially informative case is `69% of 32`: after correcting the arithmetic feature, its formal-vs-compensation margin is only `1.050`.

Review choices remain:

- **FORMAL ROUTE APPROVED**
- **DECOMPOSITION PREFERRED**
- **NEAR-TIE**
- **NEW STRATEGY MISSING**

Do not tune route weights merely to force one of those outcomes. Review the corrected cost breakdowns first.
