# U1-08 ISOMER COLD-EVIDENCE AMENDMENT

**Status:** normative companion to `UNIT1_LESSON_U1_08_ISOMER_CLASSIFICATION_SCRIPT.md`.

This file resolves the external-audit contamination finding in ISO-I2. Where this companion conflicts with the parent script for ISO-I2, this companion controls.

The parent Build Together pair remains support-only:
- pentane,
- 2-methylbutane.

That exact pair is permanently retired from ISO-I2 cold evidence.

---

## Replacement ISO-I2 - constitutional isomers

Use the held-out pair:
- **3-ethylpentane**, `CH3CH2CH(CH2CH3)CH2CH3`,
- **2,2-dimethylpentane**, `CH3C(CH3)2CH2CH2CH3`.

Both have molecular formula **C7H16**.

Prompt:

**Classify the relationship between these two molecules. Give the formula evidence and the connectivity evidence that decides the category.**

### Scoring contract

Required propositions:
1. both structures contain 7 carbons and 16 hydrogens, so both are `C7H16`,
2. the molecular formulas are therefore the same,
3. the carbon connectivity is different,
4. in 3-ethylpentane the central branching carbon is bonded to three carbon neighbors and one H,
5. in 2,2-dimethylpentane the C2 branching carbon is bonded to four carbon neighbors and no H,
6. same formula + different connectivity means **constitutional isomers**.

Accept example:

> "They are constitutional isomers. Both are C7H16, but the carbon neighbor pattern is different: the branch carbon in 3-ethylpentane has three carbon neighbors, while the highly branched carbon in 2,2-dimethylpentane has four."

### Wrong-but-keyword-complete failure 1

> "They are the same molecule because both are C7H16 and both are branched alkanes."

Why it fails:
- formula equality is necessary for isomerism but does not prove identity,
- the carbon connectivity differs.

### Wrong-but-keyword-complete failure 2

> "They are stereoisomers because they have the same formula but the branches point in different directions on the page."

Why it fails:
- the deciding difference is **connectivity**, not page orientation,
- different connectivity places the pair in the constitutional-isomer category before stereochemical analysis is needed.

### Contradiction handling

A response that selects `constitutional isomers` but then claims the carbon connectivity is the same does not earn clean explanation evidence.

---

## Freshness contract

The replacement pair is cold-reserved for ISO-I2:
- 3-ethylpentane,
- 2,2-dimethylpentane.

Neither exact molecule may be inserted into U1-08 Teach, Watch, Build Together, Guided, misconception worked examples, or IDK worked examples before ISO-I2 is encountered cold.

The original pentane + 2-methylbutane pair remains valid only as the supported Build Together example and can never count as U1-08 cold evidence.

No other U1-08 cold item or lesson section changes.
