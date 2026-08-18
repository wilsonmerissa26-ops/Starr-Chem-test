# Math Strategy Policy Distribution Review

## Status

**THRESHOLD REVIEW REQUIRED. MECHANISM REMAINS VALID.**

This review tests the provisional formal-versus-mental selection margin against the full existing 351-case non-gold percent generalization suite.

No arithmetic weights, candidate costs, or route choices were changed to produce this report.

The key distribution counts below are now also asserted by `test-math-strategy-generalization.js`, so future scorer changes cannot silently move the boundary distribution without making the test/review record disagree visibly.

## What was measured

For each of the 351 percent cases, the engine was executed with neutral student fluency. Cases were then filtered to those where `percent_formal_decimal` was the raw lowest-cost candidate and at least one non-formal candidate existed.

For each such case:

`gap = bestMentalCost - formalCost`

The current instructional policy uses a provisional boundary of `1.5` cost units.

## Distribution result

- total non-gold percent cases: `351`
- cases where formal is raw lowest cost: `56`
- cases the current `1.5` policy would override to a mental default: `15`
- formal-lowest cases within `±0.3` of the `1.5` boundary (`1.2` through `1.8`): `22`
- minimum observed formal advantage: `0.800`
- median observed formal advantage among formal-lowest cases: `1.900`
- maximum observed formal advantage: `2.600`

Threshold sensitivity:

- threshold `1.2` -> `5` mental-default overrides
- threshold `1.3` -> `5`
- threshold `1.4` -> `13`
- threshold `1.5` -> `15`
- threshold `1.6` -> `15`
- threshold `1.7` -> `27`
- threshold `1.8` -> `27`

The jump from `15` overrides at `1.6` to `27` at `1.7` shows that the decision boundary is not yet robust enough to treat `1.5` as settled merely because it separated the original four reviewed examples.

## Boundary bands

### Gap `1.350`, best mental route `percent_1_then_scale`

Eight cases:

- `17% of 96`
- `33% of 32`
- `33% of 64`
- `33% of 96`
- `37% of 96`
- `63% of 32`
- `63% of 64`
- `63% of 96`

### Gap `1.500`, best mental route `percent_1_then_scale`

Two cases:

- `84% of 32`
- `84% of 64`

### Gap `1.650`, best mental route `percent_70_minus_1`

One case:

- `69% of 72`

### Gap `1.700`, best mental route `percent_1_then_scale`

Eleven cases:

- `17% of 64`
- `17% of 72`
- `27% of 64`
- `27% of 96`
- `37% of 32`
- `37% of 64`
- `57% of 72`
- `57% of 96`
- `83% of 32`
- `83% of 64`
- `83% of 96`

## Interpretation

The original four reviewed cases were enough to justify separating raw arithmetic cost from instructional default, but they are not enough to justify a universal `1.5` boundary.

The generalization suite shows discrete clusters on both sides of that line. In particular, changing the boundary from `1.6` to `1.7` would add twelve more mental-default decisions at once.

Therefore:

1. keep the policy mechanism and its observability fields;
2. keep `1.5` only as the current provisional implementation value;
3. do not declare the threshold calibrated yet;
4. human-review representative cases from the `1.35`, `1.50`, `1.65`, and `1.70` bands before freezing a final margin;
5. do not tune arithmetic costs merely to make the threshold distribution look cleaner.

## Suggested review sample

A compact sample that covers both route types and all boundary bands:

- `33% of 64` — gap `1.35`, 1%-then-scale mental competitor
- `84% of 64` — gap `1.50`, exactly on current boundary
- `69% of 72` — gap `1.65`, compensation (`70% - 1%`) competitor
- `27% of 64` — gap `1.70`, 1%-then-scale competitor

The final threshold should be chosen from reviewed instructional judgments across these bands, not from the numerical location of the existing boundary alone.
