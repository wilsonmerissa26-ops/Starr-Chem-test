/* AStarryia shared learning record (schema 1).
 *
 * One subject-neutral, append-only record of learning events for every course.
 * - Every write adds a new event with a unique id; nothing is ever updated in place or deleted,
 *   so two open tabs cannot overwrite each other.
 * - Whether an attempt is a first attempt, and whether it counts as independent evidence, is
 *   decided by this module inside the same IndexedDB read-write transaction that saves it.
 * - Evidence status is always recomputed from the events. It never claims mastery from viewing,
 *   confidence, repetition or assisted work.
 * See docs/LEARNING_SYSTEM_SPEC.md.
 */
(function (global) {
  "use strict";
  var DB_NAME = "astarryia-learning-record-v1";
  var DB_VERSION = 1;
  var SCHEMA = 1;
  var PENDING_PREFIX = "astarryia-lr-pending-";
  var CHANNEL = "astarryia-learning-record";
  var COURSES = { CHM221: 1, BIO131: 1 };
  var ACTIVITIES = { teach: 1, example: 1, guided: 1, check: 1, independent: 1, review: 1 };
  var ANSWERED = { guided: 1, check: 1, independent: 1, review: 1 };
  var SOURCES = { instructor: 1, "textbook-prep": 1, legacy: 1 };
  var STATUS_LABEL = {
    "not-started": "Not started",
    "learning": "Learning (no practice yet)",
    "practicing": "Practicing",
    "needs-review": "Needs review",
    "shown-once": "Shown once on your own",
    "shown-2-days": "Shown on your own on 2 days"
  };

  // ---------- time (overridable in tests through the browser clock) ----------
  function now() { return new Date(); }
  function localDay(d) {
    d = d instanceof Date ? d : new Date(d);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function addDays(day, n) {
    var p = day.split("-").map(Number), d = new Date(p[0], p[1] - 1, p[2]);
    d.setDate(d.getDate() + n);
    return localDay(d);
  }

  // ---------- validation ----------
  function isObj(v) { return v && typeof v === "object" && !Array.isArray(v); }
  function validate(e) {
    if (!isObj(e)) return "not an object";
    if (typeof e.schema !== "number") return "missing schema";
    if (e.schema > SCHEMA) return "newer";
    if (e.schema !== SCHEMA) return "unknown schema";
    if (typeof e.id !== "string" || !e.id) return "missing id";
    if (!COURSES[e.course]) return "unknown course";
    if (typeof e.objectiveId !== "string" || !e.objectiveId) return "missing objective";
    if (typeof e.itemId !== "string" || !e.itemId) return "missing item";
    if (!Number.isInteger(e.itemVersion) || e.itemVersion < 1) return "bad item version";
    if (!ACTIVITIES[e.activity]) return "unknown activity";
    if (["first", "repeat", "none"].indexOf(e.attempt) < 0) return "bad attempt";
    if (!(e.correct === true || e.correct === false || e.correct === null)) return "bad correct";
    if (typeof e.independent !== "boolean") return "bad independent";
    if (!isObj(e.assistance)) return "bad assistance";
    if (typeof e.at !== "string" || isNaN(Date.parse(e.at))) return "bad time";
    if (e.independent && (e.attempt !== "first" || !e.unfamiliar || hadHelp(e.assistance))) return "independent flag inconsistent";
    return null;
  }
  function hadHelp(a) {
    return !!(a && ((a.hints || 0) > 0 || a.guided || a.reteachSeen || a.answerShown));
  }

  // ---------- evidence (pure functions; usable from tests and from any page) ----------
  function statusFromEvents(events, objectiveId, today) {
    today = today || localDay(now());
    var ev = events.filter(function (e) { return e.objectiveId === objectiveId && validate(e) === null; })
      .sort(function (a, b) { return a.at < b.at ? -1 : a.at > b.at ? 1 : 0; });
    var out = { objectiveId: objectiveId, status: "not-started", label: STATUS_LABEL["not-started"], reviewDue: null, due: false,
      independentCorrect: 0, independentAttempts: 0, practiceAttempts: 0, lastAt: null };
    if (!ev.length) return out;
    out.lastAt = ev[ev.length - 1].at;
    var indep = ev.filter(function (e) { return e.independent && e.correct !== null; });
    out.independentAttempts = indep.length;
    out.practiceAttempts = ev.filter(function (e) { return ANSWERED[e.activity] && !e.independent && e.correct !== null; }).length;
    var lastDay = localDay(ev[ev.length - 1].at);
    var answered = ev.some(function (e) { return e.correct !== null; });
    if (!indep.length) {
      out.status = answered ? "practicing" : "learning"; out.reviewDue = addDays(lastDay, 1);
    } else {
      var last = indep[indep.length - 1], lastIndepDay = localDay(last.at);
      var right = indep.filter(function (e) { return e.correct; });
      out.independentCorrect = right.length;
      if (!last.correct) { out.status = "needs-review"; out.reviewDue = addDays(lastIndepDay, 1); }
      else {
        var two = false;
        for (var i = 0; i < right.length && !two; i++)
          for (var j = i + 1; j < right.length && !two; j++)
            if (right[i].itemId !== right[j].itemId && localDay(right[i].at) !== localDay(right[j].at)) two = true;
        out.status = two ? "shown-2-days" : "shown-once";
        out.reviewDue = addDays(lastIndepDay, two ? 7 : 1);
      }
    }
    out.label = STATUS_LABEL[out.status];
    out.due = out.reviewDue !== null && out.reviewDue <= today;
    return out;
  }

  // ---------- IndexedDB ----------
  var dbPromise = null;
  function openDb() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!global.indexedDB) { reject(Error("IndexedDB unavailable")); return; }
      var req;
      try { req = global.indexedDB.open(DB_NAME, DB_VERSION); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains("events")) db.createObjectStore("events", { keyPath: "id" });
        if (!db.objectStoreNames.contains("meta")) db.createObjectStore("meta");
        if (!db.objectStoreNames.contains("quarantine")) db.createObjectStore("quarantine", { keyPath: "id" });
      };
      req.onsuccess = function () {
        var db = req.result;
        db.onversionchange = function () { db.close(); dbPromise = null; };
        resolve(db);
      };
      req.onerror = function () { reject(req.error || Error("Could not open the learning record")); };
      req.onblocked = function () { reject(Error("The learning record is open in an older tab")); };
    }).catch(function (e) { dbPromise = null; throw e; });
    return dbPromise;
  }
  function allEvents(db) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction("events", "readonly"), r = tx.objectStore("events").getAll();
      r.onsuccess = function () { resolve(r.result || []); };
      tx.onerror = function () { reject(tx.error || Error("Read failed")); };
    });
  }

  function newId() { return "ev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10); }

  function buildEvent(input) {
    if (!isObj(input)) throw Error("Event input must be an object");
    var a = isObj(input.assistance) ? input.assistance : {};
    return {
      id: newId(), schema: SCHEMA, course: input.course, objectiveId: input.objectiveId,
      objectiveSource: SOURCES[input.objectiveSource] ? input.objectiveSource : "textbook-prep",
      itemId: input.itemId, itemVersion: Number.isInteger(input.itemVersion) ? input.itemVersion : 1,
      activity: input.activity,
      attempt: "none",
      correct: input.correct === true || input.correct === false ? input.correct : null,
      errorType: typeof input.errorType === "string" ? input.errorType : null,
      response: isObj(input.response) ? input.response : null,
      assistance: { hints: Math.max(0, Number(a.hints) || 0), guided: !!a.guided, reteachSeen: !!a.reteachSeen, answerShown: !!a.answerShown,
        lessonReviewedFirst: !!a.lessonReviewedFirst },
      unfamiliar: !!input.unfamiliar,
      independent: false,
      at: now().toISOString(),
      statusAfter: null, reviewDueAfter: null,
      source: typeof input.source === "string" ? input.source : "unknown"
    };
  }

  // Decide first/repeat and independence from the events already saved (called inside the write transaction).
  function finalize(ev, existing) {
    var sameItemAnswered = existing.some(function (e) { return e.itemId === ev.itemId && e.itemVersion === ev.itemVersion && e.correct !== null && e.attempt !== "none"; });
    var itemSeenBefore = existing.some(function (e) { return e.itemId === ev.itemId; });
    if (ANSWERED[ev.activity] && ev.correct !== null) ev.attempt = sameItemAnswered ? "repeat" : "first";
    else ev.attempt = "none";
    if (itemSeenBefore) ev.unfamiliar = false;
    ev.independent = ev.attempt === "first" && ev.unfamiliar && !hadHelp(ev.assistance) && (ev.activity === "independent" || ev.activity === "review" || ev.activity === "check");
    var st = statusFromEvents(existing.concat([ev]), ev.objectiveId, localDay(ev.at));
    ev.statusAfter = st.status; ev.reviewDueAfter = st.reviewDue;
    var problem = validate(ev);
    if (problem) throw Error("Event rejected: " + problem);
    return ev;
  }

  function writeEvent(db, ev) {
    return new Promise(function (resolve, reject) {
      var tx = db.transaction("events", "readwrite"), os = tx.objectStore("events"), saved = null;
      var r = os.getAll();
      r.onsuccess = function () {
        try { saved = finalize(ev, (r.result || []).filter(function (e) { return validate(e) === null; })); os.add(saved); }
        catch (e) { try { tx.abort(); } catch (_) {} reject(e); }
      };
      tx.oncomplete = function () { resolve(saved); };
      tx.onerror = function () { reject(tx.error || Error("Write failed")); };
      tx.onabort = function () { reject(tx.error || Error("Write cancelled")); };
    });
  }

  var channel = null;
  try { channel = typeof BroadcastChannel === "function" ? new BroadcastChannel(CHANNEL) : null; } catch (_) { channel = null; }
  var listeners = [];
  function notify(detail) {
    try { if (channel) channel.postMessage(detail); } catch (_) {}
    listeners.forEach(function (fn) { try { fn(detail); } catch (_) {} });
  }
  if (channel) channel.onmessage = function (m) { listeners.forEach(function (fn) { try { fn(m.data); } catch (_) {} }); };

  // ---------- fallback queue (only when IndexedDB cannot be used) ----------
  function pendingKeys() {
    var out = [];
    try { for (var i = 0; i < global.localStorage.length; i++) { var k = global.localStorage.key(i); if (k && k.indexOf(PENDING_PREFIX) === 0) out.push(k); } } catch (_) {}
    return out;
  }
  function pendingEvents() {
    return pendingKeys().map(function (k) { try { return JSON.parse(global.localStorage.getItem(k)); } catch (_) { return null; } }).filter(Boolean);
  }
  function flushPending(db) {
    var keys = pendingKeys();
    if (!keys.length) return Promise.resolve(0);
    return new Promise(function (resolve) {
      var tx = db.transaction("events", "readwrite"), os = tx.objectStore("events"), copied = [];
      keys.forEach(function (k) {
        var ev = null;
        try { ev = JSON.parse(global.localStorage.getItem(k)); } catch (_) {}
        if (!ev || validate(ev) !== null) return; // invalid pending copies are left in place for inspection
        var g = os.get(ev.id);
        g.onsuccess = function () { if (!g.result) os.add(ev); copied.push([k, ev.id]); };
      });
      tx.oncomplete = function () {
        // Remove a pending copy only after confirming the saved event is in the database.
        var check = db.transaction("events", "readonly").objectStore("events"), done = 0;
        if (!copied.length) { resolve(0); return; }
        copied.forEach(function (pair) {
          var g = check.get(pair[1]);
          g.onsuccess = function () { if (g.result) { try { global.localStorage.removeItem(pair[0]); } catch (_) {} } if (++done === copied.length) resolve(copied.length); };
          g.onerror = function () { if (++done === copied.length) resolve(copied.length); };
        });
      };
      tx.onerror = function () { resolve(0); };
    });
  }

  // ---------- migration of earlier records (read-only on the originals; safe to run repeatedly) ----------
  function legacyEvents() {
    var out = [], raw = null, u3 = null;
    try { raw = global.localStorage.getItem("astarryia-unit3-v1"); u3 = raw ? JSON.parse(raw) : null; } catch (_) { u3 = null; }
    if (u3 && isObj(u3.firstTry)) {
      Object.keys(u3.firstTry).forEach(function (qid) {
        var f = u3.firstTry[qid], m = /^u3-m(\d+)-q(\d+)$/.exec(qid);
        if (!m || !isObj(f) || typeof f.correct !== "boolean") return;
        var at = typeof f.at === "string" && !isNaN(Date.parse(f.at)) ? f.at : "2026-10-26T12:00:00.000Z";
        out.push({ id: "legacy:u3:" + qid, schema: SCHEMA, course: "CHM221", objectiveId: "chm221.u3.m" + m[1], objectiveSource: "legacy",
          itemId: qid, itemVersion: 1, activity: "check", attempt: "first", correct: f.correct, errorType: null, response: null,
          assistance: { hints: 0, guided: false, reteachSeen: false, answerShown: false }, unfamiliar: false, independent: false,
          at: at, statusAfter: null, reviewDueAfter: null, source: "legacy-unit3-coach" });
      });
    }
    return out;
  }
  function migrate(db) {
    var incoming = legacyEvents();
    return new Promise(function (resolve) {
      var tx = db.transaction(["events", "meta"], "readwrite"), os = tx.objectStore("events"), added = 0;
      tx.objectStore("meta").put(SCHEMA, "schemaVersion");
      incoming.forEach(function (ev) {
        var g = os.get(ev.id);
        g.onsuccess = function () { if (!g.result) { os.add(ev); added++; } };
      });
      tx.oncomplete = function () {
        if (added) {
          var log = db.transaction("meta", "readwrite").objectStore("meta");
          log.put({ at: now().toISOString(), added: added }, "migration-legacy-unit3-" + now().toISOString());
        }
        resolve(added);
      };
      tx.onerror = function () { resolve(0); };
    });
  }

  var ready = null;
  function init() {
    if (ready) return ready;
    ready = openDb().then(function (db) {
      return flushPending(db).then(function () { return migrate(db); }).then(function () { return { mode: "indexeddb" }; });
    }, function () { return { mode: "fallback" }; });
    return ready;
  }

  // ---------- public API ----------
  function record(input) {
    var ev;
    try { ev = buildEvent(input); } catch (e) { return Promise.reject(e); }
    return init().then(function (st) {
      if (st.mode === "indexeddb") return openDb().then(function (db) { return writeEvent(db, ev); });
      // Fallback: decide firstness from pending events only, and store this event under its own key.
      var saved = finalize(ev, pendingEvents().filter(function (e) { return validate(e) === null; }));
      global.localStorage.setItem(PENDING_PREFIX + saved.id, JSON.stringify(saved));
      if (global.localStorage.getItem(PENDING_PREFIX + saved.id) === null) throw Error("Could not save this attempt");
      saved.savedTo = "browser storage";
      return saved;
    }).then(function (saved) { notify({ type: "event", course: saved.course, objectiveId: saved.objectiveId }); return saved; });
  }

  function events(filter) {
    return init().then(function (st) {
      var p = st.mode === "indexeddb" ? openDb().then(allEvents) : Promise.resolve([]);
      return p.then(function (list) {
        var all = list.concat(pendingEvents().filter(function (pe) { return !list.some(function (e) { return e.id === pe.id; }); }));
        if (!filter) return all;
        return all.filter(function (e) {
          return (!filter.course || e.course === filter.course) && (!filter.objectiveId || e.objectiveId === filter.objectiveId);
        });
      });
    });
  }

  function status(objectiveId) {
    return events({ objectiveId: objectiveId }).then(function (list) { return statusFromEvents(list, objectiveId); });
  }

  function seenItems(objectiveId) {
    return events({ objectiveId: objectiveId }).then(function (list) {
      var s = {}; list.forEach(function (e) { s[e.itemId] = true; }); return s;
    });
  }

  function dataCheck() {
    return events().then(function (list) {
      var out = { total: list.length, valid: 0, invalid: 0, newer: 0, pending: pendingKeys().length, problems: [] };
      list.forEach(function (e) {
        var p = validate(e);
        if (p === null) out.valid++;
        else if (p === "newer") out.newer++;
        else { out.invalid++; if (out.problems.length < 20) out.problems.push({ id: e && e.id, problem: p }); }
      });
      return out;
    });
  }

  global.LearningRecord = {
    DB_NAME: DB_NAME, SCHEMA: SCHEMA, STATUS_LABEL: STATUS_LABEL,
    init: init, record: record, events: events, status: status, seenItems: seenItems, dataCheck: dataCheck,
    statusFromEvents: statusFromEvents, validate: validate, localDay: localDay, addDays: addDays,
    formatDay: function (day) { var p = day.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); },
    onChange: function (fn) { if (typeof fn === "function") listeners.push(fn); }
  };
})(typeof window !== "undefined" ? window : this);
