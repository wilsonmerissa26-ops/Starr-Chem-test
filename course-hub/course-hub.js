(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else {
    root.AStarryiaCourseHub = api;
    if (root.document) api.mount(root);
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const STATUS = Object.freeze({ START: "START", IN_PROGRESS: "IN PROGRESS", NEEDS_REVIEW: "NEEDS REVIEW", OPEN: "OPEN" });
  const DAY_META = Object.freeze([
    { day: 1, title: "Foundation Reset: Math + Lewis Structures", href: "../day1/", why: "Math fluency, Lewis structures, and structure reading." },
    { day: 2, title: "Formal Charge", href: "../day2/", why: "Atom-level charge bookkeeping and whole-structure checks." },
    { day: 3, title: "Resonance", href: "../day3/", why: "Electron movement, contributors, charge conservation, and ranking." },
    { day: 4, title: "Acid/Base Language, Conjugates, Ka and pKa", href: "../day4/", why: "Acid/base roles, conjugates, and pKa relationships." },
    { day: 5, title: "Why One Acid Is Stronger: Conjugate-Base Stability", href: "../day5/", why: "Resonance, induction, and stability reasoning." },
    { day: 6, title: "Acid/Base Equilibrium Direction", href: "../day6/", why: "Predict which side an acid/base equilibrium favors." },
    { day: 7, title: "Nucleophiles, Electrophiles, and Electron Flow", href: "../day7/", why: "Identify electron sources, sinks, and curved-arrow direction." },
    { day: 8, title: "Thermodynamics vs. Kinetics", href: "../day8/", why: "Separate favorability, rate, ΔG, and activation barriers." },
    { day: 9, title: "Integrated Organic Chemistry Readiness", href: "../day9/", why: "Combine foundation skills in fresh transfer problems." }
  ]);

  // Syllabus plan. It is deliberately data, not mastery logic. The professor may update it.
  const COURSE_WEEKS = Object.freeze([
    { start: "2026-08-17", label: "Week of Aug 17", tuesday: "Course Orientation + Chapter 1", thursday: "Chapter 2.1–2.6", lab: "No lab" },
    { start: "2026-08-24", label: "Week of Aug 24", tuesday: "Chapter 4", thursday: "Chapter 4", lab: "Lab 1: IR, Functional Groups, and Molecular Models" },
    { start: "2026-08-31", label: "Week of Aug 31", tuesday: "Chapter 4 + Practice Test 1", thursday: "Test 1", lab: "Lab 2: Panacetin – Separations" },
    { start: "2026-09-07", label: "Week of Sep 7", tuesday: "Chapter 5", thursday: "Chapter 5", lab: "No lab" },
    { start: "2026-09-14", label: "Week of Sep 14", tuesday: "Chapter 2.7–2.13", thursday: "Chapter 3", lab: "Lab 3: NMR Theory – Online" },
    { start: "2026-09-21", label: "Week of Sep 21", tuesday: "Chapter 3", thursday: "Chapter 3 + Practice", lab: "Lab 4: NMR Problem Solving and NMR ID" },
    { start: "2026-09-28", label: "Week of Sep 28", tuesday: "Test 2", thursday: "Fall Break", lab: "No lab" },
    { start: "2026-10-05", label: "Week of Oct 5", tuesday: "Chapter 6", thursday: "Chapter 7", lab: "Lab 5: Panacetin – Recrystallization" },
    { start: "2026-10-12", label: "Week of Oct 12", tuesday: "Chapter 7", thursday: "Chapter 7", lab: "Lab 6: Panacetin – Characterization 1" },
    { start: "2026-10-19", label: "Week of Oct 19", tuesday: "Chapter 7", thursday: "Chapter 7 + Practice", lab: "Lab 7: Panacetin – Characterization 2" },
    { start: "2026-10-26", label: "Week of Oct 26", tuesday: "Test 3", thursday: "Chapter 8", lab: "Lab 8: Unimolecular Solvolysis" },
    { start: "2026-11-02", label: "Week of Nov 2", tuesday: "Chapter 8", thursday: "Chapter 8", lab: "No lab" },
    { start: "2026-11-09", label: "Week of Nov 9", tuesday: "Chapter 9", thursday: "Chapter 9", lab: "Lab 9 Part 1: Ester Distillation" },
    { start: "2026-11-16", label: "Week of Nov 16", tuesday: "Chapter 9 + Practice", thursday: "Test 4", lab: "Lab 9 Part 2: Ester NMR" },
    { start: "2026-11-23", label: "Week of Nov 23", tuesday: "Chapter 11", thursday: "Thanksgiving", lab: "No lab" },
    { start: "2026-11-30", label: "Week of Nov 30", tuesday: "Chapter 10", thursday: "Chapter 10 + Course Wrap-Up", lab: "No lab" },
    { start: "2026-12-07", label: "Finals week", tuesday: "Cumulative review", thursday: "Test 5 + Final Exam, 7:00 PM", lab: "No lab" }
  ]);

  const MAJOR_TARGETS = Object.freeze([
    { date: "2026-09-03", label: "Test 1", detail: "Closed-book, cumulative unit test" },
    { date: "2026-09-29", label: "Test 2", detail: "Cumulative unit test" },
    { date: "2026-10-27", label: "Test 3", detail: "Cumulative unit test" },
    { date: "2026-11-19", label: "Test 4", detail: "Cumulative unit test" },
    { date: "2026-12-10", label: "Test 5 + Final Exam", detail: "Mandatory cumulative final at 7:00 PM" }
  ]);

  const safeParse = raw => {
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (_) { return null; }
  };

  function dayStatus(day, storage, curricula) {
    const get = key => safeParse(storage && storage.getItem ? storage.getItem(key) : null);
    if (day === 1) {
      const state = get("dr-merissa-day1-state-v1");
      if (!state) return STATUS.START;
      if (state.chemistry && state.chemistry.masteryMet === true) return STATUS.OPEN;
      const math = state.math && state.math.statuses ? Object.values(state.math.statuses) : [];
      if ((state.nextSessionQueue || []).length || math.includes("Developing")) return STATUS.NEEDS_REVIEW;
      return STATUS.IN_PROGRESS;
    }
    if (day === 2) {
      const state = get("dr-merissa-day2-formal-charge-v1");
      if (!state) return STATUS.START;
      if (state.status === "Independent") return STATUS.OPEN;
      if (state.status === "Developing" || state.status === "Needs Lewis refresh") return STATUS.NEEDS_REVIEW;
      return STATUS.IN_PROGRESS;
    }
    if (day === 3) {
      const state = get("dr-merissa-day3-resonance-v1");
      if (!state) return STATUS.START;
      if (state.status === "Independent") return STATUS.OPEN;
      if (state.status === "Developing" || state.status === "Needs formal-charge repair") return STATUS.NEEDS_REVIEW;
      return STATUS.IN_PROGRESS;
    }
    const config = curricula && curricula[day];
    const state = get(`astarryia.day${day}.v1`);
    if (!state) return STATUS.START;
    const cleanCount = Array.isArray(state.independent) ? state.independent.length : 0;
    if (state.status === "Transfer" || (config && state.transfer === true && cleanCount >= config.stopRule)) return STATUS.OPEN;
    if (state.status === "Needs review" || (Array.isArray(state.review) && state.review.length)) return STATUS.NEEDS_REVIEW;
    return STATUS.IN_PROGRESS;
  }

  function allDayStatuses(storage, curricula) {
    return DAY_META.map(meta => Object.assign({}, meta, { status: dayStatus(meta.day, storage, curricula) }));
  }

  function dateParts(value) {
    const d = value instanceof Date ? value : new Date(value);
    return { y: d.getFullYear(), m: d.getMonth(), d: d.getDate() };
  }
  function dateOnlyUtc(value) {
    const p = dateParts(value);
    return Date.UTC(p.y, p.m, p.d);
  }
  function parseLocalDate(iso) {
    const parts = iso.split("-").map(Number);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  }
  function daysUntil(fromDate, isoTarget) {
    return Math.round((dateOnlyUtc(parseLocalDate(isoTarget)) - dateOnlyUtc(fromDate)) / 86400000);
  }
  function currentWeek(date) {
    const stamp = dateOnlyUtc(date);
    let found = COURSE_WEEKS[0];
    COURSE_WEEKS.forEach(week => { if (dateOnlyUtc(parseLocalDate(week.start)) <= stamp) found = week; });
    return found;
  }
  function nextTarget(date) {
    return MAJOR_TARGETS.find(target => daysUntil(date, target.date) >= 0) || MAJOR_TARGETS[MAJOR_TARGETS.length - 1];
  }
  function dayName(date) { return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]; }
  function lectureForToday(date, week) {
    if (date.getDay() === 2) return week.tuesday;
    if (date.getDay() === 4) return week.thursday;
    return null;
  }
  function studyPlan(date, week) {
    const lecture = lectureForToday(date, week);
    const plans = {
      0: ["Do a closed-note weekly mastery check.", "Mark what is solid, shaky, and not yet independent.", "Choose one older foundation skill to refresh before next week."],
      1: ["Prepare for lab and check Canvas for the exact lab submission requirements.", "Preview Tuesday’s assigned material.", "Keep the session targeted if last week’s material is already solid."],
      2: [lecture ? `Attend lecture: ${lecture}.` : "Attend lecture.", "Review the lecture the same day.", "Solve at least one related problem from a blank page before checking notes."],
      3: ["Repair Tuesday’s errors instead of rereading everything.", "Use student hours if a specific question is still unresolved.", "Preview Thursday’s material."],
      4: [lecture ? `Attend lecture: ${lecture}.` : "Attend lecture.", "Use the 1:00–2:00 PM student hour before class if needed.", "After class, do a short closed-note retrieval; use ARC tutoring tonight if the same error pattern remains."],
      5: ["Rework missed problems from scratch.", "Do not count rereading a solution as a successful retry.", "Update the error log with the exact rule or step that failed."],
      6: ["Do a longer mixed-practice session.", "Mix current CHM 221 work with older material so you must choose the right idea.", "End with a short no-notes check."]
    };
    return plans[date.getDay()];
  }

  function recommendedFoundation(statuses) {
    return statuses.find(item => item.status === STATUS.NEEDS_REVIEW) ||
      statuses.find(item => item.status === STATUS.IN_PROGRESS) ||
      statuses.find(item => item.status === STATUS.START) ||
      statuses[0];
  }

  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
  function statusClass(status) { return status.toLowerCase().replace(/\s+/g, "-"); }

  function renderDay(meta) {
    const action = meta.status === STATUS.OPEN ? "Open" : meta.status === STATUS.START ? "Start" : "Continue";
    return `<article class="foundation-card" data-day="${meta.day}" data-status="${esc(meta.status)}"><div class="foundation-top"><span class="day-number">Day ${meta.day}</span><span class="status ${statusClass(meta.status)}">${esc(meta.status)}</span></div><h3>${esc(meta.title)}</h3><p>${esc(meta.why)}</p><a class="button secondary" href="${esc(meta.href)}">${action} Day ${meta.day}</a>${meta.status === STATUS.OPEN ? '<p class="completion-note">Completed evidence stays saved. Opening this day never resets it.</p>' : ""}</article>`;
  }

  function render(root, date) {
    const doc = root.document;
    const curricula = root.ReadinessCurricula || {};
    const statuses = allDayStatuses(root.localStorage, curricula);
    const week = currentWeek(date);
    const target = nextTarget(date);
    const remaining = daysUntil(date, target.date);
    const recommendation = recommendedFoundation(statuses);
    const lecture = lectureForToday(date, week);
    const plan = studyPlan(date, week);

    doc.querySelector("[data-current-week]").textContent = week.label;
    doc.querySelector("[data-current-focus]").textContent = lecture || `${week.tuesday} / ${week.thursday}`;
    doc.querySelector("[data-current-lab]").textContent = week.lab;
    doc.querySelector("[data-day-name]").textContent = dayName(date);
    doc.querySelector("[data-today-plan]").innerHTML = plan.map(item => `<li>${esc(item)}</li>`).join("");
    doc.querySelector("[data-target-name]").textContent = target.label;
    doc.querySelector("[data-target-date]").textContent = parseLocalDate(target.date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    doc.querySelector("[data-target-countdown]").textContent = remaining === 0 ? "Today" : `${remaining} day${remaining === 1 ? "" : "s"} away`;
    doc.querySelector("[data-target-detail]").textContent = target.detail;

    const rec = doc.querySelector("[data-foundation-recommendation]");
    if (statuses.every(item => item.status === STATUS.OPEN)) {
      rec.innerHTML = `<strong>Foundation library is fully open.</strong><p>All nine days remain available for refresh. Choose the skill that matches the problem you are working on.</p>`;
    } else {
      rec.innerHTML = `<strong>Foundation refresh: Day ${recommendation.day}</strong><p>${esc(recommendation.title)} · ${esc(recommendation.status)}</p><a class="button small" href="${esc(recommendation.href)}">Open Day ${recommendation.day}</a>`;
    }
    doc.querySelector("[data-foundation-grid]").innerHTML = statuses.map(renderDay).join("");
    return { statuses, week, target, recommendation };
  }

  function mount(root) {
    const now = new Date();
    return render(root, now);
  }

  return { STATUS, DAY_META, COURSE_WEEKS, MAJOR_TARGETS, safeParse, dayStatus, allDayStatuses, daysUntil, currentWeek, nextTarget, studyPlan, recommendedFoundation, render, mount };
});
