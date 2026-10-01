# Phase 2A Adaptive Math Core — Direct Source Review Addendum

## Status

**AUTOMATED / SOURCE-DEFECT REVIEW COMPLETE. PEDAGOGICAL HUMAN REVIEW REMAINS REQUIRED BEFORE PR #27 LEAVES DRAFT.**

This addendum records the direct source review performed after the first Phase 2A human-review bundle was produced. It supplements `PHASE2_ADAPTIVE_CORE_SPEC.md` and `PHASE2_ADAPTIVE_CORE_REVIEW.md` without authorizing browser or live Day 1 integration.

## Verification discipline correction

An earlier handoff reported a SHA-256 for a ZIP container that did not match the ZIP received by the independent reviewer. ZIP containers can change because of metadata, timestamps, compression, or artifact re-packaging, but the specific statement that the received ZIP itself had been verified to that hash did not hold.

That container-hash claim is therefore retired as evidence.

For Phase 2A, source identity and verification should rely on:

- the exact Git commit SHA;
- the actual files inside the review bundle;
- tests executed directly from those files or from the repository checkout;
- GitHub Actions results attached to the same commit.

Do not present a ZIP-wrapper hash as stronger evidence than direct source execution.

## Independent source findings confirmed before this addendum

Direct execution and inspection independently confirmed that:

- the canonical negative-log route builds `log(6)` from supplied `log(2)≈0.30` and `log(3)≈0.48` landmarks rather than learner-inaccessible calculator precision;
- signed scientific-notation normalization preserves sign and uses coefficient magnitude correctly;
- `exact_log10` / `inverse_log10` scope restrictions reject calculator-only exact-log cases;
- already-reduced fraction routes omit fake reduction work while reducible results retain a real simplification step;
- all 46 prerequisite node IDs have real lesson/check content rather than placeholders;
- the negative-exponent remediation route points to the real `reciprocal_meaning` node;
- taught exponent equivalences such as `b^-2 = 1/b^2`, `x^0 = 1`, and `a^1 = a` are accepted while common wrong forms remain rejected.

The independent source review then identified a real dead-code landmine: `day1-adaptive-math-model-core.js` still contained an unused `estimate_negative_log` handler that called `Math.log10(front)` directly. The canonical entry intercepted that family, so it was not learner-facing, but it duplicated the defect the canonical planner had already repaired.

## Red / green corrections from direct source review

### 1. Dead calculator-based negative-log fallback deleted

The unused low-level `estimate_negative_log` branch was deleted from `day1-adaptive-math-model-core.js`. The canonical landmark-aware planner is now the only Phase 2A implementation of that family.

`test-phase2-log-scope.js` now also requires direct low-level core calls for `estimate_negative_log` to fail closed rather than fall back to calculator precision.

### 2. Duplicate active-remediation mutation blocked

Source inspection found that a second call to `openPrerequisiteRepair()` while a repair was already active could reach `handleIdk()` before the graph layer rejected re-entry. That could reset remediation metadata, regress scaffolding again, and mutate learner state even though the request was ultimately invalid.

`test-phase2-remediation-reopen.js` was written red first. The canonical runtime now rejects duplicate/re-entrant opens as `remediation_already_active` before lower-level Student Model mutation.

The regression snapshots and requires byte-for-byte stability for:

- owner remediation metadata;
- scaffold level;
- prerequisite return stack;
- active path;
- event history.

### 3. Deep-repair parent-bank exhaustion made explicit

A reachable path was reproduced using the real three-item prerequisite banks:

`25% of 68 → quartering → two wrong quartering checks → halving repair → third quartering check → second halving repair`.

After the second child repair, all three quartering checks have been consumed. The old runtime returned `return_to_parent_prerequisite` with `nextCheckItem:null`, which could strand the learner in an apparently normal retry state with no retry item.

`test-phase2-deep-repair-bank-exhaustion.js` was written red first. The canonical runtime now reports `prerequisite_bank_exhausted`, keeps the parent prerequisite active, keeps the owner remediation gate open, and preserves the exact original problem.

### 4. Route-evidence audit inputs separated from final-answer input

The existing evidence rules already prevented a whole-problem answer from manufacturing unobserved prerequisite fluency. Source review found a narrower audit-quality problem: legitimate verified child-skill attempts inherited the whole-problem final input.

For example, the final answer `12` to `15% of 80` could be stored as the `input` on a verified `halving` attempt even though `12` was not the observed halving action.

`test-phase2-route-evidence-audit.js` was written red first. The canonical runtime now preserves the final answer on the parent attempt while child route evidence:

- stores `null` when no child-step input was explicitly observed;
- stores the exact child observation only when Phase 2B supplies it through `evidenceInputsBySkill`.

This changes audit semantics only. It does not increase fluency, mastery, or route selection.

### 5. Canonical entry boundaries protected

The reviewed wrappers are part of correctness:

- `day1-adaptive-math-model.js` owns scope validation, human-doable negative-log planning, route-efficiency policy, representability checks, and learner-facing copy policy;
- `day1-adaptive-runtime.js` owns pre-mutation remediation guards, explicit deep-bank exhaustion, and route-evidence audit correction.

`test-phase2-canonical-entry-boundary.js` scans production JavaScript and fails if a future production module bypasses those policies by importing the internal model/runtime core directly. Tests may still import internals intentionally for adversarial verification.

### 6. Signed scientific generated coverage expanded without changing the fixed benchmark

Line-by-line review of `test-phase2-adaptive-core-generalization.js` confirmed that its fixed 1,786-case population is broad but its generated scientific-notation coefficient set is positive-only.

Rather than change that stable benchmark, `test-phase2-signed-scientific-generalization.js` adds a separate fixed **432-case** signed sweep across:

- conversion to scientific notation;
- scientific multiplication;
- scientific division;
- independent positive/negative coefficient signs;
- multiple exponent combinations.

Every case verifies normalized coefficient magnitude, result sign, reconstructed value, and deterministic planning.

### 7. Computed-output representability protected

Input finiteness does not guarantee output finiteness. Direct source review identified valid-looking finite inputs that could overflow or underflow during planning, including:

- `10^1000 → Infinity`;
- `10^-1000 → 0` through numeric underflow even though the mathematical result is nonzero;
- a numeric negative exponent path producing symbolic `1/Infinity`;
- unit/rate arithmetic overflowing to `Infinity`.

`test-phase2-output-safety.js` was written red first. The canonical model now applies one post-plan representability guard that rejects:

- non-finite numeric answers;
- inverse-log underflow-to-zero;
- symbolic answers containing `Infinity` or `NaN`;
- non-finite scientific-notation components;
- non-finite candidate costs.

Normal-range planner outputs and the fixed generalization populations remain unchanged.

### 8. Static prerequisite graph invariants added

The existing 46-node content contract proved lesson/check availability but did not prove the dependency graph itself was structurally sound.

`test-phase2-prerequisite-graph-invariants.js` now verifies:

- graph key and node ID agree;
- every `dependsOn` target exists;
- no self-dependencies;
- no duplicate dependencies;
- the full prerequisite graph is acyclic.

The current 46-node graph passes these invariants.

## What the adversarial suite actually checks

The adversarial suite was reviewed line by line rather than credited from its filename. It substantively checks:

- accepted Phase 1 strategy policy survives Phase 2 composition;
- unfamiliar correct cases across all six areas;
- formula answers are derived canonically rather than trusted from caller input;
- invalid structures throw before unsafe arithmetic;
- supplied negative-log landmarks appear in the actual plan;
- support-role separation;
- deep prerequisite stack unwind to the exact original problem;
- blocked cross-graph descent leaves active skill, return stack, active path, and prerequisite history unchanged;
- blocked top-level unrelated repair leaves active skill, stack/path, events, owner remediation, and unrelated child-skill creation unchanged.

No hollow assertion was identified in that review.

## What the fixed 1,786-case generalization suite actually checks

The generated suite constructs answers from independent mathematical identities rather than copying classroom keys. It verifies:

- 972 fraction-arithmetic cases;
- 223 algebra cases;
- 332 exponent cases;
- 120 scientific-notation cases;
- 59 log cases;
- 80 unit/rate cases;
- deterministic re-planning;
- non-empty plans;
- explicit prerequisite metadata on every chosen step;
- finite candidate costs;
- exact/near numeric correctness or exact symbolic correctness as appropriate.

Its positive-only scientific coefficient blind spot is now covered by the separate 432-case signed suite rather than changing the stable 1,786 population.

## Remaining human judgments

The source-defect review does **not** claim these pedagogical questions are solved:

1. whether each non-percent canonical route is the best learner-facing strategy rather than merely a correct deterministic strategy;
2. whether each prerequisite graph edge represents the right teaching diagnosis rather than merely a valid acyclic dependency;
3. whether all 46 prerequisite lessons are concise, understandable, and genuinely different across representations for a phone learner;
4. which expanded Phase 2A capabilities belong in Day 1 learner scope versus remediation-only/internal capability;
5. what exact Phase 2B UI interactions constitute trustworthy observed evidence for smaller skills.

Those questions remain the human gate before PR #27 may leave draft and before any Phase 2B live integration work is authorized.
