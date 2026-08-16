"use strict";

/* Day 1 learner-facing orchestration. This module decides what appears next;
   the existing engines continue to own teaching/mastery details. */

var STORAGE_KEY = "dr-merissa-day1-state-v1";

function initialState() {
  return {
    version: 1,
    subject: "math",
    math: { order: ["logs", "algebra", "exponents", "scientific_notation", "fractions_percent", "unit_conversions"], index: 0, statuses: {} },
    chemistry: { phase: "teach", masteryMet: false },
    notebook: [],
    sameSessionReview: [],
    nextSessionQueue: [],
    scaffoldLevel: 3,
    updatedAt: null
  };
}

function clone(x) { return JSON.parse(JSON.stringify(x)); }

function createState(saved) {
  var base = initialState();
  if (!saved) return base;
  var out = Object.assign(base, saved);
  out.math = Object.assign(base.math, saved.math || {});
  out.chemistry = Object.assign(base.chemistry, saved.chemistry || {});
  out.notebook = Array.isArray(saved.notebook) ? saved.notebook : [];
  out.sameSessionReview = Array.isArray(saved.sameSessionReview) ? saved.sameSessionReview : [];
  out.nextSessionQueue = Array.isArray(saved.nextSessionQueue) ? saved.nextSessionQueue : [];
  return out;
}

function load(storage) {
  if (!storage || !storage.getItem) return initialState();
  try { return createState(JSON.parse(storage.getItem(STORAGE_KEY))); }
  catch (e) { return initialState(); }
}

function save(state, storage) {
  state.updatedAt = Date.now();
  if (storage && storage.setItem) storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

function setSubject(state, subject) {
  if (subject !== "math" && subject !== "chemistry") throw new Error("unknown subject");
  state.subject = subject;
  return state;
}

function currentMathArea(state) {
  return state.math.order[state.math.index] || null;
}

function routeMathProbe(state, result) {
  var area = currentMathArea(state);
  if (!area) return { action: "math_complete" };
  if (result === 3) return { action: "clear_area", area: area };
  if (result === 2) return { action: "targeted_correction_then_verify", area: area, verificationItems: 2 };
  return { action: "mini_lesson_guided_independent", area: area, independentItems: 4 };
}

function markMathStatus(state, status) {
  var area = currentMathArea(state);
  if (!area) return state;
  if (status !== "Cleared" && status !== "Developing") throw new Error("invalid math status");
  state.math.statuses[area] = status;
  if (status === "Developing" && state.nextSessionQueue.indexOf(area) < 0) state.nextSessionQueue.push(area);
  state.math.index += 1;
  return state;
}

function addNotebookFact(state, fact, phase) {
  if (phase !== "TEACH" && phase !== "WATCH") return state;
  if (state.notebook.indexOf(fact) < 0) state.notebook.push(fact);
  return state;
}

function notebookVisible(state) { return state.scaffoldLevel > 0; }

function scheduleReview(state, skillId, trigger) {
  if (trigger !== "skip" && trigger !== "repeated_idk") return state;
  if (state.sameSessionReview.indexOf(skillId) < 0) state.sameSessionReview.push(skillId);
  return state;
}

function nextAction(state) {
  if (state.sameSessionReview.length) return { subject: state.subject, action: "fresh_same_session_review", skillId: state.sameSessionReview[0] };
  if (state.subject === "math") {
    var area = currentMathArea(state);
    return area ? { subject: "math", action: "adaptive_reset", area: area } : { subject: "math", action: "math_summary" };
  }
  if (state.chemistry.masteryMet) return { subject: "chemistry", action: "chemistry_summary" };
  return { subject: "chemistry", action: state.chemistry.phase };
}

function consumeReview(state) { state.sameSessionReview.shift(); return state; }

function startNextSession(state) {
  if (!state.nextSessionQueue.length) return { action: "normal_session_start", skillId: null };
  return { action: "unfinished_skill_first", skillId: state.nextSessionQueue[0] };
}

var api = { STORAGE_KEY: STORAGE_KEY, initialState: initialState, createState: createState, load: load, save: save,
  setSubject: setSubject, currentMathArea: currentMathArea, routeMathProbe: routeMathProbe, markMathStatus: markMathStatus,
  addNotebookFact: addNotebookFact, notebookVisible: notebookVisible, scheduleReview: scheduleReview,
  nextAction: nextAction, consumeReview: consumeReview, startNextSession: startNextSession };

if (typeof module !== "undefined" && module.exports) module.exports = api;
if (typeof globalThis !== "undefined") globalThis.Day1Orchestrator = api;
