# Codex Day 1 Finish Handoff

## Mission
Finish AStarryia's Day 1 Foundation Reset as a stable learner-ready classroom before school starts. Do not redesign approved teaching architecture. Do not add API dependencies. Keep browser speech synthesis for now.

## Source of truth
Read these first and preserve them:
- day1/MATH_TEACHING_CONTRACT.md
- DR_MERISSA_TEACHING_ENGINE_SPEC.md if present
- current live Day 1 page: day1/index.html
- current classroom runtime and overlays in day1/
- chemistry-teacher-preview/
- math-gym-engine.js and Day 1 Math Gym UI
- existing tests and .github/workflows/dr-merissa-tests.yml

## Locked architecture
- LESSON = understand it
- TOOLBOX = remember it
- PRACTICE = prove it
- MATH GYM = become fast at it
- NOTEBOOK = personal learning record
- REVIEW = retain it
- SUMMARY = know where I stand

Do not collapse these jobs into each other.

## Non-negotiable learner experience
1. Every math skill supports Teach me first and Let me try first.
2. Teach mode must actually teach: concept, why, formula/rule, substitution, visible intermediate steps, mental/no-calculator route, worked example, guided check, independent practice, fresh transfer.
3. Worked examples reveal progressively. Do not dump the full solution at once.
4. Wrong answers stay on the same exact problem until learner retries, skips, or changes skill.
5. IDK must teach the exact current problem/subskill, not restart the lesson or repeat the prompt.
6. Toolbox is compact, optional, closed by default, one rule/meaning/example/shortcut per reference card. It is not a second lesson.
7. Math Gym remains visible and trains no-calculator fluency and strategy selection.
8. Notebook records repaired mistakes, useful strategies, chemistry facts, and current confusion items.
9. Review uses fresh retrieval, not exact repeated questions as the only review path.
10. Phone, iPad/tablet, and desktop have the same capabilities. Layout may reflow only.
11. Browser speech only. Improve pronunciation normalization, but no API/TTS backend.
12. Do not remove previously approved functionality to fix another area.

## Math scope that must be fully learner-ready
All six areas must be complete and internally aligned:
- Fractions & percentages
- Algebra
- Exponents
- Scientific notation
- Logs & estimation / pKa preparation
- Unit conversions

### Math content requirements
Fractions & percentages:
- fraction meaning
- common denominators
- fraction of a number
- percent as out of 100
- percent of a number
- what percent?
- mental anchors 1%, 5%, 10%, 20%, 25%, 50%, 75%
- irregular percentages such as 17%, 27%, 33%, 38%, 58%, 63%, 72%, 84%
- strategy selection: build up, subtract down, fraction shortcut when exact, x% of y = y% of x when useful
- explicitly distinguish 33% from 33 1/3% = 1/3
- estimate before exact calculation

Algebra:
- balance meaning
- inverse operations
- variables on both sides
- isolate x
- proportions
- explain cross multiplication by clearing denominators, not as magic
- substitution check

Exponents:
- repeated multiplication meaning
- same-base product rule
- quotient rule
- power of a power
- zero exponent
- negative exponent as reciprocal
- fast powers-of-ten recognition

Scientific notation:
- coefficient requirement 1 <= coefficient < 10
- positive vs negative exponent meaning
- decimal movement with why
- multiplication
- division
- subtracting negative exponents
- normalization
- magnitude estimation
- guaranteed working practice bank, never undefined

Logs:
- log as exponent question
- exact powers of ten
- only small landmark set where curriculum needs it, do not require memorizing log 1-29
- product rule taught before use
- factorization using landmarks such as 2,3,5
- negative-log/scientific-notation structure for pKa preparation
- no-calculator estimation

Unit conversions:
- unit meaning and prefix relationships
- predict whether numerical value gets larger/smaller first
- L<->mL, g<->mg, mg<->mcg, mol<->mmol
- time conversions and curriculum-required U.S. liquid anchors
- dimensional analysis setup
- show why units cancel
- rate conversions one unit at a time
- mental shortcut only after conceptual method
- pharmacy-relevant practice

## Mental math requirements
Do not reduce this to a few percentage tricks. Teach and train:
- decomposition
- compensation
- complements to 10/100/1000
- doubling and halving
- factor pairs and cancellation
- benchmark fractions/percents
- place-value reasoning
- estimation
- strategy choice based on actual numbers

Math Gym should progress from accuracy -> strategy recognition -> speed -> mixed/fresh mastery.

## Chemistry scope
Preserve the approved Lewis-structure teacher experience and animations.
- show individual valence electrons when teaching electron count/placement
- show the 2 shared electrons represented by each single bond where appropriate
- explain nitrogen, oxygen, hydrogen, valence electrons, lone pairs, shared pairs, electron budget, center atom, bond count, remaining electrons
- Back and Replay remain available
- learner can return to chemistry menu/change session without losing progress
- after IDK, Talk it through with Dr. Merissa must offer structured diagnosis without an API
- learner can choose a likely confusion, type what they think, or say they do not know what they do not understand
- tiny check must have an answer field and validation
- wrong tiny check stays on the micro-concept
- correct tiny check returns learner to the original problem
- continue into fresh chemistry practice instead of ending after one learned problem

## Practice/mastery behavior
Do not mark a skill mastered for clicking through instruction or answering one problem.
Where supported, preserve separate evidence for:
- Seen
- Guided
- Developing
- Independent
- Transfer
- Fluent
- Needs review

Math Gym contributes fluency, not conceptual mastery.

## Known defects to actively test for
- undefined scientific notation practice
- exponents try-first showing no problem
- practice completion after one question
- repeated exact problem loop after IDK
- teacher narration reading the wrong visible expression/problem
- browser voice mispronouncing units/math symbols/chemical formulas
- toolbox always open or duplicating lessons
- inability to go to previous problem
- skip leaving the current skill unexpectedly
- losing progress when switching Math/Chemistry/skills
- chemistry IDK simply repeating question
- chemistry tiny check with no answer box
- notebook/summary not reflecting actual learning evidence
- phone experience missing controls available on tablet/desktop
- instructions that ask learner to circle/drag/draw when no such interaction exists

## Device acceptance
Test responsive behavior for representative widths around:
- 390px phone
- 768px tablet/iPad
- 1024px tablet/desktop
- 1440px desktop

Same controls and teaching depth at every size. Buttons must be touch-friendly, no required horizontal scrolling, no clipped chemistry controls, no inaccessible iframe content.

## Engineering instructions
- Work from current main, not an old branch.
- Prefer consolidating fragile overlays when safe, but do not rewrite working learner behavior just for cleanliness.
- Preserve localStorage compatibility or migrate it deliberately.
- Add regression tests for every bug fixed.
- Run the entire existing CI suite before completion.
- Do not stop after implementing one slice. Continue through the full checklist.
- If you discover a conflict between old code and this handoff, this handoff plus MATH_TEACHING_CONTRACT.md wins unless a chemistry correctness test proves otherwise.
- Do not introduce OpenAI API, paid services, authentication, backend infrastructure, or new product scope.

## Completion gate
Do not call the task complete until:
1. all six math areas can teach, practice, retry, IDK-remediate, skip within skill, go previous, and generate valid problems;
2. Math Gym is visible and works across the math areas;
3. toolbox is compact/closed by default;
4. chemistry teach/practice/IDK/tiny-check/back/replay/continue flow works;
5. notebook/review/summary render meaningful state;
6. responsive parity checks pass;
7. no undefined learner content appears;
8. no one-question false completion remains;
9. full CI is green;
10. final response reports files changed, tests run, remaining limitations, and the exact live URL to test.

## Working style
Do not ask for approval after each small change. Make the full implementation, run tests, repair failures, and report only when the completion gate is satisfied or a genuine external blocker exists.