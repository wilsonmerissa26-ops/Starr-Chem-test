# Phase 2A Adaptive Math Core Specification

## Status

**DRAFT GATE. CORE IMPLEMENTATION AND AUTOMATED SOURCE-AUDIT CONTRACTS MAY PROCEED ON THE ISOLATED PHASE 2A BRANCH. LIVE DAY 1 INTEGRATION IS NOT AUTHORIZED BY THIS DOCUMENT.**

Phase 1, the standalone fractions/percentages Strategy Engine, is accepted on `main` and is consumed as a dependency. Phase 2A must not fork, replace, or silently retune the accepted Phase 1 scorer or reviewed formal-versus-mental selection policy.

## Purpose

Build and verify the non-browser adaptive math core required for the Day 1 foundation reset across all six current math areas:

- fractions and percentages
- algebra
- exponents
- scientific notation
- logs
- unit conversions

The goal of Phase 2A is a trustworthy pure-logic model that can later be integrated into the learner-facing page through a separate browser/live gate.

## Architecture ownership

1. **Accepted Phase 1 Strategy Engine** owns candidate generation/ranking for its supported fractions/percentages families.
2. **Adaptive Math Model** owns deterministic planning for the additional Day 1 math families and the explicit prerequisite graph.
3. **Student Model** remains the learner-evidence/state source of truth.
4. **Math remediation policy** may add an explicit same-original-problem resolution path without deleting the generic Student Model fresh-item remediation behavior used by other contexts.
5. **Prerequisite Content** owns prerequisite teaching representations and check banks; the graph alone is not remediation.
6. **Problem Source Adapters** normalize source-specific inputs. The core must not scrape runtime Markdown or turn structured Math Gym data into display text and parse it back.
7. **Answer Checker** performs deterministic answer validation. DOM/renderers must not decide correctness.
8. **Teaching Copy / Route Efficiency policy** may repair learner-facing wording or remove provable no-op steps, but must not secretly change mathematical answers or invent a new route.

## Required support-control separation

All support controls must consume the same chosen strategy, but they have different jobs:

- `hint`: clue only; no solution steps and no answer.
- `understand`: concept/strategy explanation only; no answer, no worked steps, and **must not reuse the `mentalRoute` field as its explanation**.
- `first_step`: exactly one actionable step, then stop.
- `walkthrough`: interactive/full ordered steps from the selected plan.
- `mental`: optional alternate mental-route wording. It is not remediation and is never substituted for `understand`.

Tests must prove these roles remain separate.

## Prerequisite routing requirements

The core may descend from a current problem into an explicitly named prerequisite only when that node exists in the graph **and the routing relationship is justified by the selected route or by an explicit graph edge**.

Required invariants:

- preserve the exact original problem during descent;
- push an explicit return stack;
- block recursive prerequisite loops;
- the **first** remediation target must be one of the prerequisite skills actually named by the selected problem route;
- a rejected first-level target must be blocked **before** Student Model remediation opens, before a child skill is created, before the return stack/path changes, and before a remediation event is emitted;
- once inside a prerequisite node, deeper descent must follow that node's explicit `dependsOn` edges rather than jump to any node that merely exists;
- blocked deeper cross-graph jumps must be side-effect free;
- allow deeper prerequisite descent when a prerequisite check itself fails repeatedly and a valid dependency edge exists;
- require a passed prerequisite check before returning;
- return to the exact original math problem after repair, not silently advance to a different math item;
- retain the generic Student Model fresh-item remediation exit for non-math contexts.

Every graph node that can be descended into must have:

- a concept/title;
- an explanation of why it works;
- at least two genuinely different representations;
- a worked example whose validator accepts its own answer;
- at least three unique fresh check items whose validators accept their own answers.

## Learner evidence and personalization

Phase 2A may connect **demonstrated** learner fluency to the already-existing bounded `studentFluencyAdjustment` seam. It must not create an unbounded or renderer-owned personalization score, and it must not infer smaller-skill fluency from a whole-problem answer alone.

Rules:

- Student Model evidence is the source of the fluency map;
- a correct final answer is evidence for the parent problem skill, but **does not prove which route the learner used**;
- prerequisite IDs present in a teaching plan are potential evidence targets, not proof that those prerequisite skills were demonstrated;
- positive smaller-skill route fluency requires all of the following:
  - the whole problem was answered correctly;
  - no support was used and the attempt is not marked assisted;
  - route execution was explicitly verified;
  - the integration layer names the exact observed `evidenceSkillIds`;
  - each credited ID is actually part of the selected route;
- `routeVerified:true` without exact observed skill IDs awards no smaller-skill fluency;
- arbitrary or non-route skill IDs supplied by a future renderer/controller must be ignored;
- use of support blocks unaided route-fluency credit for that attempt even if later route steps are observed;
- a wrong whole-problem answer does not automatically identify which prerequisite failed;
- targeted prerequisite checks provide the specific prerequisite evidence used for remediation decisions;
- raw arithmetic candidate costs and learner-facing chosen strategy remain inspectable.

## Answer-checker requirements

Validation must be strict enough that malformed trailing text cannot be accepted merely because it begins with a valid number.

Required checks include:

- numeric and percent inputs;
- equivalent fractions;
- scientific notation and numeric scientific equivalents where intentionally allowed;
- absolute tolerances for estimation families;
- unit-bearing numeric answers where units are display text;
- symbolic formula rearrangements only when mathematically equivalent;
- safe equivalent exponent identities that the course actually teaches, without pretending to be a general computer-algebra system.

Explicit regressions:

- reject numeric junk such as `12abc`;
- reject algebraically non-equivalent rearrangements such as `p-2l/2` for `w=(P-2l)/2`;
- accept `b^-2` and `1/b^2` as equivalent;
- accept `x^0` and `1` as equivalent in the supported nonzero-base exponent-rule context;
- accept `a^1` and `a` as equivalent.

## Human-doable log requirements

Day 1 log planning must never describe an estimate while silently inserting calculator precision.

Rules:

- `exact_log10` is limited to integer powers of ten;
- `inverse_log10` is limited to integer exponents;
- arbitrary values such as `log(3)` require an explicit estimation/landmark capability rather than hidden `Math.log10(3)` work;
- negative-log estimation must carry explicit learner-usable landmark evidence;
- for the current `−log(6×10^-6)` classroom problem, the source carries `6 = 2 × 3`, `log(2)≈0.30`, `log(3)≈0.48`, builds `log(6)≈0.78`, computes `6−0.78=5.22`, then rounds to `5.2`;
- a negative-log estimate with no explicit usable landmark route must fail rather than fall back to calculator precision.

## Teaching-definition consistency

A top-level route and its prerequisite remediation content must not teach conflicting definitions.

Required examples:

- scientific notation uses **`1 ≤ |coefficient| < 10`** across conversion, multiplication, division, and normalization prerequisite lessons; negative coefficients are valid and their sign is preserved;
- a negative exponent is introduced as a reciprocal transformation, not as “move the factor across the fraction bar” when no fraction bar exists;
- two-sided algebra with a negative term names the human operation directly, e.g. “Add 4x,” rather than “Subtract -4x.”

## Cognitive-load / no-op requirements

A canonical route must not force a step that provably changes nothing merely because a generic algorithm contains that step.

- an already-reduced fraction must not display or credit a fake “reduce `7/12` to `7/12`” step;
- a genuinely reducible fraction keeps its simplification step;
- when a no-op step is removed, operation-count features and candidate cost must be recomputed so the audit trail matches the learner-facing route;
- wording-only teaching corrections must not alter answers, route IDs, prerequisite metadata, or mathematical selection.

## Current source coverage gate

All 31 current learner-facing classroom math problems must normalize into a supported structured family and produce a deterministic non-empty plan with prerequisite metadata.

The source-coverage test must preserve the exact problem list in code so future changes are reviewable.

## Mathematical correctness and determinism

For every supported problem family:

- planner inputs must be validated;
- chosen answers must be mathematically correct;
- repeated planning of the same problem/state must be deterministic;
- every emitted step must carry an explicit prerequisite-skill list, even when empty;
- invalid/unsupported families must fail explicitly rather than falling through to an unrelated route.

Phase 2A also maintains a fixed 1,786-case generated correctness/determinism population for the non-Phase-1 families, in addition to the accepted Phase 1 351-case suite and the exact 31 classroom prompts.

## Non-goals for Phase 2A

Phase 2A does **not**:

- modify `day1/index.html`;
- load any new browser scripts on the learner-facing page;
- replace/remove v8, v9, v10, or v13 from the live script list;
- wire the browser controller;
- wire Math Gym UI evidence into the live runtime;
- alter current deployed learner behavior;
- merge the quarantined Phase 2+ branch wholesale;
- claim live integration readiness merely because Node tests pass.

CI must explicitly verify that Phase 2A modules remain absent from `day1/index.html` until Phase 2B.

Browser composition, canonical answer-checker wiring, explicit route-observation/evidence wiring, Math Gym live evidence wiring, controller behavior, and `day1/index.html` cutover belong to a later Phase 2B integration gate.

## Phase 2A acceptance gate

Before Phase 2A can be accepted into `main`:

1. all new core/policy modules syntax-check;
2. CI proves Phase 2A remains non-live;
3. full-model planner contract passes;
4. all 31 classroom source-adapter cases pass;
5. strict answer-checker contract passes, including malformed-input and safe symbolic-equivalence regressions;
6. every prerequisite graph node passes teaching/check-content validation;
7. adaptive runtime same-problem remediation, selected-route first-descent, graph-edge descent, and anti-loop contracts pass;
8. support-role separation tests pass;
9. learner-evidence tests prove that final-answer correctness cannot manufacture prerequisite fluency and that only explicitly observed route skills can be credited;
10. representative unfamiliar/adversarial cases across all six areas pass;
11. the fixed 1,786-case generated mathematical correctness/determinism population passes;
12. exact-log / explicit-landmark scope tests pass;
13. cognitive-load no-op tests pass;
14. learner-facing teaching-language and prerequisite-definition consistency tests pass;
15. the complete existing repository CI remains green;
16. direct human/source review finds no unacceptable planning, graph, evidence, scope, or teaching pattern.

Only after that gate is passed should a separate Phase 2B browser/live integration review begin.
