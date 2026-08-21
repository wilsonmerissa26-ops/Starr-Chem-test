# DAY 3 FREEZE STATUS — Resonance

**Status:** CODE-COMPLETE / FROZEN PENDING SHORT DEVICE SPOT-CHECK

Day 3 Resonance is now implemented on top of the locked `Day3_Curriculum.md` contract. Routine refactors are not allowed. Reopen Day 3 learner code only for a reproducible learner-facing defect or an approved curriculum change.

## Certified in code and CI

The merged Day 3 runtime includes:
- Day 2 formal-charge handoff before resonance opens;
- bounded fresh prerequisite retrieval rather than teaching around a missing prerequisite;
- vocabulary signals stored separately from resonance mastery;
- fixed atom/sigma-skeleton teaching before curved-arrow rules;
- electron-pair source and destination reasoning rather than picture matching;
- explicit distinction between an invalid over-octet structure and a valid but lower-weight incomplete-octet contributor;
- sequential guided allyl-anion and nitrite work;
- six fresh independent items with bounded stopping rules;
- clean versus supported/repaired evidence;
- Hint / First step / Walkthrough help contamination;
- interactive walkthrough rather than an answer dump;
- repeated-error representation switching;
- formal-charge and total-charge checks on changed atoms/structures;
- cold nitrate whole-concept transfer;
- fresh amide fallback transfer after a contaminated nitrate transfer;
- separate Day 3 localStorage evidence for later-day handoff.

## Automated certification

At the merge point:
- Day 3 curriculum contract: 78 checks passing;
- Day 3 runtime contract: 112 checks passing;
- Day 3 JavaScript syntax check: passing;
- full repository CI: passing;
- frozen Day 1 and Day 2 regressions: passing;
- final Day 1 release academic/voice audit: passing.

Merged learner-runtime commit:
`b33c56035e523b0e6034bccf5bf23ddec6782882`

## Frozen files

Do not routinely edit:
- `Day3_Curriculum.md`
- `day3/index.html`
- `day3/resonance.js`
- `test-day3-curriculum.js`
- `test-day3-resonance.js`

The CI workflow may gain later-day steps, but existing Day 3 assertions should not be weakened merely to make a later change pass.

## What is still not device-certified

Automated tests cannot certify touch behavior, browser rendering, mobile keyboard behavior, visual wrapping, or the learner's subjective clarity on a real phone/tablet.

The remaining Day 3 device pass should be short and observational. It should confirm:
1. Day 3 reads a real Day 2 record and routes correctly.
2. Vocabulary meaning stays hidden until the learner requests review.
3. Guided choices advance one step at a time.
4. Hint, First step, and Walkthrough remain usable on the device.
5. A wrong independent response stays on the same structure for repair.
6. The nitrate transfer accepts either equivalent singly bonded oxygen as the new double-bond source.
7. The page remains readable and tappable on the actual device.

A device issue should be reproduced before reopening frozen code.

## Handoff rule

Later chemistry may use resonance as a prerequisite only from the Day 3 evidence record. A later lesson must not assume that recognizing the word “resonance” proves the learner can generate, validate, or compare contributors.
