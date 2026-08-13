# DR. MERISSA TEACHING ENGINE — SPECIFICATION
## The orchestration layer. Content lives elsewhere. This document governs behavior.

**What this document is not.** It does not redefine Day 1's chemistry or math content, that's `Day1_Curriculum.md`, frozen and independently verified. It does not redefine the Molecule Stage's rendering or its four misconception detectors, that's `molecule-stage.html`, built and tested, 14/14 checks passing. It does not redefine tap-first interaction rules, that's `Day1_Interactive_Layer_Specification.md`. Every one of those stays exactly as it is. **This document governs the thing that was actually missing: what decides which piece of content to show, when, and what happens when the student doesn't get it.**

---
---

# 1. ARCHITECTURE

Four layers, not one file that tries to be everything.

| Layer | Role |
|---|---|
| **Dr. Merissa (the orchestrator)** | Reads the Student Model, decides what happens next, never contains content itself |
| **Student Model** | The only source of truth about what this student currently knows, how she knows it, and what she's struggled with |
| **Tools** | Watch Mode, Build Together, Build Alone, Molecule Stage, Math modules, Notebook, Review Queue. Each does one job and reports back to the orchestrator. None of them decide what happens next, they execute and return a result. |
| **Content** | The frozen curriculum. Facts, molecules, problems, answer keys. Tools read from it. The orchestrator never invents it. |

This is the standard shape of an intelligent tutoring system, domain model, student model, pedagogical layer, interface, not a new invention. Naming it that way matters because it means the hard problems here (when to reteach, when to release scaffolding) have real prior art, not just intuition.

**Build order, separate pieces, integrate last, matching the "don't rebuild what's verified" rule:** Student Model → IDK/Reteach decision logic → Watch Mode → Build cycle wiring around the existing Molecule Stage → Notebook → Review Queue → Math modules → integration. Each piece gets its own behavioral test before it touches the others.

---
---

# 2. THE STUDENT MODEL

One object per skill. Not correct/incorrect. Not a single number.

```
skill: {
  state: NOT_STARTED | TEACHING | GUIDED | INDEPENDENT_ATTEMPTED |
         INDEPENDENT_SUCCESS | MASTERED | DEVELOPING | REVIEW_DUE,
  scaffoldLevel: 4|3|2|1|0,      // see Section 7, ladder, lower is less help
  attempts: [ { input, correct, errorCode, scaffoldLevelAtAttempt, timestamp } ],
  idkSelections: [ { reason, timestamp } ],   // which of the six IDK reasons, see Section 6
  notebookEntries: [ id, id, ... ],           // which notebook facts this skill contributed
  reviewDue: timestamp | null
}
```

**MASTERED requires all three, not one correct answer:**
1. At least one INDEPENDENT_SUCCESS at scaffold level 0 (cold, no notebook, no hints)
2. A correct-shaped explanation of *why*, not just the answer
3. Success on a second, different item at least a few minutes later in the same session, not the identical item repeated

Anything short of that is INDEPENDENT_SUCCESS at best, real progress, not the same thing as mastery. This is the exact distinction the diagnostic's own v1.3 manual insisted on for her, and it applies here for the same reason: one correct response doesn't prove durability.

---
---

# 3. WHEN DR. MERISSA TALKS, AND WHEN SHE DOESN'T

| Situation | She talks | She doesn't |
|---|---|---|
| A new concept is introduced | Yes, explains what and why | — |
| A correct answer at high scaffold | Brief acknowledgment, moves on | Doesn't over-praise, a routine correct answer isn't a celebration |
| A correct answer cold | Names it plainly as real progress | Doesn't gush, that cheapens the ones that matter |
| A slip (right method, arithmetic error) | Names it as a slip, not a gap | Doesn't re-teach the whole concept for a typo-level error |
| A genuine misunderstanding | Full stop, re-teach that specific piece | Doesn't paper over it with encouragement |
| Every single tap in Build mode | — | Silent. Narrating each placement turns practice into a lecture. |

The tone target, stated once and applied everywhere: an excellent private instructor who is paying attention. Not a cheerleader, not a disappointed parent.

---
---

# 4. THE TEACHING CYCLE, AS AN ACTUAL STATE MACHINE

```
DIAGNOSE → TEACH → WATCH → BUILD TOGETHER → GUIDED → INDEPENDENT → EXPLAIN WHY → MASTERY CHECK → REVIEW LATER
```

Not every skill needs every state. A math skill she clears at 3/3 on the probe skips TEACH through GUIDED entirely and goes straight to a light INDEPENDENT confirmation, that's the whole point of the test-out design already frozen in `Math_Gym_Specification.md`. **This cycle is the ceiling for a skill she's never seen, not the floor for every skill regardless of what she already knows.**

| Transition | Fires when |
|---|---|
| DIAGNOSE → TEACH | Skill state is NOT_STARTED, or probe/pretest shows she doesn't have it |
| DIAGNOSE → INDEPENDENT (skip ahead) | Probe shows she already has it |
| TEACH → WATCH | Content includes a Molecule Stage or Watch-mode-eligible demonstration |
| TEACH → GUIDED | No demonstration needed, straight to guided practice |
| WATCH → BUILD TOGETHER | Watch sequence completes |
| BUILD TOGETHER → GUIDED | She completes the shared build |
| GUIDED → INDEPENDENT | Two guided successes in a row |
| INDEPENDENT → EXPLAIN WHY | Independent attempt is correct |
| EXPLAIN WHY → MASTERY CHECK | Explanation is correct-shaped |
| Any state → one level back | She selects IDK (Section 6) or two wrong attempts in a row |
| MASTERY CHECK success → REVIEW LATER | Scheduled per Section 12 |

---
---

# 5. WHAT COUNTS AS TEACHING, PLAINLY

Since this was the actual point of failure twice now, it gets its own short section instead of staying implicit.

**Information was presented is not the same claim as teaching happened.** Teaching happened when the student did something with the information before being asked to recall or apply it independently: predicted an outcome, built something, explained a step, compared two cases.

**A concrete test, apply it to every screen before it ships:** teaching is not proven because information appeared on the screen. A TEACH state must include an instructional representation that makes the concept more understandable, followed by an immediate low-risk interaction that demonstrates the student did something with that representation before independent recall is required. Reading a fact alone counts as information delivery, not completed teaching.

---
---

# 6. "I DON'T KNOW" — THE REAL DECISION TREE

Six reasons, six different actions. Selecting IDK is never followed by re-showing the identical question, that's the one absolute rule.

| She selects | What that means | Dr. Merissa's response |
|---|---|---|
| "I don't understand what the question means" | Vocabulary or concept gap | Re-teach the underlying concept from a plainer angle, not a re-explanation of the question's wording |
| "I understand it, I don't know how to start" | Strategic gap, she has the pieces, not the entry move | Model the first decision only, then hand it back |
| "I forgot something I need" | Prerequisite gap | Drop one level down the dependency chain (Section 10), teach that, confirm it, then return |
| "I started but got stuck" | Mid-procedure gap | Pick up from wherever her work stopped, examine that specific step, don't restart from zero |
| "I need to see an example" | Wants a worked model | Show one, live, in Watch mode if the content supports it, not just restated text |
| "This explanation isn't making sense" | Modality mismatch, not a comprehension failure | **Switch representation.** Never repeat the same explanation reworded. Words → diagram → concrete analogy → worked example → build-it-together, in that order, skipping whatever was just tried |

**After any of the six, she returns to a different item testing the same skill, never the original question verbatim.** This is checkable mechanically: log the item ID she left on IDK, and assert the next item she sees at that skill has a different ID.

---
---

# 7. THE SCAFFOLD LADDER

| Level | Name | What's available |
|---|---|---|
| 4 | Worked demonstration | Watch mode, full narration, counter visible |
| 3 | Explicit prompts | Structured steps shown (the fill-in-the-blank boxes already in the curriculum's algebra spec) |
| 2 | Partial prompts | Some steps shown, some blank |
| 1 | Notebook available | No prompts, but she can open What We Know |
| 0 | Cold | No notebook, no prompts, no counter, no hints |

**Mastery is recorded against the lowest level at which she succeeded independently, not the highest level she ever reached.** Succeeding at level 3 twice and never trying level 0 means the skill stays at INDEPENDENT_ATTEMPTED, not MASTERED, regardless of how many times level 3 went well.

---
---

# 8. MISCONCEPTION DIAGNOSIS

## Math: signature wrong answers, derived and verified, not guessed

For a linear equation `ax+b=cx+d` with true answer `x = (d-b)/(a-c)`, common errors produce **predictable, different** wrong answers. Computed directly, not asserted:

For `7x+2=3x+26`, true `x=6`.

| Error | Wrong answer produced | Diagnosis shown |
|---|---|---|
| Sign error moving the variable term (adds instead of subtracts) | x=2.4 | "You added the x-term instead of subtracting it from both sides. Keep the equation balanced: whatever operation you perform on one side must also happen on the other." |
| Sign error moving the constant | x=7 | "You added the constant instead of subtracting it from both sides. Same balance principle, whatever you do to one side has to happen on the other." |
| No signature match | — | Fall back to the intermediate-step boxes already required by the curriculum, and diagnose from the **first wrong step shown**, not the final number. A wrong final answer with no visible steps gets "show your steps" before any diagnosis is attempted, since guessing at a cause from a bare number is worse than asking. |

**This generalizes: for any equation type in the frozen curriculum, the two or three most common error mechanisms get their signature answers computed the same way, verified against the actual algebra before they enter the app, not estimated.** This is the same "generate the answer, don't guess the problem" discipline already governing Math Gym's generators.

## Chemistry: already built, reused, not reinvented

The Molecule Stage's four detectors (`H_OVERLOADED`, `NO_LONE_PAIRS`, `LP_WRONG_ATOM`, `WRONG_ATOM_SET`) already do exactly this job for Lewis structures, tested, working. **This spec does not add new chemistry misconception logic. It wires the orchestrator to read those detector results and route through the IDK/reteach tree above instead of just displaying the message once and moving on.**

---
---

# 9. WATCH MODE, PRECISELY

Using the NH₃ example, formalized so "Next/Back/Replay/Pause" mean exactly one thing each.

**Step sequence for NH₃:**
1. N appears, highlights, counter shows +5
2. Three H atoms appear, each highlights in turn, counter shows +1, +1, +1, running total 8
3. Narration: "Eight electrons total, before anything else happens."
4. First N–H bond forms, animated, counter shows 8 available, 2 placed, 6 remaining
5. Second bond, counter updates
6. Third bond, counter shows 8 available, 6 placed, 2 remaining
7. Narration: "Two electrons left. Nowhere to put them but nitrogen."
8. Lone pair appears on nitrogen, counter shows 0 remaining
9. Narration: "That's why nitrogen has a lone pair here. Not memorized, accounted for."

**Controls, exact behavior:**

| Control | Does |
|---|---|
| Next | Advances exactly one step, no skipping ahead |
| Back | Reverts exactly one step, undoing that step's visual change and its narration |
| Replay | Restarts the *current step only*, not the whole sequence, since restarting everything to review one moment is its own friction |
| Pause | Freezes the current visual state indefinitely, no auto-advance, resumes exactly where it paused |

No step advances automatically on a timer. She controls pacing entirely.

---
---

# 10. BUILD TOGETHER, GUIDED, ALONE — WHAT DISTINGUISHES THEM

| Mode | Molecule Stage state | Who acts |
|---|---|---|
| Build Together | **Empty stage.** She rebuilds the same molecule Watch just demonstrated, from scratch, one prompted action at a time, resolved after genuine ambiguity in an earlier draft of this row, see note below | Shared, she does one move at a time with confirmation each time |

**Resolved during Piece 4's build.** An earlier version of this row said "pre-populated up to the last completed Watch step," which was ambiguous enough to support two different implementations. Locked answer: Build Together always starts empty. If Watch ends with the molecule fully assembled and Build Together opens with most of it already sitting there, she only ever performs the tail end of a process she just watched, which weakens retrieval and production, the exact thing this section exists to build. Watch is I DO. Build Together, Guided, and Build Alone are WE DO, YOU DO WITH SUPPORT, YOU DO ALONE, and every one of those three starts from nothing.
| Guided (Build With Support) | Empty stage, scaffold level 2–3, notebook open, hints available | Her, with help visible |
| Build Alone | Empty stage, scaffold level 0, notebook closed, hints unavailable, counter absent | Her, entirely |

**Behavioral test for Build Alone specifically, since this failed silently before:** open Build Alone, place one atom, verify the counter element does not exist in the rendered output at all, not hidden with CSS, not present-but-blank. Absent. If Dr. Merissa's script or any UI element reveals a step prompt during this mode, that's a fail regardless of whether the final answer check still works.

---
---

# 11. SKIP

| Field | Captured |
|---|---|
| Skill and item ID | What she skipped |
| Where she got stuck | Last IDK reason selected, if any, before skipping |
| Attempts before skip | Full attempt log for that item |
| Scaffold level at skip | Where she was in the ladder |

**Skip never counts as mastery, never advances the skill state past DEVELOPING.** It re-enters via the Review Queue (Section 12), not silently, not as if it were resolved.

---
---

# 12. NOTEBOOK, FIXED

**The defect this fixes directly:** the last build only wrote to the notebook after a cold check succeeded, meaning the facts stated during actual teaching, H has 1, C has 4, and so on, never appeared there at all. That's backwards. The notebook exists so nothing taught has to be memorized just to survive to the next screen.

**Rule: every fact stated during TEACH or WATCH gets written to the notebook at the moment it's stated, not afterward, not conditionally on success.** Collapsible, persistent, available at scaffold levels 4 through 1, absent at level 0.

---
---

# 13. REVIEW QUEUE, KEPT SIMPLE ON PURPOSE

No spaced-repetition algorithm for Day 1, that's real over-engineering for a single session. Two triggers only:

1. **Same-session return.** Anything skipped or IDK'd twice on the same item type re-enters later the same session, with a fresh item, not the same one.
2. **Cross-session flag.** Anything not reaching INDEPENDENT_SUCCESS by session end gets flagged DEVELOPING and surfaces first thing next session, before new content.

Real spaced scheduling is a Phase 2 concern, once there's a syllabus and multiple days of data to schedule against.

---
---

# 14. COGNITIVE LOAD RULES

Short, because a long list of rules is itself a cognitive load problem.

- Never introduce a new representation and ask for independent production on the same screen.
- Cap new facts at three before requiring any interaction, prediction, build step, or answer.
- Never stack two open uncertainties, don't ask her to reason about something new while a previous IDK is still unresolved.

---
---

# 15. PREREQUISITE REGRESSION

Fires specifically from the "I forgot something I need" IDK branch, or from two consecutive wrong attempts where the error signature points upstream (per Section 8).

**Climbing back up requires a successful, fresh item at the level just regressed to, not an assumption that the drop fixed things.** This is the same retest-before-scheduling-downstream principle already governing the chemistry dependency network in the diagnostic. Regression without a confirmed climb back is just a longer way of getting stuck.

---
---

# 16. BEHAVIORAL ACCEPTANCE TESTS

Written now, run against the build once it exists, not decided after the fact.

**Test 1.** Select IDK on any item. Assert: the very next item shown at that skill has a different ID than the one just left. Fail condition: identical item reappears.

**Test 2.** Answer wrong twice on the same item. Assert: the second intervention differs materially from the first, different representation per Section 6's modality-switch rule, not the same explanation reworded. Fail condition: second intervention is a paraphrase of the first.

**Test 3.** Open Build Alone. Assert: no counter element exists in the DOM, no step prompts render, no hint control is present. Fail condition: any scaffolding element exists even if visually hidden.

**Test 4.** Complete a skill at scaffold level 3 twice. Assert: skill state is INDEPENDENT_ATTEMPTED, not MASTERED. Fail condition: system marks it mastered without a level-0 success.

**Test 5.** Skip an item, then trigger the Review Queue. Assert: the item resurfaces with a fresh instance, not the original. Fail condition: identical item resurfaces, or item never resurfaces at all.

**Test 6.** Trigger prerequisite regression. Assert: the system does not return to the original item until a fresh item at the regressed-to level succeeds. Fail condition: returns to the original item immediately after regression content is merely shown, without a checked success.

**Test 7.** Submit a wrong algebra answer matching a known error signature (Section 8). Assert: the diagnosis message names that specific error, not a generic "not yet, try again." Fail condition: generic feedback for a recognized pattern.

**Test 8.** Refresh the browser mid-skill. Assert: Student Model state, notebook contents, and review queue all survive. Fail condition: any of the three resets.

---
---

# 17. WHAT SHIPS NOW, WHAT'S A HOOK, WHAT WAITS

**A direct recommendation, not just a table:** the full six-way IDK tree is right long-term and larger than a first build needs. I'd ship three reasons for the first real build, don't understand the concept, don't know how to start, show me an example, and route "forgot something," "got stuck," and "explanation isn't landing" into the closest of those three for now. The distinction between six and three doesn't change the architecture, the routing table in Section 6 has room for three more rows whenever they're worth their own branch. Shipping three well-tested branches beats shipping six thin ones on the clock this is on.

| Component | Status |
|---|---|
| Student Model, all states | Ship now |
| IDK tree, 3 of 6 branches | Ship now, table has room for the rest |
| Watch mode, exact step/Next/Back/Replay/Pause semantics | Ship now, for H₂O and one guided molecule |
| Build Together/Guided/Alone, wired to the existing Molecule Stage | Ship now |
| Notebook, populated during TEACH/WATCH | Ship now |
| Same-session and cross-session review triggers | Ship now |
| Algebra signature-error diagnosis | Ship now, for the equation types already in the curriculum |
| Full six-way IDK tree | Hook, table already has the rows, fill in later |
| Real spaced-repetition scheduling | Later, needs a syllabus and multi-day data |
| Cross-skill misconception signatures beyond algebra and Lewis structures | Later, extend the same pattern per math area as each gets built |

Ready to build against this. No more architecture rounds after this one, if the acceptance tests in Section 16 find something wrong, that's what the test-and-fix pass is for, not another spec.
