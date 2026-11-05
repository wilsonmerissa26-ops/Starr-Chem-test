/* A&P pilot: decoding muscle names from their word roots.
 * Naming categories follow OpenStax Anatomy and Physiology 2e, section 11.2 "Naming Skeletal Muscles".
 * Every root used in a practice name is taught in ROOTS first, so practice tests decoding, not guessing.
 */
(function (global) {
  "use strict";
  // category: what kind of clue the root gives. ex: a muscle that shows the root, never one of the practice names (blank if none fits).
  var ROOTS = {
    // Body part or bone the muscle sits on or attaches to
    "sterno": { m: "sternum", cat: "place", ex: "sternocleidomastoid" },
    "cleido": { m: "clavicle", cat: "place", ex: "sternocleidomastoid" },
    "mastoid": { m: "mastoid process (behind the ear)", cat: "place", ex: "sternocleidomastoid" },
    "hyoid": { m: "hyoid bone", cat: "place", ex: "thyrohyoid" },
    "thyro": { m: "thyroid cartilage", cat: "place", ex: "sternothyroid" },
    "omo": { m: "shoulder", cat: "place", ex: "" },
    "zygomaticus": { m: "zygomatic bone (cheekbone)", cat: "place", ex: "zygomaticus minor" },
    "temporalis": { m: "temporal bone (temple)", cat: "place", ex: "temporalis" },
    "frontalis": { m: "frontal bone (forehead)", cat: "place", ex: "occipitofrontalis" },
    "occipito": { m: "occipital bone (back of the head)", cat: "place", ex: "occipitofrontalis" },
    "costal": { m: "ribs", cat: "place", ex: "" },
    "scapulae": { m: "of the scapula (shoulder blade)", cat: "place", ex: "" },
    "capitis": { m: "of the head", cat: "place", ex: "longissimus capitis" },
    "spinae": { m: "of the spine", cat: "place", ex: "" },
    "abdominis": { m: "of the abdomen", cat: "place", ex: "" },
    "lumborum": { m: "of the lower back (lumbar region)", cat: "place", ex: "" },
    "pectoralis": { m: "chest", cat: "place", ex: "pectoralis major" },
    "oculi": { m: "of the eye", cat: "place", ex: "orbicularis oculi" },
    "oris": { m: "of the mouth", cat: "place", ex: "orbicularis oris" },
    "labii": { m: "of the lip", cat: "place", ex: "" },
    "supercilii": { m: "of the eyebrow", cat: "place", ex: "" },
    "anguli": { m: "of the angle (corner)", cat: "place", ex: "levator anguli oris" },
    // Position
    "superioris": { m: "upper", cat: "position", ex: "levator palpebrae superioris" },
    "inferioris": { m: "lower", cat: "position", ex: "" },
    "anterior": { m: "front", cat: "position", ex: "tibialis anterior" },
    "external": { m: "outer (closer to the surface)", cat: "position", ex: "" },
    "internal": { m: "inner (deeper)", cat: "position", ex: "" },
    "inter": { m: "between", cat: "position", ex: "interossei" },
    // Shape
    "orbicularis": { m: "circular, a ring", cat: "shape", ex: "orbicularis oculi" },
    "serratus": { m: "saw-toothed", cat: "shape", ex: "serratus posterior" },
    "quadratus": { m: "square, four-sided", cat: "shape", ex: "quadratus femoris" },
    "splenius": { m: "bandage-like", cat: "shape", ex: "splenius cervicis" },
    "deltoid": { m: "triangular", cat: "shape", ex: "deltoid" },
    // Size
    "major": { m: "larger", cat: "size", ex: "pectoralis major" },
    "minor": { m: "smaller", cat: "size", ex: "zygomaticus minor" },
    "maximus": { m: "largest", cat: "size", ex: "gluteus maximus" },
    // Fiber direction
    "rectus": { m: "straight (fibers parallel to the body's or a bone's long axis)", cat: "fibers", ex: "rectus femoris" },
    "transversus": { m: "across (fibers run side to side)", cat: "fibers", ex: "" },
    "oblique": { m: "slanted (fibers run diagonally)", cat: "fibers", ex: "superior oblique (an eye muscle)" },
    // Number of parts
    "di": { m: "two", cat: "number", ex: "" },
    "gastric": { m: "belly (the fleshy part)", cat: "number", ex: "gastrocnemius" },
    "biceps": { m: "two heads (origins)", cat: "number", ex: "biceps brachii" },
    // Action
    "levator": { m: "raises", cat: "action", ex: "levator palpebrae superioris" },
    "depressor": { m: "lowers", cat: "action", ex: "" },
    "corrugator": { m: "wrinkles", cat: "action", ex: "" },
    "erector": { m: "holds upright", cat: "action", ex: "" }
  };
  var CATS = [
    { id: "place", title: "Where it is or what it attaches to" }, { id: "position", title: "Position" },
    { id: "shape", title: "Shape" }, { id: "size", title: "Size" }, { id: "fibers", title: "Fiber direction" },
    { id: "number", title: "Number of parts" }, { id: "action", title: "Action" }
  ];
  // Worked examples use muscles she already studied in this lesson.
  var WORKED = [
    { name: "Orbicularis oculi", parts: ["orbicularis", "oculi"], tells: "A ring of muscle around the eye. That matches its look and its action: it closes the eyelids." },
    { name: "Sternocleidomastoid", parts: ["sterno", "cleido", "mastoid"], tells: "It runs from the sternum and clavicle up to the mastoid process behind the ear. The name is a map of its attachments." }
  ];
  var GUIDED = { id: "ap-ch9-names-guided-zygomaticus-major", name: "Zygomaticus major", parts: ["zygomaticus", "major"],
    tells: "The larger muscle that attaches to the cheekbone. (It pulls the corner of the mouth up and out when you smile; the name gives the place, not the action.)" };
  // Independent items: names not used anywhere else in the lesson. Each part must be decoded; all parts right = correct.
  // taughtBy: the teaching screen that shows this muscle. Once she has viewed it, the name is no longer new, so it counts as practice.
  var TRUNK_TAUGHT = "ap-ch9-teach-trunk-learn";
  var HEAD_ITEMS = [
    { id: "ap-ch9-names-levator-labii-superioris", name: "Levator labii superioris", parts: ["levator", "labii", "superioris"], tells: "It raises the upper lip." },
    { id: "ap-ch9-names-sternohyoid", name: "Sternohyoid", parts: ["sterno", "hyoid"], tells: "It runs between the sternum and the hyoid bone." },
    { id: "ap-ch9-names-depressor-anguli-oris", name: "Depressor anguli oris", parts: ["depressor", "anguli", "oris"], tells: "It pulls the corner of the mouth down." },
    { id: "ap-ch9-names-splenius-capitis", name: "Splenius capitis", parts: ["splenius", "capitis"], tells: "A bandage-like muscle of the back of the neck that acts on the head." },
    { id: "ap-ch9-names-corrugator-supercilii", name: "Corrugator supercilii", parts: ["corrugator", "supercilii"], tells: "It wrinkles the eyebrow, drawing the brows together as in a frown." },
    { id: "ap-ch9-names-digastric", name: "Digastric", parts: ["di", "gastric"], tells: "A muscle with two bellies, below the jaw." },
    { id: "ap-ch9-names-omohyoid", name: "Omohyoid", parts: ["omo", "hyoid"], tells: "It runs from the shoulder (the scapula) to the hyoid bone." },
    { id: "ap-ch9-names-depressor-labii-inferioris", name: "Depressor labii inferioris", parts: ["depressor", "labii", "inferioris"], tells: "It lowers the lower lip." },
    { id: "ap-ch9-names-levator-scapulae", name: "Levator scapulae", parts: ["levator", "scapulae"], tells: "It raises the scapula (shoulder blade)." }
  ];
  var TRUNK_GUIDED = { id: "ap-ch9-names-guided-transversus-abdominis", name: "Transversus abdominis", parts: ["transversus", "abdominis"],
    tells: "The abdominal muscle whose fibers run across, side to side, like a belt." };
  var TRUNK_ITEMS = [
    { id: "ap-ch9-names-rectus-abdominis", name: "Rectus abdominis", parts: ["rectus", "abdominis"], tells: "The abdominal muscle whose fibers run straight up and down.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-external-oblique", name: "External oblique", parts: ["external", "oblique"], tells: "The outer abdominal muscle whose fibers run diagonally.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-quadratus-lumborum", name: "Quadratus lumborum", parts: ["quadratus", "lumborum"], tells: "A four-sided muscle of the lower back.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-external-intercostals", name: "External intercostals", parts: ["external", "inter", "costal"], tells: "The outer layer of muscles between the ribs.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-internal-oblique", name: "Internal oblique", parts: ["internal", "oblique"], tells: "The deeper of the two slanted side muscles of the abdomen.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-internal-intercostals", name: "Internal intercostals", parts: ["internal", "inter", "costal"], tells: "The deeper layer of muscles between the ribs.", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-erector-spinae", name: "Erector spinae", parts: ["erector", "spinae"], tells: "A muscle group along the spine that holds the back upright." },
    { id: "ap-ch9-names-serratus-anterior", name: "Serratus anterior", parts: ["serratus", "anterior"], tells: "A saw-toothed muscle on the front and side of the chest wall." }
  ];
  var SETS = {
    head: { worked: WORKED, guided: GUIDED, items: HEAD_ITEMS, after: "feel", afterLabel: "Next: feel each muscle work" },
    trunk: { worked: [WORKED[1], { name: "Pectoralis major", parts: ["pectoralis", "major"], tells: "The larger chest muscle. The name gives the place and the size, not the action (it moves the arm)." }],
      guided: TRUNK_GUIDED, items: TRUNK_ITEMS, after: "learn", afterLabel: "Next: see the trunk muscles you just decoded" }
  };
  var ITEMS = HEAD_ITEMS.concat(TRUNK_ITEMS);
  // Four choices per part: the right meaning plus three from the same clue category (then others), in a fixed order per item.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function choices(itemId, root) {
    // Distractors match the right answer's clue category and its grammar ("of the ..." or not), so the wording never gives the answer away.
    var r = ROOTS[root], of = function (k) { return /^of the /.test(ROOTS[k].m); }, best = [], same = [], other = [];
    Object.keys(ROOTS).forEach(function (k) {
      if (k === root || ROOTS[k].m === r.m) return;
      if (ROOTS[k].cat === r.cat && of(k) === of(root)) best.push(k); else if (of(k) === of(root)) same.push(k); else other.push(k);
    });
    var seed = hash(itemId + "|" + root), pick = function (arr) { return arr.slice().sort(function (a, b) { return hash(seed + a) - hash(seed + b); }); };
    var d = pick(best).concat(pick(same), pick(other)).slice(0, 3);
    return [root].concat(d).sort(function (a, b) { return hash(seed + "o" + a) - hash(seed + "o" + b); });
  }
  global.MuscleNames = { ROOTS: ROOTS, CATS: CATS, WORKED: WORKED, GUIDED: GUIDED, ITEMS: ITEMS, SETS: SETS, ALL_GUIDED: [GUIDED, TRUNK_GUIDED], choices: choices, OBJ: "bio131.ch9.muscle-name-roots" };
})(window);
