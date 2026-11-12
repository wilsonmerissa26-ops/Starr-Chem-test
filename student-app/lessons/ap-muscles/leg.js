/* A&P pilot data: lower leg muscles (front, lateral and back compartments) that move the foot and toes.
 * Locations, origins and actions follow OpenStax Anatomy and Physiology 2e, section 11.6, "Appendicular Muscles of the
 * Pelvic Girdle and Lower Limbs" (text and origins), in standard terms (dorsiflexion, plantar flexion, inversion,
 * eversion); insertions and the tibialis anterior's inversion, not given there, are standard anatomy.
 * Fibularis = peroneus (older name; fig. 1105 still says "peroneus longus"). Both are accepted.
 * Figures show the RIGHT leg: in the front view the lateral side is on the left of the picture, in back views on the right.
 * Teaching figures are OpenStax fig. 1123's three drawings. Pin positions come from OpenStax leader lines
 * (tools/build-ap-leg-images.py, img/pins-leg.json). New-picture questions use OpenStax fig. 1105; only her first answer on
 * each 1105 drawing, in any lesson, counts as a new picture (lesson.js pictureStatus).
 */
(function (global) {
  "use strict";
  var MUSCLES = {
    "tibialis-anterior": { name: "Tibialis anterior", region: "front of the leg, beside the shin bone",
      accept: ["tibialis anterior"],
      location: "A long, thick muscle on the front of the leg, just lateral to the shin (the tibia's sharp front edge): from the lateral condyle and upper shaft of the tibia and the interosseous membrane. Its tendon crosses the front of the ankle to the medial side of the foot (medial cuneiform and first metatarsal).",
      action: "Dorsiflexes the foot (lifts the toes and front of the foot) and inverts it (turns the sole inward).",
      cue: "Tibialis (tibia) + anterior (front): the thick muscle right beside the shin.",
      feel: { do: "Sit, put your fingers just outside your shin bone below the knee, and lift the front of your foot toward you.", notice: "A thick muscle hardens beside the shin, and its tendon stands out at the front of the ankle on the inner side." },
      lookalike: "tibialis-posterior" },
    "extensor-digitorum-longus": { name: "Extensor digitorum longus", region: "front of the leg, lateral to the tibialis anterior",
      accept: ["extensor digitorum longus"],
      location: "On the front of the leg, lateral to the tibialis anterior: from the lateral condyle of the tibia, the upper fibula and the interosseous membrane. Its four tendons fan across the top of the foot to toes 2 to 5.",
      action: "Extends toes 2 to 5 and helps dorsiflex the foot.",
      cue: "Extensor (straightens) + digitorum (of the digits) + longus (long): the four tendons on top of the foot.",
      feel: { do: "Sit with your foot flat and lift toes 2 to 5 off the floor.", notice: "Four tendons stand out across the top of the foot." },
      lookalike: "flexor-digitorum-longus" },
    "extensor-hallucis-longus": { name: "Extensor hallucis longus", region: "front of the leg, deep, lower half",
      accept: ["extensor hallucis longus"],
      location: "On the front of the leg, partly hidden between the tibialis anterior and the extensor digitorum longus: from the front of the fibula's shaft and the interosseous membrane. Its tendon runs over the top of the foot to the big toe.",
      action: "Extends the big toe and helps dorsiflex the foot.",
      cue: "Extensor (straightens) + hallucis (of the big toe) + longus (long).",
      feel: { do: "Sit with your foot flat and lift only your big toe.", notice: "One tendon stands out on top of the foot, running to the big toe." },
      lookalike: "flexor-hallucis-longus" },
    "fibularis-longus": { name: "Fibularis longus", region: "outer (lateral) side of the leg, upper part",
      accept: ["fibularis longus", "peroneus longus"],
      partial: { "peroneus longus": "Correct. Peroneus longus is the older name; fibularis longus is the current one." },
      location: "On the lateral side of the leg, from the head and upper lateral fibula. Its long tendon passes behind the lateral malleolus (outer ankle bone) and crosses under the sole to the first metatarsal and medial cuneiform.",
      action: "Everts the foot (turns the sole outward) and plantar flexes it.",
      cue: "Fibularis (fibula) + longus (long): high on the outer leg, with a tendon that crosses under the foot.",
      feel: { do: "Sit, put your fingers on the outer side of your leg a hand's width below the knee, and turn the sole of your foot outward.", notice: "The outer side of the leg firms up." },
      lookalike: "fibularis-brevis" },
    "fibularis-brevis": { name: "Fibularis brevis", region: "outer (lateral) side of the leg, lower part",
      accept: ["fibularis brevis", "peroneus brevis"],
      partial: { "peroneus brevis": "Correct. Peroneus brevis is the older name; fibularis brevis is the current one." },
      location: "On the lateral side of the leg, lower down and under the fibularis longus: from the lower shaft of the fibula. Its tendon passes behind the lateral malleolus to the base of the fifth metatarsal.",
      action: "Everts the foot and plantar flexes it.",
      cue: "Fibularis (fibula) + brevis (short): the shorter, lower one, ending on the outside of the foot.",
      feel: { do: "Put your fingers just behind the outer ankle bone and turn the sole of your foot outward.", notice: "Tendons tighten behind the outer ankle; the brevis tendon is the one that runs on to the outside edge of the foot." },
      lookalike: "fibularis-longus" },
    "gastrocnemius": { name: "Gastrocnemius", region: "back of the leg, at the surface (the calf)",
      accept: ["gastrocnemius"],
      location: "The most superficial and visible calf muscle, with two heads from the medial and lateral condyles of the femur. With the soleus it ends on the calcaneus (heel bone) through the calcaneal (Achilles) tendon.",
      action: "Plantar flexes the foot (points it down, as when you rise on your toes) and helps flex the leg at the knee.",
      cue: "The two-headed bulge of the calf that crosses the back of the knee.",
      feel: { do: "Stand, hold onto something for balance, and rise up onto your toes.", notice: "The calf bulges, especially its two upper heads just below the back of the knee." },
      lookalike: "soleus" },
    "soleus": { name: "Soleus", region: "back of the leg, under the gastrocnemius",
      accept: ["soleus"],
      location: "A wide, flat muscle deep to the gastrocnemius, from the upper tibia, the fibula and the interosseous membrane. It joins the gastrocnemius in the calcaneal (Achilles) tendon to the calcaneus. It does not cross the knee.",
      action: "Plantar flexes the foot, and helps keep you upright when standing and walking.",
      cue: "Flat (like the sole fish) and under the gastrocnemius; its sides show on either side of the lower calf.",
      feel: { do: "Sit with your knee bent and push the ball of your foot down against the floor, lifting your heel.", notice: "With the knee bent the gastrocnemius is slack, so the soleus does most of the work, and the lower calf firms up." },
      lookalike: "gastrocnemius" },
    "tibialis-posterior": { name: "Tibialis posterior", region: "back of the leg, deepest muscle",
      accept: ["tibialis posterior"],
      location: "The deepest muscle on the back of the leg, between the tibia and fibula: from the upper tibia and fibula and the interosseous membrane. Its tendon passes behind the medial malleolus (inner ankle bone) and ends mainly on the navicular and medial cuneiform, with slips to other tarsal bones and the bases of metatarsals 2 to 4.",
      action: "Plantar flexes the foot and inverts it (turns the sole inward).",
      cue: "Tibialis (tibia) + posterior (back): the deepest back muscle, between the two leg bones.",
      feel: { do: "Point your foot down and turn the sole inward.", notice: "It is the deepest calf muscle, so you feel the movement, not the muscle; a tendon may stand out just behind the inner ankle bone." },
      lookalike: "tibialis-anterior" },
    "flexor-digitorum-longus": { name: "Flexor digitorum longus", region: "back of the leg, deep, medial side",
      accept: ["flexor digitorum longus"],
      location: "Deep on the back of the leg, on the medial side, from the back of the tibia. Its tendon passes behind the medial malleolus and splits under the sole to toes 2 to 5.",
      action: "Flexes toes 2 to 5 (curls them down) and helps plantar flex the foot.",
      cue: "Flexor (bends) + digitorum (of the digits) + longus (long): deep on the tibia side, curling the four small toes.",
      feel: { do: "Sit with your foot flat and curl toes 2 to 5 down, gripping the floor.", notice: "It is deep, so you feel the toes curl and the sole tighten, not the muscle itself." },
      lookalike: "extensor-digitorum-longus" },
    "flexor-hallucis-longus": { name: "Flexor hallucis longus", region: "back of the leg, deep, lateral side",
      accept: ["flexor hallucis longus"],
      location: "Deep on the back of the leg, on the lateral side, from the middle of the fibula's shaft and the interosseous membrane. Its tendon crosses under the sole to the big toe.",
      action: "Flexes the big toe (presses it down, as when you push off in walking) and helps plantar flex the foot.",
      cue: "Flexor (bends) + hallucis (of the big toe) + longus (long): deep on the fibula side, pushing off with the big toe.",
      feel: { do: "Sit with your foot flat and press your big toe down into the floor.", notice: "It is deep, so you feel the push of the big toe, not the muscle itself." },
      lookalike: "extensor-hallucis-longus" }
  };
  var LOOKALIKE_NOTES = {
    "tibialis-anterior|tibialis-posterior": "Both tibialis muscles invert the foot. Anterior is on the front, right beside the shin, and dorsiflexes; posterior is the deepest muscle on the back, between the leg bones, and plantar flexes.",
    "fibularis-brevis|fibularis-longus": "Both are on the lateral side of the leg and evert and plantar flex the foot. Longus is higher and longer, from the upper fibula, with a tendon that crosses under the sole; brevis is shorter, lower, under the longus, and ends on the fifth metatarsal.",
    "gastrocnemius|soleus": "Both plantar flex the foot through the calcaneal tendon. Gastrocnemius is the surface muscle with two heads and crosses the knee (so it also helps flex it); soleus is flat, under it, and does not cross the knee.",
    "extensor-digitorum-longus|flexor-digitorum-longus": "Opposite movements of toes 2 to 5. Extensor digitorum longus is on the front of the leg and lifts them; flexor digitorum longus is deep on the back and curls them down.",
    "extensor-hallucis-longus|flexor-hallucis-longus": "Opposite movements of the big toe. Extensor hallucis longus is on the front of the leg and lifts it; flexor hallucis longus is deep on the back and presses it down."
  };
  var FIGURES = {
    "leg-front": { img: "img/leg-front-unlabeled.jpg", alt: "Front of the right lower leg, labels covered", labeled: "img/leg-front-labeled.jpg" },
    "leg-calf": { img: "img/leg-calf-unlabeled.jpg", alt: "Back of the right lower leg, surface muscles, labels covered", labeled: "img/leg-calf-labeled.jpg" },
    "leg-deep": { img: "img/leg-deep-unlabeled.jpg", alt: "Back of the right lower leg, deep muscles, labels covered", labeled: "img/leg-deep-labeled.jpg" },
    "leg-body-front": { drawing: "openstax-1105-front", img: "img/leg-body-front-unlabeled.jpg", alt: "Whole-body front view, lower legs, labels covered", labeled: "img/leg-front-labeled.jpg" },
    "leg-body-back": { drawing: "openstax-1105-back", img: "img/leg-body-back-unlabeled.jpg", alt: "Whole-body back view, lower legs, labels covered", labeled: "img/leg-deep-labeled.jpg" }
  };
  var PINS = { // from img/pins-leg.json (percent of image width and height)
    "leg-front": { "tibialis-anterior": [53.78, 21.75], "fibularis-longus": [35.11, 36.03], "extensor-digitorum-longus": [41.11, 42.06], "fibularis-brevis": [41.56, 68.25],
      "extensor-hallucis-longus": [58.44, 83.33] },
    "leg-calf": { "gastrocnemius": [44.0, 22.5], "soleus": [54.0, 82.17] },
    "leg-deep": { "tibialis-posterior": [63.47, 50.44], "flexor-digitorum-longus": [49.0, 63.97], "flexor-hallucis-longus": [60.58, 83.24] },
    "leg-body-front": { "fibularis-longus": [29.06, 35.45], "tibialis-anterior": [40.0, 52.73] },
    "leg-body-back": { "fibularis-longus": [27.94, 47.73], "tibialis-posterior": [35.88, 60.0], "gastrocnemius": [64.71, 21.82], "soleus": [69.12, 65.91] }
  };
  var OBJ = {
    id: "bio131.ch9.leg-id",                        // identify lower leg muscles
    actions: "bio131.ch9.leg-actions",              // function, recalled from a description
    newpic: "bio131.ch9.leg-id-new-picture"         // identifying on a drawing she has never seen before (first answer on that drawing, any lesson)
  };
  var GUIDED = [
    { fig: "leg-front", muscle: "tibialis-anterior", objective: "id" }, { fig: "leg-front", muscle: "extensor-digitorum-longus", objective: "id" },
    { fig: "leg-front", muscle: "extensor-hallucis-longus", objective: "id" }, { fig: "leg-front", muscle: "fibularis-longus", objective: "id" },
    { fig: "leg-front", muscle: "fibularis-brevis", objective: "id" },
    { fig: "leg-calf", muscle: "gastrocnemius", objective: "id" }, { fig: "leg-calf", muscle: "soleus", objective: "id" },
    { fig: "leg-deep", muscle: "tibialis-posterior", objective: "id" }, { fig: "leg-deep", muscle: "flexor-digitorum-longus", objective: "id" },
    { fig: "leg-deep", muscle: "flexor-hallucis-longus", objective: "id" }
  ];
  // Fig. 1105 labels only four of these muscles, so only those four have picture questions on it. The others are
  // practiced on the studied figures (practice) and tested by function (independent).
  function fn(id, muscle, prompt) { return { id: "ap-ch9-leg-act-" + id, objective: "actions", kind: "name-fn", muscle: muscle, unfamiliar: true, prompt: prompt }; }
  function pin(id, fig, muscle, unfamiliar) { return { id: "ap-ch9-leg-" + id, objective: "id", kind: "name-pin", fig: fig, muscle: muscle, unfamiliar: unfamiliar }; }
  var ITEMS = [
    pin("front-name-tibialis-anterior", "leg-body-front", "tibialis-anterior", true),
    fn("deepest-back", "tibialis-posterior", "Name the deepest muscle on the back of the leg, between the two leg bones, which plantar flexes the foot and turns the sole inward."),
    pin("back-name-gastrocnemius", "leg-body-back", "gastrocnemius", true),
    fn("short-outer", "fibularis-brevis", "Name the shorter muscle on the outer side of the leg, lower down and under its longer partner, ending on the fifth metatarsal; it turns the sole outward."),
    fn("four-toes-up", "extensor-digitorum-longus", "Name the muscle on the front of the leg that lifts toes 2 to 5 and helps dorsiflex the foot."),
    pin("back-name-soleus", "leg-body-back", "soleus", true),
    fn("no-knee", "soleus", "Name the flat calf muscle under the most visible one, which plantar flexes the foot but does not cross the knee."),
    fn("beside-shin", "tibialis-anterior", "Name the thick muscle on the front of the leg, right beside the shin, that dorsiflexes the foot and turns the sole inward."),
    pin("front-name-fibularis-longus", "leg-body-front", "fibularis-longus", true),
    fn("four-toes-down", "flexor-digitorum-longus", "Name the deep muscle on the back of the leg, on the medial side, that curls toes 2 to 5 down."),
    fn("long-outer", "fibularis-longus", "Name the long muscle high on the outer side of the leg whose tendon passes behind the outer ankle and crosses under the sole; it turns the sole outward and plantar flexes the foot."),
    pin("back-name-tibialis-posterior", "leg-body-back", "tibialis-posterior", true),
    fn("two-heads", "gastrocnemius", "Name the surface calf muscle with two heads that crosses the knee, so it plantar flexes the foot and helps flex the knee."),
    fn("big-toe-up", "extensor-hallucis-longus", "Name the muscle on the front of the leg that lifts only the big toe."),
    pin("back-name-fibularis-longus", "leg-body-back", "fibularis-longus", true),
    fn("push-off", "flexor-hallucis-longus", "Name the deep muscle on the back of the leg, on the lateral side, that presses the big toe down when you push off in walking."),
    pin("sup-name-extensor-digitorum-longus", "leg-front", "extensor-digitorum-longus", false),
    pin("sup-name-fibularis-brevis", "leg-front", "fibularis-brevis", false),
    pin("sup-name-extensor-hallucis-longus", "leg-front", "extensor-hallucis-longus", false),
    pin("sup-name-flexor-digitorum-longus", "leg-deep", "flexor-digitorum-longus", false),
    pin("sup-name-flexor-hallucis-longus", "leg-deep", "flexor-hallucis-longus", false)
  ];
  var SET = {
    key: "leg", title: "Lower leg muscles", learnItem: "leg-learn",
    steps: [{ id: "names", label: "1 · Decode the names first" }, { id: "learn", label: "2 · Learn the muscles" }, { id: "feel", label: "3 · Feel it" },
      { id: "find", label: "4 · How to find them" }, { id: "guided", label: "5 · Guided pins" }, { id: "lookalikes", label: "6 · Look-alikes" }, { id: "independent", label: "On your own" }],
    status: [{ key: "id", label: "Lower leg ID" }, { key: "newpic", label: "ID on new pictures" }, { key: "actions", label: "Function" }],
    learnTitle: "Ten lower leg muscles",
    learnIntro: "Sort the lower leg by side, and the side tells you the movement. Front: muscles that dorsiflex the foot (lift its front) and lift the toes. Lateral (outer) side: the two fibularis muscles, which evert the foot (turn the sole outward). Back: the calf muscles, which plantar flex the foot (point it down): the gastrocnemius and soleus at the surface, and three deep muscles under them. The names then tell you the rest: digitorum = toes 2 to 5, hallucis = the big toe, extensor lifts, flexor curls down. Fibularis is also called peroneus. The figures show the right leg: seen from the front, its outer side is on the left of the picture; seen from behind, on the right.",
    learn: [{ h: "Front and outer side: dorsiflexors, toe extensors and the fibularis muscles", fig: "leg-front", muscles: ["tibialis-anterior", "extensor-digitorum-longus", "extensor-hallucis-longus", "fibularis-longus", "fibularis-brevis"] },
      { h: "Back, at the surface: the calf", fig: "leg-calf", muscles: ["gastrocnemius", "soleus"] },
      { h: "Back, deep", fig: "leg-deep", muscles: ["tibialis-posterior", "flexor-digitorum-longus", "flexor-hallucis-longus"] }],
    find: { fig: "leg-deep", pins: ["tibialis-posterior", "flexor-digitorum-longus", "flexor-hallucis-longus"], current: "flexor-hallucis-longus",
      title: "Worked example: the highlighted pin on the deep back of the leg",
      landmarks: "the knee, the shin, the outer or inner ankle bone, the big toe or the small toes, the front or back of the leg",
      fibers: "a thick muscle beside the shin (tibialis anterior), tendons fanning to toes 2 to 5 (digitorum), one tendon to the big toe (hallucis), the two-headed calf bulge (gastrocnemius)",
      think: "Step 1: this is the back of the leg with the calf muscles removed, so it is one of the three deep muscles. Step 2: the figure is a right leg seen from behind, so the outer (lateral, fibula) side is on the right of the picture. Step 3: the deepest one in the middle, between the bones, is the tibialis posterior; of the two toe flexors, the one on the tibia (medial) side curls toes 2 to 5 and the one on the fibula (lateral) side curls the big toe. The highlighted pin is low and toward the lateral side. So: <b>flexor hallucis longus</b>." },
    pairs: [["tibialis-anterior", "tibialis-posterior"], ["fibularis-longus", "fibularis-brevis"], ["gastrocnemius", "soleus"], ["extensor-digitorum-longus", "flexor-digitorum-longus"],
      ["extensor-hallucis-longus", "flexor-hallucis-longus"]],
    incompleteNames: {
      "tibialis": "Tibialis anterior (front, beside the shin) or tibialis posterior (deepest, on the back)?",
      "fibularis": "Fibularis longus (higher, longer) or fibularis brevis (lower, shorter)?",
      "peroneus": "Fibularis (peroneus) longus or brevis? Longus is higher and longer; brevis is lower and shorter.",
      "extensor digitorum": "Add the last word: extensor digitorum LONGUS.",
      "flexor digitorum": "Add the last word: flexor digitorum LONGUS.",
      "extensor hallucis": "Add the last word: extensor hallucis LONGUS.",
      "flexor hallucis": "Add the last word: flexor hallucis LONGUS.",
      "gastroc": "Use the full name: gastrocnemius.",
      "calf": "The calf has two surface muscles: the gastrocnemius (two heads, at the surface) and the soleus (flat, under it). Which one?",
      "triceps surae": "Triceps surae is the group (gastrocnemius plus soleus). Which one?" }
  };
  global.MuscleSets.leg = MuscleCore.build({ MUSCLES: MUSCLES, LOOKALIKE_NOTES: LOOKALIKE_NOTES, FIGURES: FIGURES, PINS: PINS, OBJ: OBJ,
    GUIDED: GUIDED, ITEMS: ITEMS, SET: SET, INCOMPLETE: SET.incompleteNames });
})(window);
