# Day 1 Math Teaching Contract

This file protects the approved learner experience from being flattened during later integration work.

## Locked instructional architecture

Each part of the classroom has one job:

- **LESSON = understand it.** Dr. Merissa teaches, models, thinks aloud, checks understanding, diagnoses mistakes, and gradually removes support.
- **TOOLBOX = remember it.** Optional reference only. It is closed by default and opened by the learner when help is wanted.
- **PRACTICE = prove it.** Together -> less help -> alone -> different-looking transfer problem.
- **MATH GYM = become fast at it.** Accuracy -> strategy recognition -> speed -> mixed problems -> no-calculator automaticity.
- **NOTEBOOK = the learner's personal learning record.** It stores learned formulas, useful strategies, recurring confusions, repaired mistakes, and chemistry patterns.
- **REVIEW = retain it.** Previously learned material returns through spaced/fresh retrieval.
- **SUMMARY = know where I stand.** Report progress, misconceptions, mastery evidence, fluency, review needs, and what comes next.

Toolbox, Lesson, Practice, and Math Gym must never be collapsed into one another during later integrations.

## Non-negotiable teaching sequence

Every math skill must support both entry routes:

1. **Teach me first**
2. **Let me try first**

A learner who tries first may open teaching at any time. A wrong answer or IDK stays attached to the exact current problem until the learner chooses to leave it.

A full lesson follows:

**Diagnose -> Explain -> Model -> Think aloud -> Student participates -> Check -> Adjust -> Student solves -> Transfer -> Retain**

Skills must be decomposed into teachable subskills. If evidence identifies one broken subskill, teach that subskill instead of restarting the entire topic.

## Fresh-problem transfer rule

Teaching, guided practice, and independent proof have different jobs and must not reuse the same exact item as though repetition were transfer.

For every skill, the normal progression is:

**Teach/model with Example A -> guided or reduced-support work on fresh Example B -> independent work on fresh Example C -> later fresh retention/fluency items as needed.**

Hard rules:

- A problem whose answer, solution path, decisive step, or substantial scaffold has been shown is **instructionally contaminated for independent mastery**.
- A contaminated problem may remain useful for learning or correction, but it must never be counted as Independent, Transfer, or cold-mastery evidence.
- Choosing **Teach me**, **Walk me through it**, **Give me a hint**, or equivalent substantial support on a problem changes that item's evidence role. The engine must obtain a fresh equivalent item before claiming unsupported mastery.
- Fresh items must assess the same underlying skill without merely copying the same surface problem. Change numbers, wording, representation, or context while preserving the intended construct and difficulty.
- Question banks may contain five or six items per skill without requiring the learner to complete all five or six in one sitting. Items are evidence resources, not a mandatory worksheet.
- Unused equivalent items should be preserved for later transfer, retention, or fluency checks when possible.

## Stop when evidence is sufficient

The engine must not continue serving near-identical questions simply because more questions exist in the bank.

- If the learner demonstrates the target independently on fresh transfer evidence, stop the immediate concept drill and move forward unless additional fluency work is specifically indicated.
- If the learner is accurate but inefficient, additional work belongs under **fluency/Math Gym**, not disguised as more conceptual mastery testing.
- If the learner is inconsistent, use only enough fresh evidence to determine whether the skill is stable.
- If the learner repeats the same error, stop repeating the same problem type. Diagnose the broken prerequisite or representation and reteach differently.
- If teaching is not producing progress after reasonable supported attempts, stop the loop, mark the skill/prerequisite for further instruction or review, and return later rather than frustrating the learner indefinitely.
- Later spaced retrieval is stronger retention evidence than several immediate copies completed while the method is still in working memory.

The engine should always know why another item is being served: **understanding, transfer, uncertainty resolution, fluency, or retention**. If none applies, stop.

## No unexplained tools

The system must not require a formula, rule, conversion, mathematical operation, chemistry convention, or strategy that the learner has neither demonstrated nor been taught.

When a required prerequisite is missing:

1. Identify the missing prerequisite rather than treating the downstream answer as the only error.
2. Teach the prerequisite in plain language, including why it works.
3. Model it with an instructional example.
4. Give the learner a fresh supported opportunity to use it.
5. Add or expose the compact reference in the Toolbox when it is a reusable rule.
6. Return to the original skill with a fresh problem after the prerequisite check passes.

A rule may not appear for the first time inside a hint as though the learner was expected to know it already.

For logs/scientific notation, teaching and Toolbox support must explicitly include the relationship when needed:

`log(a x 10^n) = log(a) + n`

and the underlying fact:

`log(10^n) = n`.

Example: `log(6 x 10^-6) = log(6) - 6 ≈ 0.78 - 6 = -5.22`; therefore `-log(6 x 10^-6) ≈ 5.22`.

The lesson must explain the sign and meaning. The Toolbox is the later quick reference, not a substitute for that explanation.

## What teaching means

Teaching is not a rule sentence. A teaching segment must include:

- the idea in plain language;
- why the method works;
- the formula or formal rule when one exists;
- visible substitution into the formula;
- visible intermediate steps;
- a mental/no-calculator route when appropriate;
- teacher think-aloud about how to choose an efficient route;
- worked examples during teaching as needed to contrast problem types;
- student participation during the worked process;
- a tiny check before independent practice;
- Back, Replay, and Teach another way;
- optional Show me visually / Give me an easier example / Tell me what I did wrong support when appropriate.

No interface may instruct a learner to circle, drag, highlight, draw, or move something unless that action actually exists on screen.

## Toolbox contract

The Toolbox is a reference, not a second lesson.

- It must be **closed by default**.
- A compact **Toolbox** button/tab must remain easy to reach near the top of the learning interface.
- Opening it may use a drawer, modal, sheet, or compact expandable panel. It must not permanently occupy the lesson below the teaching content.
- Organize reference cards by skill (Percentages, Fractions, Mental Math, Unit Conversions, Exponents, Scientific Notation, Algebra, Logs/Estimation, etc.).
- Each reference card should normally contain only: **rule/relationship + plain-language meaning + ONE worked example + ONE useful mental shortcut when appropriate**.
- Do not place multiple examples of the same idea in the Toolbox. Multiple contrasting examples belong in Dr. Merissa's teaching sequence.
- Toolbox help may be available during learning and guided practice but must be hidden/disabled during a true cold mastery check when the mastery rules require no support.

Example percentage reference card:

**Percent of a number**
- Rule: `percent / 100 x whole`
- Meaning: change the percent into a part of 1, then multiply by the whole.
- One example: `27% of 80 = 0.27 x 80 = 21.6`
- Mental shortcut: build from friendly anchors when easier, e.g. `20% + 5% + 2%`.

The lesson, not the Toolbox, teaches how and when to choose among 25% + 2%, 30% - 3%, 60% - 2%, swapping `x% of y = y% of x`, and other routes.

## No-calculator fluency

The goal is not only correctness. The learner should develop fast mental fluency. Lessons introduce the reasoning; Math Gym builds automaticity. Explicitly teach and train:

- decomposition (break numbers into friendly parts);
- compensation (adjust to a friendly number, then correct);
- complements to 10, 100, and 1000;
- doubling and halving;
- factor pairs and cancellation;
- benchmark fractions and percents;
- place-value reasoning;
- estimation before exact calculation;
- strategy selection based on the actual numbers rather than one mandatory shortcut.

These strategies may be described as mental-math strategies commonly emphasized in high-fluency arithmetic instruction. Do not make cultural claims that are not sourced.

### Irregular percentage requirement

Teaching and Math Gym must include non-anchor percentages such as 17%, 27%, 33%, 38%, 58%, 63%, 72%, and 84%.

Teach the learner to inspect the numbers and choose an efficient route. Examples of valid reasoning include:

- `27%` as `25% + 2%` or `30% - 3%` depending on the whole;
- `58%` as `60% - 2%` when that is easier;
- `33%` as exactly `30% + 3%`, while explicitly distinguishing it from `33 1/3% = 1/3`;
- `x% of y = y% of x` when swapping creates an easier mental calculation;
- estimation before exact work to catch decimal/place-value errors.

Do not dump all of these routes into the Toolbox. Dr. Merissa teaches strategy choice with contrasting problems; Math Gym trains it.

## Unit-conversion requirement

Unit conversions must teach meaning, not only decimal movement.

The learner should understand:

- what the units and prefixes mean;
- whether the numerical value should become larger or smaller before calculating;
- the conversion relationship;
- dimensional-analysis setup when appropriate;
- why matching units cancel;
- the mental shortcut after the conceptual method is understood;
- pharmacy-relevant metric relationships used by the curriculum.

The Toolbox may show one representative conversion setup and the key relationships. Multiple conversion examples belong in teaching/practice.

## Required Day 1 areas

- Fractions and percentages
- Algebra
- Exponents
- Scientific notation
- Logs and estimation
- Unit conversions

Each area needs aligned teaching, aligned practice, fresh problems, a working optional toolbox, previous-problem navigation, retry on wrong answers, and same-skill skip behavior.

## Mastery is not completion

Clicking through teaching does not establish mastery. Track evidence separately where supported by the engine:

- Seen
- Guided
- Developing
- Independent
- Transfer
- Fluent
- Needs review

Math Gym contributes fluency evidence; it must not falsely substitute for conceptual mastery.

## Device parity

Phone, tablet, and desktop must expose the same learning capabilities. Layout may reflow, but content, controls, teaching depth, navigation, Toolbox access, and mastery behavior must remain equivalent.
