# Phase 2A Adaptive Math Core — Human Review Handoff

## Status

**HUMAN / SOURCE REVIEW REQUIRED BEFORE PR #27 MAY LEAVE DRAFT.**

This review covers the isolated non-browser Phase 2A core only. It does not authorize `day1/index.html` changes, browser composition, live Math Gym wiring, or removal of the current v8/v9/v10/v13 scripts.

## Confidence table

| Claim | Confidence | Evidence |
|---|---|---|
| Accepted Phase 1 Strategy Engine remains intact | **Runtime-verified** | Phase 1 calibration + 351-case generalization pass inside the Phase 2A CI; adversarial test rechecks `69% of 32` raw formal / chosen `70%-1%` / gap `1.05`. |
| All 31 current classroom math prompts normalize and plan | **Runtime-verified** | `test-day1-problem-source-adapters.js` executes the exact prompt list and reports 31/31 covered. |
| New non-Phase-1 arithmetic is broadly mathematically correct | **Runtime-verified** | `test-phase2-adaptive-core-generalization.js` executes 1,786 identity-generated cases: 972 fraction-arithmetic, 223 algebra, 332 exponent, 120 scientific-notation, 59 log, and 80 unit/rate cases. |
| Invalid planner structures fail before unsafe arithmetic | **Runtime-verified** | Adversarial suite rejects zero denominators, degenerate algebra, invalid negative-exponent inputs, scientific division by zero, NaN coefficients, inconsistent log factors, zero conversion factors, zero rate denominators, and unsupported families. |
| Help me understand is separate from Mental route | **Runtime-verified** | Full-model, runtime, and adversarial tests require Understand to expose concept only, zero worked steps, and no `mentalRoute` text; Mental remains a separate mode. |
| First Step stops after exactly one step | **Runtime-verified** | Full-model and runtime contracts assert `steps.length === 1`. |
| Math remediation returns to the exact original problem | **Runtime-verified** | Runtime contract descends, passes a prerequisite check, and asserts return to the identical original `sourceId`. |
| Generic Student Model fresh-item remediation still exists | **Runtime-verified** | Runtime test proves generic `exitRemediation()` returns a fresh item before the math runtime composes its contextual same-problem resolver. |
| First-level math remediation cannot open an unrelated prerequisite | **Runtime-verified** | Adversarial red/green test requests `log_product_rule` while solving `15% of 80`; runtime blocks it before Student Model remediation, child-skill creation, stack/path mutation, or remediation events. |
| Deep prerequisite routing cannot jump across unrelated graph branches | **Runtime-verified** | Adversarial red/green test: `quartering -> log_product_rule` is blocked and active skill, stack, path, and history remain unchanged. |
| Final-answer correctness does not manufacture prerequisite fluency | **Runtime-verified** | Runtime red/green test proves a bare unaided correct answer remains parent-skill evidence only; smaller route skills are not created or credited by inference. |
| Positive smaller-skill route evidence requires exact observation | **Runtime-verified** | Route fluency requires correct + unaided + `routeVerified:true` + explicit `evidenceSkillIds`; only IDs actually present in the selected route can be credited, arbitrary IDs are ignored, and support blocks credit. |
| Every prerequisite graph node has content/check infrastructure | **Runtime-verified structurally** | 46 graph nodes each have lesson content, worked-example validation, at least two representation records, and at least three fresh checks whose own validators accept their answers. |
| Every prerequisite lesson is pedagogically clear and each representation is meaningfully different | **NOT YET HUMAN-VERIFIED** | Automated structural tests cannot establish teaching quality, cognitive load, or whether two representations feel genuinely different to a learner. |
| The non-percent planner chooses the best possible strategy among alternatives | **NOT CLAIMED** | Most Phase 2A non-percent families currently have one canonical deterministic route, not a Phase-1-style multi-candidate strategy competition. |
| Browser/live behavior is correct | **NOT TESTED IN PHASE 2A** | Deliberately out of scope. No live page files are changed by PR #27. |

## Corrections made during the clean migration

The clean Phase 2A branch was rebuilt from accepted `main` rather than resolving the conflicted historical Phase 2+ branch in place.

Source review, red tests, and targeted fixes found and corrected seven concrete defects/boundary problems:

1. `Help me understand` had reused the optional `mentalRoute`; it now has a separate concept-only contract.
2. Numeric checking used `parseFloat`, so malformed values such as `12abc` could be read as `12`; numeric parsing now consumes the complete input.
3. Unit answers previously inherited that permissive numeric-prefix behavior; a unit-bearing answer may now use only the expected target unit, not arbitrary trailing text or a wrong unit.
4. The formula checker accepted `p-2l/2` as equivalent to `(p-2l)/2`; it no longer does because normal precedence makes `p-2l/2 = p-l`.
5. Once inside a prerequisite node, the router could descend to any graph node that existed. It now requires deeper descent to follow the current node's explicit `dependsOn` edge and blocks unrelated jumps without mutating remediation state.
6. A correct unaided final answer previously credited every prerequisite ID named anywhere in the selected teaching plan. That overstated learner evidence because a final answer does not prove which route was used or that optional steps such as `substitution_check` or `magnitude_prediction` were performed. Final-answer correctness now remains parent-skill evidence only unless route execution and exact observed smaller skills are explicitly verified.
7. The first remediation request previously accepted any prerequisite node that existed, so a future controller could open a log repair while the learner was solving a percent problem. First-level remediation is now restricted to prerequisite IDs actually emitted by the selected route and is blocked before any remediation state mutation when unrelated.

## Representative source-review sample

These are intentionally not all current classroom fixtures. They exercise unfamiliar values or architecture boundaries and are useful for judging whether the teaching route itself is appropriate, not merely mathematically correct.

| Area | Problem / condition | Current canonical result or behavior | What to judge |
|---|---|---|---|
| Fractions | `7/12 + 5/18` | common denominator route, answer `31/36` | Is the common-denominator explanation concise enough without skipping why equal-sized pieces matter? |
| Algebra | `2x + 11 = 5x - 4` | keeps remaining coefficient positive, answer `5` | Is "move the smaller x-term" a good default teaching heuristic? |
| Algebra formula | `P = 2l + 2w`, isolate `w` | `(P-2l)/2`; `P/2-l` accepted as equivalent | Is the symbolic sequence appropriate for Day 1 readiness, or should this remain later-only content? |
| Exponents | `b^3 / b^5` | `b^-2` | Should the route stop there or automatically connect a negative exponent to reciprocal form in the same lesson? |
| Exponents | `3^-3` | `1/27` | Is reciprocal meaning explained before evaluation clearly enough? |
| Scientific notation | `987000` | `9.87 × 10^5` | Does coefficient-first → count shifts → sign create the lowest cognitive load? |
| Scientific notation | `(6×10^-2)/(1.5×10^3)` | `4×10^-5` | Is coefficient/exponent separation sufficiently explicit when subtracting a positive exponent from a negative one? |
| Logs | `log(0.001)` | `-3` through inverse power-of-ten relationship | Is this understandable without prior exponent confidence, or should exponent remediation be more visible? |
| Logs | estimate `log(15)` from supplied `log(3)` and `log(5)` | factor → product rule → add landmarks | Is product-rule teaching justified on Day 1, or too advanced relative to the readiness goal? |
| Units | unfamiliar single conversion | predict magnitude → state relationship → cancel units → calculate → check | Is magnitude prediction useful support or unnecessary overhead on easy conversions? |
| Rate | rate × duration | interpret rate → multiply by time → cancel time → simplify | Does this sequence teach dimensional meaning rather than merely an algorithm? |
| Prerequisite routing | parent → `quartering` → `halving` | repair deepest missing node, unwind one level at a time, return to exact parent problem | Is that repair depth appropriate, and are any graph edges pedagogically missing or unnecessary? |
| Evidence | correct `15% of 80` final answer | parent percent skill gets correctness evidence; no halving/divide-by-10 fluency is inferred unless those exact route steps are observed | Is this evidence discipline strict enough, and what future UI interactions count as genuine observation? |

## Open human-review questions

### 1. Canonical route versus strategy competition

Phase 1 needed a cost-ranked candidate library because percentages have many genuinely competing mental routes. Most new Phase 2A families currently have one canonical route. Human review should decide whether that is correct for the Day 1 scope or whether any family needs multiple route candidates before browser integration.

Do not add alternatives merely for architectural symmetry. Add them only where two approaches are genuinely plausible for a learner and choosing between them matters.

### 2. Prerequisite graph quality

The graph is now mechanically guarded at both levels: first repair must come from the selected route, and deeper repair must follow `dependsOn`. Its *edges* still need human review. The question is not whether a referenced node exists. The question is whether failure at the parent skill really justifies descending to that child skill.

Review especially cross-topic support such as:

- scientific notation -> exponent meaning / place value;
- logs -> exponent landmarks;
- unit magnitude prediction -> estimation;
- proportional algebra -> fraction/division meaning.

### 3. Prerequisite content quality

The 46-node content contract proves availability and self-consistency, not teaching quality. Review should look for:

- circular explanations;
- representations that are different in name but not cognitively different;
- examples harder than the prerequisite they are supposed to repair;
- language that presumes the very concept being taught;
- too much text for a phone learner;
- checks that only copy the worked example's surface pattern.

### 4. Day 1 scope discipline

The full core can plan formula rearrangement and some log/product-rule reasoning. Capability does not automatically mean every family belongs in the learner-facing Day 1 sequence. The later integration gate should distinguish:

- content required by the frozen/current classroom;
- useful remediation capability;
- internal stress-test capability;
- content that should remain unavailable to the learner until later.

### 5. Personalization evidence

Phase 2A no longer infers prerequisite fluency from a whole-problem answer. Positive smaller-skill route evidence is only possible when a future integration layer explicitly verifies route execution and names the exact observed route skills, while targeted prerequisite checks continue to provide direct smaller-skill evidence.

Human review should now focus on the **observation contract for Phase 2B**: which learner actions genuinely demonstrate `halving`, `divide_by_10`, `substitution_check`, magnitude prediction, cancellation, and similar skills, versus actions that merely coexist with a correct answer.

The future browser/controller must not award route evidence simply because it displayed a step or because the learner eventually reached the correct final answer.

## Current CI evidence

Exact code head `e4234844bca56d17b3be35639d0ff8e72635e549` completed GitHub Actions run **#274** successfully before this documentation-only update. That run passed:

- complete pre-existing repository suite;
- accepted Phase 1 calibration and 351-case generalization;
- Phase 2A syntax checks;
- full adaptive model/support contract;
- all 31 classroom source-adapter cases;
- strict answer-checker regressions;
- prerequisite-content contract across 46 nodes;
- adaptive runtime, same-problem remediation, and strict route-evidence contract;
- unfamiliar/adversarial core contract including first-level and deep graph guards;
- generated 1,786-case correctness/determinism suite;
- final Day 1 academic/voice release audit.

Passing CI is necessary but not sufficient for Phase 2A acceptance. The next gate is direct human/source review of the routes, graph, evidence boundaries, and teaching content named above.
