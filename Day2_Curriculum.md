# DAY 2 CURRICULUM — Formal Charge
## Lewis-structure gate → electron ownership → formal-charge calculation → whole-structure transfer

**Status:** Day 2 content specification. Day 1 remains frozen.

## Why Day 2 is formal charge

Day 1 explicitly ends at Lewis structures, lone pairs, and octet reasoning. Formal charge is the next dependency only after that foundation is available. The readiness report classified formal charge as **RED — REBUILD** because it was not independently retrievable, and recommended rebuilding it from the foundation until charge can be assigned quickly from a structure.

Mercer CHM 221 also emphasizes active practice and applying underlying ideas rather than memorizing isolated facts. Day 2 therefore teaches one reliable procedure, makes the learner account for each input, and then removes support on fresh structures.

## Accuracy sources

Formal charge is treated as electron bookkeeping, not a literal ionic or partial charge on the atom. The general relationship is:

**Formal charge = free-atom valence electrons − nonbonding electrons − one-half of bonding electrons**

For a Lewis structure, one-half of the bonding electrons equals the **total bond order attached to the atom**. The learner-facing shortcut is therefore:

**FC = V − N − B**

where:
- **V** = valence electrons of the neutral free atom
- **N** = nonbonding electrons on that atom, counted as electrons, not lone pairs
- **B** = total bond order attached to that atom: single = 1, double = 2, triple = 3

The sum of all formal charges must equal the overall charge of the molecule or ion.

Verification references:
- OpenStax, *Organic Chemistry*, Section 2.3, “Formal Charges.”
- Chemistry LibreTexts, formal-charge sections giving both the half-bonding-electron form and the equivalent bond-count shortcut.

---

# SCOPE BOUNDARY

Day 2 teaches **formal charge only**. It does not teach resonance construction or contributor ranking. A displayed structure may contain a multiple bond, because multiple bonds are required to calculate formal charge correctly, but the learner is not yet asked to move electrons between resonance contributors.

Day 3 can open resonance after formal charge is independently available.

---

# SESSION STRUCTURE

| Block | Content | Approximate time |
|---|---|---:|
| 1 | Lewis-structure prerequisite gate | 3–8 min |
| 2 | Formal-charge teaching | 15–20 min |
| 3 | Guided calculation | 5–10 min |
| 4 | Fresh independent evidence | 15–25 min |
| 5 | Whole-structure transfer | 5–10 min |

Questions are evidence, not assignments. Independent practice stops as soon as the evidence rule is satisfied.

---

# 1. LEWIS-STRUCTURE PREREQUISITE GATE

Day 1 is not retaught automatically. The gate checks only the pieces formal charge needs.

### Gate A
1. An oxygen is drawn with **two lone pairs**. How many **nonbonding electrons** are shown on oxygen? **4**
2. A nitrogen has **three single bonds**. What is its total bond order? **3**

**2/2:** proceed directly to formal charge.

**Any miss:** give one targeted reminder only:
- one lone pair = two nonbonding electrons
- single/double/triple bonds contribute 1/2/3 to total bond order

Then use a **fresh** two-item check:
1. Three lone pairs = how many nonbonding electrons? **6**
2. One double bond plus one single bond = total bond order? **3**

If the fresh check still fails, mark the prerequisite as **Needs Lewis refresh** and route back to Day 1 Lewis-structure review before formal-charge mastery is attempted. Do not teach around a missing prerequisite.

---

# 2. TEACHING SEQUENCE

## Step 1 — What formal charge actually means

**Dr. Merissa:**

“Formal charge is bookkeeping. We temporarily pretend every covalent bond is split evenly. Each atom gets to count all of its own lone-pair electrons and one electron from each bond line. Then we compare what it owns in the structure with how many valence electrons the neutral atom normally starts with.”

Explicit misconception guard:

**Formal charge is not the same thing as partial charge and does not mean the atom literally carries that full ionic charge inside every molecule.**

Immediate interaction: identify which electrons an atom “owns” in a simple Lewis drawing before introducing the shortcut formula.

## Step 2 — Build the shortcut from ownership

Full form:

`FC = valence electrons − nonbonding electrons − 1/2(bonding electrons)`

Because each bond line contains two electrons and the atom owns one of them for bookkeeping:

`1/2(bonding electrons) = total bond order`

So the working shortcut is:

`FC = V − N − B`

Learner language:

**Start − dots − lines.**

- Start = neutral atom’s valence-electron count
- Dots = nonbonding electrons, not number of lone pairs
- Lines = total bond order, so a double bond counts as 2

The phrase is a memory cue only. The meaning must be taught first.

## Step 3 — Worked Example A: carbon in methane

Carbon has four valence electrons, zero nonbonding electrons, and four single bonds.

`FC = 4 − 0 − 4 = 0`

Why: carbon normally starts with four valence electrons and “owns” one electron from each of four bonds, still four total.

## Step 4 — Worked Example B: oxygen in hydronium, H₃O⁺

Oxygen has six valence electrons, one lone pair = two nonbonding electrons, and three single bonds.

`FC = 6 − 2 − 3 = +1`

The overall +1 on hydronium is consistent with oxygen’s +1 formal charge while each hydrogen is 0.

## Step 5 — Whole-structure check

After every atom is assigned:

**Add the formal charges. The total must equal the species charge.**

This is an error detector, not an optional extra step.

---

# 3. GUIDED EXAMPLE — Fresh Example C

Use hydroxide, OH⁻.

Prompt one field at a time rather than revealing the answer:
1. Oxygen’s neutral valence count? **6**
2. Three lone pairs contain how many nonbonding electrons? **6**
3. One O–H single bond contributes what bond order? **1**
4. `FC = 6 − 6 − 1 = ?` **−1**
5. Hydrogen formal charge? **0**
6. Sum check? **−1**, matching OH⁻

Guided completion is **supported practice**, never independent mastery evidence.

---

# 4. INDEPENDENT EVIDENCE BANK

None of these are used as teaching or guided examples.

Each item asks the learner to enter **V, N, B, and FC**, so the engine can diagnose the first wrong component rather than guessing from one final number.

| ID | Atom/context | V | N | B | FC | Coverage |
|---|---|---:|---:|---:|---:|---|
| FC-I1 | N in NH₄⁺: four single bonds, no lone pairs | 5 | 0 | 4 | +1 | charged |
| FC-I2 | O in a carbonyl: one double bond, two lone pairs | 6 | 4 | 2 | 0 | multiple bond |
| FC-I3 | C with three single bonds and one lone pair | 4 | 2 | 3 | −1 | charged |
| FC-I4 | N with three single bonds and one lone pair | 5 | 2 | 3 | 0 | neutral |
| FC-I5 | O with one double bond and one single bond, one lone pair | 6 | 2 | 3 | +1 | multiple bond + charged |
| FC-I6 | C with one triple bond and one single bond, no lone pairs | 4 | 0 | 4 | 0 | multiple bond |

### Sufficient evidence rule

Stop the atom-level independent set when all are true:
1. **3 clean independent correct items**
2. At least one clean item includes a **nonzero formal charge**
3. At least one clean item includes a **multiple bond**

A wrong attempt, hint, first-step reveal, or walkthrough makes that item supported/repaired. It may teach, but it cannot count toward the clean three. Move to a fresh bank item for the next independent evidence.

If all six bank items are exhausted without sufficient clean evidence, status is **Developing**. Do not loop the same six forever.

---

# 5. ERROR DIAGNOSIS

Because the learner enters each component, diagnosis is based on visible work.

| First wrong component | Diagnosis | Targeted correction |
|---|---|---|
| V | Valence-count gap | Return to periodic-table/group valence for this atom only. |
| N | Lone-pair counting gap | Count electrons, not pairs. One lone pair = 2 nonbonding electrons. |
| B | Bond-order gap | Count bond lines/order attached to this atom: single 1, double 2, triple 3. |
| FC | Arithmetic/sign slip | Keep the correct V/N/B and recompute `V − N − B`; do not reteach chemistry. |
| Whole-structure total | Sum-check gap | Add signed formal charges and compare with the written species charge. |

Repeated same-component error twice triggers a representation change rather than another verbal restatement.

---

# 6. HELP POLICY

Independent item help has three levels:
- **Hint:** names what to inspect without giving the number
- **First step:** identifies V only and hands the problem back
- **Walkthrough:** asks the learner for V, N, B, then FC one step at a time

Any help makes the current item supported practice. The next mastery attempt must be a different item.

No support is offered during the final cold transfer unless the learner chooses to convert that transfer into practice and receive a fresh transfer afterward.

---

# 7. WHOLE-STRUCTURE TRANSFER

Once atom-level evidence is sufficient, give a fresh organic structure:

### Transfer T1 — methylammonium, CH₃NH₃⁺

Use the displayed connectivity C–N, with carbon bonded to three H and nitrogen bonded to three H. Nitrogen has no lone pair in this cation.

Required production:
- carbon formal charge: **0**
- nitrogen formal charge: **+1**
- each hydrogen: **0**
- total: **+1**
- one-sentence explanation: nitrogen starts with 5 valence electrons, has 0 nonbonding electrons and 4 bonds, so `5 − 0 − 4 = +1`.

If T1 is wrong or helped, correct the specific component and use fresh transfer T2.

### Transfer T2 — amide anion fragment, NH₂⁻

Nitrogen is shown with two N–H single bonds and two lone pairs.

Required production:
- nitrogen formal charge: **−1** (`5 − 4 − 2`)
- each hydrogen: **0**
- total: **−1**
- explanation connects V, N, and B rather than naming a memorized nitrogen pattern.

---

# 8. DAY 2 CLEARING CRITERIA

Day 2 formal charge is **Independent / ready to advance** only when:
1. Atom-level sufficient evidence is met: 3 clean correct, including charged and multiple-bond coverage.
2. A fresh whole-structure transfer is correct without help.
3. The learner correctly explains one atom using V, N, and B.
4. The formal-charge sum matches the overall species charge.

Otherwise the skill remains **Developing** and Day 3 resonance must begin with targeted formal-charge retrieval before resonance opens.

---

# 9. WHAT DAY 3 INHERITS

Day 2 records:
- clean independent correct count
- supported/repaired correct count
- error component history: V / N / B / FC / sum
- whether multiple-bond formal charge cleared
- whether charged-atom formal charge cleared
- transfer result
- final status: Independent / Developing

Day 3 should use those records to decide whether resonance can open immediately or whether formal charge needs a short retrieval repair first.
