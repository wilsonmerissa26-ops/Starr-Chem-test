/* Chapter 8 pilot: molecules, a small chemistry engine, and an SVG renderer with tap targets.
 * Coordinates are in bond-length units (y points down). Every item's answer key is stored explicitly
 * and is independently re-derived by test-learning-pilots.py; the engine below is used for reteach visuals.
 */
(function (global) {
  "use strict";
  // h = implicit hydrogens on that carbon in the starting alkene
  var MOLS = {
    propene: { name: "propene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1]], alkene: [1, 2] },
    methylpropene: { name: "2-methylpropene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 0 }, { id: 3, x: 1.732, y: .5, h: 3 }, { id: 4, branch: true, x: .866, y: -1, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [2, 4, 1]], alkene: [1, 2] },
    methylbutene2: { name: "2-methyl-2-butene", atoms: [{ id: 1, x: 0, y: .5, h: 3 }, { id: 2, x: .866, y: 0, h: 0 }, { id: 5, branch: true, x: .866, y: -1, h: 3 }, { id: 3, x: 1.732, y: .5, h: 1 }, { id: 4, x: 2.598, y: 0, h: 3 }],
      bonds: [[1, 2, 1], [2, 5, 1], [2, 3, 2], [3, 4, 1]], alkene: [2, 3] },
    dimethylbutene33: { name: "3,3-dimethyl-1-butene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 0 }, { id: 4, x: 2.598, y: 0, h: 3 }, { id: 5, branch: true, x: 1.232, y: 1.366, h: 3 }, { id: 6, branch: true, x: 2.232, y: 1.366, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1], [3, 5, 1], [3, 6, 1]], alkene: [1, 2] },
    hexene1: { name: "1-hexene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 2 }, { id: 4, x: 2.598, y: 0, h: 2 }, { id: 5, x: 3.464, y: .5, h: 2 }, { id: 6, x: 4.33, y: 0, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 6, 1]], alkene: [1, 2] },
    butene1: { name: "1-butene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 2 }, { id: 4, x: 2.598, y: 0, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1]], alkene: [1, 2] },
    methylcyclohexene1: { name: "1-methylcyclohexene", atoms: [{ id: 1, x: .866, y: -.5, h: 0 }, { id: 2, x: .866, y: .5, h: 1 }, { id: 3, x: 0, y: 1, h: 2 }, { id: 4, x: -.866, y: .5, h: 2 }, { id: 5, x: -.866, y: -.5, h: 2 }, { id: 6, x: 0, y: -1, h: 2 }, { id: 7, branch: true, x: 1.732, y: -1, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1], [4, 5, 1], [5, 6, 1], [6, 1, 1], [1, 7, 1]], alkene: [1, 2], ring: true },
    methylpentene2: { name: "2-methyl-2-pentene", atoms: [{ id: 1, x: 0, y: .5, h: 3 }, { id: 2, x: .866, y: 0, h: 0 }, { id: 6, branch: true, x: .866, y: -1, h: 3 }, { id: 3, x: 1.732, y: .5, h: 1 }, { id: 4, x: 2.598, y: 0, h: 2 }, { id: 5, x: 3.464, y: .5, h: 3 }],
      bonds: [[1, 2, 1], [2, 6, 1], [2, 3, 2], [3, 4, 1], [4, 5, 1]], alkene: [2, 3] },
    pentene1: { name: "1-pentene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 2 }, { id: 4, x: 2.598, y: 0, h: 2 }, { id: 5, x: 3.464, y: .5, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1], [4, 5, 1]], alkene: [1, 2] },
    // Rearranged cation skeleton for the 3,3-dimethyl-1-butene + HCl teaching example (after the methyl shift).
    dimethylbutyl23: { name: "2,3-dimethylbutane skeleton", atoms: [{ id: 1, x: 0, y: .5, h: 3 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 5, branch: true, x: .866, y: -1, h: 3 }, { id: 3, x: 1.732, y: .5, h: 0 }, { id: 4, x: 2.598, y: 0, h: 3 }, { id: 6, branch: true, x: 1.732, y: 1.5, h: 3 }],
      bonds: [[1, 2, 1], [2, 5, 1], [2, 3, 1], [3, 4, 1], [3, 6, 1]], alkene: null },
    methylbutene3: { name: "3-methyl-1-butene", atoms: [{ id: 1, x: 0, y: .5, h: 2 }, { id: 2, x: .866, y: 0, h: 1 }, { id: 3, x: 1.732, y: .5, h: 1 }, { id: 4, x: 2.598, y: 0, h: 3 }, { id: 5, branch: true, x: 1.732, y: 1.5, h: 3 }],
      bonds: [[1, 2, 2], [2, 3, 1], [3, 4, 1], [3, 5, 1]], alkene: [1, 2] }
  };

  // Independent problems: never shown in teaching, examples or guided practice.
  // stereo: "none" = no new stereocenter; "racemic" = new stereocenter, both enantiomers.
  var POOL = [
    { id: "chem-ch8-ind-1-butene-hbr", version: 1, mol: "butene1", reagent: "HBr", hCarbon: 1, xCarbon: 2, cationFirst: 2, shift: null, stereo: "racemic",
      productName: "2-bromobutane (racemic)" },
    { id: "chem-ch8-ind-1-methylcyclohexene-hcl", version: 1, mol: "methylcyclohexene1", reagent: "HCl", hCarbon: 2, xCarbon: 1, cationFirst: 1, shift: null, stereo: "none",
      productName: "1-chloro-1-methylcyclohexane" },
    { id: "chem-ch8-ind-2-methyl-2-pentene-hbr", version: 1, mol: "methylpentene2", reagent: "HBr", hCarbon: 3, xCarbon: 2, cationFirst: 2, shift: null, stereo: "none",
      productName: "2-bromo-2-methylpentane" },
    { id: "chem-ch8-ind-3-methyl-1-butene-hbr", version: 1, mol: "methylbutene3", reagent: "HBr", hCarbon: 1, xCarbon: 3, cationFirst: 2, shift: "hydride", stereo: "none",
      productName: "2-bromo-2-methylbutane (major, after a hydride shift)" },
    { id: "chem-ch8-ind-1-pentene-hbr", version: 1, mol: "pentene1", reagent: "HBr", hCarbon: 1, xCarbon: 2, cationFirst: 2, shift: null, stereo: "racemic",
      productName: "2-bromopentane (racemic)" }
  ];

  // ---------- engine ----------
  function atom(m, id) { for (var i = 0; i < m.atoms.length; i++) if (m.atoms[i].id === id) return m.atoms[i]; return null; }
  function neighbors(m, id) {
    var out = [];
    m.bonds.forEach(function (b) { if (b[0] === id) out.push(b[1]); else if (b[1] === id) out.push(b[0]); });
    return out;
  }
  // Carbocation class at carbon c = number of carbons bonded to it.
  function cationClass(m, c) { return neighbors(m, c).length; }
  var CLASS_WORD = { 0: "methyl", 1: "primary (1°)", 2: "secondary (2°)", 3: "tertiary (3°)" };
  function regioOptions(m) {
    var a = m.alkene[0], b = m.alkene[1];
    return [{ hOn: a, cation: b, cls: cationClass(m, b) }, { hOn: b, cation: a, cls: cationClass(m, a) }];
  }
  // A 1,2-shift is favorable if a neighbouring carbon would become a more substituted cation.
  function bestShift(m, c, hOn) {
    var cls = cationClass(m, c), best = null;
    neighbors(m, c).forEach(function (n) {
      if (n === hOn) return;
      var nCls = cationClass(m, n), nH = atom(m, n).h;
      if (nH > 0 && nCls > cls && (!best || nCls > best.cls)) best = { type: "hydride", from: n, cls: nCls };
      var movable = neighbors(m, n).filter(function (x) { return x !== c && neighbors(m, x).length === 1; });
      if (movable.length && nCls - 1 > cls && (!best || nCls - 1 > best.cls)) best = { type: "methyl", from: n, cls: nCls - 1, migrating: movable[0] };
    });
    return best;
  }
  function predict(m) {
    var opts = regioOptions(m).sort(function (x, y) { return y.cls - x.cls; });
    var first = opts[0], shift = bestShift(m, first.cation, first.hOn);
    return { hCarbon: first.hOn, cationFirst: first.cation, shift: shift, xCarbon: shift ? shift.from : first.cation };
  }

  // ---------- renderer ----------
  var NS = "http://www.w3.org/2000/svg", S = 64, PAD = 46;
  function el(name, attrs) { var e = document.createElementNS(NS, name); for (var k in attrs) e.setAttribute(k, attrs[k]); return e; }

  /* opts: { mol, reagent: "HBr"|"HCl"|null, showH, cation: id|null, product: {hOn, xOn, x:"Br"|"Cl"}|null,
             arrows: [{from:[x,y], to:[x,y], bend}], targets: true|false, selected: {id: "good"|"bad"},
             wedge: {from:id, kind:"wedge"|"dash"} , extraX: {on:id, x:"Br", dir:[dx,dy]} , label } */
  function draw(svg, opts) {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var m = MOLS[opts.mol], pts = {};
    m.atoms.forEach(function (a) { pts[a.id] = [a.x, a.y]; });
    var reagentAt = null, xName = opts.reagent ? opts.reagent.slice(1) : null;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    m.atoms.forEach(function (a) { minX = Math.min(minX, a.x); maxX = Math.max(maxX, a.x); minY = Math.min(minY, a.y); maxY = Math.max(maxY, a.y); });
    if (opts.reagent && !opts.product) { reagentAt = [maxX + 1.4, (minY + maxY) / 2]; maxX = reagentAt[0] + 1.3; }
    var xPos = null;
    if (opts.product) { xPos = substituentPos(m, opts.product.xOn); minY = Math.min(minY, xPos[1]); maxY = Math.max(maxY, xPos[1]); minX = Math.min(minX, xPos[0]); maxX = Math.max(maxX, xPos[0]); }
    if (opts.wedge) { xPos = substituentPos(m, opts.wedge.from); minY = Math.min(minY, xPos[1]); }
    var numPos = {};
    if (opts.numbers !== false) {
      var subOn = opts.product ? opts.product.xOn : opts.wedge ? opts.wedge.from : null;
      m.atoms.forEach(function (a) {
        if (a.branch) return;
        var extra = a.id === subOn ? [substituentPos(m, a.id)] : [];
        var d = freeDir(m, a.id, extra), off = opts.showH ? .62 : .6;
        numPos[a.id] = [a.x + Math.cos(d) * off, a.y + Math.sin(d) * off];
        minX = Math.min(minX, numPos[a.id][0] - .15); maxX = Math.max(maxX, numPos[a.id][0] + .15);
        minY = Math.min(minY, numPos[a.id][1] - .15); maxY = Math.max(maxY, numPos[a.id][1] + .1);
      });
    }
    var W = (maxX - minX) * S + PAD * 2, H = (maxY - minY) * S + PAD * 2 + 10;
    svg.setAttribute("viewBox", "0 0 " + W.toFixed(0) + " " + H.toFixed(0));
    svg.setAttribute("width", "100%");
    svg.style.maxWidth = Math.min(W * 1.25, 760) + "px";
    function P(p) { return [(p[0] - minX) * S + PAD, (p[1] - minY) * S + PAD]; }
    var defs = el("defs", {});
    var mk = el("marker", { id: "ah", viewBox: "0 0 10 10", refX: "8", refY: "5", markerWidth: "7", markerHeight: "7", orient: "auto-start-reverse" });
    mk.appendChild(el("path", { d: "M0,0 L10,5 L0,10 z", fill: "#b23a7a" }));
    defs.appendChild(mk); svg.appendChild(defs);
    var gB = el("g", { stroke: "#23172f", "stroke-width": "3", "stroke-linecap": "round" }); svg.appendChild(gB);
    var centroid = [0, 0]; m.atoms.forEach(function (a) { centroid[0] += a.x / m.atoms.length; centroid[1] += a.y / m.atoms.length; });
    m.bonds.forEach(function (b) {
      var a = P(pts[b[0]]), c = P(pts[b[1]]);
      var order = b[2];
      if ((opts.product || opts.saturate) && m.alkene && ((b[0] === m.alkene[0] && b[1] === m.alkene[1]) || (b[1] === m.alkene[0] && b[0] === m.alkene[1]))) order = 1;
      gB.appendChild(el("line", { x1: a[0], y1: a[1], x2: c[0], y2: c[1] }));
      if (order === 2) {
        var dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
        var mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2], cc = P(centroid);
        if ((cc[0] - mid[0]) * nx + (cc[1] - mid[1]) * ny < 0 || !m.ring) { if (!m.ring) { if (ny < 0) { nx = -nx; ny = -ny; } } else { nx = -nx; ny = -ny; } }
        var off = 9, sh = .16;
        gB.appendChild(el("line", { x1: a[0] + nx * off + dx * sh, y1: a[1] + ny * off + dy * sh, x2: c[0] + nx * off - dx * sh, y2: c[1] + ny * off - dy * sh }));
      }
    });
    var gT = el("g", { "font-family": "-apple-system,Segoe UI,Roboto,sans-serif" }); svg.appendChild(gT);
    function label(p, text, opt) {
      opt = opt || {};
      var q = P(p);
      if (opt.bg !== false) gT.appendChild(el("circle", { cx: q[0], cy: q[1], r: opt.r || 15, fill: "#fbf8fe" }));
      var t = el("text", { x: q[0], y: q[1] + 6, "text-anchor": "middle", "font-size": opt.size || 19, "font-weight": "700", fill: opt.color || "#23172f" });
      t.textContent = text; gT.appendChild(t);
    }
    // Teaching mode: write each carbon as a condensed label (CH3, CH2, CH, C) so hydrogens are visible.
    if (opts.showH) {
      m.atoms.forEach(function (a) {
        var h = a.h;
        if (opts.hAdded === a.id) h += 1;
        if (opts.product) { if (a.id === opts.product.hOn) h += 1; if (opts.product.shiftFrom === a.id) h -= 1; if (opts.product.shiftTo === a.id) h += 1; }
        var text = "C" + (h === 0 ? "" : h === 1 ? "H" : "H" + ["", "", "\u2082", "\u2083"][h]);
        if (opts.cation === a.id) text += "\u207A";
        var q = P([a.x, a.y]), w = 12 + text.length * 9;
        gT.appendChild(el("rect", { x: q[0] - w / 2, y: q[1] - 13, width: w, height: 26, rx: 9, fill: "#fbf8fe" }));
        var t = el("text", { x: q[0], y: q[1] + 6, "text-anchor": "middle", "font-size": 17, "font-weight": "700", fill: opts.cation === a.id ? "#b23a7a" : "#23172f" });
        t.textContent = text; gT.appendChild(t);
      });
    }
    // Carbon numbers (main chain or ring only), so feedback such as "H adds to C1" can be followed on the drawing.
    if (opts.numbers !== false) {
      Object.keys(numPos).forEach(function (id) {
        var q = P(numPos[id]);
        var t = el("text", { x: q[0], y: q[1] + 4, "text-anchor": "middle", "font-size": 12, "font-weight": "700", fill: "#8a7d99" });
        t.textContent = "C" + id; gT.appendChild(t);
      });
    }
    if (opts.cation && !opts.showH) { var cp = pts[opts.cation], dd = awayDir(m, opts.cation); label([cp[0] + dd[0] * (opts.showH ? .5 : .38) + (opts.showH ? .22 : 0), cp[1] + dd[1] * (opts.showH ? .5 : .38) - (opts.showH ? .18 : 0)], "+", { size: 22, color: "#b23a7a", r: 11 }); }
    if (opts.product) {
      var xp = substituentPos(m, opts.product.xOn), a0 = P(pts[opts.product.xOn]), b0 = P(xp);
      gB.appendChild(el("line", { x1: a0[0], y1: a0[1], x2: a0[0] + (b0[0] - a0[0]) * .62, y2: a0[1] + (b0[1] - a0[1]) * .62 }));
      label(xp, opts.product.x, { r: 17 });
    }
    if (opts.wedge) {
      var wp = substituentPos(m, opts.wedge.from), w0 = P(pts[opts.wedge.from]), w1 = P(wp);
      var ux = w1[0] - w0[0], uy = w1[1] - w0[1], UL = Math.hypot(ux, uy); ux /= UL; uy /= UL;
      var end = [w0[0] + ux * UL * .7, w0[1] + uy * UL * .7], px = -uy, py = ux;
      if (opts.wedge.kind === "wedge") gB.appendChild(el("polygon", { points: [w0, [end[0] + px * 7, end[1] + py * 7], [end[0] - px * 7, end[1] - py * 7]].map(function (p) { return p.join(","); }).join(" "), fill: "#23172f", stroke: "none" }));
      else for (var k = 1; k <= 6; k++) { var f = k / 6, cx = w0[0] + ux * UL * .7 * f, cy = w0[1] + uy * UL * .7 * f, hw = 7 * f; gB.appendChild(el("line", { x1: cx + px * hw, y1: cy + py * hw, x2: cx - px * hw, y2: cy - py * hw, "stroke-width": "2" })); }
      label(wp, opts.wedge.x || "Br", { r: 17 });
    }
    if (reagentAt) {
      var hP = reagentAt, xP = [reagentAt[0] + 1, reagentAt[1]], hq = P(hP), xq = P(xP);
      gB.appendChild(el("line", { x1: hq[0] + 12, y1: hq[1], x2: xq[0] - 16, y2: xq[1] }));
      label(hP, "H"); label(xP, xName, { r: 17 });
      pts.H = hP; pts.X = xP;
    }
    // arrows
    var gA = el("g", { fill: "none", stroke: "#b23a7a", "stroke-width": "2.6" }); svg.appendChild(gA);
    (opts.arrows || []).forEach(function (ar) {
      var a = P(resolve(ar.from)), b = P(resolve(ar.to)), bend = ar.bend || -.45;
      var mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1];
      var cx = mx - dy * bend, cy = my + dx * bend;
      gA.appendChild(el("path", { d: "M" + a[0] + "," + a[1] + " Q" + cx + "," + cy + " " + b[0] + "," + b[1], "marker-end": "url(#ah)" }));
    });
    function resolve(r) {
      if (typeof r === "string") {
        if (r === "pi") { var p1 = pts[m.alkene[0]], p2 = pts[m.alkene[1]]; return [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2 - .12]; }
        if (r === "HX") return [(pts.H[0] + pts.X[0]) / 2, pts.H[1] - .08];
        if (r === "H" || r === "X") return [pts[r][0], pts[r][1] - .3];
        if (r[0] === "C") return pts[Number(r.slice(1))];
      }
      return r;
    }
    // tap targets
    if (opts.targets) {
      var gH = el("g", {}); svg.appendChild(gH);
      var add = function (id, shape, aria) {
        shape.setAttribute("data-target", id); shape.setAttribute("role", "button"); shape.setAttribute("tabindex", "0");
        shape.setAttribute("aria-label", aria); shape.setAttribute("class", "tap" + (opts.selected && opts.selected[id] ? " " + opts.selected[id] : ""));
        gH.appendChild(shape);
      };
      var p1 = P(pts[m.alkene[0]]), p2 = P(pts[m.alkene[1]]);
      var bx = (p1[0] + p2[0]) / 2, by = (p1[1] + p2[1]) / 2, ang = Math.atan2(p2[1] - p1[1], p2[0] - p1[0]) * 180 / Math.PI;
      if (!opts.noPi) add("pi", el("rect", { x: bx - 22, y: by - 15, width: 44, height: 30, rx: 14, transform: "rotate(" + ang + " " + bx + " " + by + ")" }), "The C=C double bond (pi bond)");
      m.atoms.forEach(function (a) { var q = P(pts[a.id]); add("C" + a.id, el("circle", { cx: q[0], cy: q[1], r: 24 }), "Carbon " + a.id); });
      if (reagentAt) {
        var hq2 = P(pts.H), xq2 = P(pts.X);
        add("H", el("circle", { cx: hq2[0], cy: hq2[1], r: 22 }), "The H of H" + xName);
        add("X", el("circle", { cx: xq2[0], cy: xq2[1], r: 22 }), "The " + xName + " of H" + xName);
        add("HX", el("rect", { x: (hq2[0] + xq2[0]) / 2 - 12, y: hq2[1] - 14, width: 24, height: 28, rx: 8 }), "The H–" + xName + " bond");
      }
    }
    if (opts.label) { var tl = el("text", { x: W / 2, y: H - 8, "text-anchor": "middle", "font-size": "14", fill: "#6c6179" }); tl.textContent = opts.label; svg.appendChild(tl); }
    return svg;
  }
  function awayDir(m, id) {
    var a = atom(m, id), sx = 0, sy = 0;
    neighbors(m, id).forEach(function (n) { var b = atom(m, n); sx += b.x - a.x; sy += b.y - a.y; });
    var L = Math.hypot(sx, sy);
    if (L < 1e-6) return [0, -1];
    return [-sx / L, -sy / L];
  }
  // The most open direction around an atom: farthest (in angle) from every bond and any extra points.
  function freeDir(m, id, extraPts) {
    var a = atom(m, id), dirs = neighbors(m, id).map(function (n) { var b = atom(m, n); return Math.atan2(b.y - a.y, b.x - a.x); });
    (extraPts || []).forEach(function (p) { dirs.push(Math.atan2(p[1] - a.y, p[0] - a.x)); });
    var best = -Math.PI / 2, bestGap = -1;
    for (var deg = -90; deg < 270; deg += 15) {
      var t = deg * Math.PI / 180, gap = Math.PI;
      dirs.forEach(function (d) { var x = Math.abs(t - d) % (2 * Math.PI); x = Math.min(x, 2 * Math.PI - x); gap = Math.min(gap, x); });
      if (gap > bestGap + 1e-9) { bestGap = gap; best = t; }
    }
    return best;
  }
  function substituentPos(m, id) { var a = atom(m, id), t = freeDir(m, id, []); return [a.x + Math.cos(t), a.y + Math.sin(t)]; }

  global.Ch8 = { MOLS: MOLS, POOL: POOL, cationClass: cationClass, regioOptions: regioOptions, bestShift: bestShift, predict: predict,
    neighbors: neighbors, CLASS_WORD: CLASS_WORD, draw: draw };
})(window);
