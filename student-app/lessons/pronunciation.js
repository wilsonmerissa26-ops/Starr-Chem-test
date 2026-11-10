/* Verified pronunciations for lesson terms (shared by every lesson; no network use, so it works offline once cached).
 *
 * Source: Merriam-Webster (merriam-webster.com), Medical Dictionary where it has an entry, otherwise the general
 * dictionary. For a single word whose medical entry gives only a shortened form (starting with a hyphen), the general
 * dictionary's full pronunciation is used when it has one (Chapter 8 and 10 terms, read 2026-11-10). Each source keeps MW's own notation exactly as the entry shows it, its URL and the date it was read,
 * so any line can be audited. Each notation was read from the live entry twice, with two differently worded requests,
 * and both reads agreed character for character. Rules:
 *   - Only a word whose pronunciation MW gives in full is shown. No pronunciation is ever made up or pieced together.
 *     (MW sometimes gives a shortened form like "-ˌspī-ˈnāt-əs" that depends on another entry; those are not used.)
 *   - The first pronunciation MW lists is used. Sounds MW marks as optional, in parentheses, are left out of the simple
 *     spelling; the original notation stays in the source line.
 *   - A word inside a multi-word entry (for example "-ab-ˈdäm-ə-nəs" in "rectus abdominis") comes from that entry,
 *     and a term's own entry beats any other.
 *   - The simple spelling is computed from MW's notation by respell() below (one fixed key, tested). Only the main
 *     stressed syllable of each word is in capitals.
 *   - A term shows a pronunciation only if every word in it is verified or an everyday English word.
 * No dictionary audio is copied. "Hear it" opens the Merriam-Webster entry, which has its own audio, when online.
 */
(function (global) {
  "use strict";
  var CHECKED = "2026-11-06";
  var MED = "Merriam-Webster Medical Dictionary", GEN = "Merriam-Webster (general dictionary)";
  var MW = "https://www.merriam-webster.com/";
  // Each source: the entry as MW names it, which dictionary, the page read, and MW's notation exactly as shown there.
  var SOURCES = {
    masseter: { entry: "masseter", dict: MED, url: MW + "dictionary/masseter", notation: "mə-ˈsēt-ər, ma-" },
    buccinator: { entry: "buccinator", dict: MED, url: MW + "dictionary/buccinator%20muscle", notation: "ˈbək-sə-ˌnāt-ər" },
    temporalis: { entry: "temporalis", dict: MED, url: MW + "dictionary/temporalis%20muscle", notation: "ˌtem-pə-ˈrā-ˌləs" },
    sternocleidomastoid: { entry: "sternocleidomastoid", dict: MED, url: MW + "dictionary/sternocleidomastoid%20muscle", notation: "ˌstər-nō-ˌklīd-ə-ˈmas-ˌtȯid" },
    occipitofrontalis: { entry: "occipitofrontalis", dict: MED, url: MW + "dictionary/occipitofrontalis", notation: "äk-ˌsip-ət-ō-frən-ˈtā-ləs" },
    oculi: { entry: "oculus, plural oculi", dict: GEN, url: MW + "dictionary/oculi", notation: "ˈä-kyə-ˌlī, -ˌlē" },
    orbicularisOris: { entry: "orbicularis oris", dict: MED, url: MW + "medical/orbicularis%20oris", notation: "-ˈōr-əs" },
    rectus: { entry: "rectus", dict: MED, url: MW + "medical/rectus", notation: "ˈrek-təs" },
    rectusAbdominis: { entry: "rectus abdominis", dict: MED, url: MW + "medical/rectus%20abdominis", notation: "-ab-ˈdäm-ə-nəs" },
    oblique: { entry: "oblique", dict: MED, url: MW + "medical/oblique", notation: "ō-ˈblēk, ə-, -ˈblīk" },
    transversusAbdominis: { entry: "transversus abdominis", dict: MED, url: MW + "dictionary/transversus%20abdominis", notation: "tran(t)s-ˈvər-səs-əb-ˈdäm-ə-nəs" },
    diaphragm: { entry: "diaphragm", dict: MED, url: MW + "dictionary/diaphragm", notation: "ˈdī-ə-ˌfram" },
    intercostal: { entry: "intercostal", dict: MED, url: MW + "medical/intercostal", notation: "ˌint-ər-ˈkäs-tᵊl" },
    pronatorQuadratus: { entry: "pronator quadratus", dict: MED, url: MW + "medical/pronator%20quadratus", notation: "-kwä-ˈdrāt-əs" },
    quadratusLumborum: { entry: "quadratus lumborum", dict: MED, url: MW + "dictionary/quadratus%20lumborum", notation: "-ləm-ˈbȯr-əm" },
    trapezius: { entry: "trapezius", dict: MED, url: MW + "dictionary/trapezius", notation: "trə-ˈpē-zē-əs, tra-" },
    deltoid: { entry: "deltoid", dict: MED, url: MW + "dictionary/deltoid%20muscle", notation: "ˈdel-ˌtȯid" },
    pectoralis: { entry: "pectoralis", dict: MED, url: MW + "medical/pectoralis", notation: "ˌpek-tə-ˈrā-ləs" },
    serratus: { entry: "serratus", dict: MED, url: MW + "medical/serratus", notation: "se-ˈrāt-əs" },
    latissimusDorsi: { entry: "latissimus dorsi", dict: MED, url: MW + "medical/latissimus%20dorsi", notation: "lə-ˈtis-ə-məs-ˈdȯr-ˌsī" },
    infraspinatus: { entry: "infraspinatus", dict: MED, url: MW + "medical/infraspinati", notation: "ˌin-frə-spī-ˈnāt-əs" },
    teresMajor: { entry: "teres major", dict: MED, url: MW + "medical/teres%20major", notation: "ˈter-ēz-, ˈtir-" },
    subscapularis: { entry: "subscapularis", dict: MED, url: MW + "medical/subscapularis", notation: "ˌsəb-ˌskap-yə-ˈlar-əs" },
    biceps: { entry: "biceps", dict: MED, url: MW + "dictionary/biceps%20brachii", notation: "ˈbī-ˌseps" },
    bicepsBrachii: { entry: "biceps brachii", dict: MED, url: MW + "dictionary/biceps%20brachii", notation: "-ˈbrā-kē-ˌē, -ˌī" },
    brachialis: { entry: "brachialis", dict: MED, url: MW + "medical/brachialis", notation: "ˌbrā-kē-ˈal-əs, -ˈāl-, -ˈäl-" },
    brachioradialis: { entry: "brachioradialis", dict: MED, url: MW + "medical/brachioradialis", notation: "ˌbrā-kē-ō-ˌrād-ē-ˈal-əs, -ˈāl-, -ˈäl-" },
    triceps: { entry: "triceps", dict: MED, url: MW + "medical/triceps", notation: "ˈtrī-ˌseps" },
    tricepsBrachii: { entry: "triceps brachii", dict: MED, url: MW + "dictionary/triceps%20brachii", notation: "-ˈbrā-kē-ˌī" },
    pronator: { entry: "pronator", dict: MED, url: MW + "medical/pronator", notation: "ˈprō-ˌnāt-ər" },
    pronatorTeres: { entry: "pronator teres", dict: MED, url: MW + "dictionary/pronator%20teres", notation: "-ˈtir-ˌēz" },
    supinator: { entry: "supinator", dict: MED, url: MW + "medical/supinator", notation: "ˈsü-pə-ˌnāt-ər" },
    flexor: { entry: "flexor", dict: MED, url: MW + "medical/flexor", notation: "ˈflek-sər, -ˌsȯ(ə)r" },
    flexorCarpiRadialis: { entry: "flexor carpi radialis", dict: MED, url: MW + "dictionary/flexor%20carpi%20radialis", notation: "-ˈkär-ˌpī-ˌrā-dē-ˈā-ləs, -ˈkär-ˌpē-" },
    flexorCarpiUlnaris: { entry: "flexor carpi ulnaris", dict: MED, url: MW + "dictionary/flexor%20carpi%20ulnaris", notation: "-ˌəl-ˈnar-əs" },
    extensorCarpiUlnaris: { entry: "extensor carpi ulnaris", dict: MED, url: MW + "medical/extensor%20carpi%20ulnaris", notation: "-ˌəl-ˈnar-əs" },
    palmaris: { entry: "palmaris", dict: MED, url: MW + "medical/palmaris", notation: "pal-ˈmar-əs" },
    palmarisLongus: { entry: "palmaris longus", dict: MED, url: MW + "dictionary/palmaris%20longus", notation: "-ˈlȯŋ-gəs" },
    extensorCarpiRadialisLongus: { entry: "extensor carpi radialis longus", dict: MED, url: MW + "medical/extensor%20carpi%20radialis%20longus", notation: "-ˈlȯŋ-gəs" },
    extensorDigitorumBrevis: { entry: "extensor digitorum brevis", dict: MED, url: MW + "medical/extensor%20digitorum%20brevis", notation: "-ˌdij-ə-ˈtōr-əm-ˈbrev-əs" },
    flexorDigitorumSuperficialis: { entry: "flexor digitorum superficialis", dict: MED, url: MW + "dictionary/flexor%20digitorum%20superficialis", notation: "-ˌsü-pər-ˌfish-ē-ˈā-ləs" },
    extensor: { entry: "extensor", dict: MED, url: MW + "dictionary/extensor%20muscle", notation: "ik-ˈsten(t)-sər, -sȯ(ə)r" },
    // Chapter 10 and Chapter 8 terms, read 2026-11-10, twice each with differently worded requests; the first pronunciation
    // agreed in both reads for every entry. Alternatives MW prints in separate brackets are joined here with a comma.
    acetylcholine: { entry: "acetylcholine", dict: MED, url: MW + "dictionary/acetylcholine", notation: "ə-ˌset-ᵊl-ˈkō-ˌlēn, -ˌsēt-; ˌas-ə-ˌtēl-", checked: "2026-11-10" },
    acetylcholinesterase: { entry: "acetylcholinesterase", dict: GEN, url: MW + "dictionary/acetylcholinesterase", notation: "ə-ˌse-tᵊl-ˌkō-lə-ˈne-stə-ˌrās, -ˌrāz", checked: "2026-11-10", why: "The medical entry gives only a shortened form, -ˌkō-lə-ˈnes-tə-ˌrās." },
    sarcolemma: { entry: "sarcolemma", dict: MED, url: MW + "dictionary/sarcolemma", notation: "ˌsär-kə-ˈlem-ə", checked: "2026-11-10" },
    cisternae: { entry: "cisterna, plural cisternae", dict: GEN, url: MW + "dictionary/cisternae", notation: "si-ˈstər-ˌnē", checked: "2026-11-10", why: "The medical entry gives only a shortened plural, -ˌnē." },
    sarcoplasmic: { entry: "sarcoplasm, adjective sarcoplasmic", dict: GEN, url: MW + "dictionary/sarcoplasmic", notation: "ˌsär-kə-ˈplaz-mik", checked: "2026-11-10", why: "The medical entry gives a pronunciation only for the noun, sarcoplasm." },
    reticulum: { entry: "reticulum", dict: MED, url: MW + "dictionary/reticulum", notation: "ri-ˈtik-yə-ləm", checked: "2026-11-10" },
    tropomyosin: { entry: "tropomyosin", dict: MED, url: MW + "dictionary/tropomyosin", notation: "ˌträp-ə-ˈmī-ə-sən, ˌtrōp-", checked: "2026-11-10" },
    myosin: { entry: "myosin", dict: MED, url: MW + "dictionary/myosin", notation: "ˈmī-ə-sən", checked: "2026-11-10" },
    actin: { entry: "actin", dict: MED, url: MW + "dictionary/actin", notation: "ˈak-tən", checked: "2026-11-10" },
    sarcomere: { entry: "sarcomere", dict: MED, url: MW + "dictionary/sarcomere", notation: "ˈsär-kə-ˌmi(ə)r", checked: "2026-11-10" },
    creatine: { entry: "creatine", dict: MED, url: MW + "dictionary/creatine", notation: "ˈkrē-ə-ˌtēn, -ət-ᵊn", checked: "2026-11-10" },
    phosphate: { entry: "phosphate", dict: MED, url: MW + "dictionary/phosphate", notation: "ˈfäs-ˌfāt", checked: "2026-11-10" },
    glycolysis: { entry: "glycolysis", dict: MED, url: MW + "dictionary/glycolysis", notation: "glī-ˈkäl-ə-səs", checked: "2026-11-10" },
    anaerobic: { entry: "anaerobic", dict: MED, url: MW + "dictionary/anaerobic", notation: "ˌan-ə-ˈrō-bik; ˌan-ˌa(-ə)r-ˈō-, -ˌe(-ə)r-", checked: "2026-11-10" },
    aerobic: { entry: "aerobic", dict: MED, url: MW + "dictionary/aerobic", notation: "ˌa(-ə)r-ˈō-bik, ˌe(-ə)r-", checked: "2026-11-10" },
    mitochondria: { entry: "mitochondrion, plural mitochondria", dict: GEN, url: MW + "dictionary/mitochondrion", notation: "ˌmī-tə-ˈkän-drē-ə", checked: "2026-11-10", why: "The medical entry gives only a shortened plural, -drē-ə." },
    synovial: { entry: "synovial", dict: GEN, url: MW + "dictionary/synovial", notation: "sə-ˈnō-vē-əl", checked: "2026-11-10", why: "The medical entry gives only a shortened form, -vē-əl." },
    synarthrosis: { entry: "synarthrosis", dict: GEN, url: MW + "dictionary/synarthrosis", notation: "ˌsin-är-ˈthrō-səs", checked: "2026-11-10", why: "The medical entry gives only a shortened form, -ˈthrō-səs." },
    diarthrosis: { entry: "diarthrosis", dict: MED, url: MW + "dictionary/diarthrosis", notation: "ˌdī-är-ˈthrō-səs", checked: "2026-11-10" },
    gomphosis: { entry: "gomphosis", dict: MED, url: MW + "medical/gomphosis", notation: "gäm-ˈfō-səs", checked: "2026-11-10" },
    syndesmosis: { entry: "syndesmosis", dict: MED, url: MW + "dictionary/syndesmosis", notation: "ˌsin-ˌdez-ˈmō-səs, -ˌdes-", checked: "2026-11-10" },
    synchondrosis: { entry: "synchondrosis", dict: MED, url: MW + "medical/synchondrosis", notation: "ˌsin-ˌkän-ˈdrō-səs", checked: "2026-11-10" },
    symphysis: { entry: "symphysis", dict: MED, url: MW + "dictionary/symphysis", notation: "ˈsim(p)-fə-səs", checked: "2026-11-10" },
    hyaline: { entry: "hyaline (adjective)", dict: MED, url: MW + "dictionary/hyaline", notation: "ˈhī-ə-lən, -ˌlīn", checked: "2026-11-10" },
    epiphyseal: { entry: "epiphyseal", dict: MED, url: MW + "dictionary/epiphyseal", notation: "i-ˌpif-ə-ˈsē-əl", checked: "2026-11-10" },
    menisci: { entry: "meniscus, plural menisci", dict: GEN, url: MW + "dictionary/menisci", notation: "mə-ˈni-ˌskī, -ˌskē, -ˌsī", checked: "2026-11-10", why: "The medical entry gives only a shortened plural, -ˈnis-ˌ(k)ī." },
    bursae: { entry: "bursa, plural bursae", dict: GEN, url: MW + "dictionary/bursa", notation: "ˈbər-ˌsē, -ˌsī", checked: "2026-11-10", why: "The medical entry gives only a shortened plural, -ˌsē." },
    condyloid: { entry: "condyle, adjective condyloid", dict: GEN, url: MW + "dictionary/condyloid", notation: "ˈkän-də-ˌlȯid", checked: "2026-11-10", why: "The medical entry gives a pronunciation only for the noun, condyle." },
    circumduction: { entry: "circumduction", dict: MED, url: MW + "medical/circumduction", notation: "ˌsər-kəm-ˈdək-shən", checked: "2026-11-10" },
    abduction: { entry: "abduction", dict: GEN, url: MW + "dictionary/abduction", notation: "ab-ˈdək-shən, əb-", checked: "2026-11-10", why: "The page has no medical entry for abduction." },
    adduction: { entry: "adduction", dict: MED, url: MW + "dictionary/adduction", notation: "ə-ˈdək-shən, a-", checked: "2026-11-10" },
    pronation: { entry: "pronation", dict: MED, url: MW + "dictionary/pronation", notation: "prō-ˈnā-shən", checked: "2026-11-10" },
    supination: { entry: "supination", dict: MED, url: MW + "dictionary/supination", notation: "ˌsü-pə-ˈnā-shən", checked: "2026-11-10" },
    dorsiflexion: { entry: "dorsiflexion", dict: MED, url: MW + "medical/dorsiflexion", notation: "ˌdȯr-sə-ˈflek-shən", checked: "2026-11-10" },
    plantar: { entry: "plantar", dict: MED, url: MW + "dictionary/plantar", notation: "ˈplant-ər, ˈplan-ˌtär", checked: "2026-11-10" },
    flexion: { entry: "flexion", dict: MED, url: MW + "dictionary/flexion", notation: "ˈflek-shən", checked: "2026-11-10" },
    eversion: { entry: "eversion", dict: MED, url: MW + "dictionary/eversion", notation: "i-ˈvər-zhən, -shən", checked: "2026-11-10" },
    protraction: { entry: "protraction", dict: GEN, url: MW + "dictionary/protraction", notation: "prō-ˈtrak-shən, prə-", checked: "2026-11-10", why: "The medical entry gives only a shortened form, -ˈtrak-shən." },
    glenoid: { entry: "glenoid", dict: MED, url: MW + "medical/glenoid", notation: "ˈglen-ˌȯid, ˈglēn-", checked: "2026-11-10" },
    labrum: { entry: "labrum", dict: MED, url: MW + "dictionary/labrum", notation: "ˈlā-brəm", checked: "2026-11-10" },
    radioulnar: { entry: "radioulnar", dict: MED, url: MW + "medical/radioulnar", notation: "ˌrād-ē-ō-ˈəl-nər", checked: "2026-11-10" }
  };
  // word: [the part of the source notation for this word (first listed pronunciation), source key]
  var WORDS = {
    masseter: ["mə-ˈsēt-ər", "masseter"], buccinator: ["ˈbək-sə-ˌnāt-ər", "buccinator"], temporalis: ["ˌtem-pə-ˈrā-ˌləs", "temporalis"],
    sternocleidomastoid: ["ˌstər-nō-ˌklīd-ə-ˈmas-ˌtȯid", "sternocleidomastoid"], occipitofrontalis: ["äk-ˌsip-ət-ō-frən-ˈtā-ləs", "occipitofrontalis"],
    oculi: ["ˈä-kyə-ˌlī", "oculi"], oris: ["ˈōr-əs", "orbicularisOris"],
    rectus: ["ˈrek-təs", "rectus"], abdominis: ["ab-ˈdäm-ə-nəs", "rectusAbdominis"], oblique: ["ō-ˈblēk", "oblique"],
    transversus: ["tran(t)s-ˈvər-səs", "transversusAbdominis"], diaphragm: ["ˈdī-ə-ˌfram", "diaphragm"], intercostal: ["ˌint-ər-ˈkäs-tᵊl", "intercostal"],
    quadratus: ["kwä-ˈdrāt-əs", "pronatorQuadratus"], lumborum: ["ləm-ˈbȯr-əm", "quadratusLumborum"],
    trapezius: ["trə-ˈpē-zē-əs", "trapezius"], deltoid: ["ˈdel-ˌtȯid", "deltoid"], pectoralis: ["ˌpek-tə-ˈrā-ləs", "pectoralis"],
    serratus: ["se-ˈrāt-əs", "serratus"], latissimus: ["lə-ˈtis-ə-məs", "latissimusDorsi"], dorsi: ["ˈdȯr-ˌsī", "latissimusDorsi"],
    infraspinatus: ["ˌin-frə-spī-ˈnāt-əs", "infraspinatus"], teres: ["ˈter-ēz", "teresMajor"], subscapularis: ["ˌsəb-ˌskap-yə-ˈlar-əs", "subscapularis"],
    biceps: ["ˈbī-ˌseps", "biceps"], brachii: ["ˈbrā-kē-ˌē", "bicepsBrachii"], brachialis: ["ˌbrā-kē-ˈal-əs", "brachialis"],
    brachioradialis: ["ˌbrā-kē-ō-ˌrād-ē-ˈal-əs", "brachioradialis"], triceps: ["ˈtrī-ˌseps", "triceps"],
    pronator: ["ˈprō-ˌnāt-ər", "pronator"], supinator: ["ˈsü-pə-ˌnāt-ər", "supinator"], flexor: ["ˈflek-sər", "flexor"],
    carpi: ["ˈkär-ˌpī", "flexorCarpiRadialis"], radialis: ["ˌrā-dē-ˈā-ləs", "flexorCarpiRadialis"], ulnaris: ["ˌəl-ˈnar-əs", "flexorCarpiUlnaris"],
    palmaris: ["pal-ˈmar-əs", "palmaris"], longus: ["ˈlȯŋ-gəs", "palmarisLongus"], digitorum: ["ˌdij-ə-ˈtōr-əm", "extensorDigitorumBrevis"],
    superficialis: ["ˌsü-pər-ˌfish-ē-ˈā-ləs", "flexorDigitorumSuperficialis"], extensor: ["ik-ˈsten(t)-sər", "extensor"]
  };
  // Chapter 10 and Chapter 8 words: each is its entry's whole first pronunciation.
  ["acetylcholine", "acetylcholinesterase", "sarcolemma", "cisternae", "sarcoplasmic", "reticulum", "tropomyosin", "myosin", "actin", "sarcomere",
    "creatine", "phosphate", "glycolysis", "anaerobic", "aerobic", "mitochondria", "synovial", "synarthrosis", "diarthrosis", "gomphosis", "syndesmosis",
    "synchondrosis", "symphysis", "hyaline", "epiphyseal", "menisci", "bursae", "condyloid", "circumduction", "abduction", "adduction", "pronation",
    "supination", "dorsiflexion", "plantar", "flexion", "eversion", "protraction", "glenoid", "labrum", "radioulnar"].forEach(function (w) {
    WORDS[w] = [SOURCES[w].notation.split(/[,;]/)[0].trim(), w];
  });
  // A term's own entry beats the default source for a word.
  var IN_TERM = {
    "transversus abdominis": { abdominis: ["əb-ˈdäm-ə-nəs", "transversusAbdominis"] },
    "triceps brachii": { brachii: ["ˈbrā-kē-ˌī", "tricepsBrachii"] },
    "pronator teres": { teres: ["ˈtir-ˌēz", "pronatorTeres"] },
    "extensor carpi radialis longus": { longus: ["ˈlȯŋ-gəs", "extensorCarpiRadialisLongus"] },
    "extensor carpi ulnaris": { ulnaris: ["ˌəl-ˈnar-əs", "extensorCarpiUlnaris"] }
  };
  // Everyday English words: shown as written, never looked up.
  var EVERYDAY = ["external", "internal", "major", "minor", "anterior", "frontal", "belly", "terminal", "cleft", "respiration"];
  // MW gives the singular only; the term shows it with a note rather than adding a sound.
  var SINGULAR = { intercostals: "intercostal" };
  // Checked and not shown, with the reason (also listed in docs/PRONUNCIATION_REPORT.md).
  // Held back while a question about them is settled against the dictionary (a whole name in lowercase, or one word).
  // Anything here shows NO pronunciation in the lessons. A listener's mark alone never adds or removes an entry: a
  // reported difference is first compared with MW's notation and the other pronunciations it accepts.
  var UNDER_REVIEW = {};
  var NOT_VERIFIED = {
    orbicularis: "Merriam-Webster has no entry for orbicularis by itself. Its orbicularis oris entry gives a pronunciation only for oris, and its orbicularis oculi entry gives none.",
    supraspinatus: "Merriam-Webster gives only a shortened form, -ˌspī-ˈnāt-əs, that depends on a neighboring entry, so there is no full pronunciation to show.",
    troponin: "No Merriam-Webster entry for troponin turned up when searched on Nov 10.",
    synaptic: "Merriam-Webster's synapse and synaptic vesicle entries print no pronunciation for synaptic.",
    cartilaginous: "The medical entry gives only a shortened form, -nəs. The general entry, ˌkär-tə-ˈla-jə-nəs, ends a syllable with the a in cat (la), which this spelling key cannot write without it reading as ah.",
    acetabulum: "The medical entry gives only a shortened form, -ˈtab-yə-ləm. The general entry, ˌa-sə-ˈta-byə-ləm, ends syllables with the a in cat (a, ta), which this spelling key cannot write without them reading as ah.",
    amphiarthrosis: "Merriam-Webster gives only a shortened form, -ˈthrō-səs, and has no general dictionary entry for it.",
    fibrocartilage: "No Merriam-Webster entry for fibrocartilage turned up when searched on Nov 10.",
    humeroulnar: "No Merriam-Webster entry for humeroulnar turned up when searched on Nov 10."
  };

  // ---- MW notation -> simple spelling (one fixed key; see KEY) ----
  var VOWEL_END = { e: "eh", i: "ih" };
  function respellSyllable(s) {
    var primary = s.indexOf("ˈ") >= 0, stressed = primary || s.indexOf("ˌ") >= 0;
    s = s.replace(/[ˈˌ]/g, "");
    var out = "", i = 0;
    function at(t) { return s.substr(i, t.length) === t; }
    while (i < s.length) {
      if (at("ər")) { out += stressed ? "ur" : "er"; i += 2; }
      else if (at("au̇")) { out += "ow"; i += 3; }
      else if (at("ȯi")) { out += "oy"; i += 2; }
      else if (at("ȯr") || at("ōr")) { out += "or"; i += 2; }
      else if (at("är")) { out += "ar"; i += 2; }
      else if (at("ar")) { out += "arr"; i += 2; }
      else if (at("er")) { out += "err"; i += 2; }
      else if (at("ir")) { out += "eer"; i += 2; }
      else if (at("yü")) { out += "yoo"; i += 2; }
      else if (at("u̇")) { out += "uu"; i += 2; }
      else if (at("t͟h")) { out += "th"; i += 3; }
      else {
        var c = s[i], map = { "ā": "ay", "ä": "ah", "ē": "ee", "ō": "oh", "ȯ": "aw", "ü": "oo", "ə": "uh", "ᵊ": "uh", "ŋ": "ng" };
        // ī (the i in kite): "eye" to start a syllable, "ye" to end one (pye, lye, dye), and i + consonant + e inside one
        // (klide). A bare final "y" is avoided because readers often say it "ee", which is a different MW pronunciation.
        if (c === "ī") {
          if (out === "") out += "eye";
          else if (i === s.length - 1) out += "ye";
          else { var rest = s.slice(i + 1); if (/^[bcdfghjklmnpqrstvwxz]+$/.test(rest)) { out += "i" + rest + "e"; i = s.length; continue; } out += "y"; }
        }
        else if (map[c]) out += map[c];
        else if (VOWEL_END[c] && i === s.length - 1) out += VOWEL_END[c];
        else out += c;
        i++;
      }
    }
    return primary ? out.toUpperCase() : out;
  }
  function respell(mw) {
    var first = mw.split(/[,;]/)[0].trim().replace(/\([^)]*\)/g, "").replace(/^-+|-+$/g, "");
    return first.split("-").filter(Boolean).map(respellSyllable).join("-");
  }
  var KEY = "CAPITALS = the syllable to stress · uh = a in about · ay = say · ee = see · ah = father · oh = go · aw = law · oo = food · " +
    "eye, ye or i-consonant-e = the i in kite (KAR-pye, klide) · er = butter · ur = fur · arr = carry · err = merry · eer = deer · zh = the s in vision";

  // ---- terms ----
  function termWords(name) { return name.replace(/\([^)]*\)/g, " ").trim().toLowerCase().split(/\s+/); }
  function lookup(termLower, w) {
    var own = IN_TERM[termLower] && IN_TERM[termLower][w];
    var single = SINGULAR[w], hit = own || WORDS[single || w];
    if (!hit) return null;
    return { word: w, singular: single || null, say: respell(hit[0]), mw: hit[0], source: hit[1] };
  }
  // { ok, text, parts, sources, missing }; ok is false when any word is unverified or the name has only everyday words.
  function forTerm(name) {
    var words = termWords(name), t = words.join(" "), parts = [], missing = [];
    words.forEach(function (w) {
      if (EVERYDAY.indexOf(w) >= 0) { parts.push({ word: w, plain: true }); return; }
      var p = lookup(t, w); if (p) parts.push(p); else missing.push(w);
    });
    var looked = parts.filter(function (p) { return !p.plain; });
    var held = [t].concat(words).filter(function (w) { return Object.prototype.hasOwnProperty.call(UNDER_REVIEW, w); });
    if (missing.length || held.length || !looked.length) return { ok: false, missing: missing, held: held, parts: parts };
    var srcs = []; looked.forEach(function (p) { if (srcs.indexOf(p.source) < 0) srcs.push(p.source); });
    return { ok: true, missing: [], parts: parts, text: parts.map(function (p) { return p.plain ? p.word : p.say; }).join(" "),
      singular: looked.filter(function (p) { return p.singular; }).map(function (p) { return p.singular; }),
      sources: srcs.map(function (k) { var s = SOURCES[k]; return { key: k, entry: s.entry, dict: s.dict, url: s.url, notation: s.notation, checked: s.checked || CHECKED }; }) };
  }
  // One link per dictionary page a term uses, labeled with the words of the term that page covers (so "quadratus" is not
  // labeled with the other muscle's entry it comes from). Used for every "Hear it" line.
  function pages(r) {
    var out = [], at = {};
    (r.parts || []).forEach(function (p) {
      if (p.plain) return;
      var url = SOURCES[p.source].url;
      if (!Object.prototype.hasOwnProperty.call(at, url)) { at[url] = out.length; out.push({ url: url, words: [] }); }
      out[at[url]].words.push(p.singular || p.word);
    });
    return out;
  }
  global.Pronunciations = { SOURCES: SOURCES, WORDS: WORDS, IN_TERM: IN_TERM, EVERYDAY: EVERYDAY, SINGULAR: SINGULAR, NOT_VERIFIED: NOT_VERIFIED, UNDER_REVIEW: UNDER_REVIEW,
    CHECKED: CHECKED, KEY: KEY, respell: respell, forTerm: forTerm, pages: pages };
})(typeof window !== "undefined" ? window : globalThis);
