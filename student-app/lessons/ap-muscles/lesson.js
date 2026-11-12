/* A&P pilot lesson engine, shared by every muscle set (head and neck, trunk).
 * The page sets window.MUSCLE_SET; each set's data file supplies its muscles, figures, steps and wording.
 * Flow: learn → decode the names → feel it → find with landmarks → guided pins → look-alikes → on your own → delayed review. */
(function () {
  "use strict";
  var LR = window.LearningRecord, N = window.MuscleNames;
  var M = window.MuscleSets[window.MUSCLE_SET || "head"], SET = M.SET, P = N.SETS[SET.key];
  var SONGS = (window.StudySongs || []).filter(function (x) { return x && x.set === SET.key && x.src; });
  var BASE = { course: "BIO131", objectiveSource: "textbook-prep", source: "lesson-ap-muscles" + (SET.key === "head" ? "" : "-" + SET.key) };
  var STEPS = SET.steps;
  var OBJ_IDS = Object.keys(M.OBJ).map(function (k) { return M.OBJ[k]; });
  var screen = document.getElementById("screen"), nav = document.getElementById("stepnav");
  var current = STEPS[0].id, unlocked = false, viewed = {};

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fb(kind, title, html) { return '<div class="feedback ' + kind + '"><strong>' + esc(title) + "</strong>" + (html || "") + "</div>"; }
  function objectiveId(key) { return M.OBJ[key]; }
  function save(input) {
    return LR.record(Object.assign({}, BASE, input)).then(function (ev) { refreshStatus(); return ev; }, function (e) {
      document.getElementById("review-note").textContent = "This answer could not be saved: " + e.message; throw e;
    });
  }
  function refreshStatus() {
    return LR.events({ course: "BIO131" }).then(function (list) {
      var sts = OBJ_IDS.map(function (id) { return LR.statusFromEvents(list, id); });
      var shown = SET.status.map(function (x) { return { label: x.label, st: LR.statusFromEvents(list, M.OBJ[x.key]) }; });
      shown.push({ label: "Name roots", st: LR.statusFromEvents(list, N.OBJ) });
      var started = sts.concat([shown[shown.length - 1].st]).filter(function (s) { return s.status !== "not-started"; });
      document.getElementById("status-chip").textContent = started.length ? shown.map(function (x) { return x.label + ": " + x.st.label; }).join(" · ") : "Not started";
      var due = sts.filter(function (s) { return s.due; }).length, next = sts.map(function (s) { return s.reviewDue; }).filter(Boolean).sort()[0];
      document.getElementById("review-note").textContent = due ? "New review questions are ready today." : next ? "Next review: " + LR.formatDay(next) : "";
      var guidedDone = M.GUIDED.every(function (g) { return list.some(function (e) { return e.itemId === "ap-ch9-guided-" + g.fig + "-" + g.muscle && e.correct; }); });
      unlocked = guidedDone || list.some(function (e) { return OBJ_IDS.indexOf(e.objectiveId) >= 0 && (e.activity === "independent" || e.activity === "review"); });
      renderNav();
      return { list: list, due: due };
    });
  }
  function renderNav() {
    nav.innerHTML = STEPS.map(function (s) {
      var locked = s.id === "independent" && !unlocked;
      return '<button type="button" data-step="' + s.id + '"' + (s.id === current ? ' aria-current="step"' : "") + (locked ? ' disabled title="Finish the guided pins first"' : "") + ">" + esc(s.label) + (locked ? " 🔒" : "") + "</button>";
    }).join("");
  }
  nav.addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b && !b.disabled) go(b.dataset.step); });
  screen.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
  function go(id) { current = id; renderNav(); ({ deep: deep, learn: learn, names: names, feel: feel, find: find, guided: guided, lookalikes: lookalikes, independent: independent })[id](); window.scrollTo({ top: 0, behavior: "auto" }); }
  // Picture familiarity. A drawing counts as a NEW picture only the first time she answers any question on it, in any lesson.
  // After that, a new question on it is "a picture seen before": still independent, but filed apart from transfer.
  function pictureStatus(fig) {
    var f = M.FIGURES[fig], drawing = f && f.drawing;
    if (!drawing) return Promise.resolve({ drawing: null, firstTime: false });
    return LR.events({ course: "BIO131" }).then(function (list) {
      return { drawing: drawing, firstTime: !list.some(function (e) { return e.response && e.response.drawing === drawing; }) };
    });
  }
  function pictureNote(ev, pic) {
    if (!ev || !ev.independent || !pic || !pic.drawing) return "";
    return '<p class="small muted">' + (pic.firstTime ? "Counted as identifying on a picture you had never seen." : "Counted as a new question on a picture you have seen before, not as a new picture.") + "</p>";
  }
  function nextAfter(id) { var i = STEPS.map(function (s) { return s.id; }).indexOf(id); return STEPS[i + 1] ? STEPS[i + 1].id : null; }
  function nextBtn(to, text) { return '<div class="row" style="margin-top:14px"><button class="btn" type="button" data-go="' + to + '">' + esc(text) + " →</button></div>"; }
  function markViewed(id, activity, objKey) {
    if (viewed[id]) return; viewed[id] = true;
    save({ objectiveId: objKey === "names" ? N.OBJ : objectiveId(objKey || Object.keys(M.OBJ)[0]), itemId: "ap-ch9-" + activity + "-" + id, itemVersion: 1, activity: activity, correct: null }).catch(function () {});
  }
  function figure(fig, opts) {
    opts = opts || {};
    var F = M.FIGURES[fig], pins = M.PINS[fig], keys = opts.pins || Object.keys(pins);
    var html = '<div class="fig"><img src="' + (opts.labeled ? F.labeled : F.img) + '" alt="' + esc(opts.labeled ? F.alt.replace(", labels covered", ", labeled") : F.alt) + '">';
    if (!opts.labeled) keys.forEach(function (k, i) {
      var p = pins[k], cls = opts.marks && opts.marks[k] ? " " + opts.marks[k] : "";
      html += '<button type="button" class="pin' + cls + '" data-pin="' + k + '" style="left:' + p[0] + "%;top:" + p[1] + '%"' + (opts.current === k ? ' aria-current="true"' : "") +
        ' aria-label="Pin ' + (i + 1) + '">' + (i + 1) + "</button>";
    });
    return html + "</div>";
  }
  // ---------- Pronunciation: shown in teaching and after an answer, never before one. Optional, ungraded, never recorded. ----------
  var PR = window.Pronunciations || null;
  function sayIt(name, withSource) {
    var r = PR ? PR.forTerm(name) : null;
    if (!r || !r.ok) return "";
    var html = '<p class="say"><span class="say-label">Say it:</span> <span class="say-r">' + esc(r.text) + "</span>" +
      (r.singular.length ? ' <span class="small muted">(Merriam-Webster gives the singular, ' + esc(r.singular.join(", ")) + ")</span>" : "") + "</p>";
    if (!withSource) return html + hearIt(r);
    return html + '<details class="say-src"><summary>Pronunciation source</summary>' + r.sources.map(function (src) {
      return '<p class="small">' + esc(src.dict) + ", \u201c" + esc(src.entry) + '\u201d: <span class="mw">\\' + esc(src.notation) + "\\</span> · checked " +
        esc(LR.formatDay ? LR.formatDay(src.checked) : src.checked) + ' · <a href="' + esc(src.url) + '" target="_blank" rel="noopener">Hear it on Merriam-Webster</a></p>';
    }).join("") + '<p class="small muted">The first pronunciation listed is used. The audio is on Merriam-Webster\'s site and needs internet; the written form works offline.</p></details>';
  }
  // Under a Say it line after an answer (and on the See screen): one link per dictionary page (Pronunciations.pages).
  function hearIt(r) {
    return '<p class="say-hear small">Hear it on Merriam-Webster: ' + PR.pages(r).map(function (pg) {
      return '<a href="' + esc(pg.url) + '" target="_blank" rel="noopener">' + esc(pg.words.join(" ")) + "</a>";
    }).join(" · ") + ' <span class="muted">(needs internet)</span></p>';
  }
  function sayAloudBox() {
    if (!PR) return "";
    return '<details class="say-aloud"><summary>How to read the pronunciations, plus an optional say-it-aloud practice</summary><p class="small">' + esc(PR.KEY) + "</p>" +
      "<p><b>Say it aloud (optional).</b> Read a muscle's Say it line, say the name out loud twice, then look away and say it once more with what the muscle does.</p>" +
      '<p class="small muted">Never graded and never needed to move on. Skip it anywhere you need to stay quiet. A name with no Say it line has no dictionary pronunciation to check against yet.</p></details>';
  }
  function card(k) {
    var m = M.MUSCLES[k];
    return '<div class="mcard"><h3>' + esc(m.name) + "</h3>" + sayIt(m.name, true) + "<p><b>Where:</b> " + esc(m.location) + "</p><p><b>Action:</b> " + esc(m.action) + "</p><p><b>Recognize it:</b> " + esc(m.cue) + "</p></div>";
  }
  function lookalikeCard(a, b) {
    var note = M.LOOKALIKE_NOTES[M.pairKey(a, b)];
    if (!note) return "";
    return '<div class="reteach"><b>' + esc(M.MUSCLES[a].name) + " vs. " + esc(M.MUSCLES[b].name) + "</b><p>" + esc(note) + "</p></div>";
  }

  // ---------- Start here: one muscle at a time (Decode → See → Move → Explain → Recall → Apply) ----------
  var D = window.DeepLesson && SET.key === "head" ? window.DeepLesson : null;
  if (D) { Object.keys(D.FIGURES).forEach(function (k) { M.FIGURES[k] = D.FIGURES[k]; M.PINS[k] = D.PINS[k]; }); }
  var STAGES = [["decode", "Decode"], ["see", "See"], ["move", "Move"], ["explain", "Explain"], ["recall", "Recall"], ["apply", "Apply"]];
  function stageBar(cur) {
    return '<ol class="stages" aria-label="Stages">' + STAGES.map(function (s, i) {
      var idx = STAGES.map(function (x) { return x[0]; }).indexOf(cur);
      return '<li class="' + (i < idx ? "done" : i === idx ? "now" : "") + '"' + (i === idx ? ' aria-current="step"' : "") + ">" + esc(s[1]) + "</li>";
    }).join("") + "</ol>";
  }
  function deepImg(k) { var f = D.FIG[k]; return '<div class="fig"><img src="' + f.img + '" alt="' + esc(f.alt) + '"></div>'; }
  function deep() {
    LR.events({ course: "BIO131" }).then(function (list) {
      var seen = {}; list.forEach(function (e) { seen[e.itemId] = e; });
      screen.innerHTML = '<div class="card"><h2>Start here: two muscles, step by step</h2>' +
        "<p>Learn one muscle completely before the next. Each one goes through six stages: <b>Decode</b> the name, <b>See</b> it, <b>Move</b> it, <b>Explain</b> why it works, <b>Recall</b> it without labels, then <b>Apply</b> it to something new.</p>" +
        '<div class="musclecards">' + D.LESSONS.map(function (L, i) {
          var applied = L.apply.some(function (q) { return seen[q.id]; });
          return '<div class="mcard"><h3>' + (i + 1) + ". " + esc(L.name) + "</h3><p>" + esc(L.why) + "</p>" + deepHistory(L, list) +
            '<div class="row" style="margin-top:8px"><button type="button" class="btn" data-deep="' + i + '">' + (applied ? "Go through it again" : "Start " + esc(L.name)) + "</button>" +
            (applied ? '<button type="button" class="btn secondary" data-deep-apply="' + i + '">New Apply questions</button>' : "") + "</div></div>";
        }).join("") + "</div>" +
        '<p class="small muted" style="margin-top:10px">Only Apply questions can count as showing it on your own: first try, no help, a question you have not answered before. Identifying, knowing what it does, and using it in a new situation are tracked separately.</p></div>' +
        nextBtn(nextAfter("deep"), "Next: all seven head and neck muscles");
      screen.querySelectorAll("[data-deep]").forEach(function (b) { b.onclick = function () { deepRun(D.LESSONS[Number(b.dataset.deep)], 0); }; });
      screen.querySelectorAll("[data-deep-apply]").forEach(function (b) { b.onclick = function () { deepApply(D.LESSONS[Number(b.dataset.deepApply)]); }; });
    });
  }
  function deepShell(L, stage, body) {
    screen.innerHTML = '<div class="card"><p class="kicker">' + esc(L.name) + "</p>" + stageBar(stage) + body + "</div>";
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function deepNext(L, stage, label) {
    return '<div class="row" style="margin-top:14px"><button class="btn" type="button" id="dnext">' + esc(label || "Next") + " →</button></div>";
  }
  function deepRun(L, partIdx) { deepDecode(L, partIdx || 0); }
  // Decode: one landmark or meaning at a time, then a check.
  function deepDecode(L, i) {
    var parts = L.decode.parts;
    if (i < parts.length) {
      var p = parts[i];
      deepShell(L, "decode", "<h2>Decode: <span class=\"root-word\">" + esc(p.root) + "</span></h2><p><b>" + esc(p.root) + "</b> means <b>" + esc(p.means) + "</b>.</p>" +
        deepImg(p.fig) + "<p>" + esc(p.look) + '</p><p class="small muted">Part ' + (i + 1) + " of " + parts.length + "</p>" + deepNext(L, "decode", i + 1 < parts.length ? "Next part" : "Check the name"));
      markViewed("deep-" + L.key + "-decode-" + i, "teach", L.objective);
      document.getElementById("dnext").onclick = function () { deepDecode(L, i + 1); };
      return;
    }
    var c = L.decode.check, picked = {};
    deepShell(L, "decode", "<h2>Decode check</h2><p class=\"prompt\">" + esc(c.prompt) + '</p><div id="dopts">' + c.options.map(function (o) {
      return '<button type="button" class="choice" data-o="' + esc(o) + '" aria-pressed="false">' + esc(o) + "</button>";
    }).join("") + '</div><div class="row" style="margin-top:10px"><button class="btn" type="button" id="dck" disabled>Check</button></div><div id="dfb"></div>');
    var need = c.answer.length;
    screen.querySelectorAll("[data-o]").forEach(function (b) {
      b.onclick = function () {
        if (screen.querySelector("#dck").dataset.done) return;
        var o = b.dataset.o; picked[o] = !picked[o]; b.classList.toggle("picked", picked[o]); b.setAttribute("aria-pressed", picked[o] ? "true" : "false");
        document.getElementById("dck").disabled = Object.keys(picked).filter(function (k) { return picked[k]; }).length !== need;
      };
    });
    document.getElementById("dck").onclick = function () {
      var ck = this; ck.dataset.done = "1"; ck.disabled = true;
      var chosen = Object.keys(picked).filter(function (k) { return picked[k]; });
      var ok = chosen.length === need && c.answer.every(function (a) { return chosen.indexOf(a) >= 0; });
      screen.querySelectorAll("[data-o]").forEach(function (b) {
        b.classList.remove("picked"); b.disabled = true;
        if (c.answer.indexOf(b.dataset.o) >= 0) b.classList.add("good"); else if (picked[b.dataset.o]) b.classList.add("bad");
      });
      save({ objectiveId: objectiveId(L.objective), itemId: c.id, itemVersion: 1, activity: "guided", correct: ok, errorType: ok ? null : "decode-landmarks",
        response: { chosen: chosen }, assistance: { guided: true } }).catch(function () {});
      document.getElementById("dfb").innerHTML = (ok ? fb("good", "Correct.", "<p>" + esc(c.answer.join(", ")) + ".</p>") : fb("bad", "Not quite.", "<p>" + esc(c.wrong) + "</p>")) +
        deepNext(L, "decode", "See it");
      document.getElementById("dnext").onclick = function () { deepSee(L); };
    };
  }
  function deepSee(L) {
    markViewed("deep-" + L.key + "-see", "teach", L.objective);
    deepShell(L, "see", "<h2>See it</h2>" + sayIt(M.MUSCLES[L.key].name) + figure(L.see.fig, { labeled: true }) + "<p>" + esc(L.see.text) + "</p>" +
      '<details class="more"><summary>More detail</summary>' + card(L.key) + "</details>" + deepNext(L, "see", "Move it"));
    document.getElementById("dnext").onclick = function () { deepMove(L); };
  }
  function deepMove(L) {
    markViewed("deep-" + L.key + "-move", "teach", L.objective);
    var m = M.MUSCLES[L.key];
    deepShell(L, "move", "<h2>Move it</h2><p><b>What it does:</b> " + esc(L.move.action) + "</p>" +
      '<div class="mcard" style="margin-top:12px"><h3>Try it on yourself</h3><p><b>Do this:</b> ' + esc(m.feel.do) + "</p><p><b>Notice:</b> " + esc(m.feel.notice) + "</p></div>" +
      '<details class="more"><summary>Why does its location give that movement?</summary><p>' + esc(L.move.demo) + "</p></details>" +
      deepNext(L, "move", "Explain it"));
    document.getElementById("dnext").onclick = function () { deepExplain(L); };
  }
  // Explain: she writes her own explanation, then compares it with a model and ticks the points she covered.
  // The app does not grade free writing; it records her self-check as practice.
  function deepExplain(L) {
    var X = L.explain;
    deepShell(L, "explain", "<h2>Explain it</h2><p class=\"prompt\">" + esc(X.prompt) + '</p><label class="small muted" for="dexp">Your explanation</label>' +
      '<textarea id="dexp" rows="5" style="width:100%;font:inherit;padding:10px;border-radius:10px;border:1px solid var(--line)"></textarea>' +
      '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="dcmp">Check my explanation</button></div><div id="dfb"></div>');
    document.getElementById("dcmp").onclick = function () {
      var text = document.getElementById("dexp").value.trim();
      this.disabled = true; document.getElementById("dexp").readOnly = true;
      // Check her own words against the key points first; the full model answer is one tap away, so the screen stays short.
      document.getElementById("dfb").innerHTML = "<p style=\"margin-top:12px\"><b>Tick each point your explanation included.</b> Be honest: this is for you, not a score.</p>" +
        X.points.map(function (pt, i) { return '<label class="check-pt"><input type="checkbox" data-pt="' + i + '"> ' + esc(pt) + "</label>"; }).join("") +
        '<details class="more"><summary>See a model answer</summary><p>' + esc(X.model) + "</p></details>" +
        '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="dsc">Save my check</button></div><div id="dfb2"></div>';
      document.getElementById("dsc").onclick = function () {
        this.disabled = true;
        var got = [].slice.call(screen.querySelectorAll("[data-pt]")).filter(function (c) { return c.checked; }).map(function (c) { return Number(c.dataset.pt); });
        save({ objectiveId: objectiveId(L.objective), itemId: X.id, itemVersion: 1, activity: "guided", correct: null,
          response: { wrote: text.length > 0, chars: text.length, pointsCovered: got, pointsTotal: X.points.length }, assistance: { guided: true, answerShown: true } }).catch(function () {});
        var missing = X.points.filter(function (p, i) { return got.indexOf(i) < 0; });
        document.getElementById("dfb2").innerHTML = (missing.length ? fb("info", "Add these to your explanation:", "<ul>" + missing.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul><p>Say the full explanation out loud once before you move on.</p>")
          : fb("good", "Your explanation covered every point.", "")) + deepNext(L, "explain", "Recall it");
        document.getElementById("dnext").onclick = function () { deepRecall(L, 0); };
      };
    };
  }
  // Recall: name on the studied picture without labels, then the action. Practice, not independent.
  // After a wrong answer she says what confused her, and the reteach changes with her answer.
  function confusionAsk(L, A, host, onDone, forId) {
    host.insertAdjacentHTML("beforeend", '<div class="mcard" id="dconf" style="margin-top:10px"><p><b>What tripped you up?</b></p>' +
      D.CONFUSION.map(function (c) { return '<button type="button" class="choice" data-conf="' + c.id + '">' + esc(c.label) + "</button>"; }).join("") + '</div><div id="dconf-fb"></div>');
    host.querySelectorAll("[data-conf]").forEach(function (b) {
      b.onclick = function () {
        host.querySelectorAll("[data-conf]").forEach(function (x) { x.disabled = true; x.classList.toggle("picked", x === b); });
        save({ objectiveId: objectiveId(L.objective), itemId: (forId || A.id) + "-confusion", itemVersion: 1, activity: "teach", correct: null, response: { confusedBy: b.dataset.conf } }).catch(function () {});
        document.getElementById("dconf-fb").innerHTML = '<div class="reteach"><b>Another way to see it</b><p>' + esc(A.explain[b.dataset.conf]) + "</p></div>";
        onDone();
      };
    });
  }
  function deepRecall(L, part) {
    var R = L.recall;
    if (part === 0) {
      deepShell(L, "recall", "<h2>Recall: name it without labels</h2>" + figure(R.fig, { pins: [L.key], current: L.key }) +
        '<p class="prompt">Name the pinned muscle.</p><label class="small muted" for="ans">Muscle name</label><input type="text" id="ans" autocomplete="off" autocapitalize="none" spellcheck="false">' +
        '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="dchk">Check</button></div><div id="dfb"></div>');
      document.getElementById("dchk").onclick = function () {
        var r = M.match(document.getElementById("ans").value, L.key); this.disabled = true; document.getElementById("ans").readOnly = true;
        save({ objectiveId: objectiveId(L.objective), itemId: R.id, itemVersion: 1, activity: "check", correct: r.correct, errorType: r.errorType,
          response: { typed: document.getElementById("ans").value }, unfamiliar: false }).catch(function () {});
        var host = document.getElementById("dfb");
        host.innerHTML = r.correct ? fb("good", "Correct.", (r.note ? "<p>" + esc(r.note) + "</p>" : "") + sayIt(M.MUSCLES[L.key].name)) : fb("bad", "The answer is " + M.MUSCLES[L.key].name + ".", (r.note ? "<p>" + esc(r.note) + "</p>" : "") + sayIt(M.MUSCLES[L.key].name));
        if (r.correct) { host.insertAdjacentHTML("beforeend", deepNext(L, "recall", "Next question")); document.getElementById("dnext").onclick = function () { deepRecall(L, 1); }; }
        else confusionAsk(L, R.action, host, function () { host.insertAdjacentHTML("beforeend", deepNext(L, "recall", "Next question")); document.getElementById("dnext").onclick = function () { deepRecall(L, 1); }; }, R.id);
      };
      return;
    }
    var A = R.action;
    deepShell(L, "recall", "<h2>Recall: what it does</h2><p class=\"prompt\">" + esc(A.prompt) + "</p>" + A.options.map(function (o) {
      return '<button type="button" class="choice" data-a="' + esc(o) + '">' + esc(o) + "</button>"; }).join("") + '<div id="dfb"></div>');
    screen.querySelectorAll("[data-a]").forEach(function (b) {
      b.onclick = function () {
        var ok = b.dataset.a === A.answer;
        screen.querySelectorAll("[data-a]").forEach(function (x) { x.disabled = true; if (x.dataset.a === A.answer) x.classList.add("good"); else if (x === b) x.classList.add("bad"); });
        save({ objectiveId: objectiveId("actions"), itemId: A.id, itemVersion: 1, activity: "check", correct: ok, errorType: ok ? null : "action-wrong",
          response: { chose: b.dataset.a }, unfamiliar: false }).catch(function () {});
        var host = document.getElementById("dfb");
        host.innerHTML = ok ? fb("good", "Correct.", "") : fb("bad", "The answer is: " + A.answer + ".", "");
        var go2 = function () { host.insertAdjacentHTML("beforeend", deepNext(L, "recall", "Apply it to something new")); document.getElementById("dnext").onclick = function () { deepApply(L); }; };
        if (ok) go2(); else confusionAsk(L, A, host, go2);
      };
    });
  }
  // Apply: the only stage that can count as independent. One new question per skill per visit, filed by skill.
  var SKILLS = [{ id: "identify", label: "Identify it on a new picture" }, { id: "function", label: "What it does" }, { id: "apply", label: "A new situation" }];
  function skillObjective(L, skill) { return objectiveId(skill === "identify" ? L.objective : skill === "function" ? "actions" : "application"); }
  function deepApply(L) {
    LR.events({ course: "BIO131" }).then(function (list) {
      var answered = {}; list.forEach(function (e) { answered[e.itemId] = true; });
      var queue = [], notes = [];
      SKILLS.forEach(function (sk) {
        var next = L.apply.filter(function (q) { return q.skill === sk.id && !answered[q.id]; })[0];
        if (next) queue.push(next);
        else if (sk.id === "identify") notes.push(L.noNewPicture);
        else if (L.apply.some(function (q) { return q.skill === sk.id; })) notes.push("You have answered every “" + sk.label.toLowerCase() + "” question for this muscle.");
      });
      var notesHtml = notes.length ? '<div class="feedback info"><strong>Note</strong>' + notes.map(function (n) { return "<p>" + esc(n) + "</p>"; }).join("") + "</div>" : "";
      if (!queue.length) {
        deepShell(L, "apply", "<h2>Apply it</h2>" + notesHtml + "<p>There are no new Apply questions left for this muscle. Repeating an old one would be practice, not new evidence, so keep it fresh with the <b>On your own</b> set.</p>" +
          '<div class="row" style="margin-top:14px"><button class="btn" type="button" id="dback">Back to the two muscles →</button></div>');
        document.getElementById("dback").onclick = deep; return;
      }
      var i = 0, results = [];
      function ask() {
        var q = queue[i], sk = SKILLS.filter(function (s) { return s.id === q.skill; })[0], obj = skillObjective(L, q.skill);
        var hadIndep = list.some(function (e) { return e.objectiveId === obj && e.independent; });
        deepShell(L, "apply", "<h2>Apply it</h2>" + (i === 0 ? notesHtml : "") + '<p class="small muted">Question ' + (i + 1) + " of " + queue.length + " · Skill: <b>" + esc(sk.label) + "</b></p>" +
          (q.kind === "pin" ? figure(q.fig, { pins: [L.key], current: L.key }) : "") + '<p class="prompt">' + esc(q.prompt) + "</p>" +
          '<label class="small muted" for="ans">Muscle name</label><input type="text" id="ans" autocomplete="off" autocapitalize="none" spellcheck="false">' +
          '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="dchk">Check</button></div><div id="dfb"></div>');
        document.getElementById("dchk").onclick = function () {
          var typed = document.getElementById("ans").value, r = M.match(typed, L.key), picRef = { drawing: null, firstTime: false };
          this.disabled = true; document.getElementById("ans").readOnly = true;
          (q.kind === "pin" ? pictureStatus(q.fig) : Promise.resolve(picRef)).then(function (pic) {
            picRef = pic;
            var o = q.skill === "identify" && pic.firstTime && M.OBJ.newpic ? objectiveId("newpic") : obj;
            return save({ objectiveId: o, itemId: q.id, itemVersion: 1, activity: hadIndep ? "review" : "independent", correct: r.correct, errorType: r.errorType,
              response: { typed: typed, skill: q.skill, drawing: pic.drawing, picture: pic.drawing ? (pic.firstTime ? "new" : "seen") : null }, unfamiliar: true, assistance: { hints: 0 } });
          }).then(function (ev) {
            results.push({ skill: sk.label, correct: r.correct });
            var host = document.getElementById("dfb");
            host.innerHTML = (r.correct ? fb("good", "Correct" + (ev && ev.independent ? ", on your own." : "."), (r.note ? "<p>" + esc(r.note) + "</p>" : "") + sayIt(M.MUSCLES[L.key].name) + pictureNote(ev, picRef))
              : fb("bad", "The answer is " + M.MUSCLES[L.key].name + ".", (r.note ? "<p>" + esc(r.note) + "</p>" : "") + sayIt(M.MUSCLES[L.key].name) + pictureNote(ev, picRef) + "<p>This miss stays in your history, even after you get later questions right.</p>")) +
              '<details class="more"><summary>How you could know</summary><ul>' + q.how.map(function (h) { return "<li>" + esc(h) + "</li>"; }).join("") + "</ul>" +
              (q.kind === "pin" && !r.correct ? figure(L.see.fig, { labeled: true }) : "") + "</details>" +
              '<div class="row" style="margin-top:14px"><button class="btn" type="button" id="dnext">' + (i + 1 < queue.length ? "Next question" : "Finish") + " →</button></div>";
            document.getElementById("dnext").onclick = function () { i++; if (i < queue.length) ask(); else done(); };
          }, function () {});
        };
      }
      function done() {
        deepShell(L, "apply", "<h2>Done for today</h2><ul>" + results.map(function (x) { return "<li>" + esc(x.skill) + ": " + (x.correct ? "correct" : "missed") + "</li>"; }).join("") + "</ul>" +
          "<p>Each skill is tracked on its own. Come back tomorrow for different questions.</p>" +
          '<div class="row" style="margin-top:14px"><button class="btn" type="button" id="dback">Back to the two muscles →</button></div>');
        document.getElementById("dback").onclick = deep;
      }
      ask();
    });
  }
  // History of Apply answers for one muscle, oldest first. Misses stay visible after later correct answers.
  function deepHistory(L, list) {
    var ids = {}; L.apply.forEach(function (q) { ids[q.id] = q.skill; });
    var rows = SKILLS.map(function (sk) {
      var ev = list.filter(function (e) { return ids[e.itemId] === sk.id && e.correct !== null; }).sort(function (a, b) { return a.at < b.at ? -1 : 1; });
      if (!ev.length) return "";
      return "<li><b>" + esc(sk.label) + ":</b> " + ev.map(function (e) {
        return (e.correct ? "✓" : "✗") + " " + esc(LR.formatDay(LR.localDay(e.at))) + (e.independent ? "" : " (practice)");
      }).join(", ") + "</li>";
    }).join("");
    return rows ? '<p class="small" style="margin:6px 0 2px"><b>Your history</b> (misses stay here):</p><ul class="small history">' + rows + "</ul>" : "";
  }

  // ---------- Learn ----------
  function songsHtml() {
    if (!SONGS.length) return "";
    return '<div class="mcard songs" style="margin:10px 0"><h3>Study songs</h3><p class="small muted">Listening helps you remember. It counts as learning, not as evidence that you can identify the muscles.</p>' +
      SONGS.map(function (x) {
        return '<div class="song"><p style="margin:8px 0 4px"><b>' + esc(x.title) + "</b>" + (x.muscles && x.muscles.length ? ' <span class="small muted">(' + esc(x.muscles.map(function (k) { return M.MUSCLES[k] ? M.MUSCLES[k].name : k; }).join(", ")) + ")</span>" : "") +
          '</p><audio controls preload="none" data-song="' + esc(x.id) + '" src="' + esc(x.src) + '"></audio>' + (x.lyrics ? '<details><summary>Lyrics</summary><p style="white-space:pre-line">' + esc(x.lyrics) + "</p></details>" : "") + "</div>";
      }).join("") + "</div>";
  }
  function learn() {
    markViewed(SET.learnItem, "teach");
    var html = '<div class="card"><h2>' + esc(SET.learnTitle) + "</h2><p>" + esc(SET.learnIntro) + "</p>" + sayAloudBox() + songsHtml();
    SET.learn.forEach(function (sec, i) {
      // A section without its own figure uses the labeled figure shown above it (hip and thigh: one front figure, three groups).
      html += "<h3" + (i ? ' style="margin-top:18px"' : "") + ">" + esc(sec.h) + "</h3>" + (sec.fig ? figure(sec.fig, { labeled: true }) : "") + '<div class="musclecards">' + sec.muscles.map(card).join("") + "</div>";
    });
    var nx = nextAfter("learn");
    screen.innerHTML = html + "</div>" + (nx ? nextBtn(nx, nx === "names" ? "Learn to decode muscle names" : nx === "feel" ? "Feel each muscle work" : "Next") : "");
    screen.querySelectorAll("audio[data-song]").forEach(function (au) {
      au.addEventListener("play", function () { markViewed("song-" + au.dataset.song, "teach"); }, { once: true });
    });
  }

  // ---------- Feel it: find each muscle on your own body (learning only, never evidence) ----------
  function feel() {
    markViewed(SET.key === "head" ? "feel" : SET.key + "-feel", "teach");
    var keys = []; SET.learn.forEach(function (sec) { keys = keys.concat(sec.muscles); });
    screen.innerHTML = '<div class="card"><h2>Feel it: find each muscle on yourself</h2>' +
      "<p>Doing each action while you touch the spot links the name, the place and the action together. Go through them one at a time. Some muscles are deep: for those you feel what they do, not the muscle itself.</p>" +
      '<div class="musclecards">' + keys.map(function (k) {
        var m = M.MUSCLES[k];
        return '<div class="mcard" data-feel="' + k + '"><h3>' + esc(m.name) + "</h3><p><b>Do this:</b> " + esc(m.feel.do) + "</p><p><b>Notice:</b> " + esc(m.feel.notice) + "</p>" +
          '<p><b>Then say it:</b> "' + esc(m.name) + ": " + esc(m.action.replace(/\.$/, "")) + '."</p>' +
          '<button type="button" class="btn secondary" data-felt="' + k + '">I tried it</button></div>';
      }).join("") + '</div><p class="small muted" id="feel-count" style="margin-top:10px"></p></div>' + nextBtn(nextAfter("feel"), "Next: how to find them on an unlabeled image");
    var done = {};
    screen.querySelectorAll("[data-felt]").forEach(function (b) {
      b.onclick = function () {
        var k = b.dataset.felt; if (done[k]) return; done[k] = true;
        b.disabled = true; b.textContent = "Tried \u2713";
        markViewed((SET.key === "head" ? "" : SET.key + "-") + "feel-" + k, "teach");
        document.getElementById("feel-count").textContent = Object.keys(done).length + " of " + keys.length + " tried. This is learning, not a test.";
      };
    });
  }

  // ---------- 2. Decode the names (teach → worked examples → guided → new names on your own) ----------
  // Roots this set's names use come first; the rest stay one tap away, so the screen stays short.
  function rootTable() {
    var used = {};
    P.worked.concat([P.guided], P.items).forEach(function (it) { it.parts.forEach(function (k) { used[k] = true; }); });
    function table(pick) {
      return N.CATS.map(function (c) {
        var rows = Object.keys(N.ROOTS).filter(function (k) { return N.ROOTS[k].cat === c.id && pick(k); });
        if (!rows.length) return "";
        return "<h3 style=\"margin-top:14px\">" + esc(c.title) + '</h3><div class="roots">' + rows.map(function (k) {
          return '<div class="root" data-root="' + esc(k) + '"><b>' + esc(k) + "</b><span>" + esc(N.ROOTS[k].m) + "</span>" + (N.ROOTS[k].ex ? '<span class="small muted">' + esc(N.ROOTS[k].ex) + "</span>" : "") + "</div>";
        }).join("") + "</div>";
      }).join("");
    }
    return table(function (k) { return used[k]; }) +
      '<details style="margin-top:12px"><summary>Root words from the other lessons</summary>' + table(function (k) { return !used[k]; }) + "</details>";
  }
  function partsLine(parts) {
    return parts.map(function (k) { return "<b>" + esc(k) + "</b> = " + esc(N.ROOTS[k].m); }).join(" · ");
  }
  function names() {
    markViewed("names-teach", "teach", "names");
    screen.innerHTML = '<div class="card"><h2>Decode the name, and it tells you about the muscle</h2>' +
      "<p>Most muscle names are built from Latin or Greek word parts. Each part is a clue about one of seven things: where the muscle is or what it attaches to, its position, shape, size, fiber direction, number of parts, or action.</p>" +
      "<h3>Worked examples" + (SET.key === "head" ? " (muscles you just studied)" : "") + "</h3>" + P.worked.map(function (w) {
        return '<div class="mcard" style="margin:8px 0"><h3>' + esc(w.name) + "</h3><p>" + partsLine(w.parts) + "</p><p><b>So:</b> " + esc(w.tells) + "</p></div>";
      }).join("") +
      '<div class="feedback info"><strong>Names are clues, not the whole story</strong>Some names give only the place, not the action. A few are just old words: <b>masseter</b> is Greek for "chewer" and <b>buccinator</b> is Latin for "trumpeter." You still learn where each muscle sits on a model or image.</div>' +
      "<h3 style=\"margin-top:16px\">Root words for this lesson</h3>" + rootTable() +
      '<p class="small muted" style="margin-top:10px">Categories follow OpenStax <i>Anatomy and Physiology 2e</i>, section 11.2, Naming Skeletal Muscles.</p></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn" type="button" id="toDecodeGuided">Try one with help →</button></div>';
    document.getElementById("toDecodeGuided").onclick = decodeGuided;
  }
  // One decode question: a choice row for each word part. onDone(result) after Check.
  function decodeQuestion(host, item, opts, onDone) {
    var picks = {};
    delete host.dataset.done;
    host.innerHTML = '<p class="prompt">What does each part of <b>' + esc(item.name) + "</b> mean?</p>" + item.parts.map(function (k, i) {
      return '<div class="part" data-part="' + i + '"><p style="margin:10px 0 4px"><b>' + esc(k) + "</b></p>" + N.choices(item.id, k).map(function (c) {
        return '<button type="button" class="choice" data-i="' + i + '" data-c="' + c + '">' + esc(N.ROOTS[c].m) + "</button>";
      }).join("") + "</div>";
    }).join("") + '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="dcheck" disabled>Check</button>' +
      (opts.idk ? '<button class="btn secondary" type="button" id="didk">I don\'t know</button>' : "") + "</div>";
    host.addEventListener("click", function onPick(e) {
      var b = e.target.closest("[data-c]"); if (!b || host.dataset.done) return;
      var i = b.dataset.i; picks[i] = b.dataset.c;
      host.querySelectorAll('[data-i="' + i + '"]').forEach(function (x) { x.classList.toggle("picked", x === b); x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      document.getElementById("dcheck").disabled = Object.keys(picks).length < item.parts.length;
    });
    function finish(dontKnow) {
      host.dataset.done = "1";
      var wrong = dontKnow ? item.parts.slice() : item.parts.filter(function (k, i) { return picks[i] !== k; });
      host.querySelectorAll("[data-c]").forEach(function (x) {
        var i = Number(x.dataset.i), right = x.dataset.c === item.parts[i];
        x.classList.remove("picked");
        if (right) x.classList.add("good"); else if (picks[i] === x.dataset.c) x.classList.add("bad");
        x.disabled = true;
      });
      document.getElementById("dcheck").disabled = true; var idk = document.getElementById("didk"); if (idk) idk.disabled = true;
      onDone({ correct: !dontKnow && wrong.length === 0, wrong: wrong, picks: picks, dontKnow: !!dontKnow });
    }
    document.getElementById("dcheck").onclick = function () { finish(false); };
    if (opts.idk) document.getElementById("didk").onclick = function () { finish(true); };
  }
  function decodeFeedback(item, r) {
    if (r.correct) return fb("good", "Correct.", "<p>" + partsLine(item.parts) + "</p><p><b>So:</b> " + esc(item.tells) + "</p>");
    var lines = r.wrong.map(function (k) {
      var i = item.parts.indexOf(k), chose = r.picks[i];
      var asIn = function (root) { var ex = N.ROOTS[root].ex; return !ex || ex.toLowerCase() === item.name.toLowerCase() ? "" : " (as in " + esc(ex) + ")"; };
      return "<li><b>" + esc(k) + "</b> means <b>" + esc(N.ROOTS[k].m) + "</b>" + asIn(k) + "." +
        (chose && !r.dontKnow ? " You chose “" + esc(N.ROOTS[chose].m) + "”, which is <b>" + esc(chose) + "</b>" + asIn(chose) + "." : "") + "</li>";
    }).join("");
    return fb("bad", r.dontKnow ? "Here is how to decode it." : "Not all parts were right.", "<ul>" + lines + "</ul>") +
      '<div class="reteach"><b>Another way to see it: build the meaning one part at a time.</b><p>' + partsLine(item.parts) + "</p><p><b>So:</b> " + esc(item.tells) + "</p></div>";
  }
  function decodeGuided() {
    var hints = 0, item = P.guided;
    screen.innerHTML = '<div class="card"><h2>Decode one with help</h2><p class="muted small">You can open the root table. This is practice, not independent evidence.</p>' +
      '<div class="row" style="margin-bottom:8px"><button type="button" class="btn secondary" id="dtable">Show the root table</button></div><div id="dtab"></div><div id="dq"></div><div id="dfb"></div></div>';
    document.getElementById("dtable").onclick = function () { hints++; this.disabled = true; document.getElementById("dtab").innerHTML = rootTable(); };
    function ask() {
      document.getElementById("dfb").innerHTML = "";
      decodeQuestion(document.getElementById("dq"), item, { idk: false }, function (r) {
        save({ objectiveId: N.OBJ, itemId: item.id, itemVersion: 1, activity: "guided", correct: r.correct, errorType: r.correct ? null : "root-" + r.wrong[0],
          response: { picks: r.picks }, assistance: { hints: hints, guided: true } }).catch(function () {});
        document.getElementById("dfb").innerHTML = decodeFeedback(item, r) + (r.correct ?
          '<div class="row" style="margin-top:12px"><button class="btn" type="button" id="dind">Decode new names on your own →</button></div>' :
          '<div class="row" style="margin-top:12px"><button class="btn" type="button" id="dagain">Try it again</button></div>');
        if (r.correct) document.getElementById("dind").onclick = decodeIndependent;
        else document.getElementById("dagain").onclick = function () { var q = document.getElementById("dq"); var n = q.cloneNode(false); q.parentNode.replaceChild(n, q); ask(); };
      });
    }
    ask();
  }
  function decodeIndependent() {
    LR.events({ course: "BIO131" }).then(function (all) {
      var list = all.filter(function (e) { return e.objectiveId === N.OBJ; });
      var guidedDone = list.some(function (e) { return e.itemId === P.guided.id && e.correct; });
      if (!guidedDone) { decodeGuided(); return; }
      // seen covers every BIO 131 record, so a name taught on a lesson screen (taughtBy) is known to be no longer new.
      var seen = {}; all.forEach(function (e) { seen[e.itemId] = true; });
      var had = list.some(function (e) { return e.activity === "independent" || e.activity === "review"; });
      var todays = P.items.filter(function (it) { return !seen[it.id]; }).slice(0, 3), activity = had ? "review" : "independent";
      if (!todays.length) { screen.innerHTML = '<div class="card"><h2>You have decoded every name in this set</h2><p>More names come with the next muscle set. Your record is unchanged.</p></div>' + nextBtn(P.after, P.afterLabel.replace(/^Next: /, "")); return; }
      var i = 0, right = 0, counted = 0;
      screen.innerHTML = '<div class="card"><h2>' + (activity === "review" ? "Review: decode new names" : "Decode new names on your own") +
        '</h2><p class="muted small">No root table. Each name is new to you, but every part is one you learned.</p><div id="dq"></div><div id="dfb"></div></div>';
      function next() {
        if (i >= todays.length) {
          refreshStatus();
          document.getElementById("dq").innerHTML = "<h3>" + right + " of " + todays.length + " correct</h3><p>" + counted + " of these were independent attempts (new name, no help, first try). Next time you will get different names.</p>";
          document.getElementById("dfb").innerHTML = '<div class="row"><button class="btn" type="button" data-go="' + P.after + '">' + esc(P.afterLabel) + ' →</button></div>';
          return;
        }
        var it = todays[i], q = document.getElementById("dq"), n = q.cloneNode(false); q.parentNode.replaceChild(n, q);
        document.getElementById("dfb").innerHTML = "";
        // A name she has already seen taught (with its meaning) is no longer new: it counts as practice.
        var fresh = ![].concat(it.taughtBy || []).some(function (t) { return seen[t]; });
        decodeQuestion(n, it, { idk: true }, function (r) {
          if (r.correct) right++;
          save({ objectiveId: N.OBJ, itemId: it.id, itemVersion: 1, activity: fresh ? activity : "check", correct: r.correct,
            errorType: r.correct ? null : r.dontKnow ? "dont-know" : "root-" + r.wrong[0], response: { picks: r.picks, wrongParts: r.wrong },
            unfamiliar: fresh, assistance: { hints: 0 } })
            .then(function (ev) { if (ev && ev.independent) counted++; }, function () {})
            .then(function () {
              document.getElementById("dfb").innerHTML = '<p class="small muted">Name ' + (i + 1) + " of " + todays.length + "</p>" + decodeFeedback(it, r) +
                (fresh ? "" : '<p class="small muted">Recorded as practice: you already studied this muscle in the lesson.</p>') +
                '<div class="row"><button class="btn" type="button" id="dnext">' + (i + 1 < todays.length ? "Next name" : "See my summary") + " →</button></div>";
              document.getElementById("dnext").onclick = function () { i++; next(); };
            });
        });
      }
      next();
    });
  }


  // ---------- Worked example: landmarks first ----------
  function find() {
    markViewed(SET.key === "head" ? "find" : SET.key + "-find", "example");
    var F = SET.find;
    screen.innerHTML = '<div class="card"><h2>How to identify a muscle on an unlabeled image</h2>' +
      "<ol><li><b>Orient yourself.</b> Which view is it: front (anterior), back (posterior), side (lateral), or from below (inferior)?</li><li><b>Find a landmark</b> near the pin: " + esc(F.landmarks) + ".</li>" +
      "<li><b>Follow the line</b> from the pin to where it ends on the muscle.</li><li><b>Check the fiber direction:</b> " + esc(F.fibers) + ".</li>" +
      "<li><b>Say the action</b> to confirm: does that muscle's action make sense where it is?</li></ol>" +
      "<h3>" + esc(F.title) + "</h3>" + figure(F.fig, { pins: F.pins, current: F.current }) +
      '<div class="feedback info"><strong>Think it through</strong>' + F.think + "</div></div>" +
      nextBtn("guided", "Practice with guided pins");
  }

  // ---------- 3. Guided pins (assisted) ----------
  function guided() {
    var idx = 0, hints = 0;
    screen.innerHTML = '<div class="card"><h2>Guided pins</h2><p class="muted small">Choose the name for the highlighted pin. Hints and feedback are on; this is practice, not independent evidence.</p>' +
      '<div id="gfig"></div><p class="prompt" id="gq"></p><div class="row" style="margin-bottom:8px"><button type="button" class="btn secondary" id="ghint">Show a landmark hint</button></div>' +
      '<div class="names" id="gnames"></div><div id="gfb"></div></div>';
    function names() {
      return Object.keys(M.MUSCLES).map(function (k) { return '<button type="button" class="choice" data-name="' + k + '">' + esc(M.MUSCLES[k].name) + "</button>"; }).join("");
    }
    function paint() {
      if (idx >= M.GUIDED.length) {
        document.getElementById("gfig").innerHTML = ""; document.getElementById("gq").textContent = "";
        document.getElementById("gnames").innerHTML = ""; document.getElementById("ghint").style.display = "none";
        document.getElementById("gfb").innerHTML = fb("good", "All " + M.GUIDED.length + " guided pins done.", "<p>Next: compare the look-alikes, then identify muscles on your own on a different view.</p>") + nextBtn("lookalikes", "Compare the look-alikes");
        refreshStatus();
        return;
      }
      var g = M.GUIDED[idx], keys = Object.keys(M.PINS[g.fig]);
      document.getElementById("gfig").innerHTML = figure(g.fig, { current: g.muscle });
      document.getElementById("gq").textContent = "Pin " + (keys.indexOf(g.muscle) + 1) + " (" + (idx + 1) + " of " + M.GUIDED.length + "): which muscle is it?";
      document.getElementById("gnames").innerHTML = names();
      document.getElementById("ghint").disabled = false; document.getElementById("ghint").textContent = "Show a landmark hint"; hints = 0;
    }
    document.getElementById("ghint").onclick = function () {
      var g = M.GUIDED[idx]; if (!g) return; hints++;
      this.disabled = true; this.textContent = "Hint: look at the " + M.MUSCLES[g.muscle].region + ".";
    };
    document.getElementById("gnames").addEventListener("click", function (e) {
      var b = e.target.closest("[data-name]"); if (!b) return;
      var g = M.GUIDED[idx], pick = b.dataset.name, ok = pick === g.muscle;
      var isPair = M.MUSCLES[g.muscle].lookalike === pick || M.MUSCLES[pick].lookalike === g.muscle;
      var err = ok ? null : isPair ? "lookalike-" + M.pairKey(g.muscle, pick).replace("|", "-vs-") : "wrong-muscle";
      var objKey = g.objective;
      save({ objectiveId: objectiveId(objKey), itemId: "ap-ch9-guided-" + g.fig + "-" + g.muscle, itemVersion: 1, activity: "guided", correct: ok, errorType: err,
        response: { picked: pick }, assistance: { hints: hints, guided: true } }).catch(function () {});
      if (ok) {
        document.getElementById("gfb").innerHTML = fb("good", "Yes: " + M.MUSCLES[g.muscle].name + ".", sayIt(M.MUSCLES[g.muscle].name) + "<p>" + esc(M.MUSCLES[g.muscle].cue) + "</p>");
        idx++; setTimeout(paint, 0);
      } else {
        b.classList.add("wrong");
        document.getElementById("gfb").innerHTML = fb("bad", "Not " + M.MUSCLES[pick].name + ".", "<p>" + (isPair ? "That is its look-alike. " : "") +
          "Look again at where the line ends. " + esc(M.MUSCLES[g.muscle].location.split(",")[0].replace(/\.$/, "")) + " is the clue.</p>") +
          (isPair ? lookalikeCard(g.muscle, pick) : '<div class="reteach"><b>Look at the labeled figure, then try again.</b>' + figure(g.fig, { labeled: true }) + "</div>");
      }
    });
    paint();
  }

  // ---------- 4. Look-alikes ----------
  function lookalikes() {
    markViewed(SET.key === "head" ? "lookalikes" : SET.key + "-lookalikes", "teach", "actions");
    screen.innerHTML = '<div class="card"><h2>Tell the look-alikes apart</h2>' +
      SET.pairs.map(function (p) {
        var a = M.MUSCLES[p[0]], b = M.MUSCLES[p[1]];
        return '<h3 style="margin-top:14px">' + esc(a.name) + " vs. " + esc(b.name) + '</h3><div class="compare"><div><b>' + esc(a.name) + "</b><p>" + esc(a.location) + "</p><p><b>Action:</b> " + esc(a.action) + '</p></div><div><b>' + esc(b.name) + "</b><p>" + esc(b.location) + "</p><p><b>Action:</b> " + esc(b.action) + "</p></div></div><p>" + esc(M.LOOKALIKE_NOTES[M.pairKey(p[0], p[1])]) + "</p>";
      }).join("") + "<p class=\"small muted\">Try each pair on yourself, using the Feel it step: doing both actions side by side makes the difference easier to remember.</p></div>" +
      (unlocked ? nextBtn("independent", "Identify them on your own") : '<div class="locked">Finish the guided pins to unlock "On your own."</div>');
  }

  // ---------- 5. Independent (and delayed review) ----------
  function independent() {
    if (!unlocked) { go("guided"); return; }
    LR.events({ course: "BIO131" }).then(function (list) {
      var seen = {}; list.forEach(function (e) { seen[e.itemId] = true; });
      var had = list.some(function (e) { return OBJ_IDS.indexOf(e.objectiveId) >= 0 && (e.activity === "independent" || e.activity === "review"); });
      var todays = M.ITEMS.filter(function (it) { return !seen[it.id]; }).slice(0, 4);
      if (!todays.length) {
        screen.innerHTML = '<div class="card"><h2>You have answered every question in this set</h2><p>New questions and images need to be prepared and checked before more independent evidence can be collected. Your record is unchanged.</p></div>';
        return;
      }
      runSet(todays, had ? "review" : "independent");
    });
  }
  function runSet(items, activity) {
    var i = 0, results = [];
    screen.innerHTML = '<div class="card"><h2>' + (activity === "review" ? "Review: new questions" : "On your own") + '</h2><p class="muted small">No hints. Type the full muscle name. Each question is new, and some use a view you have not practiced.</p><div id="q"></div><div id="qfb"></div></div>';
    function show() {
      if (i >= items.length) { finish(); return; }
      var it = items[i], qEl = document.getElementById("q");
      document.getElementById("qfb").innerHTML = "";
      var head = '<p class="small muted">Question ' + (i + 1) + " of " + items.length + "</p>";
      if (it.kind === "name-pin") {
        var keys = Object.keys(M.PINS[it.fig]);
        qEl.innerHTML = head + figure(it.fig, { pins: [it.muscle], current: it.muscle }) + '<p class="prompt">Type the name of the muscle at the highlighted pin.</p>' +
          '<label class="small muted" for="ans">Muscle name</label><input type="text" id="ans" autocomplete="off" autocapitalize="none" spellcheck="false">' +
          '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="sub">Check</button><button class="btn secondary" type="button" id="idk">I don\'t know</button></div>';
        void keys;
      } else if (it.kind === "name-fn") {
        qEl.innerHTML = head + '<p class="prompt">' + esc(it.prompt) + '</p><label class="small muted" for="ans">Muscle name</label><input type="text" id="ans" autocomplete="off" autocapitalize="none" spellcheck="false">' +
          '<div class="row" style="margin-top:10px"><button class="btn" type="button" id="sub">Check</button><button class="btn secondary" type="button" id="idk">I don\'t know</button></div>';
      } else {
        qEl.innerHTML = head + '<p class="prompt">' + esc(it.prompt) + "</p>" + figure(it.fig, {}) + '<div class="row" style="margin-top:10px"><button class="btn secondary" type="button" id="idk">I don\'t know</button></div>';
      }
      var answered = false;
      function grade(resp) {
        if (answered) return; answered = true;
        var r;
        if (resp.dontKnow) r = { correct: false, errorType: "dont-know", note: null, matched: null };
        else if (it.kind === "pin-fn") {
          var ok = resp.pin === it.muscle, isPair = !ok && (M.MUSCLES[it.muscle].lookalike === resp.pin || M.MUSCLES[resp.pin].lookalike === it.muscle);
          r = { correct: ok, errorType: ok ? null : isPair ? "lookalike-" + M.pairKey(it.muscle, resp.pin).replace("|", "-vs-") : "wrong-muscle", note: null, matched: resp.pin };
        } else r = M.match(resp.text, it.muscle);
        var act = it.unfamiliar ? activity : "check";
        (it.fig ? pictureStatus(it.fig) : Promise.resolve({ drawing: null, firstTime: false })).then(function (pic) {
          // Identification on a never-seen drawing is filed under its own "new pictures" objective.
          var obj = it.unfamiliar && pic.firstTime && M.OBJ.newpic && it.objective !== "actions" ? "newpic" : it.objective;
          return save({ objectiveId: objectiveId(obj), itemId: it.id, itemVersion: 1, activity: act, correct: r.correct, errorType: r.errorType,
            response: { typed: resp.text || null, pin: resp.pin || null, matched: r.matched, note: r.note, drawing: pic.drawing, picture: pic.drawing ? (pic.firstTime ? "new" : "seen") : null },
            unfamiliar: it.unfamiliar, assistance: { hints: 0 } }).then(function (ev) { return { ev: ev, pic: pic }; });
        }).then(function (x) { results.push({ it: it, r: r, ev: x.ev }); feedback(it, r, x.ev, x.pic); }, function () { results.push({ it: it, r: r, ev: null }); feedback(it, r, null, null); });
      }
      var sub = document.getElementById("sub");
      if (sub) {
        sub.onclick = function () { grade({ text: document.getElementById("ans").value }); };
        document.getElementById("ans").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); sub.click(); } });
      }
      document.getElementById("idk").onclick = function () { grade({ dontKnow: true }); };
      if (it.kind === "pin-fn") qEl.querySelector(".fig").addEventListener("click", function (e) { var p = e.target.closest("[data-pin]"); if (p) { p.classList.add("picked"); grade({ pin: p.dataset.pin }); } });
    }
    function feedback(it, r, ev, pic) {
      var m = M.MUSCLES[it.muscle], html;
      if (r.correct) html = fb("good", "Correct: " + m.name + ".", sayIt(m.name) + (r.note ? "<p>" + esc(r.note) + "</p>" : "") + "<p><b>Action:</b> " + esc(m.action) + "</p>" + pictureNote(ev, pic) + (ev && !ev.independent ? '<p class="small muted">Recorded as practice: ' + (it.fig === "face-lateral" ? "this side view is the same drawing as the jaw figure you studied." : "this question used a figure you already practiced on.") + "</p>" : ""));
      else {
        var why = r.errorType === "dont-know" ? "No problem. Here is how to recognize it." :
          r.errorType === "incomplete-name" ? r.note :
          r.errorType && r.errorType.indexOf("lookalike") === 0 ? "You named its look-alike, " + M.MUSCLES[r.matched].name + "." :
          r.errorType === "wrong-muscle" ? "That is " + M.MUSCLES[r.matched].name + ", a different region." :
          r.errorType === "no-answer" ? "No answer was entered." : "That name was not recognized as one of the lesson muscles.";
        html = fb("bad", "The answer is " + m.name + ".", sayIt(m.name) + "<p>" + esc(why) + "</p>" + pictureNote(ev, pic)) +
          '<div class="reteach"><b>Reteach: ' + esc(m.name) + "</b><p><b>Where:</b> " + esc(m.location) + "</p><p><b>Action:</b> " + esc(m.action) + "</p><p><b>Recognize it:</b> " + esc(m.cue) + "</p>" +
          (it.fig ? figure(it.fig === "face-lateral" ? "face-anterior" : it.fig, { labeled: true }) : "") + "</div>" +
          (r.matched && r.matched !== it.muscle ? lookalikeCard(it.muscle, r.matched) : "");
      }
      document.getElementById("qfb").innerHTML = html + '<div class="row"><button class="btn" type="button" id="nextq">' + (i + 1 < items.length ? "Next question" : "See my summary") + " →</button></div>";
      document.getElementById("nextq").onclick = function () { i++; show(); };
    }
    function finish() {
      refreshStatus().then(function () {
        var right = results.filter(function (x) { return x.r.correct; }).length, counted = results.filter(function (x) { return x.ev && x.ev.independent; }).length;
        document.getElementById("q").innerHTML = '<h3>' + right + " of " + results.length + " correct</h3><p>" + counted + " answer" + (counted === 1 ? "" : "s") + " counted as independent evidence (new question, no help, first try).</p>" +
          "<p>Missed muscles will come back on your next review date with different questions. Correct answers on two different questions on two different days is the strongest evidence this app records.</p>";
        document.getElementById("qfb").innerHTML = '<div class="row"><button class="btn secondary" type="button" data-go="learn">Review the muscles</button></div>';
      });
    }
    show();
  }

  LR.init().then(refreshStatus).then(function (r) { if (r && r.due && unlocked) go("independent"); else go(STEPS[0].id); }, function () { go(STEPS[0].id); });
})();
