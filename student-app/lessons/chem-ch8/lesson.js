/* Chapter 8 pilot lesson: teach → example → guided (assisted) → independent → delayed review. */
(function () {
  "use strict";
  var LR = window.LearningRecord, C = window.Ch8;
  var OBJ = { course: "CHM221", objectiveId: "chm221.ch8.hx-addition", objectiveSource: "textbook-prep", source: "lesson-chem-ch8" };
  var STEPS = [
    { id: "learn1", label: "1 · How HBr adds" }, { id: "learn2", label: "2 · Which carbon gets H" },
    { id: "learn3", label: "3 · Carbocation shifts" }, { id: "learn4", label: "4 · Stereochemistry" },
    { id: "example", label: "Worked example" }, { id: "guided", label: "Guided practice" }, { id: "independent", label: "On your own" }
  ];
  var GUIDED_FINAL = "chem-ch8-guided-2m2b-s5";
  var screen = document.getElementById("screen"), nav = document.getElementById("stepnav");
  var current = "learn1", unlocked = false, viewed = {}, saveProblem = null;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function svg() { var s = document.createElementNS("http://www.w3.org/2000/svg", "svg"); s.setAttribute("class", "mol"); s.setAttribute("role", "img"); return s; }
  function fb(kind, title, html) { return '<div class="feedback ' + kind + '"><strong>' + esc(title) + "</strong>" + html + "</div>"; }

  function save(input) {
    var ev = Object.assign({}, OBJ, input);
    return LR.record(ev).then(function (saved) { saveProblem = null; refreshStatus(); return saved; }, function (e) {
      saveProblem = e.message;
      var n = document.getElementById("review-note"); if (n) n.textContent = "This answer could not be saved: " + e.message;
      throw e;
    });
  }
  function refreshStatus() {
    return LR.events({ objectiveId: OBJ.objectiveId }).then(function (list) {
      var st = LR.statusFromEvents(list, OBJ.objectiveId);
      document.getElementById("status-chip").textContent = st.label;
      var note = st.status === "not-started" ? "" : st.due ? "A new review problem is ready today." : st.reviewDue ? "Next review: " + LR.formatDay(st.reviewDue) : "";
      if (!saveProblem) document.getElementById("review-note").textContent = note;
      unlocked = list.some(function (e) { return (e.itemId === GUIDED_FINAL && e.correct) || e.activity === "independent" || e.activity === "review"; });
      renderNav();
      return { list: list, st: st };
    });
  }
  function renderNav() {
    nav.innerHTML = STEPS.map(function (s) {
      var locked = s.id === "independent" && !unlocked;
      return '<button type="button" data-step="' + s.id + '"' + (s.id === current ? ' aria-current="step"' : "") + (locked ? " disabled title=\"Finish guided practice first\"" : "") + ">" + esc(s.label) + (locked ? " 🔒" : "") + "</button>";
    }).join("");
  }
  nav.addEventListener("click", function (e) { var b = e.target.closest("[data-step]"); if (b && !b.disabled) go(b.dataset.step); });
  function go(id) { current = id; renderNav(); ({ learn1: learn1, learn2: learn2, learn3: learn3, learn4: learn4, example: example, guided: guided, independent: independent })[id](); window.scrollTo({ top: 0, behavior: "auto" }); }
  function nextBtn(to, text) { return '<div class="row" style="margin-top:14px"><button class="btn" type="button" data-go="' + to + '">' + esc(text) + " →</button></div>"; }
  screen.addEventListener("click", function (e) { var b = e.target.closest("[data-go]"); if (b) go(b.dataset.go); });
  function markViewed(id, activity) {
    if (viewed[id]) return; viewed[id] = true;
    save({ itemId: "chem-ch8-" + activity + "-" + id, itemVersion: 1, activity: activity, correct: null }).catch(function () {});
  }

  // ---------- 1. Mechanism ----------
  function learn1() {
    markViewed("learn1", "teach");
    var stage = 0;
    screen.innerHTML = '<div class="card"><h2>The C=C π bond attacks H–Br</h2>' +
      "<p>The π bond of an alkene is a region of electron density, so the alkene acts as the <b>nucleophile</b>. In H–Br, bromine is more electronegative, so the H carries a partial positive charge and is the <b>electrophile</b>.</p>" +
      '<div id="m1"></div><p id="cap" class="prompt"></p><div class="row"><button class="btn secondary" type="button" id="back1">◀ Previous</button><button class="btn" type="button" id="fwd1">Next ▶</button></div>' +
      '<div class="feedback info"><strong>Two steps</strong>Step 1: the π electrons attack the H, and the H–Br bond electrons move onto Br, which leaves as bromide (Br⁻). One alkene carbon gains the H; the other becomes a carbocation (the intermediate). Step 2: a lone pair on Br⁻ attacks the carbocation.</div>' +
      "<p class=\"small muted\">Curved arrows always start at electrons (a bond or a lone pair) and point to where those electrons go.</p></div>" + nextBtn("learn2", "Which carbon gets the H?");
    var host = document.getElementById("m1"), s = svg(); host.appendChild(s);
    function paint() {
      var cap = document.getElementById("cap");
      if (stage === 0) { C.draw(s, { mol: "propene", reagent: "HBr", showH: true, label: "propene + HBr" }); cap.textContent = "Start: propene and HBr."; }
      if (stage === 1) { C.draw(s, { mol: "propene", reagent: "HBr", showH: true, arrows: [{ from: "pi", to: "H" }, { from: "HX", to: "X", bend: .5 }], label: "Step 1 arrows" }); cap.textContent = "Step 1: π bond → H, and H–Br bond → Br."; }
      if (stage === 2) { C.draw(s, { mol: "propene", showH: true, saturate: true, cation: 2, hAdded: 1, label: "carbocation intermediate + Br⁻" }); cap.textContent = "After step 1: H is on C1 and C2 carries the + charge. Br⁻ is nearby."; }
      if (stage === 3) { C.draw(s, { mol: "propene", showH: true, product: { hOn: 1, xOn: 2, x: "Br" }, label: "2-bromopropane" }); cap.textContent = "Step 2: Br⁻ bonds to the + carbon. Product: 2-bromopropane."; }
      document.getElementById("back1").disabled = stage === 0; document.getElementById("fwd1").disabled = stage === 3;
    }
    document.getElementById("back1").onclick = function () { stage = Math.max(0, stage - 1); paint(); };
    document.getElementById("fwd1").onclick = function () { stage = Math.min(3, stage + 1); paint(); };
    paint();
  }

  // ---------- 2. Regiochemistry ----------
  function pairHtml(molKey, idPrefix) {
    var m = C.MOLS[molKey], opts = C.regioOptions(m), best = Math.max(opts[0].cls, opts[1].cls);
    return '<div class="pair">' + opts.map(function (o, i) {
      return '<div class="' + (o.cls === best ? "win" : "") + '"><div id="' + idPrefix + i + '"></div><b>H on C' + o.hOn + " → + on C" + o.cation + "</b><div>" +
        o.cls + " carbon" + (o.cls === 1 ? "" : "s") + " bonded to the + carbon: " + C.CLASS_WORD[o.cls] + "</div>" + (o.cls === best ? "<div><b>More stable: this one forms</b></div>" : "<div class=\"muted\">Less stable</div>") + "</div>";
    }).join("") + "</div>";
  }
  function paintPair(molKey, idPrefix) {
    var m = C.MOLS[molKey];
    C.regioOptions(m).forEach(function (o, i) { var s = svg(); document.getElementById(idPrefix + i).appendChild(s); C.draw(s, { mol: molKey, showH: true, saturate: true, cation: o.cation, hAdded: o.hOn }); });
  }
  function learn2() {
    markViewed("learn2", "teach");
    screen.innerHTML = '<div class="card"><h2>Which carbon gets the H?</h2>' +
      "<p>Step 1 can put the H on either alkene carbon. Each choice leaves the + charge on the <i>other</i> carbon. The step that makes the <b>more stable carbocation</b> has the lower barrier, so it is faster, and that pathway gives the major product.</p>" +
      "<p>Carbocation stability (from Unit 3): tertiary (3°) &gt; secondary (2°) &gt; primary (1°). More carbon groups bonded to the + carbon stabilize it by hyperconjugation and induction.</p>" +
      pairHtml("propene", "rp") +
      '<div class="feedback info"><strong>Shortcut (Markovnikov\'s rule)</strong>The H adds to the alkene carbon that already has more hydrogens, so the halogen ends up on the more substituted carbon. The <i>reason</i> is carbocation stability: when the shortcut is unclear, compare the two carbocations.</div>' +
      '<p class="small muted">Beyond this lesson: with HBr and peroxides (ROOR), a different, radical mechanism puts Br on the less substituted carbon. Here we cover HBr and HCl without peroxides.</p></div>' + nextBtn("learn3", "Check for carbocation shifts");
    paintPair("propene", "rp");
  }

  // ---------- 3. 1,2-shifts ----------
  function learn3() {
    markViewed("learn3", "teach");
    screen.innerHTML = '<div class="card"><h2>Check for a better carbocation: 1,2-shifts</h2>' +
      "<p>Once the carbocation forms, pause before adding the halide. If a hydrogen (hydride shift) or a methyl group (methyl shift) on the <b>neighboring</b> carbon can move over and leave a <b>more stable</b> carbocation, it does. The halide then bonds to the <b>new</b> + carbon. This is the same rearrangement you learned in Unit 3 for SN1 and E1.</p>" +
      '<h3>Example: 3,3-dimethyl-1-butene + HCl</h3><div class="pair"><div><div id="r1"></div><b>H adds to C1: secondary (2°) + on C2</b></div><div><div id="r2"></div><b>A methyl moves from C3 to C2: tertiary (3°) +</b></div></div>' +
      '<div class="pair" style="margin-top:12px"><div><div id="r3"></div><b>Cl⁻ bonds to the new + carbon</b></div><div class="win"><p><b>Major product:</b> 2-chloro-2,3-dimethylbutane, not the unrearranged 3-chloro-2,2-dimethylbutane.</p><p class="small">Check: a shift only happens when it makes the cation more stable (2° → 3° here).</p></div></div></div>' +
      nextBtn("learn4", "Stereochemistry");
    var a = svg(), b = svg(), c = svg();
    document.getElementById("r1").appendChild(a); document.getElementById("r2").appendChild(b); document.getElementById("r3").appendChild(c);
    C.draw(a, { mol: "dimethylbutene33", showH: true, saturate: true, cation: 2, hAdded: 1, arrows: [{ from: [1.482, .933], to: "C2", bend: -.6 }] });
    C.draw(b, { mol: "dimethylbutyl23", showH: true, cation: 3 });
    C.draw(c, { mol: "dimethylbutyl23", showH: true, product: { hOn: -1, xOn: 3, x: "Cl" } });
  }

  // ---------- 4. Stereochemistry ----------
  function learn4() {
    markViewed("learn4", "teach");
    screen.innerHTML = '<div class="card"><h2>Stereochemistry: a flat carbocation</h2>' +
      "<p>A carbocation carbon is sp² and <b>planar</b>. The halide can bond to either face with equal chance. If the carbon that gains the halogen becomes a <b>new stereocenter</b>, both enantiomers form equally: a <b>racemic mixture</b>.</p>" +
      "<p>Check the carbon that gains the halogen: does it have four different groups? If two of its groups are identical (for example, two CH₃ groups), no stereocenter forms.</p>" +
      '<h3>Example: 1-hexene + HBr gives racemic 2-bromohexane</h3><div class="pair"><div><div id="s1"></div>Br on a wedge</div><div><div id="s2"></div>Br on a dash</div></div>' +
      '<p class="small muted">C2 has H, Br, CH₃ and a butyl group: four different groups, so it is a stereocenter, and you should write "racemic."</p></div>' +
      nextBtn("example", "Worked example");
    var a = svg(), b = svg();
    document.getElementById("s1").appendChild(a); document.getElementById("s2").appendChild(b);
    C.draw(a, { mol: "hexene1", saturate: true, wedge: { from: 2, kind: "wedge", x: "Br" } });
    C.draw(b, { mol: "hexene1", saturate: true, wedge: { from: 2, kind: "dash", x: "Br" } });
  }

  // ---------- Worked example ----------
  function example() {
    markViewed("example", "example");
    var stage = 0, caps = [
      "Start: 2-methylpropene + HBr. The π bond is the nucleophile; the H of HBr is the electrophile.",
      "Compare the two possible carbocations before choosing where H goes.",
      "H goes to C1 (the CH₂ end) because that leaves a tertiary (3°) carbocation on C2.",
      "Check for a shift: C2 is already tertiary, and no neighbor could make it better. No shift.",
      "Br⁻ bonds to C2. Product: 2-bromo-2-methylpropane. C2 now has three CH₃ groups, so no stereocenter forms."
    ];
    screen.innerHTML = '<div class="card"><h2>Worked example: 2-methylpropene + HBr</h2><div id="ex"></div><p class="prompt" id="excap"></p>' +
      '<div class="row"><button class="btn secondary" type="button" id="exb">◀ Previous</button><button class="btn" type="button" id="exf">Next ▶</button></div></div>' + nextBtn("guided", "Try one with guidance");
    function paint() {
      var host = document.getElementById("ex"); host.innerHTML = "";
      if (stage === 1) { host.innerHTML = pairHtml("methylpropene", "ep"); paintPair("methylpropene", "ep"); }
      else {
        var s = svg(); host.appendChild(s);
        if (stage === 0) C.draw(s, { mol: "methylpropene", reagent: "HBr", showH: true, arrows: [{ from: "pi", to: "H" }, { from: "HX", to: "X", bend: .5 }] });
        if (stage === 2 || stage === 3) C.draw(s, { mol: "methylpropene", showH: true, saturate: true, cation: 2, hAdded: 1 });
        if (stage === 4) C.draw(s, { mol: "methylpropene", showH: true, product: { hOn: 1, xOn: 2, x: "Br" } });
      }
      document.getElementById("excap").textContent = caps[stage];
      document.getElementById("exb").disabled = stage === 0; document.getElementById("exf").disabled = stage === caps.length - 1;
    }
    document.getElementById("exb").onclick = function () { stage--; paint(); };
    document.getElementById("exf").onclick = function () { stage++; paint(); };
    paint();
  }

  // ---------- Reteaching (a different explanation from the first one) ----------
  function reteach(kind, molKey, item) {
    if (kind === "regio") return '<div class="reteach"><b>Another way to see it: count carbons on each possible + carbon.</b>' + pairHtml(molKey, "rt") + "<p>Put the H on the carbon that leaves the + charge on the carbon with <b>more carbons attached</b>.</p></div>";
    if (kind === "arrow") return '<div class="reteach"><b>Another way to see it: follow the electrons.</b><p>An arrow\'s tail sits where electrons <i>are now</i>; its head points where they <i>go</i>. The H of HBr has no lone pairs and no π bond to give, so no arrow can start at H. The alkene\'s π bond is the electron-rich spot, so arrow 1 starts there and points at the electron-poor H.</p></div>';
    if (kind === "x") return '<div class="reteach"><b>Another way to see it: who is missing electrons?</b><p>After step 1, only one carbon has a + charge (an empty p orbital). Br⁻ brings a lone pair, so it bonds to that + carbon. The carbon that just gained the H already has a full octet.</p></div>';
    if (kind === "shift") return '<div class="reteach"><b>Another way to see it: pause at the carbocation.</b><p>After step 1 the + charge is on C' + item.cationFirst + ", a secondary carbon. Its neighbor C" + C.predict(C.MOLS[item.mol]).shift.from + " is bonded to three carbons and has one H. If that H moves over with its electrons (a hydride shift), the + charge lands on a tertiary carbon, which is more stable. The halide bonds to the new + carbon.</p></div>";
    if (kind === "stereo") return '<div class="reteach"><b>Another way to see it: list the four groups.</b><p>Write the four groups on the carbon that gained the halogen. If all four are different, it is a new stereocenter, and because the flat carbocation is attacked from both faces, you get a racemic mixture (never a single enantiomer here). If any two groups are identical, there is no stereocenter.</p></div>';
    return "";
  }

  // ---------- Guided practice (assisted: never counts as independent evidence) ----------
  var GSTEPS = [
    { n: 1, prompt: "Tap where the first curved arrow starts.", accept: "pi",
      wrong: { H: ["arrow-starts-at-atom", "Arrows start at electrons, not at an atom like H. Which electrons attack the H?"],
               X: ["arrow-from-halogen", "Br ends up with electrons, but it does not start step 1. The electron-rich π bond attacks first."],
               HX: ["arrow-order", "The H–Br bond does break in step 1, but that is the second arrow. The first arrow comes from the nucleophile."],
               C: ["arrow-from-single-carbon", "Start at the electrons of the C=C π bond itself, between the two carbons."] }, re: "arrow" },
    { n: 2, prompt: "Tap where that first arrow ends.", accept: "H",
      wrong: { X: ["electrophile-wrong-atom", "Br is partially negative, so it does not attract the π electrons. The partially positive H is the target."],
               HX: ["arrow-ends-at-bond", "Arrow 1 points to the H atom that will form the new C–H bond."],
               C: ["arrow-end-wrong", "The π electrons leave the carbons and go to the H of HBr."], pi: ["arrow-end-wrong", "That is where the arrow starts. Where do the π electrons go?"] }, re: "arrow" },
    { n: 3, prompt: "Which alkene carbon gains the H? Tap it.", accept: "C3",
      wrong: { C2: ["regio-less-stable-cation", "H on C2 would leave the + charge on C3, a secondary carbocation. H on C3 leaves a tertiary carbocation on C2, which is more stable."],
               C: ["not-alkene-carbon", "The H adds to one of the two carbons of the C=C."], other: ["not-a-carbon", "Tap one of the two alkene carbons."] }, re: "regio" },
    { n: 4, prompt: "Tap the carbon that bonds to Br.", accept: "C2",
      wrong: { C3: ["x-on-h-carbon", "C3 just gained the H. Bromide bonds to the + carbon, C2."],
               C: ["x-wrong-carbon", "Bromide bonds to the carbocation carbon (C2)."], other: ["not-a-carbon", "Tap the carbon that carries the + charge."] }, re: "x" }
  ];
  function guided() {
    var step = 0;
    screen.innerHTML = '<div class="card"><h2>Guided practice: 2-methyl-2-butene + HBr</h2><p class="muted small">Hints and feedback are on. This practice does not count as independent evidence.</p>' +
      '<p class="prompt" id="gp"></p><div id="gm"></div><div id="gfb"></div><div id="gextra"></div></div>';
    var s = svg(); document.getElementById("gm").appendChild(s);
    function paint(selected) {
      var o = { mol: "methylbutene2", reagent: "HBr", showH: true, targets: step < 4, selected: selected || {} };
      if (step >= 2) { o.arrows = [{ from: "pi", to: "H" }, { from: "HX", to: "X", bend: .5 }]; }
      if (step === 3) { o = { mol: "methylbutene2", showH: true, saturate: true, cation: 2, hAdded: 3, targets: true, noPi: true, selected: selected || {} }; }
      if (step >= 4) { o = { mol: "methylbutene2", showH: true, product: { hOn: 3, xOn: 2, x: "Br" } }; }
      C.draw(s, o);
      document.getElementById("gp").textContent = step < 4 ? "Step " + GSTEPS[step].n + ": " + GSTEPS[step].prompt : "Last check: stereochemistry";
    }
    function handle(target) {
      var g = GSTEPS[step], ok = target === g.accept, wrong = null;
      if (!ok) wrong = g.wrong[target] || (target[0] === "C" ? g.wrong.C : g.wrong.other) || g.wrong.C;
      save({ itemId: "chem-ch8-guided-2m2b-s" + g.n, itemVersion: 1, activity: "guided", correct: ok, errorType: ok ? null : wrong[0],
        response: { tapped: target }, assistance: { hints: 0, guided: true } }).catch(function () {});
      var sel = {}; sel[target] = ok ? "good" : "bad";
      if (ok) {
        document.getElementById("gfb").innerHTML = fb("good", "Yes.", ["<p>The π electrons are the nucleophile, so arrow 1 starts at the C=C.</p>", "<p>Arrow 1 ends at H. Arrow 2 shows the H–Br bond electrons moving onto Br.</p>", "<p>H goes to C3, leaving a tertiary carbocation on C2.</p>", "<p>Br⁻ bonds to the + carbon. Product: 2-bromo-2-methylbutane.</p>"][step]);
        document.getElementById("gextra").innerHTML = "";
        step++;
        paint();
        if (step === 4) stereoStep();
      } else {
        document.getElementById("gfb").innerHTML = fb("bad", "Not quite.", "<p>" + esc(wrong[1]) + "</p>");
        document.getElementById("gextra").innerHTML = reteach(g.re, "methylbutene2");
        if (g.re === "regio") paintPair("methylbutene2", "rt");
        paint(sel);
      }
    }
    s.addEventListener("click", function (e) { var t = e.target.closest("[data-target]"); if (t && step < 4) handle(t.getAttribute("data-target")); });
    s.addEventListener("keydown", function (e) { var t = e.target.closest("[data-target]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handle(t.getAttribute("data-target")); } });
    function stereoStep() {
      var box = document.getElementById("gextra");
      box.innerHTML = '<p class="prompt">Does the product have a new stereocenter?</p>' + stereoChoices("g") + '<div id="gsfb"></div>';
      box.addEventListener("click", function onPick(e) {
        var b = e.target.closest("[data-stereo]"); if (!b) return;
        var v = b.dataset.stereo, ok = v === "none";
        save({ itemId: GUIDED_FINAL, itemVersion: 1, activity: "guided", correct: ok, errorType: ok ? null : "stereo-false-center", response: { stereo: v }, assistance: { hints: 0, guided: true } })
          .then(function () { if (ok) refreshStatus(); }).catch(function () {});
        if (ok) {
          box.removeEventListener("click", onPick);
          document.getElementById("gsfb").innerHTML = fb("good", "Correct: no new stereocenter.", "<p>C2 now holds Br, CH₂CH₃ and <b>two identical CH₃ groups</b>, so it is not a stereocenter.</p>") +
            '<div class="feedback info"><strong>Guided practice complete.</strong>Next, solve a new problem on your own. No hints are shown unless you ask, and asking for one means that attempt counts as practice.</div>' + nextBtn("independent", "Solve one on my own");
        } else {
          document.getElementById("gsfb").innerHTML = fb("bad", "Not quite.", "<p>List the groups on C2: Br, CH₂CH₃, CH₃ and CH₃. Two are identical.</p>") + reteach("stereo");
        }
      });
    }
    paint();
  }
  function stereoChoices(prefix) {
    return [["none", "No new stereocenter forms"], ["racemic", "A new stereocenter forms: racemic mixture (both enantiomers)"], ["single", "A new stereocenter forms: a single enantiomer"]]
      .map(function (c) { return '<button type="button" class="choice" data-stereo="' + c[0] + '" aria-pressed="false">' + esc(c[1]) + "</button>"; }).join("");
  }

  // ---------- Independent problem (and delayed review) ----------
  function independent() {
    if (!unlocked) { go("guided"); return; }
    LR.events({ objectiveId: OBJ.objectiveId }).then(function (list) {
      var seen = {}; list.forEach(function (e) { seen[e.itemId] = true; });
      var hadIndependent = list.some(function (e) { return e.activity === "independent" || e.activity === "review"; });
      var item = C.POOL.filter(function (p) { return !seen[p.id]; })[0];
      if (!item) {
        screen.innerHTML = '<div class="card"><h2>You have tried every problem in this set</h2><p>New problems need to be written and checked before more independent evidence can be collected. Your record is unchanged. You can still review the lesson steps.</p></div>';
        return;
      }
      runIndependent(item, hadIndependent ? "review" : "independent");
    });
  }
  function runIndependent(item, activity) {
    var m = C.MOLS[item.mol], hints = 0, part = 0, ans = { h: null, x: null, stereo: null }, done = false;
    screen.innerHTML = '<div class="card"><h2>' + (activity === "review" ? "Review problem (new)" : "On your own") + ": " + esc(m.name) + " + " + item.reagent + "</h2>" +
      '<p class="muted small">This is a new problem. Answer all three parts, then check. Showing H counts is allowed but counts as a hint.</p>' +
      '<div class="row"><button type="button" class="btn secondary" id="hintH">Show H counts (hint)</button></div>' +
      '<ol class="partlist"><li id="pa">Tap the alkene carbon that gains the H.</li><li id="pb">Tap the carbon bonded to ' + item.reagent.slice(1) + " in the major product.</li><li>Choose the stereochemical outcome below.</li></ol>" +
      '<div id="im"></div><p class="prompt" id="ip"></p>' + stereoChoices("i") + '<div class="row" style="margin-top:12px"><button class="btn" type="button" id="check" disabled>Check my answer</button></div><div id="ifb"></div></div>';
    var s = svg(); document.getElementById("im").appendChild(s);
    function paint() {
      var sel = {};
      if (!done) { if (ans.h) sel[ans.h] = "picked"; if (ans.x) sel[ans.x] = "picked"; }
      else {
        // After checking: correct carbons in green, any wrong taps in red.
        if (ans.h && ans.h !== "C" + item.hCarbon) sel[ans.h] = "bad";
        if (ans.x && ans.x !== "C" + item.xCarbon) sel[ans.x] = "bad";
        sel["C" + item.hCarbon] = "good"; sel["C" + item.xCarbon] = "good";
      }
      C.draw(s, { mol: item.mol, reagent: item.reagent, showH: hints > 0, targets: true, noPi: true, selected: sel });
      // only carbons are offered as answers here: hide reagent and bond targets
      Array.prototype.forEach.call(s.querySelectorAll('[data-target="H"],[data-target="X"],[data-target="HX"]'), function (n) { n.remove(); });
      document.getElementById("ip").textContent = done ? "Green: the correct carbons. Red: a tap that was not correct." : part === 0 ? "Part 1: tap the carbon that gains H." : part === 1 ? "Part 2: tap the carbon bonded to " + item.reagent.slice(1) + " in the major product." : "Part 3: choose the stereochemical outcome.";
      document.getElementById("check").disabled = done || !(ans.h && ans.x && ans.stereo);
    }
    document.getElementById("hintH").onclick = function () { if (!hints) { hints = 1; this.disabled = true; this.textContent = "H counts shown (hint used)"; paint(); } };
    function pick(t) { if (done) return; if (part === 0) { ans.h = t; part = 1; } else { ans.x = t; part = 2; } paint(); }
    s.addEventListener("click", function (e) { var t = e.target.closest("[data-target]"); if (t) pick(t.getAttribute("data-target")); });
    s.addEventListener("keydown", function (e) { var t = e.target.closest("[data-target]"); if (t && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(t.getAttribute("data-target")); } });
    screen.querySelector(".card").addEventListener("click", function (e) {
      var b = e.target.closest("[data-stereo]"); if (!b || done) return;
      ans.stereo = b.dataset.stereo;
      Array.prototype.forEach.call(screen.querySelectorAll("[data-stereo]"), function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      paint();
    });
    var reset = document.createElement("button"); reset.type = "button"; reset.className = "btn secondary"; reset.textContent = "Change my taps";
    reset.onclick = function () { if (done) return; ans.h = null; ans.x = null; part = 0; paint(); };
    document.getElementById("check").parentNode.appendChild(reset);
    document.getElementById("check").onclick = function () {
      if (done) return; done = true;
      var hId = Number(String(ans.h).slice(1)), xId = Number(String(ans.x).slice(1)), errs = [];
      var hOk = ans.h === "C" + item.hCarbon, xOk = ans.x === "C" + item.xCarbon, sOk = ans.stereo === item.stereo;
      if (!hOk) errs.push(m.alkene.indexOf(hId) >= 0 ? "regio-less-stable-cation" : "not-alkene-carbon");
      if (!xOk) errs.push(ans.x === ans.h ? "x-on-h-carbon"
        : (!hOk && hId === item.cationFirst && xId === item.hCarbon) ? "x-follows-reversed-regio"
        : item.shift && xId === item.cationFirst ? "missed-rearrangement" : "x-wrong-carbon");
      if (!sOk) errs.push(item.stereo === "racemic" ? (ans.stereo === "single" ? "stereo-single-enantiomer" : "stereo-missed-center") : "stereo-false-center");
      var correct = !errs.length;
      save({ itemId: item.id, itemVersion: item.version, activity: activity, correct: correct, errorType: errs[0] || null,
        response: { h: ans.h, x: ans.x, stereo: ans.stereo, errors: errs }, unfamiliar: true, assistance: { hints: hints } })
        .then(function (ev) { showResult(ev); }, function () { showResult(null); });
      function showResult(ev) {
        var html = "";
        html += hOk ? fb("good", "Part 1 correct.", "<p>H adds to C" + item.hCarbon + ", leaving the more stable carbocation on C" + item.cationFirst + ".</p>")
          : fb("bad", "Part 1: H goes to C" + item.hCarbon + ".", "<p>" + (errs[0] === "not-alkene-carbon" ? "H adds to one of the two carbons of the C=C." : "Putting H there would leave a less stable carbocation.") + "</p>") + reteach("regio", item.mol);
        html += xOk ? fb("good", "Part 2 correct.", "<p>" + (item.shift ? "A hydride shift moved the + charge from C" + item.cationFirst + " to the tertiary C" + item.xCarbon + ", and the halide bonded there." : "The halide bonds to the carbocation carbon, C" + item.xCarbon + ".") + "</p>")
          : fb("bad", "Part 2: the halogen ends up on C" + item.xCarbon + ".", "<p>" + (errs.indexOf("missed-rearrangement") >= 0 ? "You stopped at the first carbocation. Check whether a 1,2-shift makes a more stable one."
            : errs.indexOf("x-on-h-carbon") >= 0 ? "You put the H and the halogen on the same carbon. The halide bonds to the other alkene carbon, the one that carries the + charge."
            : errs.indexOf("x-follows-reversed-regio") >= 0 ? "Your halogen placement follows from your Part 1 choice, so the same mix-up affects both parts. Once the H goes on C" + item.hCarbon + ", the + charge, and therefore the halogen, ends up on C" + item.xCarbon + "."
            : "The halide bonds to the carbocation carbon.") + "</p>") +
            reteach(item.shift ? "shift" : "x", item.mol, item);
        html += sOk ? fb("good", "Part 3 correct.", "<p>" + (item.stereo === "racemic" ? "The new stereocenter forms from a flat carbocation, so the product is racemic." : "No new stereocenter forms.") + "</p>")
          : fb("bad", "Part 3: " + (item.stereo === "racemic" ? "a racemic mixture forms." : "no new stereocenter forms."), "") + reteach("stereo");
        html += '<div id="prod"></div><p class="prompt">Product: ' + esc(item.productName) + "</p>";
        var counted = ev && ev.independent;
        html += '<div class="feedback info"><strong>' + (correct ? (counted ? "Counted as independent evidence." : "Correct, but recorded as practice.") : "Recorded so the app can bring this back.") + "</strong>" +
          (correct && !counted ? "<p>A hint was used, or this problem was not new, so it counts as practice.</p>" : "") +
          "<p>Come back after your next review date for a different problem. Correct work on two different problems on two different days is the strongest evidence this app records.</p></div>" +
          '<div class="row"><button class="btn secondary" type="button" data-go="learn2">Review the lesson</button></div>';
        document.getElementById("ifb").innerHTML = html;
        if (!hOk) paintPair(item.mol, "rt");
        var ps = svg(); document.getElementById("prod").appendChild(ps);
        var prodOpts = { mol: item.mol, showH: true, product: { hOn: item.hCarbon, xOn: item.xCarbon, x: item.reagent.slice(1) } };
        if (item.shift) { var sh = C.predict(C.MOLS[item.mol]).shift; prodOpts.product.shiftFrom = sh.from; prodOpts.product.shiftTo = item.cationFirst; }
        C.draw(ps, prodOpts);
        paint();
      }
    };
    paint();
  }

  // ---------- start ----------
  LR.init().then(refreshStatus).then(function (r) {
    if (r && r.st.due && unlocked) go("independent"); else go("learn1");
  }, function () { go("learn1"); });
})();
