/* A&P pilot data: trunk muscles (abdominal wall, breathing muscles, posterior abdominal wall).
 * Locations, fiber directions and actions follow OpenStax Anatomy and Physiology 2e, section 11.4,
 * "Axial Muscles of the Abdominal Wall, and Thorax" (https://openstax.org/books/anatomy-and-physiology-2e/pages/11-4-axial-muscles-of-the-abdominal-wall-and-thorax).
 * Rotation direction of the obliques, the two portions of the internal intercostals and the extra quadratus lumborum roles are
 * standard anatomy beyond OpenStax's summary tables.
 * Pin positions come from OpenStax leader lines (tools/build-ap-trunk-images.py, img/pins-trunk.json).
 * Superficial trunk muscles that move the arm (pectoralis major, latissimus dorsi, trapezius, serratus anterior)
 * belong with the upper limb set.
 */
(function (global) {
  "use strict";
  var MUSCLES = {
    "rectus-abdominis": { name: "Rectus abdominis", region: "front of the abdomen, beside the midline",
      accept: ["rectus abdominis", "rectus abdominus"],
      location: "A long, straight band on each side of the midline of the abdomen, from the pubis up to the sternum and ribs, crossed by tendinous intersections (the \"six-pack\" segments).",
      action: "Flexes the vertebral column, as when sitting up.",
      cue: "Vertical fibers in segments beside the midline. \"Rectus\" = straight.",
      feel: { do: "Lie on your back, place your fingertips just to one side of your belly button, and lift your head and shoulders a few inches.", notice: "A firm vertical band tightens under your fingers, on both sides of the midline." },
      lookalike: "transversus-abdominis" },
    "external-oblique": { name: "External oblique", region: "side of the abdomen, outer layer",
      accept: ["external oblique", "external obliques", "abdominal external oblique", "external abdominal oblique"],
      location: "The outermost muscle of the side of the abdomen. Its fibers run inferiorly and medially, like hands slid into front pockets.",
      action: "Twists the trunk at the waist and helps bend it to the side. One side contracting turns the trunk toward the OPPOSITE side.",
      cue: "Outermost side layer; fibers run down and in (\"hands in your front pockets\").",
      feel: { do: "Place one hand on the side of your waist, just below your ribs, then twist your upper body toward the other side.", notice: "The side of the waist firms up under your hand. This is the outer layer; the internal oblique works underneath it." },
      lookalike: "internal-oblique" },
    "internal-oblique": { name: "Internal oblique", region: "side of the abdomen, middle layer",
      accept: ["internal oblique", "internal obliques", "internal abdominal oblique"],
      location: "The middle layer of the side of the abdomen, just under the external oblique. Its fibers run superiorly and medially, at right angles to the external oblique.",
      action: "Works with the external oblique to twist the trunk and bend it to the side, but one side contracting turns the trunk toward the SAME side.",
      cue: "Middle layer; fibers run up and in, crossing the external oblique at a right angle.",
      feel: { do: "Use the same twist as for the external oblique.", notice: "You cannot feel it separately: it lies under the external oblique. Picture its fibers crossing the outer layer like an X." },
      lookalike: "external-oblique" },
    "transversus-abdominis": { name: "Transversus abdominis", region: "deepest layer of the abdominal wall",
      accept: ["transversus abdominis", "transverse abdominis", "transversus abdominus", "transverse abdominus"],
      location: "The deepest layer of the abdominal wall. Its fibers run horizontally around the abdomen, like a belt.",
      action: "Squeezes (compresses) the abdomen, as during a forceful exhalation, a cough, or when straining.",
      cue: "Deepest layer; horizontal fibers like a belt. \"Transversus\" = across.",
      feel: { do: "Place your hands on your belly, below your belly button, and give a strong cough.", notice: "The whole wall pulls in and tightens like a belt cinching. It is deep, so you feel the squeeze rather than the muscle itself." },
      lookalike: "rectus-abdominis" },
    "external-intercostals": { name: "External intercostals", region: "between the ribs, outer layer",
      accept: ["external intercostals", "external intercostal"],
      location: "The outer layer of muscle in each space between the ribs. Fibers run down and forward, from the rib above to the rib below.",
      action: "Raise the rib cage, which expands it, during inhalation.",
      cue: "Outer layer between the ribs; same direction as the external oblique (down and in).",
      feel: { do: "Lay your hands flat on the sides of your lower ribs and take a slow, very deep breath in.", notice: "Your ribs lift and spread outward under your hands. You are seeing several breathing muscles working together; the external intercostals are part of it, not something you can isolate." },
      lookalike: "internal-intercostals" },
    "internal-intercostals": { name: "Internal intercostals", region: "between the ribs, under the outer layer",
      accept: ["internal intercostals", "internal intercostal"],
      location: "Just under the external intercostals in each space between the ribs. Fibers run at right angles to the external intercostals.",
      action: "Draw the ribs together, which constricts the rib cage, during forced exhalation. (Later detail: the part between the rib cartilages can help inhalation.)",
      cue: "Under the externals between the ribs; fibers cross them at a right angle.",
      feel: { do: "Keep your hands on your lower ribs and blow out hard and long, as if blowing out many candles.", notice: "Your ribs pull down and in as you push the last air out. Again this is coordinated work (abdominal muscles help too), not the internal intercostals alone." },
      lookalike: "external-intercostals" },
    "diaphragm": { name: "Diaphragm", region: "between the thoracic and abdominal cavities",
      accept: ["diaphragm"],
      location: "A dome-shaped sheet of muscle that separates the thoracic and abdominal cavities. Its fibers attach around the edge and converge on a central tendon.",
      action: "The main muscle of breathing: when it contracts it flattens, enlarging the thoracic cavity so air flows in (inhalation).",
      cue: "A dome seen from below, with muscle around the edge and a white central tendon in the middle.",
      feel: { do: "Place one hand on your upper abdomen, just below the ribs, and breathe in slowly and deeply through your nose.", notice: "Your belly pushes out as the diaphragm flattens and presses down on the organs below it. You are feeling the effect of coordinated breathing muscles, led by the diaphragm; the diaphragm itself is inside." },
      lookalike: null },
    "quadratus-lumborum": { name: "Quadratus lumborum", region: "posterior abdominal wall",
      accept: ["quadratus lumborum"],
      location: "A four-sided muscle of the posterior abdominal wall, between the top of the ilium (hip bone) and the lowest rib, beside the lumbar vertebrae.",
      action: "Bends the vertebral column to the side. Also steadies the 12th rib during breathing, and both sides together help extend the lower back.",
      cue: "Read the name: quadratus (four-sided), lumborum (lower back).",
      feel: { do: "Place your hands on your lower back just above your hip bones, beside the spine, then lean slowly to one side.", notice: "The back muscles under your hands tighten. Quadratus lumborum lies deep to them, so you feel the region working, not the muscle itself." },
      lookalike: null }
  };
  var LOOKALIKE_NOTES = {
    "external-oblique|internal-oblique": "Both are on the side of the abdomen and twist the trunk. The external oblique is the outer layer, with fibers running down and in. The internal oblique is just under it, with fibers running up and in, at right angles.",
    "external-intercostals|internal-intercostals": "Both fill the spaces between the ribs. The externals are the outer layer and raise the ribs to inhale. The internals are under them, run the opposite way, and pull the ribs together for forced exhalation.",
    "rectus-abdominis|transversus-abdominis": "Both are in the front abdominal wall. Rectus abdominis runs straight up and down beside the midline and flexes the trunk. Transversus abdominis is the deepest layer, runs horizontally like a belt, and squeezes the abdomen."
  };
  var FIGURES = {
    "trunk-abdomen": { img: "img/trunk-abdomen-unlabeled.jpg", alt: "Abdominal muscles, anterior lateral view with an inset of the deep layers, labels covered", labeled: "img/trunk-abdomen-labeled.jpg" },
    "trunk-body-front": { drawing: "openstax-1105-front", img: "img/trunk-body-front-unlabeled.jpg", alt: "Whole-body anterior view of the chest and abdomen, labels covered", labeled: "img/trunk-abdomen-labeled.jpg" },
    "trunk-thorax": { img: "img/trunk-thorax-unlabeled.jpg", alt: "Muscles of the thorax, anterior lateral view, labels covered", labeled: "img/trunk-thorax-labeled.jpg" },
    "trunk-intercostal-detail": { drawing: "openstax-1114-inset", img: "img/trunk-intercostal-detail-unlabeled.jpg", alt: "Close-up of the muscle layers between two ribs, labels covered", labeled: "img/trunk-intercostal-detail-labeled.jpg" },
    "trunk-diaphragm": { img: "img/trunk-diaphragm-unlabeled.jpg", alt: "Diaphragm, inferior view, labels covered", labeled: "img/trunk-diaphragm-labeled.jpg" },
    "trunk-posterior-abdominal": { drawing: "openstax-1112-posterior", img: "img/trunk-posterior-abdominal-unlabeled.jpg", alt: "Posterior abdominal muscles, anterior view, labels covered", labeled: "img/trunk-posterior-abdominal-labeled.jpg" }
  };
  var PINS = { // from img/pins-trunk.json (percent of image width and height); listed top to bottom
    "trunk-abdomen": { "transversus-abdominis": [84.61, 29.23], "external-oblique": [13.96, 40.49], "rectus-abdominis": [15.3, 62.5], "internal-oblique": [93.31, 96.83] },
    "trunk-body-front": { "rectus-abdominis": [21.5, 33.48], "external-oblique": [12.81, 52.61] },
    "trunk-thorax": { "internal-intercostals": [12.32, 42.34], "external-intercostals": [12.54, 68.97] },
    "trunk-intercostal-detail": { "external-intercostals": [79.11, 77.03], "internal-intercostals": [37.65, 86.2] },
    "trunk-diaphragm": { "diaphragm": [11.38, 44.25], "quadratus-lumborum": [81.7, 70.73] },
    "trunk-posterior-abdominal": { "quadratus-lumborum": [17.78, 23.08] }
  };
  var OBJ = {
    id: "bio131.ch9.trunk-muscle-id",        // identify trunk muscles; independent views: whole-body front, intercostal close-up, posterior abdominal wall
    actions: "bio131.ch9.trunk-actions",     // actions and look-alikes, recalled from function
    newpic: "bio131.ch9.trunk-id-new-picture" // identifying on a drawing she has never seen before (first answer on that drawing, any lesson)
  };
  var GUIDED = [
    { fig: "trunk-abdomen", muscle: "external-oblique", objective: "id" }, { fig: "trunk-abdomen", muscle: "rectus-abdominis", objective: "id" },
    { fig: "trunk-abdomen", muscle: "internal-oblique", objective: "id" }, { fig: "trunk-abdomen", muscle: "transversus-abdominis", objective: "id" },
    { fig: "trunk-thorax", muscle: "external-intercostals", objective: "id" }, { fig: "trunk-thorax", muscle: "internal-intercostals", objective: "id" },
    { fig: "trunk-diaphragm", muscle: "diaphragm", objective: "id" }, { fig: "trunk-diaphragm", muscle: "quadratus-lumborum", objective: "id" }
  ];
  // "unfamiliar" items use a view never shown in teaching or guided practice. Internal oblique, transversus
  // abdominis and the diaphragm have only one labeled licensed view, so naming them on a pin counts as practice.
  var ITEMS = [
    { id: "ap-ch9-trunk-front-name-rectus", objective: "id", kind: "name-pin", fig: "trunk-body-front", muscle: "rectus-abdominis", unfamiliar: true },
    { id: "ap-ch9-trunk-act-inhale-main", objective: "actions", kind: "name-fn", muscle: "diaphragm", unfamiliar: true,
      prompt: "Name the dome-shaped muscle that contracts and flattens to enlarge the thoracic cavity when you inhale." },
    { id: "ap-ch9-trunk-detail-name-external-ic", objective: "id", kind: "name-pin", fig: "trunk-intercostal-detail", muscle: "external-intercostals", unfamiliar: true },
    { id: "ap-ch9-trunk-act-belt-squeeze", objective: "actions", kind: "name-fn", muscle: "transversus-abdominis", unfamiliar: true,
      prompt: "Name the deepest abdominal muscle, the one that squeezes the abdomen like a belt during a hard cough." },
    { id: "ap-ch9-trunk-post-name-ql", objective: "id", kind: "name-pin", fig: "trunk-posterior-abdominal", muscle: "quadratus-lumborum", unfamiliar: true },
    { id: "ap-ch9-trunk-act-forced-exhale", objective: "actions", kind: "name-fn", muscle: "internal-intercostals", unfamiliar: true,
      prompt: "Name the muscles between the ribs that draw the ribs together during forced exhalation." },
    { id: "ap-ch9-trunk-front-name-external-oblique", objective: "id", kind: "name-pin", fig: "trunk-body-front", muscle: "external-oblique", unfamiliar: true },
    { id: "ap-ch9-trunk-act-sit-up", objective: "actions", kind: "name-fn", muscle: "rectus-abdominis", unfamiliar: true,
      prompt: "Name the muscle that is the prime mover when you sit up from lying on your back (flexing the vertebral column)." },
    { id: "ap-ch9-trunk-detail-fn-raise-ribs", objective: "id", kind: "pin-fn", fig: "trunk-intercostal-detail", muscle: "external-intercostals", unfamiliar: true,
      prompt: "Tap the pin on the muscle that raises the rib cage when you inhale." },
    { id: "ap-ch9-trunk-act-side-bend", objective: "actions", kind: "name-fn", muscle: "quadratus-lumborum", unfamiliar: true,
      prompt: "Name the four-sided muscle of the posterior abdominal wall that bends the vertebral column to the side." },
    { id: "ap-ch9-trunk-detail-name-internal-ic", objective: "id", kind: "name-pin", fig: "trunk-intercostal-detail", muscle: "internal-intercostals", unfamiliar: true },
    { id: "ap-ch9-trunk-act-twist-outer", objective: "actions", kind: "name-fn", muscle: "external-oblique", unfamiliar: true,
      prompt: "Name the outermost muscle on the side of the abdomen, whose fibers run down and in, that twists the trunk at the waist." },
    { id: "ap-ch9-trunk-abd-name-internal-oblique", objective: "id", kind: "name-pin", fig: "trunk-abdomen", muscle: "internal-oblique", unfamiliar: false },
    { id: "ap-ch9-trunk-act-twist-middle", objective: "actions", kind: "name-fn", muscle: "internal-oblique", unfamiliar: true,
      prompt: "Name the middle-layer muscle on the side of the abdomen, whose fibers run up and in at right angles to the outer layer." },
    { id: "ap-ch9-trunk-abd-name-transversus", objective: "id", kind: "name-pin", fig: "trunk-abdomen", muscle: "transversus-abdominis", unfamiliar: false },
    { id: "ap-ch9-trunk-front-fn-sit-up", objective: "id", kind: "pin-fn", fig: "trunk-body-front", muscle: "rectus-abdominis", unfamiliar: true,
      prompt: "Tap the pin on the muscle that flexes the vertebral column when you sit up." },
    { id: "ap-ch9-trunk-dia-name-diaphragm", objective: "id", kind: "name-pin", fig: "trunk-diaphragm", muscle: "diaphragm", unfamiliar: false },
    { id: "ap-ch9-trunk-act-inhale-ribs", objective: "actions", kind: "name-fn", muscle: "external-intercostals", unfamiliar: true,
      prompt: "Name the outer muscles between the ribs that raise the rib cage during inhalation." }
  ];
  var SET = {
    key: "trunk", title: "Trunk muscles", learnItem: "trunk-learn",
    steps: [{ id: "names", label: "1 · Decode the names first" }, { id: "learn", label: "2 · Learn the muscles" }, { id: "feel", label: "3 · Feel it" },
      { id: "find", label: "4 · How to find them" }, { id: "guided", label: "5 · Guided pins" }, { id: "lookalikes", label: "6 · Look-alikes" }, { id: "independent", label: "On your own" }],
    status: [{ key: "id", label: "Trunk ID" }, { key: "newpic", label: "ID on new pictures" }, { key: "actions", label: "Function" }],
    learnTitle: "Eight trunk muscles",
    learnIntro: "The abdominal wall has layers, so study it from the outside in: rectus abdominis in front, then external oblique, internal oblique and transversus abdominis on the side. Then the breathing muscles, and the posterior abdominal wall.",
    learn: [{ h: "Abdominal wall (outer view and an inset of the deep layers)", fig: "trunk-abdomen", muscles: ["rectus-abdominis", "external-oblique", "internal-oblique", "transversus-abdominis"] },
      { h: "Between the ribs", fig: "trunk-thorax", muscles: ["external-intercostals", "internal-intercostals"] },
      { h: "Diaphragm and quadratus lumborum (seen from below)", fig: "trunk-diaphragm", muscles: ["diaphragm", "quadratus-lumborum"] }],
    find: { fig: "trunk-abdomen", pins: ["transversus-abdominis", "external-oblique", "rectus-abdominis", "internal-oblique"], current: "internal-oblique", title: "Worked example: pin 4 on the abdominal wall",
      landmarks: "the midline, the ribs, the sternum, the hip bone (ilium), or the vertebrae",
      fibers: "straight up and down (rectus abdominis), down and in (external oblique, external intercostals), up and in (internal oblique), horizontal like a belt (transversus abdominis), dome around a central tendon (diaphragm)",
      think: "Pin 4's line rises into the inset, which shows the abdominal wall with its outer layer peeled back. The pin's fibers sit just under the outer layer and run up and in, crossing the outer fibers at a right angle. A middle layer with up-and-in fibers is the <b>internal oblique</b>. The deepest, belt-like layer above it is the transversus abdominis." },
    pairs: [["external-oblique", "internal-oblique"], ["external-intercostals", "internal-intercostals"], ["rectus-abdominis", "transversus-abdominis"]],
    incompleteNames: { "oblique": "Which oblique? There are two: external (outer layer, fibers down and in) and internal (under it, fibers up and in).",
      "obliques": "Which oblique? There are two: external (outer layer, fibers down and in) and internal (under it, fibers up and in).",
      "intercostals": "Which intercostals? External (outer layer, raise the ribs) or internal (under them, pull the ribs together).",
      "intercostal": "Which intercostals? External (outer layer, raise the ribs) or internal (under them, pull the ribs together)." }
  };
  global.MuscleSets.trunk = MuscleCore.build({ MUSCLES: MUSCLES, LOOKALIKE_NOTES: LOOKALIKE_NOTES, FIGURES: FIGURES, PINS: PINS, OBJ: OBJ,
    GUIDED: GUIDED, ITEMS: ITEMS, SET: SET, INCOMPLETE: SET.incompleteNames });
})(window);
