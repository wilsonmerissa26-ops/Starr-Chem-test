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
    "dorsi": { m: "of the back", cat: "place", ex: "" },
    "spinatus": { m: "spine of the scapula (the bony ridge across its back)", cat: "place", ex: "" },
    "scapularis": { m: "scapula (shoulder blade)", cat: "place", ex: "" },
    "brachii": { m: "of the arm", cat: "place", ex: "" },
    "brachio": { m: "arm", cat: "place", ex: "" },
    "radialis": { m: "radius (the thumb-side forearm bone)", cat: "place", ex: "extensor carpi radialis brevis" },
    "ulnaris": { m: "ulna (the little-finger-side forearm bone)", cat: "place", ex: "" },
    "carpi": { m: "of the wrist", cat: "place", ex: "extensor carpi radialis brevis" },
    "digitorum": { m: "of the digits (fingers or toes)", cat: "place", ex: "flexor digitorum profundus" },
    "hallucis": { m: "of the big toe (hallux)", cat: "place", ex: "abductor hallucis" },
    "tibialis": { m: "tibia (the shin bone)", cat: "place", ex: "" },
    "fibularis": { m: "fibula (the thin bone on the outer side of the leg)", cat: "place", ex: "fibularis tertius" },
    "palmaris": { m: "palm of the hand", cat: "place", ex: "palmaris brevis" },
    "gluteus": { m: "buttock", cat: "place", ex: "gluteus maximus" },
    "femoris": { m: "of the femur (thigh bone)", cat: "place", ex: "rectus femoris" },
    "psoas": { m: "loin (the lower back, beside the lumbar spine)", cat: "place", ex: "psoas minor" },
    "fasciae": { m: "of the fascia (a sheet of connective tissue)", cat: "place", ex: "" },
    "oculi": { m: "of the eye", cat: "place", ex: "orbicularis oculi" },
    "oris": { m: "of the mouth", cat: "place", ex: "orbicularis oris" },
    "labii": { m: "of the lip", cat: "place", ex: "" },
    "supercilii": { m: "of the eyebrow", cat: "place", ex: "" },
    "anguli": { m: "of the angle (corner)", cat: "place", ex: "levator anguli oris" },
    // Position
    "superioris": { m: "upper", cat: "position", ex: "levator palpebrae superioris" },
    "inferioris": { m: "lower", cat: "position", ex: "" },
    "anterior": { m: "front", cat: "position", ex: "scalenus anterior" },
    "posterior": { m: "back, behind", cat: "position", ex: "serratus posterior" },
    "external": { m: "outer (toward the outside)", cat: "position", ex: "" },
    "internal": { m: "inner (toward the inside)", cat: "position", ex: "" },
    "inter": { m: "between", cat: "position", ex: "interossei" },
    "supra": { m: "above", cat: "position", ex: "suprahyoid muscles" },
    "infra": { m: "below", cat: "position", ex: "infrahyoid muscles" },
    "sub": { m: "under, beneath", cat: "position", ex: "subclavius" },
    "superficialis": { m: "near the surface (shallower than a deeper partner muscle)", cat: "position", ex: "" },
    "lateralis": { m: "to the side, away from the midline", cat: "position", ex: "rectus lateralis (an eye muscle)" },
    "medialis": { m: "toward the midline", cat: "position", ex: "" },
    "intermedius": { m: "in between (intermediate)", cat: "position", ex: "" },
    // Shape
    "orbicularis": { m: "circular, a ring", cat: "shape", ex: "orbicularis oculi" },
    "serratus": { m: "saw-toothed", cat: "shape", ex: "serratus posterior" },
    "quadratus": { m: "square, four-sided", cat: "shape", ex: "quadratus femoris" },
    "splenius": { m: "bandage-like", cat: "shape", ex: "splenius cervicis" },
    "deltoid": { m: "triangular", cat: "shape", ex: "deltoid" },
    "teres": { m: "round, cylindrical", cat: "shape", ex: "" },
    "tendinosus": { m: "tendon-like (with a long tendon)", cat: "shape", ex: "" },
    "membranosus": { m: "membrane-like (flat and thin)", cat: "shape", ex: "" },
    // Size
    "major": { m: "larger", cat: "size", ex: "pectoralis major" },
    "minor": { m: "smaller", cat: "size", ex: "zygomaticus minor" },
    "maximus": { m: "largest", cat: "size", ex: "gluteus maximus" },
    "minimus": { m: "smallest", cat: "size", ex: "" },
    "latissimus": { m: "widest", cat: "size", ex: "" },
    "longus": { m: "long", cat: "size", ex: "longus colli" },
    "brevis": { m: "short", cat: "size", ex: "adductor brevis" },
    "medius": { m: "middle", cat: "size", ex: "scalenus medius" },
    "magnus": { m: "large", cat: "size", ex: "" },
    "vastus": { m: "huge, vast", cat: "size", ex: "" },
    "latae": { m: "wide, broad", cat: "size", ex: "" },
    // Fiber direction
    "rectus": { m: "straight (describes the straight course of the fibers relative to the structure)", cat: "fibers", ex: "rectus femoris" },
    "transversus": { m: "across (fibers run transversely, at right angles to the structure's long axis)", cat: "fibers", ex: "" },
    "oblique": { m: "slanted (fibers run diagonally)", cat: "fibers", ex: "superior oblique (an eye muscle)" },
    // Number of parts
    "di": { m: "two", cat: "number", ex: "" },
    "gastric": { m: "belly (here, a fleshy muscle belly)", cat: "number", ex: "gastrocnemius" },
    "biceps": { m: "two heads (two separate proximal attachments joining one muscle)", cat: "number", ex: "biceps femoris" },
    "triceps": { m: "three heads (three separate proximal attachments joining one muscle)", cat: "number", ex: "" },
    "semi": { m: "half", cat: "number", ex: "semispinalis" },
    // Action
    "levator": { m: "raises", cat: "action", ex: "levator palpebrae superioris" },
    "depressor": { m: "lowers", cat: "action", ex: "" },
    "corrugator": { m: "wrinkles", cat: "action", ex: "" },
    "erector": { m: "raises, straightens", cat: "action", ex: "" },
    "flexor": { m: "bends (decreases the angle at a joint)", cat: "action", ex: "flexor pollicis longus" },
    "extensor": { m: "straightens (increases the angle at a joint)", cat: "action", ex: "extensor pollicis longus" },
    "pronator": { m: "turns the palm down (pronates)", cat: "action", ex: "pronator quadratus" },
    "supinator": { m: "turns the palm up (supinates)", cat: "action", ex: "" },
    "adductor": { m: "pulls a limb toward the midline (adducts)", cat: "action", ex: "adductor brevis" },
    "tensor": { m: "tightens, makes tense", cat: "action", ex: "tensor tympani" }
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
  // taughtBy: the teaching screen (or screens) that show this muscle. Once she has viewed it, the name is no longer new, so it counts as practice.
  var TRUNK_TAUGHT = "ap-ch9-teach-trunk-learn";
  var UPPER_TAUGHT = "ap-ch9-teach-upper-learn";
  var FOREARM_TAUGHT = "ap-ch9-teach-forearm-learn";
  var THIGH_TAUGHT = "ap-ch9-teach-thigh-learn";
  var LEG_TAUGHT = "ap-ch9-teach-leg-learn";
  var BOTH_FOREARM = [UPPER_TAUGHT, FOREARM_TAUGHT]; // the shoulder and arm lesson's labeled palm-side figure already shows these names
  var HEAD_ITEMS = [
    { id: "ap-ch9-names-levator-labii-superioris", name: "Levator labii superioris", parts: ["levator", "labii", "superioris"], tells: "It raises the upper lip." },
    { id: "ap-ch9-names-sternohyoid", name: "Sternohyoid", parts: ["sterno", "hyoid"], tells: "It runs between the sternum and the hyoid bone." },
    { id: "ap-ch9-names-depressor-anguli-oris", name: "Depressor anguli oris", parts: ["depressor", "anguli", "oris"], tells: "It pulls the corner of the mouth down." },
    { id: "ap-ch9-names-splenius-capitis", name: "Splenius capitis", parts: ["splenius", "capitis"], tells: "A bandage-like muscle of the back of the neck that acts on the head." },
    { id: "ap-ch9-names-corrugator-supercilii", name: "Corrugator supercilii", parts: ["corrugator", "supercilii"], tells: "It wrinkles the eyebrow, drawing the brows together as in a frown." },
    { id: "ap-ch9-names-digastric", name: "Digastric", parts: ["di", "gastric"], tells: "A muscle with two fleshy bellies joined by a tendon, below the jaw." },
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
    { id: "ap-ch9-names-internal-oblique", name: "Internal oblique", parts: ["internal", "oblique"], tells: "The inner of the two slanted side muscles of the abdomen (in the abdominal wall, inner also means deeper).", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-internal-intercostals", name: "Internal intercostals", parts: ["internal", "inter", "costal"], tells: "The inner layer of muscles between the ribs (here, inner also means deeper).", taughtBy: TRUNK_TAUGHT },
    { id: "ap-ch9-names-erector-spinae", name: "Erector spinae", parts: ["erector", "spinae"], tells: "A muscle group along the spine that straightens (extends) the back and holds it upright." },
    { id: "ap-ch9-names-serratus-anterior", name: "Serratus anterior", parts: ["serratus", "anterior"], tells: "A saw-toothed muscle on the front and side of the chest wall.", taughtBy: UPPER_TAUGHT }
  ];
  var UPPER_GUIDED = { id: "ap-ch9-names-guided-biceps-brachii", name: "Biceps brachii", parts: ["biceps", "brachii"],
    tells: "The two-headed muscle of the arm." };
  var UPPER_ITEMS = [
    { id: "ap-ch9-names-latissimus-dorsi", name: "Latissimus dorsi", parts: ["latissimus", "dorsi"], tells: "The widest muscle of the back.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-supraspinatus", name: "Supraspinatus", parts: ["supra", "spinatus"], tells: "The muscle above the spine of the scapula.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-triceps-brachii", name: "Triceps brachii", parts: ["triceps", "brachii"], tells: "The three-headed muscle of the arm.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-subscapularis", name: "Subscapularis", parts: ["sub", "scapularis"], tells: "The muscle beneath the scapula, on its rib-facing surface.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-brachioradialis", name: "Brachioradialis", parts: ["brachio", "radialis"], tells: "A muscle running from the arm to the radius.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-infraspinatus", name: "Infraspinatus", parts: ["infra", "spinatus"], tells: "The muscle below the spine of the scapula.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-teres-minor", name: "Teres minor", parts: ["teres", "minor"], tells: "The smaller round muscle.", taughtBy: UPPER_TAUGHT },
    { id: "ap-ch9-names-teres-major", name: "Teres major", parts: ["teres", "major"], tells: "The larger round muscle.", taughtBy: UPPER_TAUGHT }
  ];
  var FOREARM_GUIDED = { id: "ap-ch9-names-guided-flexor-carpi-radialis", name: "Flexor carpi radialis", parts: ["flexor", "carpi", "radialis"],
    tells: "It bends the wrist, on the thumb (radius) side of the forearm." };
  var FOREARM_ITEMS = [
    { id: "ap-ch9-names-flexor-carpi-ulnaris", name: "Flexor carpi ulnaris", parts: ["flexor", "carpi", "ulnaris"], tells: "It bends the wrist, on the little-finger (ulna) side of the forearm.", taughtBy: BOTH_FOREARM },
    { id: "ap-ch9-names-extensor-carpi-ulnaris", name: "Extensor carpi ulnaris", parts: ["extensor", "carpi", "ulnaris"], tells: "It straightens the wrist, on the little-finger (ulna) side of the forearm.", taughtBy: FOREARM_TAUGHT },
    { id: "ap-ch9-names-extensor-carpi-radialis-longus", name: "Extensor carpi radialis longus", parts: ["extensor", "carpi", "radialis", "longus"], tells: "The long muscle that straightens the wrist, on the thumb (radius) side.", taughtBy: FOREARM_TAUGHT },
    { id: "ap-ch9-names-flexor-digitorum-superficialis", name: "Flexor digitorum superficialis", parts: ["flexor", "digitorum", "superficialis"], tells: "It bends the fingers, and it lies nearer the surface than the deeper finger flexor.", taughtBy: BOTH_FOREARM },
    { id: "ap-ch9-names-extensor-digitorum", name: "Extensor digitorum", parts: ["extensor", "digitorum"], tells: "It straightens the fingers.", taughtBy: FOREARM_TAUGHT },
    { id: "ap-ch9-names-palmaris-longus", name: "Palmaris longus", parts: ["palmaris", "longus"], tells: "A long, thin muscle whose tendon ends in the palm.", taughtBy: BOTH_FOREARM },
    { id: "ap-ch9-names-pronator-teres", name: "Pronator teres", parts: ["pronator", "teres"], tells: "A round muscle that turns the palm down.", taughtBy: BOTH_FOREARM }
  ];  // Supinator is left out: its name is a single root shown in the table, so it would not test decoding.
  var THIGH_GUIDED = { id: "ap-ch9-names-guided-vastus-lateralis", name: "Vastus lateralis", parts: ["vastus", "lateralis"],
    tells: "The huge muscle on the outer side of the thigh." };
  // Gracilis, pectineus, sartorius and iliacus are left out: each name is a single word, so it would not test decoding.
  var THIGH_ITEMS = [
    { id: "ap-ch9-names-gluteus-medius", name: "Gluteus medius", parts: ["gluteus", "medius"], tells: "The middle buttock muscle: the middle one of the three gluteal muscles in size and depth.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-psoas-major", name: "Psoas major", parts: ["psoas", "major"], tells: "The larger muscle of the loin, beside the lumbar spine.", taughtBy: [TRUNK_TAUGHT, THIGH_TAUGHT] }, // the trunk lesson's labeled posterior abdominal wall already shows it
    { id: "ap-ch9-names-vastus-medialis", name: "Vastus medialis", parts: ["vastus", "medialis"], tells: "The huge muscle on the inner side of the thigh, toward the midline.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-adductor-magnus", name: "Adductor magnus", parts: ["adductor", "magnus"], tells: "The large muscle that pulls the thigh toward the midline.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-semitendinosus", name: "Semitendinosus", parts: ["semi", "tendinosus"], tells: "A muscle that is half tendon: its lower half is a long tendon.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-semimembranosus", name: "Semimembranosus", parts: ["semi", "membranosus"], tells: "A muscle that is half membrane-like: flat and thin at its upper end.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-tensor-fasciae-latae", name: "Tensor fasciae latae", parts: ["tensor", "fasciae", "latae"], tells: "It tightens the wide fascia of the thigh (the iliotibial tract).", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-adductor-longus", name: "Adductor longus", parts: ["adductor", "longus"], tells: "The long muscle that pulls the thigh toward the midline.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-gluteus-minimus", name: "Gluteus minimus", parts: ["gluteus", "minimus"], tells: "The smallest buttock muscle: the smallest and deepest of the three gluteal muscles.", taughtBy: THIGH_TAUGHT },
    { id: "ap-ch9-names-vastus-intermedius", name: "Vastus intermedius", parts: ["vastus", "intermedius"], tells: "The huge muscle in between: the quadriceps muscle between the vastus lateralis and vastus medialis, under the rectus femoris.", taughtBy: THIGH_TAUGHT }
  ];
  var LEG_GUIDED = { id: "ap-ch9-names-guided-tibialis-anterior", name: "Tibialis anterior", parts: ["tibialis", "anterior"],
    tells: "The muscle on the front of the tibia (shin bone)." };
  // Gastrocnemius and soleus are left out: their roots (belly + leg; a flatfish) are not decoding clues taught here.
  var LEG_ITEMS = [
    { id: "ap-ch9-names-tibialis-posterior", name: "Tibialis posterior", parts: ["tibialis", "posterior"], tells: "The muscle on the back of the tibia.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-fibularis-longus", name: "Fibularis longus", parts: ["fibularis", "longus"], tells: "The long muscle on the fibula.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-extensor-hallucis-longus", name: "Extensor hallucis longus", parts: ["extensor", "hallucis", "longus"], tells: "The long muscle that straightens (lifts) the big toe.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-fibularis-brevis", name: "Fibularis brevis", parts: ["fibularis", "brevis"], tells: "The short muscle on the fibula.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-flexor-digitorum-longus", name: "Flexor digitorum longus", parts: ["flexor", "digitorum", "longus"], tells: "The long muscle that bends (curls) the toes.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-extensor-digitorum-longus", name: "Extensor digitorum longus", parts: ["extensor", "digitorum", "longus"], tells: "The long muscle that straightens (lifts) the toes.", taughtBy: LEG_TAUGHT },
    { id: "ap-ch9-names-flexor-hallucis-longus", name: "Flexor hallucis longus", parts: ["flexor", "hallucis", "longus"], tells: "The long muscle that bends (curls) the big toe.", taughtBy: LEG_TAUGHT }
  ];
  var SETS = {
    head: { worked: WORKED, guided: GUIDED, items: HEAD_ITEMS, after: "feel", afterLabel: "Next: feel each muscle work" },
    trunk: { worked: [WORKED[1], { name: "Pectoralis major", parts: ["pectoralis", "major"], tells: "The larger chest muscle. The name gives the place and the size, not the action (it moves the arm)." }],
      guided: TRUNK_GUIDED, items: TRUNK_ITEMS, after: "learn", afterLabel: "Next: see the trunk muscles you just decoded" },
    upper: { worked: [WORKED[1], { name: "Pectoralis major", parts: ["pectoralis", "major"], tells: "The larger chest muscle. The name gives the place and the size, not the action." }],
      guided: UPPER_GUIDED, items: UPPER_ITEMS, after: "learn", afterLabel: "Next: see the shoulder and arm muscles you just decoded" },
    forearm: { worked: [WORKED[1], { name: "Pronator quadratus", parts: ["pronator", "quadratus"], tells: "A four-sided muscle deep in the forearm near the wrist that turns the palm down. Here the name gives the action and the shape." }],
      guided: FOREARM_GUIDED, items: FOREARM_ITEMS, after: "learn", afterLabel: "Next: see the forearm muscles you just decoded" },
    thigh: { worked: [WORKED[1], { name: "Gluteus maximus", parts: ["gluteus", "maximus"], tells: "The largest buttock muscle. The name gives the place and the size, not the action (it extends the thigh)." }],
      guided: THIGH_GUIDED, items: THIGH_ITEMS, after: "learn", afterLabel: "Next: see the hip and thigh muscles you just decoded" },
    leg: { worked: [WORKED[1], { name: "Biceps femoris", parts: ["biceps", "femoris"], tells: "The two-headed muscle of the femur (thigh): a hamstring. The name gives the number of heads and the place, not the action." }],
      guided: LEG_GUIDED, items: LEG_ITEMS, after: "learn", afterLabel: "Next: see the lower leg muscles you just decoded" }
  };
  var ITEMS = HEAD_ITEMS.concat(TRUNK_ITEMS, UPPER_ITEMS, FOREARM_ITEMS, THIGH_ITEMS, LEG_ITEMS);
  // Pairs whose meanings overlap enough that either could look right; one is never offered as a wrong choice for the other.
  var CLOSE = [["extensor", "erector"], ["levator", "erector"], ["superficialis", "external"], ["teres", "orbicularis"],
    ["vastus", "maximus"], ["vastus", "major"], ["vastus", "magnus"], ["magnus", "major"], ["magnus", "maximus"], ["latae", "latissimus"],
    ["lateralis", "external"], ["medialis", "internal"], ["posterior", "dorsi"], ["medius", "medialis"],
    ["minimus", "minor"], ["intermedius", "inter"], ["intermedius", "medius"], ["intermedius", "medialis"]];
  function close(a, b) { return CLOSE.some(function (p) { return (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a); }); }
  // Four choices per part: the right meaning plus three from the same clue category (then others), in a fixed order per item.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function choices(itemId, root) {
    // Distractors match the right answer's clue category and its grammar ("of the ..." or not), so the wording never gives the answer away.
    var r = ROOTS[root], of = function (k) { return /^of the /.test(ROOTS[k].m); }, best = [], same = [], other = [];
    Object.keys(ROOTS).forEach(function (k) {
      if (k === root || ROOTS[k].m === r.m || close(k, root)) return;
      if (ROOTS[k].cat === r.cat && of(k) === of(root)) best.push(k); else if (of(k) === of(root)) same.push(k); else other.push(k);
    });
    var seed = hash(itemId + "|" + root), pick = function (arr) { return arr.slice().sort(function (a, b) { return hash(seed + a) - hash(seed + b); }); };
    var d = pick(best).concat(pick(same), pick(other)).slice(0, 3);
    return [root].concat(d).sort(function (a, b) { return hash(seed + "o" + a) - hash(seed + "o" + b); });
  }
  global.MuscleNames = { ROOTS: ROOTS, CATS: CATS, WORKED: WORKED, GUIDED: GUIDED, ITEMS: ITEMS, SETS: SETS, ALL_GUIDED: [GUIDED, TRUNK_GUIDED, UPPER_GUIDED, FOREARM_GUIDED, THIGH_GUIDED, LEG_GUIDED], choices: choices, CLOSE: CLOSE, OBJ: "bio131.ch9.muscle-name-roots" };
})(window);
