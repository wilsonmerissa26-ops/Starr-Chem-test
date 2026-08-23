# Codex Remaining Days Master Handoff

## Mission
Finish the remaining AStarryia Organic Chemistry Readiness days without redesigning the teaching system that is already working.

Days 1-3 establish the architecture and are protected. The remaining work is curriculum implementation, not a new engine.

Build Days 4-9 so the learner moves from the current Day 3 resonance foundation through the rest of the readiness targets in the existing diagnostic. Do not stop after one day or one feature. Continue through the complete batch unless a genuine chemistry, repository, or external blocker makes further work unsafe.

## Current protected baseline
Start from current `main`.

Treat these as existing authorities and preserve their behavior unless a reproducible regression requires a surgical fix:
- `DR_MERISSA_TEACHING_ENGINE_SPEC.md`
- `Vocabulary_Support_Escalation_Policy.md`
- `Day1_Curriculum.md`
- `Day1_Interactive_Layer_Specification.md`
- `day1/MATH_TEACHING_CONTRACT.md`
- `Math_Gym_Specification.md`
- `Day2_Curriculum.md`
- `DAY2_FREEZE_STATUS.md`
- `Day3_Curriculum.md`
- `Day3_Vocabulary_Production_Addendum.md`
- `DAY3_FREEZE_STATUS.md`
- live `day1/`, `day2/`, and `day3/` runtimes and their tests

Do not reopen frozen Day 1, Day 2, or the Day 3 resonance engine to make later days easier. Reuse patterns; do not refactor protected runtime merely for cleanliness.

## Locked teaching architecture
Keep the same jobs separated:
- LESSON = understand it
- TOOLBOX = remember it
- PRACTICE = prove it
- MATH GYM = become fast
- NOTEBOOK = personal learning record
- REVIEW = retain it
- SUMMARY = progress / current evidence

For chemistry problem solving, preserve the learning progression:
1. prerequisite retrieval / handoff gate only where actually needed;
2. teach the new idea clearly;
3. low-risk interaction with the idea;
4. Guided practice;
5. less-help practice;
6. clean Independent practice on a fresh item;
7. different-looking Transfer;
8. later Review / retrieval.

Never let Guided work, answer-bearing help, recognition-only games, copying, or wrong-then-correct on the same item count as cold Independent mastery.

Evidence states remain conceptually separate:
- Seen
- Guided
- Developing
- Independent
- Transfer
- Fluent where applicable
- Needs review

## Locked support / IDK behavior
Use the current support contract everywhere it applies.

For vocabulary:
- first cold attempt has no definition, no choices, and no word bank;
- require written meaning plus application;
- after a miss, preserve the learner's answer and identify what was understood, missing, or contradictory;
- visual / animated representation is support, not mastery;
- after three actual unsuccessful written explanations in the current encounter, stop guessing and directly teach the complete meaning plus the correct reasoning for the current application;
- `I do not know yet` is a request for teaching, not a failed written explanation;
- direct teaching creates a fresh encounter boundary;
- immediate teach-back remains Supported;
- later no-clue retrieval gets a fresh attempt budget and is required for Independent;
- if the learner still cannot explain it after teaching and bounded repair, use Needs review and move on rather than looping indefinitely.

For problem solving:
- Hint, First step, Walkthrough / Teach me, and similar help must have distinct jobs;
- wrong answers stay on the exact current problem during repair;
- repeated same-error attempts must change representation rather than repeat the same wording;
- once the learner has received answer-bearing support or made a wrong attempt, that specific item is contaminated for cold Independent evidence;
- use a fresh equivalent item for clean proof;
- stop ordinary practice once sufficient evidence has been collected. Do not create infinite banks just to accumulate clicks.

## Remaining readiness source
The existing `chemistry-readiness.html` diagnostic is the scope authority for the remaining content. Days 1-3 already address the math/Lewis-structure/formal-charge/resonance foundation. Days 4-9 must cover the remaining acid/base, electron-flow, and reaction-energy targets represented by diagnostic items A1-A14.

Do not silently expand this into a full Organic Chemistry I course. The purpose is readiness for Orgo, not replacing the course.

# Remaining day sequence

## Day 4 — Acid/Base Language, Conjugates, Ka and pKa
Primary readiness targets: A1-A4.

Teach and require production of:
- Brønsted acid = proton donor;
- Brønsted base = proton acceptor;
- conjugate acid/base pairs differ by exactly one proton;
- how to generate a conjugate base by removing H+ and adjusting charge correctly;
- how to generate a conjugate acid by adding H+ and adjusting charge correctly;
- `pKa = -log Ka` as meaning, not button pushing;
- lower pKa = stronger acid;
- stronger acid has weaker conjugate base;
- higher-pKa acid has the stronger conjugate base, all else being the conjugate pair comparison being asked.

Use the existing Day 1 log/pKa preparation as a prerequisite handoff, not a duplicate math lesson.

Required Day 4 evidence must include:
- at least one clean conjugate-pair production item;
- at least one clean Ka -> pKa interpretation/calculation;
- at least one clean acid-strength comparison;
- at least one clean conjugate-base-strength comparison;
- cold transfer using a different-looking acid/base pair.

Do not make pKa a vocabulary memorization task. The learner must explain the direction relationship.

## Day 5 — Why One Acid Is Stronger: Conjugate-Base Stability
Primary readiness targets: A5-A7 and A14.

Day 5 must use Day 3 resonance as prior evidence rather than reteaching resonance from zero.

Teach a disciplined comparison process centered on conjugate-base stability. Include, at readiness depth:
- atom / electronegativity where directly comparable;
- resonance stabilization;
- induction from electron-withdrawing groups;
- charge and where it is located;
- hybridization only if the existing readiness scope supports it and it can be taught accurately without opening unnecessary Orgo scope;
- structure-based reasoning rather than functional-group label memorization.

Required examples/transfer should cover the diagnostic ideas:
- increasing acidity across ethane / methanol / acetic acid or fresh equivalents;
- why carboxylate resonance stabilizes the conjugate base;
- chloro-substitution / inductive stabilization using a fresh equivalent before diagnostic-shaped transfer;
- unfamiliar phenol-vs-cyclohexanol style reasoning where the learner uses conjugate-base stabilization rather than having memorized the compound.

Important: the unfamiliar transfer must measure reasoning. Do not teach the exact transfer answer immediately beforehand.

## Day 6 — Acid/Base Equilibrium Direction
Primary readiness target: A8 plus integration of Days 4-5.

Teach:
- acid/base reactions favor formation of the weaker acid and weaker base;
- compare the acid on each side using pKa;
- equilibrium favors the side containing the higher-pKa acid;
- explain why this is a relative-stability statement, not a memorized arrow rule;
- distinguish equilibrium preference from reaction speed.

Required production:
- identify acid/base and conjugate pairs in a proton-transfer reaction;
- compare the relevant pKa values or supplied relative strengths;
- choose the favored side;
- explain the direction in words;
- perform a fresh cold transfer with different species.

Do not yet turn this day into a full equilibrium-constant mathematics unit unless the readiness contract explicitly needs it.

## Day 7 — Nucleophile, Electrophile, Polarity, and Electron Flow
Primary readiness targets: A9-A11.

This day should build directly on Day 3 curved-arrow discipline.

Teach:
- nucleophile as electron-pair donor / electron-rich source;
- electrophile as electron-poor electron-pair acceptor;
- lone pairs, negative charge, and pi electrons as common electron sources when chemically available;
- bond polarization can make an atom electron-poor even when the whole molecule is neutral;
- in CH3-Br style structures, carbon attached to bromine is the electrophilic site;
- curved arrow tail starts at actual electrons;
- arrow head points to the atom/bond receiving the pair;
- when a new bond forms to saturated carbon in the simple substitution readiness example, the C-Br bond pair leaves to Br so carbon does not exceed its allowed valence.

Required learner production must go beyond multiple choice:
- identify nucleophile;
- identify electrophilic atom;
- identify electron source;
- identify electron destination;
- place/describe both arrows for a hydroxide + methyl-halide style substitution;
- state which bond breaks and where that electron pair goes;
- fresh transfer using a different simple nucleophile/electrophile pair.

Do not teach SN1/SN2 rate laws, stereochemistry, leaving-group trends, or mechanism taxonomy unless later explicitly added. The readiness goal is electron-flow meaning.

## Day 8 — Thermodynamics vs Kinetics and Energy Diagrams
Primary readiness targets: A12-A13.

Teach the separation clearly:
- thermodynamics asks which side/state is favored / lower in free energy;
- kinetics asks how fast and depends on the activation barrier;
- negative Delta G degree means products are thermodynamically favored under the stated standard-condition interpretation, not that the reaction is fast;
- activation energy / free-energy barrier to the transition state controls rate qualitatively;
- exergonic does not mean fast;
- a reaction may be favorable but slow.

Use simple energy diagrams with meaningful interaction:
- identify reactants, products, transition-state peak, reaction free-energy difference, activation barrier;
- ask the learner to point/tap/select the quantity tied to rate versus equilibrium/favorability;
- include a no-visual written explanation later so picture recognition alone does not establish understanding.

Required clean evidence:
- one thermodynamic interpretation;
- one kinetic/barrier interpretation;
- one contrast explanation in words;
- one different-looking transfer diagram or scenario.

## Day 9 — Integrated Readiness Transfer / Capstone
Day 9 is not a new content dump. It is the proof that the learner can connect the system.

Use fresh, unfamiliar but readiness-appropriate problems that combine prior skills without requiring material that has not been taught.

Coverage must include, across multiple items:
- Lewis structure / formal charge retrieval as needed;
- resonance or conjugate-base stabilization;
- acid/base identification and conjugate pairs;
- pKa direction;
- acid/base equilibrium direction;
- nucleophile/electrophile identification;
- curved-arrow source -> destination logic;
- thermodynamics vs kinetics distinction.

The learner should not have to solve a full Orgo mechanism she has never been taught. The capstone measures transfer of foundations.

Use a bounded bank. Require sufficient coverage and clean evidence, then stop. If one prerequisite breaks, diagnose and route that subskill to Review / Needs review rather than restarting all nine days.

# Vocabulary requirements for Days 4-9
Use vocabulary only where the term is necessary to reason in that day.

Apply the locked production-first system. Candidate terms may include:
- Day 4: acid, base, conjugate acid, conjugate base, Ka, pKa;
- Day 5: conjugate-base stability, resonance stabilization, induction / inductive effect;
- Day 6: equilibrium, favored side, weaker acid / weaker base;
- Day 7: nucleophile, electrophile, electron-rich, electron-poor;
- Day 8: thermodynamics, kinetics, activation barrier / activation energy, transition state, exergonic;
- Day 9: no large new vocabulary set unless required by a capstone item.

Do not force every candidate term into a word list if the concept can be taught more naturally in the lesson. Vocabulary is a support layer, not a quota.

# Visual / animation requirements
Reuse the shared visual-teaching approach already added to Days 1 and 3.

Visuals belong in teaching/support, not cold proof.

High-value visual uses:
- Day 4: proton removed/added while charge changes; pKa number line showing direction only after an attempt or during teaching;
- Day 5: conjugate-base electron density / resonance contributors / inductive pull with fixed atom skeleton;
- Day 6: two-sided acid/base equilibrium with pKa comparison and favored direction;
- Day 7: bond dipole, electron-rich source, electron-poor destination, curved-arrow movement, bond formation/bond breaking;
- Day 8: reaction coordinate diagram with activation barrier and Delta G shown as different vertical comparisons;
- Day 9: only if support is triggered. Capstone proof must not be visual-cue dependent.

Prefer simple SVG/CSS/DOM visuals and replayable purposeful animation over decorative motion. Respect reduced-motion settings. Do not add a heavy animation framework unless truly necessary.

# Curriculum-first requirement
For every new day:
1. create `DayN_Curriculum.md` before or alongside runtime implementation;
2. define purpose and explicit out-of-scope topics;
3. define prior-day handoff and prerequisite repair behavior;
4. define teaching examples that cannot later be reused as clean Independent evidence;
5. define Guided examples;
6. define a fresh independent item bank with tags;
7. define sufficient-evidence stopping rules;
8. define transfer item(s) and fallback transfer if needed;
9. define error codes and targeted repair routes;
10. define vocabulary and visual behavior;
11. define final status / handoff to the next day;
12. add chemistry-accuracy tests for the content contract.

Do not improvise learner runtime content that has no curriculum contract or test authority.

# Accuracy discipline
Organic chemistry correctness overrides convenience.

Before implementing each day, verify the chemistry against authoritative organic chemistry references. Prefer standard textbook/educational authorities such as OpenStax Organic Chemistry and equivalent university-level sources.

Tests must check chemistry claims, not just DOM strings.

Add adversarial cases that reject plausible but wrong rules, including examples such as:
- higher pKa incorrectly labeled stronger acid;
- stronger acid incorrectly paired with stronger conjugate base;
- resonance treated as atoms moving;
- resonance counted twice as separate molecules;
- acid equilibrium incorrectly favoring the stronger acid side;
- neutral molecule assumed to have no electrophilic atom;
- curved arrow tail starting at a plus sign / empty space;
- negative Delta G incorrectly interpreted as fast;
- low activation barrier incorrectly interpreted as thermodynamic product preference.

Accept chemically correct natural-language explanations conservatively. Do not force one exact sentence.

# Engineering / repository strategy
Do not build all remaining days on one giant unreviewable commit.

Recommended parallel workstreams:

### Track A — acid/base chain
Build sequentially because of direct dependencies:
- Day 4 -> Day 5 -> Day 6

### Track B — electron flow
Build Day 7 using frozen Day 3 curved-arrow/resonance foundations and the shared support framework.

### Track C — energy reasoning
Build Day 8 independently.

### Final integration
Build Day 9 only after Days 4-8 contracts and runtimes are green.

Use a separate branch / PR per day. Keep PR scope limited to that day's curriculum/runtime/tests plus truly shared reusable components. Shared-component changes must have regression coverage for earlier days.

Never merge Phase 2A PR #27 as part of this work. It remains a separate decision.

Do not modify frozen Day 1, Day 2, or Day 3 runtime unless a reproducible later-day integration regression proves a surgical compatibility change is required. If that happens, isolate the change and prove earlier suites remain green.

Preserve localStorage compatibility. Use explicit new keys/versioning for new day state.

# Required runtime capabilities for every new day
Each day must support, where pedagogically relevant:
- clear landing / purpose;
- prior-day handoff gate;
- vocabulary production without pre-clues;
- teach-first and/or try-first path as appropriate;
- Guided interaction;
- targeted feedback preserving learner answers;
- Hint / First step / Walkthrough with distinct behavior;
- three-attempt teaching escalation where the learner is being asked to explain a concept;
- IDK direct teaching;
- visual teaching support where it genuinely improves understanding;
- fresh Independent evidence;
- different-looking Transfer;
- bounded practice / stop rule;
- Needs review instead of infinite loops;
- notebook/review evidence integration where current architecture supports it;
- mobile parity.

# Testing requirements
For every day add:
- syntax tests;
- curriculum/content-contract tests;
- runtime state-machine tests;
- natural-language answer tests for written explanations;
- adversarial chemistry tests;
- support/mastery-separation tests;
- migration/storage tests if state versioning changes;
- mobile/responsive contract checks where possible;
- regression execution of the full existing Dr Merissa engine suite.

CI green is code/contract verification. It is not actual-device certification.

Do not ask the learner/owner to repeatedly phone-test each tiny feature. Batch device verification at meaningful milestones.

Recommended device milestones:
1. Day 4-6 acid/base track completed;
2. Day 7-8 completed;
3. Day 9 integrated capstone / complete readiness path.

At each milestone, request only the shortest set of device checks that automated tests cannot prove: touch, visual clarity, animation usefulness, scrolling, and whether support behavior feels correct.

# Completion definition
Do not report the remaining-days project complete until:
- Days 4-9 each have reviewed curriculum contracts;
- each day has a live learner runtime;
- each day's independent and transfer evidence rules are enforced;
- vocabulary uses production-first support where used;
- no recognition-only vocabulary path can mark a term known;
- three-attempt / IDK support behavior is bounded correctly;
- visuals disappear for cold proof;
- no infinite practice loops remain;
- earlier frozen days remain green;
- all new focused workflows are green;
- full Dr Merissa engine CI is green;
- the final report lists every day, exact files, test counts/results, known limitations, and the URLs for the three batched device milestones.

# Working style
Work autonomously through the batch. Do not ask for approval after every small implementation decision that is already governed by this handoff and the locked engine.

Stop and ask only for:
- a genuine chemistry/content ambiguity not resolved by authoritative sources or existing readiness scope;
- a product decision that would expand beyond readiness;
- an external/deployment blocker that code cannot resolve;
- a conflict that would require changing a frozen Day 1-3 learning contract.

Otherwise: implement, test, red-team, repair, open the scoped PR, and move to the next approved day.