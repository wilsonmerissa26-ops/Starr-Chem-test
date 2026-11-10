/* Shared lesson engine for concept chapters (Chapter 10 muscle physiology, Chapter 8 articulations).
 * Flow: learn the stages → guided practice (put steps in order, or sort examples) → explain it (self-check) → on your own → review.
 * The page sets window.LESSON (see ap-ch10/ch10.js). Evidence rules are the shared learning record's: only a first, unhelped
 * answer to a new question counts as independent.
 */
(function () {
  "use strict";
  var LR = window.LearningRecord, L = window.LESSON;
  var BASE = { course: "BIO131", objectiveSource: "textbook-prep", source: L.SOURCE };
  var P = L.PREFIX;
  var OBJ_IDS = Object.keys(L.OBJ).map(function (k) { return L.OBJ[k]; });
  var GUIDED = (L.ORDERS || []).map(function (o) { return P + "-order-" + o.id + "-"; }).concat((L.SORTS || []).map(function (s) { return P + "-sort-" + s.id + "-"; }));
  var STEPS = [{ id: "learn", label: L.LEARN_LABEL || "1 · Learn the steps" }, { id: "order", label: L.SORTS ? "2 · Sort them" : "2 · Put them in order" },
    { id: "explain", label: "3 · Explain it" }, { id: "independent", label: "On your own" }];
  var screen = document.getElementById("screen"), nav = document.getElementById("stepnav");
  var current = "learn", unlocked = false, viewed = {}, stage = 0;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fb(kind, title, html) { return '<div class="feedback ' + kind + '"><strong>' + esc(title) + "</strong>" + (html || "") + "</div>"; }
  function topic(key) { return L.STATUS.filter(function (x) { return x.key === key; })[0].label; }
  // Stable shuffle: the same item always shows its choices in the same order, so a reload never reshuffles mid-question.
  function seeded(list, key) {
    var h = 2166136261; for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    var a = list.slice(); for (var j = a.length - 1; j > 0; j--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; var k = h % (j + 1), t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }
  function save(input) {
    return LR.record(Object.assign({}, BASE, input)).then(function (ev) { refreshStatus(); return ev; }, function (e) {
      document.getElementById("review-note").textContent = "This answer could not be saved: " + e.message; throw e;
    });
  }
  function markViewed(id, obj) {
    if (viewed[id]) return; viewed[id] = true;
    save({ objectiveId: L.OBJ[obj], itemId: P + "-teach-" + id, itemVersion: 1, activity: "teach", correct: null }).catch(function () {});
  }
  function refreshStatus() {
    return LR.events({ course: "BIO131" }).then(function (list) {
      var shown = L.STATUS.map(function (x) { return { label: x.label, st: LR.statusFromEvents(list, L.OBJ[x.key]) }; });
      var started = shown.filter(function (x) { return x.st.status !== "not-started"; });
      document.getElementById("status-chip").textContent = started.length ? shown.map(function (x) { return x.label + ": " + x.st.label; }).join(" · ") : "Not started";
      var due = shown.filter(function (x) { return x.st.due; }).length, next = shown.map(function (x) { return x.st.reviewDue; }).filter(Boolean).sort()[0];
      document.getElementById("review-note").textContent = due ? "New review questions are ready today." : next ? "Next review: " + LR.formatDay(next) : "";
      var practiced = GUIDED.every(function (pre) { return list.some(function (e) { return e.itemId.indexOf(pre) === 0; }); });
      unlocked = practiced || list.some(function (e) { return OBJ_IDS.indexOf(e.objectiveId) >= 0 && (e.activity === "independent" || e.activity === "review"); });
      renderNav();
      return { list: list, due: due };
    });
  }
  function renderNav() {
    nav.innerHTML = STEPS.map(function (s) {
      var locked = s.id === "independent" && !unlocked;
      return '<button type="button" data-step="' + s.id + '"' + (s.id === current ? ' aria-current="step"' : "") + (locked ? " disabled title=\"Finish the practice step first\"" : "") + ">" + esc(s.label) + "</button>";
    }).join("");
    Array.prototype.forEach.call(nav.querySelectorAll("button"), function (b) { b.onclick = function () { go(b.getAttribute("data-step")); }; });
  }
  function go(id) { current = id; renderNav(); ({ learn: learn, order: L.SORTS ? sorts : order, explain: explain, independent: independent })[id](); window.scrollTo(0, 0); }
  function nextBtn(step, label) { return '<div class="row" style="margin-top:14px"><button type="button" class="btn" data-go="' + step + '">' + esc(label) + "</button></div>"; }
  function wireGo() { Array.prototype.forEach.call(screen.querySelectorAll("[data-go]"), function (b) { b.onclick = function () { go(b.getAttribute("data-go")); }; }); }
  function practiceDone(id, objs, misses, extra) {
    return Promise.all(objs.map(function (k) {
      return save({ objectiveId: L.OBJ[k], itemId: id + "-" + k, itemVersion: 1, activity: "guided", correct: !misses[k],
        errorType: misses[k] ? (extra.errorType || "sequence-order") : null, assistance: { guided: true }, response: { misses: misses[k] || 0, wrongPicks: extra.wrong } });
    })).catch(function () {});
  }

  // ---------- 1. Learn: one stage per screen ----------
  function learn() {
    var S = L.STAGES[stage];
    markViewed(S.id, S.obj);
    screen.innerHTML = '<div class="card"><p class="small muted">Stage ' + (stage + 1) + " of " + L.STAGES.length + "</p><h2>" + esc(S.title) + "</h2>" +
      (S.fig ? '<figure class="fig"><img src="' + S.fig + '" alt="' + esc(S.alt) + '" loading="lazy"></figure>' : "") +
      '<ul class="points">' + S.points.map(function (p) { return "<li>" + p + "</li>"; }).join("") + "</ul>" +
      '<details class="more"><summary>' + esc(S.more || "If this step fails") + "</summary><p>" + esc(S.fails) + "</p></details>" +
      '<div class="row" style="margin-top:14px">' + (stage > 0 ? '<button type="button" class="btn secondary" id="prevStage">Back</button>' : "") +
      (stage < L.STAGES.length - 1 ? '<button type="button" class="btn" id="nextStage">Next stage</button>' : '<button type="button" class="btn" data-go="order">' + esc(L.SORTS ? "Sort them" : "Put the steps in order") + "</button>") + "</div></div>";
    var p = document.getElementById("prevStage"), n = document.getElementById("nextStage");
    if (p) p.onclick = function () { stage--; learn(); window.scrollTo(0, 0); };
    if (n) n.onclick = function () { stage++; learn(); window.scrollTo(0, 0); };
    wireGo();
  }

  // ---------- 2a. Put it in order (guided: help is shown on every wrong tap) ----------
  function order() {
    var oi = 0;
    function run() {
      var O = L.ORDERS[oi], placed = [], misses = {}, wrongPicks = [];
      var pool = seeded(O.events.map(function (e, i) { return i; }), "order-" + O.id);
      function paint(msg) {
        screen.innerHTML = '<div class="card"><p class="small muted">Sequence ' + (oi + 1) + " of " + L.ORDERS.length + "</p><h2>" + esc(O.title) + "</h2>" +
          "<p>Tap the step that comes next. Wrong taps show a hint; this is practice.</p>" +
          '<ol class="placed">' + placed.map(function (i) { return "<li>" + esc(O.events[i].t) + "</li>"; }).join("") + "</ol>" +
          '<div id="ofb">' + (msg || "") + "</div>" +
          '<div class="choices">' + pool.filter(function (i) { return placed.indexOf(i) < 0; }).map(function (i) {
            return '<button type="button" class="choice" data-i="' + i + '">' + esc(O.events[i].t) + "</button>"; }).join("") + "</div></div>";
        Array.prototype.forEach.call(screen.querySelectorAll(".choice"), function (b) { b.onclick = function () { pick(+b.getAttribute("data-i")); }; });
      }
      function pick(i) {
        var want = placed.length;
        if (i === want) { placed.push(i); if (placed.length === O.events.length) return done(); paint(fb("good", "Yes.", "")); return; }
        var obj = O.events[want].obj; misses[obj] = (misses[obj] || 0) + 1; wrongPicks.push({ wanted: want, picked: i });
        paint(fb("bad", i > want ? "Not yet: that step comes later." : "That step already happened.", "<p>Hint: the next step is part of <b>" + esc(topic(obj)) + "</b>.</p>"));
      }
      function done() {
        var objs = []; O.events.forEach(function (e) { if (objs.indexOf(e.obj) < 0) objs.push(e.obj); });
        practiceDone(P + "-order-" + O.id, objs, misses, { wrong: wrongPicks.length }).then(function () {
          var total = wrongPicks.length;
          screen.innerHTML = '<div class="card"><h2>' + esc(O.title) + ": done</h2>" +
            fb(total ? "info" : "good", total ? "Finished with " + total + " wrong tap" + (total === 1 ? "" : "s") + "." : "Finished with no wrong taps.", "<p>Read the whole sequence once more, top to bottom:</p>") +
            '<ol class="placed">' + O.events.map(function (e) { return "<li>" + esc(e.t) + "</li>"; }).join("") + "</ol>" +
            (oi < L.ORDERS.length - 1 ? '<div class="row" style="margin-top:14px"><button type="button" class="btn" id="nextOrder">Next sequence</button></div>' : nextBtn("explain", "Explain it")) + "</div>";
          var no = document.getElementById("nextOrder"); if (no) no.onclick = function () { oi++; run(); window.scrollTo(0, 0); };
          wireGo();
        });
      }
      paint("");
    }
    run();
  }

  // ---------- 2b. Sort them (guided: a wrong tap shows a clue, the right tap shows why) ----------
  function sorts() {
    var si = 0;
    function run() {
      var S = L.SORTS[si], deck = seeded(S.cards.map(function (c, i) { return i; }), "sort-" + S.id), at = 0, misses = {}, wrong = 0;
      function paint(msg) {
        var c = S.cards[deck[at]];
        screen.innerHTML = '<div class="card"><p class="small muted">Sort ' + (si + 1) + " of " + L.SORTS.length + " · card " + (at + 1) + " of " + deck.length + "</p><h2>" + esc(S.title) + "</h2>" +
          "<p>" + esc(S.intro) + '</p><div id="ofb">' + (msg || "") + '</div><p class="prompt" id="sortCard">' + esc(c.t) + "</p>" +
          '<div class="choices cats">' + S.cats.map(function (k) { return '<button type="button" class="choice" data-cat="' + esc(k.id) + '">' + esc(k.label) + "</button>"; }).join("") + "</div></div>";
        Array.prototype.forEach.call(screen.querySelectorAll("[data-cat]"), function (b) { b.onclick = function () { pick(b.getAttribute("data-cat")); }; });
      }
      function pick(cat) {
        var c = S.cards[deck[at]];
        if (cat !== c.cat) { misses[c.obj] = (misses[c.obj] || 0) + 1; wrong++; paint(fb("bad", "Not quite.", "<p>Clue: " + esc(c.hint) + "</p>")); return; }
        var note = fb("good", "Yes: " + S.cats.filter(function (k) { return k.id === c.cat; })[0].label + ".", "<p>" + esc(c.why) + "</p>");
        at++;
        if (at >= deck.length) return done(note);
        paint(note);
      }
      function done(note) {
        var objs = []; S.cards.forEach(function (c) { if (objs.indexOf(c.obj) < 0) objs.push(c.obj); });
        practiceDone(P + "-sort-" + S.id, objs, misses, { wrong: wrong, errorType: "sort-mixup" }).then(function () {
          screen.innerHTML = '<div class="card"><h2>' + esc(S.title) + ": done</h2>" + note +
            fb(wrong ? "info" : "good", wrong ? "Finished with " + wrong + " wrong tap" + (wrong === 1 ? "" : "s") + "." : "Finished with no wrong taps.", "") +
            '<ul class="points">' + S.cards.map(function (c) { return "<li>" + esc(c.t) + ": <b>" + esc(S.cats.filter(function (k) { return k.id === c.cat; })[0].label) + "</b></li>"; }).join("") + "</ul>" +
            (si < L.SORTS.length - 1 ? '<div class="row" style="margin-top:14px"><button type="button" class="btn" id="nextSort">Next sort</button></div>' : nextBtn("explain", "Explain it")) + "</div>";
          var ns = document.getElementById("nextSort"); if (ns) ns.onclick = function () { si++; run(); window.scrollTo(0, 0); };
          wireGo();
        });
      }
      paint("");
    }
    run();
  }

  // ---------- 3. Explain it (self-check; never graded) ----------
  function explain() {
    var E = L.EXPLAIN;
    screen.innerHTML = '<div class="card"><h2>Explain it</h2><p>' + esc(E.prompt) + "</p>" +
      '<label class="small muted" for="explainBox">Your explanation (stays on this screen; it is not saved or graded)</label><textarea id="explainBox" rows="5"></textarea>' +
      "<p><b>Check yours.</b> Did it include:</p>" + E.checklist.map(function (c, i) { return '<label class="check"><input type="checkbox" id="ex' + i + '"> ' + esc(c) + "</label>"; }).join("") +
      '<details class="more"><summary>Show a model answer</summary><p>' + esc(E.model) + "</p></details>" +
      (unlocked ? nextBtn("independent", "Try it on your own") : '<div class="locked">Finish the practice step to unlock "On your own."</div>') + "</div>";
    markViewed(E.id, E.obj);
    wireGo();
  }

  // ---------- 4. On your own (and next-day review) ----------
  function independent() {
    if (!unlocked) { go("order"); return; }
    LR.events({ course: "BIO131" }).then(function (list) {
      var seen = {}, today = LR.localDay(new Date()); list.forEach(function (e) { seen[e.itemId] = true; });
      var earlier = list.some(function (e) { return OBJ_IDS.indexOf(e.objectiveId) >= 0 && (e.activity === "independent" || e.activity === "review") && LR.localDay(e.at) < today; });
      var todays = L.ITEMS.filter(function (it) { return !seen[it.id]; }).slice(0, L.PER_DAY);
      if (!todays.length) {
        screen.innerHTML = '<div class="card"><h2>You have answered every ' + esc(L.NAME) + ' question here</h2><p>More questions need to be written and checked before more independent evidence can be collected. Your record is unchanged.</p></div>';
        return;
      }
      runSet(todays, earlier ? "review" : "independent", L.ITEMS.filter(function (it) { return !seen[it.id]; }).length - todays.length);
    });
  }
  function runSet(items, activity, left) {
    var i = 0, results = [];
    screen.innerHTML = '<div class="card"><h2>' + (activity === "review" ? "Review: new questions" : "On your own") + '</h2><p class="muted small">No hints. One question per topic. Each question is new.</p><div id="q"></div><div id="qfb"></div></div>';
    function show() {
      if (i >= items.length) return finish();
      var it = items[i], opts = seeded([{ t: it.right.t, ok: true }].concat(it.wrong), it.id);
      document.getElementById("qfb").innerHTML = "";
      document.getElementById("q").innerHTML = '<p class="small muted">Question ' + (i + 1) + " of " + items.length + '</p><p class="prompt">' + esc(it.prompt) + '</p><div class="choices">' +
        opts.map(function (o, k) { return '<button type="button" class="choice" data-k="' + k + '">' + esc(o.t) + "</button>"; }).join("") + "</div>";
      Array.prototype.forEach.call(document.querySelectorAll("#q .choice"), function (b) {
        b.onclick = function () {
          Array.prototype.forEach.call(document.querySelectorAll("#q .choice"), function (x) { x.disabled = true; });
          var o = opts[+b.getAttribute("data-k")];
          b.classList.add(o.ok ? "right" : "wrong");
          save({ objectiveId: L.OBJ[it.obj], itemId: it.id, itemVersion: 1, activity: activity, correct: !!o.ok, errorType: o.ok ? null : o.err,
            unfamiliar: true, response: { choice: o.t } }).then(function (ev) {
            results.push({ it: it, ok: !!o.ok, err: o.err, ev: ev });
            var html = o.ok ? fb("good", "Correct" + (ev.independent ? ", on your own." : "."), "<p>" + esc(it.right.why) + "</p>")
              : fb("bad", "The answer is: " + it.right.t, "<p><b>Why your choice doesn't fit:</b> " + esc(o.why) + "</p><p>" + esc(it.right.why) + "</p><p>This miss stays in your history, even after you get later questions right.</p>");
            document.getElementById("qfb").innerHTML = html + '<div class="row" style="margin-top:10px"><button type="button" class="btn" id="nextq">' + (i < items.length - 1 ? "Next question" : "See results") + "</button></div>";
            document.getElementById("nextq").onclick = function () { i++; show(); };
          }, function () {});
        };
      });
    }
    function finish() {
      var right = results.filter(function (r) { return r.ok; }).length, misses = results.filter(function (r) { return !r.ok; });
      var stageFor = function (r) {
        var want = r.it.stage || L.MIXUP_STAGE[r.err];
        for (var s = 0; s < L.STAGES.length; s++) if (want ? L.STAGES[s].id === want : L.STAGES[s].obj === r.it.obj) return s;
        return 0;
      };
      screen.innerHTML = '<div class="card"><h2>' + right + " of " + results.length + " correct</h2>" +
        (misses.length ? "<p><b>Mix-ups to look at:</b></p><ul>" + misses.map(function (r) {
          return "<li>" + esc(L.MIXUPS[r.err] || "this topic") + ' <button type="button" class="linkbtn" data-stage="' + stageFor(r) + '">Review: ' + esc(L.STAGES[stageFor(r)].title) + "</button></li>"; }).join("") + "</ul>"
          : "<p>No misses today.</p>") +
        '<p class="small muted">Tomorrow this step gives you new questions, one per topic, so you can check that it stuck.</p>' +
        (left > 0 ? '<p class="small muted">Short on days before the exam? You can take the next ' + Math.min(left, L.PER_DAY) + " new questions now instead of tomorrow. Spacing them out helps memory more, so only do this if you need to.</p>" +
          '<div class="row"><button type="button" class="btn secondary" id="moreNow">Optional: ' + Math.min(left, L.PER_DAY) + " more now</button></div>" : "") + "</div>";
      Array.prototype.forEach.call(screen.querySelectorAll("[data-stage]"), function (b) { b.onclick = function () { stage = +b.getAttribute("data-stage"); go("learn"); }; });
      var more = document.getElementById("moreNow"); if (more) more.onclick = function () { independent(); window.scrollTo(0, 0); };
    }
    show();
  }

  LR.init().then(refreshStatus).then(function (r) {
    if (r && r.due && unlocked) go("independent"); else go("learn");
  }, function () { go("learn"); });
})();
