# U1-06 IR SOURCE BASIS AND PROVENANCE

**Status:** normative source companion to `UNIT1_LESSON_U1_06_IR_SPECTROSCOPY_SCRIPT.md`.

This file exists because U1-06 is the one Unit 1 lesson where invented numerical precision would create a concrete chemistry defect. It records exactly what comes from the current course, what comes only from historical course material, and what comes from general chemistry references.

---

## 1. CURRENT FALL 2026 COURSE EVIDENCE

Source: `CHM+221+F26+Syllabus.pdf`.

Verified statements:
- Lab 1 during the week of Aug 24 is titled **IR, Functional Groups, and Molecular Models**.
- Chapter 4 is covered that week and again with Practice Test 1 the following week.
- Unit tests are cumulative, closed book, and closed notes.
- The syllabus requires Klein, *Organic Chemistry*, 5th edition, but the syllabus itself does not print a Mercer-specific IR absorption table.

Therefore:
- IR belongs in Unit 1.
- The exact Fall 2026 range table/convention cannot be claimed from the syllabus alone.

---

## 2. HISTORICAL FALL 2025 COURSE-STYLE EVIDENCE

Source: uploaded `Test+1.pdf`, Dr. Meadows CHM 221 F25 Test 1, Question 3.

Verified from the actual page image:
- Question 3 asks the learner to match three molecules to three IR spectra.
- Candidate A is a ketone.
- Candidate B is a carboxylic acid.
- Candidate C is an ether.
- The spectra are labeled **Transmittance (%)** on the y-axis.
- The x-axis values decrease from approximately 3500 to 500 cm^-1 as the graph moves left to right.

This supports teaching:
- percent-transmittance downward absorptions,
- decreasing-wavenumber x-axis in the historical course style,
- ketone / carboxylic-acid / ether discrimination.

It does **not** prove:
- Fall 2026 will use identical molecules,
- Fall 2026 will use the identical spectrum plot convention,
- any exact Mercer-specific absorption range.

Runtime must therefore read the axis labels of each provided spectrum rather than hard-code `IR always points down`.

---

## 3. EXTERNAL REFERENCE CHEMISTRY

These are general reference values used to author the lesson. They are not labeled as Mercer-specific.

### Chemistry LibreTexts / OpenStax-derived interpreting table

Reference page: **Interpreting Infrared Spectra**.

Values used:
- alcohol O-H: 3400-3650 cm^-1, strong/broad,
- alcohol C-O: 1050-1150 cm^-1, strong,
- carbonyl compounds C=O: 1670-1780 cm^-1, strong,
- ketone C=O: ~1715 cm^-1,
- carboxylic-acid C=O: ~1710 cm^-1,
- carboxylic-acid O-H: 2500-3100 cm^-1, strong/broad.

### OpenStax Organic Chemistry, spectroscopy of alcohols

Reference page: **17.11 Spectroscopy of Alcohols and Phenols**.

Values/relationships used:
- alcohol O-H stretching absorption approximately 3300-3600 cm^-1 depending on hydrogen bonding,
- strong C-O stretch near 1050 cm^-1,
- hydrogen bonding broadens the O-H feature.

### OpenStax Organic Chemistry, spectroscopy of carboxylic acids

Reference page: **20.8 Spectroscopy of Carboxylic Acids and Nitriles**.

Values/relationships used:
- carboxylic-acid O-H very broad, approximately 2500-3300 cm^-1,
- C=O approximately 1710-1760 cm^-1 depending on environment,
- diagnostic combination of O-H plus C=O.

### Chemistry LibreTexts IR reference table

Used only to cross-check the broad ranges and shapes, not to create a giant memorization table.

---

## 4. RANGE-PRESENTATION RULE

The learner-facing lesson should prefer broad language such as:
- `broad O-H in the mid-3000 region`,
- `very broad acid O-H reaching roughly 2500-3300`,
- `strong carbonyl-region feature in the low 1700s`,

before asking the learner to recall exact numeric endpoints.

Exact numbers are anchors and should be shown only after the structural meaning is established.

Do not grade a learner wrong solely because she gives a chemically reasonable nearby range if the current task is testing structure-spectrum reasoning rather than exact numeric recall.

If Dr. Meadows supplies a Fall 2026 lab handout, lecture slide, or approved IR table, that course-provided source becomes authoritative for the numbers used in course-specific recall tasks.

---

## 5. FINGERPRINT-REGION RULE

A C-O feature around the ~1050-1150 cm^-1 neighborhood may support an alcohol/ether assignment in simple examples, but the lesson must not teach:

`one peak near 1100 = ether`.

The fingerprint region is crowded. Ether identification in this lesson depends on the complete candidate context:
- C-O-C structure,
- no O-H diagnostic feature,
- no C=O diagnostic feature,
- compatible fingerprint-region evidence.

---

## 6. SOURCE-CHANGE RULE

If current Fall 2026 course materials later disagree with the plotting convention or use a narrower/different approved range table:

1. preserve the teaching logic,
2. update the source basis,
3. update the range/convention data,
4. regenerate affected spectrum tasks,
5. re-audit cold evidence if any answer changes.

Never silently mix historical, external, and current-course claims.
