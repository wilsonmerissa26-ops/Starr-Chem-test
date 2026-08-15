# FULL LEARNER CLASSROOM V2 SPEC

## STATUS
This file is the learner-facing build authority for the next classroom implementation. It does not replace `DR_MERISSA_TEACHING_ENGINE_SPEC.md`, `Day1_Curriculum.md`, `Day1_Interactive_Layer_Specification.md`, or `Math_Gym_Specification.md`. Those remain authoritative for engine behavior, locked Day 1 content, chemistry correctness, and math generation rules. Where this file discusses learner experience, navigation, animation, teacher behavior, or classroom orchestration, this file governs.

## NON-NEGOTIABLE PRODUCT GOAL
The product must behave like a real digital tutor, not a worksheet with buttons. A learner who does not already know the material must be able to understand what is happening, learn the idea, practice it with support, try it independently, and recover from confusion without becoming trapped.

A technically functioning state machine is not sufficient. Passing unit tests is not sufficient. Learner certification requires that the experience visibly teaches.

## DAY 1 CONTENT LOCK
Day 1 curriculum content is locked to `Day1_Curriculum.md`. Renaming a learner-facing lane does not authorize curriculum changes. Do not silently replace, shorten, expand, reorder, or substitute Day 1 skills.

Day 1 must preserve:
- the six established math areas and their diagnostic priority,
- the existing branch rules and 50-minute/60-minute policies,
- chemistry scope through valence electrons, Lewis structures, lone pairs, octet reasoning, H2O, CH3OH, and fresh CH3NH2 mastery,
- existing chemistry correctness rules,
- existing Student Model and IDK routing behavior.

## CLASSROOM HOME
The learner starts from a classroom home, not a forced linear Day 1 tunnel.

The home presents three major learning lanes:

### 1. Targeted Math Plan
This is the math specifically required by the existing pharmacy/chemistry preparation plan. Day 1 uses the locked six math areas from `Day1_Curriculum.md`. It diagnoses, teaches, remediates, and checks mastery.

### 2. Foundational Math Academy
This is a separate long-term mathematics curriculum. It must not replace Day 1 Targeted Math Plan content. It rebuilds mathematical thinking using mastery-oriented principles associated with strong Singapore and East Asian mathematics instruction, including:
- concrete -> pictorial -> abstract progression,
- number bonds and decomposition,
- bar models and visual relationships,
- strong number sense,
- mental math and flexible calculation,
- place value,
- estimation,
- pattern recognition,
- multiple solution strategies,
- mathematical reasoning and explanation,
- carefully varied examples,
- fluency after understanding rather than before it.

It is not a second Math Gym and not merely a larger question bank.

### 3. Chemistry Foundation
This is the chemistry learning lane. Day 1 chemistry follows the locked content in `Day1_Curriculum.md`.

## SUBJECT CHOICE AND NAVIGATION
- The learner may begin with Targeted Math Plan or Chemistry Foundation.
- Foundational Math Academy is also independently available from the classroom home.
- The learner may leave Math, open Chemistry, then return to Math.
- The learner may leave Chemistry, open either math lane, then return.
- Switching lanes must never mark a lane complete.
- Progress in each lane is saved separately.
- No lane may trap the learner.
- Every teaching/practice screen must provide a clear route back to the classroom menu.
- Every skip action must actually leave the current activity, save the unresolved state, and provide a valid next destination.

## PREVIEW/STORAGE SAFETY
Preview builds must use a storage namespace distinct from production. A preview may never read or overwrite the production `astarryia-day1-v1` key. Preview state contamination is a release-blocking defect.

## UNIVERSAL TEACHING CYCLE
Every real concept follows this progression unless a diagnostic proves the learner can skip supported stages:

1. TEACH
2. WATCH
3. DO IT WITH ME
4. GUIDED PRACTICE
5. TRY IT ALONE
6. FRESH CHECK

These are functional teaching stages, not decorative labels.

### TEACH
Dr. Merissa explains the concept in short, understandable chunks. The screen must answer:
- What is this?
- Why does it work?
- What should I notice?
- What usually confuses people?

Avoid long textbook paragraphs. Use plain language plus accurate notation.

### WATCH
The learner sees a visible demonstration. The demonstration advances in steps and is controlled by learner taps such as `Show next step`, so the learner can process one change at a time.

Watch must contain actual visual state change or animation. A paragraph next to a static empty stage does not count.

### DO IT WITH ME
The learner performs one instructed action at a time in the same visual environment used by Watch. The teacher must tell the learner exactly what action is expected, acknowledge correct actions, and correct wrong actions without dumping the learner back at the beginning.

### GUIDED PRACTICE
The learner solves fresh problems with prompts/hints available. Assistance is progressively reduced.

### TRY IT ALONE
No active step-by-step prompt. Existing Build Alone rules remain in force: no notebook, no hints, no prompts, and no counter in rendered output.

### FRESH CHECK
Uses unseen or appropriately spaced items. It is not the same question just completed in guided practice.

## REAL ANIMATION REQUIREMENT
Animation is a product requirement.

Animations must be meaningful instructional animations, not decorative movement.

Examples:

### Algebra
For `3x + 4 = 19`:
- show a visual balance or equivalent relationship,
- animate removal of 4 from both sides,
- show `3x = 15`,
- animate division into three equal groups,
- reveal `x = 5`,
- explain why the same operation occurs on both sides.

### Fractions
- display equal-sized pieces,
- animate partitioning when denominators differ,
- animate combining/removing pieces,
- transition from picture to symbolic notation.

### Scientific notation
- animate decimal movement,
- update the exponent with each move,
- explicitly connect direction of decimal movement to exponent sign/change.

### Exponents
- animate repeated multiplication,
- collapse repeated factors into exponent notation,
- visually demonstrate reciprocal meaning for negative exponents.

### Logs
- animate a forward power relationship such as `10^3 = 1000`,
- then flip/reframe it as `log(1000) = 3`,
- make clear that these are the same relationship asked in opposite directions.

### Unit conversions
- animate a dimensional-analysis cancellation map,
- cross out old units only when matching conversion factors appear.

### Chemistry
The molecule itself must visibly change:
- atom appears,
- atom is positioned,
- bond forms,
- electron usage updates,
- lone pairs appear,
- teacher explains the reason for each change.

For NH3, a valid Watch sequence is:
1. N appears in the center.
2. First H appears and N-H bond forms.
3. Second H appears and bond forms.
4. Third H appears and bond forms.
5. Electron counter shows 6 electrons used in bonds.
6. Remaining 2 electrons become one lone pair on N.
7. Octet check highlights the eight electrons around N.

The learner advances each instructional beat with a tap. Do not auto-run a fast animation that cannot be processed.

## TEACHER BEHAVIOR
Dr. Merissa is an active teacher throughout the lesson.

She must:
- introduce the objective,
- explain the idea before unsupported work,
- narrate demonstrations,
- ask short prediction questions,
- respond to the learner's actual action,
- explain why a wrong answer/action is wrong,
- change representation when the learner remains confused,
- celebrate useful reasoning without overpraising,
- return to prerequisite teaching when evidence shows the prerequisite is missing.

A generic message such as `That value does not satisfy the question yet` is not sufficient when a specific misconception can be identified.

## IDK / CONFUSION ROUTING
`I don't know yet` is a request for teaching, not a wrong-answer penalty.

The system must determine whether the learner needs:
- the concept explained differently,
- help starting,
- a worked example,
- a simpler prerequisite,
- a representation switch.

If one explanation fails, do not repeat it verbatim. Switch representation or reduce complexity.

## MULTIPLE QUESTIONS AND ITEM VARIETY
One question may never complete an entire skill or Day 1.

Each concept must have enough verified items to support:
- diagnostic/probe items,
- worked/model examples,
- supported practice,
- guided practice,
- multiple independent items,
- a fresh mastery check.

The system tracks recent item IDs so it does not immediately loop the exact same question after a mistake or reload unless deliberate spaced retrieval calls for it.

Day 1 completion remains governed by the locked completion criteria. A single correct response cannot satisfy a multi-skill gate.

## TARGETED MATH PLAN EXPERIENCE
The six locked Day 1 areas remain:
- Logs & estimation
- Algebra
- Exponents
- Scientific notation
- Fractions & percentages
- Unit conversions

The UI may use the agreed learner-facing name `Targeted Math Plan`, but the underlying Day 1 curriculum stays unchanged.

For each area:
- refresh is a real mini-teach, not one sentence,
- a visual worked example is available,
- the probe is multiple items,
- 2/3 triggers targeted correction plus fresh verification,
- 0-1/3 triggers mini-lesson -> guided -> independent,
- repeated confusion triggers the established representation switch,
- no-calculator log estimation provides the approved reference values instead of silently expecting memorization.

## FOUNDATIONAL MATH ACADEMY V1 SCOPE
Create the architecture and first complete module without altering Day 1.

First module: Number Sense & Flexible Calculation.

It must include:
- place value and magnitude,
- composing/decomposing numbers,
- make-a-ten/make-a-hundred strategies,
- compensation,
- number bonds,
- estimation before exact calculation,
- multiple strategies for the same problem,
- learner explanation of which strategy made sense and why.

Example lesson for 50 + 38:
- animate 38 -> 40,
- calculate 50 + 40 = 90,
- show that 2 extra was added,
- animate 90 - 2 = 88,
- then compare with 50 + 30 + 8 = 88.

The learner is taught strategy choice, not merely the answer.

## CHEMISTRY DAY 1 EXPERIENCE
Use the existing molecule-stage correctness logic but rebuild learner-facing orchestration as needed.

### Teach sequence
- valence electron meaning,
- H/C/N/O values used today,
- how bonds consume two electrons,
- why H is never central in today's structures,
- lone-pair meaning,
- octet reasoning.

### Watch sequence
Use animated CH4 and/or NH3 examples. The molecule must build visibly one meaningful step at a time.

### Build Together
The learner must not be dropped into an empty workbench without active direction.

For NH3, expected interaction style:
- teacher: `Tap N.`
- only the expected action advances the teaching step,
- after correct action: explain why N is central,
- teacher: `Now add one H.`,
- guide bond formation,
- continue until the molecule is complete,
- then explicitly account for used and remaining electrons.

Wrong atom/action gets specific feedback and the learner stays at the current instructional step.

### Guided
Starts empty with scaffold levels 2-3 and support available, per governing spec.

### Build Alone / Mastery
Starts empty at scaffold level 0. No hints, prompts, notebook, or counter in rendered output.

## DEAD-END PROHIBITION
Release-blocking defects include:
- a screen with no valid next action,
- Skip that leaves the learner on the same stuck screen,
- an activity that can only be escaped by browser refresh,
- Math that cannot be started from the menu,
- Chemistry that cannot be opened independently,
- state restore that makes a fresh learner appear already complete,
- repeated exact-question loops,
- progression to unsupported independent work before teaching gates pass.

## MOBILE / IPAD REQUIREMENTS
The learner will use touch devices.

- Core actions are tap-first.
- Dragging may be optional but never required.
- Touch targets must be comfortable.
- Molecule stage must not fight page scrolling.
- Controls may not look like part of equations.
- Multiplication sign `×` and variable `x` must be visually unambiguous.
- All important controls remain visible without desktop-only precision.

## TEST REQUIREMENTS
Keep all existing verified tests passing unless a test is demonstrably enforcing a rejected learner-facing defect. If such a test must change, document why.

Add tests that fail when:
- Day 1 starts in Chemistry because of stale production storage,
- Math cannot start from the home/menu,
- subject switching loses progress or marks a subject complete,
- one question completes a multi-question skill,
- a just-seen item is immediately repeated as a supposed fresh check,
- Watch contains no multi-step demonstration model,
- Build Together exposes a free empty stage before an instructional action is established,
- Skip leaves the learner in the same activity,
- Build Alone renders hidden scaffolding,
- Chemistry progression can dead-end.

Automated tests do not replace manual certification.

## MANUAL RELEASE GATE
Before merge, a real learner/tester on iPad/phone must be able to:
1. open the classroom home,
2. choose Targeted Math Plan or Chemistry first,
3. see Dr. Merissa teach rather than merely present a question,
4. see at least one meaningful instructional animation,
5. intentionally answer incorrectly and receive useful teaching,
6. use `I don't know yet` and receive a different/supportive intervention,
7. complete multiple questions without premature completion,
8. switch subjects and return without losing valid progress,
9. use Chemistry Watch and Build Together without being dumped onto an unexplained empty stage,
10. escape every activity through visible navigation,
11. refresh and recover valid progress without stale/transient construction state.

If the tester says `this did not teach me`, learner certification fails even if CI is green.

## IMPLEMENTATION AUTHORITY
Preserve:
- Student Model behavior,
- IDK router behavior,
- verified chemistry equivalence/correctness logic,
- Watch/Build Together engine rules that remain compatible with this learner experience,
- Day 1 content and mastery policy.

Rebuild where necessary:
- learner-facing HTML structure,
- classroom navigation,
- animation layer,
- teacher narration/orchestration,
- progression controls,
- persistence namespaces,
- question presentation and item-selection UX.

Do not preserve a bad learner-facing implementation merely because it already exists.
