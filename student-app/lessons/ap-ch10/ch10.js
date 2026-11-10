/* BIO 131 Chapter 10 (muscle tissue and physiology): how a skeletal muscle fiber contracts and relaxes.
 * Content follows OpenStax Anatomy and Physiology 2e, sections 10.2 (Skeletal Muscle) and 10.3 (Muscle Fiber Contraction
 * and Relaxation), Figures 10.6 and 10.8 to 10.12. It is textbook-based preparation for Exam 3, not Dr. Granger's list.
 * Questions on application ("a toxin blocks...") describe a mechanism, not a named drug, so every answer follows from the
 * textbook steps above.
 */
(function (global) {
  "use strict";
  var OBJ = {
    nmj: "bio131.ch10.nmj",                        // signal crosses the neuromuscular junction
    ec: "bio131.ch10.ec-coupling",                 // action potential to Ca2+ exposing actin
    xb: "bio131.ch10.crossbridge-atp",             // cross-bridge cycle, ATP roles, sliding filaments
    relax: "bio131.ch10.relaxation",               // how the fiber relaxes
    energy: "bio131.ch10.energy"                   // where new ATP comes from
  };
  var STATUS = [{ key: "nmj", label: "Neuromuscular junction" }, { key: "ec", label: "E-C coupling" }, { key: "xb", label: "Cross-bridges and ATP" },
    { key: "relax", label: "Relaxation" }, { key: "energy", label: "Energy sources" }];

  // 1. Learn: one short screen per stage.
  var STAGES = [
    { id: "nmj", obj: "nmj", title: "1. The signal crosses the gap", fig: "img/nmj.jpg", alt: "Axon terminal releasing ACh into the synaptic cleft; ACh binding receptors on the motor end-plate lets Na+ in",
      points: ["A nerve impulse (action potential) reaches the <b>axon terminal</b> of a motor neuron.",
        "The terminal releases <b>acetylcholine (ACh)</b> into the <b>synaptic cleft</b>, the tiny gap between the neuron and the muscle fiber.",
        "ACh binds <b>ACh receptors</b> on the <b>motor end-plate</b>. Their channels open and positive ions, mainly <b>Na⁺</b>, flow into the fiber. The end-plate depolarizes: the inside becomes less negative."],
      fails: "No ACh, or receptors that are blocked, means the signal never crosses the gap and the fiber is never stimulated." },
    { id: "spread", obj: "ec", title: "2. The signal spreads into the fiber", fig: "img/contraction.jpg", alt: "Action potential arriving at the neuromuscular junction, traveling along the T-tubules, and calcium leaving the sarcoplasmic reticulum",
      points: ["The depolarization opens <b>voltage-gated Na⁺ channels</b>, and an <b>action potential</b> sweeps along the <b>sarcolemma</b> (resting inside is about −60 to −90 mV).",
        "The action potential travels down the <b>T-tubules</b>, inward folds of the sarcolemma that carry it deep into the fiber.",
        "Each T-tubule sits between two <b>terminal cisternae</b> of the sarcoplasmic reticulum (SR). The three together are a <b>triad</b>."],
      fails: "If the action potential can't reach the T-tubules, the SR deep in the fiber never gets the signal." },
    { id: "calcium", obj: "ec", title: "3. Calcium unlocks actin", fig: "img/contraction.jpg", alt: "Calcium released from the sarcoplasmic reticulum binding troponin on the thin filament",
      points: ["When the action potential reaches the triads, the <b>sarcoplasmic reticulum releases Ca²⁺</b> into the sarcoplasm.",
        "Ca²⁺ binds <b>troponin</b>. Troponin shifts <b>tropomyosin</b>, which had been covering the <b>myosin-binding sites</b> on actin.",
        "With the sites exposed, myosin heads can attach. This chain, from the action potential to exposed actin, is <b>excitation-contraction coupling</b>."],
      fails: "If the SR can't release Ca²⁺, tropomyosin stays in place and no cross-bridges form, even though the action potential arrived." },
    { id: "cycle", obj: "xb", title: "4. Cross-bridges pull", fig: "img/crossbridge.jpg", alt: "Cross-bridge cycle: myosin head binds actin, power stroke, ATP binding and detachment, cocking of the myosin head",
      points: ["A cocked myosin head, still holding <b>ADP and Pi</b>, binds actin: a <b>cross-bridge</b>.",
        "<b>Pi is released</b> and the head pivots: the <b>power stroke</b> pulls the thin filament toward the M line (about 10 nm). Then ADP is released.",
        "A new <b>ATP binds</b> the head, and the head <b>detaches</b> from actin.",
        "Myosin <b>splits ATP</b> into ADP and Pi, which <b>re-cocks</b> the head. The cycle repeats as long as Ca²⁺ and ATP are present."],
      fails: "Without ATP, the head cannot let go of actin. That is why muscles stiffen after death (rigor mortis)." },
    { id: "sliding", obj: "xb", title: "5. What actually shortens", fig: "img/sliding.jpg", alt: "Sliding filament model: relaxed and contracted sarcomere with Z discs, I bands, A band, H zone and M line",
      points: ["Thin filaments slide past thick filaments toward the M line. <b>Neither filament gets shorter.</b>",
        "Each <b>sarcomere</b> shortens: the <b>Z discs move closer</b> together and the <b>I band narrows</b>.",
        "The <b>A band keeps its width</b>, because it is the length of the thick filaments.",
        "Sarcomeres sit end to end, so when they shorten, the whole fiber shortens."],
      fails: "A common mistake is thinking the filaments themselves shrink. They slide; they don't shrink.", more: "Common mistake" },
    { id: "relax", obj: "relax", title: "6. Relaxing", fig: "img/relaxation.jpg", alt: "Relaxation: calcium pumped back into the sarcoplasmic reticulum using ATP, and the muscle lengthening",
      points: ["The motor neuron stops releasing ACh, and <b>acetylcholinesterase (AChE)</b> breaks down the ACh already in the cleft.",
        "The fiber repolarizes and the SR's Ca²⁺ channels close.",
        "<b>ATP-powered pumps move Ca²⁺ back into the SR.</b> As Ca²⁺ leaves troponin, <b>tropomyosin covers the binding sites</b> again.",
        "No new cross-bridges can form, and the fiber relaxes."],
      fails: "If Ca²⁺ can't be pumped back, binding sites stay exposed and the fiber has trouble relaxing." },
    { id: "atp", obj: "xb", title: "7. ATP's three jobs", fig: null,
      points: ["<b>Binding</b> ATP makes the myosin head <b>let go</b> of actin.",
        "<b>Splitting</b> ATP (ADP + Pi) <b>re-cocks</b> the head for the next pull.",
        "ATP powers the pumps that move <b>Ca²⁺ back into the SR</b>, so the fiber can relax.",
        "A fiber stores only a few seconds' worth of ATP, so it has to keep making more."],
      fails: "Ca²⁺ release from the SR is triggered by the action potential, not powered by ATP.", more: "What ATP does not do" },
    { id: "energy", obj: "energy", title: "8. Where new ATP comes from", fig: "img/metabolism.jpg", alt: "Muscle metabolism: creatine phosphate, glycolysis and aerobic respiration",
      points: ["<b>Creatine phosphate</b>: creatine kinase moves a phosphate to ADP, making ATP fast. About 15 seconds of energy.",
        "<b>Anaerobic glycolysis</b>: glucose to a net 2 ATP, with no oxygen needed. When oxygen is short, pyruvic acid becomes <b>lactic acid</b>. About 1 minute.",
        "<b>Aerobic respiration</b>: in the <b>mitochondria</b>, with oxygen. About 36 ATP per glucose. Slower, but it supplies about 95% of the ATP at rest or in moderate activity."],
      fails: "Fast but short (creatine phosphate), then medium (glycolysis), then slow and long-lasting (aerobic).", more: "A quick way to remember" }
  ];

  // 2. Put it in order (guided). Each event names the objective it practices.
  var ORDERS = [
    { id: "contraction", title: "From nerve signal to cross-bridges", events: [
      { t: "An action potential reaches the axon terminal, which releases ACh into the synaptic cleft.", obj: "nmj" },
      { t: "ACh binds receptors on the motor end-plate; channels open and Na⁺ flows in.", obj: "nmj" },
      { t: "Voltage-gated Na⁺ channels open and an action potential spreads along the sarcolemma.", obj: "ec" },
      { t: "The action potential travels down the T-tubules.", obj: "ec" },
      { t: "The sarcoplasmic reticulum releases Ca²⁺.", obj: "ec" },
      { t: "Ca²⁺ binds troponin, and tropomyosin moves off the myosin-binding sites.", obj: "ec" },
      { t: "Cocked myosin heads (holding ADP and Pi) bind actin, forming cross-bridges.", obj: "xb" },
      { t: "Pi is released and the power stroke pulls the thin filament toward the M line.", obj: "xb" },
      { t: "ATP binds the myosin head, and the head detaches from actin.", obj: "xb" },
      { t: "Myosin splits ATP, re-cocking the head for the next cycle.", obj: "xb" }] },
    { id: "relax", title: "Relaxation", events: [
      { t: "ACh release stops, and AChE breaks down the ACh in the cleft.", obj: "relax" },
      { t: "The fiber repolarizes and the SR's Ca²⁺ channels close.", obj: "relax" },
      { t: "ATP-powered pumps move Ca²⁺ back into the SR.", obj: "relax" },
      { t: "Tropomyosin covers the binding sites again, and the fiber relaxes.", obj: "relax" }] }
  ];

  // 3. Explain it (self-check, not graded).
  var EXPLAIN = { id: "explain-ec", obj: "ec",
    prompt: "In your own words: how does a nerve signal end up letting myosin grab actin? Say it out loud or write it down, then check it.",
    checklist: ["ACh is released and binds receptors on the motor end-plate.", "An action potential spreads along the sarcolemma and down the T-tubules.",
      "The sarcoplasmic reticulum releases Ca²⁺.", "Ca²⁺ binds troponin, tropomyosin moves, and the myosin-binding sites on actin are exposed."],
    model: "The axon terminal releases ACh, which binds receptors on the motor end-plate and lets Na⁺ in. That starts an action potential that spreads along the sarcolemma and down the T-tubules. At the triads it triggers the sarcoplasmic reticulum to release Ca²⁺. Ca²⁺ binds troponin, which moves tropomyosin off the myosin-binding sites, so myosin heads can attach to actin and form cross-bridges." };

  // 4. On your own: new questions, one per topic each visit, in this order. Every wrong choice names the mix-up it shows.
  function q(id, obj, prompt, right, wrong) { return { id: "ap-ch10-" + id, obj: obj, prompt: prompt, right: right, wrong: wrong }; }
  var ITEMS = [
    // Day 1
    q("nmj-after-ach", "nmj", "ACh has just bound its receptors on the motor end-plate. What happens next?",
      { t: "The receptor channels open and positive ions, mainly Na⁺, flow in, depolarizing the end-plate.", why: "ACh receptors are channels. Opening them lets Na⁺ in, which starts the action potential." },
      [{ t: "The sarcoplasmic reticulum releases Ca²⁺ right away.", err: "sequence-order", why: "Ca²⁺ release comes later, after the action potential has spread down the T-tubules." },
       { t: "Myosin heads bind actin.", err: "sequence-order", why: "Cross-bridges form only after Ca²⁺ has exposed the binding sites, several steps later." },
       { t: "K⁺ rushes into the fiber.", err: "ion-confused", why: "The inward current at the end-plate is mainly Na⁺, not K⁺." }]),
    q("ec-calcium-binds", "ec", "During excitation-contraction coupling, Ca²⁺ binds to which protein?",
      { t: "Troponin", why: "Ca²⁺ binds troponin, and troponin then moves tropomyosin off the binding sites." },
      [{ t: "Tropomyosin", err: "calcium-target", why: "Tropomyosin is the protein that gets moved. Ca²⁺ binds troponin, which moves it." },
       { t: "The myosin head", err: "calcium-target", why: "Myosin binds actin and ATP. Ca²⁺ acts on the thin filament, through troponin." },
       { t: "The myosin-binding site on actin", err: "calcium-target", why: "Ca²⁺ doesn't sit on the binding site. It binds troponin, which uncovers the site." }]),
    q("xb-detach", "xb", "During the cross-bridge cycle, what makes the myosin head let go of actin?",
      { t: "A new ATP binds to the myosin head.", why: "ATP binding is what releases the head. Without ATP the head stays attached (rigor)." },
      [{ t: "Myosin splits ATP into ADP and Pi.", err: "atp-role", why: "Splitting ATP re-cocks the head. That happens after it has already let go." },
       { t: "Pi is released from the myosin head.", err: "atp-role", why: "Pi release triggers the power stroke, while the head is still attached." },
       { t: "Ca²⁺ leaves troponin.", err: "relaxation-mixup", why: "Ca²⁺ leaving troponin is part of relaxation: it stops new cross-bridges. It isn't what detaches a head in each cycle." }]),
    q("relax-requires", "relax", "Which of these must happen for a skeletal muscle fiber to relax?",
      { t: "Ca²⁺ is pumped back into the sarcoplasmic reticulum, using ATP.", why: "Removing Ca²⁺ from troponin lets tropomyosin cover the binding sites again." },
      [{ t: "ATP is used up and disappears from the fiber.", err: "atp-role", why: "Running out of ATP causes rigor, the opposite of relaxing. Relaxation needs ATP to pump Ca²⁺." },
       { t: "More Ca²⁺ binds troponin.", err: "mechanism-reversed", why: "Ca²⁺ on troponin keeps the binding sites open, which keeps the fiber contracting." },
       { t: "The axon terminal releases more ACh.", err: "mechanism-reversed", why: "More ACh means more stimulation. Relaxation starts when ACh release stops." }]),
    q("energy-first-seconds", "energy", "In the first 15 seconds or so of an all-out sprint, which source rebuilds ATP fastest?",
      { t: "Creatine phosphate", why: "Creatine kinase hands creatine phosphate's phosphate to ADP almost instantly, covering about 15 seconds." },
      [{ t: "Aerobic respiration", err: "energy-system", why: "Aerobic respiration makes the most ATP but is slow and needs a steady oxygen supply." },
       { t: "Anaerobic glycolysis", err: "energy-system", why: "Glycolysis takes over next and lasts about a minute, but creatine phosphate is the fastest." },
       { t: "Breaking down fatty acids", err: "energy-system", why: "Fatty acids are used in aerobic respiration in the mitochondria, a slow pathway." }]),
    // Day 2
    q("nmj-released", "nmj", "What does a motor neuron's axon terminal release into the synaptic cleft to stimulate a skeletal muscle fiber?",
      { t: "Acetylcholine (ACh)", why: "ACh is the neurotransmitter at the neuromuscular junction." },
      [{ t: "Ca²⁺", err: "ion-confused", why: "The Ca²⁺ that triggers contraction comes from the fiber's own sarcoplasmic reticulum, not from the neuron." },
       { t: "Acetylcholinesterase (AChE)", err: "ache-role", why: "AChE is the enzyme that breaks ACh down in the cleft." },
       { t: "Troponin", err: "wrong-location", why: "Troponin is part of the thin filament inside the muscle fiber." }]),
    q("ec-relaxed-block", "ec", "In a relaxed muscle fiber, what keeps myosin heads from binding actin?",
      { t: "Tropomyosin covers the myosin-binding sites on actin.", why: "Until Ca²⁺ binds troponin, tropomyosin blocks the sites." },
      [{ t: "Troponin holds the myosin heads down.", err: "tropomyosin-role", why: "Troponin works on the thin filament. Tropomyosin is what physically covers the binding sites." },
       { t: "There is no ATP in a relaxed fiber.", err: "atp-role", why: "A relaxed fiber has ATP. Lack of ATP would leave heads stuck to actin." },
       { t: "Ca²⁺ is covering the binding sites.", err: "mechanism-reversed", why: "Ca²⁺ is what uncovers the sites, by binding troponin." }]),
    q("xb-hydrolysis", "xb", "What does the energy from splitting ATP (ATP → ADP + Pi) do in the cross-bridge cycle?",
      { t: "It cocks the myosin head into its high-energy position, ready to bind actin again.", why: "The cocked head stores that energy and uses it in the next power stroke." },
      [{ t: "It directly detaches the myosin head from actin.", err: "atp-role", why: "Binding ATP detaches the head. Splitting it comes after, and re-cocks the head." },
       { t: "It makes the sarcoplasmic reticulum release Ca²⁺.", err: "atp-role", why: "Ca²⁺ release is triggered by the action potential reaching the triads." },
       { t: "It breaks down ACh in the synaptic cleft.", err: "ache-role", why: "AChE, an enzyme, breaks down ACh. That isn't part of the cross-bridge cycle." }]),
    q("relax-ache", "relax", "What does acetylcholinesterase (AChE) do at the neuromuscular junction?",
      { t: "It breaks down ACh in the synaptic cleft so ACh stops stimulating the receptors.", why: "Clearing ACh lets the end-plate stop being stimulated, one step toward relaxation." },
      [{ t: "It makes ACh in the axon terminal.", err: "ache-role", why: "AChE breaks ACh down. It doesn't make it." },
       { t: "It pumps Ca²⁺ back into the sarcoplasmic reticulum.", err: "relaxation-mixup", why: "That job belongs to ATP-powered Ca²⁺ pumps in the SR membrane." },
       { t: "It opens the ACh receptor channels.", err: "ache-role", why: "ACh binding opens the channels. AChE removes ACh, which ends it." }]),
    q("energy-glycolysis", "energy", "Anaerobic glycolysis gives how much ATP per glucose, and what does it make when oxygen is low?",
      { t: "A net 2 ATP; pyruvic acid is turned into lactic acid.", why: "Glycolysis is fast but makes little ATP. Without enough oxygen, pyruvic acid becomes lactic acid." },
      [{ t: "About 36 ATP; carbon dioxide and water.", err: "energy-system", why: "That describes aerobic respiration in the mitochondria." },
       { t: "A net 2 ATP; creatine.", err: "energy-system", why: "Creatine comes from the creatine phosphate system, not glycolysis." },
       { t: "About 36 ATP; lactic acid.", err: "energy-system", why: "Lactic acid goes with low-oxygen glycolysis, which gives only a net 2 ATP." }]),
    // Day 3
    q("nmj-toxin-release", "nmj", "A toxin stops the axon terminal from releasing ACh. The nerve still fires normally. What happens to the muscle?",
      { t: "It can't be stimulated, so it stays relaxed (limp).", why: "With no ACh, the signal never crosses the cleft, so the fiber never gets an action potential." },
      [{ t: "It contracts and can't relax.", err: "mechanism-reversed", why: "That would come from too much ACh stimulation, not from no ACh at all." },
       { t: "It contracts normally, because the nerve's action potential still reaches the fiber.", err: "synapse-gap", why: "The nerve's action potential stops at the axon terminal. ACh is the only thing that carries the signal across the gap." },
       { t: "It contracts weakly, because Ca²⁺ from the neuron takes ACh's place.", err: "ion-confused", why: "Nothing from the neuron substitutes for ACh at the end-plate." }]),
    q("ec-ttubules", "ec", "After an action potential spreads along the sarcolemma, how does the signal reach deep inside the fiber?",
      { t: "It travels down the T-tubules, which run inward next to the sarcoplasmic reticulum.", why: "T-tubules carry the action potential to the triads, where the SR releases Ca²⁺." },
      [{ t: "Ca²⁺ flows in from outside the cell.", err: "ion-source", why: "The Ca²⁺ for contraction comes from the sarcoplasmic reticulum inside the fiber." },
       { t: "ACh diffuses through the sarcoplasm.", err: "wrong-location", why: "ACh acts only in the synaptic cleft, on the end-plate's receptors." },
       { t: "The myofibrils conduct it inward.", err: "structure-confused", why: "Myofibrils contract; the T-tubules (part of the sarcolemma) conduct the signal." }]),
    q("xb-power-stroke", "xb", "What triggers the power stroke?",
      { t: "Pi is released from the myosin head after it binds actin.", why: "Releasing Pi lets the cocked head pivot and pull the thin filament." },
      [{ t: "A new ATP binds the myosin head.", err: "atp-role", why: "ATP binding detaches the head after the stroke." },
       { t: "Ca²⁺ binds the myosin head.", err: "calcium-target", why: "Ca²⁺ binds troponin, not myosin." },
       { t: "ACh binds the myosin head.", err: "wrong-location", why: "ACh acts at the end-plate, never inside on myosin." }]),
    q("relax-pump-fail", "relax", "A fiber's SR Ca²⁺ pumps stop working, but everything else is normal. What happens after one stimulus?",
      { t: "Ca²⁺ stays in the sarcoplasm, the binding sites stay exposed, and the fiber has trouble relaxing.", why: "Pumping Ca²⁺ back is what lets tropomyosin re-cover the sites." },
      [{ t: "The fiber can't contract at all.", err: "mechanism-reversed", why: "Release still works, so it contracts. The problem is getting Ca²⁺ back out of the sarcoplasm." },
       { t: "ACh can't be broken down.", err: "ache-role", why: "That's AChE's job in the cleft, which is unaffected." },
       { t: "Myosin can't bind ATP.", err: "atp-role", why: "The Ca²⁺ pumps use ATP; they don't control whether myosin binds ATP." }]),
    q("energy-aerobic-where", "energy", "Where does aerobic respiration happen in a muscle fiber, and what does it need?",
      { t: "In the mitochondria; it needs oxygen.", why: "Aerobic respiration makes about 36 ATP per glucose in the mitochondria, using O₂." },
      [{ t: "In the sarcoplasmic reticulum; it needs Ca²⁺.", err: "wrong-location", why: "The SR stores Ca²⁺. ATP-making by respiration happens in mitochondria." },
       { t: "In the sarcoplasm; it needs no oxygen.", err: "energy-system", why: "That describes anaerobic glycolysis." },
       { t: "In the T-tubules; it needs ACh.", err: "wrong-location", why: "T-tubules carry the action potential; they don't make ATP." }]),
    // Day 4
    q("nmj-ache-blocked", "nmj", "A chemical blocks acetylcholinesterase (AChE) at the neuromuscular junction. What is the most direct effect?",
      { t: "ACh stays in the cleft longer and keeps binding receptors, so stimulation of the fiber is prolonged.", why: "AChE normally clears ACh. Blocking it leaves ACh acting on the receptors." },
      [{ t: "No ACh can be released, so the muscle can't contract.", err: "ache-role", why: "AChE doesn't control release. It breaks down ACh that's already released." },
       { t: "Ca²⁺ can't be pumped back into the SR.", err: "relaxation-mixup", why: "Ca²⁺ pumps are separate from AChE." },
       { t: "The ACh receptors close for good.", err: "ache-role", why: "More ACh around keeps receptors opening, not closed." }]),
    q("ec-sr-fail", "ec", "An action potential travels normally down a fiber's T-tubules, but its sarcoplasmic reticulum can't release Ca²⁺. What happens?",
      { t: "No contraction: tropomyosin keeps covering the binding sites, so no cross-bridges form.", why: "Ca²⁺ is the link between the electrical signal and the filaments." },
      [{ t: "It contracts anyway, because ACh was released.", err: "sequence-skip", why: "ACh starts the signal, but contraction still needs Ca²⁺ to expose actin." },
       { t: "It stays contracted and can't relax.", err: "mechanism-reversed", why: "With no Ca²⁺ released, it never contracts in the first place." },
       { t: "It contracts, but myosin can't use ATP.", err: "atp-role", why: "ATP use isn't the problem; the binding sites are never uncovered." }]),
    q("xb-rigor", "xb", "After death, ATP runs out. Why do muscles become stiff (rigor mortis)?",
      { t: "Myosin heads stay bound to actin, because no ATP is available to release them.", why: "ATP binding is what detaches the head. With none, cross-bridges stay locked." },
      [{ t: "Ca²⁺ is pumped back into the SR too quickly.", err: "relaxation-mixup", why: "Pumping Ca²⁺ back would relax the muscle, and it needs ATP anyway." },
       { t: "The axon terminal keeps releasing ACh.", err: "mechanism-reversed", why: "Rigor is a cross-bridge problem inside the fiber, not continued stimulation." },
       { t: "Tropomyosin locks onto myosin.", err: "tropomyosin-role", why: "Tropomyosin covers binding sites on actin; it doesn't lock myosin." }]),
    q("relax-recover", "relax", "During relaxation, what covers the myosin-binding sites on actin again?",
      { t: "Tropomyosin, once Ca²⁺ has left troponin", why: "Without Ca²⁺ on troponin, tropomyosin slides back over the sites." },
      [{ t: "ACh", err: "wrong-location", why: "ACh acts in the synaptic cleft, not on the thin filaments." },
       { t: "The myosin heads", err: "tropomyosin-role", why: "Myosin heads bind the sites during contraction. Tropomyosin is what covers them." },
       { t: "Creatine phosphate", err: "wrong-location", why: "Creatine phosphate is an energy store, not a blocking protein." }]),
    q("energy-one-minute", "energy", "A runner holds a hard, near-maximum pace for about a minute. After the first 15 seconds, which system supplies most of her ATP?",
      { t: "Anaerobic glycolysis", why: "Once creatine phosphate runs low, glycolysis supplies fast ATP for about a minute." },
      [{ t: "Creatine phosphate", err: "energy-system", why: "It covers only about the first 15 seconds." },
       { t: "Aerobic respiration", err: "energy-system", why: "Aerobic respiration dominates at rest and in moderate, long activity, not a near-maximum minute." },
       { t: "Stored ATP alone", err: "energy-system", why: "Stored ATP lasts only a few seconds." }]),
    // Day 5
    q("nmj-ach-binds", "nmj", "Where does ACh bind to stimulate a skeletal muscle fiber?",
      { t: "On ACh receptors in the motor end-plate of the sarcolemma", why: "The motor end-plate is the part of the sarcolemma facing the axon terminal." },
      [{ t: "On receptors on the sarcoplasmic reticulum", err: "wrong-location", why: "The SR responds to the action potential at the triads, not to ACh." },
       { t: "On troponin", err: "calcium-target", why: "Troponin is bound by Ca²⁺, inside the fiber." },
       { t: "On the myosin heads", err: "wrong-location", why: "ACh never enters the fiber; it acts at the end-plate." }]),
    q("ec-ca-store", "ec", "Where is the Ca²⁺ that triggers contraction stored in a resting skeletal muscle fiber?",
      { t: "In the sarcoplasmic reticulum (its terminal cisternae)", why: "The SR stores Ca²⁺ and releases it when the action potential reaches the triads." },
      [{ t: "In the T-tubules", err: "ttubule-sr-confused", why: "T-tubules carry the action potential. The SR beside them stores the Ca²⁺." },
       { t: "In the axon terminal", err: "wrong-location", why: "The axon terminal stores ACh, in synaptic vesicles." },
       { t: "In the mitochondria", err: "wrong-location", why: "Mitochondria make ATP. The SR is the Ca²⁺ store for contraction." }]),
    q("xb-sarcomere", "xb", "When a sarcomere shortens, which statement is true?",
      { t: "The Z discs move closer together, the I band narrows, and the A band stays the same width.", why: "The filaments slide past each other; their lengths don't change, so the A band (thick filament length) stays the same." },
      [{ t: "The A band shortens because the thick filaments get shorter.", err: "sarcomere-bands", why: "Thick filaments don't shorten. The A band keeps its width." },
       { t: "The thin filaments shorten.", err: "sarcomere-bands", why: "Thin filaments slide toward the M line; they don't shorten." },
       { t: "The I band gets wider.", err: "sarcomere-bands", why: "The I band narrows as thin filaments slide inward." }]),
    q("relax-first", "relax", "Of these relaxation events, which happens FIRST?",
      { t: "ACh release stops, and AChE clears the ACh from the cleft.", why: "Relaxation starts at the neuromuscular junction, when stimulation stops." },
      [{ t: "Tropomyosin covers the binding sites again.", err: "sequence-order", why: "That happens last, after Ca²⁺ has been pumped back and left troponin." },
       { t: "Ca²⁺ is pumped back into the SR.", err: "sequence-order", why: "That comes after stimulation stops and the SR's Ca²⁺ channels close." },
       { t: "The fiber lengthens.", err: "sequence-order", why: "The fiber relaxes only after cross-bridges stop forming." }]),
    q("energy-rest", "energy", "At rest or during moderate activity, where does most of a muscle's ATP (about 95%) come from?",
      { t: "Aerobic respiration", why: "With enough oxygen, mitochondria supply most of the ATP." },
      [{ t: "Creatine phosphate", err: "energy-system", why: "Creatine phosphate is for the first seconds of intense effort." },
       { t: "Anaerobic glycolysis", err: "energy-system", why: "Glycolysis without oxygen is for short, intense bursts." },
       { t: "Stored ATP", err: "energy-system", why: "Stored ATP lasts only a few seconds." }])
  ];
  var MIXUPS = {
    "sequence-order": "the order of the steps", "ion-confused": "which ion does what", "calcium-target": "what Ca²⁺ binds",
    "atp-role": "which ATP job is which", "relaxation-mixup": "what happens during relaxation", "mechanism-reversed": "cause and effect reversed",
    "ache-role": "what AChE does", "wrong-location": "where it happens", "energy-system": "which energy system fits",
    "tropomyosin-role": "troponin vs. tropomyosin", "synapse-gap": "how the signal crosses the gap", "ion-source": "where the Ca²⁺ comes from",
    "structure-confused": "which structure does the job", "sequence-skip": "a skipped step", "ttubule-sr-confused": "T-tubules vs. sarcoplasmic reticulum",
    "sarcomere-bands": "what changes in the sarcomere"
  };
  // Which learn stage to send her back to for each kind of mix-up (otherwise the first stage of the question's topic).
  var MIXUP_STAGE = { "calcium-target": "calcium", "tropomyosin-role": "calcium", "ion-source": "calcium", "sequence-skip": "calcium",
    "ttubule-sr-confused": "spread", "structure-confused": "spread", "atp-role": "atp", "sarcomere-bands": "sliding", "energy-system": "energy",
    "ache-role": "relax", "relaxation-mixup": "relax", "synapse-gap": "nmj", "ion-confused": "nmj" };
  // Say it: the hard terms on each stage, shown with their Merriam-Webster pronunciation (pronunciation.js). A term with an
  // unverified word shows nothing (troponin and synaptic have no full dictionary pronunciation).
  var SAY = { nmj: ["Acetylcholine", "Synaptic cleft"], spread: ["Sarcolemma", "Terminal cisternae"], calcium: ["Sarcoplasmic reticulum", "Troponin", "Tropomyosin"],
    cycle: ["Myosin", "Actin"], sliding: ["Sarcomere"], relax: ["Acetylcholinesterase"],
    energy: ["Creatine phosphate", "Anaerobic glycolysis", "Aerobic respiration", "Mitochondria"] };
  global.LESSON = global.Ch10Lesson = { NAME: "Chapter 10", PREFIX: "ap-ch10", SOURCE: "lesson-ap-ch10", OBJ: OBJ, STATUS: STATUS, STAGES: STAGES, ORDERS: ORDERS, EXPLAIN: EXPLAIN, ITEMS: ITEMS, MIXUPS: MIXUPS, MIXUP_STAGE: MIXUP_STAGE, PER_DAY: 5, SAY: SAY };
})(typeof window !== "undefined" ? window : globalThis);
