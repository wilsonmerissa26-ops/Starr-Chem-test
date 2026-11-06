/* A&P pilot: shared builder for a muscle set (head and neck, trunk) and the typed-name matcher. */
(function (global) {
  "use strict";
  function pairKey(a, b) { return [a, b].sort().join("|"); }
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[()\-,.;:'"]/g, " ").split(/\s+/)
      .filter(function (w) { return w && ["the", "of", "muscle", "muscles", "m"].indexOf(w) < 0; }).join(" ");
  }
  function lev(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function tol(accepted) { return accepted.length >= 8 ? 2 : 1; }

  function build(def) {
    var MUSCLES = def.MUSCLES;
    function isPair(a, b) { return MUSCLES[a].lookalike === b || MUSCLES[b].lookalike === a; }
    function wrongAs(target, other) {
      return { correct: false, errorType: isPair(target, other) ? "lookalike-" + pairKey(target, other).replace("|", "-vs-") : "wrong-muscle", note: null, matched: other };
    }
    // Returns {correct, errorType, note, matched}.
    // Order matters: an exact name always wins, so "internal oblique" is never accepted as a misspelling of "external oblique".
    function match(typed, target) {
      var t = norm(typed), m = MUSCLES[target];
      if (!t) return { correct: false, errorType: "no-answer", note: null, matched: null };
      var acc = m.accept.map(norm);
      if (acc.indexOf(t) >= 0) return { correct: true, errorType: null, note: m.partial && m.partial[t] ? m.partial[t] : null, matched: target };
      var exactOther = Object.keys(MUSCLES).filter(function (k) { return k !== target && MUSCLES[k].accept.map(norm).indexOf(t) >= 0; })[0];
      if (exactOther) return wrongAs(target, exactOther);
      if (def.INCOMPLETE && def.INCOMPLETE[t]) return { correct: false, errorType: "incomplete-name", note: def.INCOMPLETE[t], matched: null };
      // Closest spelling: accept only if the lesson's own muscle is strictly the closest.
      var best = null, bestD = Infinity, tie = false;
      Object.keys(MUSCLES).forEach(function (k) {
        MUSCLES[k].accept.map(norm).forEach(function (a) {
          var dd = lev(t, a); if (dd > tol(a)) return;
          if (dd < bestD) { bestD = dd; best = k; tie = false; } else if (dd === bestD && k !== best) tie = true;
        });
      });
      if (best && !tie && best === target) return { correct: true, errorType: "spelling-close", note: "Check the spelling: " + m.name + ".", matched: target };
      if (best && !tie) return wrongAs(target, best);
      if (best && tie) return { correct: false, errorType: "ambiguous-spelling", note: "That spelling is close to more than one muscle. Check the first word.", matched: null };
      return { correct: false, errorType: "not-recognized", note: null, matched: null };
    }
    return { MUSCLES: MUSCLES, LOOKALIKE_NOTES: def.LOOKALIKE_NOTES, pairKey: pairKey, FIGURES: def.FIGURES, PINS: def.PINS, OBJ: def.OBJ,
      GUIDED: def.GUIDED, ITEMS: def.ITEMS, SET: def.SET, match: match, norm: norm };
  }
  global.MuscleCore = { build: build, pairKey: pairKey, norm: norm, lev: lev };
  global.MuscleSets = global.MuscleSets || {};
})(window);
