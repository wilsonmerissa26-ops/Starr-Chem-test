# AStarryia Learning System: Shared Learning Record and Two Teaching Pilots

Status: development branch `learning-pilots-ab`. Not deployed. Built on top of the backup branch (PR #107), which must be merged first.

Tests: `test-learning-pilots.py` (104 real-browser checks on synthetic data). Images: `tools/build-ap-images.py`.

## 1. Scope and constraints

- Keep the current layout: Home, Classes, Calendar, Planner. No new tabs or menus. Pilot lessons open inside the existing in-app lesson screen, reached from buttons on the existing Chemistry and A&P cards.
- One shared learning record for every course. Each course keeps its own teaching and assessment methods.
- Never infer mastery from confidence, repetition, or viewing a lesson.
- Preserve existing learning history. Nothing existing is deleted, renamed or overwritten.
- Course sources: CHM 221 uses Klein, *Organic Chemistry*, 5th ed. BIO 131 uses Amerman, *Human Anatomy and Physiology*, 3rd ed.
- Lesson content is labeled by source, and development does not wait on new instructor files:
  - Confirmed from course materials: textbooks (Klein 5e, Amerman 3e), syllabus dates and topics, the Unit 3 SLOs, practice problems and decision tree, and that all four written CHM unit tests are cumulative.
  - Textbook-based preparation: Chapter 8 lesson content (no separate Chapter 8 SLO document has been issued) and the muscle set (no instructor muscle checklist has been issued).
  - The app never presents textbook-based content as what an exam covers. Instructor handouts are added if they become available.

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

**Textbook-based preparation.** Klein 5e Chapter 8, on the syllabus for Oct 29 and Nov 3 to 5. No separate Chapter 8 SLO document exists.

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

**Textbook-based preparation.** The syllabus lab is Muscles of Head, Neck, and Trunk (Nov 4), and Lab Practical 2 (Dec 2) is cumulative. No instructor muscle checklist exists, so the set follows standard Chapter 9 coverage. Scope: head, neck and trunk; this first set covers head and neck.

**Muscles:** occipitofrontalis (frontal belly), orbicularis oculi, orbicularis oris, buccinator, temporalis, masseter, sternocleidomastoid. Trunk muscles come in the next set.

**Decode the names (step 2).** Objective `bio131.ch9.muscle-name-roots`. Teaches 45 Latin and Greek word roots grouped by the OpenStax 11.2 naming categories (place or attachment, position, shape, size, fiber direction, number of parts, action), with two worked examples on muscles already studied and a note that names are clues, not the whole story (masseter means "chewer"). Guided: one name with an optional root table, which counts as a hint. On your own: three new names per session; she picks the meaning of every word part, and all parts must be right. Four choices per part, matched to the answer's category and grammar ("of the ..." or not) so wording never gives the answer away. Root-table examples never show a practice name. Next day: different names, recorded as review. Error type: `root-<part>` for the first missed part.

**In-depth lesson ("Start here", head and neck set).** Two complete examples, one muscle at a time: sternocleidomastoid (naming and attachments) and masseter (location, movement, function). Six stages each:
1. Decode: one root or landmark per screen, each with an OpenStax landmark picture (lateral skull, fig. 705; anterior neck, fig. 1110) with the taught labels outlined. Then a check: choose the attachments from the name. Practice.
2. See: the labeled figure and how to recognize its path or shape. Learning.
3. Move: the action, why the location gives that movement, and a gentle try-it. Learning.
4. Explain: she writes her own explanation, then compares it with a model answer and ticks which of three essential points she covered; missing points are listed for her to say aloud. Recorded as practice with `correct: null`; the app does not grade free writing.
5. Recall: name the pinned muscle on the studied picture without labels, then the action. Practice. After a wrong answer she chooses what confused her (location, name, action, or the question) and gets the explanation written for that kind of confusion; her choice is stored as `<item>-confusion` and her actual answers are still what is scored.
6. Apply: the only stage that can count as independent (first try, no help, never answered before). Three skills are tracked under separate objectives, so success in one never establishes another: identify on a picture never studied (`bio131.ch9.jaw-neck-id`), function (`bio131.ch9.head-neck-actions`), and a new situation (`bio131.ch9.head-neck-application`). Each visit gives the next unanswered question for each skill; when a skill has none left, the screen says so (for example, no other verified picture of the SCM; none at all for the masseter) instead of repeating one. SCM has 1 picture, 2 function and 2 situation questions; masseter has 2 function and 2 situation questions. The start screen shows her full Apply history per skill, oldest first, so earlier misses stay visible after later correct answers; the record itself is append-only and never removes them.
The 45-root table stays as an optional reference ("Decode more names"). Images: `tools/build-ap-deep-images.py`.

**Picture familiarity (three levels, all sets).** Each figure used for identification names its source drawing (`drawing`, for example `openstax-1105-front`; several crops can share one drawing). Every identification answer stores `response.drawing` and `response.picture` (`new` or `seen`).
1. Practice: a drawing she studied with labels (for example the facial side view, which is the jaw figure's drawing). Not independent.
2. New question, picture seen before: the first answer on this drawing was already given, in any lesson. Independent, filed under the set's identification objective, and the feedback says so.
3. New picture: her first answer on that drawing in any lesson. Filed under the set's "ID on new pictures" objective (`bio131.ch9.head-neck-id-new-picture`, `bio131.ch9.trunk-id-new-picture`).
So each drawing yields one new-picture answer in total. A drawing counts as seen once she has answered a question on it (opening a question and leaving without answering is not recorded). Level 2 still matters: the lab practical tests the same models she studies in lab.

**Side view counted as practice.** OpenStax's jaw figure (1108, superficial) is the same head drawing as the facial side view (1106 lateral), with a dissection box over the masseter. So naming a facial muscle on the side view is recorded as practice, not transfer, and the feedback tells her why. Facial identification therefore cannot reach "Shown on your own" until a genuinely different, verified picture exists (lab model photos, or OpenStax fig. 1105 pins built from its own labels). Facial-muscle function questions still count.

**Screen length (measured).** Each in-depth screen has one main action. Visible words per screen before any "More detail" tap: decode 26 to 45, See 42 to 48, Move 66 to 85, Explain 27 to 97, Recall 9 to 27, Apply 32 to 59. Extra detail (muscle card, why the movement follows, model answer, how you could know) sits behind taps. The skull landmark figure is visually busy (about 30 OpenStax labels, 3 outlined).

**Feel it (step 3, both sets).** One card per muscle: an action to do while touching the spot, what to notice, and a sentence to say aloud (name plus action). Deep muscles (internal oblique, transversus abdominis, diaphragm, quadratus lumborum) say plainly that she feels the effect, not the muscle. Each "I tried it" is a `teach` event: learning only, never evidence.

**Trunk set (`lessons/ap-muscles/trunk.html`).** Textbook-based preparation. Eight axial trunk muscles from OpenStax 11.4: rectus abdominis, external oblique, internal oblique, transversus abdominis, external intercostals, internal intercostals, diaphragm, quadratus lumborum. Chest and back muscles that move the arm (pectoralis major, latissimus dorsi, trapezius, serratus anterior) go with the upper limb set. Objectives `bio131.ch9.trunk-muscle-id` and `bio131.ch9.trunk-actions`. Order: decode the names first (the names are new before she studies them), then learn, feel it, find, guided pins (8), look-alikes (external vs internal oblique, external vs internal intercostals, rectus vs transversus), on your own, delayed review. Independent identification uses views never shown in teaching or guidance: the whole-body front view, the intercostal close-up, and the posterior abdominal wall. Internal oblique, transversus abdominis and the diaphragm have only one licensed view, so naming them on a pin is practice; their actions are tested independently. A trunk name decoded after she has seen the trunk learn screen counts as practice. Images: `tools/build-ap-trunk-images.py` (OpenStax figures 1105, 1112, 1113, 1114; labels covered word by word using OCR plus checked boxes; pins at leader-line starts).

**Shoulder and arm set (`lessons/ap-muscles/upper.html`).** Textbook-based preparation for the Upper Limb lab (Nov 11), Exam 3 and Lab Practical 2. Fourteen muscles: trapezius, serratus anterior, deltoid, pectoralis major, latissimus dorsi, the rotator cuff (supraspinatus, infraspinatus, teres minor, subscapularis; taught as SITS), teres major (taught as NOT rotator cuff), biceps brachii, brachialis, triceps brachii, brachioradialis. Objectives `bio131.ch9.upper-limb-id` and `bio131.ch9.upper-limb-actions`. Actions follow the OpenStax 11.5 text; its summary table lists "extension; adduction" for infraspinatus and teres minor, contradicting its own text, so the text and standard anatomy are used. Teaching and guided figures: OpenStax 1118, 1119, 1120. New-picture questions: OpenStax 1105 front and back (never shown labeled in the app; each muscle asked about at most once per picture). Subscapularis has one view only, so naming it on a pin is practice. Images: `tools/build-ap-upper-images.py`. Forearm muscles are a separate lesson.

**Forearm set (`lessons/ap-muscles/forearm.html`).** Same preparation label. Nine muscles: pronator teres, supinator, flexor carpi radialis, palmaris longus, flexor carpi ulnaris, flexor digitorum superficialis, extensor carpi radialis longus, extensor digitorum, extensor carpi ulnaris. Objectives `bio131.ch9.forearm-id`, `bio131.ch9.forearm-actions`, `bio131.ch9.forearm-id-new-picture`. Origins follow the OpenStax 11.5 text (flexors and pronator teres from the medial epicondyle; extensors and supinator from the lateral epicondyle; extensor carpi radialis longus from the lateral supracondylar ridge). Actions are in standard terms (flexion and extension; abduction toward the thumb side and adduction toward the little-finger side, in anatomical position). Two OpenStax table errors are not copied: it says flexor carpi ulnaris tilts the hand "away from the body" (it adducts), and it names "extensor radialis longus." Teaching and guided figures split OpenStax 1120 into its palm-side and back drawings, because side by side three pins sat within 24 px of each other on an iPad-width screen; a test now checks that every figure shown with all its pins keeps 44 px pins at least 46 px apart, in every set. The deep view is cropped to the back drawing so the supinator pin has one leader line. New-picture questions use OpenStax 1105 front and back, which the head and neck and the shoulder and arm lessons also use, so they count as new only if she has not answered on that drawing before. Every muscle also has one function question. Images: `tools/build-ap-forearm-images.py`.

**Decode for the forearm.** New roots: flexor, extensor, pronator, supinator, carpi, digitorum, radialis (already present), ulnaris, palmaris, superficialis, longus. Seven practice names (supinator is left out because the name is one root shown in the table). `taughtBy` now accepts a list: five forearm names are already shown labeled in the shoulder and arm lesson, so decoding them after that lesson counts as practice. The names screen shows only the roots its own lesson uses; the other lessons' roots are behind one tap. Roots whose meanings overlap (extensor and erector, levator and erector, superficialis and external, teres and orbicularis) are never offered as a wrong choice for each other.

**New-picture rule (all sets).** A picture counts as new for a muscle only if she has never seen that drawing labeled and has never been asked about that muscle on it.

**Name matching rule.** An exact name of another lesson muscle always beats a near spelling, so "internal oblique" is never accepted as a misspelling of "external oblique." A near spelling is accepted only when the target muscle is strictly the closest. "Oblique" or "intercostals" alone gets an "external or internal?" prompt.

**View-integrity fix (head and neck set).** The earlier head set taught from OpenStax's full facial figure, which shows the side view labeled, and then counted side-view questions as never-practiced views. The teaching figure is now the front view only, the full figure was removed, and a test walks every teaching and guided screen (including wrong-answer feedback) in both sets and fails if any shows a view used as new in independent questions. Any side-view answers recorded before this fix would have been over-credited; none exist yet because the pilot has not been released.

**Study songs.** `lessons/ap-muscles/songs.js` lists songs per set (`set`, `title`, `src`, optional `muscles` and `lyrics`); audio files go in `lessons/ap-muscles/songs/`. Songs appear at the top of that set's learn step; playing one is a `teach` event, never evidence. With no songs listed, no song panel shows. The separate Physiology Music Lab is unchanged.

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
- OpenStax has only two licensed drawings that show forearm muscles (1105 and 1120). If she does the shoulder and arm lesson first, its answers on 1105 use up the "new picture" credit for that drawing, so forearm identification is then filed as "picture seen before." A third licensed forearm view would be needed for more new-picture evidence.
- Chapter 8 and muscle content stay "Preparatory" until the instructor files arrive.
