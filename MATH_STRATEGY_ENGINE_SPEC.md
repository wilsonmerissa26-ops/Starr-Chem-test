# Math Strategy Engine Specification v1.0

## Status

**PROVISIONAL. Not frozen yet.**

This architecture specification governs the next Day 1 math build, but implementation must not begin until an independent reviewer has read this source file directly and any material findings have been resolved.

This document governs the isolated Strategy Engine build before any live classroom integration.

The current repair pack remains separate and stable. Do not modify `day1/guided-problem-tutor-v13.js` to patch individual new percent cases while this engine is being built.

## Purpose

The Math Strategy Engine chooses a mathematically valid, low-cognitive-load route for the exact numbers in a problem.

The core rule is:

> Choose the lowest-cost valid route for these exact numbers, not one mandatory shortcut for the entire problem type.

The engine must be deterministic, directly testable, and independent from the display layer.

It must not use live AI to decide math correctness, strategy selection, mastery, or prerequisite routing.

## Governing documents

This specification is subordinate to:

- `Day1_Curriculum.md`
- `day1/MATH_TEACHING_CONTRACT.md`
- `Math_Gym_Specification.md`
- `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

If this file conflicts with the frozen curriculum or the teaching contract, the curriculum and teaching contract win.

## Phase 1 scope

Phase 1 covers the shared fractions-and-percentages strategy layer only.

Supported normalized problem families:

1. `percent_of_whole`
   - Example: `15% of 80`
2. `what_percent_of`
   - Example: `24 is what percent of 300?`
3. `fraction_of_whole`
   - Example: `3/8 of 160`

Phase 1 does not implement algebra, exponents, scientific notation, logs, or unit conversions.

Phase 1 does not implement the full Prerequisite Router. It only attaches prerequisite metadata to generated steps so that a later prerequisite-remediation build can consume it without changing the route-selection architecture.

Phase 1 does not connect itself to the live classroom until all standalone gates in this document pass.

## Learner-facing scope versus internal stress-test scope

Tests are allowed to be broader than the learner-facing Day 1 curriculum. **Tests must never expand the curriculum by accident.**

Examples such as `12.5% of 64`, decimal percentages, percentages over 100%, awkward decimal wholes, or other deliberately difficult inputs may be used internally to test arithmetic anchors, eighth reasoning, candidate validity, cost behavior, rejection behavior, or future extensibility.

Their presence in a calibration, adversarial, metamorphic, or stress-test fixture does **not** mean AStarryia must be taught that notation on Day 1, does not authorize Math Gym to generate it for her, and does not change `Day1_Curriculum.md`.

Learner-facing generation and integration remain bounded by the frozen curriculum and teaching contract unless those governing documents are deliberately revised through a separate review.

Eighth reasoning is already learner-facing through fraction notation such as `3/8 of 160`. Internal use of `12.5% of 64` may test the same arithmetic relationship without adding `12.5%` notation to Day 1 teaching.

## Existing problem sources

The codebase currently has more than one source of fraction/percentage problems. They must eventually share this engine, but they must not all be forced through the same input parser.

### Source A: Math Gym structured items

`math-gym-engine.js` already creates structured data before it formats a prompt string.

Examples include fields such as:

- `area`
- `type`
- `answer`
- fraction objects
- generator-specific numeric values

Math Gym must pass structured numeric problem data directly into the Strategy Engine.

Do not stringify a Math Gym problem and then re-parse the prompt with regex when the original numeric data already exists.

Required change before live integration: Math Gym generators must expose every operand needed by the Strategy Engine in a stable `strategyInput` or equivalent structured field.

### Source B: classroom hand-written items

`day1/classroom-v5.js` contains hand-written problems that may exist only as prompt text plus answer/help metadata.

These require a text adapter until the content source itself is structured.

### Source C: curriculum text

`Day1_Curriculum.md` is content, not runtime data. Curriculum examples may be converted into structured fixtures for tests, but the runtime engine must not scrape Markdown.

## Input architecture

There is no single universal string parser.

The engine accepts a normalized problem object.

Example:

```js
{
  area: 'fractions_percentages',
  family: 'percent_of_whole',
  percent: 15,
  whole: 80,
  source: 'classroom',
  sourceId: 'fractions_percent_problem_2'
}
```

Example:

```js
{
  area: 'fractions_percentages',
  family: 'what_percent_of',
  part: 24,
  whole: 300,
  source: 'math_gym',
  sourceId: 'percent-...'
}
```

Example:

```js
{
  area: 'fractions_percentages',
  family: 'fraction_of_whole',
  numerator: 3,
  denominator: 8,
  whole: 160,
  source: 'math_gym',
  sourceId: 'ofwhole-...'
}
```

### Adapters

Use separate adapters:

- `fromMathGymItem(item)` for structured generator items
- `fromClassroomPrompt(prompt, metadata)` for hand-written text
- test-only fixture constructors for curriculum examples

The core Strategy Engine must never know whether a problem originally came from a string, Math Gym, or the curriculum.

## Output architecture

The engine returns structured data, not display HTML.

Minimum result:

```js
{
  problem,
  candidates: [
    {
      strategyId: 'percent_10_plus_5',
      valid: true,
      cost: 4.2,
      costBreakdown: {...},
      steps: [...],
      prerequisites: [...]
    }
  ],
  chosenStrategyId: 'percent_10_plus_5',
  chosenPlan: {
    concept: '...',
    mentalRoute: '...',
    hint: '...',
    firstStep: {...},
    steps: [...]
  }
}
```

The display layer may decide how to render Hint, Help me understand, First step, Walkthrough, and Mental route. It must not independently choose a different mathematical strategy.

## One decision, multiple support depths

All learner-support controls for one problem must reveal different depths of the same chosen strategy.

- Hint: one clue only
- Help me understand: concept and strategy explanation without solving the problem
- First step: one actionable step, then stop
- Walkthrough: interactive full sequence, holding on an incorrect step
- Mental route: optional concise no-calculator route

The Strategy Engine supplies the plan. The support controller decides how much of that plan to reveal.

## Candidate strategy families

The library must generate multiple valid candidates where appropriate.

### Shared anchors

Version 1 must understand these reusable mathematical anchors because they already appear in Day 1 work:

- halves
- quarters
- eighths
- fifths
- tenths
- 50%
- 25%
- 10%
- 5%
- 1%

Eighth reasoning is in scope now because `fraction_of_whole` problems already include denominators of 8, such as `3/8 of 160`. This does not require teaching `12.5%` notation on Day 1.

### Percent-of-whole candidates

Possible candidate families include:

- direct half for 50%
- direct quarter for 25%
- half plus quarter for 75%
- 10% anchor
- 10% plus 5%
- repeated 10% chunks
- repeated 5% chunks when justified
- 1% anchor
- benchmark fraction equivalent when exact and instructionally appropriate
- decomposition into friendly percentages
- compensation from a nearby friendly percentage
- swap identity `x% of y = y% of x` when the swap creates a genuinely easier mental route
- formal `percent / 100 * whole` route as a valid conceptual method

The engine must not assume that one irregular percentage always uses one strategy.

`37% of 200` and `37% of 80` must be allowed to select different routes because the whole changes the arithmetic cost.

### What-percent-of candidates

Possible candidates include:

- formal `part / whole * 100`
- 10% chunk comparison
- 1% chunk comparison when 1% of the whole is clean
- quarter/half benchmark comparison when exact
- simplification of the fraction `part/whole` before multiplying by 100

Math Gym currently generates this family with whole values that are multiples of 100. The Strategy Engine must not rely on that generator constraint for correctness, because classroom or future sources may provide different whole values.

### Fraction-of-whole candidates

Possible candidates include:

- denominator first, then numerator
- benchmark half/quarter/eighth route
- simplify/cancel before multiplication when useful
- equivalent fraction route when it lowers arithmetic cost

## Cost Scorer

The Cost Scorer ranks valid candidate routes for the exact numbers in the problem.

The scorer must return both a total cost and a visible cost breakdown for tests and auditability.

### Required cost dimensions

At minimum score:

1. operation count
2. division difficulty
3. multiplication difficulty
4. decimal complexity
5. fraction complexity
6. number size / mental load
7. number of intermediate values the learner must hold
8. use of a high-fluency benchmark such as half, quarter, eighth, fifth, or tenth
9. compensation complexity
10. student-fluency adjustment seam

### Difficulty is not binary

Do not score arithmetic as only `clean` or `messy`.

Examples:

- multiplying by `0.5` is much easier than multiplying by `0.68`
- `1% of 200 = 2` is easier than `1% of 80 = 0.8` for many no-calculator routes
- `1/8 of 64 = 8` is unusually clean because the whole supports eighths directly

The scorer must distinguish degrees of decimal and arithmetic difficulty.

### Student fluency seam

The v1 function signature must reserve a personalization input even though v1 uses neutral weights.

Example:

```js
scoreCandidate(candidate, {
  studentFluency: null
})
```

or

```js
studentFluencyWeight(skillId) // returns 0 in v1
```

The v1 neutral value must not change route ranking.

A later version may lower the cost of demonstrated fluent skills and raise the cost of repeatedly weak prerequisite skills without changing the candidate-generation architecture.

## Cost calibration requirement

Do not invent weights, see a few passing examples, and declare the scorer correct.

Weights must be calibrated against a human-reviewed gold set before they are trusted on unseen problems.

### Calibration process

1. Create a fixed calibration dataset of representative problems.
2. For each problem, list the human-preferred route and acceptable near-tie alternatives.
3. Run all candidate routes through the scorer.
4. Inspect mismatches.
5. Adjust weights only by changing documented scoring rules, not by special-casing exact prompt strings.
6. Re-run the entire calibration set after every scoring change.
7. Freeze the initial weights only when the calibration set is acceptable.

### Preserve the already-reviewed calibration work

Do not recreate the first gold set from scratch. The initial calibration batch must be seeded from the cases already worked and reviewed during the August 17 design/review session.

At minimum preserve these reviewed cases or families:

- `15% of 80`
- `25% of 68`
- `50% of 94`
- `75% of 120`
- `37% of 200`
- `37% of 80`
- `62% of 50`
- `83% of 300`
- `12.5% of 64` as an **internal eighth-reasoning stress test only**, not learner-facing Day 1 scope
- compensation-review entries for `33%`, `57%`, `69%`, and `88%` are **not yet complete gold cases** because the reviewed whole number and route are not currently preserved in this specification
- the curriculum and teaching-contract irregular percentages: `17%`, `27%`, `33%`, `38%`, `58%`, `63%`, `72%`, and `84%`

Where the exact whole number, preferred route, arithmetic, or acceptable near-tie for a reviewed case is not yet captured in a repository fixture, do **not** invent a replacement label. Transcribe the reviewed case from the review record and verify the arithmetic before treating it as gold data.

The purpose of preserving this batch is to keep human judgment already exercised during design from being silently replaced by whatever route the first implementation happens to prefer.

### Compensation calibration blocker

The compensation entries `33%`, `57%`, `69%`, and `88%` are currently percentages without their reviewed whole numbers. That is insufficient for calibration because compensation quality depends on the exact whole, the anchor used, and the arithmetic cost of the correction.

Before this specification may be frozen for implementation, each of those four entries must be pinned to:

1. the exact reviewed problem, including the whole number;
2. the preferred compensation route;
3. the exact verified arithmetic for that route;
4. any acceptable near-tie route that was also judged reasonable.

Do not choose convenient wholes after the fact. If the original reviewed pair cannot be recovered, mark that case as unavailable review evidence and create a **new** human-reviewed calibration case explicitly, rather than presenting a newly invented problem as if it were the original reviewed one.

This blocker exists specifically to enforce the same-percent/different-whole rule: a percentage alone is not enough evidence to calibrate route selection.

### Minimum calibration families

The gold set must include:

- 5%
- 10%
- 15%
- 20%
- 25%
- 50%
- 75%
- irregular percentages from the teaching contract: 17%, 27%, 33%, 38%, 58%, 63%, 72%, 84%
- same percentage with different whole numbers
- friendly whole vs awkward whole
- halves, quarters, fifths, eighths, tenths
- what-percent-of cases
- fraction-of-whole cases
- deliberate near-ties where two routes are both reasonable

Known calibration anchors include:

- `15% of 80` should prefer `10% + 5%` over `1% x 15`
- `25% of 68` should prefer the quarter route
- `50% of 94` should prefer the half route
- `75% of 120` should strongly consider `50% + 25%`
- `37% of 200` may legitimately favor a clean 1% route
- `37% of 80` must not be forced to use the identical route simply because the percent is also 37
- `3/8 of 160` should exploit eighth reasoning rather than convert through unnecessary decimals

These are calibration constraints, not exact-string runtime special cases.

## Tie policy

The engine must not pretend every problem has one uniquely superior method.

If two candidates fall within a documented near-tie threshold:

- return both as near-equivalent in diagnostic output
- choose one deterministically for the learner-facing default
- do not fluctuate randomly between strategies for identical inputs

Later personalization may break ties using demonstrated student fluency.

## Step model and prerequisite metadata

Every generated teaching step must include a small-skill dependency label.

Example:

```js
{
  id: 'find_5_percent',
  prompt: 'Five percent is half of 10%. What is half of 8?',
  expected: 4,
  prerequisiteSkillIds: ['halving'],
  hint: 'Take half of the 10% value.'
}
```

Possible prerequisite skill IDs in Phase 1 metadata include:

- `halving`
- `quartering`
- `eighths`
- `divide_by_10`
- `divide_by_100`
- `multiply_by_small_whole`
- `add_friendly_chunks`
- `subtract_friendly_chunks`
- `fraction_denominator_first`
- `fraction_simplification`
- `part_whole_relationship`
- `place_value_decimal_shift`

### Important scope boundary

Attaching prerequisite metadata is Phase 1.

Actually interrupting the original problem, teaching a broken prerequisite, proving that prerequisite, and returning to the original problem is a separate Prerequisite Router build.

Do not let prerequisite remediation silently expand the Phase 1 Strategy Engine scope.

## Testing requirements

Tests must call exported real functions. Source-text pattern matching is not sufficient evidence of behavior.

### Test layers

#### 1. Unit tests

Test:

- adapters
- candidate generation
- candidate mathematical validity
- cost components
- tie handling
- chosen route
- support-plan structure
- prerequisite labels

#### 2. Calibration tests

The fixed human-reviewed calibration set must pass before unseen tests matter.

#### 3. Unseen generalization suite

Run at least 100 generated or fixture-based problems that are not exact copies of the calibration prompts.

The unseen suite must include deliberately awkward cases, not only generator-friendly values.

The test harness should report:

- problem
- candidates considered
- costs
- chosen strategy
- near-tie flag
- any invalid candidate

The goal is not merely `100/100 assertions passed`. The report must make stupid-but-technically-valid choices visible for human review.

#### 4. Metamorphic tests

Where mathematically appropriate, transform a problem while preserving a known relationship and verify sensible behavior.

Examples:

- same percent, different whole values can change route ranking
- scaling whole and answer by a common factor preserves mathematical correctness
- swapping `x% of y` to `y% of x` preserves the answer when that candidate is used

#### 5. Adversarial tests

Include:

- zero and invalid wholes where applicable
- negative values if explicitly out of scope, verify rejection rather than accidental handling
- decimal wholes
- large whole values
- percentages near anchors
- percentages that make compensation attractive
- reduced and unreduced fractions
- equivalent fraction inputs

Out-of-scope input must fail explicitly, not fall through to a misleading teaching route.

Internal stress-test inputs remain internal unless the governing curriculum separately authorizes them for learner-facing use.

## Correctness invariants

Every candidate must independently verify to the same mathematical answer before it can enter ranking.

A low cost must never rescue an invalid strategy.

Required invariant:

```text
parse/normalize -> generate candidates -> verify candidates -> score valid candidates -> choose
```

Never:

```text
score first -> assume chosen route is mathematically valid
```

## Proposed module boundaries

Names may change during implementation, but responsibilities must remain separate.

### `math-strategy-engine.js`

Orchestrates normalized input, candidate generation, verification, scoring, and deterministic selection.

### `math-strategy-adapters.js`

Converts source-specific data into normalized problems.

### `math-strategy-library.js`

Defines mathematically valid candidate strategy families and step builders for fractions/percentages.

### `math-strategy-cost.js`

Contains auditable cost rules and the neutral student-fluency seam.

### `test-math-strategy-engine.js`

Core unit and calibration tests.

### `test-math-strategy-generalization.js`

100+ unseen and adversarial cases with a readable strategy report.

Do not create separate version-numbered browser patches for this work.

## Live integration gate

The engine remains isolated until all of the following are true:

1. this specification has completed independent source-file review and is explicitly frozen for implementation
2. the compensation calibration blocker is resolved, or the unrecoverable original cases are explicitly retired and replaced by newly reviewed cases
3. exported functions are directly callable in Node tests
4. calibration set passes
5. 100+ unseen cases complete with no mathematical invalidity
6. human review finds no unacceptable route-selection pattern in the unseen report
7. full existing test suite shows no new regressions
8. current live classroom repair behavior remains intact
9. integration design identifies how Classroom, Math Gym, and the support controller consume the same chosen plan

Only then may live integration begin.

## Integration direction after Phase 1

When the standalone engine is accepted:

- Math Gym passes structured numeric data directly
- classroom hand-written items use a text adapter
- `guided-problem-tutor-v13.js` or its eventual replacement stops owning strategy selection
- support controls consume one chosen plan at different depths
- no duplicate strategy rules remain in display-layer patches

The engine becomes the source of truth for route selection, while the frozen curriculum remains the source of truth for what is taught.

## Non-goals for this phase

Do not:

- build algebra route planning
- implement the full Prerequisite Router
- connect Student Model weighting beyond the neutral seam
- rewrite `Day1_Curriculum.md`
- add live AI math decisions
- expand Day 1 to percent notation not required by the curriculum merely because the engine could support it
- treat internal stress-test inputs as permission to expand learner-facing content
- patch exact problem strings to satisfy tests
- wire the engine into `/day1/` before the standalone gate passes

## Definition of done for Phase 1

Phase 1 is done only when a reviewer can give the engine unfamiliar fraction/percentage problems and inspect a deterministic explanation of:

1. what problem the engine understood
2. which valid strategies it considered
3. why each strategy received its cost
4. which strategy it selected
5. what teaching steps that strategy produces
6. which smaller skills each step depends on
7. whether another route was a near-tie

Passing exact examples alone is not enough.
