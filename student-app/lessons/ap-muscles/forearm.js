/* A&P pilot data: forearm muscles (pronation and supination, wrist and finger flexors and extensors).
 * Origins and actions follow OpenStax Anatomy and Physiology 2e, section 11.5 (Tables 11.13 and 11.14) and standard
 * anatomy. Two OpenStax table errors are NOT copied: it names "extensor radialis longus" (the muscle is extensor carpi
 * radialis longus), and it says flexor carpi ulnaris tilts the hand "away from the body"; flexor carpi ulnaris
 * adducts the hand (bends it toward the little-finger side).
 * Hand positions are described for anatomical position (palm facing forward): thumb side = lateral, little-finger side = medial.
 * Teaching figures split OpenStax fig. 1120 into its palm-side and back drawings so pins never overlap.
 * Pin positions come from OpenStax leader lines (tools/build-ap-forearm-images.py, img/pins-forearm.json).
 * New-picture questions use OpenStax fig. 1105; only her first answer on each 1105 drawing, in any lesson, counts as a
 * new picture (lesson.js pictureStatus).
 */
(function (global) {
  "use strict";
  var MUSCLES = {
    "pronator-teres": { name: "Pronator teres", region: "front of the forearm, just below the elbow",
      accept: ["pronator teres"],
      location: "A short, round muscle running diagonally across the front of the forearm just below the elbow, from the medial epicondyle of the humerus (and coronoid process of the ulna) to the middle of the radius.",
      action: "Pronates the forearm: turns the palm down (or back).",
      cue: "Short diagonal muscle just below the elbow crease. Pronator = turns the palm down, teres = round.",
      feel: { do: "Grip the front of your forearm just below the elbow, on the little-finger side of the crease, then turn your palm down against light resistance.", notice: "A short muscle tightens diagonally under your fingers." },
      lookalike: "supinator" },
    "supinator": { name: "Supinator", region: "deep, around the upper radius",
      accept: ["supinator"],
      location: "A deep muscle that wraps around the upper part of the radius, from the lateral epicondyle of the humerus and the upper ulna. It is covered by other forearm muscles.",
      action: "Supinates the forearm: turns the palm up (or forward). The biceps brachii helps strongly when the elbow is bent.",
      cue: "Deep, wrapped around the top of the radius on the back of the forearm.",
      feel: { do: "Keep your elbow straight and slowly turn your palm from down to up.", notice: "It is deep and covered, so you feel the turning movement, not the muscle itself." },
      lookalike: "pronator-teres" },
    "flexor-carpi-radialis": { name: "Flexor carpi radialis", region: "front of the forearm, thumb side",
      accept: ["flexor carpi radialis"],
      location: "On the front of the forearm, from the medial epicondyle of the humerus to the base of the second and third metacarpals. Its tendon is just to the thumb side of the middle of the wrist.",
      action: "Flexes the hand at the wrist and abducts it (bends it toward the thumb side).",
      cue: "Flexor (bends) + carpi (wrist) + radialis (thumb side).",
      feel: { do: "Make a loose fist, then bend your wrist toward your palm and slightly toward your thumb.", notice: "A tendon stands out at the front of the wrist, just to the thumb side of the middle." },
      lookalike: "flexor-carpi-ulnaris" },
    "palmaris-longus": { name: "Palmaris longus", region: "front of the forearm, middle",
      accept: ["palmaris longus"],
      location: "A small, long, thin muscle in the middle of the front of the forearm, from the medial epicondyle of the humerus to the palm (palmar aponeurosis). Its tendon runs down the middle of the wrist. Some people do not have one.",
      action: "A weak flexor of the hand at the wrist.",
      cue: "Thin tendon down the middle of the wrist, into the palm. Palmaris = palm, longus = long.",
      feel: { do: "Touch the tips of your thumb and little finger together and bend your wrist slightly toward your palm.", notice: "In most people a thin tendon pops up in the middle of the wrist. If you do not see one, you may be one of the people without this muscle." },
      lookalike: "flexor-carpi-radialis" },
    "flexor-carpi-ulnaris": { name: "Flexor carpi ulnaris", region: "front of the forearm, little-finger side",
      accept: ["flexor carpi ulnaris"],
      location: "Along the little-finger side of the front of the forearm, from the medial epicondyle of the humerus and the ulna to the wrist (pisiform) and fifth metacarpal.",
      action: "Flexes the hand at the wrist and adducts it (bends it toward the little-finger side).",
      cue: "Flexor (bends) + carpi (wrist) + ulnaris (little-finger side).",
      feel: { do: "Bend your wrist toward your palm and toward your little finger.", notice: "A tendon stands out at the front of the wrist on the little-finger side." },
      lookalike: "flexor-carpi-radialis" },
    "flexor-digitorum-superficialis": { name: "Flexor digitorum superficialis", region: "front of the forearm, under the wrist flexors",
      accept: ["flexor digitorum superficialis"],
      location: "On the front of the forearm, just under the wrist flexors, from the medial epicondyle, ulna and radius. Its four tendons pass through the wrist to the middle bones of fingers 2 to 5.",
      action: "Flexes the fingers (at the knuckles and middle finger joints) and helps flex the hand at the wrist.",
      cue: "Four tendons fanning to the fingers. Digitorum = of the fingers, superficialis = near the surface (compared with the deeper finger flexor).",
      feel: { do: "Rest the fingers of one hand on the front of your other forearm, then curl and uncurl the fingers of that hand several times.", notice: "Muscle bellies slide and tighten on the front of the forearm as the fingers curl." },
      lookalike: "extensor-digitorum" },
    "extensor-carpi-radialis-longus": { name: "Extensor carpi radialis longus", region: "back of the forearm, thumb side",
      accept: ["extensor carpi radialis longus"],
      location: "On the thumb side of the back of the forearm, from the lateral supracondylar ridge of the humerus (just above the lateral epicondyle) to the base of the second metacarpal.",
      action: "Extends the hand at the wrist and abducts it (bends it toward the thumb side).",
      cue: "Extensor (straightens) + carpi (wrist) + radialis (thumb side) + longus (the long one).",
      feel: { do: "Make a fist and pull your wrist back toward the thumb side.", notice: "Muscle firms up on the thumb side of the back of the forearm, just below the elbow." },
      lookalike: "extensor-carpi-ulnaris" },
    "extensor-digitorum": { name: "Extensor digitorum", region: "back of the forearm, middle",
      accept: ["extensor digitorum"],
      location: "In the middle of the back of the forearm, from the lateral epicondyle of the humerus. Its four tendons run over the back of the hand to fingers 2 to 5.",
      action: "Extends the fingers and helps extend the hand at the wrist.",
      cue: "Tendons you can see on the back of the hand. Extensor (straightens) + digitorum (of the fingers).",
      feel: { do: "Rest your hand flat on a table, then lift all four fingers.", notice: "Tendons stand out on the back of your hand and the back of the forearm firms up." },
      lookalike: "flexor-digitorum-superficialis" },
    "extensor-carpi-ulnaris": { name: "Extensor carpi ulnaris", region: "back of the forearm, little-finger side",
      accept: ["extensor carpi ulnaris"],
      location: "Along the little-finger side of the back of the forearm, from the lateral epicondyle of the humerus and the ulna to the base of the fifth metacarpal.",
      action: "Extends the hand at the wrist and adducts it (bends it toward the little-finger side).",
      cue: "Extensor (straightens) + carpi (wrist) + ulnaris (little-finger side).",
      feel: { do: "Pull your wrist back and toward your little finger.", notice: "Muscle firms up along the little-finger side of the back of the forearm." },
      lookalike: "extensor-carpi-radialis-longus" }
  };
  var LOOKALIKE_NOTES = {
    "flexor-carpi-radialis|flexor-carpi-ulnaris": "Both flex the wrist on the front of the forearm. Radialis is on the thumb side and also bends the hand toward the thumb; ulnaris is on the little-finger side and bends it toward the little finger.",
    "extensor-carpi-radialis-longus|extensor-carpi-ulnaris": "Both extend the wrist on the back of the forearm. Radialis longus is on the thumb side and bends the hand toward the thumb; ulnaris is on the little-finger side and bends it toward the little finger.",
    "pronator-teres|supinator": "Opposite movements of the forearm: pronator teres turns the palm down and sits on the front just below the elbow; supinator turns the palm up and wraps deep around the top of the radius.",
    "extensor-digitorum|flexor-digitorum-superficialis": "Both move fingers 2 to 5. Flexor digitorum superficialis is on the front (palm side) and curls the fingers; extensor digitorum is on the back and straightens them.",
    "flexor-carpi-radialis|palmaris-longus": "Both are wrist flexors on the front of the forearm with tendons near the middle of the wrist. Palmaris longus is thin, ends in the palm, sits in the very middle, and is missing in some people; flexor carpi radialis is just to its thumb side and ends on the metacarpals."
  };
  var FIGURES = {
    "forearm-front": { img: "img/forearm-front-unlabeled.jpg", alt: "Forearm muscles, palm side, labels covered", labeled: "img/forearm-front-labeled.jpg" },
    "forearm-back": { img: "img/forearm-back-unlabeled.jpg", alt: "Forearm muscles, back of the forearm, labels covered", labeled: "img/forearm-back-labeled.jpg" },
    "forearm-deep": { img: "img/forearm-deep-unlabeled.jpg", alt: "Deep forearm muscles, back of the forearm, labels covered", labeled: "img/forearm-deep-labeled.jpg" },
    "forearm-body-front": { drawing: "openstax-1105-front", img: "img/forearm-body-front-unlabeled.jpg", alt: "Whole-body front view, arm and forearm, labels covered", labeled: "img/forearm-front-labeled.jpg" },
    "forearm-body-back": { drawing: "openstax-1105-back", img: "img/forearm-body-back-unlabeled.jpg", alt: "Whole-body back view, arm and forearm, labels covered", labeled: "img/forearm-back-labeled.jpg" }
  };
  var PINS = { // from img/pins-forearm.json (percent of image width and height)
    "forearm-front": { "pronator-teres": [56.67, 38.79], "flexor-carpi-radialis": [21.49, 48.02], "palmaris-longus": [26.14, 60.44], "flexor-carpi-ulnaris": [30.7, 68.46],
      "flexor-digitorum-superficialis": [44.39, 81.87] },
    "forearm-back": { "extensor-carpi-radialis-longus": [48.96, 21.43], "extensor-carpi-ulnaris": [70.11, 63.08], "extensor-digitorum": [70.11, 74.95] },
    "forearm-deep": { "supinator": [11.49, 17.02] },
    "forearm-body-front": { "pronator-teres": [85.0, 36.76], "flexor-carpi-radialis": [85.0, 51.76] },
    "forearm-body-back": { "extensor-digitorum": [85.0, 65.0], "extensor-carpi-ulnaris": [85.0, 85.77] }
  };
  var OBJ = {
    id: "bio131.ch9.forearm-id",                        // identify forearm muscles
    actions: "bio131.ch9.forearm-actions",              // function, recalled from a description
    newpic: "bio131.ch9.forearm-id-new-picture"         // identifying on a drawing she has never seen before (first answer on that drawing, any lesson)
  };
  var GUIDED = [
    { fig: "forearm-front", muscle: "pronator-teres", objective: "id" }, { fig: "forearm-front", muscle: "flexor-carpi-radialis", objective: "id" },
    { fig: "forearm-front", muscle: "palmaris-longus", objective: "id" }, { fig: "forearm-front", muscle: "flexor-carpi-ulnaris", objective: "id" },
    { fig: "forearm-front", muscle: "flexor-digitorum-superficialis", objective: "id" },
    { fig: "forearm-back", muscle: "extensor-carpi-radialis-longus", objective: "id" }, { fig: "forearm-back", muscle: "extensor-digitorum", objective: "id" },
    { fig: "forearm-back", muscle: "extensor-carpi-ulnaris", objective: "id" }, { fig: "forearm-deep", muscle: "supinator", objective: "id" }
  ];
  // Fig. 1105 labels only four of these muscles, so only those four have picture questions on it. The others are
  // practiced on the studied figures (practice) and tested by function (independent).
  var ITEMS = [
    { id: "ap-ch9-forearm-front-name-pronator-teres", objective: "id", kind: "name-pin", fig: "forearm-body-front", muscle: "pronator-teres", unfamiliar: true },
    { id: "ap-ch9-forearm-act-wrist-thumb-flex", objective: "actions", kind: "name-fn", muscle: "flexor-carpi-radialis", unfamiliar: true,
      prompt: "Name the wrist flexor on the thumb side, which flexes the hand and bends it toward the thumb." },
    { id: "ap-ch9-forearm-back-name-extensor-digitorum", objective: "id", kind: "name-pin", fig: "forearm-body-back", muscle: "extensor-digitorum", unfamiliar: true },
    { id: "ap-ch9-forearm-act-palm-up", objective: "actions", kind: "name-fn", muscle: "supinator", unfamiliar: true,
      prompt: "Name the deep forearm muscle, wrapped around the top of the radius, that turns the palm up." },
    { id: "ap-ch9-forearm-act-wrist-little-extend", objective: "actions", kind: "name-fn", muscle: "extensor-carpi-ulnaris", unfamiliar: true,
      prompt: "Name the wrist extensor on the little-finger side, which extends the hand and bends it toward the little finger." },
    { id: "ap-ch9-forearm-act-curl-fingers", objective: "actions", kind: "name-fn", muscle: "flexor-digitorum-superficialis", unfamiliar: true,
      prompt: "Name the forearm muscle, just under the wrist flexors on the palm side, that curls fingers 2 to 5." },
    { id: "ap-ch9-forearm-front-name-flexor-carpi-radialis", objective: "id", kind: "name-pin", fig: "forearm-body-front", muscle: "flexor-carpi-radialis", unfamiliar: true },
    { id: "ap-ch9-forearm-act-palm-down", objective: "actions", kind: "name-fn", muscle: "pronator-teres", unfamiliar: true,
      prompt: "Name the short, round muscle just below the elbow that turns the palm down." },
    { id: "ap-ch9-forearm-act-lift-fingers", objective: "actions", kind: "name-fn", muscle: "extensor-digitorum", unfamiliar: true,
      prompt: "Name the muscle whose tendons you can see on the back of the hand when you lift and straighten your fingers." },
    { id: "ap-ch9-forearm-back-name-extensor-carpi-ulnaris", objective: "id", kind: "name-pin", fig: "forearm-body-back", muscle: "extensor-carpi-ulnaris", unfamiliar: true },
    { id: "ap-ch9-forearm-act-wrist-little-flex", objective: "actions", kind: "name-fn", muscle: "flexor-carpi-ulnaris", unfamiliar: true,
      prompt: "Name the wrist flexor on the little-finger side, which flexes the hand and bends it toward the little finger." },
    { id: "ap-ch9-forearm-act-weak-middle", objective: "actions", kind: "name-fn", muscle: "palmaris-longus", unfamiliar: true,
      prompt: "Name the thin, weak wrist flexor whose tendon runs down the middle of the wrist into the palm, and which some people do not have." },
    { id: "ap-ch9-forearm-act-wrist-thumb-extend", objective: "actions", kind: "name-fn", muscle: "extensor-carpi-radialis-longus", unfamiliar: true,
      prompt: "Name the long wrist extensor on the thumb side, which extends the hand and bends it toward the thumb." },
    { id: "ap-ch9-forearm-sup-name-palmaris", objective: "id", kind: "name-pin", fig: "forearm-front", muscle: "palmaris-longus", unfamiliar: false },
    { id: "ap-ch9-forearm-sup-name-flexor-carpi-ulnaris", objective: "id", kind: "name-pin", fig: "forearm-front", muscle: "flexor-carpi-ulnaris", unfamiliar: false },
    { id: "ap-ch9-forearm-sup-name-fds", objective: "id", kind: "name-pin", fig: "forearm-front", muscle: "flexor-digitorum-superficialis", unfamiliar: false },
    { id: "ap-ch9-forearm-sup-name-ecrl", objective: "id", kind: "name-pin", fig: "forearm-back", muscle: "extensor-carpi-radialis-longus", unfamiliar: false },
    { id: "ap-ch9-forearm-deep-name-supinator", objective: "id", kind: "name-pin", fig: "forearm-deep", muscle: "supinator", unfamiliar: false }
  ];
  var SET = {
    key: "forearm", title: "Forearm muscles", learnItem: "forearm-learn",
    steps: [{ id: "names", label: "1 · Decode the names first" }, { id: "learn", label: "2 · Learn the muscles" }, { id: "feel", label: "3 · Feel it" },
      { id: "find", label: "4 · How to find them" }, { id: "guided", label: "5 · Guided pins" }, { id: "lookalikes", label: "6 · Look-alikes" }, { id: "independent", label: "On your own" }],
    status: [{ key: "id", label: "Forearm ID" }, { key: "newpic", label: "ID on new pictures" }, { key: "actions", label: "Function" }],
    learnTitle: "Nine forearm muscles",
    learnIntro: "Sort the forearm by side. On the front (palm side), the flexors and the pronator teres start near the medial epicondyle of the humerus. On the back, the extensors start near the lateral epicondyle and ridge above it. The names then tell you the rest: carpi = wrist, digitorum = fingers, radialis = thumb side, ulnaris = little-finger side. Thumb side and little-finger side are described with the palm facing forward (anatomical position).",
    learn: [{ h: "Front (palm side): the pronator teres and the flexors", fig: "forearm-front", muscles: ["pronator-teres", "flexor-carpi-radialis", "palmaris-longus", "flexor-carpi-ulnaris", "flexor-digitorum-superficialis"] },
      { h: "Back: the extensors", fig: "forearm-back", muscles: ["extensor-carpi-radialis-longus", "extensor-digitorum", "extensor-carpi-ulnaris"] },
      { h: "Deep, on the back: the supinator", fig: "forearm-deep", muscles: ["supinator"] }],
    find: { fig: "forearm-front", pins: ["pronator-teres", "flexor-carpi-radialis", "palmaris-longus", "flexor-carpi-ulnaris", "flexor-digitorum-superficialis"], current: "flexor-carpi-ulnaris",
      title: "Worked example: the highlighted pin on the palm-side forearm",
      landmarks: "the elbow, the medial or lateral epicondyle, the thumb side or little-finger side of the wrist, or the palm",
      fibers: "a short diagonal muscle just below the elbow (pronator teres), long muscles running to tendons at the wrist (carpi muscles), tendons fanning to the fingers (digitorum muscles)",
      think: "Step 1: this is the palm side, so it is a flexor or the pronator. Step 2: the highlighted pin's line ends on a long muscle running to the wrist, not to the fingers: a carpi muscle. Step 3: it runs along the little-finger side of the forearm (the side away from the thumb): ulnaris. So: <b>flexor carpi ulnaris</b>." },
    pairs: [["flexor-carpi-radialis", "flexor-carpi-ulnaris"], ["extensor-carpi-radialis-longus", "extensor-carpi-ulnaris"], ["pronator-teres", "supinator"], ["flexor-digitorum-superficialis", "extensor-digitorum"]],
    incompleteNames: {
      "flexor carpi": "Flexor carpi radialis (thumb side) or flexor carpi ulnaris (little-finger side)?",
      "extensor carpi": "Extensor carpi radialis longus (thumb side) or extensor carpi ulnaris (little-finger side)?",
      "extensor carpi radialis": "Add the last word: extensor carpi radialis LONGUS (there is also a brevis).",
      "flexor digitorum": "Flexor digitorum superficialis or profundus? This lesson's is the superficialis.",
      "pronator": "Pronator teres or pronator quadratus? This lesson's is the pronator teres." }
  };
  global.MuscleSets.forearm = MuscleCore.build({ MUSCLES: MUSCLES, LOOKALIKE_NOTES: LOOKALIKE_NOTES, FIGURES: FIGURES, PINS: PINS, OBJ: OBJ,
    GUIDED: GUIDED, ITEMS: ITEMS, SET: SET, INCOMPLETE: SET.incompleteNames });
})(window);
