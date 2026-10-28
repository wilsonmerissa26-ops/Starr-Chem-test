/* A&P pilot data: muscles, figures, pins, items and the typed-name matcher.
 * Actions follow OpenStax Anatomy and Physiology 2e (axial muscles of the head, neck and back).
 * Pin positions come from OpenStax leader lines (tools/build-ap-images.py, img/pins.json).
 */
(function (global) {
  "use strict";
  var MUSCLES = {
    "frontal-belly": { name: "Occipitofrontalis (frontal belly)", region: "forehead",
      accept: ["occipitofrontalis frontal belly", "frontal belly occipitofrontalis", "frontal belly", "frontalis", "occipitofrontalis"],
      partial: { "occipitofrontalis": "Add \"frontal belly\" to be complete: this muscle has a frontal and an occipital belly." },
      location: "The broad, vertical sheet over the forehead, above the eyes.",
      action: "Raises the eyebrows, as when showing surprise.",
      cue: "Find the eyes, then look straight up at the forehead.", lookalike: "temporalis" },
    "orbicularis-oculi": { name: "Orbicularis oculi", region: "eye",
      accept: ["orbicularis oculi"], location: "A ring of muscle around each eye.",
      action: "Closes the eyelids.", cue: "Circular fibers around the eye. \"Oculi\" = eye.", lookalike: "orbicularis-oris" },
    "orbicularis-oris": { name: "Orbicularis oris", region: "mouth",
      accept: ["orbicularis oris"], location: "A ring of muscle around the mouth, within the lips.",
      action: "Moves and shapes the lips, as during speech.", cue: "Circular fibers around the lips. \"Oris\" = mouth.", lookalike: "orbicularis-oculi" },
    "buccinator": { name: "Buccinator", region: "cheek",
      accept: ["buccinator"], location: "In the cheek, with horizontal fibers running forward to the corner of the mouth.",
      action: "Compresses the cheek, as when blowing, whistling, or sucking through a straw.",
      cue: "Horizontal cheek fibers that run into the corner of the mouth.", lookalike: "masseter" },
    "temporalis": { name: "Temporalis", region: "side of skull",
      accept: ["temporalis"], location: "A fan-shaped muscle on the side of the skull, over the temple and above the ear.",
      action: "Closes the mouth (elevates the mandible) and pulls the lower jaw back under the upper jaw (retracts the mandible).",
      cue: "A fan over the temple. Feel it tighten above your ear when you clench.", lookalike: "frontal-belly" },
    "masseter": { name: "Masseter", region: "jaw",
      accept: ["masseter"], location: "On the side of the face over the back of the lower jaw (mandible), in front of the ear.",
      action: "Elevates the mandible to close the mouth; the prime mover for chewing.",
      cue: "The thick muscle that bulges at the angle of your jaw when you clench your teeth.", lookalike: "buccinator" },
    "sternocleidomastoid": { name: "Sternocleidomastoid", region: "neck",
      accept: ["sternocleidomastoid"], location: "The long diagonal muscle on the side of the neck, from the sternum and clavicle up to the mastoid process behind the ear.",
      action: "One side: rotates the head to the opposite side. Both sides together: flex the neck.",
      cue: "Read the name: sterno (sternum), cleido (clavicle), mastoid (mastoid process).", lookalike: null }
  };
  var LOOKALIKE_NOTES = {
    "orbicularis-oculi|orbicularis-oris": "Both are ring-shaped muscles. Oculi surrounds the eye and closes the eyelids. Oris surrounds the mouth and moves the lips.",
    "buccinator|masseter": "Both sit in the cheek area. Masseter is thick, over the back of the jaw near the ear, and closes the jaw. Buccinator is thinner, nearer the mouth, with horizontal fibers, and compresses the cheek.",
    "frontal-belly|temporalis": "Both are broad muscles on the head. The frontal belly is on the forehead and raises the eyebrows. Temporalis is on the side of the skull over the temple and closes the jaw."
  };
  function pairKey(a, b) { return [a, b].sort().join("|"); }

  var FIGURES = {
    "face-anterior": { img: "img/face-anterior-unlabeled.jpg", alt: "Facial muscles, anterior view, labels covered", labeled: "img/face-labeled.jpg" },
    "face-lateral": { img: "img/face-lateral-unlabeled.jpg", alt: "Facial muscles, lateral view, labels covered", labeled: "img/face-labeled.jpg" },
    "jaw": { img: "img/jaw-unlabeled.jpg", alt: "Chewing muscles, superficial lateral view, labels covered", labeled: "img/jaw-labeled.jpg" },
    "neck": { img: "img/neck-unlabeled.jpg", alt: "Neck muscles, left lateral view, labels covered", labeled: "img/neck-labeled.jpg" }
  };
  var PINS = { // from img/pins.json (percent of image width and height)
    "face-anterior": { "frontal-belly": [92.0, 27.19], "orbicularis-oculi": [92.0, 43.63], "orbicularis-oris": [92.36, 69.25], "buccinator": [96.36, 85.96] },
    "face-lateral": { "frontal-belly": [8.91, 27.19], "orbicularis-oculi": [9.23, 43.63], "orbicularis-oris": [8.43, 69.25], "buccinator": [5.89, 85.96] },
    "jaw": { "temporalis": [17.8, 8.25], "masseter": [15.6, 79.19] },
    "neck": { "sternocleidomastoid": [76.32, 24.59] }
  };

  var OBJ = {
    face: "bio131.ch9.facial-muscle-id",     // identify facial muscles on an unlabeled image (independent view: lateral)
    jawneck: "bio131.ch9.jaw-neck-id",       // masseter, temporalis, sternocleidomastoid (only one labeled view available)
    actions: "bio131.ch9.head-neck-actions"  // actions and look-alikes, recalled from function
  };

  // Guided practice (assisted): anterior face, jaw and neck figures.
  var GUIDED = [
    { fig: "face-anterior", muscle: "frontal-belly" }, { fig: "face-anterior", muscle: "orbicularis-oculi" },
    { fig: "face-anterior", muscle: "orbicularis-oris" }, { fig: "face-anterior", muscle: "buccinator" },
    { fig: "jaw", muscle: "temporalis" }, { fig: "jaw", muscle: "masseter" }, { fig: "neck", muscle: "sternocleidomastoid" }
  ];

  // Independent items. "unfamiliar" items use a view or question never shown in teaching or guided practice.
  var ITEMS = [
    { id: "ap-ch9-lat-name-buccinator", objective: "face", kind: "name-pin", fig: "face-lateral", muscle: "buccinator", unfamiliar: true },
    { id: "ap-ch9-act-clench-bulge", objective: "actions", kind: "name-fn", muscle: "masseter", unfamiliar: true,
      prompt: "Clench your teeth and feel the side of your face at the angle of your jaw. Name the muscle that bulges there." },
    { id: "ap-ch9-lat-name-orbicularis-oculi", objective: "face", kind: "name-pin", fig: "face-lateral", muscle: "orbicularis-oculi", unfamiliar: true },
    { id: "ap-ch9-act-rotate-head", objective: "actions", kind: "name-fn", muscle: "sternocleidomastoid", unfamiliar: true,
      prompt: "Name the neck muscle that, contracting on one side, rotates the head to the opposite side." },
    { id: "ap-ch9-jaw-name-temporalis", objective: "jawneck", kind: "name-pin", fig: "jaw", muscle: "temporalis", unfamiliar: false },
    { id: "ap-ch9-lat-fn-compress-cheek", objective: "face", kind: "pin-fn", fig: "face-lateral", muscle: "buccinator", unfamiliar: true,
      prompt: "Tap the pin on the muscle that compresses the cheek when you blow up a balloon." },
    { id: "ap-ch9-act-raise-eyebrows", objective: "actions", kind: "name-fn", muscle: "frontal-belly", unfamiliar: true,
      prompt: "Name the muscle that raises the eyebrows when you look surprised." },
    { id: "ap-ch9-lat-name-orbicularis-oris", objective: "face", kind: "name-pin", fig: "face-lateral", muscle: "orbicularis-oris", unfamiliar: true },
    { id: "ap-ch9-act-close-eyelids", objective: "actions", kind: "name-fn", muscle: "orbicularis-oculi", unfamiliar: true,
      prompt: "Name the ring-shaped muscle that closes the eyelids when you blink or squint." },
    { id: "ap-ch9-neck-name-sternocleidomastoid", objective: "jawneck", kind: "name-pin", fig: "neck", muscle: "sternocleidomastoid", unfamiliar: false },
    { id: "ap-ch9-lat-fn-close-eyelids", objective: "face", kind: "pin-fn", fig: "face-lateral", muscle: "orbicularis-oculi", unfamiliar: true,
      prompt: "Tap the pin on the muscle that closes the eyelids." },
    { id: "ap-ch9-act-retract-jaw", objective: "actions", kind: "name-fn", muscle: "temporalis", unfamiliar: true,
      prompt: "Name the fan-shaped muscle that closes the mouth and also pulls the lower jaw back under the upper jaw." },
    { id: "ap-ch9-lat-name-frontal-belly", objective: "face", kind: "name-pin", fig: "face-lateral", muscle: "frontal-belly", unfamiliar: true },
    { id: "ap-ch9-act-blow-cheek", objective: "actions", kind: "name-fn", muscle: "buccinator", unfamiliar: true,
      prompt: "Name the cheek muscle that compresses the cheek when you whistle or blow." },
    { id: "ap-ch9-jaw-name-masseter", objective: "jawneck", kind: "name-pin", fig: "jaw", muscle: "masseter", unfamiliar: false },
    { id: "ap-ch9-act-shape-lips", objective: "actions", kind: "name-fn", muscle: "orbicularis-oris", unfamiliar: true,
      prompt: "Name the ring-shaped muscle that moves and shapes the lips during speech." }
  ];

  // ---------- typed-name matching ----------
  function norm(s) {
    return String(s || "").toLowerCase().replace(/[()\-,.;:'"]/g, " ").split(/\s+/)
      .filter(function (w) { return w && ["the", "of", "muscle", "m"].indexOf(w) < 0; }).join(" ");
  }
  function lev(a, b) {
    var d = [], i, j;
    for (i = 0; i <= a.length; i++) { d[i] = [i]; }
    for (j = 1; j <= b.length; j++) d[0][j] = j;
    for (i = 1; i <= a.length; i++) for (j = 1; j <= b.length; j++)
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    return d[a.length][b.length];
  }
  function closeTo(text, accepted) {
    var tol = accepted.length >= 8 ? 2 : 1;
    return lev(text, accepted) <= tol;
  }
  // Returns {correct, errorType, note, matched}
  function match(typed, target) {
    var t = norm(typed), m = MUSCLES[target];
    if (!t) return { correct: false, errorType: "no-answer", note: null, matched: null };
    var acc = m.accept.map(norm);
    if (acc.indexOf(t) >= 0) return { correct: true, errorType: null, note: m.partial && m.partial[t] ? m.partial[t] : null, matched: target };
    for (var i = 0; i < acc.length; i++) if (closeTo(t, acc[i])) return { correct: true, errorType: "spelling-close", note: "Check the spelling: " + m.name + ".", matched: target };
    // Did she name a different lesson muscle?
    var other = null;
    Object.keys(MUSCLES).forEach(function (k) {
      if (k === target || other) return;
      var a2 = MUSCLES[k].accept.map(norm);
      if (a2.indexOf(t) >= 0 || a2.some(function (x) { return closeTo(t, x); })) other = k;
    });
    if (other) {
      var isPair = MUSCLES[target].lookalike === other || MUSCLES[other].lookalike === target;
      return { correct: false, errorType: isPair ? "lookalike-" + pairKey(target, other).replace("|", "-vs-") : "wrong-muscle", note: null, matched: other };
    }
    if (t === "orbicularis") return { correct: false, errorType: "incomplete-name", note: "Orbicularis what? There are two: oculi (eye) and oris (mouth).", matched: null };
    return { correct: false, errorType: "not-recognized", note: null, matched: null };
  }

  global.Muscles = { MUSCLES: MUSCLES, LOOKALIKE_NOTES: LOOKALIKE_NOTES, pairKey: pairKey, FIGURES: FIGURES, PINS: PINS, OBJ: OBJ, GUIDED: GUIDED, ITEMS: ITEMS, match: match, norm: norm };
})(window);
