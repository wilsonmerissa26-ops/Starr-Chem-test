# Math Strategy Selection Policy Amendment

## Status

**MECHANISM REVIEWED; `1.5` THRESHOLD PROVISIONAL PENDING DISTRIBUTION REVIEW.**

This amendment records a deliberate refinement to the frozen Phase 1 selection policy after direct source review and re-execution of the carry-corrected awkward-whole cases.

It does not expand Phase 1 scope. It does not add algebra, the full Prerequisite Router, Student Model personalization, or live browser integration.

## Why an amendment is needed

The frozen specification correctly requires candidate routes to be scored by exact arithmetic cost and allows formal decimal multiplication as a valid candidate. It also defines a generic near-tie mechanism.

Human review of the carry-corrected unseen cases found that raw arithmetic cost alone is not sufficient to choose the Day 1 instructional default in one specific situation: when formal decimal multiplication is only narrowly cheaper than a mental decomposition, skipping the mental route can discard a useful no-calculator repetition even though the measured cost difference is small.

The opposite extreme was also rejected. When decomposition is meaningfully more expensive, the engine should be allowed to recognize that and use the formal route.

## Separate arithmetic ranking from instructional default

The engine must preserve the raw cost ranking exactly as scored.

For `percent_of_whole` only, if `percent_formal_decimal` is the raw lowest-cost candidate:

1. find the lowest-cost non-formal candidate;
2. compute `mentalCost - formalCost`;
3. using the current provisional margin, if the gap is greater than `1.5`, keep formal as the deterministic learner-facing default;
4. if the gap is less than or equal to `1.5`, use the best mental route as the deterministic Day 1 default and surface formal as the close alternate;
5. do not alter either candidate's raw cost to manufacture this result.

The normal `0.5` near-tie threshold remains in place for ordinary same-layer alternatives. The current `1.5` value is a separate instructional-policy margin used only for this formal-versus-mental decision.

## Initial calibration basis

After correcting carry-blindness, the first four reviewed gaps were:

- `17% of 32`: formal advantage `2.050`
- `27% of 64`: formal advantage `1.700`
- `69% of 32`: formal advantage `1.050`
- `88% of 64`: formal advantage `2.600`

That review judged `69% of 32` close enough to preserve the mental repetition as the default, while the wider-gap examples legitimately supported formal selection. The initial `1.5` value separated the reviewed close case (`1.050`) from the next-smallest reviewed gap (`1.700`).

That four-case basis justified the mechanism, but it is not sufficient to freeze the threshold.

## Full-suite distribution finding

`MATH_STRATEGY_POLICY_DISTRIBUTION_REVIEW.md` applies the policy analysis to the existing 351-case non-gold percent suite.

Key findings:

- formal is raw lowest cost in `56` cases;
- `22` of those `56` cases fall within `±0.3` of the current `1.5` boundary;
- the override count is `15` at thresholds `1.5` and `1.6` but jumps to `27` at `1.7`;
- boundary cases cluster at gaps `1.35`, `1.50`, `1.65`, and `1.70`.

Therefore `1.5` remains the current implementation value but is **not yet a frozen or generally calibrated boundary**. Representative human review across those bands is required before the threshold is considered settled.

## Required observability

The engine result must expose enough information to audit the distinction:

- `rawLowestCostStrategyId`
- `chosenStrategyId`
- `selectionPolicy`
- `selectionPolicyGap`
- the formal route in `nearTies` when the close-gap policy switches the learner-facing default to mental

## Required tests

Tests must prove:

- `17% of 32` remains formal-default under the current provisional margin;
- `27% of 64` remains formal-default under the current provisional margin;
- `69% of 32` keeps formal as raw lowest cost but selects `70% - 1%` as the Day 1 default and surfaces formal as the alternate;
- `88% of 64` remains formal-default;
- changing arithmetic weights affects raw costs without silently bypassing declared weight multipliers;
- the policy does not rewrite candidate costs.

These tests verify the current implementation and reviewed seed cases. They do not, by themselves, prove that `1.5` is the final general threshold.

## Carry-cost assumption

The carry correction currently prices each carry as one generic operation-count increment (`0.35`). That is an explicit calibration assumption and remains reviewable independently from this selection-policy amendment.
