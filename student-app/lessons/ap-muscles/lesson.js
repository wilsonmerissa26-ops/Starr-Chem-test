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
  function go(id) { current = id; renderNav(); ({ learn: learn, names: names, feel: feel, find: find, guided: guided, lookalikes: lookalikes, independent: independent })[id](); window.scrollTo({ top: 0, behavior: "auto" }); }
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
  function card(k) {
    var m = M.MUSCLES[k];
    return '<div class="mcard"><h3>' + esc(m.name) + "</h3><p><b>Where:</b> " + esc(m.location) + "</p><p><b>Action:</b> " + esc(m.action) + "</p><p><b>Recognize it:</b> " + esc(m.cue) + "</p></div>";
  }
  function lookalikeCard(a, b) {
    var note = M.LOOKALIKE_NOTES[M.pairKey(a, b)];
    if (!note) return "";
    return '<div class="reteach"><b>' + esc(M.MUSCLES[a].name) + " vs. " + esc(M.MUSCLES[b].name) + "</b><p>" + esc(note) + "</p></div>";
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
    var html = '<div class="card"><h2>' + esc(SET.learnTitle) + "</h2><p>" + esc(SET.learnIntro) + "</p>" + songsHtml();
    SET.learn.forEach(function (sec, i) {
      html += "<h3" + (i ? ' style="margin-top:18px"' : "") + ">" + esc(sec.h) + "</h3>" + figure(sec.fig, { labeled: true }) + '<div class="musclecards">' + sec.muscles.map(card).join("") + "</div>";
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
  function rootTable() {
    return N.CATS.map(function (c) {
      var rows = Object.keys(N.ROOTS).filter(function (k) { return N.ROOTS[k].cat === c.id; });
      return "<h3 style=\"margin-top:14px\">" + esc(c.title) + '</h3><div class="roots">' + rows.map(function (k) {
        return '<div class="root"><b>' + esc(k) + "</b><span>" + esc(N.ROOTS[k].m) + "</span>" + (N.ROOTS[k].ex ? '<span class="small muted">' + esc(N.ROOTS[k].ex) + "</span>" : "") + "</div>";
      }).join("") + "</div>";
    }).join("");
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
      "<h3 style=\"margin-top:16px\">Root words for head, neck and trunk muscles</h3>" + rootTable() +
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
        var fresh = !(it.taughtBy && seen[it.taughtBy]);
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
        document.getElementById("gfb").innerHTML = fb("good", "Yes: " + M.MUSCLES[g.muscle].name + ".", "<p>" + esc(M.MUSCLES[g.muscle].cue) + "</p>");
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
        save({ objectiveId: objectiveId(it.objective), itemId: it.id, itemVersion: 1, activity: act, correct: r.correct, errorType: r.errorType,
          response: { typed: resp.text || null, pin: resp.pin || null, matched: r.matched, note: r.note }, unfamiliar: it.unfamiliar, assistance: { hints: 0 } })
          .then(function (ev) { results.push({ it: it, r: r, ev: ev }); feedback(it, r, ev); }, function () { results.push({ it: it, r: r, ev: null }); feedback(it, r, null); });
      }
      var sub = document.getElementById("sub");
      if (sub) {
        sub.onclick = function () { grade({ text: document.getElementById("ans").value }); };
        document.getElementById("ans").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); sub.click(); } });
      }
      document.getElementById("idk").onclick = function () { grade({ dontKnow: true }); };
      if (it.kind === "pin-fn") qEl.querySelector(".fig").addEventListener("click", function (e) { var p = e.target.closest("[data-pin]"); if (p) { p.classList.add("picked"); grade({ pin: p.dataset.pin }); } });
    }
    function feedback(it, r, ev) {
      var m = M.MUSCLES[it.muscle], html;
      if (r.correct) html = fb("good", "Correct: " + m.name + ".", (r.note ? "<p>" + esc(r.note) + "</p>" : "") + "<p><b>Action:</b> " + esc(m.action) + "</p>" + (ev && !ev.independent ? '<p class="small muted">Recorded as practice: this question used a figure you already practiced on.</p>' : ""));
      else {
        var why = r.errorType === "dont-know" ? "No problem. Here is how to recognize it." :
          r.errorType === "incomplete-name" ? r.note :
          r.errorType && r.errorType.indexOf("lookalike") === 0 ? "You named its look-alike, " + M.MUSCLES[r.matched].name + "." :
          r.errorType === "wrong-muscle" ? "That is " + M.MUSCLES[r.matched].name + ", a different region." :
          r.errorType === "no-answer" ? "No answer was entered." : "That name was not recognized as one of the lesson muscles.";
        html = fb("bad", "The answer is " + m.name + ".", "<p>" + esc(why) + "</p>") +
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
