# AStarryia Learning System: Shared Learning Record and Two Teaching Pilots

Status: development branch `learning-pilots-ab`. Not deployed. Built on top of the backup branch (PR #107), which must be merged first.

Tests: `test-learning-pilots.py` (104 real-browser checks on synthetic data). Images: `tools/build-ap-images.py`.

## 1. Scope and constraints

- Keep the current layout: Home, Classes, Calendar, Planner. No new tabs or menus. Pilot lessons open inside the existing in-app lesson screen, reached from buttons on the existing Chemistry and A&P cards.
- One shared learning record for every course. Each course keeps its own teaching and assessment methods.
- Never infer mastery from confidence, repetition, or viewing a lesson.
- Preserve existing learning history. Nothing existing is deleted, renamed or overwritten.
- Course sources: CHM 221 uses Klein, *Organic Chemistry*, 5th ed. BIO 131 uses Amerman, *Human Anatomy and Physiology*, 3rd ed.
- Content waiting on instructor files is labeled "Preparatory" in the app until checked:
  - Chemistry: Dr. Meadows' Chapter 8 SLOs (not yet supplied).
  - A&P: Dr. Granger's official Lab Practical 2 structure list (not yet supplied).

## 2. Phase A: shared learning record

### 2.1 Storage

IndexedDB database `astarryia-learning-record-v1`, version 1, with three object stores. The shared record lives here.

| Store | Key | Contents |
|---|---|---|
| `events` | `id` | One record per learning event. Append-only: an event is never changed or deleted. |
| `meta` | key | Schema version and migration log. |
| `quarantine` | `id` | Invalid events found during import. Kept for inspection, never used as evidence. |

Every write adds a new event with a unique ID, so two tabs can never overwrite each other. Whether an attempt is a first attempt is decided inside the same IndexedDB read-write transaction that saves it. IndexedDB runs overlapping read-write transactions one at a time, so two tabs cannot both record a "first" attempt for the same item.

A `BroadcastChannel` message tells other open tabs to refresh after each write.

If IndexedDB cannot be opened, each event is saved under its own browser-storage key, `astarryia-lr-pending-<id>`. On the next successful open, pending events are copied into IndexedDB, and each copy is confirmed before its pending key is removed.

### 2.2 Event schema (version 1)

| Field | Type | Meaning |
|---|---|---|
| `id` | string | Unique, for example `ev-<time>-<random>`. Migrated events use fixed IDs, so importing twice never duplicates them. |
| `schema` | 1 | Schema version of this event. |
| `course` | `CHM221` or `BIO131` | Course. |
| `objectiveId` | string | For example `chm221.ch8.hx-addition` or `bio131.ch9.head-neck-id`. |
| `objectiveSource` | `instructor`, `textbook-prep` or `legacy` | Whether the objective is confirmed against instructor files. |
| `itemId`, `itemVersion` | string, integer | The question or activity. A new version counts as a new item. |
| `activity` | `teach`, `example`, `guided`, `check`, `independent`, `review` | What kind of activity produced the event. |
| `attempt` | `first`, `repeat` or `none` | Set by the store at write time. `none` is used for viewing. |
| `correct` | true, false or null | null for viewing. |
| `errorType` | string or null | Misconception code, for example `regio-less-stable-cation` or `lookalike-masseter-buccinator`. |
| `response` | small object | The answer itself: tapped atom IDs, typed name, chosen option. |
| `assistance` | `{hints, guided, reteachSeen, answerShown}` | Help received before answering. |
| `unfamiliar` | boolean | The item was never used in teaching, examples or guided practice. |
| `independent` | boolean | Set by the store: `true` only for a first attempt on an unfamiliar item with no assistance. |
| `at` | ISO time | When it happened. |
| `statusAfter`, `reviewDueAfter` | string, date | Snapshot of the evidence status and review date right after this event, kept for history. |
| `source` | string | The page that wrote it, for example `lesson-chem-ch8`. |

### 2.3 Evidence rules (derived from events, never stored as truth)

For each objective, the status is worked out from its events every time it is read:

| Status | Rule |
|---|---|
| Not started | No events. |
| Learning (no practice yet) | Only viewing events: lessons or examples, no answers. |
| Practicing | Answers exist, but no independent attempt yet. Guided work, hints and repeats land here. |
| Needs review | The most recent independent attempt was wrong. |
| Shown once | At least one independent correct attempt, and the latest independent attempt was correct. |
| Shown independently on 2 days | Independent correct attempts on **at least 2 different items on 2 different calendar days**, with the latest independent attempt correct. This is the strongest status; the app never uses the word "mastered." |

**Review dates:**
* After a wrong independent attempt, or practice only: the next day.
* After the first independent correct attempt: 1 day later.
* After "Shown independently on 2 days": 7 days later.

When a review is due, the app offers an **unseen** item from that objective's pool. If the pool runs out, the status says "Needs new problems." It never reuses a problem as evidence.

### 2.4 Migration, damaged records and versions

- **Unit 3 history.** First-try answers that the Unit 3 coach already saved are copied in as `check` events with fixed IDs (`legacy:u3:<questionId>`). They are marked `independent: false`, because they were multiple-choice recognition, not unfamiliar problems. The original Unit 3 and nine-day records are read only, never changed. The copy runs again each time the app opens, and fixed IDs stop duplicates.
- **Damaged events.** An event that fails validation is excluded from evidence and counted in a data-check summary. It is never deleted.
- **Newer versions.** An event with a newer schema version than this code understands is kept and excluded, with a "made by a newer app version" note.
- **Future schema changes** go through a migration list in `meta`. Each migration step is recorded there and safe to run twice.

### 2.5 Export and import

The full learning backup (PR #107) adds the new database to its list. Events are restored with "add missing items only." Because every event has a unique ID, restoring merges history and never overwrites. Fingerprints, incomplete-backup warnings and partial-restore reporting all apply unchanged.

### 2.6 Planner two-tab fix

`commit()` now re-reads the latest saved planner inside the IndexedDB read-write transaction, applies the change to that copy, and writes it back. A second tab's change can no longer be lost. Other tabs are told to reload through a `BroadcastChannel`.

## 3. Phase B: lesson flows

Both lessons follow the same cycle:

1. **Teach**, with visuals.
2. **Worked example.**
3. **Guided practice**, recorded as assisted.
4. **Diagnosis** of the specific error.
5. **Different reteach.**
6. **Independent unfamiliar problem.**
7. **Delayed review** with a new item.

The first session must complete teaching before the independent problem unlocks. Later review sessions open straight to a new independent item, with a "Review the lesson" button.

### 3.1 Chemistry pilot: adding HBr or HCl to alkenes

**Preparatory.** The topic is from Klein 5e Chapter 8. It is not yet checked against Dr. Meadows' Chapter 8 SLOs.

**Concept:** an alkene's π bond attacks H–X, which forms the more stable carbocation. The halide then bonds to that carbocation carbon. This is Markovnikov regiochemistry, explained by carbocation stability (Unit 3, Ch 6 SLO #9). If a new stereocenter forms, the product is racemic. A 1,2-shift happens when it gives a more stable carbocation.

**Steps:**

1. **Teach:** step-by-step mechanism for propene + HBr, drawn as structures. Arrows can be shown one at a time.
2. **Worked example:** 2-methylpropene + HBr, comparing both possible carbocations.
3. **Guided (assisted):** 2-methyl-2-butene + HBr, done entirely by tapping the molecule:
   * Tap where the first arrow starts. Correct: the C=C π bond. Common errors: the H, or the Br.
   * Tap where it ends. Correct: the H of H–Br.
   * Tap the carbon that gains H. Correct: the CH carbon. Error: the other alkene carbon (`regio-less-stable-cation`).
   * Tap the carbon that bonds to Br. Correct: the carbocation carbon. Error: `x-on-wrong-carbon`.
   * Each error shows a specific explanation, then a different explanation (a carbocation stability ladder that counts carbon neighbors), then a retry.
4. **Independent, unfamiliar, no hints before submitting:** tap the carbon that gains H, tap the carbon bonded to X in the major product, then choose the stereochemical outcome.
   * Item pool: 1-butene + HBr; propene + HCl; 2-methyl-2-pentene + HBr; 1-pentene + HBr; 3-methyl-1-butene + HBr (hydride shift).
5. **Delayed review:** the next unseen pool item, offered on the review date.

**Verification:** every item's key is checked by an independent atom-graph program in the tests. It works out carbocation class, the Markovnikov carbon, the possibility of a 1,2-shift, and the presence of a new stereocenter.

### 3.2 A&P pilot: head and neck muscles (Chapter 9)

**Preparatory.** These are standard muscles for a head, neck and trunk lab. They are not yet checked against Dr. Granger's official list.

**Muscles:** occipitofrontalis (frontal belly), orbicularis oculi, orbicularis oris, buccinator, temporalis, masseter, sternocleidomastoid. Trunk muscles come in the next set.

**Steps:**

1. **Teach:** labeled figure, plus location, action and a "how to recognize it" cue for each muscle.
2. **Worked example:** how to identify a structure on an unlabeled image by finding landmarks first (eye, mouth, ear, jaw angle, sternum and clavicle).
3. **Guided:** numbered pins on an unlabeled image, answered by choosing from a list, with hints allowed.
4. **Look-alike comparisons:** orbicularis oculi vs. oris; masseter vs. buccinator; temporalis vs. frontal belly.
5. **Independent:** type the name of a pinned structure on a **different view**, the facial muscles' lateral view after teaching on the anterior view. Answers are matched against accepted names with small spelling tolerance. Close misspellings are accepted and flagged.
   * The independent work also includes "which pin is the muscle that does X?" questions.
6. **Errors:** the error type is named, for example confusing a look-alike, wrong region, or not recognized. The reteach shows the labeled view, the distinguishing feature, and the look-alike comparison card, then moves to a different item.
7. **Delayed review:** new pins and views.

**Images:** OpenStax *Anatomy and Physiology 2e*, licensed **CC BY-NC-SA 4.0**. Images are cropped, and labels are covered with numbered blanks. OpenStax's own leader lines mark every answer location. An automated OCR test confirms no target muscle name is readable on any unlabeled image. **The license is non-commercial: these images may not be used in a paid product without other licensing.**

**Actions taught**, as given by OpenStax:

| Muscle | Action |
|---|---|
| Frontal belly | Raises eyebrows |
| Orbicularis oculi | Closes eyelids |
| Orbicularis oris | Shapes and closes the lips |
| Buccinator | Compresses the cheek |
| Masseter | Elevates the mandible (closes the mouth) |
| Temporalis | Elevates and retracts the mandible |
| Sternocleidomastoid | One side rotates the head to the opposite side; both sides flex the neck |

Names follow standard anatomical terminology. Spelling still needs a check against Amerman 3e.

## 4. Personalized "Next up"

The Home screen's existing "More recommendations" area gets one "Next up" card, built from the shared record. Order:

1. Reviews that are due.
2. Objectives marked "Needs review."
3. Lessons she started but has not finished.
4. Lessons not started.

Ties go to the course with the nearest exam.

Exam dates come from the existing syllabus calendar.

## 5. Calendar correction

Dr. Meadows' syllabus states that all four written unit tests are cumulative. Tests 3 and 4 are therefore labeled cumulative, with that source given. December 10 stays "Test 5 & Final Exam." BIO 131 keeps Exam 3 on Nov 17 (Chapters 8 to 10), Lab Practical 2 cumulative on Dec 2, and the final on Dec 7 from 7 to 10 PM.

## 6. Test plan (mapped to the acceptance criteria)

| # | Criterion | Automated evidence (isolated browser, synthetic data) |
|---|---|---|
| 1 | Navigate and begin without help | From Home, each lesson starts in at most 2 taps with clearly labeled buttons; screenshots at iPad size. Real confirmation comes from AStarryia. |
| 2 | Teaches before assessing | The first screen is teaching; the independent problem is locked until the guided practice is done. |
| 3 | Wrong answers get specific feedback and reteaching | Every designed wrong tap or answer produces its own misconception message and a different explanation. |
| 4 | Genuine subject interaction | Chemistry: tapping atoms and bonds on structures. A&P: typed recall of a pinned structure and tapping a pin from its function. |
| 5 | Delayed new independent problem | With the clock moved forward a day, a different unseen item is offered and recorded as independent. |
| 6 | Same record | Events from both lessons appear in `astarryia-learning-record-v1`. |
| 7 | Practice, help, first attempts and independent work stay distinct | Status tests: guided only gives "Practicing"; a repeat is never independent; using a hint is never independent. |
| 8 | Progress survives | Refresh, new page, legacy migration, two tabs writing at once, damaged events, the planner two-tab fix (including when a tab never receives the refresh message), and backup and restore of the new database. |

The scientific checks also run as tests: the chemistry atom-graph verification and the A&P OCR mask check.

## 7. Known limits

- Software tests do not prove learning; that has to be confirmed with AStarryia.
- Not yet tested on a physical iPad or in Safari/WebKit.
- The jaw muscles and the sternocleidomastoid have a labeled OpenStax figure in only one view, and guided practice uses that same figure. Identification questions on those figures are therefore recorded as **practice**, never as independent evidence, and the app tells her so. Their actions *are* tested independently, by recalling the muscle's name from its function. A second licensed view is needed before identification can count.
- Images are CC BY-NC-SA 4.0: fine for AStarryia's personal study; not usable in a paid product without other licensing.
- Chapter 8 and muscle content stay "Preparatory" until the instructor files arrive.
