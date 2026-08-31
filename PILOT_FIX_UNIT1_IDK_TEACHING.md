# Unit 1 Pilot Fix: IDK + Teaching

This pilot bug was reproduced from real-device screenshots after PR #91 deployed.

## Defects

1. `I don't know yet` jumped straight to one generic skill paragraph instead of diagnosing the learner's point of confusion.
2. Two wrong answers claimed to switch from testing to teaching but still rendered the same generic paragraph.
3. The repair path skipped a targeted supported check and moved directly to a fresh item.
4. The learner-facing evidence line said `Supported/repaired` even though it only counted supported correct answers and did not visibly record repairs.

## Fix

- Reuse the shared six-way IDK reason contract from `student-model-idk-router.js`.
- Add item-specific teaching plans for all fourteen Unit 1 practice items.
- Ask the learner where the idea broke before choosing a teaching representation.
- Add a supported repair check before a fresh independent item can unlock.
- Keep support contamination intact: repair checks cannot count as independent evidence.
- Show separate `Supported correct` and `Repairs started` values.
- Add a real DOM regression for the exact neutral-oxygen pilot failure.

This change does not modify the frozen Bond-Line mastery evaluator or mastery criteria.
