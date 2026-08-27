"use strict";
const assert = require("assert");
const fs = require("fs");
const Hub = require("./course-hub/course-hub.js");
const curricula = require("./readiness-day-curricula.js");

let assertions = 0;
const ok = (value, message) => { assert(value, message); assertions += 1; };
const eq = (actual, expected, message) => { assert.equal(actual, expected, message); assertions += 1; };

function storage(values) {
  return { getItem(key) { return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : null; } };
}
function saved(value) { return JSON.stringify(value); }

// The library is permanent and every day has a real route.
eq(Hub.DAY_META.length, 9, "all nine foundation days are listed");
for (let day = 1; day <= 9; day += 1) {
  const meta = Hub.DAY_META.find(item => item.day === day);
  ok(meta, `Day ${day} exists in foundation library`);
  eq(meta.href, `../day${day}/`, `Day ${day} points to its existing lesson`);
}

// No evidence means START, but all entries are still visible/clickable.
eq(Hub.dayStatus(1, storage({}), curricula), Hub.STATUS.START, "Day 1 starts when no evidence exists");
eq(Hub.dayStatus(4, storage({}), curricula), Hub.STATUS.START, "Day 4 starts when no evidence exists");

// Day 1 completion uses the keys written by the live Day 1 page: all six math
// practice sets plus the independent chemistry mastery record.
const completeMathSessions = Object.fromEntries(Hub.DAY1_MATH_AREAS.map(id => [id, { status: "Practice set complete", idk: false }]));
eq(Hub.dayStatus(1, storage({
  "dr-merissa-day1-ui-v5": saved({ mathSessions: completeMathSessions }),
  "astarryia-chemistry-mastery-v1": saved({ completedAt: "2026-08-27T12:00:00Z" })
}), curricula), Hub.STATUS.OPEN, "live Day 1 completion evidence becomes OPEN");
eq(Hub.dayStatus(1, storage({
  "astarryia-chemistry-mastery-v1": saved({ completedAt: "2026-08-27T12:00:00Z" })
}), curricula), Hub.STATUS.IN_PROGRESS, "chemistry alone does not falsely complete all of Day 1");

// Completed evidence becomes OPEN, never hidden or locked.
eq(Hub.dayStatus(2, storage({
  "dr-merissa-day2-formal-charge-v1": saved({ status: "Independent" })
}), curricula), Hub.STATUS.OPEN, "Day 2 independent completion becomes OPEN");
eq(Hub.dayStatus(3, storage({
  "dr-merissa-day3-resonance-v1": saved({ status: "Independent" })
}), curricula), Hub.STATUS.OPEN, "Day 3 independent completion becomes OPEN");

for (let day = 4; day <= 9; day += 1) {
  const config = curricula[day];
  const values = {};
  values[`astarryia.day${day}.v1`] = saved({ status: "Transfer", transfer: true, independent: Array(config.stopRule).fill("clean"), review: [] });
  eq(Hub.dayStatus(day, storage(values), curricula), Hub.STATUS.OPEN, `Day ${day} transfer completion becomes OPEN`);
}

// Review evidence is surfaced without erasing or rewriting it.
eq(Hub.dayStatus(1, storage({
  "dr-merissa-day1-state-v1": saved({ nextSessionQueue: ["algebra"] }),
  "dr-merissa-day1-ui-v5": saved({ mathSessions: { algebra: { status: "Practicing", idk: true } } })
}), curricula), Hub.STATUS.NEEDS_REVIEW, "Day 1 live review evidence becomes NEEDS REVIEW");
eq(Hub.dayStatus(2, storage({
  "dr-merissa-day2-formal-charge-v1": saved({ status: "Needs Lewis refresh" })
}), curricula), Hub.STATUS.NEEDS_REVIEW, "Day 2 prerequisite repair becomes NEEDS REVIEW");
eq(Hub.dayStatus(3, storage({
  "dr-merissa-day3-resonance-v1": saved({ status: "Needs formal-charge repair" })
}), curricula), Hub.STATUS.NEEDS_REVIEW, "Day 3 prerequisite repair becomes NEEDS REVIEW");
eq(Hub.dayStatus(5, storage({
  "astarryia.day5.v1": saved({ status: "Needs review", review: ["D5-I-RESONANCE"], independent: [] })
}), curricula), Hub.STATUS.NEEDS_REVIEW, "Days 4-9 review queue becomes NEEDS REVIEW");
eq(Hub.dayStatus(6, storage({
  "astarryia.day6.v1": saved({ status: "Developing", currentItemId: "D6-I-DIRECTION", independent: [] })
}), curricula), Hub.STATUS.IN_PROGRESS, "unfinished day remains IN PROGRESS");

// Date-aware course support follows the actual syllabus plan.
const aug27 = new Date(2026, 7, 27, 12, 0, 0);
eq(Hub.currentWeek(aug27).start, "2026-08-24", "Aug 27 uses the week-of-Aug-24 syllabus plan");
eq(Hub.currentWeek(aug27).thursday, "Chapter 4", "Aug 27 current lecture is Chapter 4");
eq(Hub.nextTarget(aug27).label, "Test 1", "Test 1 is the next major target on Aug 27");
eq(Hub.daysUntil(aug27, "2026-09-03"), 7, "Test 1 countdown is seven days on Aug 27");
eq(Hub.studyPlan(aug27, Hub.currentWeek(aug27)).length, 3, "Thursday has a bounded three-part study plan");
eq(Hub.activeCourseAlerts(aug27).length, 1, "Aug 27 surfaces the syllabus bonus-point deadline");
eq(Hub.activeCourseAlerts(new Date(2026, 7, 29, 12, 0, 0)).length, 0, "expired syllabus alert disappears after Aug 28");
ok(Hub.activeCourseAlerts(aug27)[0].detail.includes("bonus point on Test 1"), "course alert explains the Test 1 bonus point");

// Recommendation prioritizes an actual weak/in-progress skill instead of hiding other days.
const recommendation = Hub.recommendedFoundation([
  { day: 1, status: Hub.STATUS.OPEN },
  { day: 2, status: Hub.STATUS.NEEDS_REVIEW },
  { day: 3, status: Hub.STATUS.START }
]);
eq(recommendation.day, 2, "NEEDS REVIEW is recommended first");

const statusesWithCurriculumTitles = Hub.allDayStatuses(storage({}), curricula);
eq(statusesWithCurriculumTitles.find(item => item.day === 7).title, curricula[7].title, "hub uses the authored Day 7 title");
eq(statusesWithCurriculumTitles.find(item => item.day === 9).title, curricula[9].title, "hub uses the authored Day 9 title");

const html = fs.readFileSync("course-hub/index.html", "utf8");
const js = fs.readFileSync("course-hub/course-hub.js", "utf8");
ok(html.includes("Days 1–9 stay available"), "UI promises permanent foundation visibility");
ok(html.includes("status becomes <b>OPEN</b>"), "UI explains OPEN after completion");
ok(html.includes("does not erase the mastery evidence"), "UI promises non-destructive reopening");
ok(html.includes("schedule is tentative"), "UI labels the syllabus schedule as tentative");
ok(html.includes("Check Canvas and Mercer email"), "UI does not pretend to know live Canvas assignments");
ok(html.includes("Generative AI should not be used to complete assignments"), "UI includes course academic-integrity boundary");
ok(html.includes("../readiness-day-curricula.js"), "hub loads existing Days 4-9 curriculum metadata");
ok(js.includes("Bonus point deadline"), "hub contains the current syllabus bonus-point alert");
ok(!js.includes("setItem("), "hub is read-only with respect to learning evidence");
ok(!js.includes("removeItem("), "hub never deletes learning evidence");

console.log(`CHM 221 course hub: ${assertions} assertions passed`);
