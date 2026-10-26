# AStarryia iPad Learning App — Fall 2026

## Launch
Open the repository GitHub Pages route `/student-app/` in Safari on her iPad. Share → Add to Home Screen → Add. The app links to `/unit3-coach/`, `/course-hub/`, and all nine original readiness days without modifying their progress stores.

## Current subjects
- CHM 221 Organic Chemistry. Fall 2026 Dr. Meadows schedule, Unit 3 source-aligned coach, original foundational program, dated exam/study tasks. Test 3 Oct 27; Test 4 Nov 19; Test 5 & Final Exam Dec 10 at 7 PM. The syllabus schedule is tentative; Canvas and instructor announcements take precedence.
- BIO 131 Anatomy & Physiology I. Fall 2026 section 008 syllabus. Exam 3 Nov 17; Lab Practical 2 Dec 2; cumulative final Dec 7 from 7–10 PM.
- Named user-created subjects via the Planner. No fabricated school deadlines.

## Labels
"CHM 221 syllabus" and "BIO 131 syllabus" are scheduled class events, which remain subject to instructor/Canvas changes. "Coach suggestion" is a recommended study date, not an official assignment deadline. The user must check Canvas for actual assignment/quiz due times.

## Persistence boundary
Tasks and completion records are local to this browser/home-screen app. IndexedDB is primary, localStorage is a best-effort snapshot, and JSON export/import is available. Do not claim cross-device sync or certification without a physical iPad test. Do not assume Safari and an installed home-screen app share storage. Existing Nine-Day Course Hub lesson evidence is not migrated or overwritten by this app.

## Real iPad acceptance test
1. Add home screen icon from Safari.
2. Launch from Home Screen and confirm Today, Calendar, Subjects, Study and Planner are visible without horizontal scrolling.
3. Mark a practice task done and create a uniquely named new class; close/reopen; confirm both persist.
4. Export JSON backup, save in Files, then verify restore on a fresh test install (never overwrite valued student work without a backup).
5. Test navigation to Unit 3 Coach and old foundation program, including back navigation and accessibility.
6. Confirm no web access when offline: planner shell loads cached; cross-folder lessons need network unless they were separately cached.

This is study support, not an assignment-completion service. CHM 221 syllabus states that generative AI may not be used to complete assignments unless explicitly authorized by the instructor.


## Unified chemistry classroom (live integration)
- In the Learning App select **Chemistry**. Unit 3 opens in an embedded same-origin classroom; the original standalone coach remains accessible.
- Quiz results are stored under the existing `astarryia-unit3-v1` localStorage key and are read by the Learning App. The coach also sends same-origin, iframe-source-verified messages for immediate updates.
- Actual correct/incorrect answers update an eight-module practice evidence display and generate up to two dated adaptive recommendations in **Today**, **Subjects**, and **Calendar**.
- Only a question's first-ever answer counts as practice evidence; retakes, and questions seen before the evidence system existed, count as practice only. A module shows strong first-try evidence after at least 4 first-try answers at 80% or better. This is not mastery and does not verify handwritten mechanisms. Cumulative practice totals remain intact.
- Earlier nine-day foundation progress keys are never overwritten and do not get falsely credited by Unit 3 quiz scores.
- An embedded lesson may need a network connection even when the planner's offline shell is cached. This version does not sync across devices or send grades to Canvas.
- Run `node test-student-chemistry-integration.js` and confirm the AStarryia Unified Student App Tests workflow passes after changes.
