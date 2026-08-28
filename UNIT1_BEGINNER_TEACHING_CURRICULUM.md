# CHM 221 UNIT 1 BEGINNER TEACHING CURRICULUM
## Content contract before code

**Status:** design draft for review. This document defines what Unit 1 must teach before PR #73 is allowed to become the production teaching experience.

## 1. Why this document exists

The current Unit 1 implementation has the right high-level flow but still compresses too much chemistry into short explanations and animations. A learner can be shown a definition, tap through a visual, and still not understand the underlying idea.

The required standard is stricter:

> A student who begins a lesson with little or no usable knowledge of the skill should be able to build a mental model, use it with support, explain it in her own reasoning, and then solve a fresh problem without support.

This is not a requirement to reteach an entire chemistry textbook. It is a requirement to stop assuming prerequisite language or representations that have not been checked.

The teaching engine remains governed by `DR_MERISSA_TEACHING_ENGINE_SPEC.md`. This document supplies the Unit 1 content that the engine should teach.

---

## 2. Evidence base and scope discipline

### Confirmed Fall 2026 course scope

The Fall 2026 syllabus places the following before Test 1:

- Chapter 1
- Chapter 2.1-2.6
- Chapter 4
- Lab 1: IR, Functional Groups, and Molecular Models
- Chapter 4 + Practice Test 1 during the week immediately before Test 1

The syllabus also states that tests are cumulative, closed book, and closed notes, and that students must understand underlying concepts rather than memorize isolated facts.

### Historical Test 1 coverage signal

The Fall 2025 Test 1 is used only as a **coverage signal for Dr. Meadows' testing style**, not as a promise that the 2026 test will repeat the same questions.

That prior test required students to:

- draw a bond-line structure from a condensed formula
- identify intermolecular forces
- assign nonzero formal charges
- assign carbon hybridization
- match molecules to IR spectra
- rank Newman projections by stability
- explain why cyclopropane is high energy
- classify pairs as same molecule, constitutional isomers, stereoisomers, or none
- rank boiling points
- draw two cyclohexane chairs and identify the lower-energy chair
- construct constitutional isomers from a molecular formula with specified functional groups
- choose the most stable substituted cyclohexane conformation
- draw Newman projections from a conformational energy graph and explain an energy difference

Those categories are therefore important stress tests for whether this learning system is broad and transferable enough.

### Important distinction

A topic may be included in this curriculum for one of three reasons:

- **CONFIRMED COURSE SCOPE:** directly supported by the 2026 syllabus
- **HISTORICAL TEST SIGNAL:** appeared on the 2025 Test 1 and is consistent with the confirmed chapter/lab scope
- **FOUNDATION DEPENDENCY:** already established by the readiness system as necessary to understand the confirmed course material

The system must not tell the learner that a historically observed topic is guaranteed to appear on the 2026 exam.

---

## 3. Non-negotiable beginner teaching contract

Every Unit 1 lesson that is not tested out must follow this instructional logic.

### A. Orient

Start with one plain-language sentence answering:

- What are we learning?
- Why does an organic chemist care?

No unexplained vocabulary in this first sentence.

### B. Check the smallest prerequisite

Before teaching a skill, check only what the skill truly depends on.

Examples:

- before formal charge: lone-pair electron counting and bond order
- before bond-line notation: carbon's four-bond pattern and what a bond line represents
- before Newman projections: front carbon, back carbon, and rotation around a single bond
- before cyclohexane chairs: ring connectivity and the meaning of up/down versus axial/equatorial

If the prerequisite is present, skip the review. If it is absent, teach that exact missing piece and return.

### C. Teach vocabulary only when it becomes useful

Do not open a lesson with a glossary dump.

A term is introduced at the exact moment the learner needs it, using:

1. a plain-language meaning
2. a visual example
3. the formal chemistry term

Example:

> "This corner is where two bond lines meet. Chemists call that corner a **vertex**. In a bond-line drawing, an unlabeled vertex represents carbon."

### D. Build meaning before shortcut

Rules and memory cues come after the learner has seen why the rule works.

Formal charge is the model: electron ownership first, then `FC = V - N - B`, then the memory cue.

### E. I DO

Dr. Merissa completes one full worked example from beginning to end while explaining the decision process.

The explanation must answer **why this step is being done**, not merely narrate the click.

### F. Predict before reveal

At least once during the worked demonstration, pause before the next visual step and ask the learner to predict something low-risk.

Examples:

- "If we stop writing the C labels, did the carbons disappear?"
- "Which carbon will be closest to your eye in this Newman view?"
- "If the OH group can hydrogen-bond, would you expect its boiling point to move up or down relative to a similar alkane?"

The prediction is instructional, not mastery evidence.

### G. WE DO: Build Together from blank

The supported build starts from nothing. The learner performs the important decisions, one at a time.

Prompts should fade as soon as she demonstrates the step.

### H. YOU DO WITH SUPPORT

Use a different example. Hints are available but not forced.

A supported success never counts as independent evidence.

### I. Contrast a common wrong idea

Every lesson must explicitly compare at least one tempting wrong interpretation with the correct model.

Examples:

- bond-line: "unlabeled corner = empty space" versus "unlabeled corner = carbon"
- isomers: "redrawn differently" versus "atoms connected differently"
- Newman: "rotated page" versus "rotation about the C-C bond"
- chair flip: "up becomes down" versus the correct rule that up/down is preserved while axial/equatorial swaps

### J. YOU DO ALONE

Use a fresh item that has not appeared in Teach, Watch, Build Together, or Guided.

No hints, notes, periodic table popover, answer-revealing labels, or counters unless the assessment explicitly allows them.

### K. Explain why

A correct final answer is followed by one short explanation prompt whenever the skill requires reasoning.

The learner should identify the deciding feature, rule, or causal relationship.

### L. Transfer

Use a problem that looks different from the worked example but depends on the same idea.

### M. Return later

One immediate independent success is progress, not permanent mastery. The skill must reappear later in the session or a later session according to the shared engine.

---

## 4. Language and cognitive-load rules

1. Assume the learner may have heard the vocabulary but cannot yet use it.
2. Never introduce more than three genuinely new facts before requiring a small interaction.
3. Never use a technical word inside its own definition.
4. If an explanation uses a term not previously established in the current dependency chain, either define it inline or link it to a tiny prerequisite check.
5. Keep the visual and narration synchronized. Do not describe something that is not currently visible.
6. A visual must show a relationship, transformation, comparison, or decision. Decorative motion does not count as instruction.
7. For spatial topics, allow learner-controlled rotation/replay rather than relying on one static drawing.
8. A learner who selects "This explanation isn't making sense" must receive a different representation, not a synonym-filled rewrite.

---

# 5. UNIT 1 BEGINNER LESSON MAP

## Lesson U1-00: Chemistry Toolbox + How to Read the Screen

**Purpose:** Give the learner permanent access to reference information without forcing her to leave the course page.

### Toolbox contents

- periodic table
- common valence-electron patterns for H, C, N, O, F, Cl, Br, I
- bond-order reminder: single 1, double 2, triple 3
- compact functional-group reference after those groups have been taught
- scratch/notebook area at allowed scaffold levels

### Periodic table behavior

Tap an element to show:

- name and symbol
- atomic number
- group
- valence-electron count for main-group elements relevant to the course
- common neutral bonding pattern when pedagogically appropriate

The toolbox is a reference, not automatic answer help. During a cold mastery check it is hidden unless the specific assessment allows a periodic table.

### Navigation contract

Any prerequisite lesson opened from Unit 1 must carry a return destination.

Required controls:

- `Back to Test 1 Support`
- `Return to the skill I was working on`

Do not rely on browser history or opening uncontrolled new tabs.

---

## Lesson U1-01: From Atoms and Bonds to Bond-Line Structures

**Coverage basis:** confirmed Chapter 2.1-2.6 scope; historical Test 1 signal.

### Beginner entry point

"Organic molecules can become too crowded to draw every carbon and hydrogen. Bond-line drawings are a shorthand, but the atoms are still there. We are learning how to see the hidden carbons and hydrogens instead of treating the lines like abstract marks."

### Prerequisite gate

1. How many bonds does neutral carbon commonly make in the structures used here? `4`
2. What does a line between two atoms represent? `a covalent bond`

If either fails, give a tiny carbon-bonding refresher before continuing.

### Vocabulary in order

- bond line
- line end
- vertex
- implied carbon
- implied hydrogen
- heteroatom

### I DO visual sequence

Use a simple four-carbon molecule.

1. Show every C and H explicitly.
2. Highlight the carbon skeleton only.
3. Remove the H labels attached to carbon while keeping the bonds visible.
4. Ask: "Did those hydrogens disappear from the molecule, or did we stop writing them?"
5. Collapse the C labels into line ends/vertices one carbon at a time.
6. Toggle between expanded and bond-line views.
7. Count the hidden carbon atoms by touching each end/vertex.
8. Select one carbon and infer its missing hydrogens from four total bonds.

### Build Together

Convert a different expanded structure into bond-line form one decision at a time.

### Common wrong ideas

- every line is a carbon
- only vertices count, not line ends
- carbon hydrogens are gone rather than implied
- O/N/halogens are hidden like carbon

### Independent production

The learner must both:

- draw/read a fresh bond-line structure
- explain how she knew the number of carbons and one selected carbon's hydrogen count

### Transfer

Convert between condensed formula and bond-line representation in both directions.

---

## Lesson U1-02: Formal Charge as Electron Bookkeeping

**Coverage basis:** confirmed Chapter 1/2 foundation; historical Test 1 signal; existing Day 2 curriculum.

### Rule

Do not rewrite this lesson weaker inside Unit 1.

Route into the existing Day 2 formal-charge teaching sequence, preserving Unit 1 return context.

The Day 2 lesson already has the correct instructional order:

1. Lewis prerequisite gate
2. meaning of formal charge as bookkeeping
3. electron ownership
4. derive the formula
5. worked examples
6. guided V/N/B calculation
7. fresh independent bank
8. whole-structure transfer
9. explanation and charge-sum check

### Unit 1 integration requirement

Returning from Day 2 must not automatically award Unit 1 independent evidence. Unit 1 should either read a compatible shared mastery record or give its own fresh cold confirmation.

---

## Lesson U1-03: Functional Groups as Recognizable Atom Patterns

**Coverage basis:** confirmed Lab 1 title; historical Test 1 signal.

### Beginner entry point

"A functional group is a small pattern of atoms and bonds that gives part of a molecule predictable behavior. Instead of memorizing an entire molecule, we learn to spot the important pattern inside it."

### Prerequisite gate

Can the learner distinguish:

- single versus double bond
- carbon versus oxygen/nitrogen labels

### Teaching principle

Do not teach functional groups as a list of names beside finished structures.

Use **pattern comparison**.

### Initial pattern set for Unit 1

At minimum, teach the functional groups that are supported by confirmed course/lab materials and historical Test 1 demands, including the ability to distinguish structures containing:

- alcohol
- ether
- ketone
- carboxylic acid
- amine
- amide

Do not silently expand into later-semester reaction chemistry.

### I DO visual sequence

1. Show a molecule with many carbons.
2. Fade the hydrocarbon background.
3. Highlight the key atom-and-bond pattern.
4. Name the pattern.
5. Place a near-lookalike next to it.
6. Ask which bond/atom difference changes the functional-group identity.

Example contrast:

- alcohol: C-O-H
- ether: C-O-C

Then:

- ketone: C(=O)C
- carboxylic acid: C(=O)OH

Then:

- amine versus amide, emphasizing whether N is directly attached to a carbonyl carbon.

### Common wrong ideas

- identifying only by elemental formula
- "contains O" therefore alcohol
- "contains N" therefore amine
- amide mistaken for amine because both contain nitrogen

### Independent production

Use unfamiliar molecules and ask the learner to highlight the exact atoms/bonds that justify the name.

---

## Lesson U1-04: Intermolecular Forces and Boiling-Point Reasoning

**Coverage basis:** historical Test 1 signal consistent with early-course structure/property reasoning.

### Beginner entry point

"The bonds inside a molecule hold its atoms together. Intermolecular forces are attractions between separate molecules. Boiling requires molecules to pull away from one another, so stronger attractions usually require more energy to overcome."

### Prerequisite gate

- distinguish intramolecular bond from attraction between molecules
- recognize whether O-H or N-H is present
- recognize polar functional groups at the level already taught

### Teach in causal order

1. London dispersion is present for all molecules.
2. Polar molecules can add dipole-dipole attraction.
3. Suitable O-H/N-H patterns can create hydrogen bonding.
4. More/stronger attractions generally raise boiling point when comparing otherwise similar molecules.
5. Molecular size/surface area also matters, so boiling point is not a one-rule lookup.

### Visual representation

Show two identical molecules approaching each other. Animate only the relevant intermolecular attraction between molecules, clearly separated from covalent bonds inside each molecule.

### Build Together

For a fresh molecule:

- identify available intermolecular forces
- state the structural evidence for each

### Transfer

Rank a small set by boiling point and explain the dominant structural reasons rather than naming a memorized order.

---

## Lesson U1-05: Carbon Hybridization from Bonding Geometry

**Coverage basis:** historical Test 1 signal; also aligns with established readiness geometry/hybridization foundation.

### Beginner entry point

"Hybridization is a label that helps describe how a carbon is arranged around itself. We are not going to guess the label from the drawing style. We are going to count electron-group directions around carbon and connect that to shape."

### Prerequisite gate

- identify single, double, triple bonds
- understand that a multiple bond still points in one bonding direction to the neighboring atom for electron-domain counting

### Teaching sequence

1. tetrahedral carbon with four electron groups -> sp3
2. trigonal planar carbon with three electron groups -> sp2
3. linear carbon with two electron groups -> sp

### Visual representation

Morph the same central-carbon display between four, three, and two directions while preserving the counted groups.

### Common wrong ideas

- double bond counts as two separate directions
- hybridization is determined by number of drawn bond lines rather than electron-group geometry
- every carbon in the same molecule has the same hybridization

### Independent production

Label selected carbons in mixed structures and explain the domain count that produced the label.

---

## Lesson U1-06: IR Spectra as Bond-Vibration Evidence

**Coverage basis:** confirmed Lab 1 includes IR; historical Test 1 signal.

### Beginner entry point

"An IR spectrum is not a picture of the whole molecule. It is evidence that certain types of bonds absorb infrared energy at characteristic ranges. We use the structure and spectrum together."

### Prerequisite gate

- functional-group recognition for the groups used in the IR lesson

### Teaching boundaries

Teach only the IR recognition needed for the current course scope. Do not turn Unit 1 into a complete spectroscopy course.

### Beginner visual sequence

1. Show a simple bond as two connected masses.
2. Animate stretching.
3. Connect absorption to a dip in percent-transmittance style spectra, if that is the convention used in course examples.
4. Mark broad diagnostic regions rather than asking the learner to memorize dozens of exact numbers immediately.
5. Compare spectra for molecules with clearly different diagnostic groups.

### Initial discriminations

At minimum, the learner should be able to reason from strong diagnostic features relevant to the historical Test 1 examples, such as broad O-H behavior and strong carbonyl-region evidence, while using the exact ranges/content supplied by the course materials when available.

### Important content-source rule

Do not invent a Mercer-specific IR table. If exact peak ranges are needed for production, use verified course/text/reference content and label the source in the curriculum data.

### Independent production

Match fresh molecules to spectra and explain which feature ruled each candidate in or out.

---

## Lesson U1-07: Alkane Naming from Structure, Not Memorized Shapes

**Coverage basis:** confirmed Chapter 4.

### Beginner entry point

"An IUPAC name is a set of directions for rebuilding the structure. We name the longest carbon path first, then describe where the branches are attached."

### Prerequisite gate

- read bond-line carbons correctly
- recognize a continuous carbon chain

### Vocabulary in order

- continuous chain
- parent chain
- substituent
- locant
- methyl/ethyl as needed by the current examples

### I DO sequence

1. Highlight every possible continuous path.
2. Compare chain lengths visually.
3. Lock the longest valid parent.
4. Number from each end in two colors.
5. Compare the first substituent locant.
6. Identify and name branches.
7. Assemble number + substituent + parent.
8. Reverse-check the name by rebuilding the structure.

### Common wrong ideas

- longest chain means the straightest-looking chain
- number from the visually left side by default
- choose the branch before choosing the parent chain

### Independent production

Name fresh branched alkanes and draw a structure from a fresh name.

---

## Lesson U1-08: Molecular Formula, Constitutional Isomers, and "Same vs Different"

**Coverage basis:** confirmed Chapter 4; historical Test 1 signal.

### Beginner entry point

"Two drawings can look different even when they represent the same molecule. A true constitutional isomer changes which atoms are connected to which."

### Prerequisite gate

- correctly count atoms from bond-line structures
- distinguish connectivity from drawing orientation

### Teaching sequence

1. Same molecule redrawn/rotated
2. Same molecular formula, different connectivity -> constitutional isomers
3. Same connectivity but different spatial arrangement -> introduce stereoisomer category only to the level required by current course content
4. Different formula or incompatible category -> none of the above

### Visual representation

Animate a molecule being rotated/redrawn without breaking bonds. Then show a true connectivity change by visibly breaking and reconnecting a bond.

### Build Together

For each pair, ask in this order:

1. Same molecular formula?
2. Same connectivity?
3. If connectivity is the same, is the spatial arrangement actually different in a chemically meaningful way?

### Independent production

Classify fresh pairs as:

- same molecule
- constitutional isomers
- stereoisomers
- none

The learner must point to the decisive evidence.

---

## Lesson U1-09: Build Constitutional Isomers from a Formula + Required Functional Group

**Coverage basis:** historical Test 1 signal.

### Beginner entry point

"When a problem gives only a molecular formula, you are being asked to build a legal structure that uses every atom exactly once and obeys normal bonding. If it also requires an amine or amide, that functional-group pattern becomes one of your constraints."

### Prerequisite gate

- functional groups
- bond-line atom counting
- common neutral bonding patterns / formal charge where needed

### Teaching sequence

1. Inventory atoms from the formula.
2. Apply the required functional-group constraint.
3. Use normal valence/bonding to complete a legal skeleton.
4. Recount every atom.
5. Check nonzero formal charges.
6. Compare with another valid structure to prove non-uniqueness.

### Common wrong ideas

- forgetting hydrogens hidden in bond-line notation
- drawing an amide when asked for an amine or vice versa
- using too many/few atoms
- creating impossible valence

### Independent production

Fresh formula + group constraints, followed by an atom-count and bonding explanation.

---

## Lesson U1-10: Looking Down a C-C Bond - Newman Projections from First Principles

**Coverage basis:** confirmed Chapter 4; historical Test 1 signal.

### Beginner entry point

"A Newman projection is what a carbon-carbon bond looks like if your eye is lined up directly with that bond. The front carbon is closer to you; the back carbon sits behind it."

### Prerequisite gate

- identify the exact C-C bond being viewed
- identify substituents attached to each carbon
- understand rotation around a single bond

### Critical visual sequence

Do not start with a finished Newman circle.

1. Show a 3D-ish wedge/line molecule.
2. Draw an arrow representing the viewer's eye direction.
3. Rotate the whole molecule until the target C-C bond points directly toward the learner.
4. Fade the front carbon into a dot.
5. Fade the back carbon into a circle.
6. Carry each substituent into the corresponding Newman spoke one at a time.
7. Toggle between original molecule and Newman view.
8. Ask which carbon is front/back before naming any conformation.

### Then teach conformations

- eclipsed: front/back bonds aligned
- staggered: offset
- anti: important groups 180 degrees apart in a staggered view
- gauche: important groups 60 degrees apart in a staggered view

### Why energy changes

Teach torsional/steric reasoning visually before asking for ranking.

### Common wrong ideas

- rotating the paper changes the conformation
- front and back substituents swapped
- anti/gauche used for eclipsed conformations

### Independent production

Convert a fresh structure to a Newman projection from a specified viewing direction.

---

## Lesson U1-11: Conformational Energy Diagrams + Stability Ranking

**Coverage basis:** historical Test 1 signal; Chapter 4.

### Beginner entry point

"As a single bond rotates, the molecule passes through higher- and lower-energy arrangements. The energy graph is a movie of that rotation flattened into a line."

### Prerequisite gate

- Newman projection orientation
- staggered/eclipsed
- anti/gauche

### Teaching sequence

1. Rotate one Newman projection in controlled 60-degree steps.
2. Plot each position onto an energy graph as it appears.
3. Connect eclipsed positions to peaks and staggered positions to valleys.
4. Compare staggered valleys according to steric crowding.
5. Connect 0/60/120/180/... degrees to the corresponding Newman views.

### Build Together

Given an energy curve and one known Newman point, reconstruct additional points.

### Independent production

Draw requested Newman projections at fresh graph positions and explain why one valley/peak is higher or lower than another.

---

## Lesson U1-12: Cycloalkanes and Why Small Rings Are Strained

**Coverage basis:** confirmed Chapter 4; historical Test 1 signal.

### Beginner entry point

"Closing a carbon chain into a ring can force bonds into positions they would not prefer. Ring strain is the energy cost of that crowding or distortion."

### Prerequisite gate

- tetrahedral carbon geometry at the qualitative level needed here
- eclipsed/staggered concept where torsional strain is discussed

### Teaching sequence

Use cyclopropane as the first strong contrast with an open-chain alkane.

Show:

- preferred tetrahedral bond-angle idea qualitatively
- forced small-ring geometry
- eclipsing/torsional consequences where appropriate

Do not reduce the explanation to "small ring = unstable." The learner must identify a reason.

### Independent production

Explain one source of cyclopropane's high energy compared with a comparable open-chain alkane.

---

## Lesson U1-13: Cyclohexane Chairs, Axial/Equatorial, and Chair Flips

**Coverage basis:** confirmed Chapter 4; historical Test 1 signal.

### Beginner entry point

"Cyclohexane is not flat. It folds into a chair shape that reduces strain. Every carbon has two substituent directions we track: one axial and one equatorial."

### Prerequisite gate

- ring numbering
- up versus down substituent direction

### Teaching sequence

1. Transform a flat hexagon into a chair.
2. Number the same carbons through the transformation.
3. Add axial positions first and show that they alternate up/down.
4. Add equatorial positions.
5. Place one substituent and label both its up/down identity and axial/equatorial identity.
6. Animate a chair flip.
7. Preserve carbon numbering.
8. Show explicitly: axial swaps with equatorial, but up/down does **not** switch.
9. Add a second substituent and connect up/down relationships to cis/trans as required by current course scope.
10. Compare steric crowding for a bulky axial versus equatorial group.

### Common wrong ideas

- chair flip changes up into down
- chair flip changes cis into trans
- lower-energy chair is chosen because it "looks flatter"
- substituent size is ignored

### Build Together

Draw both chairs for a fresh substituted cyclohexane and carry each substituent through the flip.

### Independent production

- produce both chairs
- identify the lower-energy chair
- explain which substituent placement causes the energy difference

---

# 6. TEST-OUT AND ADAPTIVE ENTRY

Beginner-first does not mean every student must sit through every beginner explanation.

For each lesson:

- 2-3 item cold probe
- full clear -> skip Teach/Watch and go to light independent confirmation
- partial evidence -> targeted correction at the first failed subskill
- no usable evidence -> full beginner lesson

The system should remember which subskills are already reliable so a learner does not repeatedly prove the same prerequisite.

---

# 7. IDK ROUTING FOR THESE LESSONS

The shared six-choice IDK contract remains authoritative.

Unit 1 content must provide representation alternatives for each lesson.

| Lesson | First representation | If explanation fails |
|---|---|---|
| Bond-line | transformation animation | explicit atoms + color-coded carbon count + learner rebuild |
| Functional groups | highlighted atom pattern | side-by-side near-miss comparison |
| IMF/boiling | molecule-pair attraction visual | force checklist + comparative examples |
| Hybridization | domain/shape visual | physical-direction analogy + counted examples |
| IR | spectrum + bond vibration | diagnostic-region comparison table + matched pair walkthrough |
| Naming | highlighted parent-chain path | rebuild-from-name reverse process |
| Isomers | connectivity animation | atom-mapping / numbered atoms |
| Newman | view-axis animation | physical "camera looking down bond" model + manual spoke placement |
| Energy diagram | synchronized rotation/graph | frame-by-frame 60-degree table |
| Cycloalkane strain | geometry comparison | angle/torsion side-by-side model |
| Chairs | animated flip | numbered-carbon tracing + up/down ledger |

Repeated failure after a representation switch should create a clear tutoring/professor question rather than looping the same content indefinitely.

---

# 8. EVIDENCE AND MASTERY RULES

Unit 1 must use the shared teaching-engine meaning of mastery rather than inventing a weaker local label.

### Independent success

A fresh cold item is correct without support.

### Mastery

Requires the shared three-part rule:

1. cold independent success at scaffold level 0
2. correct-shaped explanation of why
3. success on a second different item after a meaningful interval

A lesson may display `Independent evidence` before mastery is reached.

Do not display `Mastered` after one clean correct answer.

---

# 9. REQUIRED BEGINNER-CLARITY REVIEW BEFORE CODING

For every lesson script, an auditor should answer these questions before implementation:

1. Could a student understand the first paragraph without already knowing the lesson vocabulary?
2. Does every technical term get introduced after a plain-language mental model?
3. Does the visual show why the rule works, or only animate the answer?
4. Does the learner predict, compare, build, or explain before independent practice?
5. Is there a clear contrast with the most tempting wrong idea?
6. Does the guided example use a different molecule/problem than the worked example?
7. Is the independent item genuinely fresh?
8. Can the learner explain the deciding feature without repeating a memorized sentence?
9. Is there a second representation if the first explanation fails?
10. Does the lesson stop when sufficient evidence exists instead of forcing unnecessary repetition?

Any `NO` blocks that lesson from production.

---

# 10. IMPLEMENTATION ORDER AFTER CONTENT APPROVAL

Do not code all lessons at once.

Recommended vertical slices:

1. Bond-line structures
2. Newman projections + conformational energy
3. Cyclohexane chairs
4. Functional groups + molecular-property reasoning
5. IUPAC naming
6. Isomer classification + constrained structure building
7. Hybridization
8. IR
9. remaining integration and mixed Test 1 practice

Formal charge continues to reuse Day 2.

Each slice must pass:

- beginner-clarity content audit
- chemistry-accuracy audit
- teaching-engine behavior tests
- supported/independent evidence tests
- actual phone/iPad learner check

---

# 11. PR #73 DECISION

PR #73 is useful as a prototype of the visual lesson shell, but it should not be merged as the final Unit 1 teaching experience until the lesson content is rebuilt to this beginner standard.

Safe reuse from PR #73 may include:

- visual rendering primitives
- learner-controlled Watch controls
- general lesson container/layout
- fresh-item integrity improvements

Items that must be replaced or upgraded before production include:

- compressed lesson explanations
- insufficient prerequisite checks
- too-narrow functional-group instruction
- incomplete Test 1 skill coverage
- local readiness/mastery semantics that diverge from the shared engine
- one-way foundation navigation
- missing persistent chemistry toolbox/periodic table

---

# 12. DEFINITION OF DONE

Unit 1 is ready when a student who says "I really do not know this yet" can enter any supported Test 1 skill and experience:

**plain meaning -> prerequisite repair if needed -> visual model -> prediction -> worked example -> build together -> guided fresh example -> misconception contrast -> cold independent example -> explain why -> transfer -> later retrieval**

and when every supported interaction is correctly separated from independent evidence.

The standard is not "the animation played."

The standard is:

> **The student can now do something she could not do before, can explain what changed in her understanding, and can reproduce the skill later without the teaching screen.**
