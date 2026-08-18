# Math Strategy Policy Distribution Review

## Status

**DISTRIBUTION REVIEW COMPLETE; MIDDLE BAND ADOPTED FOR PHASE 1.**

This review applies the formal-versus-mental policy analysis to the full existing 351-case non-gold percent generalization suite.

No arithmetic weights or candidate costs were changed to produce the distribution. The instructional selection policy remains separate from raw scoring.

## What was measured

For each of the 351 percent cases, the engine was executed with neutral student fluency. Cases were filtered to those where `percent_formal_decimal` was the raw lowest-cost candidate and at least one non-formal candidate existed.

For each such case:

`gap = bestMentalCost - formalCost`

## Distribution result

- total non-gold percent cases: `351`
- cases where formal is raw lowest cost: `56`
- minimum observed formal advantage: `0.800`
- median observed formal advantage among formal-lowest cases: `1.900`
- maximum observed formal advantage: `2.600`

Threshold sensitivity from the fixed suite:

- `1.2` -> `5` potential mental-default cases
- `1.3` -> `5`
- `1.4` -> `13`
- `1.5` -> `15`
- `1.6` -> `15`
- `1.7` -> `27`
- `1.8` -> `27`

The important finding is not a single best cutoff inside this range. It is the clustering: many real problems occupy a compact middle region, and the count jumps sharply when a threshold crosses that cluster.

## Reviewed middle bands

### Gap `1.350`, best mental route `percent_1_then_scale`

Eight cases occur in the fixed suite. Representative reviewed case:

- `33% of 64`

### Gap `1.500`, best mental route `percent_1_then_scale`

Two cases occur. Representative reviewed case:

- `84% of 64`

### Gap `1.650`, best mental route `percent_70_minus_1`

One case occurs:

- `69% of 72`

### Gap `1.700`, best mental route `percent_1_then_scale`

Eleven cases occur. Representative reviewed case:

- `27% of 64`

All four representative problems were independently re-executed from source and their gaps confirmed exactly.

## Human review conclusion

The `1.35`, `1.50`, `1.65`, and `1.70` cases are closer to each other than to the established wide-gap anchor `88% of 64` at `2.60`.

The review therefore rejected the idea that Phase 1 should search for a knife-edge split inside the middle cluster.

Instead, Phase 1 uses a **formal-versus-mental instructional near-tie band**:

- formal advantage `<= 1.8`: default to the best mental route and surface formal as the alternate;
- formal advantage `> 1.8`: allow formal to remain the learner-facing default.

There is no lower bound: a smaller formal advantage is even closer and remains in the band.

The ordinary same-layer `0.5` near-tie mechanism is unchanged. The `1.8` band is specific to the instructional choice between a raw-cheapest formal decimal route and the best mental route.

## Why `1.8`

`1.8` is not presented as a mathematical constant. It is the Phase 1 calibration ceiling chosen to contain the entire reviewed middle cluster through `1.70` without splitting it internally.

In the fixed 351-case suite, the override count is the same at `1.7` and `1.8` (`27`), so moving the ceiling to `1.8` does not capture a hidden additional cluster in this dataset. Clearly wider reviewed examples remain outside:

- `17% of 32`: gap `2.05`
- `88% of 64`: gap `2.60`

## Reproducibility

The exact population used for these counts is defined in `test-math-strategy-generalization.js`:

- the explicit percent list;
- the explicit whole-number list;
- the exact gold-case exclusions.

That file is part of the source-review handoff so the `351`, `56`, and threshold-count claims can be reproduced directly rather than reconstructed from a different population.

## Future calibration

Do not retune arithmetic weights merely to make the band look cleaner.

As more human-reviewed awkward-whole cases accumulate, re-run the fixed suite and additional independent fixtures. If new evidence shows a different cluster structure, revise the instructional policy through another explicit amendment rather than silently changing the scorer.
