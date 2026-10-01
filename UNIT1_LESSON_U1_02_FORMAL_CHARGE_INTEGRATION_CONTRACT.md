# UNIT 1 LESSON U1-02 - FORMAL CHARGE INTEGRATION CONTRACT
## Reuse the existing Day 2 lesson without weakening or double-counting mastery

**Status:** content/integration draft for instructional review before runtime implementation.

**Normative teaching source:** `Day2_Curriculum.md`

**Parent curriculum:** `UNIT1_BEGINNER_TEACHING_CURRICULUM.md`

**Teaching-engine contract:** `DR_MERISSA_TEACHING_ENGINE_SPEC.md`

**Purpose of this file:** define how Unit 1 invokes, resumes, evaluates, and reuses the existing Day 2 Formal Charge curriculum. U1-02 is intentionally **not** a second rewritten formal-charge lesson.

---

# 1. NON-NEGOTIABLE RULE

Do not create a thinner Unit 1 version of formal charge.

The existing Day 2 curriculum remains the teaching authority for:
1. Lewis prerequisite gate,
2. formal charge as electron bookkeeping,
3. electron ownership,
4. derivation of the working formula,
5. `FC = V - N - B`,
6. methane/hydronium worked examples,
7. hydroxide guided example,
8. fresh V/N/B/FC independent bank,
9. whole-structure transfer,
10. charge-sum check,
11. diagnosis by first wrong component,
12. help contamination.

U1-02 adds integration behavior only.

---

# 2. LEARNER-FACING ENTRY

## Screen title

**Formal charge: electron bookkeeping**

If Unit 1 does not already have compatible evidence, show one plain-language orientation:

> "Formal charge is a bookkeeping method for checking how electrons are assigned in a Lewis structure. We already have a full lesson for it, so we will use that lesson instead of giving you a weaker shortcut here."

Then use the entry decision below.

---

# 3. ENTRY DECISION

The engine checks the shared student model before deciding what the learner sees.

## Path A - compatible mastery evidence exists

Do **not** automatically replay Day 2.

Compatible evidence must include enough information to establish that the learner has previously produced formal-charge reasoning without support, not merely viewed or completed a guided lesson.

At minimum the imported record must show:
- cold/independent status,
- scaffold level 0 or equivalent,
- charged-atom coverage,
- multiple-bond coverage,
- correct whole-structure/charge-sum transfer or an equivalent later record,
- explanation evidence based on V/N/B or electron ownership,
- timestamp/item identity sufficient to distinguish prior evidence from the current confirmation.

If the old record cannot establish those facts, treat it as **usable history but incomplete current mastery evidence**, not as proof.

Give a fresh Unit 1 cold confirmation rather than replaying everything.

## Path B - partial/developing Day 2 record

Route only to the missing component(s).

Examples:
- V errors -> valence-electron micro-repair,
- N errors -> nonbonding-electron/lone-pair repair,
- B errors -> bond-order repair,
- arithmetic-only slip -> computation/sign repair,
- failed sum check -> whole-structure check,
- no cold explanation -> fresh explanation item.

Do not restart the entire lesson if the student model identifies a narrower gap.

## Path C - no usable formal-charge record or prerequisite failure

Enter the existing Day 2 formal-charge lesson at its beginning/gate.

---

# 4. RETURN-CONTEXT CONTRACT

If Day 2 is opened from Unit 1 or Test 1 support, create a return context before navigation.

Required source context:
- Unit 1 lesson/skill = U1-02,
- originating Test 1/support item if applicable,
- workflow phase,
- evidence contamination state,
- learner work that must persist,
- explicit return destination.

Required learner control after Day 2 work:
- `Return to the skill I was working on`
- and, when originated there, `Back to Test 1 Support`

Do not rely on browser Back.

---

# 5. UNIT 1 FRESH CONFIRMATION BANK

These items exist to confirm formal charge **inside Unit 1** when prior compatible mastery exists or when Day 2 has just repaired the skill.

They must not reuse a Day 2 independent-bank item in the same evidence episode.

Cold support rules remain unchanged: any hint/review converts the item to supported practice and requires a different fresh item.

## FC-U1-C1 - oxygen with one single bond and three lone pairs

Context: oxygen in a generic alkoxide-like fragment `C-O^-`, shown explicitly with three lone pairs.

Prompt:

**For the oxygen, enter V, N, B, and formal charge. Then explain why the result is negative.**

Expected:
- V = 6,
- N = 6,
- B = 1,
- FC = -1.

Explanation contract:
Required relationship:
`6 - 6 - 1 = -1`; oxygen owns one more electron in this bookkeeping structure than neutral oxygen's valence count would leave after the subtraction.

Wrong-but-keyword-complete failure:
> "Oxygen is +1 because it has six nonbonding electrons and one bond, so 6 - 6 + 1 = +1."

Why it fails: the bond-order term is subtracted, not added.

---

## FC-U1-C2 - nitrogen with four single bonds

Context: substituted ammonium-like N with four single bonds and no lone pair, not the exact NH4+ Day 2 item.

Prompt:

**Enter V, N, B, and formal charge for N. State the charge-sum implication if all other displayed atoms are neutral.**

Expected:
- V = 5,
- N = 0,
- B = 4,
- FC = +1,
- species total +1 if all others are 0.

Wrong-but-keyword-complete failure:
> "Nitrogen is -1 because four bonds mean it gained one electron."

Why it fails: formal charge is determined by the bookkeeping count `5 - 0 - 4 = +1`, not by a verbal gain/loss shortcut.

---

## FC-U1-C3 - oxygen with a double bond and a single bond

Context: an explicitly drawn O with one double bond, one single bond, and one lone pair.

Prompt:

**Enter V, N, B, and formal charge. Explain why the double bond affects B but does not create two separate atoms.**

Expected:
- V = 6,
- N = 2,
- B = 3,
- FC = +1.

Wrong-but-keyword-complete failure:
> "B is 2 because oxygen is attached to two atoms, so the formal charge is +2."

Why it fails: formal-charge B is **total bond order**, not number of neighboring atoms. Double = 2 plus single = 1.

---

## FC-U1-C4 - whole-structure cold transfer

Use a held-out two-heavy-atom charged structure not present in Day 2's transfer examples. Display every lone pair needed for the calculation and specify the overall species charge.

Recommended implementation example: **protonated methanol, CH3OH2+**.

Required:
- carbon FC 0,
- oxygen FC +1 (`6 - 2 - 3`),
- hydrogens 0,
- total +1,
- explanation links V/N/B and sum check.

Do not use hydronium, hydroxide, methylammonium, NH2-, or the exact Day 2 bank structures for this Unit 1 confirmation.

---

# 6. EVIDENCE MAPPING

Day 2's status label `Independent / ready to advance` is useful but must not be blindly equated with the shared engine's permanent `Mastered` state.

The shared engine remains authoritative.

A Unit 1 formal-charge mastery decision requires the shared rules:
1. cold independent success at scaffold 0,
2. correct-shaped explanation,
3. second different cold success after a meaningful interval.

Therefore:
- Day 2 independent evidence may satisfy compatible components if metadata proves it,
- a recent fresh Unit 1 confirmation may supply missing/current evidence,
- one new clean confirmation by itself must not display `Mastered` if the later-retrieval requirement is absent.

---

# 7. SUPPORT CONTAMINATION

If learner opens Day 2/help from a cold Unit 1 formal-charge item:
1. current item becomes supported,
2. return context preserves that fact,
3. the system may resume the workflow after review,
4. the original item cannot be converted back into clean evidence,
5. recollect on a different fresh item.

---

# 8. MISCONCEPTION/DIAGNOSIS PRESERVATION

Preserve Day 2's component-level diagnosis:
- `V` valence count,
- `N` nonbonding electrons,
- `B` bond order,
- `FC` arithmetic/sign,
- whole-structure sum.

Do not replace this with a generic `formal charge wrong` label.

Also preserve the conceptual guard:

> **Formal charge is bookkeeping, not the same as partial charge and not necessarily a literal localized ionic charge.**

---

# 9. ACCESSIBILITY + MOBILE

U1-02 integration inherits Day 2 accessibility and U1-00 return-navigation rules.

Additional requirements:
1. V/N/B inputs are individually labeled for screen readers.
2. Lone pairs are available in a non-color-only text/visual representation.
3. Charge signs are spoken/read explicitly as `plus one`, `minus one`, etc., not inferred from position/color.
4. Return buttons name their destinations.
5. Phone portrait keeps structure and V/N/B inputs usable without horizontal scrolling.

---

# 10. TELEMETRY

Suggested integration events:
- `FORMAL_CHARGE_SHARED_RECORD_FOUND`
- `FORMAL_CHARGE_SHARED_RECORD_INCOMPLETE`
- `FORMAL_CHARGE_DAY2_ROUTE`
- `FORMAL_CHARGE_TARGETED_REPAIR_ROUTE`
- `FORMAL_CHARGE_UNIT1_CONFIRMATION_ATTEMPT`
- `FORMAL_CHARGE_UNIT1_CONFIRMATION_RESULT`
- `FORMAL_CHARGE_RETURN_CONTEXT_RESTORED`
- `FORMAL_CHARGE_EVIDENCE_IMPORTED`
- `FORMAL_CHARGE_EVIDENCE_REJECTED_INCOMPATIBLE`

---

# 11. RELEASE GATE

Before release, answer YES to all:

1. Does Unit 1 reuse Day 2 rather than replacing it with a thinner lesson?
2. Is Day 2's electron-ownership-before-formula order preserved?
3. Does a prior guided completion fail to auto-award mastery?
4. Are prior independent records imported only when their evidence metadata is compatible?
5. Can partial records route to the first missing component rather than restart everything?
6. Is return context preserved when Day 2 is opened from Unit 1/Test 1 support?
7. Does support contamination survive navigation away and back?
8. Are fresh Unit 1 confirmation items distinct from the Day 2 independent bank/transfers?
9. Are V/N/B and whole-structure sum diagnostics preserved?
10. Is shared mastery still governed by cold success + explanation + later different cold evidence?

Any NO blocks production.

---

# 12. DEFINITION OF DONE FOR U1-02

U1-02 is done when the existing Day 2 lesson can be entered at the correct point, teach only what is missing, return the learner exactly to Unit 1/Test 1 support, and contribute compatible evidence to the shared mastery model without double-counting guided work or granting mastery from one clean answer.