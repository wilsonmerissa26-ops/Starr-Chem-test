/* A&P in-depth lesson: one muscle at a time through Decode → See → Move → Explain → Recall → Apply.
 * Two complete examples for the head and neck set: sternocleidomastoid (naming and attachments) and
 * masseter (location, movement and function).
 * Facts follow OpenStax Anatomy and Physiology 2e, sections 11.2 (naming) and 11.3 (head and neck), with the
 * landmark images built by tools/build-ap-deep-images.py from OpenStax figures 705, 1105 and 1110.
 * Recording rules: decoding, seeing, moving, explaining and recalling on a studied picture are practice.
 * Only the Apply question (a picture or a case she has never seen, first try, no help) can count as independent.
 */
(function (global) {
  "use strict";
  var FIG = {
    "deep-neck": { img: "img/deep-neck-landmarks.jpg", alt: "Front of the lower neck with the clavicles and sternum labels outlined" },
    "deep-skull": { img: "img/deep-skull-landmarks.jpg", alt: "Skull, right side, with the mastoid process, zygomatic arch and mandible labels outlined" }
  };
  var LESSONS = [
    {
      key: "sternocleidomastoid", name: "Sternocleidomastoid", objective: "jawneck",
      why: "This name is a map. Each part names a bone the muscle attaches to, so if you can decode it, you know where it runs.",
      decode: {
        parts: [
          { root: "sterno", means: "sternum (the breastbone)", fig: "deep-neck", look: "Find the outlined label “Sternum” and follow its line to the flat bone in the middle of the upper chest." },
          { root: "cleido", means: "clavicle (the collarbone)", fig: "deep-neck", look: "Find the outlined label “Right and left clavicles” and follow the lines to the two collarbones." },
          { root: "mastoid", means: "mastoid process (the bony bump of the temporal bone, just behind and below the ear)", fig: "deep-skull", look: "Find the outlined label “Mastoid process” and follow its line to the bump behind the ear opening." }
        ],
        check: { id: "ap-ch9-deep-scm-decode", prompt: "Based only on the name, which three landmarks does this muscle attach to? Choose three.",
          options: ["Sternum", "Clavicle", "Mastoid process", "Hyoid bone", "Scapula", "Mandible"], answer: ["Sternum", "Clavicle", "Mastoid process"],
          wrong: "Go back to the name, one part at a time: sterno = sternum, cleido = clavicle, mastoid = mastoid process. The name lists all three." }
      },
      see: { fig: "neck", text: "On the side of the neck, follow the long diagonal band from low in front (sternum and clavicle) up and back to behind the ear (mastoid process). That diagonal path is how you recognize it on any picture." },
      move: { action: "One side contracting turns the head to the OPPOSITE side and tilts it toward the same shoulder. Both sides together flex the neck (bring the chin down toward the chest).",
        demo: "Picture the left muscle as a cord from your left collarbone to the bump behind your left ear. Shorten that cord: it pulls the left side of the head down and forward, so your face turns to the right." },
      explain: { id: "ap-ch9-deep-scm-explain", prompt: "In your own words: when you turn your face to the right, why is it the LEFT sternocleidomastoid that does the work? Use its attachments in your answer.",
        points: ["It runs from the sternum and clavicle up to the mastoid process behind the ear.", "When the left one shortens, it pulls the left mastoid process down and forward.", "Pulling the left side of the head forward turns the face to the right, the opposite side."],
        model: "The left sternocleidomastoid runs from the sternum and clavicle up to the mastoid process behind the left ear. When it shortens, it pulls that mastoid process down and forward toward the front of the chest. Pulling the back of the left side of the head forward swings the face to the right. So one side turns the head to the opposite side." },
      recall: { id: "ap-ch9-deep-scm-recall-name", fig: "neck",
        action: { id: "ap-ch9-deep-scm-recall-action", prompt: "What happens when only ONE sternocleidomastoid contracts?",
          options: ["The head turns to the opposite side", "The head turns to the same side", "The jaw closes", "The shoulder blade rises"], answer: "The head turns to the opposite side",
          explain: { location: "Look at the path again: low in front (sternum, clavicle) to high behind the ear (mastoid). A cord on that path pulls the back of one side of the head forward.",
            action: "Try it with your hand on the left side of your neck: turning your face right makes the LEFT muscle stand out. One side turns the head to the opposite side.",
            name: "The name tells you the path: sterno + cleido (low in front) to mastoid (behind the ear). The path tells you the pull.",
            question: "The question asks what ONE muscle does on its own, not both together. Both together flex the neck; one alone turns the head." } } },
      apply: { id: "ap-ch9-deep-scm-apply-body-front", kind: "pin", fig: "deep-body-head", objective: "jawneck",
        prompt: "New picture you have not studied: the front of the whole body, head and neck. Name the pinned muscle.",
        how: ["I followed the pin's line to the neck.", "It is a band running from the front of the chest up toward behind the ear.", "That path, sternum and clavicle to mastoid, means sternocleidomastoid."] }
    },
    {
      key: "masseter", name: "Masseter", objective: "jawneck",
      why: "This name is not a map: masseter comes from the Greek word for “chewer.” So you learn it by its job and its two attachment points.",
      decode: {
        parts: [
          { root: "masseter", means: "chewer (Greek): the name describes its job", fig: "deep-skull", look: "Not every name has parts. For this one, connect the meaning, chewer, to what it does." },
          { root: "zygomatic arch", means: "the bony arch of the cheek, in front of the ear (the muscle's upper attachment)", fig: "deep-skull", look: "Find the outlined label “Zygomatic arch” at the top and follow its line down to the arch above the jaw joint." },
          { root: "mandible", means: "the lower jaw (the muscle's lower attachment, at its angle and back edge)", fig: "deep-skull", look: "Find the outlined label “Mandible” and look at the back corner of the jaw, the angle." }
        ],
        check: { id: "ap-ch9-deep-masseter-decode", prompt: "Which two landmarks does the masseter connect? Choose two.",
          options: ["Zygomatic arch", "Mandible", "Mastoid process", "Sternum", "Frontal bone"], answer: ["Zygomatic arch", "Mandible"],
          wrong: "The masseter is a chewing muscle, so it has to move the lower jaw (mandible). It hangs from the cheek arch above it (zygomatic arch)." }
      },
      see: { fig: "jaw", text: "Find the thick, short block of muscle at the back of the jaw, just in front of the ear: from the zygomatic arch down to the angle of the mandible. It is thick and nearly square, and it sits low, over the jaw itself." },
      move: { action: "Elevates the mandible, which closes the mouth. It is the prime mover for chewing.",
        demo: "The mandible hinges at the jaw joint, just in front of the ear. The masseter hangs below the zygomatic arch and attaches to the jaw below the hinge, so when it shortens it pulls the jaw up: the mouth closes and the teeth press together." },
      explain: { id: "ap-ch9-deep-masseter-explain", prompt: "In your own words: why does a muscle running from the zygomatic arch down to the angle of the mandible close your mouth?",
        points: ["Its top end is fixed to the zygomatic arch, above the jaw.", "Its bottom end is on the mandible, which can move at the jaw joint.", "Shortening pulls the mandible up toward the arch, which closes the mouth."],
        model: "The masseter's upper end is fixed on the zygomatic arch and its lower end is on the mandible near the angle. The mandible can swing at the jaw joint. When the masseter shortens, it pulls the movable end, the mandible, up toward the fixed end, so the jaw closes and the teeth press together for chewing." },
      recall: { id: "ap-ch9-deep-masseter-recall-name", fig: "jaw",
        action: { id: "ap-ch9-deep-masseter-recall-action", prompt: "What does the masseter do when it contracts?",
          options: ["Elevates the mandible (closes the mouth)", "Depresses the mandible (opens the mouth)", "Compresses the cheek", "Closes the eyelids"], answer: "Elevates the mandible (closes the mouth)",
          explain: { location: "Compare the two cheek muscles side by side: the masseter is a thick block over the back of the jaw near the ear; the buccinator is a thin sheet inside the cheek beside the mouth.",
            action: "Clench gently with your fingertips on the angle of your jaw: the bulge you feel closes the jaw. Cheek compression (blowing out air) is the buccinator's job.",
            name: "Masseter means chewer. Chewing means closing the jaw with force.",
            question: "The question asks what the muscle does to the jaw when it shortens. It pulls the mandible up." } } },
      apply: { id: "ap-ch9-deep-masseter-apply-grinding", kind: "case", objective: "actions",
        prompt: "New case: a student grinds her teeth at night. She wakes with a sore, tight, slightly enlarged muscle at the back corner of her jaw, just in front of the ear, and it bulges when she clenches. Name the muscle that is most likely overworked.",
        how: ["Grinding means the jaw is being clenched shut over and over.", "The muscle that closes the jaw and sits at the angle in front of the ear is the masseter."],
        note: "OpenStax has only one labeled picture of the masseter, which you studied, so this Apply step uses a new case instead of a new picture. Photos of your lab's models would add a new picture later." }
    }
  ];
  // Pin position on the new whole-body view, from img/pins-deep.json (OpenStax "Sternocleidomastoid" leader line).
  var PINS = { "deep-body-head": { "sternocleidomastoid": [2.31, 41.28] } };
  var FIGURES = { "deep-body-head": { img: "img/deep-body-head-unlabeled.jpg", alt: "Front of the whole body, head and neck, labels covered", labeled: "img/neck-labeled.jpg" } };
  global.DeepLesson = { LESSONS: LESSONS, FIG: FIG, PINS: PINS, FIGURES: FIGURES, CONFUSION: [
    { id: "location", label: "Where it is" }, { id: "name", label: "The name" }, { id: "action", label: "What it does" }, { id: "question", label: "I didn't understand the question" }] };
})(window);
