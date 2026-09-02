# CHM 221 Unit 2 / Test 2 Scope and Evidence Contract

Status: CURRICULUM AUTHORING. No new shared engine. No learner release yet.

## Course alignment

Source hierarchy for this unit:
1. Dr. Maggie Meadows' Fall 2026 CHM 221 syllabus and current Canvas / Mercer communication.
2. Klein & Starkey, Organic Chemistry, 5th Edition.
3. Original parallel practice authored for this site.

Syllabus sequence after Test 1:
- Week of Sep 7: Chapter 5
- Week of Sep 14: Chapter 2.7-2.13 and Chapter 3
- Week of Sep 21: Chapter 3 and practice
- Week of Sep 28: Test 2

Klein 5e Chapter 5 is Stereoisomerism.

This branch authors Chapter 5 first. Chapters 2.7-2.13 and 3 will attach to the same Unit 2 / Test 2 container later.

## Architecture boundary

The live Test 1 tutor remains frozen while the learner is using it.

This branch may add:
- curriculum data
- visual specifications
- fresh practice banks
- repair mappings
- content tests
- Unit 2 navigation scaffolding that is not released yet

This branch must not:
- change the shared Student Model
- change mastery thresholds
- change retrieval timing
- change support-contamination rules
- change IDK routing rules
- copy the Test 1 engine into a second competing mastery system
- publish Chapter 5 to the live learner site before runtime integration and real-device validation

## Chapter 5 skill graph

The Chapter 5 curriculum is organized as eight teachable skills.

### C5-01 Isomer classification
Distinguish identical structures, constitutional isomers, and stereoisomers by asking connectivity first, then three-dimensional arrangement.

Key misconception guards:
- a rotated or redrawn molecule is not automatically a new isomer
- same formula alone does not prove stereoisomerism
- constitutional isomers differ in connectivity

### C5-02 Chirality and stereocenters
Determine whether a molecule is chiral and identify tetrahedral stereocenters.

Key misconception guards:
- a carbon is not a stereocenter merely because it is sp3
- a tetrahedral carbon needs four different substituent paths
- a molecule can contain stereocenters and still be achiral because of symmetry

### C5-03 CIP priority and R/S configuration
Rank substituents by CIP priority and assign R or S after placing the lowest-priority group away.

Key misconception guards:
- priority is based first on atomic number of the directly attached atom
- spatial clockwise/counterclockwise reading is valid only after accounting for priority 4 orientation
- R/S is configuration, not optical-rotation sign

### C5-04 Stereoisomer relationships
Classify pairs as identical, enantiomers, or diastereomers using configuration at all stereocenters.

Key misconception guards:
- invert every stereocenter -> enantiomer, unless symmetry makes the structures identical
- invert some but not all -> diastereomer
- enantiomers are not constitutional isomers

### C5-05 Meso compounds and symmetry
Recognize meso compounds as achiral molecules that contain stereocenters but possess an internal symmetry relationship that makes the mirror image superimposable.

Key misconception guards:
- "has stereocenters" does not guarantee "chiral"
- opposite R/S labels alone do not automatically prove meso; the molecular framework must support the symmetry

### C5-06 Fischer projections
Read and manipulate Fischer projections while preserving three-dimensional meaning.

Key misconception guards:
- horizontal bonds project toward the viewer
- vertical bonds project away
- a 180-degree rotation of a Fischer projection preserves configuration
- a 90-degree rotation does not preserve configuration

### C5-07 Alkene E/Z configuration
Determine whether E/Z notation applies, rank the substituent on each alkene carbon by CIP priority, then classify the higher-priority groups as same side (Z) or opposite sides (E).

Key misconception guards:
- E/Z is unavailable if either alkene carbon has two identical substituents
- compare priority separately on each alkene carbon
- cis/trans and E/Z are related but not interchangeable in every alkene

### C5-08 Optical activity and enantiomer mixtures
Connect chirality to optical rotation and distinguish pure enantiomer, racemic mixture, and non-racemic mixtures conceptually.

Key misconception guards:
- R does not mean positive rotation and S does not mean negative rotation
- enantiomers rotate plane-polarized light by equal magnitude in opposite directions under the same conditions
- a racemic mixture has zero net rotation because opposite rotations cancel

## Reused prerequisites

Only route backward when the current error actually depends on an older skill.

Reusable prerequisites already present in the live system:
- Bond-line structure reading
- Same molecule vs constitutional isomer reasoning
- Cycloalkane cis/trans language
- Tetrahedral carbon geometry

Do not route Chapter 5 errors to unrelated foundation days merely because those days exist.

## Learning ladder for every Chapter 5 skill

Every skill uses the same locked learning sequence:

Quick diagnostic -> Watch / teach -> supported concept check -> Build Together -> Guided -> fresh cold Independent -> Explain Why -> Transfer -> meaningful intervening chemistry -> Later Retrieval.

Rules:
- probe work is diagnostic only
- Watch, Build Together, Guided, repairs, and helped work are supported and cannot become mastery evidence
- a wrong or helped cold item is contaminated permanently for that evidence cycle
- correcting the same item after help does not make it cold again
- fresh independent evidence must use a different item
- explanation must preserve chemical relationships, not merely contain keywords
- transfer must look different enough that pattern matching is insufficient
- later retrieval must be fresh and delayed under the shared Student Model rules
- only the shared Student Model may declare mastery

## IDK / unsure behavior

"I do not know" and "I am not sure" are instructional events, not answer choices that simply loop.

Required route:
1. stop asking the same question
2. identify the first likely broken step
3. teach with a different representation or comparison
4. use a simpler prerequisite check
5. return to a fresh or meaningfully changed version of the target idea

Same-question repetition without new teaching is a release blocker.

## Required visual / production checkpoints

Chapter 5 is spatial. Text-only success is insufficient for the entire module.

At minimum, the learner must encounter original visual or production tasks that require her to:
1. compare two drawings and decide whether connectivity changed
2. identify a stereocenter in a wedge-dash structure
3. rank four substituents around a stereocenter
4. assign R/S from a wedge-dash structure
5. compare a pair of molecules as enantiomers / diastereomers / identical
6. identify the internal symmetry in a meso candidate
7. read a Fischer projection and state which bonds point toward / away
8. assign E/Z to an alkene for which E/Z is valid

The browser may support drawing practice, but it must not pretend to automatically grade arbitrary handwriting or freehand molecular drawings unless a real structured grader exists.

## Freshness contract

Within a skill:
- probe prompts may not be reused as independent items
- supported concept/build/guided prompts may not be reused verbatim as independent items
- a failed independent item may not be reused as the post-repair cold item
- transfer may not duplicate an independent structure
- retrieval may not duplicate transfer

Structural variants must change more than labels or molecule orientation when the answer could otherwise be remembered.

## Chapter 5 release gate

Before Chapter 5 becomes live:
1. content contract tests pass
2. chemistry review passes
3. runtime is wired to the existing locked engine without a competing mastery system
4. IDK / wrong-answer repairs visibly change teaching representation
5. mobile and iPad layouts pass automated regression
6. real phone and real iPad checks pass
7. course hub points to the released Unit 2 route only after those checks
