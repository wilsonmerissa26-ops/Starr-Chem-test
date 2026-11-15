/* CHM 221 Test 4 practice lessons (Chapter 8 alkenes, Chapter 9 alkynes, curved arrows).
 *
 * Every problem runs WATCH → DRAW WITH HELP → DRAW ALONE → EXPLAIN → REVIEW, and drawing on paper is required:
 *   1. name what changes (the reagent's job, or the move in a mechanism step)      checked by the app
 *   2. draw it on paper (the app waits until she says she has)
 *   3. commit: which drawing matches hers ("none match" allowed), or tap the arrows  checked by the app
 *   4. compare with the checked solution, one specific mistake at a time            her own check, recorded as practice
 *   5. explain why in one sentence, then compare with the key idea                  her own check, recorded as practice
 * Evidence uses the shared learning record (../../learning-record.js) unchanged: only a first, unhelped answer to a new
 * problem counts as independent, and "shown on 2 days" needs two different problems right on two different days.
 * The app cannot see her paper, so her pen work is never counted as evidence; a tutor's review is the real check.
 */
(function () {
  "use strict";
  var LR = window.LearningRecord, KEY = document.body.getAttribute("data-lesson"), D = window.T4DATA && window.T4DATA[KEY];
  var screen = document.getElementById("screen"), nav = document.getElementById("stepnav");
  if (!D) { screen.innerHTML = '<div class="card"><p>This lesson could not load. Your saved work is not affected.</p></div>'; return; }
  var OBJ = { course: "CHM221", objectiveId: D.objectiveId, objectiveSource: "textbook-prep", source: D.source };
  var MECH = KEY === "arrows";
  var STEPS = [{ id: "watch", label: "1 · Watch" }, { id: "help", label: "2 · Draw with help" }, { id: "alone", label: "3 · Draw alone" }, { id: "review", label: "4 · Review" }];
  var current = "watch", unlocked = false, viewed = {}, saveProblem = null, lastList = [], status = null;

  // ---------- helpers ----------
  var SVGNS = "http://www.w3.org/2000/svg";
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function fb(kind, title, html) { return '<div class="feedback ' + kind + '"><strong>' + esc(title) + "</strong>" + (html || "") + "</div>"; }
  function seeded(list, key) {
    var h = 2166136261; for (var i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
    var a = list.slice(); for (var j = a.length - 1; j > 0; j--) { h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0; var k = h % (j + 1), t = a[j]; a[j] = a[k]; a[k] = t; }
    return a;
  }
  function card(key) { return D.cards.filter(function (c) { return c.key === key; })[0]; }
  function moveCard(type) { return card(D.cardOf[type]); }
  function cardHtml(c, open) {
    if (!c) return "";
    if (c.rule) return '<details class="rcard"' + (open ? " open" : "") + "><summary><b>" + esc(c.name) + "</b></summary><p><b>Rule:</b> " + esc(c.rule) + "</p><p><b>Check:</b> " + esc(c.check) + "</p>" + (c.svg ? '<div class="fig">' + c.svg + "</div>" : "") + "</details>";
    return '<details class="rcard"' + (open ? " open" : "") + "><summary><b>" + esc(c.reagent || c.name) + "</b></summary><p><b>" + (c.reagent ? "Job" : "What happens") + ":</b> " + esc(c.job) + "</p><p><b>" + (c.reagent ? "Why" : "Arrows") + ":</b> " + esc(c.why) + "</p></details>";
  }
  function byId(id) { return D.guided.concat(D.independent, D.targeted, D.example && D.example.id ? [D.example] : []).filter(function (x) { return x.id === id; })[0]; }
  function tagText(tag) { return (D.tags && D.tags[tag]) || (D.errors && D.errors[tag]) || ""; }
  function el(id) { return document.getElementById(id); }

  function save(input) {
    return LR.record(Object.assign({}, OBJ, input)).then(function (ev) { saveProblem = null; refreshStatus(); return ev; }, function (e) {
      saveProblem = e.message; var n = el("review-note"); if (n) n.textContent = "This answer could not be saved: " + e.message; throw e;
    });
  }
  function markViewed(id, activity) {
    if (viewed[id]) return; viewed[id] = true;
    save({ itemId: D.prefix + "-" + activity + "-" + id, itemVersion: 1, activity: activity, correct: null }).catch(function () {});
  }
  // The first guided mechanism shows its step 1 worked out, so that step has no answer of hers to require.
  function partsOf(g) {
    if (MECH) return g.steps.map(function (_, k) { return g.id + "-s" + (k + 1); }).slice(g === D.guided[0] ? 1 : 0);
    if (g.kind === "parts") return g.parts.map(function (_, i) { return g.id + "-p" + (i + 1); });
    return g.kind === "job" ? [g.id + "-p1"] : [g.id + "-p1", g.id + "-p2"];
  }
  function itemDone(g, list) { return partsOf(g).every(function (pid) { return list.some(function (e) { return e.itemId === pid && e.correct; }); }); }
  function refreshStatus() {
    return LR.events({ objectiveId: OBJ.objectiveId }).then(function (list) {
      lastList = list;
      var st = LR.statusFromEvents(list, OBJ.objectiveId); status = st;
      el("status-chip").textContent = st.label;
      var note = st.status === "not-started" ? "" : st.due ? "A new review problem is ready today." : st.reviewDue ? "Next review: " + LR.formatDay(st.reviewDue) : "";
      if (!saveProblem) el("review-note").textContent = note;
      unlocked = D.guided.every(function (g) { return itemDone(g, list); }) || list.some(function (e) { return e.activity === "independent" || e.activity === "review"; });
      renderNav();
      return { list: list, st: st };
    });
  }
  function hadAlone(list) { return list.some(function (e) { return (e.activity === "independent" || e.activity === "review") && e.correct !== null; }); }
  function renderNav() {
    nav.innerHTML = STEPS.map(function (s) {
      var locked = (s.id === "alone" || s.id === "review") && !unlocked;
      var lab = s.label + (s.id === "review" && status && status.due && hadAlone(lastList) ? " (due)" : "");
      return '<button type="button" data-step="' + s.id + '"' + (s.id === current ? ' aria-current="step"' : "") + (locked ? ' disabled title="Finish Draw with help first"' : "") + ">" + esc(lab) + (locked ? " 🔒" : "") + "</button>";
    }).join("");
  }
  nav.addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b && !b.disabled) go(b.dataset.step); });
  screen.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
  function go(id, arg) { current = id; renderNav(); ({ watch: watch, help: help, alone: alone, review: review, practice: practice })[id](arg); window.scrollTo({ top: 0, behavior: "auto" }); }
  function nextBtn(to, text) { return '<div class="row" style="margin-top:14px"><button class="btn" type="button" data-go="' + to + '">' + esc(text) + " →</button></div>"; }

  // ---------- 1. WATCH: the cards, then a worked example ----------
  function watch() {
    markViewed("cards", "teach");
    var intro = KEY === "structures"
      ? "<p>Everything on Test 4 is drawn. These are the drawing skills underneath every reaction: reading a bond-line drawing, turning a name or formula into one, showing 3D with wedges, dashes, Newman projections and chairs, and checking your own drawing for errors. <b>Draw on paper every time the app asks.</b> The app checks what it can; your tutor checks your pen work.</p>"
      : MECH
      ? "<p>Every mechanism on Test 4 is built from four moves. For each step: <b>name the move</b>, <b>draw its arrows</b> (each starts at a lone pair or a bond and points where those electrons go), then <b>mark where the charges end up</b>.</p>"
      : "<p>For every problem: <b>name the reagent's job</b>, then <b>draw the product yourself</b>: number the carbons, find the bonds that break and form, and put every new group on its carbon and its face. Knowing the job but drawing the wrong product is a different problem from not knowing the job, and the app gives you different practice for each.</p>";
    var cards = D.families ? Object.keys(D.families).map(function (f) {
      return "<h3>" + esc(D.families[f]) + "</h3>" + D.cards.filter(function (c) { return c.family === f; }).map(function (c) { return cardHtml(c, false); }).join("");
    }).join("") : D.cards.map(function (c) { return cardHtml(c, true); }).join("");
    screen.innerHTML = '<div class="card"><div class="eyebrow">Watch</div><h2>' + esc(KEY === "structures" ? "The drawing rules" : MECH ? "The four moves" : "What each reagent does") + "</h2>" + intro + cards +
      '<p class="small muted">Say each job out loud before you open its card.</p></div><div id="exbox"></div>';
    if (MECH) { var box = el("exbox"); box.innerHTML = '<div class="card" id="mechex"></div>'; runMechanism(D.example, "example", { host: "mechex" }); return; }
    markViewed("example", "example");
    var ex = D.example, stage = 0, n = ex.stages.length;
    el("exbox").innerHTML = '<div class="card"><div class="eyebrow">Watch a worked example</div><h2>' + esc(ex.title) + '</h2><p class="small muted">Draw along on paper as you go.</p><div id="exfig" class="fig"></div><p class="prompt" id="excap"></p><p class="small muted" id="exsay"></p>' +
      '<div class="row"><button class="btn secondary" type="button" id="exb">◀ Previous</button><button class="btn" type="button" id="exf">Next ▶</button><span class="small muted" id="excount"></span></div></div>' + nextBtn("help", "Draw one with help");
    function paint() {
      var s = ex.stages[stage], prev = null;
      for (var k = stage; k >= 0; k--) if (ex.stages[k].svg) { prev = ex.stages[k].svg; break; }
      el("exfig").innerHTML = s.svg || prev || "";
      el("excap").textContent = s.caption; el("exsay").textContent = "Say it: " + s.say;
      el("excount").textContent = "Step " + (stage + 1) + " of " + n;
      el("exb").disabled = stage === 0; el("exf").disabled = stage === n - 1;
    }
    el("exb").onclick = function () { stage--; paint(); };
    el("exf").onclick = function () { stage++; paint(); };
    paint();
  }

  // ---------- 2. DRAW WITH HELP ----------
  // For a beginner, Draw with help walks through every reagent (or move) once: the core guided problems first,
  // then one practice problem per reagent, grouped by family. Draw alone unlocks after the core ones.
  function helpQueue() {
    var fams = D.families ? Object.keys(D.families) : [];
    var extra = D.targeted.slice().sort(function (a, b) { return fams.indexOf(a.family) - fams.indexOf(b.family); });
    return D.guided.concat(extra);
  }
  function help() {
    var q = helpQueue(), g = q.filter(function (x) { return !itemDone(x, lastList); })[0] || D.guided[0];
    go("practice", { item: g, mode: "guided" });
  }
  function practice(arg) {
    current = arg.mode === "targeted" ? "alone" : arg.mode === "guided" ? "help" : current; renderNav();
    if (MECH) runMechanism(arg.item, arg.mode, arg); else if (arg.item.kind === "parts") runParts(arg.item, arg.mode); else runProduct(arg.item, arg.mode, arg);
  }
  function afterGuided(item, box) {
    var nextG = null;
    return refreshStatus().then(function () {
      var q = helpQueue(), left = q.filter(function (x) { return x !== item && !itemDone(x, lastList); });
      var coreLeft = left.filter(function (x) { return D.guided.indexOf(x) >= 0; });
      nextG = coreLeft[0] || left[0];
      var done = q.length - left.length;
      var h;
      if (!unlocked && coreLeft.length) h = '<div class="row" style="margin-top:12px"><button class="btn" type="button" id="gnext">Next: draw another with help →</button></div>';
      else if (unlocked && nextG) h = '<div class="feedback info"><strong>Draw alone is open.</strong>You have practiced ' + done + " of " + q.length + " with help. If any of this still feels new, keep going with help first: one problem per " + (MECH ? "move" : KEY === "structures" ? "skill" : "reagent") + ".</div>" +
        '<div class="row" style="margin-top:12px"><button class="btn" type="button" id="gnext">Next with help (' + left.length + ' left) →</button><button class="btn secondary" type="button" data-go="alone">Draw alone</button></div>';
      else h = '<div class="feedback info"><strong>Draw with help ' + (unlocked ? "complete." : "finished for now.") + "</strong>" +
          (unlocked ? "Next, Draw alone: a new problem, no hints. Draw it on paper before the app shows anything else." : "Get every part right once (retries are fine) to unlock Draw alone.") + "</div>" + (unlocked ? nextBtn("alone", "Draw alone") : "");
      (box || el("after")).insertAdjacentHTML("beforeend", h);
      var b = el("gnext"); if (b) b.onclick = function () { go("practice", { item: nextG, mode: "guided" }); };
    });
  }

  // ---------- 3/4. DRAW ALONE and REVIEW ----------
  function pickNew(list) {
    var seen = {}; list.forEach(function (e) { seen[e.itemId] = true; });
    var pool = D.independent.filter(function (p) { return !seen[p.id]; });
    var answered = list.filter(function (e) { return (e.activity === "independent" || e.activity === "review") && e.correct !== null; });
    // Error-specific review: after a miss, the next new problem comes from the same family (or uses the same mechanism move).
    var lastMiss = answered.filter(function (e) { return e.correct === false; }).sort(function (a, b) { return a.at < b.at ? 1 : -1; })[0];
    if (lastMiss && lastMiss.response) {
      var fam = lastMiss.response.family, pat = lastMiss.response.pattern;
      var match = pool.filter(function (p) { return MECH ? p.steps.some(function (s) { return s.type === pat; }) : p.family === fam; });
      if (match.length) pool = match.concat(pool.filter(function (p) { return match.indexOf(p) < 0; }));
    }
    return pool[0];
  }
  function alone() { openNew(false); }
  function review() { openNew(true); }
  function openNew(fromReview) {
    if (!unlocked) { go("help"); return; }
    LR.events({ objectiveId: OBJ.objectiveId }).then(function (list) {
      lastList = list;
      var had = hadAlone(list), st = LR.statusFromEvents(list, OBJ.objectiveId);
      if (fromReview && !had) {
        screen.innerHTML = '<div class="card"><h2>Review opens after Draw alone</h2><p>Do one Draw alone problem first. Its review comes on a later day, with a new molecule.</p>' + nextBtn("alone", "Draw alone") + "</div>"; return;
      }
      if (had && !st.due) {
        screen.innerHTML = '<div class="card"><h2>Next review: ' + esc(st.reviewDue ? LR.formatDay(st.reviewDue) : "later") + "</h2><p>You've done today's problem on your own. A new one opens on your review date, because a problem done on a later day is stronger evidence than two in a row.</p>" +
          '<p>Until then: redraw any missed problem from blank paper, or draw another with help.</p><div class="row"><button class="btn secondary" type="button" data-go="help">Draw with help</button><button class="btn secondary" type="button" data-go="watch">Watch again</button></div></div>';
        return;
      }
      var item = pickNew(list);
      if (!item) { screen.innerHTML = '<div class="card"><h2>You have tried every problem in this set</h2><p>New problems need to be written and checked before more independent evidence can be collected. Your record is unchanged.</p></div>'; return; }
      current = had ? "review" : "alone"; renderNav();
      if (MECH) runMechanism(item, had ? "review" : "independent"); else if (item.kind === "parts") runParts(item, had ? "review" : "independent"); else runProduct(item, had ? "review" : "independent");
    });
  }

  // ---------- shared: the paper-drawing gate, compare-with-solution and explain stages ----------
  function drawGate(id, what, steps) {
    return '<div class="drawbox" id="' + id + '"><p class="prompt">✏️ ' + esc(what) + "</p><ol class=\"partlist\">" + steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") +
      '</ol><button type="button" class="btn" id="' + id + '-done">I drew it on paper →</button></div>';
  }
  // Compare: the checked answer, then each specific mistake she might have made, each with its own explanation.
  function compareHtml(id, solutionHtml, checks, mistakes) {
    return '<div class="card compare" id="' + id + '"><div class="eyebrow">Compare with the checked solution</div>' + solutionHtml +
      "<p class=\"prompt\">Check your paper, one thing at a time:</p><ul class=\"checks\">" + checks.map(function (c) { return "<li>" + c + "</li>"; }).join("") + "</ul>" +
      (mistakes.length ? '<p class="prompt">Did your drawing make any of these mistakes? Tap each one you made.</p><div class="mistakes">' + mistakes.map(function (m) {
        return '<button type="button" class="mistake" data-mistake="' + esc(m.tag) + '" aria-pressed="false">' + (m.svg ? '<span class="mfig">' + m.svg + "</span>" : "") + '<span class="mtext"><b>' + esc(m.title) + "</b><br>" + esc(m.text) + "</span></button>";
      }).join("") + "</div>" : "") +
      '<div class="row"><button type="button" class="btn secondary" id="' + id + '-none">My drawing matched</button><button type="button" class="btn" id="' + id + '-done">Done comparing →</button></div><div id="' + id + '-fb"></div></div>';
  }
  function wireCompare(id, onDone) {
    var picked = [];
    el(id).querySelectorAll("[data-mistake]").forEach(function (b) {
      b.onclick = function () {
        var t = b.dataset.mistake, on = picked.indexOf(t) < 0;
        if (on) picked.push(t); else picked.splice(picked.indexOf(t), 1);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      };
    });
    el(id + "-none").onclick = function () { picked = []; el(id).querySelectorAll("[data-mistake]").forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); finish(); };
    el(id + "-done").onclick = finish;
    function finish() {
      el(id + "-done").disabled = true; el(id + "-none").disabled = true;
      el(id + "-fb").innerHTML = picked.length ? fb("info", "Fix them on your paper now.", "<p>Redraw the corrected structure next to your first try. Tomorrow, redraw it once more from blank paper.</p>") : fb("good", "Good. Keep that drawing to show your tutor.", "");
      onDone(picked);
    }
  }
  function explainHtml(id, prompt, key) {
    return '<div class="card" id="' + id + '"><div class="eyebrow">Explain</div><p class="prompt">' + esc(prompt) + '</p><textarea id="' + id + '-text" rows="3" class="explain" placeholder="One sentence, in your own words"></textarea>' +
      '<div class="row"><button type="button" class="btn" id="' + id + '-show">Compare with the key idea</button></div><div id="' + id + '-key" hidden><div class="feedback info"><strong>Key idea</strong><p>' + esc(key) + '</p></div><p class="prompt">Did your sentence say the same thing?</p>' +
      '<div class="row"><button type="button" class="choice" data-rate="yes">Yes</button><button type="button" class="choice" data-rate="partly">Partly</button><button type="button" class="choice" data-rate="no">No</button></div></div></div>';
  }
  function wireExplain(id, onDone) {
    el(id + "-show").onclick = function () { el(id + "-key").hidden = false; this.disabled = true; };
    el(id).querySelectorAll("[data-rate]").forEach(function (b) {
      b.onclick = function () {
        el(id).querySelectorAll("[data-rate]").forEach(function (x) { x.disabled = true; x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        onDone(b.dataset.rate, el(id + "-text").value.trim());
      };
    });
  }
  // Her own check of her paper and her explanation: recorded as practice (the answer was shown), never as evidence.
  function saveSelfCheck(item, mistakes, rate, text) {
    return save({ itemId: item.id + "-selfcheck", itemVersion: 1, activity: "check", correct: !mistakes.length && rate === "yes",
      errorType: mistakes.length ? "drawing:" + mistakes[0] : rate !== "yes" ? "explain:" + rate : null,
      response: { drawingMistakes: mistakes, explainRating: rate, explanation: text.slice(0, 600) },
      assistance: { hints: 0, answerShown: true } }).catch(function () {});
  }

  // ---------- product, synthesis and base-choice problems ----------
  function runProduct(item, mode) {
    var helped = mode !== "independent" && mode !== "review", hints = 0, reteach = false, done = false;
    var ans = { p1: null, p2: null }, firstWrong = { p1: null, p2: null }, solved = { p1: false, p2: false }, drew = false;
    var isSyn = item.kind === "synthesis", isJob = item.kind === "job";
    var p1Opts = isJob ? item.choices.map(function (c, i) { return { k: "c" + i, text: c.text, ok: c.tag === "correct", tag: c.tag }; })
      : isSyn ? item.seqs.map(function (c, i) { return { k: "s" + i, text: c.text, ok: c.tag === "correct", tag: c.tag }; })
      : item.jobs.map(function (j) { return { k: j.key, text: j.text, ok: j.correct, tag: j.correct ? "correct" : "job:" + j.key }; });
    p1Opts = seeded(p1Opts, item.id + "-1");
    var p2Opts = isJob ? [] : seeded(item.products.map(function (p, i) { return { k: "p" + i, svg: p.svg, ok: p.tag === "correct", tag: p.tag }; }), item.id + "-2");
    if (!isJob) p2Opts.push({ k: "none", svg: null, ok: false, tag: "none-match" });
    var heading = mode === "independent" ? "Draw alone" : mode === "review" ? "Review: a new problem" : mode === "targeted" ? "Your next practice (with help)" : "Draw with help";
    var stem = isSyn || isJob ? esc(item.question) : esc(item.smName) + " + " + esc(item.reagent);
    var q1 = isSyn ? "1. Choose the reagents, in order." : isJob ? "Choose one." : "1. What does " + esc(item.reagent) + " do here?";
    var drawWhat = isSyn ? "2. On paper: draw the alkyne you make after step 2, then the target." : "2. On paper: draw the product.";
    var drawSteps = isSyn ? ["Draw the starting material and number its carbons.", "Draw each molecule your reagents make, in order.", "Count the carbons in the target: does your route add the right number?"]
      : ["Copy the starting material. Number its carbons.", "Circle the bond that reacts. Say which bonds break and which form.", "Draw the product: every carbon, each new group on its carbon, wedges and dashes where groups go on a face.", "If a stereocenter forms, write racemic, meso, or one enantiomer next to it."];
    screen.innerHTML = '<div class="card"><div class="eyebrow">' + esc(heading) + "</div><h2>" + stem + "</h2>" +
      (helped ? '<p class="muted small">Hints and feedback are on. This counts as practice, not independent evidence.</p>' : '<p class="muted small">A new problem, no hints shown. Opening the reagent card is allowed, but then this attempt counts as practice.</p>') +
      '<div class="rxn"><div class="fig">' + item.smSvg + "</div>" + (isSyn ? '<div class="arrow">→ ? →</div><div class="fig">' + item.targetSvg + "</div>" : isJob ? "" : '<div class="arrow">→<br><span class="small">' + esc(item.reagent) + "</span></div>") + "</div>" +
      '<p class="prompt">' + q1 + '</p><div id="p1">' + p1Opts.map(function (o) { return '<button type="button" class="choice" data-p1="' + o.k + '" aria-pressed="false">' + esc(o.text) + "</button>"; }).join("") + '</div><div id="fb1"></div>' +
      (isJob ? "" : '<div id="gatebox"></div><div id="p2wrap" hidden><p class="prompt">3. Which drawing matches yours?</p><p class="small muted">If none of them matches what you drew, say so: that is useful too.</p><div id="p2" class="opts">' +
        p2Opts.map(function (o) { return '<button type="button" class="opt' + (o.k === "none" ? " none" : "") + '" data-p2="' + o.k + '" aria-pressed="false">' + (o.svg || "<b>None of these matches my drawing</b>") + "</button>"; }).join("") + '</div><div id="fb2"></div></div>') +
      '<div class="row" style="margin-top:12px">' + (helped ? '<button type="button" class="btn secondary" id="hint">Show a hint</button>' : '<button type="button" class="btn secondary" id="hint">Show me the reagent card (counts as help)</button><button class="btn" type="button" id="check" disabled>Check my answer</button>') + '</div><div id="hintbox"></div><div id="result"></div><div id="after"></div></div>';
    if (!isJob) {
      el("gatebox").innerHTML = drawGate("gate", drawWhat, drawSteps);
      el("gate-done").onclick = function () { drew = true; el("gate").classList.add("done"); this.disabled = true; this.textContent = "Drawn ✓"; el("p2wrap").hidden = false; };
    }
    el("hint").onclick = function () {
      var box = el("hintbox");
      if (helped) { hints++; var h = item.hints || {}; box.innerHTML = fb("info", "Hint", "<p>" + esc((!solved.p1 ? h.job : h.product) || "Name the job first, then number the carbons and apply it.") + "</p>"); }
      else { reteach = true; box.innerHTML = '<div class="reteach">' + cardHtml(card(item.reagentKey), true) + "</div>"; }
    };
    function pick(part, k) {
      if (done || solved[part]) return;
      ans[part] = k;
      screen.querySelectorAll("[data-" + part + "]").forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-" + part) === k ? "true" : "false"); });
      if (helped) return checkPart(part);
      var c = el("check"); if (c) c.disabled = !(ans.p1 && (isJob || (drew && ans.p2)));
    }
    screen.querySelectorAll("[data-p1]").forEach(function (b) { b.onclick = function () { pick("p1", b.dataset.p1); }; });
    screen.querySelectorAll("[data-p2]").forEach(function (b) { b.onclick = function () { pick("p2", b.dataset.p2); }; });
    function markChoice(part, o) {
      screen.querySelectorAll("[data-" + part + "]").forEach(function (b) { b.classList.remove("correct", "wrong"); if (b.getAttribute("data-" + part) === o.k) b.classList.add(o.ok ? "correct" : "wrong"); });
    }
    function p1Feedback(o) {
      if (isSyn || isJob) return tagText(o.tag);
      var c = card(item.reagentKey); return "That's a different reagent's job. " + (c ? c.reagent + ": " + c.job : "");
    }
    function rightProduct() { return item.products ? item.products.filter(function (p) { return p.tag === "correct"; })[0] : null; }
    // Draw with help: each part is checked as it is chosen; retries allowed; every attempt is guided practice.
    function checkPart(part) {
      var opts = part === "p1" ? p1Opts : p2Opts, o = opts.filter(function (x) { return x.k === ans[part]; })[0], box = el(part === "p1" ? "fb1" : "fb2");
      save({ itemId: item.id + "-" + part, itemVersion: 1, activity: "guided", correct: o.ok, errorType: o.ok ? null : (part === "p1" ? "reagent:" + item.reagentKey : "execution:" + o.tag),
        response: { choice: o.tag }, assistance: { hints: hints, guided: true } }).catch(function () {});
      markChoice(part, o);
      if (o.ok) {
        solved[part] = true;
        box.innerHTML = fb("good", part === "p1" ? "Yes, that's the job." : "Yes, that matches the checked answer.", "");
        if (isJob || part === "p2") showCompare();
      } else {
        if (!firstWrong[part]) firstWrong[part] = o.tag;
        box.innerHTML = o.tag === "none-match" ? fb("info", "Then let's find the difference.", "<p>Read the hint, fix your drawing, and pick again. One of the drawings above is the checked answer.</p>")
          : fb("bad", "Not quite.", "<p>" + esc(part === "p1" ? p1Feedback(o) : tagText(o.tag)) + "</p>" + (part === "p1" ? cardHtml(card(item.reagentKey), true) : ""));
      }
    }
    // Draw alone: one recorded answer, then a diagnosis that separates a reagent gap from an execution slip.
    var check = el("check");
    if (check) check.onclick = function () {
      if (done) return; done = true; check.disabled = true;
      var o1 = p1Opts.filter(function (x) { return x.k === ans.p1; })[0], o2 = isJob ? null : p2Opts.filter(function (x) { return x.k === ans.p2; })[0];
      var jobOk = o1.ok, prodOk = isJob ? true : o2.ok, correct = jobOk && prodOk;
      var errorClass = correct ? null : !jobOk ? "reagent" : "execution";
      var errorType = correct ? null : !jobOk ? "reagent:" + item.reagentKey : "execution:" + o2.tag;
      markChoice("p1", o1); if (o2) markChoice("p2", o2);
      save({ itemId: item.id, itemVersion: 1, activity: mode, correct: correct, errorType: errorType,
        response: { job: o1.tag, product: o2 ? o2.tag : null, errorClass: errorClass, family: item.family, reagentKey: item.reagentKey, jobRightProductWrong: jobOk && !prodOk, jobWrongProductRight: !jobOk && prodOk, drewFirst: drew },
        unfamiliar: true, assistance: { hints: 0, reteachSeen: reteach } })
        .then(function (ev) { showResult(ev); }, function () { showResult(null); });
      function showResult(ev) {
        var html = "";
        if (correct) html += fb("good", isJob ? "Correct." : "Both parts correct.", "");
        else if (!jobOk) {
          html += fb("bad", isSyn ? "Part 1: that sequence won't make the target." : isJob ? "Not this one." : "Part 1: that's not this reagent's job.", "<p>" + esc(p1Feedback(o1)) + "</p>");
          html += fb("info", "What this tells us: the gap is the reagent itself.", "<p>" + (prodOk && !isJob ? "Your product was right, but the job you chose doesn't explain it, so it may have been a guess. " : "") +
            "Relearn the reagent first, then practice it on a new molecule with help.</p>" + cardHtml(card(item.reagentKey), true));
        } else {
          html += fb("good", "Part 1 correct: you know what " + (isSyn ? "these reagents do." : "this reagent does."), "");
          html += fb("bad", "Part 3: your drawing doesn't match the checked answer.", "<p>" + esc(o2.tag === "none-match" ? "You said none of the drawings matched yours. Compare yours with the checked answer below, one feature at a time." : tagText(o2.tag)) + "</p>");
          html += fb("info", "What this tells us: an execution slip, not a reagent gap.", "<p>You don't need to relearn the reagent. Next time, after naming the job, number the carbons and place each new group before you look at the choices.</p>");
        }
        var counted = ev && ev.independent;
        html += '<div class="feedback info"><strong>' + (correct ? (counted ? "Counted as independent evidence." : "Correct, but recorded as practice.") : "Recorded so the app can bring this back.") + "</strong>" +
          (correct && !counted ? "<p>The reagent card was opened, or this problem wasn't new, so it counts as practice.</p>" : "") + "<p>Correct work on two different problems on two different days is the strongest evidence this app records.</p></div>";
        el("result").innerHTML = html;
        showCompare(errorClass);
      }
    };
    function showCompare(errorClass) {
      var after = el("after");
      if (after.getAttribute("data-shown")) return; after.setAttribute("data-shown", "1");
      var r = rightProduct();
      function factLine(f) { return f ? " · " + f.carbons + " carbons · " + esc(f.formula) : ""; }
      var sol = isJob ? "<p>" + esc(item.explain) + "</p>" :
        isSyn && item.targetFacts ? '<div class="fig">' + r.svg + '</div><p><b>After step 2: ' + esc(item.midName) + "</b>" + factLine(item.facts) + "</p>" +
          '<div class="fig">' + item.targetSvg + '</div><p><b>After step 3: ' + esc(item.targetName) + "</b>" + factLine(item.targetFacts) + "</p><p>" + esc(item.explain) + "</p>" :
        '<div class="fig">' + r.svg + '</div><p><b>' + esc(item.productName) + "</b>" + factLine(item.facts) + "</p><p>" + esc(item.explain) + "</p>";
      var checks = isJob ? ["Say why each wrong base fails, using its conjugate acid's pKa."] : [
        "Carbon count: the answer has " + (item.facts ? item.facts.carbons : "?") + " carbons. Count yours one by one.",
        "Each new group is on the same carbon as in the checked drawing (number both drawings the same way).",
        "Wedges and dashes: the same groups point toward you or away" + (r && r.label ? "; label: " + r.label : "") + ".",
        "No group is missing an H or a charge it shouldn't have."];
      var mistakes = isJob ? [] : item.products.filter(function (p) { return p.tag !== "correct"; }).map(function (p) { return { tag: p.tag, svg: p.svg, title: "If yours looks like this:", text: tagText(p.tag) }; });
      after.innerHTML = compareHtml("cmp", sol, checks, mistakes) + '<div id="expl"></div><div id="np"></div>';
      wireCompare("cmp", function (picked) {
        el("expl").innerHTML = explainHtml("ex1", isSyn ? "In one sentence: why does this route work, and why that order?" : isJob ? "In one sentence: what makes a base strong enough here?" : "In one sentence: why did the new group(s) go where they are, on that carbon and that face?", item.explain);
        wireExplain("ex1", function (rate, text) {
          saveSelfCheck(item, picked, rate, text);
          if (mode === "guided") afterGuided(item, el("np"));
          else if (errorClass) { el("np").innerHTML = nextPracticeHtml(item, errorClass); wireNext(); }
          else el("np").innerHTML = '<div class="feedback info"><strong>Done.</strong>Tomorrow, redraw this product from blank paper before you open the app.</div>';
        });
      });
    }
  }
  function targetedFor(item, pattern) {
    var seen = {}; lastList.forEach(function (e) { seen[e.itemId.replace(/-(p\d|s\d+|selfcheck)$/, "")] = true; });
    if (MECH) { var id = (item.practice || {})[pattern]; return id && byId(id); }
    var same = D.targeted.filter(function (t) { return t.reagentKey === item.reagentKey; }), fam = D.targeted.filter(function (t) { return t.family === item.family; });
    var pool = same.filter(function (t) { return !seen[t.id]; }).concat(fam.filter(function (t) { return !seen[t.id]; }), same, fam);
    return pool[0] || null;
  }
  function nextPracticeHtml(item, errorClass, pattern) {
    var t = targetedFor(item, pattern);
    var why = errorClass === "reagent" || errorClass === "pattern"
      ? (MECH ? "The move itself was the gap: review its card, then draw it with help on a new molecule." : "The reagent was the gap: your next problem uses the same reagent on a new molecule, with its card and hints available.")
      : (MECH ? "You named the moves; the slip was in the arrows or charges. Your next problem has you draw them, with help, on a new molecule." : "You knew the job; the slip was in the drawing. Your next problem uses the same reagent on a new molecule and checks each part as you go.");
    if (!t) return '<div class="card nextp"><b>Your next practice</b><p>' + why + "</p><p>No new practice problem is written for this one yet. Redraw the worked example from blank paper.</p></div>";
    return '<div class="card nextp"><b>Your next practice</b><p>' + why + '</p><button class="btn" type="button" id="nextpractice" data-item="' + esc(t.id) + '">Start: ' + esc(t.title || (t.smName + " + " + t.reagent)) + " →</button></div>";
  }
  function wireNext() { var np = el("nextpractice"); if (np) np.onclick = function () { go("practice", { item: byId(np.dataset.item), mode: "targeted" }); }; }

  // ---------- structure skills: numbers, taps and choices she answers, plus a paper drawing she compares ----------
  function gradePart(p, v) {
    if (p.type === "number") {
      var n = Number(v); if (v === "" || v == null || isNaN(n)) return { ok: false, msg: "Enter a number." };
      if (n === p.answer) return { ok: true };
      return { ok: false, msg: (p.wrong && p.wrong[String(n)]) || (n < p.answer ? p.low : p.high) || "Not quite. Count again, one atom at a time." };
    }
    if (p.type === "choice") return v === p.answer ? { ok: true } : { ok: false, msg: (p.wrong && p.wrong[v]) || "Not this one." };
    var picked = v || [];
    if (p.any) {
      if (picked.length === 1 && p.answer.indexOf(picked[0]) >= 0) return { ok: true };
      if (!picked.length) return { ok: false, msg: "Tap the atom first." };
      var bad = picked.filter(function (a) { return p.answer.indexOf(a) < 0; });
      return { ok: false, msg: bad.length ? ((p.extra || {})[bad[0]] || "That atom is drawn correctly.") : "Tap just one atom." };
    }
    var extra = picked.filter(function (a) { return p.answer.indexOf(a) < 0; }), missing = p.answer.filter(function (a) { return picked.indexOf(a) < 0; });
    if (!extra.length && !missing.length) return { ok: true };
    return { ok: false, msg: extra.length ? ((p.extra || {})[extra[0]] || "One atom you tapped doesn't fit.") : (p.missing || "You missed one.") };
  }
  function runParts(item, mode) {
    var helped = mode !== "independent" && mode !== "review", hints = 0, values = {}, solved = {}, firstWrong = {}, done = false, drew = !item.drawFirst;
    var heading = mode === "independent" ? "Draw alone" : mode === "review" ? "Review: a new problem" : mode === "targeted" ? "Practice again (with help)" : "Draw with help";
    var tapPart = item.parts.map(function (p, i) { return p.type === "tap" ? i : -1; }).filter(function (i) { return i >= 0; })[0];
    screen.innerHTML = '<div class="card"><div class="eyebrow">' + esc(heading) + "</div><h2>" + esc(item.title) + "</h2>" +
      (helped ? '<p class="muted small">Hints and feedback are on. This counts as practice, not independent evidence.</p>' : '<p class="muted small">A new problem, no hints shown. Answer every part, then check.</p>') +
      '<div id="firstdraw"></div><div id="partsbox"' + (item.drawFirst ? " hidden" : "") + ">" + (item.svg ? '<div class="fig mech" id="pfig">' + item.svg + "</div>" : "") +
      item.parts.map(function (p, i) {
        var body = p.type === "number" ? '<div class="row"><input type="number" inputmode="numeric" class="numin" id="in' + i + '" aria-label="' + esc(p.q) + '">' + (helped ? '<button type="button" class="btn secondary compact" data-checkpart="' + i + '">Check</button>' : "") + "</div>"
          : p.type === "choice" ? p.options.map(function (o) { return '<button type="button" class="choice" data-part="' + i + '" data-val="' + esc(o) + '" aria-pressed="false">' + esc(o) + "</button>"; }).join("")
          : '<p class="small muted" id="tapnote' + i + '">Tap atoms in the drawing above. Tap again to unmark.</p><div class="row"><button type="button" class="btn secondary compact" data-checkpart="' + i + '">Done</button></div>';
        return '<div class="part" id="pt' + i + '"><p class="prompt">' + (i + 1) + ". " + esc(p.q) + "</p>" + body + '<div id="pfb' + i + '"></div></div>';
      }).join("") + "</div>" +
      '<div class="row" style="margin-top:12px">' + (helped ? '<button type="button" class="btn secondary" id="hint">Show a hint</button>' : '<button class="btn" type="button" id="check" disabled>Check my answer</button>') + '</div><div id="hintbox"></div><div id="result"></div><div id="after"></div></div>';
    if (item.drawFirst) {
      el("firstdraw").innerHTML = drawGate("gate", item.draw.what, item.draw.steps);
      el("gate-done").onclick = function () { drew = true; el("gate").classList.add("done"); this.disabled = true; this.textContent = "Drawn ✓"; el("partsbox").hidden = false; updateCheck(); };
    }
    // tap targets on the drawing (atoms only)
    var picked = [];
    if (item.svg && tapPart !== undefined) {
      var svg = el("pfig").querySelector("svg"); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.maxWidth = Math.round((item.w || 300) * 1.8) + "px";
      var gT = document.createElementNS(SVGNS, "g"); svg.appendChild(gT);
      (item.targets || []).forEach(function (t) {
        var c = document.createElementNS(SVGNS, "circle"); c.setAttribute("cx", t.x); c.setAttribute("cy", t.y); c.setAttribute("r", 16);
        c.setAttribute("class", "tap"); c.setAttribute("data-target", t.id); c.setAttribute("role", "button"); c.setAttribute("tabindex", "0"); c.setAttribute("aria-label", "carbon or atom " + t.id);
        gT.appendChild(c);
      });
      var toggle = function (id) {
        if (done || solved[tapPart]) return;
        var i = picked.indexOf(id); if (i < 0) picked.push(id); else picked.splice(i, 1);
        gT.querySelectorAll(".tap").forEach(function (c) { c.classList.toggle("picked", picked.indexOf(c.getAttribute("data-target")) >= 0); });
        values[tapPart] = picked.slice(); el("tapnote" + tapPart).textContent = picked.length + " marked. Tap again to unmark."; updateCheck();
      };
      gT.addEventListener("click", function (e) { var t = e.target.closest("[data-target]"); if (t) toggle(t.getAttribute("data-target")); });
      gT.addEventListener("keydown", function (e) { var t = e.target.closest("[data-target]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggle(t.getAttribute("data-target")); } });
    }
    screen.querySelectorAll("[data-part]").forEach(function (b) {
      b.onclick = function () {
        var i = Number(b.dataset.part); if (done || solved[i]) return;
        values[i] = b.dataset.val;
        screen.querySelectorAll('[data-part="' + i + '"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        if (helped) checkOne(i); else updateCheck();
      };
    });
    item.parts.forEach(function (p, i) { if (p.type === "number") el("in" + i).addEventListener("input", function () { values[i] = this.value; updateCheck(); }); });
    screen.querySelectorAll("[data-checkpart]").forEach(function (b) { b.onclick = function () { var i = Number(b.dataset.checkpart); if (item.parts[i].type === "number") values[i] = el("in" + i).value; if (helped) checkOne(i); else { el("pfb" + i).innerHTML = fb("info", "Marked.", ""); updateCheck(); } }; });
    function updateCheck() { var c = el("check"); if (c) c.disabled = !drew || item.parts.some(function (p, i) { return values[i] == null || (Array.isArray(values[i]) && !values[i].length && p.type === "tap" && p.any); }); }
    var hb = el("hint");
    if (hb) hb.onclick = function () { hints++; var next = item.parts.map(function (_, i) { return i; }).filter(function (i) { return !solved[i]; })[0]; el("hintbox").innerHTML = fb("info", "Hint", "<p>" + esc((item.hints || [])[next == null ? 0 : next] || "Go one atom at a time.") + "</p>"); };
    function checkOne(i) {
      if (solved[i]) return;
      var p = item.parts[i], g = gradePart(p, values[i]);
      save({ itemId: item.id + "-p" + (i + 1), itemVersion: 1, activity: "guided", correct: g.ok, errorType: g.ok ? null : "skill:" + p.skill, response: { value: values[i] }, assistance: { hints: hints, guided: true } }).catch(function () {});
      el("pfb" + i).innerHTML = g.ok ? fb("good", "Yes.", "") : fb("bad", "Not quite.", "<p>" + esc(g.msg) + "</p>");
      if (g.ok) { solved[i] = true; el("pt" + i).classList.add("solved"); } else if (!firstWrong[i]) firstWrong[i] = true;
      if (item.parts.every(function (_, j) { return solved[j]; })) afterParts(null);
    }
    var check = el("check");
    if (check) check.onclick = function () {
      if (done) return; done = true; check.disabled = true;
      var res = item.parts.map(function (p, i) { return gradePart(p, values[i]); }), bad = res.map(function (r, i) { return r.ok ? -1 : i; }).filter(function (i) { return i >= 0; });
      var correct = !bad.length, first = bad.length ? item.parts[bad[0]] : null;
      res.forEach(function (r, i) { el("pfb" + i).innerHTML = r.ok ? fb("good", "Correct.", "") : fb("bad", "Not quite.", "<p>" + esc(r.msg) + "</p>"); });
      save({ itemId: item.id, itemVersion: 1, activity: mode, correct: correct, errorType: correct ? null : "skill:" + first.skill,
        response: { parts: item.parts.map(function (p, i) { return { skill: p.skill, value: values[i], ok: res[i].ok }; }), errorClass: correct ? null : "skill", family: item.family, drewFirst: !!item.drawFirst },
        unfamiliar: true, assistance: { hints: 0 } })
        .then(function (ev) { show(ev); }, function () { show(null); });
      function show(ev) {
        var counted = ev && ev.independent;
        el("result").innerHTML = (correct ? fb("good", "Every part correct.", "") : fb("info", "What this tells us: the slip was in " + esc(first.skill.replace(/-/g, " ")) + ".", "<p>The parts marked above say exactly what was off.</p>")) +
          '<div class="feedback info"><strong>' + (correct ? (counted ? "Counted as independent evidence." : "Correct, but recorded as practice.") : "Recorded so the app can bring this back.") + "</strong><p>Correct work on two different problems on two different days is the strongest evidence this app records.</p></div>";
        afterParts(correct ? null : "skill");
      }
    };
    function afterParts(errorClass) {
      var after = el("after"); if (after.getAttribute("data-shown")) return; after.setAttribute("data-shown", "1");
      var dr = item.draw;
      function compareThen() {
        var sol = (dr.solution || []).map(function (svg) { return '<div class="fig">' + svg + "</div>"; }).join("") + (dr.solutionCaption ? "<p><b>" + esc(dr.solutionCaption) + "</b></p>" : "");
        var checks = ["Every carbon has four bonds or fewer; count the lines at each corner.", "Your chain length and carbon count match the checked drawing.", "Each group is on the same carbon (number both drawings the same way).", "Wedges, dashes, axial and equatorial bonds point the same way as in the checked drawing.", "Every charge and lone pair that should be shown is there."];
        after.insertAdjacentHTML("beforeend", compareHtml("cmp", sol, checks, dr.mistakes || []) + '<div id="expl"></div><div id="np"></div>');
        wireCompare("cmp", explainThen);
      }
      function explainThen(mistakes) {
        el("expl") || after.insertAdjacentHTML("beforeend", '<div id="expl"></div><div id="np"></div>');
        el("expl").innerHTML = explainHtml("ex1", item.why.prompt, item.why.key);
        wireExplain("ex1", function (rate, text) {
          saveSelfCheck(item, mistakes || [], rate, text);
          if (mode === "guided") afterGuided(item, el("np"));
          else if (errorClass) {
            var again = D.guided.filter(function (g) { return g.family === item.family; })[0];
            el("np").innerHTML = '<div class="card nextp"><b>Your next practice</b><p>Practice this skill again with help, then redraw this problem from blank paper tomorrow.</p>' +
              (again ? '<button class="btn" type="button" id="nextpractice" data-item="' + esc(again.id) + '">Practice again: ' + esc(again.title) + " →</button>" : "") + "</div>";
            var np = el("nextpractice"); if (np) np.onclick = function () { go("practice", { item: byId(np.dataset.item), mode: "targeted" }); };
          } else el("np").innerHTML = '<div class="feedback info"><strong>Done.</strong>Tomorrow, redraw it once from blank paper before you open the app.</div>';
        });
      }
      if (!dr) { explainThen([]); return; }
      if (item.drawFirst) { compareThen(); return; }
      after.insertAdjacentHTML("beforeend", drawGate("gate2", dr.what, dr.steps));
      el("gate2-done").onclick = function () { this.disabled = true; this.textContent = "Drawn ✓"; el("gate2").classList.add("done"); compareThen(); };
    }
  }

  // ---------- mechanisms: name the move, tap the arrows, mark the new charges ----------
  function norm(t) { if (t.indexOf("-") > 0) return t.split("-").sort().join("-"); return t.replace(/\.lp\d+$/, ".lp"); }
  function arrowKey(a) { return norm(a[0]) + ">" + norm(a[1]); }
  function gradeArrows(step, placed) {
    var sets = [step.arrows].concat(step.alts || []), best = null;
    sets.forEach(function (set) {
      var want = set.map(arrowKey), got = placed.map(arrowKey);
      var extra = got.filter(function (g) { return want.indexOf(g) < 0; }), missing = want.filter(function (w) { return got.indexOf(w) < 0; });
      var score = extra.length + missing.length;
      if (!best || score < best.score) best = { score: score, extra: extra, missing: missing, want: want };
    });
    if (best.score === 0) return { ok: true };
    var err = null, wantPairs = best.want.map(function (w) { return w.split(">"); });
    for (var i = 0; i < placed.length && !err; i++) {
      var k = arrowKey(placed[i]); if (best.extra.indexOf(k) < 0) continue;
      var f = norm(placed[i][0]), t = norm(placed[i][1]), tgt = step.targets.filter(function (x) { return x.id === placed[i][0]; })[0];
      if (wantPairs.some(function (p) { return p[0] === t && p[1] === f; })) err = "arrow-backwards";
      else if (tgt && tgt.kind === "atom") err = "arrow-starts-at-atom";
      else if (wantPairs.some(function (p) { return p[0] === f; })) err = "wrong-destination";
      else if (wantPairs.some(function (p) { return p[1] === t; })) err = "wrong-electron-source";
      else err = "wrong-arrow";
    }
    if (!err) err = best.missing.length ? "missing-arrow" : "extra-arrow";
    return { ok: false, error: err, missing: best.missing.length };
  }
  function gradeCharges(step, picked) {
    var p = picked.slice().sort().join(",");
    return step.charges.some(function (set) { return set.slice().sort().join(",") === p; });
  }
  function chargeAnswerText(step) {
    var names = step.charges[0].map(function (a) { var t = step.targets.filter(function (x) { return x.id === a; })[0]; return t ? t.label.replace(/^the /, "") : a; });
    return (names.length ? "New charge on: " + names.join(" and ") + "." : "No atom gains a new charge in this step.") + (step.chargeNote ? " " + step.chargeNote : "");
  }
  function arrowPath(p0, p1, cx, cy) {
    var dx = p1.x - p0.x, dy = p1.y - p0.y, d = Math.hypot(dx, dy) || 1, mag = d < 45 ? 0.55 : 0.32;
    var mx = (p0.x + p1.x) / 2, my = (p0.y + p1.y) / 2, c1 = [mx - dy * mag, my + dx * mag], c2 = [mx + dy * mag, my - dx * mag];
    var c = Math.hypot(c1[0] - cx, c1[1] - cy) >= Math.hypot(c2[0] - cx, c2[1] - cy) ? c1 : c2;
    var tx = p1.x - c[0], ty = p1.y - c[1], tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    var end = [p1.x - tx * 6, p1.y - ty * 6], base = [end[0] - tx * 10, end[1] - ty * 10], nx = -ty, ny = tx;
    return { d: "M" + p0.x + "," + p0.y + " Q" + c[0] + "," + c[1] + " " + base[0] + "," + base[1],
      head: [end, [base[0] + nx * 5, base[1] + ny * 5], [base[0] - nx * 5, base[1] - ny * 5]].map(function (p) { return p[0].toFixed(1) + "," + p[1].toFixed(1); }).join(" ") };
  }
  function runMechanism(item, mode, arg) {
    arg = arg || {};
    var helped = mode !== "independent" && mode !== "review", isExample = mode === "example";
    // Help fades: the first guided mechanism shows step 1 worked out; after that, she draws every step.
    var demoSteps = mode === "guided" && D.guided.indexOf(item) === 0 ? 1 : 0;
    var k = 0, results = [], hintsUsed = 0, reteach = false;
    var heading = isExample ? "Watch a worked mechanism" : mode === "independent" ? "Draw alone" : mode === "review" ? "Review: a new mechanism" : mode === "targeted" ? "Your next practice (with help)" : "Draw with help";
    var host = arg.host ? el(arg.host) : screen;
    host.innerHTML = (arg.host ? "" : '<div class="card">') + '<div class="eyebrow">' + esc(heading) + "</div><h2>" + esc(item.title) + '</h2><p class="small muted">' + esc(item.reaction) + "</p>" +
      (isExample ? '<p class="small muted">Copy each step onto paper as you watch: arrows, charges, and every product of the step.</p>' : helped ? '<p class="muted small">Hints and feedback are on. This counts as practice, not independent evidence.</p>' : '<p class="muted small">A new mechanism, no hints shown. Draw the whole thing on paper first. Then enter it here step by step: name the move, tap each arrow (where the electrons start, then where they go), and mark the new charges. It is checked at the end.</p>') +
      '<div id="mstep"></div><div id="after"></div>' + (arg.host ? "" : "</div>");
    if (!helped && !isExample) {
      el("mstep").innerHTML = '<div class="rxn"><div class="fig">' + item.startSvg + "</div></div>" + drawGate("mgate", "On paper: draw the whole mechanism from these starting materials.",
        ["Draw each step separately, with every lone pair that moves.", "Every arrow starts at a lone pair or a bond.", "After each step, write in every new charge and every byproduct.", "End with the product."]);
      el("mgate-done").onclick = function () { paintStep(); };
    } else paintStep();

    function paintStep() {
      var st = item.steps[k], box = el("mstep");
      if (isExample || k < demoSteps) {
        box.innerHTML = '<p class="prompt">' + (isExample ? "" : "Watch: ") + "Step " + (k + 1) + " of " + item.steps.length + ": " + esc(st.type) + '</p><div class="fig mech">' + st.svgArrows + "</div><p>" + esc(st.caption) + "</p><p class=\"small\"><b>Charges:</b> " + esc(chargeAnswerText(st)) + "</p>" +
          (isExample ? '<div class="row"><button class="btn secondary" type="button" id="mb"' + (k === 0 ? " disabled" : "") + '>◀ Previous</button><button class="btn" type="button" id="mf"' + (k === item.steps.length - 1 ? " disabled" : "") + ">Next ▶</button></div>" +
            (k === item.steps.length - 1 ? '<div class="reteach"><b>Product</b>' + item.productSvg + "</div><div id=\"exexpl\"></div>" + nextBtn("help", "Draw one with help") : "")
            : '<div class="row"><button class="btn" type="button" id="mf">Now you draw step ' + (k + 2) + " →</button></div>");
        var mb = el("mb"); if (mb) mb.onclick = function () { k--; paintStep(); };
        el("mf").onclick = function () { k++; paintStep(); };
        if (isExample && k === item.steps.length - 1 && item.why) {
          markViewed("example", "example");
          el("exexpl").innerHTML = explainHtml("exw", item.why.prompt, item.why.key);
          wireExplain("exw", function () {});
        }
        return;
      }
      var opts = seeded(st.options.slice(), item.id + "-s" + k), typePick = null, typeSolved = false, placed = [], tail = null, stepDone = false;
      var typeWrongFirst = null, arrowWrongFirst = null, chargeWrongFirst = null, charges = [], phase = "arrows";
      box.innerHTML = '<p class="prompt">Step ' + (k + 1) + " of " + item.steps.length + ": what happens in this step?</p>" +
        opts.map(function (o, i) { return '<button type="button" class="choice" data-type="' + i + '" aria-pressed="false">' + esc(o) + "</button>"; }).join("") +
        '<div id="tfb"></div><p class="prompt" id="phaseq">Draw the arrows: tap where the electrons start, then where they go.</p><p class="small muted" id="tapnote"></p>' +
        '<div class="fig mech" id="mfig"></div><div class="row"><button type="button" class="btn secondary" id="undo">Undo</button>' +
        (helped ? '<button type="button" class="btn secondary" id="mhint">Show a hint</button>' : '<button type="button" class="btn secondary" id="mcard">Show me the card for this move (counts as help)</button>') +
        '<button type="button" class="btn" id="phasebtn">Arrows done: now the charges →</button></div><div id="afb"></div>';
      var fig = el("mfig"); fig.innerHTML = st.svg;
      var svg = fig.querySelector("svg"); svg.removeAttribute("width"); svg.removeAttribute("height"); svg.style.maxWidth = Math.round(st.w * 2) + "px";
      var gA = document.createElementNS(SVGNS, "g"); svg.appendChild(gA);
      var gT = document.createElementNS(SVGNS, "g"); svg.appendChild(gT);
      var order = { atom: 0, bond: 1, lp: 2 };
      st.targets.slice().sort(function (a, b) { return order[a.kind] - order[b.kind]; }).forEach(function (t) {
        var c = document.createElementNS(SVGNS, "circle");
        c.setAttribute("cx", t.x); c.setAttribute("cy", t.y); c.setAttribute("r", t.kind === "atom" ? 15 : t.kind === "lp" ? 11 : 12);
        c.setAttribute("class", "tap t-" + t.kind); c.setAttribute("data-target", t.id); c.setAttribute("role", "button"); c.setAttribute("tabindex", "0"); c.setAttribute("aria-label", t.label);
        gT.appendChild(c);
      });
      function T(id) { return st.targets.filter(function (x) { return x.id === id; })[0]; }
      function paint() {
        while (gA.firstChild) gA.removeChild(gA.firstChild);
        placed.forEach(function (a) {
          var p = arrowPath(T(a[0]), T(a[1]), st.cx, st.cy), path = document.createElementNS(SVGNS, "path"), head = document.createElementNS(SVGNS, "polygon");
          path.setAttribute("d", p.d); path.setAttribute("fill", "none"); path.setAttribute("stroke", "#b23a7a"); path.setAttribute("stroke-width", "2.6");
          head.setAttribute("points", p.head); head.setAttribute("fill", "#b23a7a"); gA.appendChild(path); gA.appendChild(head);
        });
        gT.querySelectorAll(".tap").forEach(function (c) {
          var id = c.getAttribute("data-target"), kind = T(id).kind;
          c.classList.toggle("picked", phase === "arrows" ? id === tail : charges.indexOf(id) >= 0);
          c.style.display = phase === "charges" && kind !== "atom" ? "none" : "";
        });
        el("tapnote").textContent = phase === "charges" ? (charges.length ? "Marked: " + charges.map(function (a) { return T(a).label.replace(/^the /, ""); }).join(", ") + ". Tap again to unmark." : "Tap each atom that has a NEW + or − charge after this step. If none, press the button without tapping.")
          : tail ? "Now tap where those electrons go." : placed.length + " arrow" + (placed.length === 1 ? "" : "s") + " drawn. Tap a lone pair (the two dots) or a bond to start one.";
        el("phasebtn").textContent = phase === "charges" ? (charges.length ? "Charges marked: finish this step" : "No new charge: finish this step") : "Arrows done: now the charges →";
      }
      function tap(id) {
        if (stepDone) return;
        if (phase === "charges") { var i = charges.indexOf(id); if (i < 0) charges.push(id); else charges.splice(i, 1); paint(); return; }
        if (!tail) { tail = id; paint(); return; }
        if (id === tail) { tail = null; paint(); return; }
        var arrow = [tail, id]; tail = null;
        if (helped) {
          var g = gradeArrows(st, placed.concat([arrow]));
          if (!g.ok && g.error !== "missing-arrow") {
            if (!arrowWrongFirst) arrowWrongFirst = g.error;
            el("afb").innerHTML = fb("bad", "Not that arrow.", "<p>" + esc(D.errors[g.error]) + "</p>"); paint(); return;
          }
          placed.push(arrow); paint();
          el("afb").innerHTML = g.ok ? fb("good", "All the arrows for this step are right.", "") : fb("good", "That arrow is right. Is another bond forming or breaking?", "");
          return;
        }
        placed.push(arrow); paint();
      }
      gT.addEventListener("click", function (e) { var t = e.target.closest("[data-target]"); if (t) tap(t.getAttribute("data-target")); });
      gT.addEventListener("keydown", function (e) { var t = e.target.closest("[data-target]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tap(t.getAttribute("data-target")); } });
      el("undo").onclick = function () { if (stepDone) return; if (phase === "charges") { if (charges.length) charges.pop(); else phase = "arrows"; } else if (tail) tail = null; else placed.pop(); paint(); };
      box.querySelectorAll("[data-type]").forEach(function (b) {
        b.onclick = function () {
          if (stepDone || typeSolved) return;
          typePick = opts[Number(b.dataset.type)];
          box.querySelectorAll("[data-type]").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          if (helped) {
            var ok = typePick === st.type;
            if (!ok && !typeWrongFirst) typeWrongFirst = typePick;
            b.classList.add(ok ? "correct" : "wrong"); if (ok) typeSolved = true;
            el("tfb").innerHTML = ok ? fb("good", "Yes: " + st.type + ".", "") : fb("bad", "Not this move.", cardHtml(moveCard(st.type), true));
          }
        };
      });
      var hb = el("mhint"); if (hb) hb.onclick = function () { hintsUsed++; el("afb").innerHTML = fb("info", "Hint", "<p>" + esc((item.hints || [])[k] || "Start at electrons: a lone pair or a bond.") + "</p>"); };
      var mc = el("mcard"); if (mc) mc.onclick = function () { reteach = true; el("afb").innerHTML = '<div class="reteach">' + cardHtml(moveCard(st.type), true) + "</div>"; };
      el("phasebtn").onclick = function () {
        if (stepDone) return;
        if (!typePick) { el("afb").innerHTML = fb("info", "Name the move first.", "<p>Choose what happens in this step.</p>"); return; }
        if (phase === "arrows") {
          if (tail) tail = null;
          if (helped) {
            var g = gradeArrows(st, placed);
            if (!typeSolved || !g.ok) { el("afb").innerHTML = fb("bad", "Not finished yet.", "<p>" + esc(!typeSolved ? "Choose the right move first." : D.errors[g.error]) + "</p>"); return; }
          }
          phase = "charges"; el("phaseq").textContent = "Mark the charges: which atoms have a NEW + or − charge after this step?"; el("afb").innerHTML = ""; paint(); return;
        }
        var cOk = gradeCharges(st, charges);
        if (helped) {
          if (!cOk) { if (!chargeWrongFirst) chargeWrongFirst = charges.slice(); el("afb").innerHTML = fb("bad", "Check the charges again.", "<p>For each atom an arrow touched, count its bonds and lone pairs now. An O with three bonds and one lone pair is O⁺; a C with only three bonds is C⁺; an atom that gained a lone pair from a bond may now be negative.</p>"); return; }
          stepDone = true;
          var clean = !typeWrongFirst && !arrowWrongFirst && !chargeWrongFirst;
          save({ itemId: item.id + "-s" + (k + 1), itemVersion: 1, activity: "guided", correct: clean,
            errorType: typeWrongFirst ? "pattern:" + st.type : arrowWrongFirst ? "arrows:" + arrowWrongFirst : chargeWrongFirst ? "charges" : null,
            response: { pattern: st.type }, assistance: { hints: hintsUsed, guided: true } })
            .then(function () { return clean ? null : save({ itemId: item.id + "-s" + (k + 1), itemVersion: 1, activity: "guided", correct: true, errorType: null, response: { pattern: st.type, completed: true }, assistance: { hints: hintsUsed, guided: true } }); })
            .then(nextStep, nextStep);
          el("afb").innerHTML = fb("good", "Step " + (k + 1) + " done.", "<p>" + esc(st.caption) + "</p><p class=\"small\">" + esc(chargeAnswerText(st)) + "</p>");
          return;
        }
        stepDone = true;
        var g2 = gradeArrows(st, placed);
        results.push({ step: k + 1, pattern: st.type, typeOk: typePick === st.type, typeChosen: typePick, arrowsOk: g2.ok, arrowError: g2.ok ? null : g2.error, chargesOk: cOk, charges: charges.slice(), placed: placed.slice() });
        nextStep();
      };
      paint();
    }
    function nextStep() {
      if (k < item.steps.length - 1) { k++; paintStep(); return; }
      if (helped) {
        el("mstep").innerHTML = '<div class="reteach"><b>Product</b>' + item.productSvg + "</div>";
        compareAndExplain(null);
        return;
      }
      finishIndependent();
    }
    function compareAndExplain(errorClass, first) {
      var sol = item.steps.map(function (st, i) { return '<p class="prompt">Step ' + (i + 1) + ": " + esc(st.type) + '</p><div class="fig mech">' + st.svgArrows + "</div><p class=\"small\">" + esc(st.caption) + " " + esc(chargeAnswerText(st)) + "</p>"; }).join("") +
        '<div class="reteach"><b>Product</b>' + item.productSvg + "</div>";
      var checks = ["The same number of steps, in the same order.", "Every arrow starts at a lone pair or a bond, never at an atom or a + charge.", "Each arrow ends where the electrons go: a new bond, or the atom that keeps the pair.", "After each step, every new charge is written in, and the atoms that lost a charge are neutral.", "Byproducts are shown (water, H₃O⁺, Br⁻, OH⁻)."];
      var mistakes = ["arrow-starts-at-atom", "arrow-backwards", "missing-arrow", "wrong-destination"].map(function (t) { return { tag: t, title: { "arrow-starts-at-atom": "An arrow starts at an atom or a charge", "arrow-backwards": "An arrow points the wrong way", "missing-arrow": "A bond breaks or forms with no arrow", "wrong-destination": "An arrow ends on the wrong atom" }[t], text: D.errors[t] }; })
        .concat([{ tag: "charges", title: "A charge is missing or on the wrong atom", text: "Count bonds and lone pairs on every atom an arrow touched: O with 3 bonds and 1 lone pair is O⁺; C with 3 bonds and no lone pair is C⁺." },
                 { tag: "byproduct", title: "A byproduct is missing", text: "Every step's products must be drawn: the water that leaves, the H₃O⁺ that forms, the halide ion." }]);
      var after = el("after");
      after.insertAdjacentHTML("beforeend", compareHtml("cmp", sol, checks, mistakes) + '<div id="expl"></div><div id="np"></div>');
      wireCompare("cmp", function (picked) {
        el("expl").innerHTML = explainHtml("ex1", (item.why || {}).prompt || "In one sentence: why does the first step happen?", (item.why || {}).key || "");
        wireExplain("ex1", function (rate, text) {
          saveSelfCheck(item, picked, rate, text);
          if (mode === "guided") afterGuided(item, el("np"));
          else if (errorClass) { el("np").innerHTML = nextPracticeHtml(item, errorClass === "label" ? "pattern" : errorClass, first && first.pattern); wireNext(); }
          else el("np").innerHTML = '<div class="feedback info"><strong>Done.</strong>Tomorrow, redraw this whole mechanism from blank paper before you open the app.</div>';
        });
      });
    }
    function finishIndependent() {
      var bad = results.filter(function (r) { return !r.typeOk || !r.arrowsOk || !r.chargesOk; }), first = bad[0], correct = !bad.length;
      var errorClass = correct ? null : !first.typeOk && !(first.arrowsOk && first.chargesOk) ? "pattern" : first.typeOk ? "execution" : "label";
      var errorType = correct ? null : !first.arrowsOk ? "arrows:" + first.arrowError : !first.chargesOk ? "charges" : "pattern:" + first.pattern;
      save({ itemId: item.id, itemVersion: 1, activity: mode, correct: correct, errorType: errorType,
        response: { steps: results, errorClass: errorClass, pattern: first ? first.pattern : null }, unfamiliar: true, assistance: { hints: 0, reteachSeen: reteach } })
        .then(function (ev) { show(ev); }, function () { show(null); });
      function show(ev) {
        var html = '<h3>Your answer, step by step</h3>';
        results.forEach(function (r, i) {
          var st = item.steps[i];
          html += '<div class="mres"><p class="prompt">Step ' + (i + 1) + "</p>" +
            (r.typeOk ? fb("good", "You named the move: " + st.type + ".", "") : fb("bad", "You chose: " + r.typeChosen + ".", "<p>This step is " + esc(st.type.toLowerCase()) + ".</p>")) +
            (r.arrowsOk ? fb("good", "Your arrows are right.", "") : fb("bad", "Arrows: not quite.", "<p>" + esc(D.errors[r.arrowError]) + "</p>")) +
            (r.chargesOk ? fb("good", "Your charges are right.", "") : fb("bad", "Charges: not quite.", "<p>" + esc(chargeAnswerText(st)) + "</p>")) + "</div>";
        });
        if (!correct) {
          html += errorClass === "execution" ? fb("info", "What this tells us: you know the moves; the slip was in drawing them.", "<p>Practice that move's arrows and charges on a new molecule. Say where each arrow starts before you tap.</p>")
            : errorClass === "pattern" ? fb("info", "What this tells us: the move itself was the gap.", "<p>Review the card for " + esc(first.pattern.toLowerCase()) + ", then draw it with help.</p>")
            : fb("info", "What this tells us: your arrows and charges were right, but the name of the move wasn't.", "<p>Learn the four move names from the cards. Your drawing shows you understand what happens.</p>");
        }
        var counted = ev && ev.independent;
        html += '<div class="feedback info"><strong>' + (correct ? (counted ? "Counted as independent evidence." : "Correct, but recorded as practice.") : "Recorded so the app can bring this back.") + "</strong>" +
          (correct && !counted ? "<p>A card was opened, or this problem wasn't new, so it counts as practice.</p>" : "") + "<p>Correct work on two different problems on two different days is the strongest evidence this app records.</p></div>";
        el("mstep").innerHTML = "";
        el("after").innerHTML = html;
        compareAndExplain(errorClass, first);
      }
    }
  }

  // ---------- start ----------
  LR.init().then(refreshStatus).then(function (r) {
    if (r && r.st.due && unlocked && hadAlone(r.list)) go("review"); else go("watch");
  }, function () { go("watch"); });
})();
