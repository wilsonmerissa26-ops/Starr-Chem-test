# Phase 2A Adaptive Math Core Specification

## Status

**DRAFT GATE. IMPLEMENTATION MAY PROCEED ON THE ISOLATED PHASE 2A BRANCH. LIVE DAY 1 INTEGRATION IS NOT AUTHORIZED BY THIS DOCUMENT.**

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

## Required support-control separation

All support controls must consume the same chosen strategy, but they have different jobs:

- `hint`: clue only; no solution steps and no answer.
- `understand`: concept/strategy explanation only; no answer, no worked steps, and **must not reuse the `mentalRoute` field as its explanation**.
- `first_step`: exactly one actionable step, then stop.
- `walkthrough`: interactive/full ordered steps from the selected plan.
- `mental`: optional alternate mental-route wording. It is not remediation and is never substituted for `understand`.

Tests must prove these roles remain separate.

## Prerequisite routing requirements

The core may descend from a current problem into an explicitly named prerequisite only when that node exists in the graph.

Required invariants:

- preserve the exact original problem during descent;
- push an explicit return stack;
- block recursive prerequisite loops;
- allow deeper prerequisite descent when a prerequisite check itself fails repeatedly;
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

Phase 2A may connect demonstrated learner fluency to the already-existing bounded `studentFluencyAdjustment` seam. It must not create an unbounded or renderer-owned personalization score.

Rules:

- Student Model evidence is the source of the fluency map;
- positive route-level fluency is credited only after an unaided correct solution;
- use of support blocks unaided route-fluency credit for that attempt;
- a wrong whole-problem answer does not automatically identify which prerequisite failed;
- targeted prerequisite checks provide negative prerequisite evidence;
- raw arithmetic candidate costs and learner-facing chosen strategy remain inspectable.

## Answer-checker requirements

Validation must be strict enough that malformed trailing text cannot be accepted merely because it begins with a valid number.

Required checks include:

- numeric and percent inputs;
- equivalent fractions;
- symbolic exponent forms;
- scientific notation and numeric scientific equivalents where intentionally allowed;
- absolute tolerances for estimation families;
- unit-bearing numeric answers where units are display text;
- symbolic formula rearrangements only when mathematically equivalent.

Explicit regressions:

- reject numeric junk such as `12abc`;
- reject algebraically non-equivalent rearrangements such as `p-2l/2` for `w=(P-2l)/2`.

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

Phase 2A review must include representative unfamiliar cases from every area, not only current classroom examples.

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

Browser composition, Math Gym live evidence wiring, controller behavior, and `day1/index.html` cutover belong to a later Phase 2B integration gate.

## Phase 2A acceptance gate

Before Phase 2A can be accepted into `main`:

1. all new core modules syntax-check;
2. full-model planner contract passes;
3. all 31 classroom source-adapter cases pass;
4. strict answer-checker contract passes, including malformed-input regressions;
5. every prerequisite graph node passes teaching/check-content validation;
6. adaptive runtime same-problem remediation and anti-loop contracts pass;
7. support-role separation tests pass;
8. representative unfamiliar/adversarial cases across all six areas pass;
9. the complete existing repository CI remains green;
10. human/source review finds no unacceptable planning or teaching pattern.

Only after that gate is passed should a separate Phase 2B browser/live integration review begin.
