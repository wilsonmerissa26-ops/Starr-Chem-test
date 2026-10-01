# U1-04 SUPPORT INSTANTIATION CONTRACT

**Status:** normative companion to `UNIT1_LESSON_U1_04_INTERMOLECULAR_FORCES_BOILING_POINT_SCRIPT.md`.

This file exists to pin the exact molecules used in one Guided shape comparison before external audit. It does not change the chemistry, cold evidence, or instructional sequence of the parent script.

---

## Replacement for Section 8, Guided system C

The parent script says to use a straight-chain and more-branched C7 pair while also forbidding any molecule reserved in Section 11. Because the only straight-chain C7 alkane is **n-heptane**, and n-heptane is intentionally reserved for cold item IMF-I8, the runtime must NOT instantiate Guided system C with n-heptane.

Use this exact supported pair instead:

- **2-methylhexane**
- **2,2,3-trimethylbutane**

Both are `C7H16` isomers and therefore have the same molecular formula and molar mass.

### Guided prompt

**These molecules have the same formula and the same intermolecular-force class. Which structural feature should we inspect to predict which one has stronger total dispersion interactions and the higher boiling point?**

Correct reasoning:

1. Both are nonpolar hydrocarbons, so the relevant introductory attraction is London dispersion.
2. The molecular formula and molar mass are the same, so mass cannot explain the difference.
3. 2-methylhexane is less compact / less highly branched and can make greater effective surface contact with neighboring molecules.
4. 2,2,3-trimethylbutane is more compact / more highly branched and makes less effective surface contact.
5. Greater contact supports stronger accumulated dispersion interactions and therefore the higher boiling-point prediction for **2-methylhexane** within this controlled isomer comparison.

Do not expose the final boiling-point prediction until after the learner has identified the shape/contact relationship.

### Wrong-but-keyword-complete response that must fail

> "2,2,3-trimethylbutane should boil higher because its extra branches create more surface contact and a new kind of London dispersion force."

Why it fails:
- branching does not create a new intermolecular-force class,
- the more highly branched isomer is more compact, not broader in effective contact,
- the shape/contact relationship is reversed.

---

## Freshness contract

These two exact molecules are **support-only** for Guided system C.

They may not be used as cold evidence in IMF-I1 through IMF-I8.

The cold reservations in Section 11 remain unchanged, including:
- 2-butanol,
- 2-pentanone,
- 1-propanamine,
- trimethylamine,
- 1-pentanol,
- 1-ethoxypropane,
- n-pentane,
- 2-methylbutane,
- 2,2-dimethylpropane,
- n-octane,
- n-butane,
- methanol,
- 3-hexanone,
- n-heptane,
- 4-heptanone,
- 1-heptanol.

If any implementation uses one of those cold-reserved molecules during Guided system C, that cold item is contaminated and must be replaced with a new held-out item before it can count as independent evidence.
