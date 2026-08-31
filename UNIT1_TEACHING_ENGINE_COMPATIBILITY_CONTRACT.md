# UNIT 1 TEACHING ENGINE COMPATIBILITY + SKILL ID CONTRACT

## Status

Implementation gate for the first Unit 1 runtime slice. This file does not change learner runtime behavior.

Authoritative curriculum for the first slice: frozen U1-01 Bond-Line lesson on PR #74 (`UNIT1_LESSON_U1_01_BOND_LINE_SCRIPT.md`).

## 1. What is verified today

The repo currently contains more than one help/IDK/state implementation.

Verified directly:

- `student-model-idk-router.js` is a pure shared-style Student Model/router module with a three-reason IDK contract and its own behavioral suite.
- `day1-session.js` owns a separate three-choice `idkIntervention()` table.
- the live `day1/index.html` script list does not load `student-model-idk-router.js`.
- `readiness-day-engine.js` owns its own Session/help/contamination/IDK behavior and does not reference `student-model-idk-router.js`.
- `math-strategy-engine.js` does not reference `student-model-idk-router.js`.
- old Day 1 test files may import `student-model-idk-router.js`; a test import is not evidence of a live runtime dependency.

Do not convert the absence of a reference in an unreliable repository search into a stronger claim such as “there are no other consumers anywhere.” Any future consumer claim must be verified from the actual file or runtime load path.

## 2. Architecture decision

Unit 1 will not create a fourth contamination/mastery/IDK implementation inside its UI.

For the first Bond-Line vertical slice:

- `student-model-idk-router.js` is the candidate shared evidence/remediation component.
- `watch-mode.js` remains the candidate learner-controlled Watch component.
- `build-together.js` remains the candidate Build Together component.
- Unit 1 gets a thin adapter that translates the frozen lesson contract into those shared calls.
- Day 1 and Days 4–9 are not migrated to this router as part of the Bond-Line slice.

A future migration of an already-working runtime is a separate change with separate tests and is not required to ship Bond-Line.

## 3. Lesson IDs are not skill IDs

A lesson ID says **where** an interaction occurs. A skill ID says **what competency** the evidence describes.

Initial lesson identity:

- `chm221.u1.01` = U1-01 Bond-Line Structures

Initial primary skill identity:

- `chem.representation.bond_line` = recover and produce bond-line notation while preserving carbon positions, connectivity, bond order, implied carbon hydrogens, and explicit heteroatoms.

The runtime must never infer a skill ID from a route name, page filename, lesson number, or display label.

## 4. Evidence-equivalence rule for shared skill IDs

Two lessons/runtimes may write evidence under the same `skillId` only after an explicit equivalence check.

The second producer must document all of the following:

1. **Same competency definition.** Both producers are measuring the same chemical relationship/ability, not merely the same topic label.
2. **Same evidence standard.** The evidence being compared has the same rigor requirements: task type, support level, explanation requirement, and freshness requirement.
3. **Same role-preserving meaning.** A response that would pass in one producer would not fail in the other because the required relationships are materially different.
4. **No rigor laundering.** A quick probe/gate result may satisfy a prerequisite-routing decision when explicitly allowed, but it may not silently become cold independent or mastery evidence.
5. **Written crosswalk.** The registry entry names both producers and states why their evidence is equivalent. If that sentence cannot be written precisely, the IDs stay separate.

### Evidence classes

Every future shared evidence record must preserve at least:

- `lessonId`
- `skillId`
- `itemId`
- `evidenceKind`: `probe | guided | independent | explain_why | retrieval`
- `scaffoldLevel`
- `supported` / contamination status
- `correct`
- explanation result when applicable
- timestamp

A matching `skillId` alone is never enough to satisfy mastery.

## 5. Bond-Line prerequisite handling

U1-01 currently uses two very small gate checks:

- carbon commonly reaches four total bonds in the neutral organic structures used here;
- a line between two labeled atoms represents a covalent bond.

Those gate items are intentionally smaller than full Day 1 Lewis-structure production.

Therefore this slice does **not** claim that a pass on either gate is equivalent to Day 1 Lewis-structure mastery. The initial registry keeps the gate competencies distinct and records them as `probe` evidence only. A later Day 1 crosswalk may share an ID only after its actual stored evidence is compared side by side against the same evidence standard.

## 6. Frozen six-way IDK contract for Unit 1

Unit 1 must expose six distinct learner meanings from the teaching-engine specification and the frozen Bond-Line lesson:

1. `dont_understand_concept` → concept/vocabulary reteach from a plainer angle
2. `dont_know_how_to_start` → model the first decision only
3. `forgot_prerequisite` → route to the smallest missing prerequisite, confirm it, then return
4. `started_but_stuck` → preserve work and repair the specific stuck step
5. `show_me_example` → worked example / Watch mode
6. `explanation_not_making_sense` → switch representation rather than paraphrasing the same explanation

After any route that reveals support, the originating encounter is contaminated for cold evidence and the learner must return to a **different fresh item** at the original skill level after the remediation gate is satisfied.

The existing three legacy reason values and their existing behavior must remain valid for existing tests.

## 7. Bond-Line adapter responsibilities

The Unit 1 adapter is allowed to translate lesson-specific content into shared-engine calls. It is not allowed to redefine shared mastery rules.

The first adapter contract must prove:

- all six IDK meanings can be represented;
- selecting IDK opens remediation and never returns the original item immediately;
- support contaminates the current encounter;
- a prerequisite repair must be confirmed before return;
- return uses a fresh item ID;
- “This explanation isn’t making sense” causes a representation switch, not a text paraphrase;
- objective correctness and explanation correctness remain separately representable;
- one cold correct answer never produces `MASTERED`;
- mastery still requires a cold success with a correct explanation plus a distinct later cold success after the shared minimum retrieval interval;
- exact lesson return context is adapter/application state and must not be encoded by weakening mastery state.

## 8. RED before GREEN

Before changing `student-model-idk-router.js`, add executable Bond-Line compatibility tests that describe the six-way contract above.

Expected RED on the current router:

- the three new Unit 1 reasons are absent and/or rejected;
- therefore the six-way adapter contract cannot pass yet.

Existing `test-student-model.js` must continue to pass unchanged before and after the router extension.

Only after RED is demonstrated may the shared router be extended, and only enough to make the new contract green without breaking the old one.

## 9. Explicit non-goals for this slice

Do not:

- rewrite Day 1;
- rewrite Days 4–9 readiness;
- merge their state machines into one class;
- merge PR #73;
- build Bond-Line UI before the compatibility tests are green;
- treat a prerequisite gate as mastery;
- invent skill IDs inside UI code.

## 10. Done gate for compatibility slice

This compatibility slice is finished when all of the following are true:

1. the initial skill registry exists and passes its own invariants;
2. the new Bond-Line compatibility test is demonstrably RED against the current three-reason router;
3. the existing Student Model/router suite still passes unchanged;
4. the router is extended backward-compatibly to six Unit 1 reasons;
5. the Bond-Line compatibility test turns GREEN;
6. the existing Student Model/router suite remains GREEN;
7. only then may the first Bond-Line runtime screen be implemented.

No additional architecture redesign is required to start the first runtime screen once this gate is green.