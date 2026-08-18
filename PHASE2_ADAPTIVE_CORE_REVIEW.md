# Phase 2A Adaptive Math Core — Human Review Handoff

## Status

**AUTOMATED / SOURCE-AUDIT GATE COMPLETE; DIRECT HUMAN REVIEW REQUIRED BEFORE PR #27 MAY LEAVE DRAFT.**

This review covers the isolated non-browser Phase 2A core only. It does not authorize `day1/index.html` changes, browser composition, live Math Gym wiring, or removal of the current v8/v9/v10/v13 scripts.

## Confidence table

| Claim | Confidence | Evidence |
|---|---|---|
| Accepted Phase 1 Strategy Engine remains intact | **Runtime-verified** | Phase 1 calibration + 351-case generalization run inside Phase 2A CI; adversarial contract rechecks `69% of 32` raw formal / chosen `70%-1%` / gap `1.05`. |
| All 31 current classroom math prompts normalize and plan | **Runtime-verified** | `test-day1-problem-source-adapters.js` executes the exact current prompt list. |
| New non-Phase-1 arithmetic is broadly mathematically correct | **Runtime-verified** | Fixed generated population of 1,786 cases: 972 fraction-arithmetic, 223 algebra, 332 exponent, 120 scientific-notation, 59 log, and 80 unit/rate cases. |
| Invalid planner structures fail before unsafe arithmetic | **Runtime-verified** | Adversarial contract rejects zero denominators, degenerate algebra, invalid exponent inputs, scientific division by zero, NaN coefficients, inconsistent log factors, invalid conversion/rate factors, unsupported families, and missing landmark routes. |
| Help me understand is separate from Mental route | **Runtime-verified** | Understand exposes concept only, zero worked steps, no `mentalRoute`; Mental remains separate. |
| First Step stops after exactly one step | **Runtime-verified** | Full-model/runtime contracts assert one actionable step. |
| Math remediation returns to the exact original problem | **Runtime-verified** | Runtime descends, verifies prerequisite repair, and returns the identical original `sourceId`. |
| Generic Student Model fresh-item remediation still exists | **Runtime-verified** | Generic `exitRemediation()` behavior is tested before the math-specific runtime policy is composed. |
| First-level remediation cannot open an unrelated prerequisite | **Runtime-verified** | A log repair request during `15% of 80` is blocked before Student Model remediation, child-skill creation, stack/path mutation, or remediation events. |
| Deep prerequisite routing cannot jump across unrelated graph branches | **Runtime-verified** | `quartering -> log_product_rule` is blocked with no state mutation. |
| Final-answer correctness does not manufacture prerequisite fluency | **Runtime-verified** | Bare correct final answer remains parent-skill evidence only. |
| Positive smaller-skill route evidence requires exact observation | **Runtime-verified** | Requires correct + unaided + `routeVerified:true` + explicit route-constrained `evidenceSkillIds`; support blocks credit. |
| Negative-log estimation is human-doable rather than calculator-smuggled | **Runtime-verified** | Current `−log(6×10^-6)` route explicitly uses `log2≈.30`, `log3≈.48`, builds `.78`, subtracts, then rounds. Missing landmarks are rejected. |
| Day 1 exact-log families stay on power-of-ten landmarks | **Runtime-verified** | `exact_log10` rejects arbitrary non-power-of-ten values; `inverse_log10` rejects fractional exponents. |
| Scientific-notation signed definition is consistent | **Runtime-verified** | Conversion, multiplication, division, coefficient-range remediation, and normalization remediation use `1 ≤ |coefficient| < 10`; negative checks are included. |
| Safe equivalent exponent forms are accepted | **Runtime-verified** | `b^-2` = `1/b^2`, `x^0` = `1`, `a^1` = `a`; checker remains intentionally non-CAS. |
| No-op learner steps are removed when provably unnecessary | **Runtime-verified** | Already-reduced fraction omits fake reduction; reducible result retains it; cost is recomputed after compression. |
| Every prerequisite graph node has content/check infrastructure | **Runtime-verified structurally** | 46 graph nodes each have lesson content, worked-example validation, representation records, and at least three checks whose validators accept their own answers. |
| Phase 2A has not changed the live classroom | **Runtime-verified by CI file contract** | `test-phase2a-no-live-integration.js` rejects Phase 2A references in `day1/index.html` and confirms the current v8/v9/v10/v13 stack remains present. |
| Every prerequisite lesson is pedagogically excellent and every representation is cognitively distinct | **NOT YET HUMAN-VERIFIED** | Structural tests/source audit cannot establish learner comprehension or phone-level cognitive load for all 46 nodes. |
| The non-percent planner chooses the best possible strategy among alternatives | **NOT CLAIMED** | Most new families currently have one canonical deterministic route, not a Phase-1-style strategy competition. |
| Browser/live behavior of Phase 2A is correct | **NOT TESTED / NOT INTEGRATED** | Deliberately deferred to Phase 2B. |

## Source-audit defects corrected

The clean branch was rebuilt from accepted `main`; the conflicted historical Phase 2+ branch was not merged or conflict-resolved wholesale.

Direct source review, red tests, and targeted fixes corrected these concrete defects/boundaries:

1. **Understand vs Mental:** `Help me understand` had reused `mentalRoute`; it now remains concept-only.
2. **Malformed numeric answers:** `parseFloat` allowed `12abc` to behave like `12`; numeric parsing now consumes the full input.
3. **Unit suffixes:** unit-bearing answers now allow the expected target unit, not arbitrary/wrong trailing text.
4. **Formula precedence:** `p-2l/2` is no longer accepted as `(p-2l)/2`; `P/2-l` remains accepted because it is equivalent.
5. **Deep graph jumps:** a prerequisite node could jump to any other existing node; deeper descent now follows explicit `dependsOn` edges and blocked jumps are side-effect free.
6. **Over-crediting learner evidence:** one correct final answer previously credited every prerequisite named in the selected plan. Final correctness is parent-skill evidence only unless exact route execution is explicitly observed.
7. **Top-level unrelated remediation:** any existing node could be opened as the first repair. First repair must now belong to the selected route and is rejected before remediation state changes if unrelated.
8. **Negative-log calculator smuggling:** `−log(6×10^-6)` told the learner to estimate but inserted exact `Math.log10(6)` internally. The route now uses explicit `2×3` landmarks, obtains `.78`, computes `5.22`, and rounds to `5.2`.
9. **Exact-log scope leak:** arbitrary `log(3)` / fractional inverse exponents could enter “exact” families and trigger calculator-only work. Exact families are now integer power-of-ten landmarks only.
10. **Two-sided algebra wording:** negative coefficient moves could say “Subtract -4x.” Copy now says the equivalent human operation, e.g. “Add 4x.”
11. **Negative-exponent wording:** standalone negative powers referred to moving a factor across a fraction bar that did not exist. The route now explicitly rewrites the current power as a reciprocal first.
12. **Scientific signed-domain contradiction:** top-level and prerequisite copy previously used a positive-only coefficient range in some paths. All canonical scientific conversion/multiply/divide/normalization teaching now uses absolute value and preserves sign.
13. **Symbolic exponent equivalence:** expanded quotient cases could mark `1/b^2` wrong when the canonical output was `b^-2`; safe taught identities are now accepted.
14. **No-op fraction reduction:** already-reduced answers could end with “Reduce 7/12 to 7/12.” The no-op step and false simplification prerequisite are removed; route cost is recalculated.
15. **CI scope drift risk:** Phase 2A now has an explicit non-live contract so a future edit cannot quietly load the new core into `day1/index.html` before Phase 2B.

## Representative human-review sample

The remaining review questions are pedagogical/scope judgments, not known arithmetic defects.

| Area | Problem / condition | Current canonical behavior | Human judgment still needed |
|---|---|---|---|
| Fractions | `7/12 + 5/18` | common-denominator route, simplify only if needed | Is the explanation concise enough while still teaching why equal-sized pieces are required? |
| Algebra | `2x + 11 = 5x - 4` | chooses the move that keeps the remaining x coefficient positive | Is that the best default heuristic for this learner, or should alternate algebra routes be available? |
| Algebra formula | `P = 2l + 2w`, isolate `w` | `(P-2l)/2`; equivalent `P/2-l` accepted | Does formula rearrangement belong in Day 1 learner-facing scope or only internal/remediation capability? |
| Exponents | `b^3 / b^5` | canonical answer `b^-2`; reciprocal equivalent accepted | Should teaching automatically continue from `b^-2` to `1/b^2`, or stop at the quotient-rule result? |
| Scientific notation | `(6×10^-2)/(1.5×10^3)` | separate coefficient/exponent work, signed normalization | Is the sequence sufficiently explicit when subtracting a positive exponent from a negative exponent? |
| Logs | `log(0.001)` | inverse power-of-ten relationship | Should exponent remediation be surfaced more aggressively before this skill? |
| Logs | estimate `log(15)` from supplied `log(3)` and `log(5)` | factor → product rule → add landmarks | Is product-rule estimation appropriate Day 1 content or later/internal capability? |
| Units | easy single conversion | predict magnitude → relationship → cancel → calculate/check | Is magnitude prediction helpful on every easy conversion or unnecessary overhead? |
| Rate | rate × duration | interpret rate → multiply by duration → cancel time → simplify | Does this feel meaning-first rather than algorithm-first? |
| Graph | parent → `quartering` → `halving` | repair deepest verified dependency and unwind to exact parent | Are any graph edges too deep, missing, or unnecessary? |
| Evidence | correct `15% of 80` final answer | parent correctness only unless exact smaller route actions are observed | Which Phase 2B UI actions count as genuine observation of halving/divide-by-10/etc.? |

## Open human-review questions

### 1. Canonical route versus strategy competition

Phase 1 needed multiple cost-ranked percent routes. Most Phase 2A families currently use one canonical route. Do not add alternatives for symmetry; add them only where real learner choice matters.

### 2. Prerequisite graph quality

Mechanical guards are now strong, but the educational meaning of the edges still requires review. Focus especially on scientific notation ↔ exponent/place-value support, logs ↔ exponent landmarks, unit magnitude prediction ↔ estimation, and proportion ↔ fraction/division meaning.

### 3. Prerequisite content quality

All 46 nodes are structurally complete, but human review should look for circular explanations, pseudo-different representations, examples harder than the prerequisite, language that assumes the concept, excessive phone text, and checks that merely clone the worked example pattern.

### 4. Day 1 scope discipline

Capability does not equal learner-facing scope. Classify formula rearrangement, log product-rule estimation, and any other expanded family as one of: required Day 1 content, remediation capability, internal stress-test capability, or later content.

### 5. Phase 2B observation contract

The core intentionally refuses to infer route skill evidence. Browser integration must define which explicit learner actions genuinely demonstrate `halving`, `divide_by_10`, `substitution_check`, magnitude prediction, cancellation, and related skills. Displaying a step or eventually getting the final answer correct is not enough.

## Automated evidence baseline

The exact current documentation head must complete CI before this handoff is considered final. The immediately preceding code heads have passed the complete repository suite plus:

- accepted Phase 1 calibration and 351-case generalization;
- Phase 2A module syntax checks;
- 31/31 current classroom source coverage;
- strict answer checker and safe symbolic equivalence;
- structural prerequisite-content validation across 46 nodes;
- adaptive runtime, same-problem remediation, route/graph guards, and strict evidence contracts;
- unfamiliar/adversarial six-area coverage;
- fixed 1,786-case generated correctness/determinism suite;
- explicit-landmark and exact-log scope contracts;
- cognitive-load no-op contract;
- learner-facing algebra/exponent/scientific language and prerequisite-definition consistency;
- non-live integration contract;
- final Day 1 academic/voice release audit.

Passing these gates is necessary but not sufficient for acceptance. PR #27 must remain draft until the direct human/source review above is completed.
