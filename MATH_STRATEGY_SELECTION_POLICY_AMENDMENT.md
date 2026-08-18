# Math Strategy Selection Policy Amendment

## Status

**REVIEWED PHASE 1 INSTRUCTIONAL NEAR-TIE POLICY.**

This amendment records a deliberate refinement to the frozen Phase 1 selection policy after direct source review, carry-corrected re-execution, and full-suite gap-distribution review.

It does not expand Phase 1 scope. It does not add algebra, the full Prerequisite Router, Student Model personalization, or live browser integration.

## Why an amendment is needed

The frozen specification correctly requires candidate routes to be scored by exact arithmetic cost and allows formal decimal multiplication as a valid candidate. It also defines a generic near-tie mechanism.

Human review found that raw arithmetic cost alone is not sufficient to choose the Day 1 instructional default when formal decimal multiplication and a mental route sit in the same middle-cost cluster. In that zone, defaulting immediately to formal can discard useful no-calculator practice even though the arithmetic advantage is modest.

The opposite extreme was also rejected. When formal is meaningfully cheaper, the engine should be allowed to recognize that and use it.

## Separate arithmetic ranking from instructional default

The engine must preserve the raw cost ranking exactly as scored.

For `percent_of_whole` only, if `percent_formal_decimal` is the raw lowest-cost candidate:

1. find the lowest-cost non-formal candidate;
2. compute `mentalCost - formalCost`;
3. if the formal advantage is **less than or equal to `1.8` cost units**, treat the pair as an **instructional near-tie**: use the best mental route as the deterministic Day 1 default and surface formal as the alternate;
4. if the formal advantage is **greater than `1.8`**, keep formal as the deterministic learner-facing default;
5. do not alter either candidate's raw cost to manufacture this result.

There is intentionally no lower bound such as `1.0`. If the formal advantage is smaller than `1.0`, the routes are even closer and remain inside the instructional near-tie zone.

The normal `0.5` near-tie threshold remains unchanged for ordinary same-layer alternatives. The `1.8` value is a separate formal-versus-mental instructional band ceiling.

## Evidence for using a band instead of splitting the middle cluster

The first reviewed awkward-whole cases established two useful anchors:

- `69% of 32`: formal advantage `1.050` — mental default judged instructionally appropriate;
- `88% of 64`: formal advantage `2.600` — formal default judged legitimately better.

The later full-suite review showed a dense middle cluster at:

- `1.35`
- `1.50`
- `1.65`
- `1.70`

Representative cases were then reviewed directly from source and re-executed:

- `33% of 64` — gap `1.35`, best mental route `1%` then scale;
- `84% of 64` — gap `1.50`, best mental route `1%` then scale;
- `69% of 72` — gap `1.65`, best mental route `70% - 1%`;
- `27% of 64` — gap `1.70`, best mental route `1%` then scale.

The review concluded that these cases are more meaningfully treated as one middle instructional zone than split by a precise cutoff inside the cluster.

The current `1.8` ceiling sits above the reviewed `1.70` cluster while still leaving the clearly wider `2.05` and `2.60` formal-favoring examples outside the band. It is calibration-derived, not mathematical law, and should be revisited as the reviewed case set grows.

## Required observability

The engine result must expose enough information to audit the distinction:

- `rawLowestCostStrategyId`
- `chosenStrategyId`
- `selectionPolicy`
- `selectionPolicyGap`
- the formal route in `nearTies` when the instructional near-tie policy switches the learner-facing default to mental

The raw candidate costs must remain unchanged by this policy.

## Required tests

Tests must prove:

- `69% of 32` remains mental-default with formal raw-cheapest at gap `1.05`;
- `33% of 64` is mental-default at gap `1.35`;
- `84% of 64` is mental-default at gap `1.50`;
- `69% of 72` is mental-default at gap `1.65`;
- `27% of 64` is mental-default at gap `1.70`;
- `17% of 32` remains formal-default at gap `2.05`;
- `88% of 64` remains formal-default at gap `2.60`;
- exactly `1.8` remains inside the instructional near-tie band;
- a gap above `1.8` lets formal win;
- changing arithmetic weights affects raw costs without silently bypassing declared weight multipliers;
- the policy does not rewrite candidate costs.

## Carry-cost assumption

The carry correction currently prices each carry as one generic operation-count increment (`0.35`). That is an explicit calibration assumption and remains reviewable independently from this selection-policy amendment.
