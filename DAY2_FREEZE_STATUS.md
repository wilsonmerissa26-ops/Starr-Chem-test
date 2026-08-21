# Day 2 Freeze Status

## Status

Day 2 Formal Charge is **code-complete and code-frozen** as of main commit `c905b89099672e90ad43dcb50ba037c33b142877`.

Do not refactor, consolidate, rename, or redesign the Day 2 learner flow as routine cleanup while later curriculum is built. Reopen Day 2 only for:

1. a reproducible learner-facing defect on an actual device;
2. a chemistry correctness defect;
3. a regression caught by the existing repository suite; or
4. an explicitly approved Day 2 curriculum change.

## What is locked

The frozen Day 2 flow implements the current `Day2_Curriculum.md` contract:

- two-item Lewis prerequisite gate;
- targeted reminder for only the prerequisite rule that was missed;
- a fresh prerequisite recheck after the reminder;
- electron-ownership meaning before the formal-charge shortcut;
- the working rule `FC = V − N − B` only after the ownership idea is established;
- the memory cue **Start − dots − lines** after meaning is taught;
- methane and hydronium worked examples;
- six-step guided OH⁻ practice through O formal charge, H formal charge, and whole-ion sum;
- six fresh independent atom items with V / N / B / FC production;
- clean independent evidence separated from supported/repaired evidence;
- charged-atom and multiple-bond coverage requirements;
- targeted V / N / B / FC correction;
- representation change after the same component is missed twice;
- Hint, First step, and interactive V → N → B → FC Walkthrough help;
- cold whole-structure transfer with carbon/nitrogen where applicable, hydrogen formal charge, total charge, and a V/N/B explanation;
- field-specific transfer diagnosis;
- strict component-associated explanation grading so number substrings cannot fake reasoning;
- transfer outcomes persisted separately for Day 3;
- final summary containing clean/support counts, error history, charged coverage, multiple-bond coverage, transfer evidence, and final status; and
- no resonance construction or ranking inside Day 2.

## Automated verification

The final Day 2 contract contains **99 Day 2 checks**, all passing in the full `Dr Merissa Engine Tests` workflow on PR #54.

The same full run also kept the frozen Day 1 release audit green. Day 2 work therefore did not require reopening Day 1.

## Remaining actual-device spot-check

Day 2 is code-frozen but not yet labeled device-certified. One short real-device pass should verify the highest-risk interaction changes:

### A. Targeted prerequisite reminder

On the first two-question prerequisite gate:
- answer the lone-pair-electron question incorrectly;
- answer the bond-order question correctly.

Expected:
- the reminder teaches the lone-pair counting rule only;
- it does **not** reteach bond order;
- the learner then receives the fresh two-question prerequisite check.

### B. Cold-transfer field diagnosis

On methylammonium transfer T1, when the other entries are correct but the Hydrogen FC field is wrong:
- feedback should target hydrogen specifically;
- it should not claim carbon or nitrogen is wrong;
- T1 should stop counting as cold evidence;
- the learner should be routed to fresh transfer T2.

### C. Transfer evidence persistence

After a clean fresh transfer clears Day 2, the final evidence summary should preserve:
- charged-atom coverage;
- multiple-bond coverage;
- the transfer result(s); and
- final status.

If these pass, update this document to **device-certified**. If one fails, repair only the reproducible failing path and rerun the full repository suite.

## Day 3 handoff

`Day2_Curriculum.md` already defines what the next day inherits:

- clean independent correct count;
- supported/repaired correct count;
- V / N / B / FC / sum error history;
- multiple-bond formal-charge coverage;
- charged-atom formal-charge coverage;
- transfer result; and
- final status: Independent or Developing.

Day 3 must read this evidence before resonance opens. A learner who finished Day 2 as Developing receives a short targeted formal-charge retrieval repair first; a learner with sufficient Day 2 evidence may open resonance immediately.

There is no separate `Day3_Curriculum.md` in the repository yet. Lock that curriculum contract before creating a Day 3 learner runtime.
